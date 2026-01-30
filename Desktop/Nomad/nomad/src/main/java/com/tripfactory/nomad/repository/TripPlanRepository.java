package com.tripfactory.nomad.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.tripfactory.nomad.domain.entity.TripPlan;
import com.tripfactory.nomad.domain.entity.TripRequest;

public interface TripPlanRepository extends JpaRepository<TripPlan, Long> {

    @Query("SELECT tp FROM TripPlan tp JOIN FETCH tp.place WHERE tp.tripRequest.id = :tripRequestId ORDER BY tp.dayNumber ASC, tp.startTime ASC")
    List<TripPlan> findByTripRequestIdOrderByDayNumberAscStartTimeAsc(@Param("tripRequestId") Long tripRequestId);
    
    void deleteByTripRequest(TripRequest tripRequest);
}