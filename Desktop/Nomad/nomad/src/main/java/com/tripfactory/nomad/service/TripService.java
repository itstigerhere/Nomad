package com.tripfactory.nomad.service;


import java.util.List;
import com.tripfactory.nomad.api.dto.PlanPreviewRequest;
import com.tripfactory.nomad.api.dto.PlanPreviewResponse;
import com.tripfactory.nomad.api.dto.TripCreateRequest;
import com.tripfactory.nomad.api.dto.TripResponse;

public interface TripService {

    PlanPreviewResponse previewPlans(PlanPreviewRequest request);

    TripResponse createTrip(TripCreateRequest request);


    TripResponse getTrip(Long tripRequestId);

    List<TripResponse> getTripsByUser(Long userId);
}