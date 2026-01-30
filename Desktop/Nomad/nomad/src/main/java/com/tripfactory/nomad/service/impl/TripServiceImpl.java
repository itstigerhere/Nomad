package com.tripfactory.nomad.service.impl;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.tripfactory.nomad.api.dto.PlanPreviewRequest;
import com.tripfactory.nomad.api.dto.PlanPreviewResponse;
import com.tripfactory.nomad.api.dto.TripCreatePlacesRequest;
import com.tripfactory.nomad.api.dto.TripCreateRequest;
import com.tripfactory.nomad.api.dto.TripPlanItemResponse;
import com.tripfactory.nomad.api.dto.TripPlanOptionResponse;
import com.tripfactory.nomad.api.dto.TripResponse;
import com.tripfactory.nomad.domain.entity.Place;
import com.tripfactory.nomad.domain.entity.TripGroup;
import com.tripfactory.nomad.domain.entity.TripPlan;
import com.tripfactory.nomad.domain.entity.TripRequest;
import com.tripfactory.nomad.domain.entity.User;
import com.tripfactory.nomad.domain.enums.GroupStatus;
import com.tripfactory.nomad.domain.enums.TravelMode;
import com.tripfactory.nomad.domain.enums.TripStatus;
import com.tripfactory.nomad.domain.enums.WeekendType;
import com.tripfactory.nomad.repository.PlaceRepository;
import com.tripfactory.nomad.repository.TripGroupRepository;
import com.tripfactory.nomad.repository.TripPlanRepository;

import com.tripfactory.nomad.repository.TripRequestRepository;
import com.tripfactory.nomad.repository.UserRepository;
import com.tripfactory.nomad.service.NotificationService;
import com.tripfactory.nomad.service.TripService;

@Service
public class TripServiceImpl implements TripService {
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final TripGroupRepository tripGroupRepository;
    private final TripRequestRepository tripRequestRepository;
    private final TripPlanRepository tripPlanRepository;
    private final NotificationService notificationService;

    private static final BigDecimal BASE_COST_PER_PLACE = new BigDecimal("500");
    private static final BigDecimal PICKUP_COST = new BigDecimal("1000");

    public TripServiceImpl(UserRepository userRepository,
                          PlaceRepository placeRepository,
                          TripGroupRepository tripGroupRepository,
                          TripRequestRepository tripRequestRepository,
                          TripPlanRepository tripPlanRepository,
                          NotificationService notificationService) {
        this.userRepository = userRepository;
        this.placeRepository = placeRepository;
        this.tripGroupRepository = tripGroupRepository;
        this.tripRequestRepository = tripRequestRepository;
        this.tripPlanRepository = tripPlanRepository;
        this.notificationService = notificationService;
    }

