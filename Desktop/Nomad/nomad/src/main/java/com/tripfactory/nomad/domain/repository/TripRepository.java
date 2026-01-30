package com.tripfactory.nomad.domain.repository;

import com.tripfactory.nomad.domain.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    // Custom query methods if needed
}
