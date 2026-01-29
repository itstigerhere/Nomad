package com.tripfactory.nomad.api.dto;

import java.time.LocalDate;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TripCreatePlacesRequest {
    private Long userId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Long> placeIds;
}