    @Override
    public PlanPreviewResponse previewPlans(PlanPreviewRequest request) {
        if (request.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        }
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String city = request.getCity() != null ? request.getCity() : user.getCity();
        Double userLat = request.getUserLatitude() != null ? request.getUserLatitude() : user.getLatitude();
        Double userLon = request.getUserLongitude() != null ? request.getUserLongitude() : user.getLongitude();

        if (city == null || userLat == null || userLon == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City and user coordinates are required");
        }

        List<Place> places = placeRepository.findByCityIgnoreCase(city);
        if (places.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No places found for the city");
        }

        WeekendType weekendType = Objects.requireNonNullElse(request.getWeekendType(), WeekendType.ONE_DAY);
        int totalSlots = weekendType == WeekendType.TWO_DAY ? 6 : 4;
        int dayCount = weekendType == WeekendType.TWO_DAY ? 2 : 1;
        int perDay = (int) Math.ceil((double) totalSlots / dayCount);

        // Generate plan options (without saving to database)
        List<com.tripfactory.nomad.api.dto.TripPlanOptionResponse> planOptions = new ArrayList<>();
        
        // Create a temporary TripRequest for building plans (not saved)
        TripRequest tempTripRequest = new TripRequest();
        tempTripRequest.setUser(user);
        tempTripRequest.setCity(city);
        tempTripRequest.setWeekendType(weekendType);
        
        for (com.tripfactory.nomad.domain.enums.InterestType type : com.tripfactory.nomad.domain.enums.InterestType.values()) {
            List<Place> filtered = places.stream().filter(p -> p.getCategory() == type).collect(Collectors.toList());
            if (!filtered.isEmpty()) {
                List<Place> ranked = rankPlaces(filtered, userLat, userLon, type);
                List<TripPlan> plan = buildPlans(tempTripRequest, ranked, totalSlots, perDay);
                if (!plan.isEmpty()) {
                    planOptions.add(toPlanOptionResponse(type.name() + " Only", plan));
                }
            }
        }

        // Generate hybrid plan
        List<Place> hybrid = new ArrayList<>();
        int perInterest = Math.max(1, totalSlots / com.tripfactory.nomad.domain.enums.InterestType.values().length);
        for (com.tripfactory.nomad.domain.enums.InterestType type : com.tripfactory.nomad.domain.enums.InterestType.values()) {
            List<Place> filtered = places.stream().filter(p -> p.getCategory() == type).limit(perInterest).collect(Collectors.toList());
            hybrid.addAll(filtered);
        }
        if (!hybrid.isEmpty()) {
            List<Place> rankedHybrid = rankPlaces(hybrid, userLat, userLon, null);
            List<TripPlan> hybridPlan = buildPlans(tempTripRequest, rankedHybrid, totalSlots, perDay);
            if (!hybridPlan.isEmpty()) {
                planOptions.add(toPlanOptionResponse("Hybrid", hybridPlan));
            }
        }

        PlanPreviewResponse response = new PlanPreviewResponse();
        response.setCity(city);
        response.setPlanOptions(planOptions);
        return response;
    }

    @Override
    @Transactional
    @SuppressWarnings("null")
    public TripResponse createTrip(TripCreateRequest request) {
        // ...existing code...
        if (request.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        }
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Allow user to create trips for any city
        String city = request.getCity() != null ? request.getCity() : user.getCity();
        Double userLat = request.getUserLatitude() != null ? request.getUserLatitude() : user.getLatitude();
        Double userLon = request.getUserLongitude() != null ? request.getUserLongitude() : user.getLongitude();

        if (city == null || userLat == null || userLon == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "City and user coordinates are required");
        }

        TripRequest tripRequest = new TripRequest();
        tripRequest.setUser(user);
        tripRequest.setCity(city);
        tripRequest.setWeekendType(Objects.requireNonNullElse(request.getWeekendType(), WeekendType.ONE_DAY));
        tripRequest.setInterest(Objects.requireNonNullElse(request.getInterest(), user.getInterestType()));
        tripRequest.setTravelMode(Objects.requireNonNullElseGet(request.getTravelMode(),
            () -> com.tripfactory.nomad.domain.enums.TravelMode.valueOf(user.getTravelPreference().name())));
        tripRequest.setPickupRequired(Boolean.TRUE.equals(request.getPickupRequired()));
        tripRequest.setStatus(TripStatus.REQUESTED);
        
        // Calculate travel date: use provided date or default to next weekend
        LocalDate travelDate = request.getTravelDate();
        System.out.println("[DEBUG] createTrip - Request travelDate: " + travelDate);
        if (travelDate == null) {
            travelDate = calculateNextWeekendDate(tripRequest.getWeekendType());
            System.out.println("[DEBUG] createTrip - Calculated default travelDate: " + travelDate);
        }
        tripRequest.setTravelDate(travelDate);
        System.out.println("[DEBUG] createTrip - Setting travelDate on tripRequest: " + travelDate);

        if (tripRequest.getTravelMode() == TravelMode.GROUP) {
            TripGroup group = assignGroup(city, tripRequest.getInterest(), tripRequest.getWeekendType(), travelDate);
            tripRequest.setGroup(group);
        }

        TripRequest savedRequest = tripRequestRepository.save(tripRequest);

        List<Place> places = placeRepository.findByCityIgnoreCase(city);
        if (places.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No places found for the city");
        }

        int totalSlots = savedRequest.getWeekendType() == WeekendType.TWO_DAY ? 6 : 4;
        int dayCount = savedRequest.getWeekendType() == WeekendType.TWO_DAY ? 2 : 1;
        int perDay = (int) Math.ceil((double) totalSlots / dayCount);

