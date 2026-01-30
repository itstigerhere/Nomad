package com.tripfactory.nomad.api.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WishlistItemResponse {

    private Long id;
    private String targetId;
    private String targetType;
    private Double notifyPriceBelow;
    private String notifyDates;
    private LocalDateTime createdAt;
}
