import { lazy, Suspense, useState } from "react";
import {
  FileUp, CheckCircle2, MapPin, Phone, Truck, Loader2, Lock,
  ArrowRight, FileCheck2, ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createPrescription, uploadPrescriptionFile } from "@/lib/api";
import type { LocationConfirmPayload } from "@/components/LocationPicker";

const LocationPicker = lazy(() => import("@/components/LocationPicker"));

const FLOW = [
  { icon: FileUp,  label: "Upload a photo or PDF" },
  { icon: Phone,   label: "Pharmacist calls to confirm" },
  { icon: Truck,   label: "Delivered to you" },
];

function MapSkeleton() {
  return (
    <div
      className="animate-pulse rounded-2xl border border-[var(--color-hairline)] bg-muted"
      style={{ height: 280 }}
      aria-hidden
    />
  );
}

export default function Prescription() {
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [location, setLocation] = useState<LocationConfirmPayload | null>(null);
  const [file, setFile]         = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [done, setDone]         = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const phoneOk  = /^0\d{9}$/.test(phone);
  const canSubmit = name.trim().length > 0 && phoneOk && location !== null && file !== null;

  const handleSubmit = async () => {
    if (!canSubmit || !file || !location) return;
    setSubmitting(true);
    try {
      const prescription_url = await uploadPrescriptionFile(file);
      await createPrescription({
        customer_name: name.trim(),
        customer_phone: phone,
        delivery_address: location.address,
        prescription_url,
        delivery_lat: location.lat,
        delivery_lng: location.lng,
        distance_km: location.distanceKm,
      });
      setDone(true);
    } catch (e) {
      console.error(e);
      alert("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div
          className="rx-texture absolute inset-0 opacity-50"
          style={{ backgroundColor: "var(--color-primary-deep)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_88%_0%,oklch(0.80_0.125_82/0.16),transparent)]" />

        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-12 md:pb-24 md:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              <span className="h-px w-8 bg-accent/70" /> Prescription orders
            </div>
            <h1 className="tracking-display mt-4 font-display text-3xl font-medium leading-[1.08] text-white md:text-5xl">
              Upload your prescription
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65 md:text-base">
              Send us a photo or PDF. A pharmacist calls within 30 minutes to confirm your order and delivery.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              {FLOW.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md"
                >
                  <Icon className="h-3.5 w-3.5 text-accent" /> {label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Form — overlaps hero ─────────────────────────────────────── */}
      <section className="relative mx-auto -mt-10 max-w-3xl px-4 pb-16 md:-mt-12">
        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-card p-10 text-center shadow-[var(--shadow-ambient)] md:p-14"
          >
            <div className="pointer-events-none absolute -top-16 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative flex flex-col items-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[var(--color-primary-deep)] text-accent shadow-[var(--shadow-gold)]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="tracking-display mt-5 font-display text-2xl font-medium md:text-3xl">
                Prescription received
              </div>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Thanks, {name.trim().split(" ")[0]} — we'll call you within 30 minutes
                to confirm your order and delivery fee.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">

            {/* Step 1 — Details */}
            <StepCard step={1} title="Your details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    className={input}
                  />
                </Field>
                <Field label="Phone (07XXXXXXXX)">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678"
                    autoComplete="tel"
                    className={input}
                  />
                </Field>
              </div>
              {phone && !phoneOk && (
                <p className="mt-3 text-xs text-destructive">Use a Kenyan format: 07XXXXXXXX</p>
              )}
            </StepCard>

            {/* Step 2 — Delivery location */}
            <StepCard step={2} title="Delivery location">
              <Suspense fallback={<MapSkeleton />}>
                <LocationPicker onConfirm={(data) => setLocation(data)} />
              </Suspense>

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
                      <> · est.{" "}
                        <span className="font-semibold text-foreground">
                          KSh {location.fee}
                        </span>{" "}
                        delivery</>
                    ) : (
                      <span className="ml-1 font-medium text-destructive">
                        — outside delivery area
                      </span>
                    )}
                  </div>
                </div>
              )}
            </StepCard>

            {/* Step 3 — File */}
            <StepCard step={3} title="Your prescription">
              <label className="block cursor-pointer">
                <div
                  className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed p-6 text-sm transition-all md:p-7 ${
                    file
                      ? "border-primary/40 bg-primary-soft"
                      : "border-[var(--color-hairline)] bg-surface hover:border-primary/50 hover:bg-primary-soft/60"
                  }`}
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--color-primary-deep)] text-accent shadow-[var(--shadow-lift)]">
                    {file ? <FileCheck2 className="h-6 w-6" /> : <FileUp className="h-6 w-6" />}
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <div className="truncate font-medium text-foreground">
                      {fileName ?? "Click to choose a file"}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {file ? "Click to replace this file" : "PNG, JPG or PDF — up to 10 MB"}
                    </div>
                  </div>
                  <span className="relative hidden shrink-0 rounded-full border border-[var(--color-hairline)] bg-card px-4 py-2 text-xs font-semibold text-primary transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground sm:inline-block">
                    {file ? "Change" : "Browse"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f);
                      setFileName(f?.name ?? null);
                    }}
                  />
                </div>
              </label>
            </StepCard>

            {/* Privacy note */}
            <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft px-4 py-3.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-foreground/75">
                Your prescription is only used to fulfil your order and is never shared
                with third parties.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading &amp; submitting…
                </>
              ) : (
                <>
                  Submit prescription <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> Secured &amp; private
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

const input =
  "h-12 w-full rounded-xl border border-[var(--color-hairline)] bg-card px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

function StepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <div className="mb-2 font-medium text-foreground">{label}</div>
      {children}
    </label>
  );
}