import type { CSSProperties } from "react";

type Tone = "surface" | "background" | "card";

interface HeartbeatLoaderProps {
  /** Small text under the line, e.g. "Loading products". */
  label?: string;
  /**
   * Must match the colour of whatever the loader sits on, because the
   * animation hides the line with blocks painted in that colour.
   * surface = bg-surface, background = bg-background, card = bg-card.
   */
  tone?: Tone;
  className?: string;
}

export function HeartbeatLoader({ label, tone = "surface", className = "" }: HeartbeatLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className="hb-loader"
        style={{ "--hb-mask": `var(--${tone})` } as CSSProperties}
        aria-hidden="true"
      >
        <svg viewBox="0 0 150 73" xmlns="http://www.w3.org/2000/svg">
          <polyline
            points="0,45.486 38.514,45.486 44.595,33.324 50.676,45.486 57.771,45.486 62.838,55.622 71.959,9 80.067,63.729 84.122,45.486 97.297,45.486 103.379,40.419 110.473,45.486 150,45.486"
            strokeMiterlimit={10}
            strokeWidth={3}
            fill="none"
          />
        </svg>
        <div className="hb-in" />
        <div className="hb-out" />
      </div>
      {label ? (
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}
