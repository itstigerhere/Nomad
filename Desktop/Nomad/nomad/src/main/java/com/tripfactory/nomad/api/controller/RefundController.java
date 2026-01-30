package com.tripfactory.nomad.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripfactory.nomad.api.dto.CancellationPolicyResponse;
import com.tripfactory.nomad.api.dto.RefundRequest;
import com.tripfactory.nomad.api.dto.RefundResponse;
import com.tripfactory.nomad.service.RefundService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @GetMapping("/policy/{tripRequestId}")
    @PreAuthorize("@authz.canAccessTrip(#tripRequestId)")
    public ResponseEntity<CancellationPolicyResponse> getCancellationPolicy(@PathVariable Long tripRequestId) {
        return ResponseEntity.ok(refundService.getCancellationPolicy(tripRequestId));
    }

    @PostMapping("/request")
    @PreAuthorize("@authz.canAccessTrip(#request.tripRequestId)")
    public ResponseEntity<RefundResponse> requestRefund(@Valid @RequestBody RefundRequest request) {
        return new ResponseEntity<>(refundService.requestRefund(request), HttpStatus.CREATED);
    }
}
