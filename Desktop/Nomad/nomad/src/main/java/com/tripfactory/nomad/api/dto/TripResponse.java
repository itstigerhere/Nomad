
package com.tripfactory.nomad.api.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.tripfactory.nomad.domain.enums.TripStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.ALWAYS)
public class TripResponse {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate travelDate;

    private Long tripRequestId;
    private Long userId;
    private Long groupId;
    private Long groupSize;
    private String city;
    private String shareToken;
    private TripStatus status;
    private LocalDateTime createdAt;
    private BigDecimal estimatedCost;
    // User's initial location for map marker
    private Double userLatitude;
    private Double userLongitude;
    // Now returns a list of plan options
    private List<TripPlanOptionResponse> plans;
}