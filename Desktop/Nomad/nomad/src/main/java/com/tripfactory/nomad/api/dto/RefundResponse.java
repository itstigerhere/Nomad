package com.tripfactory.nomad.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.tripfactory.nomad.domain.enums.RefundStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class RefundResponse {

    private Long refundId;
    private Long tripRequestId;
    private Long paymentId;
    private BigDecimal amount;
    private String reason;
    private RefundStatus status;
    private LocalDateTime createdAt;
}
