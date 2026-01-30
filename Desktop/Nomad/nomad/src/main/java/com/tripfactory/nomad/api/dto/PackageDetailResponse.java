package com.tripfactory.nomad.api.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PackageDetailResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private List<PlaceResponse> places;
    private List<String> activities;
    private Double averageRating;
    private Integer maxCapacity = 20; // Default max capacity per package
    private Integer enrolledCount = 0; // Number of people enrolled
    private Integer availableSeats; // Calculated: maxCapacity - enrolledCount
    // package-level reviews can be added later
}
