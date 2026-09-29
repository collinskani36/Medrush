import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, X, ExternalLink, Search, Plus, Minus,
  ShoppingCart, Loader2, AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatKES } from "@/lib/format";
import { calculateDeliveryFee, type DeliveryTier } from "@/lib/geo";
import type { Prescription, PrescriptionStatus, Product } from "@/types";
import {
  BTN_PRIMARY, BTN_GHOST, CARD, EMPTY, FIELD, chip,
  ensureAbsolute, LocationBadge,
} from "./shared";

/* ─── Prescription Viewer ──────────────────────────────────────────────────── */

function PrescriptionViewer({
  rx, onClose,
}: {
  rx: Prescription;
  onClose: () => void;
}) {
  const url = ensureAbsolute(rx.prescription_url);
  const isPdf = !!url && /\.pdf($|\?)/i.test(url);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-ink)]/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-card shadow-[var(--shadow-ambient)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-hairline)] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-base font-medium">Prescription</div>
              <div className="truncate text-[11px] text-muted-foreground">
                #{rx.id.slice(-6).toUpperCase()} · {rx.customer_phone}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-surface/60 p-4">
          {!url ? (
            <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-[var(--color-hairline)] bg-card text-center text-sm text-muted-foreground">
              No file attached to this prescription.
            </div>
          ) : failed ? (
            <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-[var(--color-hairline)] bg-card p-6 text-center text-sm text-muted-foreground">
              Couldn't preview this file inline.
              <div className="mt-3">
                <a href={url} target="_blank" rel="noreferrer" className={BTN_PRIMARY}>
                  <ExternalLink className="h-4 w-4" /> Open in new tab
                </a>
              </div>
            </div>
          ) : isPdf ? (
            <iframe
              src={url}
              title="Prescription PDF"
              className="h-[70vh] w-full rounded-2xl border border-[var(--color-hairline)] bg-white"
              onError={() => setFailed(true)}
            />
          ) : (
            <img
              src={url}
              alt="Prescription"
              className="mx-auto max-h-[70vh] rounded-2xl border border-[var(--color-hairline)] bg-white object-contain"
              onError={() => setFailed(true)}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-hairline)] px-5 py-3">
          <div className="text-[11px] text-muted-foreground">
            Received {new Date(rx.created_at).toLocaleString()}
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-hairline)] px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
            </a>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Create Order modal ───────────────────────────────────────────────────── */

interface CartLine {
  product: Product;
  quantity: number;
}

