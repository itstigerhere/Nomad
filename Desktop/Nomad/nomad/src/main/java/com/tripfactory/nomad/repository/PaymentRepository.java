package com.tripfactory.nomad.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripfactory.nomad.domain.entity.Payment;
import com.tripfactory.nomad.domain.enums.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTripRequestId(Long tripRequestId);

    boolean existsByTripRequestIdAndPaymentStatus(Long tripRequestId, PaymentStatus status);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
}