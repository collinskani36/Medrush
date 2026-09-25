import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Geolocation } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import { Locate, MapPin } from "lucide-react";
import {
  PHARMACY_COORDS,
  distanceFromPharmacy,
  estimateRoadDistance,
  calculateDeliveryFee,
  DEFAULT_DELIVERY_PRICING,
  DeliveryPricing,
} from "@/lib/geo";
import { reverseGeocode } from "@/lib/geocode";
import { supabase } from "@/lib/supabase";

// Fix Leaflet's broken default marker icon when bundled with Vite.
// Safe here because this module is only ever loaded in the browser
// (see LocationPicker.tsx, which lazy-loads it inside <ClientOnly>).
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Props ───────────────────────────────────────────────────────────────────

export interface LocationConfirmPayload {
  lat: number;
  lng: number;
  address: string;
  distanceKm: number;
  // ⚠️  CLIENT-SIDE ESTIMATE ONLY — CheckoutPage must re-verify the real fee
  // server-side from lat/lng before charging anything.
  fee: number | null;
}

interface LocationPickerMapProps {
  onConfirm: (data: LocationConfirmPayload) => void;
}

// ─── Map helpers ─────────────────────────────────────────────────────────────

// Forces Leaflet to recompute its tile grid once the container has settled its
// final size. Without this, maps inside flex/card layouts render a broken grey
// checkerboard until the window is manually resized.
function MapSizeFix() {
  const map = useMap();
  useEffect(() => {
    const timers = [100, 300, 600].map((ms) =>
      setTimeout(() => map.invalidateSize(), ms),
    );
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(map.getContainer());
    return () => {
      timers.forEach(clearTimeout);
      ro.disconnect();
    };
  }, [map]);
  return null;
}

