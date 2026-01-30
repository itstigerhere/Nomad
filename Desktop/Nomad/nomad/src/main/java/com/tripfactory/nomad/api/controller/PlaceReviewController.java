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

import com.tripfactory.nomad.api.dto.PlaceReviewBodyRequest;
import com.tripfactory.nomad.api.dto.PlaceReviewCreateRequest;
import com.tripfactory.nomad.api.dto.PlaceReviewResponse;
import com.tripfactory.nomad.service.PlaceReviewService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/place-reviews")
@RequiredArgsConstructor
public class PlaceReviewController {

    private final PlaceReviewService placeReviewService;

    @PostMapping("/place/{placeId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PlaceReviewResponse> createReview(
            @PathVariable Long placeId,
            @Valid @RequestBody PlaceReviewBodyRequest body) {
        PlaceReviewCreateRequest request = new PlaceReviewCreateRequest();
        request.setPlaceId(placeId);
        request.setRating(body.getRating());
        request.setComment(body.getComment());
        return new ResponseEntity<>(placeReviewService.createReview(request), HttpStatus.CREATED);
    }

    @GetMapping("/place/{placeId}")
    public ResponseEntity<List<PlaceReviewResponse>> getReviews(@PathVariable Long placeId) {
        return ResponseEntity.ok(placeReviewService.getReviewsByPlace(placeId));
    }

    @GetMapping("/place/{placeId}/average")
    public ResponseEntity<Double> getAverageRating(@PathVariable Long placeId) {
        Double avg = placeReviewService.getAverageRatingByPlace(placeId);
        return ResponseEntity.ok(avg != null ? avg : 0.0);
    }
}
