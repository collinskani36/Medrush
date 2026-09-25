// ─── Pharmacy anchor point ───────────────────────────────────────────────────
// All delivery distances are measured from here. Update if the pharmacy moves.
export const PHARMACY_COORDS = {
  lat: 0.5447,
  lng: 35.2587,
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DeliveryTier {
  max_km: number;
  fee: number;
}

export interface DeliveryPricing {
  road_distance_factor: number;
  tiers: DeliveryTier[];
}

// ─── Haversine ───────────────────────────────────────────────────────────────
// Straight-line distance in km between two lat/lng points.
// Callers must multiply by road_distance_factor before resolving a tier fee —
// this function is intentionally a pure geometric primitive.
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function distanceFromPharmacy(lat: number, lng: number): number {
  return haversineDistance(PHARMACY_COORDS.lat, PHARMACY_COORDS.lng, lat, lng);
}

// Converts straight-line km to approximate on-road km using the admin-set factor.
export function estimateRoadDistance(straightLineKm: number, factor: number): number {
  return straightLineKm * factor;
}

// Returns the delivery fee in KSh for the first tier whose max_km >= roadDistanceKm,
// or null if outside all tiers (caller should show an out-of-range message).
//
// ⚠️  CLIENT-SIDE PREVIEW ONLY — never use this as the authoritative fee.
// The real charge must always be recalculated server-side from raw lat/lng
// so it cannot be spoofed via devtools.
export function calculateDeliveryFee(
  roadDistanceKm: number,
  tiers: DeliveryTier[],
): number | null {
  const sorted = [...tiers].sort((a, b) => a.max_km - b.max_km);
  for (const tier of sorted) {
    if (roadDistanceKm <= tier.max_km) return tier.fee;
  }
  return null;
}

// Fallback used for the very brief window before the delivery_pricing Supabase
// row loads. Mirrors sensible defaults so the map is usable immediately.
export const DEFAULT_DELIVERY_PRICING: DeliveryPricing = {
  road_distance_factor: 1.5,
  tiers: [
    { max_km: 3, fee: 50 },
    { max_km: 6, fee: 100 },
    { max_km: 10, fee: 150 },
  ],
};
