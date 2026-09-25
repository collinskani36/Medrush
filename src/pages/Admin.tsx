import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, Phone, MessageCircle, Plus, LogOut, Package, ClipboardList,
  Pill, FileText, TrendingUp, Trash2, CheckCircle2, ChefHat, Bike,
  Home as HomeIcon, UserCircle2, Bike as BikeIcon, ArrowRight, Star,
  Stethoscope, PackageSearch, Clock, XCircle, PhoneCall, Loader2, ImagePlus,
  Save, MapPin, Search, X, ExternalLink,
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
  fetchAllDoctors,
  addDoctor,
  toggleDoctorAvailability,
  deleteDoctor,
  uploadDoctorPhoto,
  fetchConsultations,
  updateConsultationStatus,
  addConsultationNotes,
  fetchEquipmentRequests,
  quoteEquipmentRequest,
  updateEquipmentRequestStatus,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { PHARMACY_CONFIG, CATEGORIES } from "@/config";
import { formatKES, formatPhoneForWa } from "@/lib/format";
import type {
  Order, OrderStatus, Prescription, PrescriptionStatus, Product, Rider,
  Doctor, Consultation, ConsultationStatus, EquipmentRequest, EquipmentRequestStatus,
} from "@/types";
import type { DeliveryTier } from "@/lib/geo";

/* ─────────────────────────────────────────────────────────────────────────────
   Shared design tokens
   ───────────────────────────────────────────────────────────────────────────── */
const FIELD =
  "h-11 w-full rounded-xl border border-[var(--color-hairline)] bg-card px-3.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10";

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none";

const BTN_GHOST =
  "inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--color-hairline)] px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground";

const CARD =
  "overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-card shadow-[var(--shadow-ambient)]";

const EMPTY =
  "rounded-3xl border border-dashed border-[var(--color-hairline)] bg-card/60 p-12 text-center text-sm text-muted-foreground";

const CHIP_BASE =
  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap";

const chip = (active: boolean) =>
  `${CHIP_BASE} ${
    active
      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
      : "border-[var(--color-hairline)] bg-card text-muted-foreground hover:border-primary hover:text-foreground"
  }`;

/**
 * Storage URLs are sometimes saved without a protocol (e.g. `xyz.supabase.co/...`).
 * A bare URL in `href` is treated as a *relative* path — which is why prescriptions
 * were opening a new tab and landing on the SPA home route. This normalises it.
 */
const ensureAbsolute = (url?: string | null): string | null => {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return trimmed; // site-root relative — usually fine
  return `https://${trimmed}`;
};

const STATUSES: OrderStatus[] = ["received", "preparing", "out_for_delivery", "delivered"];

const STATUS_META: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; color: string; bg: string; dot: string; next: string }
> = {
  received: {
    label: "Received",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-sky-700",
    bg: "bg-sky-50/80 border-sky-100",
    dot: "bg-sky-500",
    next: "Mark as Preparing",
  },
  preparing: {
    label: "Preparing",
    icon: <ChefHat className="h-4 w-4" />,
    color: "text-amber-700",
    bg: "bg-amber-50/80 border-amber-100",
    dot: "bg-amber-500",
    next: "Mark as Out for Delivery",
  },
  out_for_delivery: {
    label: "Out for delivery",
    icon: <Bike className="h-4 w-4" />,
    color: "text-violet-700",
    bg: "bg-violet-50/80 border-violet-100",
    dot: "bg-violet-500",
    next: "Mark as Delivered",
  },
  delivered: {
    label: "Delivered",
    icon: <HomeIcon className="h-4 w-4" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50/80 border-emerald-100",
    dot: "bg-emerald-500",
    next: "",
  },
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
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
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
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--color-ink)] px-4">
      <div
        className="rx-texture absolute inset-0 opacity-40"
        style={{ backgroundColor: "var(--color-primary-deep)" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/95 p-8 shadow-[var(--shadow-ambient)] backdrop-blur"
      >
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-ink)] text-white">
          <Lock className="h-4.5 w-4.5" />
        </div>
        <h1 className="tracking-display mt-5 font-display text-2xl font-medium">Admin access</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in with your admin account.</p>

        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErr(null); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className={`${FIELD} mt-6`}
          placeholder="Email"
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(null); }}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          className={`${FIELD} mt-3`}
          placeholder="Password"
        />
        {err && <p className="mt-2 text-xs text-destructive">{err}</p>}

        <button onClick={submit} disabled={loading || !email || !pw} className={`${BTN_PRIMARY} mt-5 w-full`}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </motion.div>
    </div>
  );
}

type Tab =
  | "overview" | "orders" | "products" | "prescriptions"
  | "riders" | "doctors" | "consultations" | "equipment";

