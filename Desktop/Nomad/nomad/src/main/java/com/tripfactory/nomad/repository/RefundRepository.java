package com.tripfactory.nomad.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripfactory.nomad.domain.entity.Refund;
import com.tripfactory.nomad.domain.enums.RefundStatus;

public interface RefundRepository extends JpaRepository<Refund, Long> {

    List<Refund> findByPaymentIdOrderByCreatedAtDesc(Long paymentId);

    Optional<Refund> findByRazorpayRefundId(String razorpayRefundId);

    boolean existsByPaymentIdAndStatus(Long paymentId, RefundStatus status);
}
