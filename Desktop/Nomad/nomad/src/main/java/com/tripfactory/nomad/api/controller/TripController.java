package com.tripfactory.nomad.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripfactory.nomad.api.dto.PlanPreviewRequest;
import com.tripfactory.nomad.api.dto.PlanPreviewResponse;
import com.tripfactory.nomad.api.dto.TripCreatePlacesRequest;
import com.tripfactory.nomad.api.dto.TripCreateRequest;
import com.tripfactory.nomad.api.dto.TripResponse;
import com.tripfactory.nomad.domain.entity.User;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.service.TripService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;
    private final UserRepository userRepository;

    // Specific endpoints should come before path variable endpoints
    @PostMapping(value = "/preview")
    public ResponseEntity<PlanPreviewResponse> previewPlans(@Valid @RequestBody PlanPreviewRequest request) {
        System.out.println("[TRIP CONTROLLER] previewPlans endpoint called");
        return ResponseEntity.ok(tripService.previewPlans(request));
    }

    @PostMapping("/create")
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody TripCreateRequest request) {
        return new ResponseEntity<>(tripService.createTrip(request), HttpStatus.CREATED);
    }

    @PostMapping("/create-from-places")
    public ResponseEntity<TripResponse> createTripFromPlaces(@Valid @RequestBody TripCreatePlacesRequest request) {
        return new ResponseEntity<>(tripService.createTripFromPlaces(request), HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<List<TripResponse>> getMyTrips() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("[TRIP CONTROLLER] Authenticated user: " + email);
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            System.out.println("[TRIP CONTROLLER] User not found for email: " + email);
            return ResponseEntity.status(401).build();
        }
        System.out.println("[TRIP CONTROLLER] Found user ID: " + user.getId());
        return ResponseEntity.ok(tripService.getTripsByUser(user.getId()));
    }

    // Path variable endpoint last — id must be numeric so "create-from-places" is not matched
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("@authz.canAccessTrip(#id)")
    public ResponseEntity<TripResponse> getTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTrip(id));
    }

    @PatchMapping("/{id:\\d+}/cancel")
    @PreAuthorize("@authz.canAccessTrip(#id)")
    public ResponseEntity<TripResponse> cancelTrip(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.cancelTrip(id));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("@authz.canAccessUser(#userId)")
    public ResponseEntity<List<TripResponse>> getTripsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(tripService.getTripsByUser(userId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@authz.canAccessTrip(#id)")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        tripService.cancelTrip(id);
        return ResponseEntity.noContent().build();
    }
}