function CreateOrderModal({
  rx, products, onClose, onCreated,
}: {
  rx: Prescription;
  products: Product[];
  onClose: () => void;
  onCreated: () => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(rx.customer_phone ?? "");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [feeInput, setFeeInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "cash">("mpesa");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill delivery fee from the admin's pricing tiers using the
  // prescription's stored road-distance. Admin can still override.
  useEffect(() => {
    if (rx.distance_km == null) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase!
        .from("delivery_pricing")
        .select("tiers")
        .limit(1)
        .single();
      if (cancelled || !data) return;
      const fee = calculateDeliveryFee(rx.distance_km!, data.tiers as DeliveryTier[]);
      if (fee != null) setFeeInput(String(fee));
    })();
    return () => { cancelled = true; };
  }, [rx.distance_km]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? products.filter((p) => p.name.toLowerCase().includes(q))
      : products;
    return list.slice(0, 24);
  }, [products, search]);

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const deliveryFee = Number(feeInput) || 0;
  const total = subtotal + deliveryFee;

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const hit = prev.find((i) => i.product.id === p.id);
      if (hit) return prev.map((i) => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product: p, quantity: 1 }];
    });
  };
  const bumpQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => i.product.id === id ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  };

  const phoneValid = phone.replace(/\D/g, "").length >= 9;
  const canSave = name.trim().length > 0 && phoneValid && cart.length > 0 && !saving;

  const submit = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const items = cart.map((i) => ({
        product_id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
      }));

      const { error: dbErr } = await supabase!.from("orders").insert({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        delivery_address: rx.delivery_address,
        delivery_lat: rx.delivery_lat ?? null,
        delivery_lng: rx.delivery_lng ?? null,
        distance_km: rx.distance_km ?? null,
        items,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentMethod,
        status: "received",
        special_instructions: instructions.trim() || null,
      });
      if (dbErr) throw dbErr;

      // Mark the prescription as fulfilled now that it's an order.
      await supabase!.from("prescriptions").update({ status: "fulfilled" }).eq("id", rx.id);

      await onCreated();
      onClose();
    } catch (e) {
      console.error(e);
      setError("Could not create the order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-ink)]/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-card shadow-[var(--shadow-ambient)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-hairline)] px-5 py-3.5">
          <div className="min-w-0">
            <div className="font-display text-base font-medium">Create order from prescription</div>
            <div className="truncate text-[11px] text-muted-foreground">
              #{rx.id.slice(-6).toUpperCase()} · {rx.customer_phone}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-2">
          {/* Left — customer + items */}
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Customer name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Wanjiku"
                className={FIELD}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Customer phone number
              </label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className={FIELD}
              />
              {phone.trim().length > 0 && !phoneValid && (
                <div className="mt-1 text-[11px] text-destructive">Enter a valid phone number.</div>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--color-hairline)] bg-surface/60 p-3.5 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">Delivering to</div>
              <div className="mt-0.5">{rx.delivery_address}</div>
              <LocationBadge
                distanceKm={rx.distance_km}
                lat={rx.delivery_lat}
                lng={rx.delivery_lng}
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Add products
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className={`${FIELD} pl-10`}
                />
              </div>
              <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[var(--color-hairline)] p-1">
                {filtered.length === 0 ? (
                  <div className="p-3 text-center text-xs text-muted-foreground">No matches.</div>
                ) : filtered.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface"
                  >
                    {p.image_url && (
                      <img src={p.image_url} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{formatKES(p.price)}</div>
                    </div>
                    <Plus className="h-3.5 w-3.5 shrink-0 text-primary" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — cart + delivery + submit */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--color-hairline)] bg-surface/60 p-3.5">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <ShoppingCart className="h-3.5 w-3.5" /> Items
              </div>
              {cart.length === 0 ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Tap products on the left to add them.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {cart.map((i) => (
                    <div key={i.product.id} className="flex items-center gap-2 text-xs">
                      <span className="min-w-0 flex-1 truncate">{i.product.name}</span>
                      <div className="flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-hairline)] bg-card">
                        <button
                          type="button"
                          onClick={() => bumpQty(i.product.id, -1)}
                          className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-foreground"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center font-medium">{i.quantity}</span>
                        <button
                          type="button"
                          onClick={() => bumpQty(i.product.id, 1)}
                          className="grid h-6 w-6 place-items-center text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="w-16 shrink-0 text-right font-medium">
                        {formatKES(i.product.price * i.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Delivery fee (KES)
              </label>
              <input
                type="number"
                value={feeInput}
                onChange={(e) => setFeeInput(e.target.value)}
                placeholder="Auto-filled from tiers"
                className={FIELD}
              />
              {rx.distance_km == null && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  No distance stored on this prescription — enter the fee manually.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Payment
              </label>
              <div className="flex gap-2">
                {(["mpesa", "cash"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      paymentMethod === m
                        ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                        : "border-[var(--color-hairline)] text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}
                  >
                    {m === "mpesa" ? "M-Pesa" : "Cash on delivery"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Special instructions (optional)
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Call on arrival, gate code 4321"
                className="w-full rounded-xl border border-[var(--color-hairline)] bg-card p-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="rounded-2xl border border-[var(--color-hairline)] bg-card p-3.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>{formatKES(subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between text-muted-foreground">
                <span>Delivery</span><span>{formatKES(deliveryFee)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-[var(--color-hairline)] pt-2 font-semibold">
                <span>Total</span><span>{formatKES(total)}</span>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-1.5 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-hairline)] px-5 py-3.5">
          <button onClick={onClose} className={BTN_GHOST}>Cancel</button>
          <button onClick={submit} disabled={!canSave} className={BTN_PRIMARY}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Creating…" : "Create order"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Status meta ──────────────────────────────────────────────────────────── */

const RX_STATUS_META: Record<
  PrescriptionStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending:   { label: "Pending review", color: "text-sky-700",     bg: "bg-sky-50/80 border-sky-100",         dot: "bg-sky-500" },
  reviewed:  { label: "Reviewed",       color: "text-amber-700",   bg: "bg-amber-50/80 border-amber-100",     dot: "bg-amber-500" },
  fulfilled: { label: "Fulfilled",      color: "text-emerald-700", bg: "bg-emerald-50/80 border-emerald-100", dot: "bg-emerald-500" },
};

/* ─── Prescriptions Panel ──────────────────────────────────────────────────── */

export function PrescriptionsPanel({
  rxs, products, onChange, onRefresh,
}: {
  rxs: Prescription[];
  products: Product[];
  onChange: (id: string, s: PrescriptionStatus) => void;
  onRefresh: () => void | Promise<void>;
}) {
  const [filter, setFilter] = useState<PrescriptionStatus | "all">("all");
  const [viewing, setViewing] = useState<Prescription | null>(null);
  const [creatingFor, setCreatingFor] = useState<Prescription | null>(null);
  const list = rxs.filter((r) => filter === "all" || r.status === filter);
  const ALL_STATUSES: PrescriptionStatus[] = ["pending", "reviewed", "fulfilled"];

  if (rxs.length === 0) return <div className={EMPTY}>No prescriptions yet.</div>;

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={chip(filter === "all")}>
          All · {rxs.length}
        </button>
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={chip(filter === s)}>
            {RX_STATUS_META[s].label} · {rxs.filter((r) => r.status === s).length}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className={EMPTY}>No prescriptions to show.</div>
      ) : (
        <div className="space-y-4">
          {list.map((r) => {
            const meta = RX_STATUS_META[r.status];
            const hasFile = !!ensureAbsolute(r.prescription_url);
            return (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={CARD}
              >
                <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-5 py-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.color}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                  <span className="ml-auto text-[10px] font-normal text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                        #{r.id.slice(-6).toUpperCase()}
                      </div>
                      <div className="truncate font-display text-base font-medium">
                        {r.customer_phone}
                      </div>
                      <div className="truncate text-sm text-muted-foreground">
                        {r.delivery_address}
                      </div>
                      <LocationBadge
                        distanceKm={r.distance_km}
                        lat={r.delivery_lat}
                        lng={r.delivery_lng}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setViewing(r)}
                      disabled={!hasFile}
                      title={hasFile ? "View prescription" : "No file attached"}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-hairline)] px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[var(--color-hairline)] disabled:hover:text-foreground"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {hasFile ? "View" : "No file"}
                    </button>

                    <button
                      onClick={() => setCreatingFor(r)}
                      className={BTN_PRIMARY}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Create order
                    </button>

                    <select
                      value={r.status}
                      onChange={(e) => onChange(r.id, e.target.value as PrescriptionStatus)}
                      className="h-9 rounded-full border border-[var(--color-hairline)] bg-card px-3.5 text-xs font-medium capitalize outline-none transition-colors focus:border-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="fulfilled">Fulfilled</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {viewing && <PrescriptionViewer rx={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {creatingFor && (
          <CreateOrderModal
            rx={creatingFor}
            products={products}
            onClose={() => setCreatingFor(null)}
            onCreated={onRefresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}