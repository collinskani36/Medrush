import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Phone, MessageCircle, Plus, LogOut, Package, ClipboardList,
  Pill, FileText, TrendingUp, Trash2, CheckCircle2, ChefHat, Bike,
  Home as HomeIcon, UserCircle2, Bike as BikeIcon, ArrowRight, Star,
} from "lucide-react";
import {
  addProduct,
  fetchPrescriptions,
  fetchProducts,
  fetchRiders,
  subscribeOrders,
  toggleProductStock,
  updateOrderStatus,
  updatePrescriptionStatus,
  deleteProduct,
  addRider,
  deleteRider,
  assignRider,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { PHARMACY_CONFIG, CATEGORIES } from "@/config";
import { formatKES, formatPhoneForWa } from "@/lib/format";
import type { Order, OrderStatus, Prescription, PrescriptionStatus, Product, Rider } from "@/types";

const STATUSES: OrderStatus[] = ["received", "preparing", "out_for_delivery", "delivered"];

const STATUS_META: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string; bg: string; next: string }> = {
  received:         { label: "Received",         icon: <CheckCircle2 className="h-4 w-4" />, color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",    next: "Mark as Preparing"       },
  preparing:        { label: "Preparing",        icon: <ChefHat className="h-4 w-4" />,      color: "text-amber-600",  bg: "bg-amber-50 border-amber-200",   next: "Mark as Out for Delivery" },
  out_for_delivery: { label: "Out for delivery", icon: <Bike className="h-4 w-4" />,         color: "text-violet-600", bg: "bg-violet-50 border-violet-200", next: "Mark as Delivered"        },
  delivered:        { label: "Delivered",        icon: <HomeIcon className="h-4 w-4" />,     color: "text-green-600",  bg: "bg-green-50 border-green-200",   next: ""                         },
};

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    }) ?? { data: null };
    return () => listener?.subscription.unsubscribe();
  }, []);

  if (authed === null) {
    return <div className="grid min-h-screen place-items-center bg-surface text-sm text-muted-foreground">Loading…</div>;
  }
  if (!authed) return <Login />;
  return <Dashboard />;
}

