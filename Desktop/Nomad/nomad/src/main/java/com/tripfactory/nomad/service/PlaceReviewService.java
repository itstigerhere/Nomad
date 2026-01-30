package com.tripfactory.nomad.service;

import java.util.List;

import com.tripfactory.nomad.api.dto.PlaceReviewCreateRequest;
import com.tripfactory.nomad.api.dto.PlaceReviewResponse;

public interface PlaceReviewService {

    PlaceReviewResponse createReview(PlaceReviewCreateRequest request);

    List<PlaceReviewResponse> getReviewsByPlace(Long placeId);

    Double getAverageRatingByPlace(Long placeId);
}
