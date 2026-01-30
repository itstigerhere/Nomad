package com.tripfactory.nomad.api.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tripfactory.nomad.domain.enums.InterestType;
import com.tripfactory.nomad.domain.enums.TravelMode;
import com.tripfactory.nomad.domain.enums.WeekendType;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PlanPreviewRequest {

    @NotNull
    private Long userId;
    private String city;
    private WeekendType weekendType;
    private InterestType interest;
    private TravelMode travelMode;
    private Boolean pickupRequired;
    private Double userLatitude;
    private Double userLongitude;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate travelDate;
}
