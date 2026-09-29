import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Clock, Pill, Stethoscope, Syringe } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PHARMACY_CONFIG } from "@/config";
import heroImg from "@/assets/home-hero.jpeg";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Single-screen hero: image background + original ink/primary tint */}
      <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-end overflow-hidden bg-[var(--color-ink)] md:items-center">
        <img
          src={heroImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[70%_center] md:object-right"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-primary-deep)]/70 via-[var(--color-ink)]/35 to-[var(--color-ink)]/90" />

        <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-10 md:pb-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="tracking-display max-w-xl font-display text-3xl font-medium leading-[1.1] text-white md:text-5xl">
              Pharmaceutical Services, delivered like it matters.
            </h1>
            <p className="mt-3 max-w-lg text-sm text-white/75 md:text-base">
              {PHARMACY_CONFIG.name} — trusted medicines, real doctor consults, same-day delivery.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]"
              >
                <Pill className="h-4 w-4" /> Visit pharmacy
              </Link>

              <Link
                to="/consult"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition-transform hover:scale-[1.02]"
              >
                <Stethoscope className="h-4 w-4" /> Consult a doctor
              </Link>

              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition-transform hover:scale-[1.02]"
              >
                <Syringe className="h-4 w-4" /> Home & clinical services
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/65">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {PHARMACY_CONFIG.address}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {PHARMACY_CONFIG.hours}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}