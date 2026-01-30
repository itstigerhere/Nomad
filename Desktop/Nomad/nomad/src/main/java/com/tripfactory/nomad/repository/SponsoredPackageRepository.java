package com.tripfactory.nomad.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripfactory.nomad.domain.entity.SponsoredPackage;

public interface SponsoredPackageRepository extends JpaRepository<SponsoredPackage, Long> {

    List<SponsoredPackage> findAllByOrderByIdAsc();

    boolean existsByPackageId(Long packageId);

    void deleteByPackageId(Long packageId);
}
