package com.tripfactory.nomad.api.dto;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.tripfactory.nomad.domain.enums.InterestType;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TripPlanItemResponse {

    private Integer dayNumber;

    private Long placeId;

    private String placeName;

    private LocalTime startTime;

    private LocalTime endTime;

    private Double distanceFromPrevious;

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;
    
    // Additional place data
    private String city;
    private InterestType category;
    private Double rating;
}
