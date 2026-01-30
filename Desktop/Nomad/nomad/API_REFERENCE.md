# Nomad API Reference

Base URL: `http://localhost:8080` (or your server)

All request/response bodies are **JSON** unless noted.  
Auth: send `Authorization: Bearer <JWT>` for protected endpoints.

---

## Table of Contents

1. [Auth](#1-auth)
2. [Users](#2-users)
3. [Packages](#3-packages)
4. [Places](#4-places)
5. [Trips](#5-trips)
6. [Routes](#6-routes)
7. [Groups](#7-groups)
8. [Payment](#8-payment)
9. [Refunds](#9-refunds)
10. [Travel (Pickup)](#10-travel-pickup)
11. [Share](#11-share)
12. [Reviews](#12-reviews)
13. [Place Reviews](#13-place-reviews)
14. [Wishlist](#14-wishlist)
15. [Pro](#15-pro)
16. [Enrollment](#16-enrollment)
17. [Admin](#17-admin)
18. [Contact](#18-contact)

---

## 1. Auth

**Base path:** `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT |
| GET | `/api/auth/me` | Yes | Current user profile |
| POST | `/api/auth/forgot-password` | No | Request password reset email |
| POST | `/api/auth/reset-password` | No | Reset password with token |

### POST `/api/auth/register`

**Request body:** `AuthRegisterRequest`

```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "phoneNumber": "string (optional)",
  "password": "string (required)",
  "city": "string (required)",
  "latitude": "number (required)",
  "longitude": "number (required)",
  "interestType": "FOOD | CULTURE | NATURE | ADVENTURE | SHOPPING | NIGHTLIFE | RELAXATION (required)",
  "travelPreference": "SOLO | GROUP (required)",
  "referralCode": "string (optional)"
}
```

**Response:** `201` → `AuthResponse`

```json
{
  "token": "string (JWT)",
  "user": { "id", "name", "email", "phoneNumber", "city", "latitude", "longitude", "interestType", "travelPreference", "role", "createdAt", "profilePhotoUrl", "referralCode" }
}
```

---

### POST `/api/auth/login`

**Request body:** `AuthLoginRequest`

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:** `200` → `AuthResponse` (same as register)

---

### GET `/api/auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200` → `UserResponse`

```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "city": "string",
  "latitude": "number",
  "longitude": "number",
  "interestType": "string",
  "travelPreference": "string",
  "role": "USER | ADMIN",
  "createdAt": "datetime",
  "profilePhotoUrl": "string",
  "referralCode": "string"
}
```

---

### POST `/api/auth/forgot-password`

**Request body:** `ForgotPasswordRequest`

```json
{
  "email": "string (required)"
}
```

**Response:** `200` (no body; email sent if user exists)

---

### POST `/api/auth/reset-password`

**Request body:** `ResetPasswordRequest`

```json
{
  "token": "string (required)",
  "newPassword": "string (required)"
}
```

**Response:** `200` (no body)

---

## 2. Users

**Base path:** `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/users` | Admin | Create user |
| GET | `/api/users/{id}` | Owner/Admin | Get user by ID |
| PUT | `/api/users/{id}` | Owner/Admin | Update user |
| POST | `/api/users/me/photo` | Yes | Upload profile photo |
| GET | `/api/users/photo/{filename}` | No | Get profile photo (public) |

### POST `/api/users`

**Request body:** `UserCreateRequest`

```json
{
  "name": "string (required)",
  "email": "string (required)",
  "phoneNumber": "string",
  "city": "string (required)",
  "latitude": "number (required)",
  "longitude": "number (required)",
  "interestType": "string (required)",
  "travelPreference": "string (required)"
}
```

**Response:** `201` → `UserResponse`

---

### GET `/api/users/{id}`

**Response:** `200` → `UserResponse`

---

### PUT `/api/users/{id}`

**Request body:** `UserUpdateRequest`

```json
{
  "name": "string (required)",
  "city": "string (required)",
  "phoneNumber": "string",
  "latitude": "number (required)",
  "longitude": "number (required)",
  "interestType": "string (required)",
  "travelPreference": "string (required)"
}
```

**Response:** `200` → `UserResponse`

---

### POST `/api/users/me/photo`

**Content-Type:** `multipart/form-data`  
**Body:** `file` (image file)

**Response:** `200` → profile photo URL string (e.g. `"/api/users/photo/user-1-123.jpg"`)

---

### GET `/api/users/photo/{filename}`

**Response:** `200` → image binary (or 404)

---

## 3. Packages

**Base path:** `/api/packages`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/packages/homepage` | No | Featured packages (e.g. first 3) |
| GET | `/api/packages/all` | No | All packages |
| GET | `/api/packages/search` | No | Search/filter packages by city, price, sort |
| GET | `/api/packages/{id}` | No | Package details |
| POST | `/api/packages/{id}/enroll` | Yes | Enroll in package and create payment order |

### GET `/api/packages/homepage`

**Response:** `200` → `List<PackageSummaryResponse>`

```json
[
  {
    "id": "number",
    "name": "string",
    "shortDescription": "string",
    "price": "number",
    "imageUrl": "string",
    "sponsored": "boolean"
  }
]
```

---

### GET `/api/packages/all`

**Response:** `200` → `List<PackageSummaryResponse>` (same shape; sponsored first)

---

### GET `/api/packages/search`

**Query params:** (all optional)

| Param | Type | Description |
|-------|------|-------------|
| city | string | Filter by city or keyword (matched against package name) |
| minPrice | number | Minimum price (INR) |
| maxPrice | number | Maximum price (INR) |
| sort | string | `price_asc`, `price_desc`, `name`, or omit for featured-first |

**Response:** `200` → `List<PackageSummaryResponse>` (same shape as `/all`; filtered and sorted)

---

### GET `/api/packages/{id}`

**Response:** `200` → `PackageDetailResponse` or `404`

```json
{
  "id": "number",
  "name": "string",
  "description": "string",
  "price": "number",
  "imageUrl": "string",
  "places": [ { "id", "name", "city", "latitude", "longitude", "category", "rating" } ],
  "activities": [ "string" ],
  "averageRating": "number",
  "sponsored": "boolean"
}
```

---

### POST `/api/packages/{id}/enroll`

**Request body:** `PackageEnrollRequest`

```json
{
  "amount": "number (required, >= 1)",
  "travelDate": "date (optional, ISO date YYYY-MM-DD) — trip start date for cancellation policy"
}
```

**Response:** `201` → `PaymentCreateResponse` (see Payment section)

---

## 4. Places

**Base path:** `/api/places`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/places/nearby` | No | Nearby places by location |
| GET | `/api/places/{id}` | No | Place by ID |

### GET `/api/places/nearby`

**Query params:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| city | string | No | - | Filter by city |
| latitude | double | Yes | - | User latitude |
| longitude | double | Yes | - | User longitude |
| interest | string | No | - | InterestType enum |
| radiusKm | double | No | 15 | Radius in km |
| limit | int | No | 20 | Max results |

**Response:** `200` → `List<PlaceNearbyResponse>`

```json
[
  {
    "id": "number",
    "name": "string",
    "city": "string",
    "latitude": "number",
    "longitude": "number",
    "category": "string",
    "rating": "number",
    "distanceKm": "number",
    "description": "string",
    "imageUrl": "string",
    "openingHours": "string"
  }
]
```

---

### GET `/api/places/{id}`

**Response:** `200` → `PlaceResponse`

```json
{
  "id": "number",
  "name": "string",
  "city": "string",
  "latitude": "number",
  "longitude": "number",
  "category": "string",
  "rating": "number",
  "description": "string",
  "imageUrl": "string",
  "openingHours": "string"
}
```

---

## 5. Trips

**Base path:** `/api/trips`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/trips/preview` | Yes | Preview plan options (no save) |
| POST | `/api/trips/create` | Yes | Create trip from selected plan |
| POST | `/api/trips/create-from-places` | Yes | Create custom trip from place IDs |
| GET | `/api/trips/me` | Yes | My trips |
| GET | `/api/trips/{id}` | Trip owner/Admin | Get trip by ID |
| PATCH | `/api/trips/{id}/cancel` | Trip owner/Admin | Cancel trip |
| GET | `/api/trips/user/{userId}` | Owner/Admin | Trips by user |

### POST `/api/trips/preview`

**Request body:** `PlanPreviewRequest`

```json
{
  "userId": "number (required)",
  "city": "string",
  "weekendType": "ONE_DAY | TWO_DAY",
  "interest": "string",
  "travelMode": "SOLO | GROUP",
  "pickupRequired": "boolean",
  "userLatitude": "number",
  "userLongitude": "number",
  "travelDate": "yyyy-MM-dd"
}
```

**Response:** `200` → `PlanPreviewResponse`

```json
{
  "city": "string",
  "planOptions": [
    {
      "type": "string (e.g. FOOD Only, Hybrid)",
      "places": [
        {
          "dayNumber": "number",
          "placeId": "number",
          "placeName": "string",
          "startTime": "HH:mm",
          "endTime": "HH:mm",
          "distanceFromPrevious": "number",
          "latitude": "number",
          "longitude": "number",
          "city": "string",
          "category": "string",
          "rating": "number"
        }
      ]
    }
  ]
}
```

---

### POST `/api/trips/create`

**Request body:** `TripCreateRequest`

```json
{
  "userId": "number (required)",
  "travelDate": "yyyy-MM-dd",
  "city": "string",
  "weekendType": "ONE_DAY | TWO_DAY",
  "interest": "string",
  "travelMode": "SOLO | GROUP",
  "pickupRequired": "boolean",
  "groupSize": "number",
  "userLatitude": "number",
  "userLongitude": "number",
  "selectedPlanType": "string (required, e.g. FOOD Only, Hybrid)"
}
```

**Response:** `201` → `TripResponse`

```json
{
  "tripRequestId": "number",
  "userId": "number",
  "city": "string",
  "travelDate": "yyyy-MM-dd",
  "groupId": "number | null",
  "groupSize": "number | null",
  "shareToken": "string | null",
  "status": "REQUESTED | PLANNED | PAYMENT_PENDING | CONFIRMED | CANCELLED",
  "createdAt": "datetime",
  "estimatedCost": "number",
  "userLatitude": "number",
  "userLongitude": "number",
  "plans": [ { "type": "string", "places": [ "TripPlanItemResponse" ] } ]
}
```

---

### POST `/api/trips/create-from-places`

**Request body:** `TripCreatePlacesRequest`

```json
{
  "userId": "number (required)",
  "travelDate": "yyyy-MM-dd",
  "city": "string",
  "userLatitude": "number",
  "userLongitude": "number",
  "placeIds": [ "number (required, non-empty)" ]
}
```

**Response:** `201` → `TripResponse` (same shape)

---

### GET `/api/trips/me`

**Response:** `200` → `List<TripResponse>`

---

### GET `/api/trips/{id}`

**Response:** `200` → `TripResponse`

---

### PATCH `/api/trips/{id}/cancel`

**Response:** `200` → `TripResponse` (status = CANCELLED)

---

### GET `/api/trips/user/{userId}`

**Response:** `200` → `List<TripResponse>`

---

## 6. Routes

**Base path:** `/api/routes`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/routes/{tripRequestId}` | Trip owner/Admin | Get or create route (Mapbox) for a day |

### GET `/api/routes/{tripRequestId}`

**Query params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| dayNumber | int | 1 | Day number |
| mode | string | driving | `driving` or `walking` |

**Response:** `200` → `TripRouteResponse`

```json
{
  "tripRequestId": "number",
  "dayNumber": "number",
  "mode": "string",
  "geoJson": "string (GeoJSON geometry)"
}
```

---

## 7. Groups

**Base path:** `/api/groups`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/groups` | Yes | Create group |
| GET | `/api/groups/{groupId}` | Group member/Admin | Get group |
| GET | `/api/groups/{groupId}/members` | Group member/Admin | Get group members |

### POST `/api/groups`

**Request body:** `TripGroupCreateRequest`

```json
{
  "city": "string",
  "interest": "string",
  "weekendType": "ONE_DAY | TWO_DAY"
}
```

**Response:** `200` → `TripGroupResponse`

```json
{
  "id": "number",
  "city": "string",
  "interest": "string",
  "weekendType": "string",
  "status": "OPEN | READY | CLOSED",
  "size": "number",
  "createdAt": "datetime"
}
```

---

### GET `/api/groups/{groupId}`

**Response:** `200` → `TripGroupResponse`

---

### GET `/api/groups/{groupId}/members`

**Response:** `200` → `List<TripGroupMemberResponse>`

```json
[
  {
    "tripRequestId": "number",
    "userId": "number",
    "name": "string",
    "city": "string",
    "interestType": "string",
    "tripStatus": "string",
    "joinedAt": "datetime",
    "profilePhotoUrl": "string"
  }
]
```

---

## 8. Payment

**Base path:** `/api/payment`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payment/create` | Trip owner/Admin | Create Razorpay order |
| POST | `/api/payment/verify` | No | Verify payment after checkout |
| POST | `/api/payment/webhook` | No | Razorpay webhook (X-Razorpay-Signature) |

### POST `/api/payment/create`

**Request body:** `PaymentCreateRequest`

```json
{
  "tripRequestId": "number (required)",
  "amount": "number (required, >= 1)",
  "promoCode": "string (optional) — e.g. WELCOME10; discount applied before convenience fee"
}
```

**Response:** `201` → `PaymentCreateResponse`

```json
{
  "paymentId": "number",
  "tripRequestId": "number",
  "amount": "number",
  "convenienceFee": "number | null",
  "razorpayOrderId": "string",
  "paymentStatus": "CREATED | CAPTURED | FAILED",
  "createdAt": "datetime"
}
```

---

### POST `/api/payment/verify`

**Request body:** `PaymentVerifyRequest`

```json
{
  "razorpayOrderId": "string (required)",
  "razorpayPaymentId": "string (required)",
  "razorpaySignature": "string (required)"
}
```

**Response:** `200` → `PaymentCreateResponse` (status CAPTURED on success)

---

### POST `/api/payment/webhook`

**Headers:** `X-Razorpay-Signature: <signature>`  
**Body:** Raw Razorpay webhook payload (string)

**Response:** `200` (no body)

---

## 9. Refunds

**Base path:** `/api/refunds`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/refunds/policy/{tripRequestId}` | Trip owner/Admin | Cancellation policy + estimated refund |
| POST | `/api/refunds/request` | Trip owner/Admin | Request refund |

### GET `/api/refunds/policy/{tripRequestId}`

**Response:** `200` → `CancellationPolicyResponse`

```json
{
  "fullRefundDays": "number",
  "partialRefundDays": "number",
  "partialRefundPercent": "number",
  "estimatedRefundAmount": "number"
}
```

---

### POST `/api/refunds/request`

**Request body:** `RefundRequest`

```json
{
  "tripRequestId": "number (required)",
  "reason": "string"
}
```

**Response:** `201` → `RefundResponse`

```json
{
  "refundId": "number",
  "tripRequestId": "number",
  "paymentId": "number",
  "amount": "number",
  "reason": "string",
  "status": "PENDING | PROCESSED | FAILED",
  "createdAt": "datetime"
}
```

---

## 10. Travel (Pickup)

**Base path:** `/api/travel`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/travel/assign` | Trip owner/Admin | Assign pickup for trip |
| GET | `/api/travel/{tripId}` | Trip owner/Admin | Get pickup details |
| PUT | `/api/travel/{tripId}` | Admin | Admin update pickup |
| PUT | `/api/travel/{tripId}/confirm` | Trip owner/Admin | User confirm pickup time |

### POST `/api/travel/assign`

**Request body:** `TravelAssignRequest`

```json
{
  "tripRequestId": "number (required)"
}
```

**Response:** `201` → `TravelAssistanceResponse`

```json
{
  "tripRequestId": "number",
  "pickupLocation": "string",
  "pickupTime": "datetime",
  "vehicleId": "number",
  "vehicleType": "string",
  "driverName": "string",
  "vehicleNumber": "string",
  "routeMapUrl": "string | null",
  "status": "string"
}
```

---

### GET `/api/travel/{tripId}`

**Response:** `200` → `TravelAssistanceResponse`

---

### PUT `/api/travel/{tripId}` (Admin)

**Request body:** `PickupAdminUpdateRequest`

```json
{
  "pickupTime": "datetime",
  "status": "string",
  "routeMapUrl": "string",
  "vehicleId": "number"
}
```

**Response:** `200` → `TravelAssistanceResponse`

---

### PUT `/api/travel/{tripId}/confirm`

**Request body:** `PickupConfirmRequest`

```json
{
  "pickupTime": "datetime (required)"
}
```

**Response:** `200` → `TravelAssistanceResponse`

---

## 11. Share

**Base path:** `/api/share`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/share/{token}` | No | Get shared trip by token |

### GET `/api/share/{token}`

**Response:** `200` → `TripResponse` (trip + plans; shareToken in response)

---

## 12. Reviews (Trip)

**Base path:** `/api/reviews`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reviews` | Trip owner (paid) | Create trip review |
| GET | `/api/reviews/{tripId}` | No | List reviews for trip |
| GET | `/api/reviews/{tripId}/summary` | No | Average rating + counts + canReview/alreadyReviewed |

### POST `/api/reviews`

**Request body:** `ReviewCreateRequest`

```json
{
  "tripRequestId": "number (required)",
  "rating": "number (required, 1-5)",
  "comment": "string"
}
```

**Response:** `201` → `ReviewResponse`

```json
{
  "id": "number",
  "tripRequestId": "number",
  "rating": "number",
  "comment": "string",
  "verified": "boolean",
  "createdAt": "datetime",
  "reviewerEmail": "string"
}
```

---

### GET `/api/reviews/{tripId}`

**Response:** `200` → `List<ReviewResponse>`

---

### GET `/api/reviews/{tripId}/summary`

**Response:** `200` → `ReviewSummaryResponse`

```json
{
  "averageRating": "number",
  "reviewCount": "number",
  "canReview": "boolean",
  "alreadyReviewed": "boolean"
}
```

---

## 13. Place Reviews

**Base path:** `/api/place-reviews`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/place-reviews/place/{placeId}` | Yes | Create place review |
| GET | `/api/place-reviews/place/{placeId}` | No | List reviews for place |
| GET | `/api/place-reviews/place/{placeId}/average` | No | Average rating |

### POST `/api/place-reviews/place/{placeId}`

**Request body:** `PlaceReviewBodyRequest`

```json
{
  "rating": "number (required, 1-5)",
  "comment": "string"
}
```

**Response:** `201` → `PlaceReviewResponse`

```json
{
  "id": "number",
  "placeId": "number",
  "rating": "number",
  "comment": "string",
  "createdAt": "datetime",
  "reviewerEmail": "string"
}
```

---

### GET `/api/place-reviews/place/{placeId}`

**Response:** `200` → `List<PlaceReviewResponse>`

---

### GET `/api/place-reviews/place/{placeId}/average`

**Response:** `200` → number (average rating, or 0.0)

---

## 14. Wishlist

**Base path:** `/api/wishlist`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/wishlist` | Yes | Add to wishlist |
| DELETE | `/api/wishlist` | Yes | Remove from wishlist |
| GET | `/api/wishlist` | Yes | List my wishlist |
| GET | `/api/wishlist/check` | Yes | Check if in wishlist |

### POST `/api/wishlist`

**Request body:** `WishlistItemRequest`

```json
{
  "targetId": "string (required, e.g. package ID or city name)",
  "targetType": "string (required: PACKAGE | CITY)",
  "notifyPriceBelow": "number",
  "notifyDates": "string"
}
```

**Response:** `201` → `WishlistItemResponse`

```json
{
  "id": "number",
  "targetId": "string",
  "targetType": "string",
  "notifyPriceBelow": "number | null",
  "notifyDates": "string | null",
  "createdAt": "datetime"
}
```

---

### DELETE `/api/wishlist`

**Query params:** `targetId` (string), `targetType` (string)

**Response:** `204` (no body)

---

### GET `/api/wishlist`

**Response:** `200` → `List<WishlistItemResponse>`

---

### GET `/api/wishlist/check`

**Query params:** `targetId`, `targetType`

**Response:** `200` → boolean

---

## 15. Pro

**Base path:** `/api/pro`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/pro/status` | Yes | Current user Pro status |

### GET `/api/pro/status`

**Response:** `200` → `ProStatusResponse`

```json
{
  "pro": "boolean",
  "validUntil": "datetime | null"
}
```

---

## 16. Enrollment

**Base path:** `/api/enroll`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/enroll` | Yes | Enroll user in a trip |

### POST `/api/enroll`

**Request body:** `EnrollmentRequest`

```json
{
  "userId": "number",
  "tripRequestId": "number",
  "paymentToken": "string"
}
```

**Response:** `200` → `EnrollmentResponse`

```json
{
  "success": "boolean",
  "message": "string"
}
```

---

## 17. Admin

**Base path:** `/api/admin`  
**Auth:** All require `hasRole('ADMIN')`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats + recent trips |
| GET | `/api/admin/trips` | List recent trips (paginated) |
| GET | `/api/admin/places` | List all places |
| POST | `/api/admin/places` | Create place |
| DELETE | `/api/admin/places/{id}` | Delete place |
| GET | `/api/admin/vehicles` | List all vehicles |
| POST | `/api/admin/vehicles` | Create vehicle |
| DELETE | `/api/admin/vehicles/{id}` | Delete vehicle |
| POST | `/api/admin/sponsored` | Mark package as sponsored |
| DELETE | `/api/admin/sponsored/{packageId}` | Unmark sponsored |
| POST | `/api/admin/pro/activate` | Activate Pro for user |

### GET `/api/admin/dashboard`

**Response:** `200` → `AdminDashboardResponse`

```json
{
  "userCount": "number",
  "tripCount": "number",
  "placeCount": "number",
  "totalCommission": "number",
  "recentTrips": [
    {
      "tripRequestId": "number",
      "city": "string",
      "status": "string",
      "userId": "number",
      "userEmail": "string",
      "createdAt": "datetime"
    }
  ]
}
```

---

### GET `/api/admin/trips`

**Response:** `200` → `List<RecentTripSummary>` (same item shape as dashboard)

---

### GET `/api/admin/places`

**Response:** `200` → `List<PlaceResponse>`

---

### POST `/api/admin/places`

**Request body:** `PlaceCreateRequest`

```json
{
  "name": "string (required)",
  "city": "string (required)",
  "latitude": "number (required)",
  "longitude": "number (required)",
  "category": "string (required)",
  "rating": "number (required)",
  "description": "string",
  "imageUrl": "string",
  "openingHours": "string"
}
```

**Response:** `201` → `PlaceResponse`

---

### DELETE `/api/admin/places/{id}`

**Response:** `204` (no body)

---

### GET `/api/admin/vehicles`

**Response:** `200` → `List<Vehicle>` (entity: vehicleType, capacity, driverName, vehicleNumber, availabilityStatus, etc.)

---

### POST `/api/admin/vehicles`

**Request body:** `VehicleCreateRequest`

```json
{
  "vehicleType": "CAB | MINI_BUS | BUS (required)",
  "capacity": "number (required)",
  "driverName": "string (required)",
  "vehicleNumber": "string (required)",
  "availabilityStatus": "AVAILABLE | ASSIGNED (required)"
}
```

**Response:** `201` → Vehicle entity

---

### DELETE `/api/admin/vehicles/{id}`

**Response:** `204` (no body)

---

### POST `/api/admin/sponsored`

**Request body:** `{ "packageId": number }`

**Response:** `201` or `200` (no body)

---

### DELETE `/api/admin/sponsored/{packageId}`

**Response:** `204` (no body)

---

### POST `/api/admin/pro/activate`

**Request body:** `ProActivateRequest`

```json
{
  "userId": "number (required)",
  "plan": "MONTHLY | YEARLY (required)",
  "validUntil": "datetime (required)"
}
```

**Response:** `200` (no body)

---

## 18. Contact

**Base path:** `/api/contact`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/contact` | No | Submit contact form (sends email to configured address) |

### POST `/api/contact`

**Request body:** `ContactRequest`

```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "message": "string (required)"
}
```

**Response:** `200` (no body). Message is emailed to the address configured in `nomad.contact.to` (default `admin@nomad.com`).

---

## Enums Reference

| Enum | Values |
|------|--------|
| InterestType | FOOD, CULTURE, NATURE, ADVENTURE, SHOPPING, NIGHTLIFE, RELAXATION |
| TravelPreference / TravelMode | SOLO, GROUP |
| WeekendType | ONE_DAY, TWO_DAY |
| TripStatus | REQUESTED, PLANNED, PAYMENT_PENDING, CONFIRMED, CANCELLED |
| PaymentStatus | CREATED, CAPTURED, FAILED |
| RefundStatus | PENDING, PROCESSED, FAILED |
| GroupStatus | OPEN, READY, CLOSED |
| AssistanceStatus | ASSIGNED, CONFIRMED, etc. |
| VehicleType | CAB, MINI_BUS, BUS |
| AvailabilityStatus | AVAILABLE, ASSIGNED |
| UserRole | USER, ADMIN |
| SubscriptionPlan | MONTHLY, YEARLY |

---

## Error Responses

- **400 Bad Request:** Validation errors or business rule violation (body may include message).
- **401 Unauthorized:** Missing or invalid JWT.
- **403 Forbidden:** Valid JWT but not allowed (e.g. not trip owner).
- **404 Not Found:** Resource not found.
- **500 Internal Server Error:** Server error.

---

*Generated for Nomad backend. Base URL and enum values match the codebase as of this document.*
