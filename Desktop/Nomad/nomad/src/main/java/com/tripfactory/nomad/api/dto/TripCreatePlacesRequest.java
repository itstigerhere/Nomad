package com.tripfactory.nomad.api.dto;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TripCreatePlacesRequest {

    @NotNull
    private Long userId;

    /** Travel date for the trip. */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate travelDate;

    /** City (optional; derived from first place if not set). */
    private String city;

    /** User's starting location for route optimization (optional; from user profile if not set). */
    private Double userLatitude;
    private Double userLongitude;

    /** Ordered or unordered place IDs; backend will optimize order if needed. */
    @NotNull
    private List<Long> placeIds;
}
