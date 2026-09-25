import { PHARMACY_CONFIG } from "@/config";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 bg-[var(--color-ink)] text-white/70">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <MapPin className="h-3.5 w-3.5 text-white/40" /> {PHARMACY_CONFIG.address}
            </div>
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Phone className="h-3.5 w-3.5 text-white/40" /> {PHARMACY_CONFIG.phone}
            </div>
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <Clock className="h-3.5 w-3.5 text-white/40" /> {PHARMACY_CONFIG.hours}
            </div>
          </div>

          <a
            href={`https://wa.me/${PHARMACY_CONFIG.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-white/35 sm:text-left">
          © {new Date().getFullYear()} {PHARMACY_CONFIG.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}