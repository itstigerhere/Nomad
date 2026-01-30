package com.tripfactory.nomad.api.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CancellationPolicyResponse {

    /** Full refund if cancelled at least this many days before travel. */
    private int fullRefundDays;
    /** Partial refund if cancelled between partialRefundDays and fullRefundDays before travel. */
    private int partialRefundDays;
    /** Refund percentage for partial window (e.g. 50). */
    private int partialRefundPercent;
    /** Estimated refund amount for the given trip (based on policy and travel date). */
    private BigDecimal estimatedRefundAmount;
}
