package com.tripfactory.nomad.service.impl;

import org.springframework.stereotype.Service;

import com.tripfactory.nomad.api.dto.EnrollmentRequest;
import com.tripfactory.nomad.api.dto.EnrollmentResponse;
import com.tripfactory.nomad.domain.entity.Enrollment;
import com.tripfactory.nomad.domain.entity.TripRequest;
import com.tripfactory.nomad.domain.entity.User;
import com.tripfactory.nomad.repository.EnrollmentRepository;
import com.tripfactory.nomad.repository.TripRequestRepository;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.service.EnrollmentService;
import com.tripfactory.nomad.service.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final TripRequestRepository tripRequestRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
        public EnrollmentResponse enroll(EnrollmentRequest request) {
        EnrollmentResponse response = new EnrollmentResponse();
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        TripRequest tripRequest = tripRequestRepository.findById(request.getTripRequestId())
            .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        // Prevent duplicate enrollment
        if (enrollmentRepository.findByUserIdAndTripRequestId(user.getId(), tripRequest.getId()).isPresent()) {
            response.setSuccess(false);
            response.setMessage("User already enrolled in this trip");
            return response;
        }

        // Simulate payment check (in real app, verify paymentToken)
        boolean paid = request.getPaymentToken() != null && !request.getPaymentToken().isEmpty();

        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setTripRequest(tripRequest);
        enrollment.setPaid(paid);
        enrollmentRepository.save(enrollment);

        long count = enrollmentRepository.countByTripRequestId(tripRequest.getId());
        response.setSuccess(true);
        response.setMessage("Enrollment successful. Total enrolled: " + count);
        return response;
        }
}
