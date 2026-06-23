import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Clock, ShoppingBag, FileText } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryPills } from "@/components/CategoryPills";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import { PHARMACY_CONFIG } from "@/config";
import type { Product } from "@/types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return products
      .filter((p) => (cat ? p.category === cat : true))
      .filter((p) => (q ? p.name.toLowerCase().includes(q.toLowerCase()) : true))
      .slice(0, 8);
  }, [products, cat, q]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-soft via-background to-accent-soft">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 md:pb-20 md:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {PHARMACY_CONFIG.address}
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
              {PHARMACY_CONFIG.tagline.split(" in ")[0]}
              <span className="text-primary"> in 30 minutes.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Order trusted medicines from {PHARMACY_CONFIG.name}. Fast delivery, real pharmacists, no hassle.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm shadow-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-foreground/80">{PHARMACY_CONFIG.hours}</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-transform hover:scale-[1.03]"
              >
                <ShoppingBag className="h-4 w-4" /> Order Now
              </Link>
              <Link
                to="/prescription"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
              >
                <FileText className="h-4 w-4" /> Upload Prescription
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search + categories */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search medicines, vitamins, baby care…"
            className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-4 text-sm shadow-sm outline-none transition-shadow focus:shadow-[var(--shadow-lift)]"
          />
        </div>
        <div className="mt-6">
          <CategoryPills active={cat} onChange={setCat} />
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">Featured products</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            No products match your search.
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
