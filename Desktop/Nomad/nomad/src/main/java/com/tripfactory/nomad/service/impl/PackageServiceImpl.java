package com.tripfactory.nomad.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.tripfactory.nomad.api.dto.PackageDetailResponse;
import com.tripfactory.nomad.api.dto.PackageSummaryResponse;
import com.tripfactory.nomad.api.dto.PlaceResponse;
import com.tripfactory.nomad.domain.entity.Place;
import com.tripfactory.nomad.domain.entity.SponsoredPackage;
import com.tripfactory.nomad.repository.PlaceRepository;
import com.tripfactory.nomad.repository.SponsoredPackageRepository;
import com.tripfactory.nomad.service.PackageService;

import jakarta.annotation.PostConstruct;

@Service
public class PackageServiceImpl implements PackageService {

    private final PlaceRepository placeRepository;
    private final SponsoredPackageRepository sponsoredPackageRepository;
    private final AtomicLong idGenerator = new AtomicLong(100);
    private final List<PackageSummaryResponse> packages = new ArrayList<>();

    public PackageServiceImpl(PlaceRepository placeRepository, SponsoredPackageRepository sponsoredPackageRepository) {
        this.placeRepository = placeRepository;
        this.sponsoredPackageRepository = sponsoredPackageRepository;
    }

    @PostConstruct
    public void init() {
        List<Place> bengaluru = placeRepository.findByCityIgnoreCase("Bengaluru");
        List<Place> mumbai = placeRepository.findByCityIgnoreCase("Mumbai");
        List<Place> delhi = placeRepository.findByCityIgnoreCase("Delhi");
        List<Place> hyderabad = placeRepository.findByCityIgnoreCase("Hyderabad");
        List<Place> chennai = placeRepository.findByCityIgnoreCase("Chennai");
        List<Place> kolkata = placeRepository.findByCityIgnoreCase("Kolkata");
        List<Place> pune = placeRepository.findByCityIgnoreCase("Pune");
        List<Place> jaipur = placeRepository.findByCityIgnoreCase("Jaipur");
        List<Place> goa = placeRepository.findByCityIgnoreCase("Goa");

        packages.add(buildSummary("Weekend in Bengaluru", "A curated 2-day Bengaluru weekend with food, parks and nightlife.", new BigDecimal("4999"), bengaluru, "https://picsum.photos/seed/bengaluru-weekend/400/240"));
        packages.add(buildSummary("Mumbai Shoreline", "Explore beaches, bazaars and local cuisine in Mumbai.", new BigDecimal("5999"), mumbai, "https://picsum.photos/seed/mumbai-shoreline/400/240"));
        packages.add(buildSummary("Delhi Heritage Trip", "Historical walks, markets and cultural experiences in Delhi.", new BigDecimal("5499"), delhi, "https://picsum.photos/seed/delhi-heritage/400/240"));
        packages.add(buildSummary("Hyderabad City Tour", "Charminar, Golconda Fort, biryani trails and bazaars in the City of Pearls.", new BigDecimal("4699"), hyderabad, "https://picsum.photos/seed/hyderabad-city/400/240"));
        packages.add(buildSummary("Chennai Coastal Escape", "Marina Beach, temples, museums and coastal food in Chennai.", new BigDecimal("5299"), chennai, "https://picsum.photos/seed/chennai-coastal/400/240"));
        packages.add(buildSummary("Kolkata Culture Trail", "Victoria Memorial, Park Street, ghats and Bengali cuisine in Kolkata.", new BigDecimal("4899"), kolkata, "https://picsum.photos/seed/kolkata-culture/400/240"));
        packages.add(buildSummary("Pune Heritage & Hills", "Forts, Aga Khan Palace, Koregaon Park and hill views in Pune.", new BigDecimal("4499"), pune, "https://picsum.photos/seed/pune-heritage/400/240"));
        packages.add(buildSummary("Jaipur Royal Experience", "Hawa Mahal, Amer Fort, City Palace and Rajasthani culture in the Pink City.", new BigDecimal("5699"), jaipur, "https://picsum.photos/seed/jaipur-royal/400/240"));
        packages.add(buildSummary("Goa Beach & Heritage", "Beaches, churches, Dudhsagar Falls and Goan nightlife.", new BigDecimal("6499"), goa, "https://picsum.photos/seed/goa-beach/400/240"));
    }

    private PackageSummaryResponse buildSummary(String name, String desc, BigDecimal price, List<Place> fromPlaces, String imageUrl) {
        PackageSummaryResponse s = new PackageSummaryResponse();
        s.setId(idGenerator.getAndIncrement());
        s.setName(name);
        s.setShortDescription(desc);
        s.setPrice(price);
        s.setImageUrl(imageUrl);
        return s;
    }

    @Override
    public List<PackageSummaryResponse> getHomepagePackages() {
        Set<Long> sponsoredIds = sponsoredPackageRepository.findAllByOrderByIdAsc().stream()
                .map(SponsoredPackage::getPackageId).collect(Collectors.toSet());
        List<PackageSummaryResponse> result = packages.stream().limit(3)
                .map(p -> withSponsored(p, sponsoredIds)).sorted(sponsoredFirst()).collect(Collectors.toList());
        return result;
    }

