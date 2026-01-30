package com.tripfactory.nomad.api.dto;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PackageSummaryResponse {
    private Long id;
    private String name;
    private String shortDescription;
    private BigDecimal price;
    private String imageUrl;
    private Integer maxCapacity = 20; // Default max capacity per package
    private Integer enrolledCount = 0; // Number of people enrolled
    private Integer availableSeats; // Calculated: maxCapacity - enrolledCount
}
