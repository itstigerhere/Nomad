package com.tripfactory.nomad.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripfactory.nomad.api.dto.ReviewCreateRequest;
import com.tripfactory.nomad.api.dto.ReviewResponse;
import com.tripfactory.nomad.api.dto.ReviewSummaryResponse;
import com.tripfactory.nomad.service.ReviewService;
import com.tripfactory.nomad.security.AuthorizationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final AuthorizationService authz;

    @PostMapping
    @PreAuthorize("@authz.canReviewTrip(#request.tripRequestId)")
    public ResponseEntity<ReviewResponse> createReview(@Valid @RequestBody ReviewCreateRequest request) {
        return new ResponseEntity<>(reviewService.createReview(request), HttpStatus.CREATED);
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long tripId) {
        return ResponseEntity.ok(reviewService.getReviewsByTrip(tripId));
    }

    @GetMapping("/{tripId}/summary")
    public ResponseEntity<ReviewSummaryResponse> getSummary(@PathVariable Long tripId) {
        ReviewSummaryResponse summary = new ReviewSummaryResponse();
        Double avg = reviewService.getAverageRatingByTrip(tripId);
        summary.setAverageRating(avg != null ? avg : 0.0);
        List<ReviewResponse> list = reviewService.getReviewsByTrip(tripId);
        summary.setReviewCount(list.size());
        summary.setCanReview(authz.canReviewTrip(tripId));
        Long currentUserId = authz.getCurrentUserId();
        summary.setAlreadyReviewed(currentUserId != null && reviewService.hasUserReviewedTrip(tripId, currentUserId));
        return ResponseEntity.ok(summary);
    }
}