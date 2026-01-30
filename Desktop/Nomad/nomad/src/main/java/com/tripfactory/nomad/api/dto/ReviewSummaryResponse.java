package com.tripfactory.nomad.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReviewSummaryResponse {

    private Double averageRating;
    private int reviewCount;
    private boolean canReview;
    private boolean alreadyReviewed;
}
