package com.tripfactory.nomad.repository;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tripfactory.nomad.domain.entity.Payment;
import com.tripfactory.nomad.domain.enums.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTripRequestId(Long tripRequestId);

    boolean existsByTripRequestIdAndPaymentStatus(Long tripRequestId, PaymentStatus status);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    @Query("SELECT COALESCE(SUM(p.commissionAmount), 0) FROM Payment p WHERE p.paymentStatus = 'CAPTURED' AND p.commissionAmount IS NOT NULL")
    BigDecimal sumCommissionFromCapturedPayments();

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.tripRequest.user.id = :userId AND p.paymentStatus = :status")
    long countByUserIdAndPaymentStatus(@Param("userId") Long userId, @Param("status") com.tripfactory.nomad.domain.enums.PaymentStatus status);
}