function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [equipmentRequests, setEquipmentRequests] = useState<EquipmentRequest[]>([]);

  const loadDoctors = () => fetchAllDoctors().then(setDoctors);
  const loadConsultations = () => fetchConsultations().then(setConsultations);
  const loadEquipmentRequests = () => fetchEquipmentRequests().then(setEquipmentRequests);

  useEffect(() => {
    const unsub = subscribeOrders(setOrders);
    fetchProducts().then(setProducts);
    fetchPrescriptions().then(setPrescriptions);
    fetchRiders().then(setRiders);
    loadDoctors();
    loadConsultations();
    loadEquipmentRequests();

    const poll = setInterval(() => {
      loadConsultations();
      loadEquipmentRequests();
    }, 8000);

    return () => {
      unsub();
      clearInterval(poll);
    };
  }, []);

  const handleLogout = async () => { await supabase?.auth.signOut(); };

  const today = new Date().toDateString();
  const ordersToday = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const pending = orders.filter((o) => o.status !== "delivered");
  const revenue = ordersToday.reduce((s, o) => s + o.total, 0);

  const NAV: [Tab, string, React.ComponentType<{ className?: string }>][] = [
    ["overview", "Overview", TrendingUp],
    ["orders", "Orders", ClipboardList],
    ["products", "Products", Package],
    ["prescriptions", "Prescriptions", FileText],
    ["riders", "Riders & Delivery", BikeIcon],
    ["doctors", "Doctors", Stethoscope],
    ["consultations", "Consultations", PhoneCall],
    ["equipment", "Equipment", PackageSearch],
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-[var(--color-hairline)] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--color-ink)] font-display font-medium text-white">
              M
            </div>
            <div className="leading-none">
              <div className="font-display text-base font-medium tracking-display">Admin</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{PHARMACY_CONFIG.name}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <nav className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2.5">
          {NAV.map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all ${
                tab === key
                  ? "bg-[var(--color-ink)] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-primary-soft/70 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        {tab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-soft via-accent-soft/50 to-primary-soft p-3 shadow-[var(--shadow-ambient)] md:p-4"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Stat
                label="Orders today"
                value={ordersToday.length.toString()}
                icon={<ClipboardList className="h-4.5 w-4.5" />}
              />
              <Stat
                label="Pending orders"
                value={pending.length.toString()}
                icon={<Pill className="h-4.5 w-4.5" />}
              />
              <Stat
                label="Revenue today"
                value={formatKES(revenue)}
                icon={<TrendingUp className="h-4.5 w-4.5" />}
                accent
              />
              <Stat
                label="Total products"
                value={products.length.toString()}
                icon={<Package className="h-4.5 w-4.5" />}
              />
              <Stat
                label="Consultations awaiting call"
                value={consultations.filter((c) => c.status === "paid" || c.status === "assigned").length.toString()}
                icon={<PhoneCall className="h-4.5 w-4.5" />}
              />
              <Stat
                label="Equipment requests to quote"
                value={equipmentRequests.filter((r) => r.status === "pending").length.toString()}
                icon={<PackageSearch className="h-4.5 w-4.5" />}
              />
            </div>
          </motion.div>
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
          <div className="space-y-12">
            <DeliveryPricingPanel />
            <div className="border-t border-[var(--color-hairline)]" />
            <RidersPanel
              riders={riders}
              onAdd={async (r) => { await addRider(r); setRiders(await fetchRiders()); }}
              onDelete={async (id) => { await deleteRider(id); setRiders(await fetchRiders()); }}
            />
          </div>
        )}

        {tab === "doctors" && (
          <DoctorsPanel
            doctors={doctors}
            onAdd={async (d) => { await addDoctor(d); await loadDoctors(); }}
            onToggle={async (id, v) => { await toggleDoctorAvailability(id, v); await loadDoctors(); }}
            onDelete={async (id) => { await deleteDoctor(id); await loadDoctors(); }}
          />
        )}

        {tab === "consultations" && (
          <ConsultationsPanel
            consultations={consultations}
            onStatusChange={async (id, s) => { await updateConsultationStatus(id, s); await loadConsultations(); }}
            onSaveNotes={async (id, notes) => { await addConsultationNotes(id, notes); await loadConsultations(); }}
          />
        )}

        {tab === "equipment" && (
          <EquipmentPanel
            requests={equipmentRequests}
            onQuote={async (id, price, notes) => { await quoteEquipmentRequest(id, price, notes); await loadEquipmentRequests(); }}
            onStatusChange={async (id, s) => { await updateEquipmentRequestStatus(id, s); await loadEquipmentRequests(); }}
          />
        )}
      </main>
    </div>
  );
}

