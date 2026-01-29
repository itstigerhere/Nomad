package com.tripfactory.nomad.api.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TripPlanOptionResponse {
    private String type; // e.g. "Culture Only", "Hybrid: Culture + Food"
    private List<TripPlanItemResponse> places;
}
