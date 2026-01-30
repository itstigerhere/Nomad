package com.tripfactory.nomad.config;

import java.util.List;
import org.springframework.lang.NonNull;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.tripfactory.nomad.domain.entity.Place;
import com.tripfactory.nomad.domain.entity.Vehicle;
import com.tripfactory.nomad.domain.enums.AvailabilityStatus;
import com.tripfactory.nomad.domain.enums.InterestType;
import com.tripfactory.nomad.domain.enums.VehicleType;
import com.tripfactory.nomad.repository.PlaceRepository;
import com.tripfactory.nomad.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SeedDataRunner implements CommandLineRunner {

    @Value("${nomad.seed-data:false}")
    private boolean seedData;

    private final PlaceRepository placeRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    public void run(String... args) {
        if (!seedData) {
            return;
        }

        if (placeRepository.count() == 0) {
            placeRepository.saveAll(buildPlaces());
        }

        if (vehicleRepository.count() == 0) {
            vehicleRepository.saveAll(buildVehicles());
        }
    }

    private List<Place> buildPlaces() {
        return List.of(
                // Bengaluru
                createPlace("Lalbagh Botanical Garden", "Bengaluru", 12.9507, 77.5848, InterestType.NATURE, 4.6),
                createPlace("Cubbon Park", "Bengaluru", 12.9763, 77.5929, InterestType.NATURE, 4.5),
                createPlace("Bangalore Palace", "Bengaluru", 12.9987, 77.5921, InterestType.CULTURE, 4.3),
                createPlace("VV Puram Food Street", "Bengaluru", 12.9453, 77.5741, InterestType.FOOD, 4.4),
                createPlace("ISKCON Temple", "Bengaluru", 13.0099, 77.5511, InterestType.CULTURE, 4.5),
                createPlace("Ulsoor Lake", "Bengaluru", 12.9836, 77.6191, InterestType.RELAXATION, 4.2),
                createPlace("Nandi Hills", "Bengaluru", 13.3701, 77.6870, InterestType.NATURE, 4.5),
                createPlace("Commercial Street", "Bengaluru", 12.9762, 77.6033, InterestType.SHOPPING, 4.2),

                // Mumbai
                createPlace("Marine Drive", "Mumbai", 18.9440, 72.8238, InterestType.RELAXATION, 4.7),
                createPlace("Gateway of India", "Mumbai", 18.9218, 72.8347, InterestType.CULTURE, 4.6),
                createPlace("Colaba Causeway", "Mumbai", 18.9220, 72.8327, InterestType.SHOPPING, 4.4),
                createPlace("Chowpatty Beach", "Mumbai", 18.9547, 72.8133, InterestType.NATURE, 4.2),
                createPlace("Sanjay Gandhi National Park", "Mumbai", 19.2147, 72.9106, InterestType.NATURE, 4.5),
                createPlace("Bandra Bandstand", "Mumbai", 19.0466, 72.8205, InterestType.NIGHTLIFE, 4.3),
                createPlace("Elephanta Caves", "Mumbai", 18.9632, 72.9314, InterestType.CULTURE, 4.6),
                createPlace("Crawford Market", "Mumbai", 18.9497, 72.8342, InterestType.SHOPPING, 4.1),

                // Delhi
                createPlace("India Gate", "Delhi", 28.6129, 77.2295, InterestType.CULTURE, 4.6),
                createPlace("Qutub Minar", "Delhi", 28.5244, 77.1855, InterestType.CULTURE, 4.5),
                createPlace("Hauz Khas Village", "Delhi", 28.5530, 77.1949, InterestType.NIGHTLIFE, 4.3),
                createPlace("Lodhi Garden", "Delhi", 28.5933, 77.2197, InterestType.NATURE, 4.4),
                createPlace("Chandni Chowk", "Delhi", 28.6506, 77.2303, InterestType.FOOD, 4.2),
                createPlace("Akshardham", "Delhi", 28.6127, 77.2773, InterestType.CULTURE, 4.6),
                createPlace("Red Fort", "Delhi", 28.6562, 77.2410, InterestType.CULTURE, 4.7),
                createPlace("Connaught Place", "Delhi", 28.6304, 77.2177, InterestType.SHOPPING, 4.3),

                // Hyderabad
                createPlace("Charminar", "Hyderabad", 17.3616, 78.4747, InterestType.CULTURE, 4.7),
                createPlace("Golconda Fort", "Hyderabad", 17.3833, 78.4011, InterestType.CULTURE, 4.6),
                createPlace("Ramoji Film City", "Hyderabad", 17.2236, 78.6619, InterestType.ADVENTURE, 4.5),
                createPlace("Hussain Sagar Lake", "Hyderabad", 17.4239, 78.4739, InterestType.RELAXATION, 4.4),
                createPlace("Salar Jung Museum", "Hyderabad", 17.3714, 78.4804, InterestType.CULTURE, 4.5),
                createPlace("Laad Bazaar", "Hyderabad", 17.3589, 78.4736, InterestType.SHOPPING, 4.3),
                createPlace("Paradise Biryani", "Hyderabad", 17.4484, 78.3908, InterestType.FOOD, 4.6),

                // Chennai
                createPlace("Marina Beach", "Chennai", 13.0500, 80.2827, InterestType.RELAXATION, 4.6),
                createPlace("Kapaleeshwarar Temple", "Chennai", 13.0330, 80.2674, InterestType.CULTURE, 4.5),
                createPlace("Government Museum", "Chennai", 13.0696, 80.2406, InterestType.CULTURE, 4.3),
                createPlace("Covelong Beach", "Chennai", 12.7919, 80.2508, InterestType.NATURE, 4.4),
                createPlace("T Nagar", "Chennai", 13.0418, 80.2341, InterestType.SHOPPING, 4.2),
                createPlace("Mylapore", "Chennai", 13.0339, 80.2618, InterestType.CULTURE, 4.4),
                createPlace("ECR Food Street", "Chennai", 12.9698, 80.2492, InterestType.FOOD, 4.3),

                // Kolkata
                createPlace("Victoria Memorial", "Kolkata", 22.5448, 88.3426, InterestType.CULTURE, 4.7),
                createPlace("Howrah Bridge", "Kolkata", 22.5950, 88.3470, InterestType.CULTURE, 4.6),
                createPlace("Park Street", "Kolkata", 22.5535, 88.3510, InterestType.NIGHTLIFE, 4.4),
                createPlace("New Market", "Kolkata", 22.5575, 88.3512, InterestType.SHOPPING, 4.2),
                createPlace("Indian Museum", "Kolkata", 22.5580, 88.3510, InterestType.CULTURE, 4.4),
                createPlace("Princep Ghat", "Kolkata", 22.5545, 88.3372, InterestType.RELAXATION, 4.5),
                createPlace("College Street", "Kolkata", 22.5736, 88.3639, InterestType.CULTURE, 4.3),

                // Pune
                createPlace("Shaniwar Wada", "Pune", 18.5196, 73.8554, InterestType.CULTURE, 4.5),
                createPlace("Sinhagad Fort", "Pune", 18.3667, 73.7500, InterestType.ADVENTURE, 4.6),
                createPlace("Aga Khan Palace", "Pune", 18.5522, 73.9065, InterestType.CULTURE, 4.4),
                createPlace("Koregaon Park", "Pune", 18.5314, 73.9046, InterestType.NIGHTLIFE, 4.3),
                createPlace("FC Road", "Pune", 18.5074, 73.8077, InterestType.FOOD, 4.4),
                createPlace("Osho Teerth Park", "Pune", 18.5317, 73.8552, InterestType.RELAXATION, 4.3),
                createPlace("MG Road", "Pune", 18.5082, 73.8106, InterestType.SHOPPING, 4.2),

                // Jaipur
                createPlace("Hawa Mahal", "Jaipur", 26.9239, 75.8267, InterestType.CULTURE, 4.7),
                createPlace("Amer Fort", "Jaipur", 26.9855, 75.8513, InterestType.CULTURE, 4.8),
                createPlace("City Palace", "Jaipur", 26.9258, 75.8236, InterestType.CULTURE, 4.6),
                createPlace("Jantar Mantar", "Jaipur", 26.9247, 75.8246, InterestType.CULTURE, 4.5),
                createPlace("Johari Bazaar", "Jaipur", 26.9196, 75.8250, InterestType.SHOPPING, 4.4),
                createPlace("Nahargarh Fort", "Jaipur", 26.9412, 75.8142, InterestType.NATURE, 4.5),
                createPlace("Chokhi Dhani", "Jaipur", 26.7923, 75.8243, InterestType.FOOD, 4.6),

                // Goa
                createPlace("Calangute Beach", "Goa", 15.5436, 73.7553, InterestType.NATURE, 4.5),
                createPlace("Basilica of Bom Jesus", "Goa", 15.5014, 73.9117, InterestType.CULTURE, 4.6),
                createPlace("Anjuna Beach", "Goa", 15.5768, 73.7394, InterestType.NIGHTLIFE, 4.4),
                createPlace("Dudhsagar Falls", "Goa", 15.3142, 74.3140, InterestType.NATURE, 4.7),
                createPlace("Fontainhas", "Goa", 15.4989, 73.8278, InterestType.CULTURE, 4.5),
                createPlace("Baga Beach", "Goa", 15.5535, 73.7493, InterestType.RELAXATION, 4.5),
                createPlace("Saturday Night Market", "Goa", 15.5768, 73.7394, InterestType.SHOPPING, 4.3));
    }

    private List<Vehicle> buildVehicles() {
        return List.of(
                createVehicle(VehicleType.CAB, 3, "Arjun Kumar", "KA01AB1234"),
                createVehicle(VehicleType.CAB, 3, "Riya Sharma", "MH02CD5678"),
                createVehicle(VehicleType.MINI_BUS, 8, "Vikram Singh", "DL03EF9012"),
                createVehicle(VehicleType.MINI_BUS, 8, "Meera Nair", "KA04GH3456"),
                createVehicle(VehicleType.BUS, 20, "Sandeep Rao", "MH05IJ7890"));
    }

    private Place createPlace(String name, String city, double lat, double lon, InterestType category, double rating) {
        Place place = new Place();
        place.setName(name);
        place.setCity(city);
        place.setLatitude(lat);
        place.setLongitude(lon);
        place.setCategory(category);
        place.setRating(rating);
        return place;
    }

    private Vehicle createVehicle(VehicleType type, int capacity, String driver, String number) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleType(type);
        vehicle.setCapacity(capacity);
        vehicle.setDriverName(driver);
        vehicle.setVehicleNumber(number);
        vehicle.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        return vehicle;
    }
}