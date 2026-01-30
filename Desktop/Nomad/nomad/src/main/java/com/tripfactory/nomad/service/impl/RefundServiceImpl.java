package com.tripfactory.nomad.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripfactory.nomad.api.dto.CancellationPolicyResponse;
import com.tripfactory.nomad.api.dto.RefundRequest;
import com.tripfactory.nomad.api.dto.RefundResponse;
import com.tripfactory.nomad.domain.entity.Payment;
import com.tripfactory.nomad.domain.entity.Refund;
import com.tripfactory.nomad.domain.entity.TripRequest;
import com.tripfactory.nomad.domain.enums.RefundStatus;
import com.tripfactory.nomad.domain.enums.TripStatus;
import com.tripfactory.nomad.repository.PaymentRepository;
import com.tripfactory.nomad.repository.RefundRepository;
import com.tripfactory.nomad.repository.TripRequestRepository;
import com.tripfactory.nomad.service.NotificationService;
import com.tripfactory.nomad.service.RefundService;
import com.tripfactory.nomad.service.exception.BadRequestException;
import com.tripfactory.nomad.service.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final PaymentRepository paymentRepository;
    private final TripRequestRepository tripRequestRepository;
    private final RefundRepository refundRepository;
    private final NotificationService notificationService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${nomad.cancellation.full-refund-days:7}")
    private int fullRefundDays;
    @Value("${nomad.cancellation.partial-refund-days:3}")
    private int partialRefundDays;
    @Value("${nomad.cancellation.partial-refund-percent:50}")
    private int partialRefundPercent;

    private final com.tripfactory.nomad.config.RazorpayProperties razorpayProperties;

    @Override
    public CancellationPolicyResponse getCancellationPolicy(Long tripRequestId) {
        TripRequest tripRequest = tripRequestRepository.findById(tripRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        Payment payment = paymentRepository.findByTripRequestId(tripRequestId).orElse(null);
        BigDecimal paidAmount = payment != null ? payment.getAmount() : (tripRequest.getEstimatedCost() != null
                ? BigDecimal.valueOf(tripRequest.getEstimatedCost()) : BigDecimal.ZERO);
        BigDecimal estimatedRefund = computeRefundAmount(paidAmount, tripRequest.getTravelDate());

        CancellationPolicyResponse response = new CancellationPolicyResponse();
        response.setFullRefundDays(fullRefundDays);
        response.setPartialRefundDays(partialRefundDays);
        response.setPartialRefundPercent(partialRefundPercent);
        response.setEstimatedRefundAmount(estimatedRefund);
        return response;
    }

    @Override
    @Transactional
    public RefundResponse requestRefund(RefundRequest request) {
        if (request.getTripRequestId() == null) {
            throw new BadRequestException("tripRequestId is required");
        }
        TripRequest tripRequest = tripRequestRepository.findById(request.getTripRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        if (tripRequest.getStatus() != TripStatus.CONFIRMED) {
            throw new BadRequestException("Only confirmed trips can be refunded. Current status: " + tripRequest.getStatus());
        }

        Payment payment = paymentRepository.findByTripRequestId(tripRequest.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for this trip"));
        if (payment.getRazorpayPaymentId() == null || payment.getRazorpayPaymentId().isBlank()) {
            throw new BadRequestException("Payment cannot be refunded (no Razorpay payment id)");
        }

        BigDecimal refundAmount = computeRefundAmount(payment.getAmount(), tripRequest.getTravelDate());
        if (refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("No refund available for this trip (cancellation policy: 0% refund for cancellations within " + partialRefundDays + " days of travel)");
        }

        Refund refund = new Refund();
        refund.setPayment(payment);
        refund.setAmount(refundAmount);
        refund.setReason(request.getReason());
        refund.setStatus(RefundStatus.PENDING);
        refund = refundRepository.save(refund);

        try {
            String razorpayRefundId = createRazorpayRefund(payment.getRazorpayPaymentId(), refundAmount);
            refund.setRazorpayRefundId(razorpayRefundId);
            refund.setStatus(RefundStatus.PROCESSED);
        } catch (Exception e) {
            refund.setStatus(RefundStatus.FAILED);
            refundRepository.save(refund);
            throw new BadRequestException("Refund request failed: " + (e.getMessage() != null ? e.getMessage() : "unknown error"));
        }
        refundRepository.save(refund);

        tripRequest.setStatus(TripStatus.CANCELLED);
        tripRequestRepository.save(tripRequest);

        String email = tripRequest.getUser().getEmail();
        notificationService.sendEmail(email, "NOMAD Refund Processed",
                "Refund of ₹" + refundAmount + " for trip " + tripRequest.getId() + " has been processed.");
        return toResponse(refund, tripRequest.getId());
    }

    private BigDecimal computeRefundAmount(BigDecimal paidAmount, LocalDate travelDate) {
        if (paidAmount == null || paidAmount.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        if (travelDate == null) return paidAmount; // no date = full refund
        long daysUntilTravel = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), travelDate);
        if (daysUntilTravel >= fullRefundDays) {
            return paidAmount;
        }
        if (daysUntilTravel >= partialRefundDays) {
            return paidAmount.multiply(BigDecimal.valueOf(partialRefundPercent)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        return BigDecimal.ZERO;
    }

    private String createRazorpayRefund(String razorpayPaymentId, BigDecimal amount) throws Exception {
        long amountPaise = amount.multiply(BigDecimal.valueOf(100)).longValue();
        String auth = razorpayProperties.getKeyId() + ":" + razorpayProperties.getKeySecret();
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Basic " + encodedAuth);

        Map<String, Object> body = new HashMap<>();
        body.put("amount", amountPaise);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        String url = "https://api.razorpay.com/v1/payments/" + razorpayPaymentId + "/refund";
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        return root.has("id") ? root.get("id").asText() : null;
    }

    private RefundResponse toResponse(Refund refund, Long tripRequestId) {
        RefundResponse response = new RefundResponse();
        response.setRefundId(refund.getId());
        response.setTripRequestId(tripRequestId);
        response.setPaymentId(refund.getPayment().getId());
        response.setAmount(refund.getAmount());
        response.setReason(refund.getReason());
        response.setStatus(refund.getStatus());
        response.setCreatedAt(refund.getCreatedAt());
        return response;
    }
}
