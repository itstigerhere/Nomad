/**
 * Dummy "activities to do" text per place category — for nearby attractions and place detail.
 */

const ACTIVITIES_BY_CATEGORY: Record<string, string> = {
  NATURE: "Explore trails, bird watching, photography, nature walks, picnics.",
  CULTURE: "Guided tours, photography, heritage walk, local history, architecture viewing.",
  FOOD: "Food walk, street food tasting, local cuisine, cooking demos.",
  RELAXATION: "Stroll along the waterfront, sunset viewing, photography, quiet time.",
  SHOPPING: "Browsing local shops, street markets, souvenirs, people watching.",
  NIGHTLIFE: "Evening stroll, live music, cafes, night photography.",
  ADVENTURE: "Trekking, outdoor activities, photography, exploration.",
};

const DEFAULT_ACTIVITIES = "Sightseeing, photography, walking tour, local exploration.";

/** Returns dummy activities text for a place (by category or default). */
export function getPlaceActivities(place: { category?: string } | null): string {
  if (!place) return DEFAULT_ACTIVITIES;
  const category = place.category ? String(place.category).toUpperCase() : "";
  return ACTIVITIES_BY_CATEGORY[category] ?? DEFAULT_ACTIVITIES;
}
