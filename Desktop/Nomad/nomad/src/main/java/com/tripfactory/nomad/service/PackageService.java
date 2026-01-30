package com.tripfactory.nomad.service;

import java.math.BigDecimal;
import java.util.List;

import com.tripfactory.nomad.api.dto.PackageDetailResponse;
import com.tripfactory.nomad.api.dto.PackageSummaryResponse;

public interface PackageService {
    List<PackageSummaryResponse> getHomepagePackages();
    List<PackageSummaryResponse> getAllPackages();
    /** sortBy: price_asc, price_desc, name, default=sponsored_first */
    List<PackageSummaryResponse> getPackagesSearch(String city, BigDecimal minPrice, BigDecimal maxPrice, String sortBy);
    PackageDetailResponse getPackageById(Long id);
}
