package com.tripfactory.nomad.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tripfactory.nomad.domain.entity.Referral;
import com.tripfactory.nomad.domain.entity.User;
import com.tripfactory.nomad.repository.ReferralRepository;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.service.NotificationService;
import com.tripfactory.nomad.service.ReferralService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReferralServiceImpl implements ReferralService {

    private final ReferralRepository referralRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${nomad.referral.reward-amount:200}")
    private int rewardAmountInr;

    @Override
    @Transactional
    public void recordReferral(Long referrerId, Long referreeId) {
        if (referrerId == null || referreeId == null || referrerId.equals(referreeId)) {
            return;
        }
        if (referralRepository.existsByReferrerIdAndReferreeId(referrerId, referreeId)) {
            return;
        }
        User referrer = userRepository.findById(referrerId).orElse(null);
        User referree = userRepository.findById(referreeId).orElse(null);
        if (referrer == null || referree == null) {
            return;
        }
        Referral referral = new Referral();
        referral.setReferrer(referrer);
        referral.setReferree(referree);
        referral.setRewardApplied(false);
        referralRepository.save(referral);
    }

    @Override
    @Transactional
    public void onFirstBookingCompleted(Long referreeUserId) {
        if (referreeUserId == null) {
            return;
        }
        Optional<Referral> opt = referralRepository.findFirstByReferreeIdAndRewardAppliedOrderByCreatedAtAsc(referreeUserId, false);
        if (opt.isEmpty()) {
            return;
        }
        Referral referral = opt.get();
        referral.setRewardApplied(true);
        referralRepository.save(referral);

        String referrerEmail = referral.getReferrer().getEmail();
        notificationService.sendEmail(referrerEmail, "NOMAD Referral Reward",
                "Your friend just completed their first booking! You've earned ₹" + rewardAmountInr + " credit. Thanks for referring!");
    }
}
