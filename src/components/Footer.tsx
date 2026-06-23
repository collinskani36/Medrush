import { PHARMACY_CONFIG } from "@/config";
import { MapPin, Phone, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="font-display text-xl font-semibold">MedRush</div>
            <p className="mt-2 text-sm text-muted-foreground">
              {PHARMACY_CONFIG.tagline}
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {PHARMACY_CONFIG.address}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> {PHARMACY_CONFIG.phone}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" /> {PHARMACY_CONFIG.hours}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-foreground">Need help?</div>
            <a
              href={`https://wa.me/${PHARMACY_CONFIG.whatsapp}`}
              className="mt-1 inline-block text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Chat with us on WhatsApp
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {PHARMACY_CONFIG.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
