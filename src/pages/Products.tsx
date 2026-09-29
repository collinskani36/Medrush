import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X, RotateCcw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import { CATEGORIES } from "@/config";
import { getCategoryIcon } from "@/lib/categoryIcons";
import type { Product } from "@/types";

const DEFAULT_MAX_PRICE = 5000;

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState<string | null>(() => searchParams.get("category"));
  const [search, setSearch] = useState<string>(() => searchParams.get("search") ?? "");
  const [sort, setSort] = useState<"popular" | "price_asc" | "price_desc">("popular");
  const [maxPrice, setMaxPrice] = useState<number>(DEFAULT_MAX_PRICE);
  const [rxOnly, setRxOnly] = useState(false);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  // Picks up ?search=... when arriving from the Home search bar (or a shared link).
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = products
      .filter((p) => (cat ? p.category === cat : true))
      .filter((p) => p.price <= maxPrice)
      .filter((p) => (rxOnly ? p.requires_prescription : true))
      .filter((p) => (q ? p.name.toLowerCase().includes(q) : true));

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [products, cat, sort, maxPrice, rxOnly, search]);

  // Only a handpicked few products have photos. Show them as a "Featured" row
  // when browsing everything; once the user filters/searches, show one plain list.
  const isBrowsingAll = !cat && !search.trim() && !rxOnly && maxPrice === DEFAULT_MAX_PRICE;
  const featured = useMemo(
    () => (isBrowsingAll ? filtered.filter((p) => Boolean(p.image_url)) : []),
    [filtered, isBrowsingAll],
  );
  const rest = useMemo(
    () => (isBrowsingAll ? filtered.filter((p) => !p.image_url) : filtered),
    [filtered, isBrowsingAll],
  );

  const resetFilters = () => {
    setCat(null);
    setSearch("");
    setSort("popular");
    setMaxPrice(DEFAULT_MAX_PRICE);
    setRxOnly(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero banner with integrated search */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div
          className="rx-texture absolute inset-0 opacity-50"
          style={{ backgroundColor: "var(--color-primary-deep)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_88%_0%,oklch(0.80_0.125_82/0.16),transparent)]" />

        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-6 md:pt-16 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              <span className="h-px w-8 bg-accent/70" /> The pharmacy
            </div>
            <h1 className="tracking-display mt-4 font-display text-3xl font-medium leading-[1.08] text-white md:text-5xl">
              {cat ?? "All products"}
            </h1>
            <p className="mt-3 text-sm text-white/60 md:text-base">
              {filtered.length} {filtered.length === 1 ? "item" : "items"} · add anything to cart in one tap
            </p>

            <div className="relative mt-7 max-w-lg">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a medicine…"
                className="h-12 w-full rounded-full border border-white/15 bg-white/10 pl-11 pr-11 text-sm text-white outline-none backdrop-blur-md transition-all placeholder:text-white/50 focus:border-accent focus:ring-4 focus:ring-accent/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition-colors hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Category cards — same frosted look as the old Home tiles */}
        <div className="relative mx-auto max-w-6xl px-4 pb-10 md:pb-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((category) => {
              const Icon = getCategoryIcon(category);
              const active = cat === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setCat(active ? null : category)}
                  aria-pressed={active}
                  className={`group flex items-center gap-3 rounded-2xl border p-3 text-left backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.12] hover:shadow-[var(--shadow-gold)] sm:flex-col sm:items-start sm:gap-4 sm:p-4 ${
                    active
                      ? "border-accent/60 bg-white/[0.14] shadow-[var(--shadow-gold)]"
                      : "border-white/10 bg-white/[0.06]"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors group-hover:bg-accent group-hover:text-accent-foreground ${
                      active ? "bg-accent text-accent-foreground" : "bg-accent/15 text-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium leading-tight text-white">{category}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          {/* Filter bar */}
          <div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-hairline)] bg-card p-4 shadow-[var(--shadow-card)] md:flex-row md:items-center md:justify-between md:gap-8 md:px-6">
            <label className="flex items-center gap-3 text-sm">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Sort
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="h-10 rounded-full border border-[var(--color-hairline)] bg-card px-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                <option value="popular">Popular</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </label>

            <label className="flex items-center gap-4 text-sm md:w-72">
              <span className="whitespace-nowrap font-medium text-foreground">
                Max <span className="text-primary">KES {maxPrice.toLocaleString()}</span>
              </span>
              <input
                type="range"
                min={100}
                max={5000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
              />
            </label>

            <label
              className={`inline-flex cursor-pointer items-center gap-2.5 self-start rounded-full border px-4 py-2.5 text-sm font-medium transition-colors md:self-auto ${
                rxOnly
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-[var(--color-hairline)] text-foreground hover:border-primary/30"
              }`}
            >
              <input
                type="checkbox"
                checked={rxOnly}
                onChange={(e) => setRxOnly(e.target.checked)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              Prescription required only
            </label>
          </div>

          {featured.length > 0 && (
            <div className="mt-7">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Featured
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div className="mt-7">
              {featured.length > 0 && (
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  All medicines
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                {rest.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="mt-7 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[var(--color-hairline)] bg-card px-6 py-14 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
                <Search className="h-6 w-6" />
              </div>
              <div className="tracking-display font-display text-xl font-medium">
                No products match these filters
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                Try a different search, raise the price limit, or clear your filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]"
              >
                <RotateCcw className="h-4 w-4" /> Reset filters
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}