function RecenterOnChange({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

function DraggableMarker({
  position,
  setPosition,
}: {
  position: [number, number];
  setPosition: (p: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend(e) {
          const pos = e.target.getLatLng();
          setPosition([pos.lat, pos.lng]);
        },
      }}
    />
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

const LocationPickerMap = ({ onConfirm }: LocationPickerMapProps) => {
  const [position, setPosition] = useState<[number, number]>([
    PHARMACY_COORDS.lat,
    PHARMACY_COORDS.lng,
  ]);
  const [address, setAddress]         = useState("");
  const [distanceKm, setDistanceKm]   = useState(0);
  const [fee, setFee]                 = useState<number | null>(null);
  const [locating, setLocating]       = useState(false);
  const [geocoding, setGeocoding]     = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [hasLocated, setHasLocated]   = useState(false);

  const debounceRef      = useRef<ReturnType<typeof setTimeout>>();
  const geocodeSeqRef     = useRef(0); // guards against out-of-order geocode responses
  const hasRequestedRef  = useRef(false);

  // Admin-configured pricing — falls back to DEFAULT_DELIVERY_PRICING while
  // the Supabase fetch resolves (or indefinitely, if Supabase isn't configured
  // for this deployment). The real fee is always re-verified server-side.
  const [pricing, setPricing] = useState<DeliveryPricing>(DEFAULT_DELIVERY_PRICING);

  useEffect(() => {
    if (!supabase) return; // env vars not set for this deploy — stick with defaults
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("delivery_pricing")
        .select("road_distance_factor, tiers")
        .limit(1)
        .single();

      if (!cancelled && !error && data) {
        setPricing({
          road_distance_factor: Number(data.road_distance_factor),
          tiers: data.tiers,
        });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Geolocation helpers ───────────────────────────────────────────────────

  const checkWebPermission = async (): Promise<PermissionState> => {
    if (!navigator.permissions) return "prompt";
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state;
    } catch {
      return "prompt";
    }
  };

  // Tries high-accuracy GPS first; falls back once to a relaxed lower-accuracy
  // request so indoor / low-signal locations still succeed.
  const getPositionWithFallback = async () => {
    try {
      return await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    } catch (err: any) {
      if (err?.code === 1) throw err; // PERMISSION_DENIED — don't retry
      return await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 20000 });
    }
  };

  const locateUser = async () => {
    setLocating(true);
    setPermissionDenied(false);
    setLocateError(null);

    if (Capacitor.isNativePlatform()) {
      try {
        const perm = await Geolocation.requestPermissions().catch(() => null);
        if (perm?.location === "denied") { setPermissionDenied(true); setLocating(false); return; }
        const coords = await getPositionWithFallback();
        setPosition([coords.coords.latitude, coords.coords.longitude]);
        setHasLocated(true);
      } catch (err: any) {
        if (err?.code === 1) setPermissionDenied(true);
        else setLocateError("Couldn't get a location fix — drag the pin to your delivery spot.");
      } finally {
        setLocating(false);
      }
      return;
    }

    // Web path
    try {
      const state = await checkWebPermission();
      if (state === "denied") { setPermissionDenied(true); setLocating(false); return; }
      const coords = await getPositionWithFallback();
      setPosition([coords.coords.latitude, coords.coords.longitude]);
      setHasLocated(true);
    } catch (err: any) {
      if (err?.code === 1) setPermissionDenied(true);
      else setLocateError("Couldn't get a location fix — drag the pin to your delivery spot.");
    } finally {
      setLocating(false);
    }
  };

  // On native, auto-request location once on mount
  useEffect(() => {
    if (hasRequestedRef.current) return;
    hasRequestedRef.current = true;
    if (Capacitor.isNativePlatform()) locateUser();
  }, []);

  // Recalculate distance/fee whenever pin moves or pricing loads;
  // debounce the reverse-geocode call to avoid hammering Nominatim, and guard
  // against an older in-flight request resolving after a newer one and
  // clobbering the address with stale data.
  useEffect(() => {
    const [lat, lng] = position;
    const straightKm = distanceFromPharmacy(lat, lng);
    const roadKm     = estimateRoadDistance(straightKm, pricing.road_distance_factor);
    setDistanceKm(roadKm);
    setFee(calculateDeliveryFee(roadKm, pricing.tiers));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const seq = ++geocodeSeqRef.current;
      setGeocoding(true);
      const addr = await reverseGeocode(lat, lng);
      if (seq === geocodeSeqRef.current) {
        setAddress(addr);
        setGeocoding(false);
      }
    }, 600);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [position, pricing]);

  const handleConfirm = () => {
    onConfirm({ lat: position[0], lng: position[1], address, distanceKm, fee });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* Status hints */}
      {permissionDenied && (
        <p className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          Location access was denied — drag the pin to your delivery spot manually.
        </p>
      )}
      {locateError && !permissionDenied && (
        <p className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          {locateError}
        </p>
      )}
      {!permissionDenied && !locateError && !hasLocated && !locating && !Capacitor.isNativePlatform() && (
        <p className="rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          Tap "Use my location" to auto-fill, or drag the pin to your delivery spot.
        </p>
      )}

      {/* Map */}
      <div
        className="relative overflow-hidden rounded-xl border border-border"
        style={{ height: 280, width: "100%" }}
      >
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <DraggableMarker position={position} setPosition={setPosition} />
          <RecenterOnChange position={position} />
          <MapSizeFix />
        </MapContainer>

        {/* Locate button overlaid on the map */}
        <button
          type="button"
          onClick={locateUser}
          disabled={locating}
          className="absolute bottom-3 right-3 z-[1000] flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-md hover:bg-secondary disabled:opacity-60"
        >
          <Locate className="h-4 w-4" />
          {locating ? "Locating…" : "Use my location"}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Tap the map or drag the pin to your exact delivery spot.
      </p>

      {/* Address + distance preview */}
      <div className="rounded-xl border border-border bg-card p-3 space-y-1">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm text-foreground">
            {geocoding ? "Finding address…" : address || "Move the pin to see your address"}
          </p>
        </div>
        <p className="pl-6 text-xs text-muted-foreground">
          ~{distanceKm.toFixed(1)} km by road from the pharmacy (estimated)
        </p>
      </div>

      {/* Out-of-range warning or confirm button */}
      {fee === null ? (
        <p className="text-sm text-destructive">
          That location is outside our delivery area. Please move the pin closer to the pharmacy.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Confirm location — delivery KSh {fee}
        </button>
      )}
    </div>
  );
};

export default LocationPickerMap;
