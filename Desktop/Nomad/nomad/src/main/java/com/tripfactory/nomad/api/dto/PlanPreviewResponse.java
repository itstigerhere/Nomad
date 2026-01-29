package com.tripfactory.nomad.api.dto;

import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PlanPreviewResponse {
    private String city;
    private List<TripPlanOptionResponse> planOptions;
}
