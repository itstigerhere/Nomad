package com.tripfactory.nomad.api.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProStatusResponse {

    private boolean pro;
    private LocalDateTime validUntil;
}
