/**
 * Place images from online sources (Unsplash / Picsum) — no database storage.
 * Maps place name or category to a relevant image URL. Uses reliable URLs only.
 */

const PLACE_IMAGE_URLS: Record<string, string> = {
  "Lalbagh Botanical Garden": "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80",
  "Cubbon Park": "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80",
  "Bangalore Palace": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "VV Puram Food Street": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  "ISKCON Temple": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "Ulsoor Lake": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
  "Marine Drive": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  "Gateway of India": "https://images.unsplash.com/photo-1589559799362-1f9fd50e2b8a?w=800&q=80",
  "Colaba Causeway": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  "Chowpatty Beach": "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80",
  "Sanjay Gandhi National Park": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  "Bandra Bandstand": "https://images.unsplash.com/photo-1513584684374-8b7488f15de2?w=800&q=80",
  "India Gate": "https://images.unsplash.com/photo-1589559799362-1f9fd50e2b8a?w=800&q=80",
  "Qutub Minar": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "Hauz Khas Village": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  "Lodhi Garden": "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80",
  "Chandni Chowk": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  "Akshardham": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
};

const CATEGORY_IMAGE_URLS: Record<string, string> = {
  NATURE: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  CULTURE: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  FOOD: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
  RELAXATION: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  SHOPPING: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  NIGHTLIFE: "https://images.unsplash.com/photo-1513584684374-8b7488f15de2?w=800&q=80",
  ADVENTURE: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
};

/** Get image URL for a place: by name, then by category, then a default. No DB. */
export function getPlaceImageUrl(place: { name?: string; category?: string } | null, size: "thumb" | "large" = "large"): string {
  if (!place) return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80";
  const w = size === "thumb" ? 400 : 800;
  const byName = place.name && PLACE_IMAGE_URLS[place.name];
  if (byName) return byName.replace("w=800", `w=${w}`);
  const category = place.category ? String(place.category).toUpperCase() : "";
  const byCategory = category && CATEGORY_IMAGE_URLS[category];
  if (byCategory) return byCategory.replace("w=800", `w=${w}`);
  return `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=${w}&q=80`;
}
