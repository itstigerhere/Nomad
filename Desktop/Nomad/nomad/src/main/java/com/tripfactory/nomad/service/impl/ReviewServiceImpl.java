package com.tripfactory.nomad.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.tripfactory.nomad.api.dto.ReviewCreateRequest;
import com.tripfactory.nomad.api.dto.ReviewResponse;
import com.tripfactory.nomad.domain.entity.Review;
import com.tripfactory.nomad.domain.entity.TripRequest;
import com.tripfactory.nomad.domain.entity.User;
import com.tripfactory.nomad.domain.enums.TripStatus;
import com.tripfactory.nomad.repository.ReviewRepository;
import com.tripfactory.nomad.repository.TripRequestRepository;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.service.ReviewService;
import com.tripfactory.nomad.service.exception.BadRequestException;
import com.tripfactory.nomad.service.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final TripRequestRepository tripRequestRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse createReview(ReviewCreateRequest request) {
        TripRequest tripRequest = tripRequestRepository.findById(request.getTripRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new BadRequestException("You must be logged in to submit a review");
        }
        if (tripRequest.getStatus() != TripStatus.CONFIRMED) {
            throw new BadRequestException("You can only review a trip after it is confirmed (paid)");
        }
        if (reviewRepository.existsByTripRequestIdAndUserId(tripRequest.getId(), currentUser.getId())) {
            throw new BadRequestException("You have already reviewed this trip");
        }

        Review review = new Review();
        review.setTripRequest(tripRequest);
        review.setUser(currentUser);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setVerified(true); // Only paid (CONFIRMED) trip owners can review
        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    @Override
    public List<ReviewResponse> getReviewsByTrip(Long tripRequestId) {
        return reviewRepository.findByTripRequestId(tripRequestId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Double getAverageRatingByTrip(Long tripRequestId) {
        List<Review> reviews = reviewRepository.findByTripRequestId(tripRequestId);
        if (reviews.isEmpty()) return null;
        return reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
    }

    @Override
    public boolean hasUserReviewedTrip(Long tripRequestId, Long userId) {
        return reviewRepository.existsByTripRequestIdAndUserId(tripRequestId, userId);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : null;
        return email != null ? userRepository.findByEmail(email).orElse(null) : null;
    }

    private ReviewResponse toResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setTripRequestId(review.getTripRequest().getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setVerified(Boolean.TRUE.equals(review.getVerified()));
        response.setCreatedAt(review.getCreatedAt());
        if (review.getUser() != null) {
            response.setReviewerEmail(review.getUser().getEmail());
        }
        return response;
    }
}