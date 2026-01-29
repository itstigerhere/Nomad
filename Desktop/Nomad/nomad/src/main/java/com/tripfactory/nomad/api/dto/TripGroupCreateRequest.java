package com.tripfactory.nomad.api.dto;

import com.tripfactory.nomad.domain.enums.InterestType;
import com.tripfactory.nomad.domain.enums.WeekendType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TripGroupCreateRequest {
    private String city;
    private InterestType interest;
    private WeekendType weekendType;
}