function Stat({
  label, value, icon, accent = false,
}: {
  label: string; value: string; icon: React.ReactNode; accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-white/50 bg-white/40 p-5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="flex items-center gap-2.5 text-[13px] font-medium text-muted-foreground">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
            accent ? "bg-accent-soft text-accent" : "bg-primary-soft text-primary"
          }`}
        >
          {icon}
        </span>
        {label}
      </div>
      <div
        className={`tracking-display mt-3 font-display text-3xl font-medium ${
          accent ? "text-accent" : "text-[var(--color-ink)]"
        }`}
      >
        {value}
      </div>
    </motion.div>
  );
}

function MiniStat({
  label, value, tone = "neutral",
}: {
  label: string; value: string; tone?: "neutral" | "positive";
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-hairline)] bg-card px-4 py-3 shadow-[var(--shadow-ambient)]">
      <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div
        className={`mt-0.5 font-display text-xl font-medium tracking-display ${
          tone === "positive" ? "text-primary" : "text-[var(--color-ink)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function SectionHeading({
  icon, title, subtitle,
}: {
  icon?: React.ReactNode; title: string; subtitle?: string;
}) {
  return (
    <div>
      <h2 className="flex items-center gap-2 font-display text-lg font-medium tracking-display">
        {icon && <span className="text-primary">{icon}</span>}
        {title}
      </h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

/* ─── Delivery Pricing Panel ─────────────────────────────────────────────────── */

interface DeliveryPricingRow {
  id: string;
  road_distance_factor: number;
  tiers: DeliveryTier[];
  notes: string | null;
}

function DeliveryPricingPanel() {
  const [pricing, setPricing] = useState<DeliveryPricingRow | null>(null);
  const [factorInput, setFactorInput] = useState("1.5");
  const [tiersInput, setTiersInput] = useState<DeliveryTier[]>([]);
  const [notesInput, setNotesInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error: dbErr } = await supabase!
      .from("delivery_pricing")
      .select("id, road_distance_factor, tiers, notes")
      .limit(1)
      .single();

    if (dbErr || !data) {
      setError("Could not load delivery pricing — check your Supabase connection.");
      setLoading(false);
      return;
    }
    const row = data as DeliveryPricingRow;
    setPricing(row);
    setFactorInput(String(row.road_distance_factor));
    setTiersInput([...(row.tiers as DeliveryTier[])].sort((a, b) => a.max_km - b.max_km));
    setNotesInput(row.notes ?? "");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateTier = (index: number, field: keyof DeliveryTier, value: number) =>
    setTiersInput((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));

  const addTier = () => {
    const lastMax = tiersInput.length > 0 ? tiersInput[tiersInput.length - 1].max_km : 0;
    setTiersInput((prev) => [...prev, { max_km: lastMax + 5, fee: 0 }]);
  };

  const removeTier = (index: number) =>
    setTiersInput((prev) => prev.filter((_, i) => i !== index));

  const validate = (): string | null => {
    const factor = Number(factorInput);
    if (Number.isNaN(factor) || factor < 1.0 || factor > 2.5)
      return "Road distance factor must be between 1.0 and 2.5.";
    if (tiersInput.length === 0)
      return "Add at least one distance tier.";
    for (const t of tiersInput) {
      if (Number.isNaN(t.max_km) || t.max_km <= 0) return "Every tier needs a distance greater than 0 km.";
      if (Number.isNaN(t.fee) || t.fee < 0) return "Every tier fee must be 0 or more.";
    }
    const maxKms = tiersInput.map((t) => t.max_km);
    if (new Set(maxKms).size !== maxKms.length) return "Each tier must have a unique distance value.";
    return null;
  };

  const save = async () => {
    if (!pricing) return;
    const err = validate();
    if (err) { setError(err); setSaved(false); return; }

    setSaving(true);
    setError(null);
    setSaved(false);

    const sortedTiers = [...tiersInput].sort((a, b) => a.max_km - b.max_km);
    const { error: dbErr } = await supabase!
      .from("delivery_pricing")
      .update({ road_distance_factor: Number(factorInput), tiers: sortedTiers, notes: notesInput || null })
      .eq("id", pricing.id);

    setSaving(false);
    if (dbErr) { setError("Failed to save — check your admin permissions or connection."); return; }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading delivery pricing…
      </div>
    );
  }

  if (!pricing) {
    return <p className="py-4 text-sm text-destructive">{error ?? "Pricing settings unavailable. Run migration.sql first."}</p>;
  }

  return (
    <div className="space-y-5">
      <SectionHeading
        icon={<MapPin className="h-5 w-5" />}
        title="Delivery Pricing"
        subtitle="Tune how straight-line distance becomes a delivery fee."
      />

      <div className={`${CARD} space-y-6 p-6`}>
        <div>
          <label className="mb-1 block text-sm font-medium">Road Distance Factor</label>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            Multiplies straight-line distance to approximate on-road km.
            Typical range: 1.2 (grid roads) → 1.8 (winding terrain). Default: 1.5.
          </p>
          <input
            type="number" step="0.1" min="1.0" max="2.5"
            value={factorInput}
            onChange={(e) => setFactorInput(e.target.value)}
            className={`${FIELD} w-32`}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Distance Tiers</label>
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            First matching tier wins. Save button sorts them automatically.
          </p>
          <div className="space-y-2">
            {tiersInput.map((tier, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--color-hairline)] bg-surface/50 px-3 py-2.5"
              >
                <span className="w-14 shrink-0 text-xs text-muted-foreground">Up to</span>
                <input
                  type="number" min="0.1" step="0.5" value={tier.max_km}
                  onChange={(e) => updateTier(i, "max_km", Number(e.target.value))}
                  className="h-10 w-20 rounded-lg border border-[var(--color-hairline)] bg-card px-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
                <span className="shrink-0 text-xs text-muted-foreground">km — KSh</span>
                <input
                  type="number" min="0" step="10" value={tier.fee}
                  onChange={(e) => updateTier(i, "fee", Number(e.target.value))}
                  className="h-10 w-24 rounded-lg border border-[var(--color-hairline)] bg-card px-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => removeTier(i)}
                  className="ml-auto rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remove tier"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addTier}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-75"
          >
            <Plus className="h-3.5 w-3.5" /> Add tier
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Notes <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. increased factor after rider feedback on hill routes"
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            className={FIELD}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && <p className="text-sm text-primary">Saved successfully.</p>}

        <button type="button" onClick={save} disabled={saving} className={BTN_PRIMARY}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save Pricing"}
        </button>
      </div>
    </div>
  );
}

/* ─── Orders Panel ───────────────────────────────────────────────────────────── */