        // Generate all plan options to find the selected one
        List<TripPlan> selectedPlanPlans = null;
        String selectedPlanType = request.getSelectedPlanType();
        
        if (selectedPlanType == null || selectedPlanType.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "selectedPlanType is required");
        }

        // Generate plans for each interest type
        for (com.tripfactory.nomad.domain.enums.InterestType type : com.tripfactory.nomad.domain.enums.InterestType.values()) {
            String planType = type.name() + " Only";
            List<Place> filtered = places.stream().filter(p -> p.getCategory() == type).collect(Collectors.toList());
            if (!filtered.isEmpty() && planType.equals(selectedPlanType)) {
                List<Place> ranked = rankPlaces(filtered, userLat, userLon, type);
                selectedPlanPlans = buildPlans(savedRequest, ranked, totalSlots, perDay);
                break;
            }
        }

        // If not found, check for hybrid plan
        if (selectedPlanPlans == null && "Hybrid".equals(selectedPlanType)) {
            List<Place> hybrid = new ArrayList<>();
            int perInterest = Math.max(1, totalSlots / com.tripfactory.nomad.domain.enums.InterestType.values().length);
            for (com.tripfactory.nomad.domain.enums.InterestType type : com.tripfactory.nomad.domain.enums.InterestType.values()) {
                List<Place> filtered = places.stream().filter(p -> p.getCategory() == type).limit(perInterest).collect(Collectors.toList());
                hybrid.addAll(filtered);
            }
            if (!hybrid.isEmpty()) {
                List<Place> rankedHybrid = rankPlaces(hybrid, userLat, userLon, null);
                selectedPlanPlans = buildPlans(savedRequest, rankedHybrid, totalSlots, perDay);
            }
        }

        if (selectedPlanPlans == null || selectedPlanPlans.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected plan type not found or has no places: " + selectedPlanType);
        }

        // Save ONLY the selected plan's TripPlans
        System.out.println("[DEBUG] Creating trip for city: " + city);
        System.out.println("[DEBUG] Selected plan type: " + selectedPlanType);
        System.out.println("[DEBUG] Places in selected plan: " + selectedPlanPlans.size());
        tripPlanRepository.saveAll(selectedPlanPlans);

        // Trip is confirmed only after payment; keep REQUESTED until then
        savedRequest.setStatus(TripStatus.REQUESTED);
        TripRequest updated = tripRequestRepository.save(savedRequest);
        System.out.println("[DEBUG] After final save - updated.getTravelDate(): " + updated.getTravelDate());

        // Re-fetch the saved TripPlans
        List<TripPlan> attachedPlans = tripPlanRepository.findByTripRequestIdOrderByDayNumberAscStartTimeAsc(updated.getId());
        
        // Build response with only the selected plan
        List<com.tripfactory.nomad.api.dto.TripPlanOptionResponse> attachedPlanOptions = new ArrayList<>();
        attachedPlanOptions.add(toPlanOptionResponse(selectedPlanType, attachedPlans));

        TripResponse response = new TripResponse();
        response.setTripRequestId(updated.getId());
        response.setUserId(updated.getUser().getId());
        response.setCity(updated.getCity());
        // shareToken removed
        if (updated.getGroup() != null) {
            response.setGroupId(updated.getGroup().getId());
            response.setGroupSize(tripRequestRepository.countByGroupId(updated.getGroup().getId()));
        }
        response.setStatus(updated.getStatus());
        response.setCreatedAt(updated.getCreatedAt());
        // Ensure travelDate is set (use from updated request or recalculate if still null)
        LocalDate responseTravelDate = updated.getTravelDate();
        if (responseTravelDate == null) {
            responseTravelDate = calculateNextWeekendDate(updated.getWeekendType());
        }
        response.setTravelDate(responseTravelDate);
        System.out.println("[DEBUG] TripResponse travelDate: " + responseTravelDate);
        response.setPlans(attachedPlanOptions);
        response.setEstimatedCost(estimateCost(totalSlots, Boolean.TRUE.equals(request.getPickupRequired())));

        notificationService.sendEmail(user.getEmail(), "NOMAD Trip Planned",
            "Your trip is planned for " + updated.getCity() + ". Trip ID: " + updated.getId());
        if (user.getPhoneNumber() != null && !user.getPhoneNumber().isBlank()) {
            notificationService.sendSms(user.getPhoneNumber(),
                "NOMAD: Trip planned for " + updated.getCity() + ". Trip ID: " + updated.getId());
        }
        return response;
    }

    @Override
    @Transactional
    @SuppressWarnings("null")
    public TripResponse createTripFromPlaces(TripCreatePlacesRequest request) {
        if (request.getUserId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
        }
        if (request.getPlaceIds() == null || request.getPlaceIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one place is required");
        }
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Place> places = placeRepository.findAllById(request.getPlaceIds());
        if (places.size() != request.getPlaceIds().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Some place IDs are invalid");
        }

        double userLat = request.getUserLatitude() != null ? request.getUserLatitude() : toPrimitive(user.getLatitude());
        double userLon = request.getUserLongitude() != null ? request.getUserLongitude() : toPrimitive(user.getLongitude());
        if (Math.abs(userLat) < 0.01 && Math.abs(userLon) < 0.01) {
            userLat = 12.9716;
            userLon = 77.5946;
        }

        List<Place> ordered = optimizeOrder(places, userLat, userLon);
        String city = request.getCity() != null && !request.getCity().isBlank()
                ? request.getCity()
                : (ordered.isEmpty() ? user.getCity() : ordered.get(0).getCity());
        if (city == null || city.isBlank()) {
            city = "Bengaluru";
        }

        LocalDate travelDate = request.getTravelDate();
        if (travelDate == null) {
            travelDate = calculateNextWeekendDate(WeekendType.ONE_DAY);
        }

        TripRequest tripRequest = new TripRequest();
        tripRequest.setUser(user);
        tripRequest.setCity(city);
        tripRequest.setWeekendType(WeekendType.ONE_DAY);
        com.tripfactory.nomad.domain.enums.InterestType firstCategory = ordered.isEmpty() ? null : ordered.get(0).getCategory();
        tripRequest.setInterest(firstCategory != null ? firstCategory : com.tripfactory.nomad.domain.enums.InterestType.CULTURE);
        tripRequest.setTravelMode(TravelMode.SOLO);
        tripRequest.setPickupRequired(false);
        // Trip is confirmed only after payment; keep REQUESTED until then
        tripRequest.setStatus(TripStatus.REQUESTED);
        tripRequest.setTravelDate(travelDate);

        TripRequest savedRequest = tripRequestRepository.save(tripRequest);

        LocalTime start = LocalTime.of(9, 0);
        Place previous = null;
        List<TripPlan> plans = new ArrayList<>();
        for (Place place : ordered) {
            TripPlan plan = new TripPlan();
            plan.setTripRequest(savedRequest);
            plan.setDayNumber(1);
            plan.setPlace(place);
            plan.setStartTime(start);
            plan.setEndTime(start.plusHours(2));
            double dist = previous == null
                    ? haversineKm(userLat, userLon, toPrimitive(place.getLatitude()), toPrimitive(place.getLongitude()))
                    : haversineKm(toPrimitive(previous.getLatitude()), toPrimitive(previous.getLongitude()),
                            toPrimitive(place.getLatitude()), toPrimitive(place.getLongitude()));
            plan.setDistanceFromPrevious(dist);
            plans.add(plan);
            start = start.plusHours(2);
            previous = place;
        }
        tripPlanRepository.saveAll(plans);

        BigDecimal cost = estimateCostForCustomTrip(ordered.size());
        savedRequest.setEstimatedCost(cost != null ? cost.doubleValue() : null);
        tripRequestRepository.save(savedRequest);

        List<TripPlan> attachedPlans = tripPlanRepository.findByTripRequestIdOrderByDayNumberAscStartTimeAsc(savedRequest.getId());
        TripResponse response = toResponse(savedRequest, attachedPlans);
        response.setUserLatitude(user.getLatitude());
        response.setUserLongitude(user.getLongitude());
        response.setEstimatedCost(cost);
        response.setPlans(java.util.Collections.singletonList(toPlanOptionResponse("Custom", attachedPlans)));

        notificationService.sendEmail(user.getEmail(), "NOMAD Trip Created",
                "Your custom trip is ready. Trip ID: " + savedRequest.getId() + ", Cost: ₹" + cost);
        return response;
    }

    /** Nearest-neighbour order from (userLat, userLon) through all places. */
    private List<Place> optimizeOrder(List<Place> places, double startLat, double startLon) {
        if (places.isEmpty()) return List.of();
        List<Place> remaining = new ArrayList<>(places);
        List<Place> ordered = new ArrayList<>();
        final double[] current = { startLat, startLon };
        while (!remaining.isEmpty()) {
            Place next = remaining.stream()
                    .min(Comparator.comparing(p -> haversineKm(current[0], current[1], toPrimitive(p.getLatitude()), toPrimitive(p.getLongitude()))))
                    .orElseThrow();
            ordered.add(next);
            remaining.remove(next);
            current[0] = toPrimitive(next.getLatitude());
            current[1] = toPrimitive(next.getLongitude());
        }
        return ordered;
    }

    /** Random-ish cost for custom trip: base + per-place, in a reasonable range. */
    private BigDecimal estimateCostForCustomTrip(int placeCount) {
        int base = 1500;
        int perPlace = 400;
        int random = (int) (Math.random() * 800);
        return BigDecimal.valueOf(base + perPlace * placeCount + random);
    }

    private com.tripfactory.nomad.api.dto.TripPlanOptionResponse toPlanOptionResponse(String type, List<TripPlan> plans) {
        com.tripfactory.nomad.api.dto.TripPlanOptionResponse option = new com.tripfactory.nomad.api.dto.TripPlanOptionResponse();
        option.setType(type);
        List<TripPlanItemResponse> items = plans.stream().map(plan -> {
            Place place = plan.getPlace();
            TripPlanItemResponse item = new TripPlanItemResponse();
            item.setDayNumber(plan.getDayNumber());
            item.setPlaceId(place.getId());
            item.setPlaceName(place.getName());
            item.setStartTime(plan.getStartTime());
            item.setEndTime(plan.getEndTime());
            item.setDistanceFromPrevious(plan.getDistanceFromPrevious());
            item.setLatitude(place.getLatitude());
            item.setLongitude(place.getLongitude());
            // Include full place data
            item.setCity(place.getCity());
            item.setCategory(place.getCategory());
            item.setRating(place.getRating());
            return item;
        }).collect(Collectors.toList());
        option.setPlaces(items);
        return option;
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public TripResponse getTrip(Long tripRequestId) {
        TripRequest tripRequest = tripRequestRepository.findById(tripRequestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        // Access group so lazy association is loaded within this transaction (needed for groupId/groupSize in response)
        if (tripRequest.getGroup() != null) {
            tripRequest.getGroup().getId();
        }
        List<TripPlan> plans = tripPlanRepository.findByTripRequestIdOrderByDayNumberAscStartTimeAsc(tripRequestId);
        TripResponse response = toResponse(tripRequest, plans);
        if (tripRequest.getEstimatedCost() != null) {
            response.setEstimatedCost(BigDecimal.valueOf(tripRequest.getEstimatedCost()));
        } else {
            response.setEstimatedCost(estimateCost(plans.size(), Boolean.TRUE.equals(tripRequest.getPickupRequired())));
        }
        return response;
    }

    @Override
    public List<TripResponse> getTripsByUser(Long userId) {
        return tripRequestRepository.findByUserId(userId).stream()
                .map(tripRequest -> {
                    List<TripPlan> plans = tripPlanRepository
                            .findByTripRequestIdOrderByDayNumberAscStartTimeAsc(tripRequest.getId());
                        TripResponse response = toResponse(tripRequest, plans);
                        response.setEstimatedCost(
                            estimateCost(plans.size(), Boolean.TRUE.equals(tripRequest.getPickupRequired())));
                        return response;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TripResponse cancelTrip(Long tripRequestId) {
        TripRequest tripRequest = tripRequestRepository.findById(tripRequestId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trip not found"));
        TripStatus status = tripRequest.getStatus();
        if (status != TripStatus.REQUESTED && status != TripStatus.PAYMENT_PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Trip can only be cancelled when status is REQUESTED or PAYMENT_PENDING. Current: " + status);
        }
        tripRequest.setStatus(TripStatus.CANCELLED);
        tripRequestRepository.save(tripRequest);
        return getTrip(tripRequestId);
    }

    private List<Place> rankPlaces(List<Place> places, double userLat, double userLon,
            com.tripfactory.nomad.domain.enums.InterestType interest) {
        return places.stream()
            .sorted(Comparator
                .comparing((Place p) -> interest != null && interest == p.getCategory() ? 0 : 1)
                .thenComparing(p -> haversineKm(userLat, userLon, p.getLatitude(), p.getLongitude()))
                .thenComparing(Place::getRating, Comparator.reverseOrder()))
            .collect(Collectors.toList());
    }

    private List<TripPlan> buildPlans(TripRequest tripRequest, List<Place> rankedPlaces, int totalSlots, int perDay) {
        List<TripPlan> plans = new ArrayList<>();
        List<Place> candidates = rankedPlaces.subList(0, Math.min(totalSlots, rankedPlaces.size()));
        List<Place> unassigned = new ArrayList<>(candidates);

        int dayCount = (int) Math.ceil((double) totalSlots / perDay);
        for (int day = 1; day <= dayCount; day++) {
            List<Place> dayPlaces = new ArrayList<>();
            double currentLat = tripRequest.getUser().getLatitude();
            double currentLon = tripRequest.getUser().getLongitude();

            while (dayPlaces.size() < perDay && !unassigned.isEmpty()) {
                Place next = findNearestPlace(currentLat, currentLon, unassigned);
                dayPlaces.add(next);
                unassigned.remove(next);
                currentLat = next.getLatitude();
                currentLon = next.getLongitude();
            }

            dayPlaces = reorderForTimeWindows(dayPlaces);

            LocalTime start = LocalTime.of(9, 0);
            Place previous = null;
            for (Place place : dayPlaces) {
                TripPlan plan = new TripPlan();
                plan.setTripRequest(tripRequest);
                plan.setDayNumber(day);
                plan.setPlace(place);
                plan.setStartTime(start);
                plan.setEndTime(start.plusHours(2));
                double distance = previous == null
                    ? haversineKm(tripRequest.getUser().getLatitude(),
                        tripRequest.getUser().getLongitude(),
                        place.getLatitude(), place.getLongitude())
                    : haversineKm(previous.getLatitude(), previous.getLongitude(),
                        place.getLatitude(), place.getLongitude());
                plan.setDistanceFromPrevious(distance);
                plans.add(plan);
                start = start.plusHours(2);
                previous = place;
            }
        }
        return plans;
    }

    private Place findNearestPlace(double currentLat, double currentLon, List<Place> places) {
        return places.stream()
            .min(Comparator.comparing(place -> haversineKm(currentLat, currentLon,
                toPrimitive(place.getLatitude()), toPrimitive(place.getLongitude()))))
            .orElseThrow();
    }

    // Utility to handle Double (nullable) to double (primitive)
    private static double toPrimitive(Double value) {
        return value != null ? value : 0.0;
    }

    // Simple haversine formula implementation (replace GeoUtils)
    private static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private List<Place> reorderForTimeWindows(List<Place> places) {
        if (places.size() <= 1) {
            return places;
        }
        int nightlifeIndex = -1;
        for (int i = 0; i < places.size(); i++) {
            if (places.get(i).getCategory() == com.tripfactory.nomad.domain.enums.InterestType.NIGHTLIFE) {
                nightlifeIndex = i;
                break;
            }
        }
        if (nightlifeIndex >= 0 && nightlifeIndex != places.size() - 1) {
            Place nightlife = places.remove(nightlifeIndex);
            places.add(nightlife);
        }
        return places;
    }

    private TripResponse toResponse(TripRequest tripRequest, List<TripPlan> plans) {
        TripResponse response = new TripResponse();
        response.setTripRequestId(tripRequest.getId());
        response.setUserId(tripRequest.getUser().getId());
        response.setCity(tripRequest.getCity());
        // Use travelDate from tripRequest, or calculate default if null (for existing trips)
        LocalDate travelDate = tripRequest.getTravelDate();
        if (travelDate == null) {
            travelDate = calculateNextWeekendDate(tripRequest.getWeekendType());
            System.out.println("[DEBUG] Calculated default travelDate for trip " + tripRequest.getId() + ": " + travelDate);
        } else {
            System.out.println("[DEBUG] Using existing travelDate for trip " + tripRequest.getId() + ": " + travelDate);
        }
        response.setTravelDate(travelDate);
        // shareToken removed
        if (tripRequest.getGroup() != null) {
            response.setGroupId(tripRequest.getGroup().getId());
            response.setGroupSize(tripRequestRepository.countByGroupId(tripRequest.getGroup().getId()));
        }
        response.setStatus(tripRequest.getStatus());
        response.setCreatedAt(tripRequest.getCreatedAt());
        // Set user initial location for frontend marker
        User user = tripRequest.getUser();
        response.setUserLatitude(user != null ? user.getLatitude() : null);
        response.setUserLongitude(user != null ? user.getLongitude() : null);

        List<TripPlanItemResponse> planItems = plans.stream().map(plan -> {
            Place place = plan.getPlace();
            TripPlanItemResponse item = new TripPlanItemResponse();
            item.setDayNumber(plan.getDayNumber());
            item.setPlaceId(place.getId());
            item.setPlaceName(place.getName());
            item.setStartTime(plan.getStartTime());
            item.setEndTime(plan.getEndTime());
            item.setDistanceFromPrevious(plan.getDistanceFromPrevious());
            item.setLatitude(place.getLatitude());
            item.setLongitude(place.getLongitude());
            // Include full place data
            item.setCity(place.getCity());
            item.setCategory(place.getCategory());
            item.setRating(place.getRating());
            return item;
        }).collect(Collectors.toList());
        TripPlanOptionResponse option = new TripPlanOptionResponse();
        option.setType("Default");
        option.setPlaces(planItems);
        response.setPlans(java.util.Collections.singletonList(option));
        return response;
    }

    private BigDecimal estimateCost(int totalSlots, boolean pickupRequired) {
        BigDecimal total = BASE_COST_PER_PLACE.multiply(BigDecimal.valueOf(totalSlots));
        if (pickupRequired) {
            total = total.add(PICKUP_COST);
        }
        return total;
    }

    /**
     * Calculates the next weekend date based on weekend type.
     * For ONE_DAY: next Saturday
     * For TWO_DAY: next Saturday (start of weekend)
     */
    private LocalDate calculateNextWeekendDate(WeekendType weekendType) {
        LocalDate today = LocalDate.now();
        DayOfWeek dayOfWeek = today.getDayOfWeek();
        
        // Calculate days until next Saturday
        int daysUntilSaturday = DayOfWeek.SATURDAY.getValue() - dayOfWeek.getValue();
        if (daysUntilSaturday <= 0) {
            daysUntilSaturday += 7; // Next week's Saturday
        }
        
        return today.plusDays(daysUntilSaturday);
    }

    private TripGroup assignGroup(String city, com.tripfactory.nomad.domain.enums.InterestType interest,
            WeekendType weekendType, LocalDate travelDate) {
        // Only assign to group if travelDate is provided
        if (travelDate == null) {
            return null;
        }
        
        TripGroup group = tripGroupRepository
                .findFirstByCityIgnoreCaseAndInterestAndWeekendTypeAndTravelDateAndStatusOrderByCreatedAtAsc(
                        city, interest, weekendType, travelDate, GroupStatus.OPEN)
                .orElseGet(() -> {
                    TripGroup created = new TripGroup();
                    created.setCity(city);
                    created.setInterest(interest);
                    created.setWeekendType(weekendType);
                    created.setTravelDate(travelDate);
                    created.setStatus(GroupStatus.OPEN);
                    return tripGroupRepository.save(created);
                });

        long size = tripRequestRepository.countByGroupId(group.getId());
        if (size >= 6) {
            group.setStatus(GroupStatus.CLOSED);
            return tripGroupRepository.save(group);
        }
        if (size + 1 >= 4) {
            group.setStatus(GroupStatus.READY);
        }
        return tripGroupRepository.save(group);
    }
}