function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email || !pw) return;
    setLoading(true);
    setErr(null);
    const { error } = await supabase!.auth.signInWithPassword({ email, password: pw });
    if (error) setErr("Incorrect email or password.");
    setLoading(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Admin access</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in with your admin account.</p>
        <input
          type="email" value={email}
          onChange={(e) => { setEmail(e.target.value); setErr(null); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="mt-5 h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary"
          placeholder="Email"
        />
        <input
          type="password" value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(null); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className="mt-3 h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary"
          placeholder="Password"
        />
        {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
        <button
          onClick={submit} disabled={loading || !email || !pw}
          className="mt-4 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </div>
  );
}

type Tab = "overview" | "orders" | "products" | "prescriptions" | "riders";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);

  useEffect(() => {
    const unsub = subscribeOrders(setOrders);
    fetchProducts().then(setProducts);
    fetchPrescriptions().then(setPrescriptions);
    fetchRiders().then(setRiders);
    return unsub;
  }, []);

  const handleLogout = async () => { await supabase?.auth.signOut(); };

  const today = new Date().toDateString();
  const ordersToday = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const pending = orders.filter((o) => o.status !== "delivered");
  const revenue = ordersToday.reduce((s, o) => s + o.total, 0);

  const NAV: [Tab, string, React.ComponentType<{ className?: string }>][] = [
    ["overview",      "Overview",      TrendingUp],
    ["orders",        "Orders",        ClipboardList],
    ["products",      "Products",      Package],
    ["prescriptions", "Prescriptions", FileText],
    ["riders",        "Riders",        BikeIcon],
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-bold">M</div>
            <div className="leading-none">
              <div className="font-display text-lg font-semibold">Admin</div>
              <div className="text-[11px] text-muted-foreground">{PHARMACY_CONFIG.name}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-primary">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 px-4 pb-2 overflow-x-auto no-scrollbar">
          {NAV.map(([key, label, Icon]) => (
            <button
              key={key} onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${
                tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Orders today"   value={ordersToday.length.toString()} icon={<ClipboardList className="h-5 w-5" />} />
            <Stat label="Pending orders" value={pending.length.toString()}      icon={<Pill className="h-5 w-5" />} />
            <Stat label="Revenue today"  value={formatKES(revenue)}             icon={<TrendingUp className="h-5 w-5" />} />
            <Stat label="Total products" value={products.length.toString()}     icon={<Package className="h-5 w-5" />} />
          </div>
        )}

        {tab === "orders" && (
          <OrdersPanel
            orders={orders}
            riders={riders}
            onStatusChange={async (id, s) => { await updateOrderStatus(id, s); }}
            onAssignRider={async (orderId, riderId) => { await assignRider(orderId, riderId); }}
          />
        )}

        {tab === "products" && (
          <ProductsPanel
            products={products}
            onToggle={async (id, v) => { await toggleProductStock(id, v); setProducts(await fetchProducts()); }}
            onAdd={async (p) => { await addProduct(p); setProducts(await fetchProducts()); }}
            onDelete={async (id) => { await deleteProduct(id); setProducts(await fetchProducts()); }}
          />
        )}

        {tab === "prescriptions" && (
          <PrescriptionsPanel
            rxs={prescriptions}
            onChange={async (id, s) => { await updatePrescriptionStatus(id, s); setPrescriptions(await fetchPrescriptions()); }}
          />
        )}

        {tab === "riders" && (
          <RidersPanel
            riders={riders}
            onAdd={async (r) => { await addRider(r); setRiders(await fetchRiders()); }}
            onDelete={async (id) => { await deleteRider(id); setRiders(await fetchRiders()); }}
          />
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">{icon}</div>
      </div>
      <div className="mt-3 font-display text-3xl font-semibold">{value}</div>
    </motion.div>
  );
}

// ─── Orders Panel ─────────────────────────────────────────────────────────────

function OrderCard({
  order,
  riders,
  onStatusChange,
  onAssignRider,
}: {
  order: Order;
  riders: Rider[];
  onStatusChange: (id: string, s: OrderStatus) => Promise<void>;
  onAssignRider: (orderId: string, riderId: string | null) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const currentIdx = STATUSES.indexOf(order.status);
  const nextStatus = STATUSES[currentIdx + 1] as OrderStatus | undefined;
  const meta = STATUS_META[order.status];
  const isDelivered = order.status === "delivered";
  const isOutForDelivery = order.status === "out_for_delivery";
  const isPreparing = order.status === "preparing";

  const handleAdvance = async () => {
    if (!nextStatus || advancing) return;
    setAdvancing(true);
    await onStatusChange(order.id, nextStatus);
    setAdvancing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
    >
      {/* Colour-coded status bar */}
      <div className={`flex items-center gap-2 border-b px-5 py-2.5 text-xs font-semibold ${meta.bg} ${meta.color}`}>
        {meta.icon}
        <span className="uppercase tracking-wide">{meta.label}</span>
        <span className="ml-auto text-[10px] font-normal opacity-70">{new Date(order.created_at).toLocaleString()}</span>
      </div>

      {/* Main content */}
      <div className="p-5">
        {/* Customer + amount */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">#{order.id.slice(-6).toUpperCase()}</div>
            <div className="font-display text-lg font-semibold">{order.customer_name}</div>
            <div className="text-sm text-muted-foreground">{order.customer_phone} · {order.delivery_address}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-lg font-semibold">{formatKES(order.total)}</div>
            <div className="text-xs text-muted-foreground">{order.payment_method === "mpesa" ? "M-Pesa" : "Cash on delivery"}</div>
          </div>
        </div>

        {/* Items summary */}
        <div className="mt-2 text-sm text-muted-foreground">
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
        </div>

        {/* Visual stepper — display only, no click */}
        <div className="relative mt-5">
          <div className="absolute left-0 right-0 top-[18px] h-[3px] rounded-full bg-border" />
          <motion.div
            className="absolute left-0 top-[18px] h-[3px] rounded-full bg-primary"
            initial={false}
            animate={{ width: `${(currentIdx / (STATUSES.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
          <div className="relative grid grid-cols-4">
            {STATUSES.map((s, i) => {
              const done = i <= currentIdx;
              const stepMeta = STATUS_META[s];
              return (
                <div key={s} className="flex flex-col items-center gap-1.5 text-center">
                  <div className={`grid h-9 w-9 place-items-center rounded-full border-2 transition-all duration-300 ${
                    done
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground"
                  }`}>
                    {stepMeta.icon}
                  </div>
                  <span className={`text-[10px] font-medium leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}>
                    {stepMeta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ADVANCE STATUS BUTTON ── */}
        {!isDelivered && nextStatus && (
          <button
            onClick={handleAdvance}
            disabled={advancing}
            className={`mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-60 ${
              isOutForDelivery
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : isPreparing
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {advancing ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {advancing ? "Updating…" : meta.next}
          </button>
        )}

        {/* Delivered badge — customer confirms on their side */}
        {isDelivered && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <span className="text-sm font-medium text-green-700">Delivered</span>
            {order.rating != null && (
              <div className="ml-auto flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < order.rating! ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rider assignment — when preparing or out for delivery */}
        {(isPreparing || isOutForDelivery) && (
          <div className="mt-3 rounded-xl border border-border bg-surface p-3">
            {order.rider ? (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary">
                    <UserCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{order.rider.name}</div>
                    <div className="text-xs text-muted-foreground">{order.rider.phone}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${formatPhoneForWa(order.rider.phone)}?text=${encodeURIComponent(`Hi ${order.rider.name}, please pick up order #${order.id.slice(-6).toUpperCase()} for ${order.customer_name} at ${order.delivery_address}.`)}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                  <button
                    onClick={async () => { setAssigning(true); await onAssignRider(order.id, null); setAssigning(false); }}
                    className="rounded-full border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
                  >
                    Unassign
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <select
                  defaultValue=""
                  disabled={assigning}
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    setAssigning(true);
                    await onAssignRider(order.id, e.target.value);
                    setAssigning(false);
                  }}
                  className="flex-1 h-9 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground"
                >
                  <option value="" disabled>
                    {assigning ? "Assigning…" : riders.length === 0 ? "No riders — add one in Riders tab" : "Assign a rider…"}
                  </option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} · {r.phone}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Action row */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={`tel:${order.customer_phone}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-primary-soft"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/${formatPhoneForWa(order.customer_phone)}?text=${encodeURIComponent(`Hi ${order.customer_name}, this is ${PHARMACY_CONFIG.name} regarding your order #${order.id.slice(-6).toUpperCase()}.`)}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            {expanded ? "Less" : "Details"}
          </button>
        </div>

        {/* Expanded order details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-1 rounded-xl border border-border bg-surface p-4 text-sm">
                {order.items.map((it) => (
                  <div key={it.product_id} className="flex justify-between text-muted-foreground">
                    <span>{it.quantity} × {it.name}</span>
                    <span className="text-foreground">{formatKES(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="my-2 border-t border-border" />
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatKES(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{formatKES(order.delivery_fee)}</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>{formatKES(order.total)}</span></div>
                {order.special_instructions && (
                  <div className="mt-2 rounded-lg bg-card p-3 text-xs text-muted-foreground">
                    Note: {order.special_instructions}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function OrdersPanel({
  orders, riders, onStatusChange, onAssignRider,
}: {
  orders: Order[];
  riders: Rider[];
  onStatusChange: (id: string, s: OrderStatus) => Promise<void>;
  onAssignRider: (orderId: string, riderId: string | null) => Promise<void>;
}) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const list = orders.filter((o) => filter === "all" || o.status === filter);

  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${filter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}
        >
          All · {orders.length}
        </button>
        {STATUSES.map((s) => {
          const m = STATUS_META[s];
          return (
            <button
              key={s} onClick={() => setFilter(s)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}
            >
              {m.icon} {m.label} · {counts[s] ?? 0}
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No orders to show.</div>
      ) : (
        <div className="space-y-4">
          {list.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              riders={riders}
              onStatusChange={onStatusChange}
              onAssignRider={onAssignRider}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Products Panel ───────────────────────────────────────────────────────────

function ProductsPanel({
  products, onToggle, onAdd, onDelete,
}: {
  products: Product[];
  onToggle: (id: string, v: boolean) => void;
  onAdd: (p: Omit<Product, "id" | "created_at">) => void;
  onDelete: (id: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Product, "id" | "created_at">>({
    name: "", description: "", price: 0, category: CATEGORIES[0], image_url: "", requires_prescription: false, in_stock: true,
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: 0, category: CATEGORIES[0], image_url: "", requires_prescription: false, in_stock: true });
    setUploading(false);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{products.length} products</div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Rx</th>
              <th className="px-4 py-3">In stock</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3">{formatKES(p.price)}</td>
                <td className="px-4 py-3">{p.requires_prescription ? "Yes" : "—"}</td>
                <td className="px-4 py-3">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={p.in_stock} onChange={(e) => onToggle(p.id, e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
                    <span className={p.in_stock ? "text-primary" : "text-muted-foreground"}>{p.in_stock ? "Available" : "Out"}</span>
                  </label>
                </td>
                <td className="px-4 py-3">
                  {confirmDeleteId === p.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Sure?</span>
                      <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60">
                        {deletingId === p.id ? "…" : "Yes"}
                      </button>
                      <button onClick={() => setConfirmDeleteId(null)} className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">No</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(p.id)} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4" onClick={() => { setShowAdd(false); resetForm(); }}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl">
            <div className="font-display text-xl font-semibold">Add product</div>
            <div className="mt-4 grid gap-3">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-11 rounded-lg border border-border px-3 text-sm">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Price (KES)" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" />
              {form.image_url ? (
                <div className="flex items-center gap-3 rounded-lg border border-border p-2">
                  <img src={form.image_url} alt="preview" className="h-12 w-12 rounded-lg object-cover" />
                  <span className="flex-1 truncate text-xs text-muted-foreground">{form.image_url}</span>
                  <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="text-xs text-destructive hover:underline">Remove</button>
                </div>
              ) : (
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
                  {uploading ? "Uploading…" : "📁 Upload product image"}
                  <input type="file" accept="image/*" className="hidden" disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      const ext = file.name.split(".").pop();
                      const path = `${Date.now()}.${ext}`;
                      const { error } = await supabase!.storage.from("products").upload(path, file, { upsert: true, contentType: file.type });
                      if (!error) {
                        const { data } = supabase!.storage.from("products").getPublicUrl(path);
                        setForm((f) => ({ ...f, image_url: data.publicUrl }));
                      }
                      setUploading(false);
                    }}
                  />
                </label>
              )}
              <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-lg border border-border p-3 text-sm outline-none focus:border-primary" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.requires_prescription} onChange={(e) => setForm({ ...form, requires_prescription: e.target.checked })} className="h-4 w-4 accent-[var(--color-primary)]" />
                Requires prescription
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => { setShowAdd(false); resetForm(); }} className="rounded-full border border-border px-4 py-2 text-sm">Cancel</button>
              <button
                onClick={() => { onAdd(form); setShowAdd(false); resetForm(); }}
                disabled={!form.name || !form.price || !form.image_url || uploading}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Prescriptions Panel ──────────────────────────────────────────────────────

function PrescriptionsPanel({ rxs, onChange }: { rxs: Prescription[]; onChange: (id: string, s: PrescriptionStatus) => void }) {
  if (rxs.length === 0) {
    return <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No prescriptions yet.</div>;
  }
  return (
    <div className="space-y-3">
      {rxs.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
            <div className="font-medium">{r.customer_phone}</div>
            <div className="text-sm text-muted-foreground">{r.delivery_address}</div>
            <a href={r.prescription_url} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-primary hover:underline">View prescription</a>
          </div>
          <select value={r.status} onChange={(e) => onChange(r.id, e.target.value as PrescriptionStatus)} className="h-10 rounded-lg border border-border bg-card px-3 text-sm capitalize">
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </div>
      ))}
    </div>
  );
}

// ─── Riders Panel ─────────────────────────────────────────────────────────────

function RidersPanel({
  riders, onAdd, onDelete,
}: {
  riders: Rider[];
  onAdd: (r: { name: string; phone: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!form.name || !form.phone) return;
    setSaving(true);
    await onAdd(form);
    setForm({ name: "", phone: "" });
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="font-display text-base font-semibold">Add rider</div>
        <div className="mt-3 flex flex-wrap gap-3">
          <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 flex-1 min-w-[160px] rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" />
          <input placeholder="Phone (e.g. 0712345678)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="h-11 flex-1 min-w-[160px] rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" />
          <button onClick={handleAdd} disabled={saving || !form.name || !form.phone} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            <Plus className="h-4 w-4" /> {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {riders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">No riders yet. Add one above to start assigning deliveries.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary font-semibold text-sm">{r.name.charAt(0).toUpperCase()}</div>
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary">
                        <Phone className="h-3.5 w-3.5" /> Call
                      </a>
                      {confirmDeleteId === r.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Sure?</span>
                          <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id} className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60">
                            {deletingId === r.id ? "…" : "Yes"}
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmDeleteId(r.id)} className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}