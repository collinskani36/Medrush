import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Clock, ShoppingBag, FileText, Stethoscope, ArrowRight,
  Pill, Thermometer, Leaf, Bandage, Baby, Sparkles, HeartPulse,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PHARMACY_CONFIG, CATEGORIES } from "@/config";

// Maps each catalog category to a representative icon for its drawer.
// Falls back to a plain pill icon for any category not listed here.
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Pain Relief": <Pill className="h-5 w-5" />,
  "Cold & Flu": <Thermometer className="h-5 w-5" />,
  "Vitamins": <Leaf className="h-5 w-5" />,
  "First Aid": <Bandage className="h-5 w-5" />,
  "Baby Care": <Baby className="h-5 w-5" />,
  "Supplements": <Sparkles className="h-5 w-5" />,
  "Personal Care": <HeartPulse className="h-5 w-5" />,
  "Prescription": <FileText className="h-5 w-5" />,
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero — compact, three equally-weighted primary actions, no filler copy */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div
          className="rx-texture absolute inset-0 opacity-50"
          style={{ backgroundColor: "var(--color-primary-deep)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />

        <div className="relative mx-auto max-w-5xl px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="tracking-display font-display text-3xl font-medium leading-[1.1] text-white md:text-5xl">
              Medicine, delivered like it matters.
            </h1>
            <p className="mt-3 max-w-lg text-sm text-white/65 md:text-base">
              {PHARMACY_CONFIG.name} — trusted medicines, real doctor consults, same-day delivery.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]"
              >
                <ShoppingBag className="h-4 w-4" /> Order now
              </Link>
              <Link
                to="/consult"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition-transform hover:scale-[1.02]"
              >
                <Stethoscope className="h-4 w-4" /> Consult a doctor
              </Link>
              <Link
                to="/prescription"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition-transform hover:scale-[1.02]"
              >
                <FileText className="h-4 w-4" /> Upload prescription
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {PHARMACY_CONFIG.address}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {PHARMACY_CONFIG.hours}
              </span>
              <Link to="/equipment/request" className="text-white/70 hover:text-white">
                Need equipment instead? →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Shop by category — glass drawers replace the featured-products grid */}
      <section className="mx-auto max-w-5xl px-4 py-10 md:py-14">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-xl font-medium md:text-2xl">Shop by category</h2>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-[var(--color-primary-deep)]"
          >
            Browse all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-soft via-accent-soft/50 to-primary-soft p-3 md:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-white/50 bg-white/40 p-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-[var(--shadow-lift)]"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/80 text-primary shadow-sm">
                  {CATEGORY_ICONS[category] ?? <Pill className="h-5 w-5" />}
                </div>
                <div className="font-display text-sm font-medium leading-tight text-foreground md:text-base">
                  {category}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}