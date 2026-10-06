import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Trash2, ShieldAlert, FileUp, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { RecentOrders } from "@/components/RecentOrders";
import { formatKES } from "@/lib/format";
import { getCategoryIcon } from "@/lib/categoryIcons";

/**
 * Product thumbnail. Mirrors ProductDetail: no image (or a broken one) shows
 * the dark textured panel with the category icon in a glass tile.
 */
function ProductThumb({
  src,
  alt,
  category,
}: {
  src?: string | null;
  alt: string;
  category: string;
}) {
  const [failed, setFailed] = useState(false);
  const Icon = getCategoryIcon(category);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-ink)]"
      >
        <div className="rx-texture absolute inset-0 opacity-50" style={{ backgroundColor: "var(--color-primary-deep)" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_75%_10%,oklch(0.80_0.125_82/0.18),transparent)]" />
        <div className="relative grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/10 text-accent backdrop-blur-md">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-24 w-24 shrink-0 rounded-xl object-cover"
    />
  );
}

export default function Cart() {
  const { items, setQty, remove, subtotal, requiresPrescription } = useCart();
  const [notes, setNotes] = useState("");
  const [rxName, setRxName] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) return;
    sessionStorage.setItem(
      "Velpure Limited_checkout",
      JSON.stringify({ notes, rxName }),
    );
    navigate("/checkout");
  };

  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero banner */}
      <section className="relative bg-[var(--color-ink)]">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="rx-texture absolute inset-0 opacity-50"
            style={{ backgroundColor: "var(--color-primary-deep)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_88%_0%,oklch(0.80_0.125_82/0.16),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              <span className="h-px w-8 bg-accent/70" /> Your order
            </div>
            <h1 className="tracking-display mt-4 font-display text-3xl font-medium leading-[1.08] text-white md:text-5xl">
              Your cart
            </h1>
            <p className="mt-3 text-sm text-white/60 md:text-base">
              {items.length === 0
                ? "Nothing here yet."
                : `${itemCount} ${itemCount === 1 ? "item" : "items"} ready for checkout.`}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[var(--color-hairline)] bg-card px-6 py-14 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="tracking-display font-display text-xl font-medium">
                Your cart is empty
              </div>
              <p className="max-w-xs text-sm text-muted-foreground">
                Browse our shop and add the medicines you need.
              </p>
              <Link
                to="/products"
                className="mt-2 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]"
              >
                Shop now
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {items.map(({ product, quantity }) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex gap-4 rounded-2xl border border-[var(--color-hairline)] bg-card p-3 shadow-[var(--shadow-card)]"
                    >
                      <ProductThumb
                        src={product.image_url}
                        alt={product.name}
                        category={product.category}
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                              {product.category}
                            </div>
                            <div className="font-medium leading-tight text-foreground">
                              {product.name}
                            </div>
                            {product.requires_prescription && (
                              <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                                <ShieldAlert className="h-3 w-3" /> Prescription required
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(product.id)}
                            aria-label={`Remove ${product.name}`}
                            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-primary-soft hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-auto flex items-end justify-between pt-2">
                          <div className="inline-flex items-center rounded-full border border-[var(--color-hairline)] bg-card">
                            <button
                              type="button"
                              onClick={() => setQty(product.id, quantity - 1)}
                              aria-label="Decrease quantity"
                              className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-primary-soft"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <div className="w-8 text-center text-sm font-semibold">{quantity}</div>
                            <button
                              type="button"
                              onClick={() => setQty(product.id, quantity + 1)}
                              aria-label="Increase quantity"
                              className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-primary-soft"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="font-semibold text-primary">
                            {formatKES(product.price * quantity)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Special instructions (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Gate code, landmark, allergies…"
                      className="w-full rounded-2xl border border-[var(--color-hairline)] bg-card p-3 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                  </div>

                  {requiresPrescription && (
                    <div className="rounded-2xl border border-accent/40 bg-accent-soft p-4">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
                          <ShieldAlert className="h-4 w-4" />
                        </span>
                        Prescription required
                      </div>
                      <p className="mt-2 text-xs text-foreground/70">
                        One or more items in your cart need a valid prescription. Upload an image or PDF.
                      </p>
                      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary/30">
                        <FileUp className="h-4 w-4" />
                        <span className="max-w-[220px] truncate">{rxName ?? "Choose file"}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={(e) => setRxName(e.target.files?.[0]?.name ?? null)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <aside className="h-fit rounded-3xl border border-[var(--color-hairline)] bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
                <div className="tracking-display font-display text-lg font-medium">
                  Order summary
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <Row label="Subtotal" value={formatKES(subtotal)} />
                  <Row label="Delivery fee" value="Calculated at checkout" />
                  <div className="my-3 border-t border-[var(--color-hairline)]" />
                  <Row label="Total" value={formatKES(subtotal)} bold />
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={requiresPrescription && !rxName}
                  className="mt-5 w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:hover:scale-100"
                >
                  Proceed to checkout
                </button>
                {requiresPrescription && !rxName && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Upload a prescription to continue.
                  </p>
                )}
              </aside>
            </div>
          )}

          <RecentOrders limit={3} showViewAll className="mt-10" />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between ${
        bold ? "text-base font-semibold" : "text-muted-foreground"
      }`}
    >
      <span>{label}</span>
      <span className={bold ? "text-primary" : ""}>{value}</span>
    </div>
  );
}