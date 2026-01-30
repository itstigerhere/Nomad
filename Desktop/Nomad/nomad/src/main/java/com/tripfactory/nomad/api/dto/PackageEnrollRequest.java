package com.tripfactory.nomad.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PackageEnrollRequest {

    @NotNull
    @DecimalMin("1.0")
    private BigDecimal amount;

    /** Optional trip start date (used for cancellation policy). */
    private LocalDate travelDate;
}
