package com.tripfactory.nomad.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripfactory.nomad.domain.entity.ProSubscription;
import com.tripfactory.nomad.domain.enums.SubscriptionStatus;

public interface ProSubscriptionRepository extends JpaRepository<ProSubscription, Long> {

    Optional<ProSubscription> findFirstByUserIdAndStatusOrderByValidUntilDesc(Long userId, SubscriptionStatus status);

    boolean existsByUserIdAndStatusAndValidUntilAfter(Long userId, SubscriptionStatus status, java.time.LocalDateTime dateTime);
}
