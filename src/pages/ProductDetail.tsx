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
      <section className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
      </section>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-surface">
          <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" />
        </div>
        <div className="flex flex-col">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{product.category}</div>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{product.name}</h1>
          <div className="mt-3 font-display text-2xl font-semibold text-primary">{formatKES(product.price)}</div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {product.requires_prescription && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent-soft p-4 text-sm">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <div className="font-semibold">Requires Prescription</div>
                <div className="text-foreground/70">
                  You'll be asked to upload a valid prescription at checkout.
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-card">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center"><Minus className="h-4 w-4" /></button>
              <div className="w-10 text-center text-sm font-semibold">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center"><Plus className="h-4 w-4" /></button>
            </div>
            <button
              disabled={!product.in_stock}
              onClick={() => add(product, qty)}
              className="flex-1 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              {product.in_stock ? `Add to cart · ${formatKES(product.price * qty)}` : "Out of Stock"}
            </button>
          </div>
        </div>
      </section>

      {rel.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <h2 className="mb-4 font-display text-2xl font-semibold">You may also like</h2>
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
