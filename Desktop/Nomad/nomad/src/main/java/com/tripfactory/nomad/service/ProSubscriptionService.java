package com.tripfactory.nomad.service;

import java.time.LocalDateTime;

import com.tripfactory.nomad.domain.enums.SubscriptionPlan;

public interface ProSubscriptionService {

    /** Returns true if user has an active Pro subscription (validUntil > now). */
    boolean isPro(Long userId);

    /** Activate Pro for user until given date (e.g. for admin or after Razorpay subscription). */
    void activatePro(Long userId, SubscriptionPlan plan, LocalDateTime validUntil);

    /** Get current Pro subscription end date for user, or null if not Pro. */
    LocalDateTime getProValidUntil(Long userId);
}
