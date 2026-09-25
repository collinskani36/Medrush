import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { LocationConfirmPayload } from "./LocationPickerMap";

// LocationPickerMap imports "leaflet", which touches `window` as a side
// effect of being imported (not just rendered). TanStack Start's SSR pass
// evaluates every module reachable from a route's import graph, so a plain
// top-level `import LocationPickerMap from "./LocationPickerMap"` here would
// still crash on the server even though the component itself is never
// rendered server-side.
//
// React.lazy() defers that import() call until React actually tries to
// render the component, and <ClientOnly> guarantees that only happens in
// the browser — so the leaflet module is never loaded during SSR at all.
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
    <ClientOnly fallback={<MapSkeleton />}>
      <Suspense fallback={<MapSkeleton />}>
        <LocationPickerMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}