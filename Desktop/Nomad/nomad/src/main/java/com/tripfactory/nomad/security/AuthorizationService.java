package com.tripfactory.nomad.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.tripfactory.nomad.domain.entity.TripRequest;
import com.tripfactory.nomad.domain.entity.User;
import com.tripfactory.nomad.domain.enums.PaymentStatus;
import com.tripfactory.nomad.domain.enums.UserRole;
import com.tripfactory.nomad.repository.PaymentRepository;
import com.tripfactory.nomad.repository.TripRequestRepository;
import com.tripfactory.nomad.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component("authz")
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserRepository userRepository;
    private final TripRequestRepository tripRequestRepository;
    private final PaymentRepository paymentRepository;

    public boolean canAccessUser(Long userId) {
        User current = getCurrentUser();
        return current != null && (current.getRole() == UserRole.ADMIN || current.getId().equals(userId));
    }

    public boolean canAccessTrip(Long tripRequestId) {
        if (tripRequestId == null) return false;
        User current = getCurrentUser();
        if (current == null) {
            return false;
        }
        if (current.getRole() == UserRole.ADMIN) {
            return true;
        }
        TripRequest trip = tripRequestRepository.findById(tripRequestId).orElse(null);
        return trip != null && trip.getUser().getId().equals(current.getId());
    }

    /** Only the user who booked (trip owner with successful payment) can submit a trip review. */
    public boolean canReviewTrip(Long tripRequestId) {
        if (tripRequestId == null) return false;
        if (!canAccessTrip(tripRequestId)) return false;
        return paymentRepository.existsByTripRequestIdAndPaymentStatus(tripRequestId, PaymentStatus.CAPTURED);
    }

    public boolean canAccessGroup(Long groupId) {
        User current = getCurrentUser();
        if (current == null) {
            return false;
        }
        if (current.getRole() == UserRole.ADMIN) {
            return true;
        }
        return tripRequestRepository.existsByGroupIdAndUserId(groupId, current.getId());
    }

    public Long getCurrentUserId() {
        User user = getCurrentUser();
        return user != null ? user.getId() : null;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            return null;
        }
        String email = auth.getName();
        return userRepository.findByEmail(email).orElse(null);
    }
}