package com.tripfactory.nomad.service;

public interface ReferralService {

    /** Record that referree signed up using referrer's code. */
    void recordReferral(Long referrerId, Long referreeId);

    /** Called when referree completes first booking; apply reward to referrer and mark. */
    void onFirstBookingCompleted(Long referreeUserId);
}
