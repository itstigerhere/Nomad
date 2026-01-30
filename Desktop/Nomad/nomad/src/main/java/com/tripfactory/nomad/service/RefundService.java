package com.tripfactory.nomad.service;

import com.tripfactory.nomad.api.dto.CancellationPolicyResponse;
import com.tripfactory.nomad.api.dto.RefundRequest;
import com.tripfactory.nomad.api.dto.RefundResponse;

public interface RefundService {

    CancellationPolicyResponse getCancellationPolicy(Long tripRequestId);

    RefundResponse requestRefund(RefundRequest request);
}