    @Override
    public List<PackageSummaryResponse> getAllPackages() {
        return getPackagesSearch(null, null, null, null);
    }

    @Override
    public List<PackageSummaryResponse> getPackagesSearch(String city, BigDecimal minPrice, BigDecimal maxPrice, String sortBy) {
        Set<Long> sponsoredIds = sponsoredPackageRepository.findAllByOrderByIdAsc().stream()
                .map(SponsoredPackage::getPackageId).collect(Collectors.toSet());
        Stream<PackageSummaryResponse> stream = packages.stream().map(p -> withSponsored(p, sponsoredIds));
        String c = city != null && !city.isBlank() ? city.trim().toLowerCase() : null;
        if (c != null) {
            stream = stream.filter(p -> p.getName() != null && p.getName().toLowerCase().contains(c));
        }
        if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) > 0) {
            stream = stream.filter(p -> p.getPrice() != null && p.getPrice().compareTo(minPrice) >= 0);
        }
        if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) > 0) {
            stream = stream.filter(p -> p.getPrice() != null && p.getPrice().compareTo(maxPrice) <= 0);
        }
        Comparator<PackageSummaryResponse> cmp = sponsoredFirst();
        if (sortBy != null && !sortBy.isBlank()) {
            switch (sortBy.toLowerCase()) {
                case "price_asc" -> cmp = Comparator.nullsLast(Comparator.comparing(PackageSummaryResponse::getPrice)).thenComparing(PackageSummaryResponse::getId);
                case "price_desc" -> cmp = Comparator.nullsLast(Comparator.comparing(PackageSummaryResponse::getPrice, Comparator.reverseOrder())).thenComparing(PackageSummaryResponse::getId);
                case "name" -> cmp = Comparator.nullsLast(Comparator.comparing((PackageSummaryResponse p) -> p.getName() != null ? p.getName().toLowerCase() : "")).thenComparing(PackageSummaryResponse::getId);
                default -> { }
            }
        }
        return stream.sorted(cmp).collect(Collectors.toList());
    }

    private PackageSummaryResponse withSponsored(PackageSummaryResponse p, Set<Long> sponsoredIds) {
        PackageSummaryResponse copy = new PackageSummaryResponse();
        copy.setId(p.getId());
        copy.setName(p.getName());
        copy.setShortDescription(p.getShortDescription());
        copy.setPrice(p.getPrice());
        copy.setImageUrl(p.getImageUrl());
        copy.setSponsored(sponsoredIds.contains(p.getId()));
        return copy;
    }

    private Comparator<PackageSummaryResponse> sponsoredFirst() {
        return Comparator.<PackageSummaryResponse, Boolean>comparing(p -> !Boolean.TRUE.equals(p.getSponsored()))
                .thenComparing(PackageSummaryResponse::getId);
    }

    @Override
    public PackageDetailResponse getPackageById(Long id) {
        Set<Long> sponsoredIds = sponsoredPackageRepository.findAllByOrderByIdAsc().stream()
                .map(SponsoredPackage::getPackageId).collect(Collectors.toSet());
        PackageSummaryResponse summary = packages.stream()
                .filter(p -> p.getId().equals(id)).findFirst().orElse(null);
        if (summary == null) {
            return null;
        }

        PackageDetailResponse detail = new PackageDetailResponse();
        detail.setId(summary.getId());
        detail.setName(summary.getName());
        detail.setDescription(summary.getShortDescription());
        detail.setPrice(summary.getPrice());
        detail.setImageUrl(summary.getImageUrl());
        detail.setSponsored(sponsoredIds.contains(id));

        // Attach places from the package's city
        String name = summary.getName().toLowerCase();
        String city = "Bengaluru";
        if (name.contains("mumbai")) city = "Mumbai";
        else if (name.contains("delhi")) city = "Delhi";
        else if (name.contains("hyderabad")) city = "Hyderabad";
        else if (name.contains("chennai")) city = "Chennai";
        else if (name.contains("kolkata")) city = "Kolkata";
        else if (name.contains("pune")) city = "Pune";
        else if (name.contains("jaipur")) city = "Jaipur";
        else if (name.contains("goa")) city = "Goa";
        List<Place> places = placeRepository.findByCityIgnoreCase(city);
        if (places == null || places.isEmpty()) {
            places = placeRepository.findAll();
        }

        List<PlaceResponse> placeResponses = places.stream().limit(5).map(p -> {
            PlaceResponse pr = new PlaceResponse();
            pr.setId(p.getId());
            pr.setName(p.getName());
            pr.setCity(p.getCity());
            pr.setLatitude(p.getLatitude());
            pr.setLongitude(p.getLongitude());
            pr.setCategory(p.getCategory());
            pr.setRating(p.getRating());
            return pr;
        }).collect(Collectors.toList());

        detail.setPlaces(placeResponses);
        detail.setActivities(List.of("Guided tour", "Local food tasting", "Photo stops"));

        double avg = placeResponses.stream().mapToDouble(p -> p.getRating() == null ? 0.0 : p.getRating()).average().orElse(0.0);
        detail.setAverageRating(avg);

        return detail;
    }
}
