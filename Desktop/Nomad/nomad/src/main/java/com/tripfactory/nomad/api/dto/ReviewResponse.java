package com.tripfactory.nomad.api.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReviewResponse {

    private Long id;
    private Long tripRequestId;
    private Integer rating;
    private String comment;
    private Boolean verified;
    private LocalDateTime createdAt;
    private String reviewerEmail;
}