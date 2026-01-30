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

    @Value("${nomad.seed-data:true}")
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
                createPlace("Lalbagh Botanical Garden", "Bengaluru", 12.9507, 77.5848, InterestType.NATURE, 4.6,
                        "Historic botanical garden with rare plants, glass house and flower shows. A green lung of the city since 1760.",
                        "6:00 AM – 7:00 PM", "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80"),
                createPlace("Cubbon Park", "Bengaluru", 12.9763, 77.5929, InterestType.NATURE, 4.5,
                        "Spread over 300 acres, this park is ideal for jogging, walking and picnics. Houses the State Central Library.",
                        "6:00 AM – 6:00 PM", "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80"),
                createPlace("Bangalore Palace", "Bengaluru", 12.9987, 77.5921, InterestType.CULTURE, 4.3,
                        "Tudor-style palace inspired by Windsor Castle. Built in 1887, it showcases royal artefacts and architecture.",
                        "10:00 AM – 5:30 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("VV Puram Food Street", "Bengaluru", 12.9453, 77.5741, InterestType.FOOD, 4.4,
                        "Famous street food lane with local delicacies: masala dosa, obbattu, chaat and sweets.",
                        "4:00 PM – 11:00 PM", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"),
                createPlace("ISKCON Temple", "Bengaluru", 13.0099, 77.5511, InterestType.CULTURE, 4.5,
                        "One of the largest ISKCON temples with Vedic museum, guest house and vegetarian restaurant.",
                        "4:15 AM – 8:30 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Ulsoor Lake", "Bengaluru", 12.9836, 77.6191, InterestType.RELAXATION, 4.2,
                        "Serene lake with boating, walking path and greenery. Popular for morning walks.",
                        "6:00 AM – 8:00 PM", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"),
                createPlace("Nandi Hills", "Bengaluru", 13.3701, 77.6870, InterestType.NATURE, 4.5,
                        "Hill station 60 km from Bengaluru. Sunrise views, Tipu's summer palace and cycling trails.",
                        "6:00 AM – 6:00 PM", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"),
                createPlace("Commercial Street", "Bengaluru", 12.9762, 77.6033, InterestType.SHOPPING, 4.2,
                        "Busy shopping street for clothes, accessories and souvenirs. Good for bargaining.",
                        "10:00 AM – 9:30 PM", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"),

                // Mumbai
                createPlace("Marine Drive", "Mumbai", 18.9440, 72.8238, InterestType.RELAXATION, 4.7,
                        "Iconic 3.6 km promenade along the Arabian Sea. Best at sunset; called the Queen's Necklace.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"),
                createPlace("Gateway of India", "Mumbai", 18.9218, 72.8347, InterestType.CULTURE, 4.6,
                        "Monument built in 1924. Starting point for boat rides to Elephanta Caves.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1589559799362-1f9fd50e2b8a?w=800&q=80"),
                createPlace("Colaba Causeway", "Mumbai", 18.9220, 72.8327, InterestType.SHOPPING, 4.4,
                        "Famous market for clothes, bags, jewellery and street food near Gateway of India.",
                        "10:00 AM – 10:00 PM", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"),
                createPlace("Chowpatty Beach", "Mumbai", 18.9547, 72.8133, InterestType.NATURE, 4.2,
                        "Popular beach for evening strolls, chaat and Ganesh Chaturthi immersions.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
                createPlace("Sanjay Gandhi National Park", "Mumbai", 19.2147, 72.9106, InterestType.NATURE, 4.5,
                        "Over 100 sq km of forest inside the city. Kanheri Caves, safari and trekking.",
                        "7:30 AM – 6:30 PM", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"),
                createPlace("Bandra Bandstand", "Mumbai", 19.0466, 72.8205, InterestType.NIGHTLIFE, 4.3,
                        "Seaside promenade with celebrity homes, cafes and sea view. Lively at night.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1513584684374-8b7488f15de2?w=800&q=80"),
                createPlace("Elephanta Caves", "Mumbai", 18.9632, 72.9314, InterestType.CULTURE, 4.6,
                        "UNESCO World Heritage rock-cut caves and Hindu temples. Ferry from Gateway of India.",
                        "9:00 AM – 5:00 PM (closed Mon)", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Crawford Market", "Mumbai", 18.9497, 72.8342, InterestType.SHOPPING, 4.1,
                        "Historic market for fruits, vegetables, dry fruits and household goods.",
                        "6:00 AM – 10:00 PM", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"),

                // Delhi
                createPlace("India Gate", "Delhi", 28.6129, 77.2295, InterestType.CULTURE, 4.6,
                        "War memorial dedicated to Indian soldiers. Lawns and Rajpath make it a popular evening spot.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1665558646240-b2190160c400?w=800&q=80"),
                createPlace("Qutub Minar", "Delhi", 28.5244, 77.1855, InterestType.CULTURE, 4.5,
                        "UNESCO site: 73 m minaret and surrounding monuments from the Delhi Sultanate.",
                        "7:00 AM – 5:00 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Hauz Khas Village", "Delhi", 28.5530, 77.1949, InterestType.NIGHTLIFE, 4.3,
                        "Medieval reservoir, deer park and trendy cafes, bars and boutiques.",
                        "Cafes 10:00 AM – 12:00 AM", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"),
                createPlace("Lodhi Garden", "Delhi", 28.5933, 77.2197, InterestType.NATURE, 4.4,
                        "Park with tombs of Lodhi and Sayyid rulers. Jogging tracks and bird watching.",
                        "6:00 AM – 7:30 PM", "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80"),
                createPlace("Chandni Chowk", "Delhi", 28.6506, 77.2303, InterestType.FOOD, 4.2,
                        "Historic market and food street: parathas, jalebi, chaat and sweets.",
                        "10:00 AM – 8:00 PM", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"),
                createPlace("Akshardham", "Delhi", 28.6127, 77.2773, InterestType.CULTURE, 4.6,
                        "Large temple complex with exhibitions, boat ride and evening show. No phones inside.",
                        "10:00 AM – 6:30 PM (closed Mon)", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Red Fort", "Delhi", 28.6562, 77.2410, InterestType.CULTURE, 4.7,
                        "UNESCO World Heritage Mughal fort. Sound and light show in the evening.",
                        "9:30 AM – 4:30 PM (closed Mon)", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Connaught Place", "Delhi", 28.6304, 77.2177, InterestType.SHOPPING, 4.3,
                        "Colonial-era circular market: shops, restaurants and metro hub.",
                        "10:00 AM – 9:00 PM", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"),

                // Hyderabad
                createPlace("Charminar", "Hyderabad", 17.3616, 78.4747, InterestType.CULTURE, 4.7,
                        "Iconic 16th-century monument with four minarets. Heart of the old city.",
                        "9:30 AM – 5:30 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Golconda Fort", "Hyderabad", 17.3833, 78.4011, InterestType.CULTURE, 4.6,
                        "Fort with acoustic effects and light show. Once famous for diamonds.",
                        "9:00 AM – 5:30 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Ramoji Film City", "Hyderabad", 17.2236, 78.6619, InterestType.ADVENTURE, 4.5,
                        "One of the world's largest film studios. Theme park, sets and live shows.",
                        "9:00 AM – 5:30 PM", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"),
                createPlace("Hussain Sagar Lake", "Hyderabad", 17.4239, 78.4739, InterestType.RELAXATION, 4.4,
                        "Lake with Buddha statue on an island. Boating and Lumbini Park nearby.",
                        "9:00 AM – 9:00 PM", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"),
                createPlace("Salar Jung Museum", "Hyderabad", 17.3714, 78.4804, InterestType.CULTURE, 4.5,
                        "One of India's largest museums: art, manuscripts and antiques.",
                        "10:00 AM – 5:00 PM (closed Fri)", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Laad Bazaar", "Hyderabad", 17.3589, 78.4736, InterestType.SHOPPING, 4.3,
                        "Bazaar near Charminar for bangles, pearls and traditional wear.",
                        "10:00 AM – 9:00 PM", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"),
                createPlace("Paradise Biryani", "Hyderabad", 17.4484, 78.3908, InterestType.FOOD, 4.6,
                        "Famous restaurant for Hyderabadi biryani since 1953.",
                        "11:00 AM – 11:00 PM", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"),

                // Chennai
                createPlace("Marina Beach", "Chennai", 13.0500, 80.2827, InterestType.RELAXATION, 4.6,
                        "One of the longest urban beaches in India. Evening walks and local snacks.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"),
                createPlace("Kapaleeshwarar Temple", "Chennai", 13.0330, 80.2674, InterestType.CULTURE, 4.5,
                        "Dravidian-style temple in Mylapore dedicated to Lord Shiva.",
                        "6:00 AM – 12:00 PM, 4:00 PM – 9:00 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Government Museum", "Chennai", 13.0696, 80.2406, InterestType.CULTURE, 4.3,
                        "Second-oldest museum in India. Archaeology, bronzes and numismatics.",
                        "9:00 AM – 5:00 PM (closed Fri)", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Covelong Beach", "Chennai", 12.7919, 80.2508, InterestType.NATURE, 4.4,
                        "Fishing village and surf destination. Less crowded than Marina.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80"),
                createPlace("T Nagar", "Chennai", 13.0418, 80.2341, InterestType.SHOPPING, 4.2,
                        "Major shopping area for sarees, gold and electronics.",
                        "10:00 AM – 9:00 PM", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"),
                createPlace("Mylapore", "Chennai", 13.0339, 80.2618, InterestType.CULTURE, 4.4,
                        "Old neighbourhood with Kapaleeshwarar Temple, tank and narrow streets.",
                        "Temple hours vary", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("ECR Food Street", "Chennai", 12.9698, 80.2492, InterestType.FOOD, 4.3,
                        "East Coast Road stretch with seafood and local Tamil cuisine.",
                        "11:00 AM – 11:00 PM", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"),

                // Kolkata
                createPlace("Victoria Memorial", "Kolkata", 22.5448, 88.3426, InterestType.CULTURE, 4.7,
                        "Marble monument and museum. Gardens and galleries of colonial history.",
                        "10:00 AM – 5:00 PM (closed Mon)", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Howrah Bridge", "Kolkata", 22.5950, 88.3470, InterestType.CULTURE, 4.6,
                        "Iconic cantilever bridge over the Hooghly. Best seen from the ghats.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Park Street", "Kolkata", 22.5535, 88.3510, InterestType.NIGHTLIFE, 4.4,
                        "Historic street with restaurants, pubs and live music.",
                        "Restaurants 11:00 AM – 12:00 AM", "https://images.unsplash.com/photo-1513584684374-8b7488f15de2?w=800&q=80"),
                createPlace("New Market", "Kolkata", 22.5575, 88.3512, InterestType.SHOPPING, 4.2,
                        "Colonial-era market for clothes, food and souvenirs.",
                        "10:00 AM – 8:00 PM (closed Mon)", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"),
                createPlace("Indian Museum", "Kolkata", 22.5580, 88.3510, InterestType.CULTURE, 4.4,
                        "Oldest and largest museum in India. Natural history and art.",
                        "10:00 AM – 5:00 PM (closed Mon)", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Princep Ghat", "Kolkata", 22.5545, 88.3372, InterestType.RELAXATION, 4.5,
                        "Riverside monument and promenade. Boat rides and sunset views.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"),
                createPlace("College Street", "Kolkata", 22.5736, 88.3639, InterestType.CULTURE, 4.3,
                        "World's largest second-hand book market. Coffee House nearby.",
                        "10:00 AM – 8:00 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),

                // Pune
                createPlace("Shaniwar Wada", "Pune", 18.5196, 73.8554, InterestType.CULTURE, 4.5,
                        "18th-century fort palace of the Peshwas. Sound and light show in the evening.",
                        "8:00 AM – 6:30 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Sinhagad Fort", "Pune", 18.3667, 73.7500, InterestType.ADVENTURE, 4.6,
                        "Historic fort on a hill. Popular for trekking and views of Pune.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"),
                createPlace("Aga Khan Palace", "Pune", 18.5522, 73.9065, InterestType.CULTURE, 4.4,
                        "Palace and museum linked to the freedom movement. Gandhiji was confined here.",
                        "9:00 AM – 5:30 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Koregaon Park", "Pune", 18.5314, 73.9046, InterestType.NIGHTLIFE, 4.3,
                        "Area known for cafes, pubs and Osho International Meditation Resort.",
                        "Cafes 8:00 AM – 12:00 AM", "https://images.unsplash.com/photo-1513584684374-8b7488f15de2?w=800&q=80"),
                createPlace("FC Road", "Pune", 18.5074, 73.8077, InterestType.FOOD, 4.4,
                        "Fergusson College Road: street food, cafes and shopping.",
                        "10:00 AM – 10:00 PM", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"),
                createPlace("Osho Teerth Park", "Pune", 18.5317, 73.8552, InterestType.RELAXATION, 4.3,
                        "Meditation park with bamboo groves and walking paths.",
                        "6:00 AM – 9:00 AM, 4:00 PM – 9:00 PM", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"),
                createPlace("MG Road", "Pune", 18.5082, 73.8106, InterestType.SHOPPING, 4.2,
                        "Main shopping street: clothes, electronics and eateries.",
                        "10:00 AM – 9:30 PM", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"),

                // Jaipur
                createPlace("Hawa Mahal", "Jaipur", 26.9239, 75.8267, InterestType.CULTURE, 4.7,
                        "Five-storey palace with honeycomb windows. Built for royal women to watch the street.",
                        "9:00 AM – 4:30 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Amer Fort", "Jaipur", 26.9855, 75.8513, InterestType.CULTURE, 4.8,
                        "Hill fort with palaces, mirror work and elephant rides. UNESCO heritage.",
                        "8:00 AM – 5:30 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("City Palace", "Jaipur", 26.9258, 75.8236, InterestType.CULTURE, 4.6,
                        "Palace complex with museums, courtyards and royal collections.",
                        "9:30 AM – 5:00 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Jantar Mantar", "Jaipur", 26.9247, 75.8246, InterestType.CULTURE, 4.5,
                        "UNESCO site: historic astronomical instruments in stone and metal.",
                        "9:00 AM – 4:30 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Johari Bazaar", "Jaipur", 26.9196, 75.8250, InterestType.SHOPPING, 4.4,
                        "Traditional market for jewellery, gems and handicrafts.",
                        "10:00 AM – 7:30 PM", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"),
                createPlace("Nahargarh Fort", "Jaipur", 26.9412, 75.8142, InterestType.NATURE, 4.5,
                        "Fort on the Aravallis with panoramic views of Jaipur. Sunset point.",
                        "10:00 AM – 5:30 PM", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"),
                createPlace("Chokhi Dhani", "Jaipur", 26.7923, 75.8243, InterestType.FOOD, 4.6,
                        "Village-style resort with Rajasthani food, folk dance and camel rides.",
                        "5:00 PM – 11:00 PM", "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"),

                // Goa
                createPlace("Calangute Beach", "Goa", 15.5436, 73.7553, InterestType.NATURE, 4.5,
                        "Largest and busiest beach in North Goa. Water sports and shacks.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"),
                createPlace("Basilica of Bom Jesus", "Goa", 15.5014, 73.9117, InterestType.CULTURE, 4.6,
                        "UNESCO church housing the mortal remains of St Francis Xavier.",
                        "9:00 AM – 6:30 PM", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Anjuna Beach", "Goa", 15.5768, 73.7394, InterestType.NIGHTLIFE, 4.4,
                        "Famous for Wednesday flea market, trance parties and beach shacks.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1513584684374-8b7488f15de2?w=800&q=80"),
                createPlace("Dudhsagar Falls", "Goa", 15.3142, 74.3140, InterestType.NATURE, 4.7,
                        "Four-tier waterfall on the Goa–Karnataka border. Trek or jeep safari.",
                        "9:00 AM – 4:00 PM", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"),
                createPlace("Fontainhas", "Goa", 15.4989, 73.8278, InterestType.CULTURE, 4.5,
                        "Latin quarter in Panjim with colourful Portuguese-style houses.",
                        "Walk anytime", "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"),
                createPlace("Baga Beach", "Goa", 15.5535, 73.7493, InterestType.RELAXATION, 4.5,
                        "Beach known for water sports, nightlife and long coastline.",
                        "Open 24 hours", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"),
                createPlace("Saturday Night Market", "Goa", 15.5768, 73.7394, InterestType.SHOPPING, 4.3,
                        "Weekly market at Arpora: handicrafts, clothes, food and live music.",
                        "6:00 PM – 12:00 AM (Sat)", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"));
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

    private Place createPlace(String name, String city, double lat, double lon, InterestType category, double rating,
            String description, String openingHours, String imageUrl) {
        Place place = createPlace(name, city, lat, lon, category, rating);
        place.setDescription(description);
        place.setOpeningHours(openingHours);
        place.setImageUrl(imageUrl);
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
