import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, Clock, ShoppingBag, FileText, Stethoscope, ArrowRight,
  Search, Syringe,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PHARMACY_CONFIG, CATEGORIES } from "@/config";
import { getCategoryIcon } from "@/lib/categoryIcons";

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero — compact, four equally-weighted primary actions, no filler copy */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div
          className="rx-texture absolute inset-0 opacity-50"
          style={{ backgroundColor: "var(--color-primary-deep)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />

        <div className="relative mx-auto max-w-5xl px-4 pt-12 pb-4 md:pt-16 md:pb-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h1 className="tracking-display font-display text-3xl font-medium leading-[1.1] text-white md:text-5xl">
              Pharmaceutical Services, delivered like it matters.
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
                to="/prescription"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition-transform hover:scale-[1.02]"
              >
                <FileText className="h-4 w-4" /> Upload prescription
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

      {/* Shop by category — same premium look as the hero (texture, gradient, frosted tiles, gold accents) */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div
          className="rx-texture absolute inset-0 opacity-50"
          style={{ backgroundColor: "var(--color-primary-deep)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-ink)] to-[var(--color-primary-deep)] opacity-95" />

        <div className="relative mx-auto max-w-5xl px-4 pb-12 pt-0 md:pb-16 md:pt-1">
          <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="tracking-display font-display text-2xl font-medium text-white md:text-3xl">
              Shop by category
            </h2>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="relative w-full md:w-72">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for a medicine…"
                  className="h-11 w-full rounded-full border border-white/15 bg-white/10 pl-10 pr-4 text-sm text-white outline-none backdrop-blur-md transition-all placeholder:text-white/50 focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </form>
              <Link
                to="/products"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]"
              >
                Browse all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((category) => {
              const Icon = getCategoryIcon(category);
              return (
                <Link
                  key={category}
                  to={`/products?category=${encodeURIComponent(category)}`}
                  className="group flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.12] hover:shadow-[var(--shadow-gold)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium text-white">{category}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}