import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Minus, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { fetchProduct, fetchProducts } from "@/lib/api";
import { useCart } from "@/contexts/CartContext";
import { formatKES } from "@/lib/format";
import type { Product } from "@/types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => {
    if (!id) return;
    setQty(1);
    fetchProduct(id).then(setProduct);
    fetchProducts().then((all) => setRelated(all));
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">
          Loading product…
        </div>
      </div>
    );
  }

  const rel = related.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-6xl border-b border-[var(--color-hairline)] px-4 py-5">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
      </section>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-14 md:grid-cols-2 md:gap-16">
        <div className="overflow-hidden rounded-3xl bg-surface shadow-[var(--shadow-ambient)]">
          <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" />
        </div>
        <div className="flex flex-col md:py-2">
          <div className="text-sm text-muted-foreground">{product.category}</div>
          <h1 className="tracking-display mt-2 font-display text-3xl font-medium leading-tight md:text-[2.75rem]">
            {product.name}
          </h1>
          <div className="mt-4 font-display text-3xl font-medium text-[var(--color-ink)]">
            {formatKES(product.price)}
          </div>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {product.requires_prescription && (
            <div className="mt-6 inline-flex items-start gap-2.5 self-start rounded-lg border border-[var(--color-hairline)] px-3.5 py-2.5 text-sm">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div>
                <span className="font-semibold">Requires prescription</span>
                <span className="text-muted-foreground"> — you'll upload it at checkout.</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 border-t border-[var(--color-hairline)] pt-8">
            <div className="inline-flex items-center rounded-full border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center text-muted-foreground transition-colors hover:text-foreground"><Minus className="h-4 w-4" /></button>
              <div className="w-8 text-center text-sm font-semibold">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-12 w-12 place-items-center text-muted-foreground transition-colors hover:text-foreground"><Plus className="h-4 w-4" /></button>
            </div>
            <button
              disabled={!product.in_stock}
              onClick={() => add(product, qty)}
              className="flex-1 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              {product.in_stock ? `Add to cart · ${formatKES(product.price * qty)}` : "Out of Stock"}
            </button>
          </div>
        </div>
      </section>

      {rel.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <h2 className="mb-6 border-b border-[var(--color-hairline)] pb-4 font-display text-2xl font-medium">
            You may also like
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {rel.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}