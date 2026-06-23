import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShieldAlert, FileUp } from "lucide-react";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { formatKES } from "@/lib/format";
import { PHARMACY_CONFIG } from "@/config";

export default function Cart() {
  const { items, setQty, remove, subtotal, requiresPrescription } = useCart();
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [rxName, setRxName] = useState<string | null>(null);
  const navigate = useNavigate();

  const total = subtotal + (items.length ? PHARMACY_CONFIG.deliveryFee : 0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    sessionStorage.setItem(
      "medrush_checkout",
      JSON.stringify({ address, notes, rxName }),
    );
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Your cart</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <div className="font-display text-xl">Your cart is empty</div>
            <p className="mt-2 text-sm text-muted-foreground">Browse our shop and add medicines you need.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
            >
              Shop now
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4 rounded-xl border border-border bg-card p-3 shadow-sm">
                  <img src={product.image_url} alt={product.name} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{product.category}</div>
                        <div className="font-medium leading-tight">{product.name}</div>
                      </div>
                      <button onClick={() => remove(product.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-end justify-between pt-2">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button onClick={() => setQty(product.id, quantity - 1)} className="grid h-9 w-9 place-items-center"><Minus className="h-3.5 w-3.5" /></button>
                        <div className="w-8 text-center text-sm font-semibold">{quantity}</div>
                        <button onClick={() => setQty(product.id, quantity + 1)} className="grid h-9 w-9 place-items-center"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="font-semibold">{formatKES(product.price * quantity)}</div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Delivery address</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Apartment 4B, Kago Road, Eldoret"
                    className="h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Special instructions (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Gate code, landmark, allergies…"
                    className="w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                {requiresPrescription && (
                  <div className="rounded-xl border border-accent/40 bg-accent-soft p-4">
                    <div className="flex items-center gap-2 font-medium">
                      <ShieldAlert className="h-4 w-4 text-accent" /> Prescription required
                    </div>
                    <p className="mt-1 text-xs text-foreground/70">
                      One or more items in your cart need a valid prescription. Upload an image or PDF.
                    </p>
                    <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary">
                      <FileUp className="h-4 w-4" />
                      {rxName ?? "Choose file"}
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

            <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="font-display text-lg font-semibold">Order summary</div>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={formatKES(subtotal)} />
                <Row label="Delivery fee" value={formatKES(PHARMACY_CONFIG.deliveryFee)} />
                <div className="my-3 border-t border-border" />
                <Row label="Total" value={formatKES(total)} bold />
              </div>
              <button
                onClick={handleCheckout}
                disabled={!address || (requiresPrescription && !rxName)}
                className="mt-5 w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
              >
                Proceed to checkout
              </button>
              {requiresPrescription && !rxName && (
                <p className="mt-2 text-xs text-muted-foreground">Upload a prescription to continue.</p>
              )}
              {!address && (
                <p className="mt-2 text-xs text-muted-foreground">Enter a delivery address to continue.</p>
              )}
            </aside>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-semibold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={bold ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}
