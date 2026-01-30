package com.tripfactory.nomad.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripfactory.nomad.domain.entity.Referral;

public interface ReferralRepository extends JpaRepository<Referral, Long> {

    Optional<Referral> findFirstByReferreeIdAndRewardAppliedOrderByCreatedAtAsc(Long referreeId, Boolean rewardApplied);

    List<Referral> findByReferrerIdOrderByCreatedAtDesc(Long referrerId);

    boolean existsByReferrerIdAndReferreeId(Long referrerId, Long referreeId);
}
