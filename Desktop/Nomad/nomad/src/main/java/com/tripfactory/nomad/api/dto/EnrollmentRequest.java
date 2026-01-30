package com.tripfactory.nomad.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EnrollmentRequest {
    private Long userId;
    private Long tripRequestId;
    private String paymentToken;
    private Long packageId; // Track which package this enrollment is for
}
