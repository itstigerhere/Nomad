package com.tripfactory.nomad.service;

import java.util.List;

import com.tripfactory.nomad.api.dto.ReviewCreateRequest;
import com.tripfactory.nomad.api.dto.ReviewResponse;

public interface ReviewService {

    ReviewResponse createReview(ReviewCreateRequest request);

    List<ReviewResponse> getReviewsByTrip(Long tripRequestId);

    Double getAverageRatingByTrip(Long tripRequestId);

    boolean hasUserReviewedTrip(Long tripRequestId, Long userId);
}