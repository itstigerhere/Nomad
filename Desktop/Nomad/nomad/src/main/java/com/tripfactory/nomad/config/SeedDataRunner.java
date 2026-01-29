package com.tripfactory.nomad.config;

import java.util.List;

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
                // ===== BENGALURU - Comprehensive Coverage =====
                // Nature & Relaxation
                createPlace("Lalbagh Botanical Garden", "Bengaluru", 12.9507, 77.5848, InterestType.NATURE, 4.6),
                createPlace("Cubbon Park", "Bengaluru", 12.9763, 77.5929, InterestType.NATURE, 4.5),
                createPlace("Ulsoor Lake", "Bengaluru", 12.9836, 77.6191, InterestType.RELAXATION, 4.2),
                createPlace("Bannerghatta Biological Park", "Bengaluru", 12.8006, 77.5772, InterestType.NATURE, 4.4),
                createPlace("Nandi Hills", "Bengaluru", 13.3704, 77.6838, InterestType.NATURE, 4.7),
                createPlace("Hesaraghatta Lake", "Bengaluru", 13.1375, 77.4773, InterestType.RELAXATION, 4.3),
                
                // Culture & Heritage
                createPlace("Bangalore Palace", "Bengaluru", 12.9987, 77.5921, InterestType.CULTURE, 4.3),
                createPlace("ISKCON Temple", "Bengaluru", 13.0099, 77.5511, InterestType.CULTURE, 4.5),
                createPlace("Tipu Sultan's Summer Palace", "Bengaluru", 12.9591, 77.5741, InterestType.CULTURE, 4.2),
                createPlace("Bull Temple", "Bengaluru", 12.9433, 77.5655, InterestType.CULTURE, 4.4),
                createPlace("Vidhana Soudha", "Bengaluru", 12.9796, 77.5909, InterestType.CULTURE, 4.3),
                
                // Food
                createPlace("VV Puram Food Street", "Bengaluru", 12.9453, 77.5741, InterestType.FOOD, 4.4),
                createPlace("Shivaji Nagar Market", "Bengaluru", 12.9885, 77.6035, InterestType.FOOD, 4.2),
                createPlace("Brigade Road Food Hub", "Bengaluru", 12.9716, 77.6040, InterestType.FOOD, 4.5),
                createPlace("Indiranagar 100 Feet Road Eateries", "Bengaluru", 12.9716, 77.6412, InterestType.FOOD, 4.6),
                
                // Shopping
                createPlace("Commercial Street", "Bengaluru", 12.9820, 77.6097, InterestType.SHOPPING, 4.4),
                createPlace("Chickpet Market", "Bengaluru", 12.9634, 77.5746, InterestType.SHOPPING, 4.2),
                createPlace("Orion Mall", "Bengaluru", 13.0101, 77.5552, InterestType.SHOPPING, 4.5),
                
                // Nightlife & Entertainment
                createPlace("UB City Mall", "Bengaluru", 12.9716, 77.5946, InterestType.NIGHTLIFE, 4.5),
                createPlace("Koramangala Pubs Area", "Bengaluru", 12.9352, 77.6245, InterestType.NIGHTLIFE, 4.4),
                createPlace("Indiranagar Nightlife District", "Bengaluru", 12.9784, 77.6408, InterestType.NIGHTLIFE, 4.3),
                
                // Adventure
                createPlace("Wonderla Amusement Park", "Bengaluru", 12.8347, 77.3989, InterestType.ADVENTURE, 4.6),
                createPlace("Ramanagara Hill Climbing", "Bengaluru", 12.7163, 77.2833, InterestType.ADVENTURE, 4.5),
                
                // ===== MUMBAI - Comprehensive Coverage =====
                // Nature & Relaxation
                createPlace("Marine Drive", "Mumbai", 18.9440, 72.8238, InterestType.RELAXATION, 4.7),
                createPlace("Chowpatty Beach", "Mumbai", 18.9547, 72.8133, InterestType.NATURE, 4.2),
                createPlace("Sanjay Gandhi National Park", "Mumbai", 19.2147, 72.9106, InterestType.NATURE, 4.5),
                createPlace("Hanging Gardens", "Mumbai", 18.9558, 72.8052, InterestType.NATURE, 4.3),
                createPlace("Juhu Beach", "Mumbai", 19.0990, 72.8260, InterestType.RELAXATION, 4.4),
                createPlace("Versova Beach", "Mumbai", 19.1302, 72.8115, InterestType.RELAXATION, 4.2),
                
                // Culture & Heritage
                createPlace("Gateway of India", "Mumbai", 18.9218, 72.8347, InterestType.CULTURE, 4.6),
                createPlace("Chhatrapati Shivaji Terminus", "Mumbai", 18.9398, 72.8355, InterestType.CULTURE, 4.7),
                createPlace("Elephanta Caves", "Mumbai", 18.9633, 72.9315, InterestType.CULTURE, 4.5),
                createPlace("Haji Ali Dargah", "Mumbai", 18.9827, 72.8089, InterestType.CULTURE, 4.6),
                createPlace("Siddhivinayak Temple", "Mumbai", 19.0169, 72.8301, InterestType.CULTURE, 4.5),
                createPlace("Prince of Wales Museum", "Mumbai", 18.9269, 72.8325, InterestType.CULTURE, 4.4),
                
                // Food
                createPlace("Mohammad Ali Road Food Street", "Mumbai", 18.9516, 72.8322, InterestType.FOOD, 4.5),
                createPlace("Bandra Food Scene", "Mumbai", 19.0596, 72.8295, InterestType.FOOD, 4.6),
                createPlace("Khau Galli Andheri", "Mumbai", 19.1197, 72.8464, InterestType.FOOD, 4.4),
                createPlace("Colaba Restaurants", "Mumbai", 18.9167, 72.8233, InterestType.FOOD, 4.5),
                
                // Shopping
                createPlace("Colaba Causeway", "Mumbai", 18.9220, 72.8327, InterestType.SHOPPING, 4.4),
                createPlace("Linking Road Market", "Mumbai", 19.0544, 72.8266, InterestType.SHOPPING, 4.3),
                createPlace("Crawford Market", "Mumbai", 18.9472, 72.8350, InterestType.SHOPPING, 4.2),
                createPlace("Phoenix Palladium Mall", "Mumbai", 19.0760, 72.8777, InterestType.SHOPPING, 4.6),
                
                // Nightlife & Entertainment
                createPlace("Bandra Bandstand", "Mumbai", 19.0466, 72.8205, InterestType.NIGHTLIFE, 4.3),
                createPlace("Lower Parel Clubs", "Mumbai", 18.9960, 72.8284, InterestType.NIGHTLIFE, 4.5),
                createPlace("Worli Sea Link Night View", "Mumbai", 19.0330, 72.8190, InterestType.NIGHTLIFE, 4.4),
                
                // Adventure
                createPlace("Imagica Theme Park", "Mumbai", 18.7380, 73.4300, InterestType.ADVENTURE, 4.6),
                createPlace("Karnala Fort Trek", "Mumbai", 18.8840, 73.1079, InterestType.ADVENTURE, 4.5),
                
                // ===== DELHI - Comprehensive Coverage =====
                // Nature & Relaxation
                createPlace("Lodhi Garden", "Delhi", 28.5933, 77.2197, InterestType.NATURE, 4.4),
                createPlace("Garden of Five Senses", "Delhi", 28.5151, 77.2094, InterestType.RELAXATION, 4.3),
                createPlace("Nehru Park", "Delhi", 28.5655, 77.2106, InterestType.NATURE, 4.2),
                createPlace("Deer Park", "Delhi", 28.5530, 77.1949, InterestType.NATURE, 4.3),
                
                // Culture & Heritage
                createPlace("India Gate", "Delhi", 28.6129, 77.2295, InterestType.CULTURE, 4.6),
                createPlace("Qutub Minar", "Delhi", 28.5244, 77.1855, InterestType.CULTURE, 4.5),
                createPlace("Akshardham", "Delhi", 28.6127, 77.2773, InterestType.CULTURE, 4.6),
                createPlace("Red Fort", "Delhi", 28.6562, 77.2410, InterestType.CULTURE, 4.5),
                createPlace("Humayun's Tomb", "Delhi", 28.5933, 77.2507, InterestType.CULTURE, 4.6),
                createPlace("Lotus Temple", "Delhi", 28.5535, 77.2588, InterestType.CULTURE, 4.5),
                createPlace("Jama Masjid", "Delhi", 28.6507, 77.2334, InterestType.CULTURE, 4.4),
                createPlace("Gurudwara Bangla Sahib", "Delhi", 28.6262, 77.2082, InterestType.CULTURE, 4.6),
                
                // Food
                createPlace("Chandni Chowk", "Delhi", 28.6506, 77.2303, InterestType.FOOD, 4.2),
                createPlace("Paranthe Wali Gali", "Delhi", 28.6515, 77.2307, InterestType.FOOD, 4.5),
                createPlace("Khan Market Eateries", "Delhi", 28.6007, 77.2273, InterestType.FOOD, 4.4),
                createPlace("Connaught Place Food Court", "Delhi", 28.6315, 77.2167, InterestType.FOOD, 4.3),
                
                // Shopping
                createPlace("Sarojini Nagar Market", "Delhi", 28.5753, 77.1958, InterestType.SHOPPING, 4.4),
                createPlace("Lajpat Nagar Market", "Delhi", 28.5677, 77.2433, InterestType.SHOPPING, 4.3),
                createPlace("Dilli Haat", "Delhi", 28.5494, 77.1915, InterestType.SHOPPING, 4.5),
                createPlace("Select Citywalk Mall", "Delhi", 28.5244, 77.2177, InterestType.SHOPPING, 4.6),
                
                // Nightlife & Entertainment
                createPlace("Hauz Khas Village", "Delhi", 28.5530, 77.1949, InterestType.NIGHTLIFE, 4.3),
                createPlace("Connaught Place Night Scene", "Delhi", 28.6315, 77.2167, InterestType.NIGHTLIFE, 4.4),
                createPlace("Cyber Hub Gurgaon", "Delhi", 28.4950, 77.0890, InterestType.NIGHTLIFE, 4.5),
                
                // Adventure
                createPlace("Adventure Island", "Delhi", 28.6692, 77.1490, InterestType.ADVENTURE, 4.4),
                createPlace("Aravalli Biodiversity Park Trek", "Delhi", 28.4595, 77.0364, InterestType.ADVENTURE, 4.3),
                
                // ===== PUNE - New City =====
                createPlace("Shaniwar Wada", "Pune", 18.5196, 73.8553, InterestType.CULTURE, 4.4),
                createPlace("Aga Khan Palace", "Pune", 18.5525, 73.8972, InterestType.CULTURE, 4.5),
                createPlace("Sinhagad Fort", "Pune", 18.3664, 73.7557, InterestType.ADVENTURE, 4.6),
                createPlace("FC Road", "Pune", 18.5204, 73.8567, InterestType.FOOD, 4.3),
                createPlace("Koregaon Park", "Pune", 18.5367, 73.8930, InterestType.NIGHTLIFE, 4.4),
                createPlace("Pashan Lake", "Pune", 18.5362, 73.7889, InterestType.NATURE, 4.2),
                createPlace("Phoenix Market City Pune", "Pune", 18.5601, 73.9170, InterestType.SHOPPING, 4.5),
                
                // ===== HYDERABAD - New City =====
                createPlace("Charminar", "Hyderabad", 17.3616, 78.4747, InterestType.CULTURE, 4.6),
                createPlace("Golconda Fort", "Hyderabad", 17.3833, 78.4011, InterestType.CULTURE, 4.5),
                createPlace("Hussain Sagar Lake", "Hyderabad", 17.4239, 78.4738, InterestType.RELAXATION, 4.4),
                createPlace("Ramoji Film City", "Hyderabad", 17.2543, 78.6808, InterestType.ADVENTURE, 4.7),
                createPlace("Laad Bazaar", "Hyderabad", 17.3614, 78.4750, InterestType.SHOPPING, 4.3),
                createPlace("Paradise Biryani Area", "Hyderabad", 17.4435, 78.4747, InterestType.FOOD, 4.6),
                createPlace("Jubilee Hills", "Hyderabad", 17.4239, 78.4109, InterestType.NIGHTLIFE, 4.4),
                
                // ===== JAIPUR - New City =====
                createPlace("Hawa Mahal", "Jaipur", 26.9239, 75.8267, InterestType.CULTURE, 4.6),
                createPlace("Amber Fort", "Jaipur", 26.9855, 75.8513, InterestType.CULTURE, 4.7),
                createPlace("City Palace", "Jaipur", 26.9258, 75.8237, InterestType.CULTURE, 4.5),
                createPlace("Jal Mahal", "Jaipur", 26.9539, 75.8461, InterestType.RELAXATION, 4.4),
                createPlace("Johari Bazaar", "Jaipur", 26.9239, 75.8267, InterestType.SHOPPING, 4.3),
                createPlace("Chokhi Dhani", "Jaipur", 26.7733, 75.8719, InterestType.FOOD, 4.5),
                createPlace("Nahargarh Fort", "Jaipur", 26.9367, 75.8150, InterestType.ADVENTURE, 4.6),
                
                // ===== GOA - New City =====
                createPlace("Baga Beach", "Goa", 15.5550, 73.7519, InterestType.RELAXATION, 4.5),
                createPlace("Calangute Beach", "Goa", 15.5450, 73.7546, InterestType.NATURE, 4.4),
                createPlace("Basilica of Bom Jesus", "Goa", 15.5008, 73.9114, InterestType.CULTURE, 4.6),
                createPlace("Dudhsagar Waterfalls", "Goa", 15.3144, 74.3144, InterestType.ADVENTURE, 4.7),
                createPlace("Anjuna Flea Market", "Goa", 15.5733, 73.7400, InterestType.SHOPPING, 4.3),
                createPlace("Tito's Lane", "Goa", 15.5167, 73.8167, InterestType.NIGHTLIFE, 4.5),
                createPlace("Fisherman's Wharf", "Goa", 15.4909, 73.8278, InterestType.FOOD, 4.4),
                
                // ===== KOLKATA - New City =====
                createPlace("Victoria Memorial", "Kolkata", 22.5448, 88.3426, InterestType.CULTURE, 4.6),
                createPlace("Howrah Bridge", "Kolkata", 22.5851, 88.3467, InterestType.CULTURE, 4.5),
                createPlace("Park Street", "Kolkata", 22.5535, 88.3509, InterestType.FOOD, 4.4),
                createPlace("New Market", "Kolkata", 22.5568, 88.3515, InterestType.SHOPPING, 4.3),
                createPlace("Eco Park", "Kolkata", 22.6116, 88.4643, InterestType.NATURE, 4.4),
                createPlace("Park Street Nightlife", "Kolkata", 22.5535, 88.3509, InterestType.NIGHTLIFE, 4.3),
                
                // ===== CHENNAI - New City =====
                createPlace("Marina Beach", "Chennai", 13.0499, 80.2824, InterestType.RELAXATION, 4.5),
                createPlace("Kapaleeshwarar Temple", "Chennai", 13.0339, 80.2695, InterestType.CULTURE, 4.6),
                createPlace("Mahabalipuram Shore Temple", "Chennai", 12.6163, 80.1987, InterestType.CULTURE, 4.7),
                createPlace("T Nagar Shopping", "Chennai", 13.0418, 80.2341, InterestType.SHOPPING, 4.4),
                createPlace("Saravana Bhavan", "Chennai", 13.0827, 80.2707, InterestType.FOOD, 4.5),
                createPlace("ECR Beach Drive", "Chennai", 12.8993, 80.2330, InterestType.ADVENTURE, 4.3),
                
                // ===== KOCHI - New City =====
                createPlace("Fort Kochi", "Kochi", 9.9655, 76.2429, InterestType.CULTURE, 4.6),
                createPlace("Chinese Fishing Nets", "Kochi", 9.9655, 76.2429, InterestType.RELAXATION, 4.4),
                createPlace("Marine Drive Kochi", "Kochi", 9.9693, 76.2842, InterestType.NATURE, 4.5),
                createPlace("Lulu Mall", "Kochi", 10.0270, 76.3074, InterestType.SHOPPING, 4.5),
                createPlace("Kathakali Centre", "Kochi", 9.9654, 76.2426, InterestType.CULTURE, 4.3),
                createPlace("Seafood at Princess Street", "Kochi", 9.9655, 76.2429, InterestType.FOOD, 4.6),
                
                // ===== AHMEDABAD - New City =====
                createPlace("Sabarmati Ashram", "Ahmedabad", 23.0600, 72.5800, InterestType.CULTURE, 4.6),
                createPlace("Kankaria Lake", "Ahmedabad", 22.9988, 72.6211, InterestType.RELAXATION, 4.4),
                createPlace("Manek Chowk", "Ahmedabad", 23.0259, 72.5873, InterestType.FOOD, 4.5),
                createPlace("Law Garden Night Market", "Ahmedabad", 23.0350, 72.5560, InterestType.SHOPPING, 4.3),
                createPlace("Adalaj Stepwell", "Ahmedabad", 23.1649, 72.5799, InterestType.CULTURE, 4.5));
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