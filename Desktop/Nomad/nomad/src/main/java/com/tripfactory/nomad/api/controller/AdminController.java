package com.tripfactory.nomad.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.lang.NonNull;

import jakarta.validation.Valid;

import com.tripfactory.nomad.api.dto.AdminDashboardResponse;
import com.tripfactory.nomad.api.dto.PlaceCreateRequest;
import com.tripfactory.nomad.api.dto.ProActivateRequest;
import com.tripfactory.nomad.api.dto.PlaceResponse;
import com.tripfactory.nomad.api.dto.VehicleCreateRequest;
import com.tripfactory.nomad.domain.entity.Place;
import com.tripfactory.nomad.domain.entity.SponsoredPackage;
import com.tripfactory.nomad.domain.entity.TripRequest;
import com.tripfactory.nomad.domain.entity.Vehicle;
import com.tripfactory.nomad.repository.PaymentRepository;
import com.tripfactory.nomad.repository.PlaceRepository;
import com.tripfactory.nomad.repository.SponsoredPackageRepository;
import com.tripfactory.nomad.repository.TripRequestRepository;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.repository.VehicleRepository;
import com.tripfactory.nomad.service.ProSubscriptionService;
import com.tripfactory.nomad.service.exception.ResourceNotFoundException;

import org.springframework.data.domain.PageRequest;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final int RECENT_TRIPS_LIMIT = 10;

    private final PlaceRepository placeRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRequestRepository tripRequestRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final ProSubscriptionService proSubscriptionService;
    private final SponsoredPackageRepository sponsoredPackageRepository;

    @PostMapping("/places")
    public ResponseEntity<PlaceResponse> createPlace(@Valid @RequestBody PlaceCreateRequest request) {
        Place place = new Place();
        place.setName(request.getName());
        place.setCity(request.getCity());
        place.setLatitude(request.getLatitude());
        place.setLongitude(request.getLongitude());
        place.setCategory(request.getCategory());
        place.setRating(request.getRating());
        place.setDescription(request.getDescription());
        place.setImageUrl(request.getImageUrl());
        place.setOpeningHours(request.getOpeningHours());

        Place saved = placeRepository.save(place);
        return new ResponseEntity<>(toResponse(saved), HttpStatus.CREATED);
    }

    @GetMapping("/places")
    public ResponseEntity<List<PlaceResponse>> getPlaces() {
        List<PlaceResponse> responses = placeRepository.findAll().stream().map(this::toResponse).toList();
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/places/{id}")
    public ResponseEntity<Void> deletePlace(@PathVariable @NonNull Long id) {
        if (!placeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Place not found");
        }
        placeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/vehicles")
    public ResponseEntity<Vehicle> createVehicle(@Valid @RequestBody VehicleCreateRequest request) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setDriverName(request.getDriverName());
        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setAvailabilityStatus(request.getAvailabilityStatus());
        Vehicle saved = vehicleRepository.save(vehicle);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getVehicles() {
        return ResponseEntity.ok(vehicleRepository.findAll());
    }

    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable @NonNull Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vehicle not found");
        }
        vehicleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        AdminDashboardResponse response = new AdminDashboardResponse();
        response.setUserCount(userRepository.count());
        response.setTripCount(tripRequestRepository.count());
        response.setPlaceCount(placeRepository.count());
        response.setTotalCommission(paymentRepository.sumCommissionFromCapturedPayments());
        List<TripRequest> recent = tripRequestRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, RECENT_TRIPS_LIMIT));
        response.setRecentTrips(recent.stream().map(this::toRecentTripSummary).toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sponsored")
    public ResponseEntity<Void> addSponsored(@RequestBody java.util.Map<String, Long> body) {
        Long packageId = body != null ? body.get("packageId") : null;
        if (packageId == null) {
            throw new ResourceNotFoundException("packageId is required");
        }
        if (sponsoredPackageRepository.existsByPackageId(packageId)) {
            return ResponseEntity.ok().build();
        }
        SponsoredPackage sp = new SponsoredPackage();
        sp.setPackageId(packageId);
        sponsoredPackageRepository.save(sp);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @DeleteMapping("/sponsored/{packageId}")
    public ResponseEntity<Void> removeSponsored(@PathVariable Long packageId) {
        sponsoredPackageRepository.deleteByPackageId(packageId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/pro/activate")
    public ResponseEntity<Void> activatePro(@Valid @RequestBody ProActivateRequest request) {
        if (request.getUserId() == null || request.getValidUntil() == null || request.getPlan() == null) {
            throw new ResourceNotFoundException("userId, plan and validUntil are required");
        }
        proSubscriptionService.activatePro(request.getUserId(), request.getPlan(), request.getValidUntil());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/trips")
    public ResponseEntity<List<AdminDashboardResponse.RecentTripSummary>> getTrips() {
        List<TripRequest> all = tripRequestRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 500));
        return ResponseEntity.ok(all.stream().map(this::toRecentTripSummary).toList());
    }

    private AdminDashboardResponse.RecentTripSummary toRecentTripSummary(TripRequest tr) {
        AdminDashboardResponse.RecentTripSummary s = new AdminDashboardResponse.RecentTripSummary();
        s.setTripRequestId(tr.getId());
        s.setCity(tr.getCity());
        s.setStatus(tr.getStatus());
        s.setUserId(tr.getUser() != null ? tr.getUser().getId() : null);
        s.setUserEmail(tr.getUser() != null ? tr.getUser().getEmail() : null);
        s.setCreatedAt(tr.getCreatedAt());
        return s;
    }

    private PlaceResponse toResponse(Place place) {
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
}