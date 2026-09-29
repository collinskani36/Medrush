import { PHARMACY_CONFIG } from "@/config";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[var(--color-ink)] text-white/70">
      {/* thin gold hairline for a premium edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="mx-auto max-w-5xl px-4 py-6 md:py-5">
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <div className="flex flex-col items-center gap-1.5 text-xs md:flex-row md:gap-5">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-accent/70" /> {PHARMACY_CONFIG.address}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-accent/70" /> {PHARMACY_CONFIG.phone}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-accent/70" /> {PHARMACY_CONFIG.hours}
            </span>
          </div>

          <a
            href={`https://wa.me/${PHARMACY_CONFIG.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
          </a>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3 text-center text-[11px] text-white/35">
          © {new Date().getFullYear()} {PHARMACY_CONFIG.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}