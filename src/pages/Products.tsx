import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryPills } from "@/components/CategoryPills";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import type { Product } from "@/types";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState<string | null>(null);
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
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">All products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse our full catalog. Add anything to cart in one tap.
        </p>

        <div className="mt-6">
          <CategoryPills active={cat} onChange={setCat} />
        </div>

        <div className="mt-6 grid gap-4 rounded-xl border border-border bg-surface p-4 md:grid-cols-3">
          <label className="text-sm">
            <div className="mb-2 font-medium">Sort</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm"
            >
              <option value="popular">Popular</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
          <label className="text-sm">
            <div className="mb-2 font-medium">Max price: KES {maxPrice.toLocaleString()}</div>
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
          <label className="flex items-center gap-3 text-sm">
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
