package com.tripfactory.nomad.service.impl;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.tripfactory.nomad.api.dto.PaymentCreateRequest;
import com.tripfactory.nomad.api.dto.PaymentCreateResponse;
import com.tripfactory.nomad.api.dto.PaymentVerifyRequest;
import com.tripfactory.nomad.config.RazorpayProperties;
import com.tripfactory.nomad.domain.entity.Payment;
import com.tripfactory.nomad.domain.entity.TripRequest;
import com.tripfactory.nomad.domain.enums.PaymentStatus;
import com.tripfactory.nomad.domain.enums.TripStatus;
import com.tripfactory.nomad.repository.PaymentRepository;
import com.tripfactory.nomad.repository.TripRequestRepository;
import com.tripfactory.nomad.service.NotificationService;
import com.tripfactory.nomad.service.PaymentService;
import com.tripfactory.nomad.service.ProSubscriptionService;
import com.tripfactory.nomad.service.ReferralService;
import com.tripfactory.nomad.service.exception.BadRequestException;
import com.tripfactory.nomad.service.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final TripRequestRepository tripRequestRepository;
    private final RazorpayClient razorpayClient;
    private final RazorpayProperties razorpayProperties;
    private final NotificationService notificationService;
    private final ProSubscriptionService proSubscriptionService;
    private final ReferralService referralService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);
    @Value("${nomad.dev-payments:false}")
    private boolean devPayments;
    @Value("${nomad.commission-percent:0}")
    private int commissionPercent;
    @Value("${nomad.booking-fee-fixed:0}")
    private int bookingFeeFixed;
    @Value("${nomad.booking-fee-percent:0}")
    private int bookingFeePercent;
    @Value("${nomad.promo.code:}")
    private String promoCodeConfig;
    @Value("${nomad.promo.percent:0}")
    private int promoPercent;

    @Override
    @Transactional
    public PaymentCreateResponse createOrder(PaymentCreateRequest request) {
        TripRequest tripRequest = tripRequestRepository.findById(request.getTripRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (request.getAmount() == null) {
            throw new BadRequestException("amount is required");
        }

        BigDecimal baseAmount = request.getAmount();
        BigDecimal discount = applyPromo(request.getPromoCode(), baseAmount);
        baseAmount = baseAmount.subtract(discount);
        if (baseAmount.compareTo(BigDecimal.ZERO) < 0) {
            baseAmount = BigDecimal.ZERO;
        }
        boolean isPro = proSubscriptionService.isPro(tripRequest.getUser().getId());
        BigDecimal fee = isPro ? BigDecimal.ZERO : computeConvenienceFee(baseAmount);
        BigDecimal totalAmount = baseAmount.add(fee);

        long amountPaise = totalAmount.multiply(new BigDecimal("100")).longValue();
        if (devPayments) {
            log.info("devPayments enabled - creating fake order for tripId={}", tripRequest.getId());
            String fakeOrderId = "dev_order_" + System.currentTimeMillis();
            Payment payment = new Payment();
        payment.setTripRequest(tripRequest);
        payment.setAmount(baseAmount);
        payment.setConvenienceFee(fee);
        payment.setRazorpayOrderId(fakeOrderId);
            payment.setPaymentStatus(PaymentStatus.CREATED);
            Payment saved = paymentRepository.save(payment);

            tripRequest.setStatus(TripStatus.PAYMENT_PENDING);
            tripRequestRepository.save(tripRequest);

            return toResponse(saved);
        }

        Order order = createOrder(amountPaise, tripRequest.getId());

        Payment payment = new Payment();
        payment.setTripRequest(tripRequest);
        payment.setAmount(baseAmount); // after promo discount
        payment.setConvenienceFee(fee);
        payment.setRazorpayOrderId(order.get("id"));
        payment.setPaymentStatus(PaymentStatus.CREATED);
        Payment saved = paymentRepository.save(payment);

        tripRequest.setStatus(TripStatus.PAYMENT_PENDING);
        tripRequestRepository.save(tripRequest);

        return toResponse(saved);
    }

    @Override
    @Transactional
    public PaymentCreateResponse verifyPayment(PaymentVerifyRequest request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        boolean valid = verifySignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(),
            request.getRazorpaySignature());
        if (!valid) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new BadRequestException("Payment verification failed");
        }

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setPaymentStatus(PaymentStatus.CAPTURED);
        payment.setCommissionAmount(computeCommission(payment.getAmount()));
        Payment saved = paymentRepository.save(payment);

        TripRequest tripRequest = saved.getTripRequest();
        tripRequest.setStatus(TripStatus.CONFIRMED);
        tripRequestRepository.save(tripRequest);

        long firstBooking = paymentRepository.countByUserIdAndPaymentStatus(tripRequest.getUser().getId(), PaymentStatus.CAPTURED);
        if (firstBooking == 1) {
            referralService.onFirstBookingCompleted(tripRequest.getUser().getId());
        }

        String emailBody = "Your booking is confirmed.\n\nTrip #" + tripRequest.getId()
            + "\nCity: " + (tripRequest.getCity() != null ? tripRequest.getCity() : "N/A")
            + "\nAmount: ₹" + (saved.getAmount() != null ? saved.getAmount() : "0")
            + (tripRequest.getTravelDate() != null ? "\nTravel date: " + tripRequest.getTravelDate() : "")
            + "\n\nView your trip at: " + (System.getenv("NOMAD_FRONTEND_URL") != null ? System.getenv("NOMAD_FRONTEND_URL") : "http://localhost:3000") + "/trip-summary/" + tripRequest.getId();
        notificationService.sendEmail(tripRequest.getUser().getEmail(), "NOMAD – Booking confirmed", emailBody);
        String phone = tripRequest.getUser().getPhoneNumber();
        if (phone != null && !phone.isBlank()) {
            notificationService.sendSms(phone, "NOMAD: Payment confirmed for trip " + tripRequest.getId());
        }

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void handleWebhook(String payload, String signature) {
        String secret = razorpayProperties.getWebhookSecret();
        if (secret == null || secret.isBlank()) {
            throw new BadRequestException("Webhook secret not configured");
        }
        try {
            boolean valid = Utils.verifyWebhookSignature(payload, signature, secret);
            if (!valid) {
                throw new BadRequestException("Invalid webhook signature");
            }

            JsonNode root = objectMapper.readTree(payload);
            String event = root.path("event").asText();
            JsonNode paymentEntity = root.path("payload").path("payment").path("entity");
            String orderId = paymentEntity.path("order_id").asText();
            String paymentId = paymentEntity.path("id").asText();

            Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

            if ("payment.captured".equals(event)) {
                payment.setPaymentStatus(PaymentStatus.CAPTURED);
                payment.setRazorpayPaymentId(paymentId);
                payment.setCommissionAmount(computeCommission(payment.getAmount()));
                paymentRepository.save(payment);

                TripRequest tripRequest = payment.getTripRequest();
                tripRequest.setStatus(TripStatus.CONFIRMED);
                tripRequestRepository.save(tripRequest);

                long firstBooking = paymentRepository.countByUserIdAndPaymentStatus(tripRequest.getUser().getId(), PaymentStatus.CAPTURED);
                if (firstBooking == 1) {
                    referralService.onFirstBookingCompleted(tripRequest.getUser().getId());
                }

                String emailBody = "Your booking is confirmed.\n\nTrip #" + tripRequest.getId()
                    + "\nCity: " + (tripRequest.getCity() != null ? tripRequest.getCity() : "N/A")
                    + "\nAmount: ₹" + (payment.getAmount() != null ? payment.getAmount() : "0");
                notificationService.sendEmail(tripRequest.getUser().getEmail(), "NOMAD – Booking confirmed", emailBody);
                String phone = tripRequest.getUser().getPhoneNumber();
                if (phone != null && !phone.isBlank()) {
                    notificationService.sendSms(phone,
                        "NOMAD: Payment confirmed for trip " + tripRequest.getId());
                }
            } else if ("payment.failed".equals(event)) {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                payment.setRazorpayPaymentId(paymentId);
                paymentRepository.save(payment);

                TripRequest tripRequest = payment.getTripRequest();
                tripRequest.setStatus(TripStatus.CANCELLED);
                tripRequestRepository.save(tripRequest);
                String phone = tripRequest.getUser().getPhoneNumber();
                if (phone != null && !phone.isBlank()) {
                    notificationService.sendSms(phone,
                        "NOMAD: Payment failed for trip " + tripRequest.getId());
                }
            }
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Webhook processing failed");
        }
    }

    private Order createOrder(long amountPaise, Long tripId) {
        try {
            log.debug("Creating Razorpay order: amountPaise={} tripId={}", amountPaise, tripId);
            Map<String, Object> options = new HashMap<>();
            options.put("amount", amountPaise);
            options.put("currency", "INR");
            options.put("receipt", "trip_" + tripId);
            org.json.JSONObject jsonOptions = new org.json.JSONObject();
            for (Map.Entry<String, Object> entry : options.entrySet()) {
                jsonOptions.put(entry.getKey(), entry.getValue());
            }
            return razorpayClient.orders.create(jsonOptions);
        } catch (Exception ex) {
            log.error("Razorpay order creation failed", ex);
            String msg = ex.getMessage() == null ? "Failed to create Razorpay order" : "Failed to create Razorpay order: " + ex.getMessage();
            throw new BadRequestException(msg);
        }
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            Map<String, String> attributes = new HashMap<>();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);
            org.json.JSONObject jsonAttributes = new org.json.JSONObject();
            for (Map.Entry<String, String> entry : attributes.entrySet()) {
                jsonAttributes.put(entry.getKey(), entry.getValue());
            }
            return Utils.verifyPaymentSignature(jsonAttributes, razorpayProperties.getKeySecret());
        } catch (Exception ex) {
            return false;
        }
    }

    private BigDecimal applyPromo(String code, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        if (code == null || code.isBlank() || promoCodeConfig == null || promoCodeConfig.isBlank()) return BigDecimal.ZERO;
        if (promoPercent <= 0) return BigDecimal.ZERO;
        if (!code.trim().equalsIgnoreCase(promoCodeConfig.trim())) return BigDecimal.ZERO;
        return amount.multiply(BigDecimal.valueOf(promoPercent)).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
    }

    private BigDecimal computeConvenienceFee(BigDecimal baseAmount) {
        if (baseAmount == null) return BigDecimal.ZERO;
        BigDecimal fixed = BigDecimal.valueOf(bookingFeeFixed);
        BigDecimal percent = bookingFeePercent <= 0 ? BigDecimal.ZERO
            : baseAmount.multiply(BigDecimal.valueOf(bookingFeePercent)).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        return fixed.add(percent);
    }

    private BigDecimal computeCommission(BigDecimal amount) {
        if (amount == null || commissionPercent <= 0) {
            return BigDecimal.ZERO;
        }
        return amount.multiply(BigDecimal.valueOf(commissionPercent)).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
    }

    private PaymentCreateResponse toResponse(Payment payment) {
        PaymentCreateResponse response = new PaymentCreateResponse();
        response.setPaymentId(payment.getId());
        response.setTripRequestId(payment.getTripRequest().getId());
        response.setAmount(payment.getAmount());
        response.setConvenienceFee(payment.getConvenienceFee());
        response.setRazorpayOrderId(payment.getRazorpayOrderId());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }
}