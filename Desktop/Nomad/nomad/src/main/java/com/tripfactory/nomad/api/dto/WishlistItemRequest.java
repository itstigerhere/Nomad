package com.tripfactory.nomad.api.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WishlistItemRequest {

    /** Package ID (e.g. "101") or city name (e.g. "Goa"). */
    private String targetId;
    /** PACKAGE or CITY */
    private String targetType;
    /** Optional: notify when price drops below this (INR). */
    private Double notifyPriceBelow;
    /** Optional: e.g. "weekend", "next-month". */
    private String notifyDates;
}
