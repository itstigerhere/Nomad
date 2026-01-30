package com.tripfactory.nomad.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.tripfactory.nomad.api.dto.PlaceReviewCreateRequest;
import com.tripfactory.nomad.api.dto.PlaceReviewResponse;
import com.tripfactory.nomad.domain.entity.Place;
import com.tripfactory.nomad.domain.entity.PlaceReview;
import com.tripfactory.nomad.domain.entity.User;
import com.tripfactory.nomad.repository.PlaceRepository;
import com.tripfactory.nomad.repository.PlaceReviewRepository;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.service.PlaceReviewService;
import com.tripfactory.nomad.service.exception.BadRequestException;
import com.tripfactory.nomad.service.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlaceReviewServiceImpl implements PlaceReviewService {

    private final PlaceReviewRepository placeReviewRepository;
    private final PlaceRepository placeRepository;
    private final UserRepository userRepository;

    @Override
    public PlaceReviewResponse createReview(PlaceReviewCreateRequest request) {
        Place place = placeRepository.findById(request.getPlaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Place not found"));
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new BadRequestException("You must be logged in to submit a review");
        }
        if (placeReviewRepository.existsByPlaceIdAndUserId(place.getId(), currentUser.getId())) {
            throw new BadRequestException("You have already reviewed this place");
        }

        PlaceReview review = new PlaceReview();
        review.setPlace(place);
        review.setUser(currentUser);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        PlaceReview saved = placeReviewRepository.save(review);
        return toResponse(saved);
    }

    @Override
    public List<PlaceReviewResponse> getReviewsByPlace(Long placeId) {
        return placeReviewRepository.findByPlaceIdOrderByCreatedAtDesc(placeId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Double getAverageRatingByPlace(Long placeId) {
        List<PlaceReview> reviews = placeReviewRepository.findByPlaceIdOrderByCreatedAtDesc(placeId);
        if (reviews.isEmpty()) return null;
        return reviews.stream().mapToInt(PlaceReview::getRating).average().orElse(0.0);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication() != null
                ? SecurityContextHolder.getContext().getAuthentication().getName()
                : null;
        return email != null ? userRepository.findByEmail(email).orElse(null) : null;
    }

    private PlaceReviewResponse toResponse(PlaceReview review) {
        PlaceReviewResponse response = new PlaceReviewResponse();
        response.setId(review.getId());
        response.setPlaceId(review.getPlace().getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        if (review.getUser() != null) {
            response.setReviewerEmail(review.getUser().getEmail());
        }
        return response;
    }
}
