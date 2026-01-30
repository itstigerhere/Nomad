package com.tripfactory.nomad.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripfactory.nomad.domain.entity.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    Optional<Enrollment> findByUserIdAndTripRequestId(Long userId, Long tripRequestId);
    long countByTripRequestId(Long tripRequestId);
    long countByPackageId(Long packageId); // Count enrollments for a specific package
}
