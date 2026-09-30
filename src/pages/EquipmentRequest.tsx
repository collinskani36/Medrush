import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PackageSearch, MapPin, ArrowRight, Loader2, Lock } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createEquipmentRequest } from "@/lib/api";
import type { LocationConfirmPayload } from "@/components/LocationPicker";

const LocationPicker = lazy(() => import("@/components/LocationPicker"));

function MapSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-[var(--color-hairline)] bg-muted"
      style={{ height: 280, width: "100%" }}
      aria-hidden
    />
  );
}

export default function EquipmentRequest() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState<LocationConfirmPayload | null>(null);
  const [itemDescription, setItemDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const phoneOk = /^0\d{9}$/.test(phone);
  const canSubmit =
    !!name &&
    phoneOk &&
    location !== null &&
    itemDescription.trim().length >= 5 &&
    quantity > 0;

  const submit = async () => {
    if (!canSubmit || !location) return;
    setSubmitting(true);
    try {
      const req = await createEquipmentRequest({
        customer_name: name,
        customer_phone: phone,
        delivery_address: location.address,
        delivery_lat: location.lat,
        delivery_lng: location.lng,
        distance_km: location.distanceKm,
        item_description: itemDescription,
        quantity,
        notes: notes || null,
      });
      navigate(`/equipment/status/${req.id}`);
    } catch (e) {
      console.error(e);
      alert("Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      {/* Hero banner */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div className="rx-texture absolute inset-0 opacity-50" style={{ backgroundColor: "var(--color-primary-deep)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_88%_0%,oklch(0.80_0.125_82/0.16),transparent)]" />

        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-12 md:pb-24 md:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              <PackageSearch className="h-4 w-4" /> Pharmaceutical equipment
            </div>
            <h1 className="tracking-display mt-4 font-display text-3xl font-medium leading-[1.08] text-white md:text-5xl">
              Request a quotation
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65 md:text-base">
              Tell us what equipment you need — medical devices, mobility aids, and more.
              We'll get back to you with pricing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form — overlaps the banner for depth */}
      <section className="relative mx-auto -mt-10 max-w-3xl px-4 pb-16 md:-mt-12">
        <div className="space-y-5">

          {/* ── Your details ─────────────────────────────────────────────── */}
          <Card step={1} title="Your details">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={input}
                  placeholder="John Doe"
                />
              </Field>
              <Field label="Phone (07XXXXXXXX)">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={input}
                  placeholder="0712345678"
                />
              </Field>
            </div>
            {phone && !phoneOk && (
              <p className="mt-3 text-xs text-destructive">Use a Kenyan format: 07XXXXXXXX</p>
            )}
          </Card>

          {/* ── Delivery location ─────────────────────────────────────────── */}
          <Card step={2} title="Delivery location">
            <Suspense fallback={<MapSkeleton />}>
              <LocationPicker onConfirm={(data) => setLocation(data)} />
            </Suspense>

            {/* Delivery cost preview — shown after pin is confirmed */}
            {location && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary-soft px-4 py-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--color-primary-deep)] text-accent">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    ~{location.distanceKm.toFixed(1)} km by road
                  </span>
                  {location.fee !== null ? (
                    <>
                      {" "}· est.{" "}
                      <span className="font-semibold text-foreground">KSh {location.fee}</span>{" "}
                      delivery (admin confirms final price when quoting)
                    </>
                  ) : (
                    <span className="ml-1 font-medium text-destructive">— outside delivery area</span>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* ── What do you need? ─────────────────────────────────────────── */}
          <Card step={3} title="What do you need?">
            <textarea
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              rows={4}
              placeholder="e.g. a digital blood pressure monitor"
              className={textarea}
            />
            <div className="mt-5 max-w-[160px]">
              <Field label="Quantity">
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className={input}
                />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Additional notes (optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Preferred brand, budget range, urgency…"
                  className={textarea}
                />
              </Field>
            </div>
          </Card>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>
                Request quotation <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Your details are only used to prepare your quotation
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}

const input =
  "h-12 w-full rounded-xl border border-[var(--color-hairline)] bg-card px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

const textarea =
  "w-full rounded-xl border border-[var(--color-hairline)] bg-card px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

function Card({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-[var(--color-hairline)] bg-card p-6 shadow-[var(--shadow-ambient)] md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-primary-deep)] font-display text-sm font-semibold text-accent">
          {step}
        </div>
        <div className="tracking-display font-display text-lg font-medium">{title}</div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="mb-2 font-medium text-foreground">{label}</div>
      {children}
    </label>
  );
}