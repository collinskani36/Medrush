import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock, LogOut, TrendingUp, ClipboardList, Package, FileText,
  Bike as BikeIcon, Stethoscope, PhoneCall, PackageSearch, Pill, Loader2,
} from "lucide-react";
import {
  subscribeOrders, fetchProducts, fetchPrescriptions, fetchRiders,
  fetchAllDoctors, fetchConsultations, fetchEquipmentRequests,
  updateOrderStatus, assignRider, toggleProductStock, addProduct,
  deleteProduct, updatePrescriptionStatus, addRider, deleteRider,
  addDoctor, toggleDoctorAvailability, deleteDoctor,
  updateConsultationStatus, addConsultationNotes,
  quoteEquipmentRequest, updateEquipmentRequestStatus,
} from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { PHARMACY_CONFIG } from "@/config";
import { formatKES } from "@/lib/format";
import type {
  Order, Product, Prescription, Rider, Doctor,
  Consultation, EquipmentRequest,
} from "@/types";
import { FIELD, BTN_PRIMARY } from "./admin/shared";
import { OrdersPanel } from "./admin/AdminOrders";
import { ProductsPanel } from "./admin/AdminProducts";
import { PrescriptionsPanel } from "./admin/AdminPrescriptions";
import { RidersPanel } from "./admin/AdminRiders";
import { DoctorsPanel } from "./admin/AdminDoctors";
import { ConsultationsPanel } from "./admin/AdminConsultations";
import { EquipmentPanel } from "./admin/AdminEquipment";
import DeliveryPricingPanel from "./admin/AdminDelivery";

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
  const loadPrescriptions = () => fetchPrescriptions().then(setPrescriptions);

  useEffect(() => {
    const unsub = subscribeOrders(setOrders);
    fetchProducts().then(setProducts);
    loadPrescriptions();
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
            onBulkAdd={async (rows) => {
              const { error } = await supabase!.from("products").insert(rows);
              if (error) throw error;
              setProducts(await fetchProducts());
            }}
          />
        )}

        {tab === "prescriptions" && (
          <PrescriptionsPanel
            rxs={prescriptions}
            products={products}
            onChange={async (id, s) => { await updatePrescriptionStatus(id, s); await loadPrescriptions(); }}
            onRefresh={loadPrescriptions}
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