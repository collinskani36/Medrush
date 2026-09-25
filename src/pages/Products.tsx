import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryPills } from "@/components/CategoryPills";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/types";

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState<string | null>(() => searchParams.get("category"));
  const [sort, setSort] = useState<"popular" | "price_asc" | "price_desc">("popular");
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [rxOnly, setRxOnly] = useState(false);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    let list = products
      .filter((p) => (cat ? p.category === cat : true))
      .filter((p) => p.price <= maxPrice)
      .filter((p) => (rxOnly ? p.requires_prescription : true));
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, cat, sort, maxPrice, rxOnly]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Compact ink banner — mirrors the Home hero's palette without repeating its size */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div className="rx-texture absolute inset-0 opacity-40" style={{ backgroundColor: "var(--color-primary-deep)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="relative mx-auto max-w-6xl px-4 py-9 md:py-11">
          <h1 className="tracking-display font-display text-2xl font-medium text-white md:text-4xl">
            {cat ?? "All products"}
          </h1>
          <p className="mt-1.5 text-sm text-white/60">
            {filtered.length} {filtered.length === 1 ? "item" : "items"} · add anything to cart in one tap
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <CategoryPills active={cat} onChange={setCat} />

        <div className="mt-6 flex flex-col gap-5 border-y border-[var(--color-hairline)] py-5 md:flex-row md:items-center md:justify-between md:gap-8">
          <label className="text-sm">
            <span className="mr-2 font-medium text-foreground">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-9 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
            >
              <option value="popular">Popular</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
          <label className="flex items-center gap-3 text-sm md:w-56">
            <span className="whitespace-nowrap font-medium text-foreground">Max KES {maxPrice.toLocaleString()}</span>
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
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={rxOnly}
              onChange={(e) => setRxOnly(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            Prescription required only
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            No products match these filters.
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}