package com.tripfactory.nomad.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Request body for creating a place review (placeId comes from path). */
@Getter
@Setter
@NoArgsConstructor
public class PlaceReviewBodyRequest {

    @NotNull(message = "rating is required")
    @Min(1)
    @Max(5)
    private Integer rating;

    private String comment;
}
