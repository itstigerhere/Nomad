package com.tripfactory.nomad.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EnrollmentResponse {
    private boolean success;
    private String message;
}
