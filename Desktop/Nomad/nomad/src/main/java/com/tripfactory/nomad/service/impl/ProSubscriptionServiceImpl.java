package com.tripfactory.nomad.service.impl;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripfactory.nomad.domain.entity.ProSubscription;
import com.tripfactory.nomad.domain.entity.User;
import com.tripfactory.nomad.domain.enums.SubscriptionPlan;
import com.tripfactory.nomad.domain.enums.SubscriptionStatus;
import com.tripfactory.nomad.repository.ProSubscriptionRepository;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.service.ProSubscriptionService;
import com.tripfactory.nomad.service.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProSubscriptionServiceImpl implements ProSubscriptionService {

    private final ProSubscriptionRepository proSubscriptionRepository;
    private final UserRepository userRepository;

    @Override
    public boolean isPro(Long userId) {
        if (userId == null) return false;
        return proSubscriptionRepository.existsByUserIdAndStatusAndValidUntilAfter(
                userId, SubscriptionStatus.ACTIVE, LocalDateTime.now());
    }

    @Override
    @Transactional
    public void activatePro(Long userId, SubscriptionPlan plan, LocalDateTime validUntil) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProSubscription sub = new ProSubscription();
        sub.setUser(user);
        sub.setPlan(plan);
        sub.setStatus(SubscriptionStatus.ACTIVE);
        sub.setValidUntil(validUntil);
        proSubscriptionRepository.save(sub);
    }

    @Override
    public LocalDateTime getProValidUntil(Long userId) {
        if (userId == null) return null;
        return proSubscriptionRepository.findFirstByUserIdAndStatusOrderByValidUntilDesc(userId, SubscriptionStatus.ACTIVE)
                .filter(s -> s.getValidUntil().isAfter(LocalDateTime.now()))
                .map(ProSubscription::getValidUntil)
                .orElse(null);
    }
}
