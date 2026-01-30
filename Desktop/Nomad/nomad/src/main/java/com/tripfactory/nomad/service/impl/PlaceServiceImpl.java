package com.tripfactory.nomad.service.impl;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tripfactory.nomad.api.dto.PlaceNearbyResponse;
import com.tripfactory.nomad.api.dto.PlaceResponse;
import com.tripfactory.nomad.domain.entity.Place;
import com.tripfactory.nomad.domain.enums.InterestType;
import com.tripfactory.nomad.repository.PlaceRepository;
import com.tripfactory.nomad.service.PlaceReviewService;
import com.tripfactory.nomad.service.PlaceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PlaceServiceImpl implements PlaceService {

    private final PlaceRepository placeRepository;
    private final PlaceReviewService placeReviewService;

    @Override
    public PlaceResponse getById(Long id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new com.tripfactory.nomad.service.exception.ResourceNotFoundException("Place not found"));
        PlaceResponse response = new PlaceResponse();
        response.setId(place.getId());
        response.setName(place.getName());
        response.setCity(place.getCity());
        response.setLatitude(place.getLatitude());
        response.setLongitude(place.getLongitude());
        response.setCategory(place.getCategory());
        response.setRating(place.getRating());
        response.setDescription(place.getDescription());
        response.setImageUrl(place.getImageUrl());
        response.setOpeningHours(place.getOpeningHours());
        return response;
    }

    @Override
    public List<PlaceNearbyResponse> getNearbyPlaces(String city, double userLat, double userLon, InterestType interest,
            double radiusKm, int limit) {
        List<Place> places;
        if (city == null || city.trim().isEmpty()) {
            // If no city provided, consider all seeded places and infer by distance
            places = placeRepository.findAll();
        } else {
            places = placeRepository.findByCityIgnoreCase(city);
        }

        if (places == null || places.isEmpty()) {
            return List.of();
        }

        return places.stream()
                .map(place -> toNearbyResponse(place, userLat, userLon))
                .filter(response -> response.getDistanceKm() <= radiusKm)
                .sorted(buildComparator(interest))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private Comparator<PlaceNearbyResponse> buildComparator(InterestType interest) {
        return Comparator
                .comparing((PlaceNearbyResponse p) -> interest != null && interest == p.getCategory() ? 0 : 1)
                .thenComparing(PlaceNearbyResponse::getDistanceKm)
                .thenComparing(PlaceNearbyResponse::getRating, Comparator.reverseOrder());
    }

    private PlaceNearbyResponse toNearbyResponse(Place place, double userLat, double userLon) {
        PlaceNearbyResponse response = new PlaceNearbyResponse();
        response.setId(place.getId());
        response.setName(place.getName());
        response.setCity(place.getCity());
        response.setLatitude(place.getLatitude());
        response.setLongitude(place.getLongitude());
        response.setCategory(place.getCategory());
        // Use average from actual place reviews when available; otherwise fall back to place's stored rating
        Double reviewAverage = placeReviewService.getAverageRatingByPlace(place.getId());
        response.setRating(reviewAverage != null ? reviewAverage : place.getRating());
        response.setDistanceKm(haversineKm(userLat, userLon, place.getLatitude(), place.getLongitude()));
        response.setDescription(place.getDescription());
        response.setImageUrl(place.getImageUrl());
        response.setOpeningHours(place.getOpeningHours());
        return response;
    }

    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double earthRadiusKm = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double rLat1 = Math.toRadians(lat1);
        double rLat2 = Math.toRadians(lat2);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(rLat1) * Math.cos(rLat2)
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }
}