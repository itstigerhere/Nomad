package com.tripfactory.nomad.service;


import java.util.List;
import com.tripfactory.nomad.api.dto.PlanPreviewRequest;
import com.tripfactory.nomad.api.dto.PlanPreviewResponse;
import com.tripfactory.nomad.api.dto.TripCreateRequest;
import com.tripfactory.nomad.api.dto.TripResponse;

public interface TripService {

    PlanPreviewResponse previewPlans(PlanPreviewRequest request);

    TripResponse createTrip(TripCreateRequest request);

    /** Create a trip from user-selected place IDs; optimizes route order and returns trip with one plan. */
    TripResponse createTripFromPlaces(com.tripfactory.nomad.api.dto.TripCreatePlacesRequest request);

    TripResponse getTrip(Long tripRequestId);

    List<TripResponse> getTripsByUser(Long userId);

    /** Cancel a trip if status is REQUESTED or PAYMENT_PENDING. Sets status to CANCELLED. */
    TripResponse cancelTrip(Long tripRequestId);
}