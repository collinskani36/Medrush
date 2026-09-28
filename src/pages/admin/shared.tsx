import type React from "react";
import { MapPin } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
   Shared design tokens & helpers (imported by every admin panel)
   ───────────────────────────────────────────────────────────────────────────── */

export const FIELD =
  "h-11 w-full rounded-xl border border-[var(--color-hairline)] bg-card px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10";

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none";

export const BTN_GHOST =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-hairline)] px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground";

export const CARD =
  "overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-card shadow-[var(--shadow-ambient)]";

export const EMPTY =
  "rounded-3xl border border-dashed border-[var(--color-hairline)] bg-card/60 p-12 text-center text-sm text-muted-foreground";

const CHIP_BASE =
  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap";

export const chip = (active: boolean) =>
  `${CHIP_BASE} ${
    active
      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
      : "border-[var(--color-hairline)] bg-card text-muted-foreground hover:border-primary hover:text-foreground"
  }`;

/**
 * Storage URLs are sometimes saved without a protocol (e.g. `xyz.supabase.co/...`).
 * A bare URL in `href` is treated as a *relative* path — which is why prescriptions
 * were opening a new tab and landing on the SPA home route. This normalises it.
 */
export const ensureAbsolute = (url?: string | null): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return trimmed; // site-root relative — usually fine
  return `https://${trimmed}`;
};

export function SectionHeading({
  icon, title, subtitle,
}: {
  icon?: React.ReactNode; title: string; subtitle?: string;
}) {
  return (
    <div>
      <h2 className="flex items-center gap-2 font-display text-lg font-medium tracking-display">
        {icon && <span className="text-primary">{icon}</span>}
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function MiniStat({
  label, value, tone = "neutral",
}: {
  label: string; value: string; tone?: "neutral" | "positive";
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-hairline)] bg-card px-4 py-3 shadow-[var(--shadow-ambient)]">
      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 font-display text-xl font-medium tracking-display ${
          tone === "positive" ? "text-primary" : "text-[var(--color-ink)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/**
 * Compact location badge used on Prescriptions and Equipment cards.
 * Shows "~X km by road" when distance_km is present, and a Google Maps
 * link when lat/lng are present.
 */
export function LocationBadge({
  distanceKm, lat, lng, className = "",
}: {
  distanceKm?: number | null;
  lat?: number | null;
  lng?: number | null;
  className?: string;
}) {
  const hasDist = distanceKm != null;
  const hasCoords = lat != null && lng != null;
  if (!hasDist && !hasCoords) return null;

  return (
    <div className={`inline-flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground ${className}`}>
      <MapPin className="h-3 w-3 shrink-0" />
      {hasDist && <span>~{distanceKm!.toFixed(1)} km by road</span>}
      {hasDist && hasCoords && <span className="text-muted-foreground/50">·</span>}
      {hasCoords && (
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
        >
          Open in Maps
        </a>
      )}
    </div>
  );
}