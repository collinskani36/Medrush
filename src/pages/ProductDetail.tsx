import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, ArrowRight, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { HeartbeatLoader } from "@/components/HeartbeatLoader";
import { fetchProduct, fetchProducts, getCachedProducts } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { formatKES } from "@/lib/format";
import { getCategoryIcon } from "@/lib/categoryIcons";
import type { Product } from "@/types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  // Seed from the products cache so opening a product from the list is instant.
  const [product, setProduct] = useState<Product | null>(
    () => getCachedProducts()?.find((p) => p.id === id) ?? null,
  );
  const [loading, setLoading] = useState<boolean>(() => product === null);
  const [related, setRelated] = useState<Product[]>(() => getCachedProducts() ?? []);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    if (!id) return;
    setQty(1);
    const cached = getCachedProducts()?.find((p) => p.id === id);
    if (cached) setProduct(cached);
    else setLoading(true);
    fetchProduct(id)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
    fetchProducts().then((all) => setRelated(all)).catch(console.error);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        {loading ? (
          <HeartbeatLoader tone="background" label="Loading product" className="min-h-[50vh]" />
        ) : (
          <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
            <h1 className="tracking-display font-display text-2xl font-medium">Product not found</h1>
            <p className="text-sm text-muted-foreground">
              It may have been removed, or the link is incorrect.
            </p>
            <Link
              to="/products"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-[var(--color-primary-deep)]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to products
            </Link>
          </div>
        )}
        <Footer />
      </div>
    );
  }

  const rel = related.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const Icon = getCategoryIcon(product.category);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <section className="border-b border-[var(--color-hairline)] bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Back to products
          </Link>
          <Link
            to={`/products?category=${encodeURIComponent(product.category)}`}
            className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-primary hover:text-[var(--color-primary-deep)] sm:block"
          >
            {product.category}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[340px_1fr] md:items-start md:gap-14 md:py-12">
        {/* Image */}
        <div className="relative mx-auto w-full max-w-[280px] overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-surface shadow-[var(--shadow-ambient)] md:sticky md:top-24 md:max-w-none">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" />
          ) : (
            <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-[var(--color-ink)]">
              <div className="rx-texture absolute inset-0 opacity-50" style={{ backgroundColor: "var(--color-primary-deep)" }} />
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_75%_10%,oklch(0.80_0.125_82/0.18),transparent)]" />
              <div className="relative grid h-20 w-20 place-items-center rounded-2xl border border-white/15 bg-white/10 text-accent backdrop-blur-md">
                <Icon className="h-9 w-9" />
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col md:py-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <span className="h-px w-8 bg-primary/50" /> {product.category}
          </div>
          <h1 className="tracking-display mt-4 font-display text-3xl font-medium leading-[1.1] md:text-[2.75rem]">
            {product.name}
          </h1>

          <div className="mt-5 flex items-center gap-4">
            <div className="font-display text-3xl font-medium text-[var(--color-ink)]">
              {formatKES(product.price)}
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                product.in_stock
                  ? "border-primary/20 bg-primary-soft text-primary"
                  : "border-[var(--color-hairline)] bg-muted text-muted-foreground"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${product.in_stock ? "bg-primary" : "bg-muted-foreground"}`} />
              {product.in_stock ? "In stock" : "Out of stock"}
            </span>
          </div>

          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            {product.description}
          </p>

          {product.requires_prescription && (
            <div className="mt-6 flex items-start gap-3 self-start rounded-2xl border border-accent/40 bg-accent-soft px-4 py-3.5 text-sm">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-primary-deep)]" />
              <div>
                <span className="font-semibold text-foreground">Requires prescription</span>
                <span className="text-muted-foreground"> — you'll upload it at checkout.</span>
              </div>
            </div>
          )}

          {/* Purchase */}
          <div className="mt-8 flex items-center gap-3 border-t border-[var(--color-hairline)] pt-8">
            <div className="inline-flex items-center rounded-full border border-[var(--color-hairline)] bg-card shadow-sm">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-12 w-12 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="w-8 text-center text-sm font-semibold">{qty}</div>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="grid h-12 w-12 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={!product.in_stock}
              onClick={() => add(product, qty)}
              className="flex-1 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              {product.in_stock ? `Add to cart · ${formatKES(product.price * qty)}` : "Out of Stock"}
            </button>
          </div>

          {/* Reassurance */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-hairline)] bg-surface px-4 py-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-primary-deep)] text-accent">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-foreground">Trusted medicines</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-hairline)] bg-surface px-4 py-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--color-primary-deep)] text-accent">
                <Truck className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-foreground">Same-day delivery</span>
            </div>
          </div>
        </div>
      </section>

      {rel.length > 0 && (
        <section className="border-t border-[var(--color-hairline)] bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-12 md:py-14">
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">More to explore</div>
                <h2 className="tracking-display mt-2 font-display text-2xl font-medium md:text-3xl">
                  You may also like
                </h2>
              </div>
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="hidden items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-[var(--color-primary-deep)] sm:inline-flex"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
              {rel.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}