function OrderCard({
  order, riders, onStatusChange, onAssignRider,
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
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={CARD}>
      <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-4 py-3 sm:px-5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        <span className="ml-auto text-[10px] font-normal text-muted-foreground">
          {new Date(order.created_at).toLocaleString()}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px]">
              #{order.id.slice(-6).toUpperCase()}
            </div>
            <div className="truncate font-display text-base font-medium sm:text-lg">
              {order.customer_name}
            </div>
            <div className="truncate text-xs text-muted-foreground sm:text-sm">
              {order.customer_phone} · {order.delivery_address}
            </div>
            {order.distance_km != null && (
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> ~{order.distance_km.toFixed(1)} km by road
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-base font-medium tracking-display sm:text-lg">
              {formatKES(order.total)}
            </div>
            <div className="text-[10px] text-muted-foreground sm:text-xs">
              {order.payment_method === "mpesa" ? "M-Pesa" : "Cash on delivery"}
            </div>
          </div>
        </div>

        <div className="mt-2 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
        </div>

        <div className="relative mt-6">
          <div className="absolute left-0 right-0 top-[18px] h-[3px] rounded-full bg-[var(--color-hairline)]" />
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
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 transition-all duration-300 sm:h-9 sm:w-9 ${
                      done
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-[var(--color-hairline)] bg-card text-muted-foreground"
                    }`}
                  >
                    {stepMeta.icon}
                  </div>
                  <span
                    className={`text-[9px] font-medium leading-tight sm:text-[10px] ${
                      done ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {stepMeta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {!isDelivered && nextStatus && (
          <button
            onClick={handleAdvance}
            disabled={advancing}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-60 sm:text-sm ${
              isOutForDelivery
                ? "bg-violet-600 hover:bg-violet-700"
                : isPreparing
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-[var(--color-ink)] hover:bg-[var(--color-ink)]/90"
            }`}
          >
            {advancing ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white sm:h-4 sm:w-4" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            {advancing ? "Updating…" : meta.next}
          </button>
        )}

        {isDelivered && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-2.5">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium text-emerald-700 sm:text-sm">Delivered</span>
            {order.rating != null && (
              <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                      i < order.rating! ? "fill-amber-400 text-amber-400" : "text-border"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {(isPreparing || isOutForDelivery) && (
          <div className="mt-3 rounded-2xl border border-[var(--color-hairline)] bg-surface/60 p-3">
            {order.rider ? (
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                    <UserCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold sm:text-sm">{order.rider.name}</div>
                    <div className="truncate text-[10px] text-muted-foreground sm:text-xs">
                      {order.rider.phone}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <a
                    href={`https://wa.me/${formatPhoneForWa(order.rider.phone)}?text=${encodeURIComponent(
                      `Hi ${order.rider.name}, please pick up order #${order.id.slice(-6).toUpperCase()} for ${order.customer_name} at ${order.delivery_address}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--color-ink)] px-2.5 py-1.5 text-[10px] font-medium text-white transition-opacity hover:opacity-90 sm:px-3 sm:text-xs"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                  <button
                    onClick={async () => { setAssigning(true); await onAssignRider(order.id, null); setAssigning(false); }}
                    className="whitespace-nowrap rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-[10px] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive sm:px-3 sm:text-xs"
                  >
                    Unassign
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <UserCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <select
                  defaultValue=""
                  disabled={assigning}
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    setAssigning(true);
                    await onAssignRider(order.id, e.target.value);
                    setAssigning(false);
                  }}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--color-hairline)] bg-card px-3 text-xs text-muted-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                >
                  <option value="" disabled>
                    {assigning ? "Assigning…" : riders.length === 0 ? "No riders — add one below" : "Assign a rider…"}
                  </option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} · {r.phone}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <a
            href={`tel:${order.customer_phone}`}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-[10px] font-medium transition-colors hover:bg-primary-soft sm:gap-1.5 sm:px-3 sm:text-xs"
          >
            <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/${formatPhoneForWa(order.customer_phone)}?text=${encodeURIComponent(
              `Hi ${order.customer_name}, this is ${PHARMACY_CONFIG.name} regarding your order #${order.id.slice(-6).toUpperCase()}.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-ink)] px-2.5 py-1.5 text-[10px] font-medium text-white transition-opacity hover:opacity-90 sm:gap-1.5 sm:px-3 sm:text-xs"
          >
            <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> WhatsApp
          </a>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto whitespace-nowrap rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground sm:px-3 sm:text-xs"
          >
            {expanded ? "Less" : "Details"}
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-1 rounded-2xl border border-[var(--color-hairline)] bg-surface/60 p-4 text-xs sm:text-sm">
                {order.items.map((it) => (
                  <div key={it.product_id} className="flex justify-between text-muted-foreground">
                    <span className="mr-2 truncate">{it.quantity} × {it.name}</span>
                    <span className="shrink-0 text-foreground">{formatKES(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="my-2 border-t border-[var(--color-hairline)]" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatKES(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{formatKES(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatKES(order.total)}</span>
                </div>
                {order.special_instructions && (
                  <div className="mt-2 rounded-lg bg-card p-3 text-[10px] text-muted-foreground sm:text-xs">
                    Note: {order.special_instructions}
                  </div>
                )}
                {order.delivery_lat != null && order.delivery_lng != null && (
                  <a
                    href={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary hover:underline sm:text-xs"
                  >
                    <MapPin className="h-3 w-3" /> Open delivery location in Maps
                  </a>
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
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={chip(filter === "all")}>
          All · {orders.length}
        </button>
        {STATUSES.map((s) => {
          const m = STATUS_META[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`inline-flex items-center gap-1.5 ${chip(filter === s)}`}
            >
              {m.icon} {m.label} · {counts[s] ?? 0}
            </button>
          );
        })}
      </div>
      {list.length === 0 ? (
        <div className={EMPTY}>No orders to show.</div>
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

/* ─── Products Panel ─────────────────────────────────────────────────────────── */

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
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
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

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const inStockCount = products.filter((p) => p.in_stock).length;
  const rxCount = products.filter((p) => p.requires_prescription).length;
  const categoriesInUse = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div>
      {/* Summary strip */}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Total" value={products.length.toString()} />
        <MiniStat label="In stock" value={inStockCount.toString()} tone="positive" />
        <MiniStat label="Rx-only" value={rxCount.toString()} />
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className={`${FIELD} pl-10`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button onClick={() => setShowAdd(true)} className={BTN_PRIMARY}>
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      {/* Category chips */}
      {categoriesInUse.length > 0 && (
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCategoryFilter("all")} className={chip(categoryFilter === "all")}>
            All · {products.length}
          </button>
          {categoriesInUse.map((c) => {
            const count = products.filter((p) => p.category === c).length;
            return (
              <button key={c} onClick={() => setCategoryFilter(c)} className={chip(categoryFilter === c)}>
                {c} · {count}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={EMPTY}>
          {products.length === 0
            ? "No products yet. Add your first product to get started."
            : "No products match your filters."}
        </div>
      ) : (
        /* Compact, denser grid — 2 on mobile → 5 on wide screens */
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {filtered.map((p) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-card shadow-[var(--shadow-ambient)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              {/* Square thumbnail — much smaller footprint than the old 4/3 */
              }
              <div className="relative aspect-square overflow-hidden bg-surface">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {p.requires_prescription && (
                  <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-[var(--color-ink)]/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                    <FileText className="h-2.5 w-2.5" /> Rx
                  </span>
                )}
                {!p.in_stock && (
                  <div className="absolute inset-0 grid place-items-center bg-[var(--color-ink)]/55 backdrop-blur-[2px]">
                    <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold text-[var(--color-ink)]">
                      Out of stock
                    </span>
                  </div>
                )}
              </div>

              {/* Body — tighter padding, smaller type */}
              <div className="flex flex-1 flex-col p-3">
                <div className="truncate text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
                  {p.category}
                </div>
                <div className="mt-0.5 line-clamp-2 font-display text-[13px] font-medium leading-snug">
                  {p.name}
                </div>
                <div className="mt-1.5 font-display text-sm font-medium tracking-display text-[var(--color-ink)]">
                  {formatKES(p.price)}
                </div>

                <div className="mt-2.5 flex items-center justify-between gap-1.5 border-t border-[var(--color-hairline)] pt-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-[10px]">
                    <input
                      type="checkbox"
                      checked={p.in_stock}
                      onChange={(e) => onToggle(p.id, e.target.checked)}
                      className="h-3.5 w-3.5 accent-[var(--color-primary)]"
                    />
                    <span className={p.in_stock ? "text-primary" : "text-muted-foreground"}>
                      {p.in_stock ? "In" : "Out"}
                    </span>
                  </label>

                  <AnimatePresence mode="wait" initial={false}>
                    {confirmDeleteId === p.id ? (
                      <motion.div
                        key="confirm"
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-1"
                      >
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white disabled:opacity-60"
                        >
                          {deletingId === p.id ? "…" : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-full border border-[var(--color-hairline)] px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          No
                        </button>
                      </motion.div>
                    ) : (
                      <motion.button
                        key="delete"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline)] p-1 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                        title="Delete product"
                      >
                        <Trash2 className="h-3 w-3" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-ink)]/40 p-4 backdrop-blur-sm"
          onClick={() => { setShowAdd(false); resetForm(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-[var(--color-hairline)] bg-card p-6 shadow-[var(--shadow-ambient)]"
          >
            <div className="font-display text-xl font-medium tracking-display">Add product</div>
            <div className="mt-5 grid gap-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={FIELD}
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={FIELD}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input
                type="number"
                placeholder="Price (KES)"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className={FIELD}
              />

              {form.image_url ? (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--color-hairline)] p-2.5">
                  <img src={form.image_url} alt="preview" className="h-12 w-12 rounded-lg object-cover" />
                  <span className="flex-1 truncate text-xs text-muted-foreground">{form.image_url}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image_url: "" })}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--color-hairline)] px-3.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                  {uploading ? "Uploading…" : "📁 Upload product image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      const ext = file.name.split(".").pop();
                      const path = `${Date.now()}.${ext}`;
                      const { error } = await supabase!.storage
                        .from("products")
                        .upload(path, file, { upsert: true, contentType: file.type });
                      if (!error) {
                        const { data } = supabase!.storage.from("products").getPublicUrl(path);
                        setForm((f) => ({ ...f, image_url: data.publicUrl }));
                      }
                      setUploading(false);
                    }}
                  />
                </label>
              )}

              <textarea
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-xl border border-[var(--color-hairline)] bg-card p-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.requires_prescription}
                  onChange={(e) => setForm({ ...form, requires_prescription: e.target.checked })}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                Requires prescription (Rx-only)
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => { setShowAdd(false); resetForm(); }} className={BTN_GHOST}>
                Cancel
              </button>
              <button
                onClick={() => { onAdd(form); setShowAdd(false); resetForm(); }}
                disabled={!form.name || !form.price || !form.image_url || uploading}
                className={BTN_PRIMARY}
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ─── Prescription Viewer (modal) ────────────────────────────────────────────── */

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
        {/* Header */}
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

        {/* Body */}
        <div className="flex-1 overflow-auto bg-surface/60 p-4">
          {!url ? (
            <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-[var(--color-hairline)] bg-card text-center text-sm text-muted-foreground">
              No file attached to this prescription.
            </div>
          ) : failed ? (
            <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-[var(--color-hairline)] bg-card p-6 text-center text-sm text-muted-foreground">
              Couldn't preview this file inline.
              <div className="mt-3">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={BTN_PRIMARY}
                >
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

        {/* Footer */}
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

/* ─── Prescriptions Panel ────────────────────────────────────────────────────── */

const RX_STATUS_META: Record<
  PrescriptionStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: {
    label: "Pending review",
    color: "text-sky-700",
    bg: "bg-sky-50/80 border-sky-100",
    dot: "bg-sky-500",
  },
  reviewed: {
    label: "Reviewed",
    color: "text-amber-700",
    bg: "bg-amber-50/80 border-amber-100",
    dot: "bg-amber-500",
  },
  fulfilled: {
    label: "Fulfilled",
    color: "text-emerald-700",
    bg: "bg-emerald-50/80 border-emerald-100",
    dot: "bg-emerald-500",
  },
};

function PrescriptionsPanel({
  rxs, onChange,
}: {
  rxs: Prescription[];
  onChange: (id: string, s: PrescriptionStatus) => void;
}) {
  const [filter, setFilter] = useState<PrescriptionStatus | "all">("all");
  const [viewing, setViewing] = useState<Prescription | null>(null);
  const list = rxs.filter((r) => filter === "all" || r.status === filter);
  const ALL_STATUSES: PrescriptionStatus[] = ["pending", "reviewed", "fulfilled"];

  if (rxs.length === 0) {
    return <div className={EMPTY}>No prescriptions yet.</div>;
  }

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
                      {hasFile ? "View prescription" : "No file"}
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
        {viewing && (
          <PrescriptionViewer rx={viewing} onClose={() => setViewing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Riders Panel ───────────────────────────────────────────────────────────── */

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
      <SectionHeading
        icon={<BikeIcon className="h-5 w-5" />}
        title="Riders"
        subtitle="Add your delivery riders here — they can then be assigned to orders above."
      />

      <div className={`${CARD} p-6`}>
        <div className="font-display text-base font-medium">Add rider</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`${FIELD} min-w-[160px] flex-1`}
          />
          <input
            placeholder="Phone (e.g. 0712345678)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={`${FIELD} min-w-[160px] flex-1`}
          />
          <button onClick={handleAdd} disabled={saving || !form.name || !form.phone} className={BTN_PRIMARY}>
            <Plus className="h-4 w-4" /> {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {riders.length === 0 ? (
        <div className={EMPTY}>No riders yet. Add one above to start assigning deliveries.</div>
      ) : (
        <div className={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface/70 text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Rider</th>
                  <th className="px-5 py-3.5 font-medium">Phone</th>
                  <th className="px-5 py-3.5 font-medium">Added</th>
                  <th className="px-5 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[var(--color-hairline)] transition-colors hover:bg-surface/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.phone}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${r.phone}`}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call
                        </a>
                        {confirmDeleteId === r.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Sure?</span>
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deletingId === r.id}
                              className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              {deletingId === r.id ? "…" : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-full border border-[var(--color-hairline)] px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(r.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                          >
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
        </div>
      )}
    </div>
  );
}

/* ─── Doctors Panel ──────────────────────────────────────────────────────────── */

function DoctorsPanel({
  doctors, onAdd, onToggle, onDelete,
}: {
  doctors: Doctor[];
  onAdd: (d: Omit<Doctor, "id" | "created_at">) => void;
  onToggle: (id: string, v: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Doctor, "id" | "created_at">>({
    name: "", specialty: "", bio: "", photo_url: "", consultation_fee: 0, is_available: true,
  });

  const resetForm = () => {
    setForm({ name: "", specialty: "", bio: "", photo_url: "", consultation_fee: 0, is_available: true });
    setPhotoError(null);
  };

  const handlePhotoSelect = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);
    setUploadingPhoto(true);
    try {
      const url = await uploadDoctorPhoto(file);
      setForm((f) => ({ ...f, photo_url: url }));
    } catch (e) {
      console.error(e);
      setPhotoError("Could not upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.specialty || !form.consultation_fee) return;
    setSaving(true);
    await onAdd(form);
    setSaving(false);
    setShowAdd(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{doctors.length} doctors</div>
        <button onClick={() => setShowAdd(true)} className={BTN_PRIMARY}>
          <Plus className="h-4 w-4" /> Add doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <div className={EMPTY}>No doctors yet. Add one so customers can book consultations.</div>
      ) : (
        <div className={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface/70 text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Doctor</th>
                  <th className="px-5 py-3.5 font-medium">Specialty</th>
                  <th className="px-5 py-3.5 font-medium">Fee</th>
                  <th className="px-5 py-3.5 font-medium">Available</th>
                  <th className="px-5 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t border-[var(--color-hairline)] transition-colors hover:bg-surface/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {d.photo_url ? (
                          <img
                            src={d.photo_url}
                            alt={d.name}
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--color-hairline)]"
                          />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                            {d.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{d.specialty}</td>
                    <td className="px-5 py-3.5">{formatKES(d.consultation_fee)}</td>
                    <td className="px-5 py-3.5">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={d.is_available}
                          onChange={(e) => onToggle(d.id, e.target.checked)}
                          className="h-4 w-4 accent-[var(--color-primary)]"
                        />
                        <span className={d.is_available ? "text-primary" : "text-muted-foreground"}>
                          {d.is_available ? "Available" : "Off"}
                        </span>
                      </label>
                    </td>
                    <td className="px-5 py-3.5">
                      {confirmDeleteId === d.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Sure?</span>
                          <button
                            onClick={() => handleDelete(d.id)}
                            disabled={deletingId === d.id}
                            className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
                          >
                            {deletingId === d.id ? "…" : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-full border border-[var(--color-hairline)] px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(d.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-ink)]/40 p-4 backdrop-blur-sm"
          onClick={() => { setShowAdd(false); resetForm(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-[var(--color-hairline)] bg-card p-6 shadow-[var(--shadow-ambient)]"
          >
            <div className="font-display text-xl font-medium tracking-display">Add doctor</div>
            <div className="mt-5 grid gap-3">
              <input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={FIELD}
              />
              <input
                placeholder="Specialty (e.g. General Practitioner)"
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                className={FIELD}
              />
              <input
                type="number"
                placeholder="Consultation fee (KES)"
                value={form.consultation_fee || ""}
                onChange={(e) => setForm({ ...form, consultation_fee: Number(e.target.value) })}
                className={FIELD}
              />

              <div>
                <div className="mb-2 text-sm font-medium">Photo (optional)</div>
                <div className="flex items-center gap-3">
                  {form.photo_url ? (
                    <img
                      src={form.photo_url}
                      alt="Preview"
                      className="h-14 w-14 rounded-full object-cover ring-1 ring-[var(--color-hairline)]"
                    />
                  ) : (
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-hairline)] px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary">
                    {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    {uploadingPhoto ? "Uploading…" : form.photo_url ? "Replace photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingPhoto}
                      onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
                    />
                  </label>
                </div>
                {photoError && <p className="mt-1.5 text-xs text-destructive">{photoError}</p>}
              </div>

              <textarea
                placeholder="Short bio (optional)"
                rows={3}
                value={form.bio ?? ""}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="rounded-xl border border-[var(--color-hairline)] bg-card p-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => { setShowAdd(false); resetForm(); }} className={BTN_GHOST}>
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!form.name || !form.specialty || !form.consultation_fee || saving || uploadingPhoto}
                className={BTN_PRIMARY}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ─── Consultations Panel ────────────────────────────────────────────────────── */

const CONSULTATION_STATUS_META: Record<
  ConsultationStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  awaiting_payment: { label: "Awaiting payment", color: "text-muted-foreground", bg: "bg-surface border-[var(--color-hairline)]", dot: "bg-muted-foreground/50" },
  paid: { label: "Paid — call needed", color: "text-sky-700", bg: "bg-sky-50/80 border-sky-100", dot: "bg-sky-500" },
  assigned: { label: "Assigned", color: "text-amber-700", bg: "bg-amber-50/80 border-amber-100", dot: "bg-amber-500" },
  in_progress: { label: "Call in progress", color: "text-violet-700", bg: "bg-violet-50/80 border-violet-100", dot: "bg-violet-500" },
  completed: { label: "Completed", color: "text-emerald-700", bg: "bg-emerald-50/80 border-emerald-100", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", dot: "bg-destructive" },
};

function ConsultationCard({
  c, onStatusChange, onSaveNotes,
}: {
  c: Consultation;
  onStatusChange: (id: string, s: ConsultationStatus) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(c.notes_from_doctor ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updating, setUpdating] = useState(false);
  const meta = CONSULTATION_STATUS_META[c.status];

  const advance = async (next: ConsultationStatus) => {
    setUpdating(true);
    await onStatusChange(c.id, next);
    setUpdating(false);
  };

  return (
    <div className={CARD}>
      <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-5 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        <span className="ml-auto text-[10px] font-normal text-muted-foreground">
          {new Date(c.created_at).toLocaleString()}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              #{c.id.slice(-6).toUpperCase()}
            </div>
            <div className="truncate font-display text-lg font-medium">{c.customer_name}</div>
            <div className="truncate text-sm text-muted-foreground">{c.customer_phone}</div>
            {c.doctor && (
              <div className="mt-1.5 text-xs text-muted-foreground">
                Doctor: {c.doctor.name} · {c.doctor.specialty}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-lg font-medium tracking-display">{formatKES(c.fee)}</div>
            <div className="text-xs text-muted-foreground">M-Pesa</div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--color-hairline)] bg-surface/60 p-3.5 text-sm text-foreground/90">
          {c.reason}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={`tel:${c.customer_phone}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary-soft"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/${formatPhoneForWa(c.customer_phone)}?text=${encodeURIComponent(
              `Hi ${c.customer_name}, this is ${PHARMACY_CONFIG.name} calling about your consultation.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>

          {c.status === "paid" && (
            <button
              onClick={() => advance("assigned")}
              disabled={updating}
              className="ml-auto rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
            >
              {updating ? "…" : "Mark assigned"}
            </button>
          )}
          {c.status === "assigned" && (
            <button
              onClick={() => advance("in_progress")}
              disabled={updating}
              className="ml-auto rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
            >
              {updating ? "…" : "Mark call in progress"}
            </button>
          )}
          {c.status === "in_progress" && (
            <button
              onClick={() => advance("completed")}
              disabled={updating}
              className="ml-auto rounded-full bg-[var(--color-ink)] px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {updating ? "…" : "Mark completed"}
            </button>
          )}
          {(c.status === "paid" || c.status === "assigned") && (
            <button
              onClick={() => advance("cancelled")}
              disabled={updating}
              className="rounded-full border border-[var(--color-hairline)] px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              Cancel
            </button>
          )}
        </div>

        {(c.status === "in_progress" || c.status === "completed") && (
          <div className="mt-4 rounded-2xl border border-[var(--color-hairline)] bg-surface/60 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Doctor's notes
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Summary of the call, advice given…"
              className="w-full rounded-xl border border-[var(--color-hairline)] bg-card p-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <button
              onClick={async () => { setSavingNotes(true); await onSaveNotes(c.id, notes); setSavingNotes(false); }}
              disabled={savingNotes || notes === (c.notes_from_doctor ?? "")}
              className="mt-2.5 rounded-full bg-[var(--color-ink)] px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {savingNotes ? "Saving…" : "Save notes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConsultationsPanel({
  consultations, onStatusChange, onSaveNotes,
}: {
  consultations: Consultation[];
  onStatusChange: (id: string, s: ConsultationStatus) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
}) {
  const [filter, setFilter] = useState<ConsultationStatus | "all">("all");
  const list = consultations.filter((c) => filter === "all" || c.status === filter);
  const ALL_STATUSES: ConsultationStatus[] = ["paid", "assigned", "in_progress", "completed", "cancelled"];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={chip(filter === "all")}>
          All · {consultations.length}
        </button>
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={chip(filter === s)}>
            {CONSULTATION_STATUS_META[s].label} · {consultations.filter((c) => c.status === s).length}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className={EMPTY}>No consultations to show.</div>
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <ConsultationCard key={c.id} c={c} onStatusChange={onStatusChange} onSaveNotes={onSaveNotes} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Equipment Requests Panel ───────────────────────────────────────────────── */

const EQUIPMENT_STATUS_META: Record<
  EquipmentRequestStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending: { label: "Needs quote", color: "text-sky-700", bg: "bg-sky-50/80 border-sky-100", dot: "bg-sky-500" },
  quoted: { label: "Quoted", color: "text-amber-700", bg: "bg-amber-50/80 border-amber-100", dot: "bg-amber-500" },
  accepted: { label: "Accepted", color: "text-violet-700", bg: "bg-violet-50/80 border-violet-100", dot: "bg-violet-500" },
  fulfilled: { label: "Fulfilled", color: "text-emerald-700", bg: "bg-emerald-50/80 border-emerald-100", dot: "bg-emerald-500" },
  rejected: { label: "Declined", color: "text-muted-foreground", bg: "bg-surface border-[var(--color-hairline)]", dot: "bg-muted-foreground/50" },
};

function EquipmentCard({
  r, onQuote, onStatusChange,
}: {
  r: EquipmentRequest;
  onQuote: (id: string, price: number, notes: string | null) => Promise<void>;
  onStatusChange: (id: string, s: EquipmentRequestStatus) => Promise<void>;
}) {
  const [price, setPrice] = useState(r.quoted_price?.toString() ?? "");
  const [quoteNotes, setQuoteNotes] = useState(r.quote_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const meta = EQUIPMENT_STATUS_META[r.status];

  return (
    <div className={CARD}>
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

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              #{r.id.slice(-6).toUpperCase()}
            </div>
            <div className="truncate font-display text-lg font-medium">{r.customer_name}</div>
            <div className="truncate text-sm text-muted-foreground">
              {r.customer_phone} · {r.delivery_address}
            </div>
          </div>
          <div className="shrink-0 text-right text-sm text-muted-foreground">Qty: {r.quantity}</div>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--color-hairline)] bg-surface/60 p-3.5 text-sm text-foreground/90">
          {r.item_description}
        </div>
        {r.notes && <div className="mt-2 text-xs text-muted-foreground">Note: {r.notes}</div>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={`tel:${r.customer_phone}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary-soft"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        </div>

        {(r.status === "pending" || r.status === "quoted") && (
          <div className="mt-4 rounded-2xl border border-[var(--color-hairline)] bg-surface/60 p-4">
            <div className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {r.status === "pending" ? "Send a quote" : "Update quote"}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                placeholder="Price (KES)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`${FIELD} w-40`}
              />
              <input
                placeholder="Notes (lead time, terms…)"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                className={`${FIELD} min-w-[160px] flex-1`}
              />
              <button
                onClick={async () => { setSaving(true); await onQuote(r.id, Number(price), quoteNotes || null); setSaving(false); }}
                disabled={saving || !price || Number(price) <= 0}
                className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Sending…" : "Send quote"}
              </button>
            </div>
          </div>
        )}

        {r.status === "accepted" && (
          <button
            onClick={async () => { setUpdating(true); await onStatusChange(r.id, "fulfilled"); setUpdating(false); }}
            disabled={updating}
            className="mt-4 w-full rounded-xl bg-[var(--color-ink)] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {updating ? "Updating…" : "Mark as delivered"}
          </button>
        )}
      </div>
    </div>
  );
}

function EquipmentPanel({
  requests, onQuote, onStatusChange,
}: {
  requests: EquipmentRequest[];
  onQuote: (id: string, price: number, notes: string | null) => Promise<void>;
  onStatusChange: (id: string, s: EquipmentRequestStatus) => Promise<void>;
}) {
  const [filter, setFilter] = useState<EquipmentRequestStatus | "all">("all");
  const list = requests.filter((r) => filter === "all" || r.status === filter);
  const ALL_STATUSES: EquipmentRequestStatus[] = ["pending", "quoted", "accepted", "fulfilled", "rejected"];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={chip(filter === "all")}>
          All · {requests.length}
        </button>
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={chip(filter === s)}>
            {EQUIPMENT_STATUS_META[s].label} · {requests.filter((r) => r.status === s).length}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className={EMPTY}>No equipment requests to show.</div>
      ) : (
        <div className="space-y-4">
          {list.map((r) => (
            <EquipmentCard key={r.id} r={r} onQuote={onQuote} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}