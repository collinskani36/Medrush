import { lazy, Suspense } from "react";
import type { LocationConfirmPayload } from "./LocationPickerMap";

// LocationPickerMap imports "leaflet", which touches `window` as a side
// effect of being imported (not just rendered). This app is a plain
// client-rendered SPA (no SSR), so that's never an issue at runtime — but
// React.lazy() is still worth keeping so the leaflet/react-leaflet bundle
// is code-split out of the main chunk instead of loaded on every page.
const LocationPickerMap = lazy(() => import("./LocationPickerMap"));

export type { LocationConfirmPayload };

interface LocationPickerProps {
  onConfirm: (data: LocationConfirmPayload) => void;
}

function MapSkeleton() {
  return (
    <div
      className="rounded-xl border border-border bg-card animate-pulse"
      style={{ height: 280, width: "100%" }}
      aria-hidden
    />
  );
}

export default function LocationPicker(props: LocationPickerProps) {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <LocationPickerMap {...props} />
    </Suspense>
  );
}