package com.tripfactory.nomad.api.dto;

import java.time.LocalDateTime;

import com.tripfactory.nomad.domain.enums.SubscriptionPlan;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProActivateRequest {

    private Long userId;
    private SubscriptionPlan plan;
    /** Subscription valid until this date (e.g. now + 1 month for MONTHLY). */
    private LocalDateTime validUntil;
}
