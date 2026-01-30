# Nomad Codebase Documentation

## 1. Executive Summary
**Nomad** is a full-stack travel package booking platform designed to simplify trip planning and foster community travel. It uniquely combines **automated itinerary generation** with **social group matching**, allowing solo travelers to find like-minded groups.

The system is built with a robust **Spring Boot** backend and a modern **Next.js** frontend, featuring real-time payments (Razorpay), mapping services (Mapbox), and SMS notifications (Twilio).

---

## 2. Technology Stack

### Backend
*   **Framework**: Spring Boot 3.5.10 (Java 17)
*   **Database**: PostgreSQL
*   **ORM**: Hibernate / Spring Data JPA
*   **Authentication**: JWT (JSON Web Tokens)
*   **Security**: Spring Security

### Frontend
*   **Framework**: Next.js (React / TypeScript)
*   **Styling**: Tailwind CSS
*   **State Management**: React Hooks

### Integrations & Services
*   **Payments**: Razorpay (Orders, Verifications, Webhooks)
*   **Maps**: Mapbox (Frontend integration for route visualization)
*   **Notifications**: Twilio (SMS), JavaMailSender (Email)

---

## 3. Core Architecture

The backend follows a standard layered architecture:
`Controller (API)` -> `Service (Business Logic)` -> `Repository (Data Access)` -> `Database`

### Key Packages
*   `com.tripfactory.nomad.api`: REST Controllers and DTOs.
*   `com.tripfactory.nomad.service`: Business logic interfaces.
*   `com.tripfactory.nomad.service.impl`: Core logic implementation.
*   `com.tripfactory.nomad.domain.entity`: Database models.
*   `com.tripfactory.nomad.repository`: Spring Data JPA interfaces.

---

## 4. Key Features & Business Logic

### A. Intelligent Trip Planning ([TripServiceImpl](file:///d:/TFC/tf_hackaton/Nomad/Desktop/Nomad/nomad/src/main/java/com/tripfactory/nomad/service/impl/TripServiceImpl.java#39-284))
The most complex and unique feature. It generates a trip itinerary automatically based on inputs.
*   **Logic**:
    1.  **Ranking**: Places in the target city are ranked by scoring them based on:
        *   User Interest Match (Highest priority)
        *   Distance from User (Nearest Neighbor approximation)
        *   Global Rating
    2.  **Scheduling**: It greedily selects the top places and fits them into time slots (e.g., 2 hours per place).
    3.  **Routing**: Calculates distances between consecutive stops using Haversine formula (`GeoUtils`).
    4.  **Smart Sorting**: Special handling for "Nightlife" category places to push them to the end of the day.

### B. automated Group Matching (`TripGroupServiceImpl`)
Solves the "lonely traveler" problem.
*   **Logic**: When a user requests a "GROUP" mode trip:
    *   The system searches for an existing `OPEN` group in the same city with the same interest and dates.
    *   If found, the user is added.
    *   If the group reaches size 4, it's marked `READY`. At size 6, it's `CLOSED`.
    *   If no group exists, a new one is created.

### C. Travel Assistance & Logistics ([TravelAssistanceServiceImpl](file:///d:/TFC/tf_hackaton/Nomad/Desktop/Nomad/nomad/src/main/java/com/tripfactory/nomad/service/impl/TravelAssistanceServiceImpl.java#30-180))
Automates vehicle dispatch.
*   **Logic**:
    *   Determines vehicle needs based on group size (1-3: Cab, 4-6: Mini Bus).
    *   Checks `VehicleRepository` for `AVAILABLE` vehicles.
    *   Assigns a driver/vehicle and locks it (`ASSIGNED` status).
    *   Sends SMS confirmation to the user.

### D. Secure Payments ([PaymentServiceImpl](file:///d:/TFC/tf_hackaton/Nomad/Desktop/Nomad/nomad/src/main/java/com/tripfactory/nomad/service/impl/PaymentServiceImpl.java#35-228))
End-to-end payment flow.
*   **Features**:
    *   **Order Creation**: Generates Razorpay Orders.
    *   **Verification**: Signature verification for security.
    *   **Webhooks**: Handles async status updates (Captured/Failed) from Razorpay to update local integrity.

---

## 5. Data Model (Schema)

### Primary Entities
*   **User**: Profiles including `InterestType` (Adventure, Culture, etc.) and `TravelPreference` (Solo/Group).
*   **TripRequest**: The central booking entity. Links Users to Groups and statuses (REQUESTED -> PLANNED -> PAYMENT_PENDING -> CONFIRMED).
*   **TripPlan**: Detailed itinerary rows. One [TripRequest](file:///d:/TFC/tf_hackaton/Nomad/Desktop/Nomad/nomad/src/main/java/com/tripfactory/nomad/domain/entity/TripRequest.java#26-86) has many [TripPlan](file:///d:/TFC/tf_hackaton/Nomad/Desktop/Nomad/nomad/src/main/java/com/tripfactory/nomad/domain/entity/TripPlan.java#18-49) items (Day 1: 9 AM - Place A, 11 AM - Place B).
*   **TripGroup**: Collection of users traveling together.
*   **Place**: Destination metadata (Lat/Long, Category, Rating).
*   **Payment**: Financial transaction records linked to Razorpay IDs.
*   **TravelAssistance**: Logistics details (Pickup time, Vehicle assigned).

---

## 6. API Reference (Functional Areas)

| Controller | path | Purpose |
| :--- | :--- | :--- |
| **AuthController** | `/api/auth` | Registration, Login, Current User profile |
| **TripController** | `/api/trips` | Create new trips, Get itinerary details |
| **TripGroupController** | `/api/groups` | View group members and status |
| **PaymentController** | `/api/payment` | Create orders, Verify payments, Webhooks |
| **TravelController** | `/api/travel` | Manage pickups and vehicle assistance |
| **AdminController** | `/api/admin` | Manage Places and Vehicles (CRUD) |
| **ReviewController** | `/api/reviews` | Submit and view ratings |

---

## 7. Unique Selling Points (Why this codebase is special)

1.  **"One-Click" Itinerary**: Unlike standard booking sites that just list hotels, Nomad **builds the schedule** for you. It solves the "what should I do there?" problem.
2.  **Social Engineering**: The logic to auto-group strangers based on shared interests is a sophisticated feature rarely found in basic travel apps.
3.  **Real-world Logistics**: The system doesn't just stop at booking; it models the **actual execution** of the trip (Vehicle assignment, Route tracking, Pickup timings).
4.  **Robustness**: Handled edge cases like "Nightlife goes last", "Fill cars efficiently", and "Async payment confirmation".
