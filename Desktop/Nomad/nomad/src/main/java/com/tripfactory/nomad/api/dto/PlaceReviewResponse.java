package com.tripfactory.nomad.api.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PlaceReviewResponse {

    private Long id;
    private Long placeId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private String reviewerEmail;
}
