package com.tripfactory.nomad.api.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tripfactory.nomad.domain.enums.TripStatus;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminDashboardResponse {

    private long userCount;
    private long tripCount;
    private long placeCount;
    private List<RecentTripSummary> recentTrips;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class RecentTripSummary {
        private Long tripRequestId;
        private String city;
        private TripStatus status;
        private Long userId;
        private String userEmail;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;
    }
}
