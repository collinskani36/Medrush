import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, ShieldCheck, Clock, Stethoscope, Lock, BadgeCheck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StkPushModal } from "@/components/StkPushModal";
import { HeartbeatLoader } from "@/components/HeartbeatLoader";
import { fetchDoctor, createConsultation } from "@/lib/api";
import { formatKES } from "@/lib/format";
import type { Doctor } from "@/types";

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export default function ConsultationBooking() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [showStk, setShowStk] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  // The doctor list the client was viewing (set by the doctor card's Link state).
  // Falls back to all available doctors if the page was opened directly.
  const backTo =
    (location.state as { from?: string } | null)?.from ?? "/consult?care=all";

  useEffect(() => {
    if (!doctorId) return;
    setDoctorLoading(true);
    fetchDoctor(doctorId)
      .then(setDoctor)
      .catch(console.error)
      .finally(() => setDoctorLoading(false));
  }, [doctorId]);

  const phoneOk = /^0\d{9}$/.test(phone);
  const canSubmit = !!doctor && !!name && phoneOk && reason.trim().length >= 10;

  const closeStk = () => {
    setShowStk(false);
    setCheckoutRequestId(null);
    setSubmitting(false);
  };

  // Create the consultation, fire the STK push, then hand the ID to the modal to poll
  const handleProceed = async () => {
    if (!canSubmit || !doctor) return;
    setShowStk(true);
    setSubmitting(true);
    try {
      // Reuse the same consultation if the client retries after a failed/cancelled payment
      let id = consultationId;
      if (!id) {
        const consultation = await createConsultation({
          customer_name: name,
          customer_phone: phone,
          doctor_id: doctor.id,
          reason,
          fee: doctor.consultation_fee,
          payment_method: "mpesa",
          scheduled_time: null,
          notes_from_doctor: null,
        });
        id = consultation.id;
        setConsultationId(id);
      }

      const res = await fetch(`${FN_BASE}/mpesa-stk-push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          phone, // raw 07XXXXXXXX, the edge function formats it
          amount: doctor.consultation_fee,
          reference_type: "consultation",
          reference_id: id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutRequestId) {
        throw new Error(data.error ?? "STK push failed");
      }
      setCheckoutRequestId(data.checkoutRequestId);
    } catch (e) {
      console.error(e);
      closeStk();
      alert("Could not send the M-Pesa prompt. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        {doctorLoading ? (
          <HeartbeatLoader tone="surface" label="Loading doctor" className="min-h-[50vh]" />
        ) : (
          <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
            <h1 className="tracking-display font-display text-2xl font-medium">Doctor not found</h1>
            <p className="text-sm text-muted-foreground">
              This doctor may no longer be available.
            </p>
            <Link
              to={backTo}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-[var(--color-primary-deep)]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to doctors
            </Link>
          </div>
        )}
        <Footer />
      </div>
    );
  }

  const firstName = doctor.name.replace(/^dr\.?\s+/i, "").split(" ")[0];

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      {/* Hero banner */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div
          className="rx-texture absolute inset-0 opacity-50"
          style={{ backgroundColor: "var(--color-primary-deep)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_88%_0%,oklch(0.80_0.125_82/0.16),transparent)]" />

        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-8 md:pb-24 md:pt-12">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to doctors
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              <Stethoscope className="h-4 w-4" /> Confirm your consultation
            </div>
            <h1 className="tracking-display mt-4 font-display text-3xl font-medium leading-[1.08] text-white md:text-5xl">
              Book a callback with Dr. {firstName}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65 md:text-base">
              Fill in your details, tell the doctor what's going on, and pay
              securely with M-Pesa. You'll receive a call shortly after.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent/80" /> Licensed Kenyan doctors
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent/80" /> Callback within the hour
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-accent/80" /> M-Pesa · secure payment
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Form — overlaps the banner for depth */}
      <section className="relative mx-auto -mt-10 max-w-3xl px-4 pb-16 md:-mt-12">
        <div className="space-y-5">

          {/* ── Your doctor (fee is revealed here, after selection) ───── */}
          <Card step={1} title="Your doctor">
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Portrait */}
              <div className="relative shrink-0">
                <div className="h-20 w-20 overflow-hidden rounded-2xl ring-1 ring-[var(--color-hairline)] ring-offset-2 ring-offset-card sm:h-24 sm:w-24">
                  {doctor.photo_url ? (
                    <img
                      src={doctor.photo_url}
                      alt={doctor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary-deep)] to-[var(--color-ink)]">
                      <Stethoscope className="h-8 w-8 text-accent/50" strokeWidth={1.2} />
                    </div>
                  )}
                </div>
                {/* Verified mark */}
                <span
                  className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-[var(--color-primary-deep)] text-accent"
                  title="Registered practitioner"
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                </span>
              </div>

              {/* Identity */}
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-foreground/60">
                  {doctor.specialty}
                </div>
                <div className="tracking-display mt-1 font-display text-xl font-medium leading-tight sm:text-2xl">
                  {doctor.name}
                </div>
                <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Registered medical practitioner
                </div>
              </div>
            </div>

            {doctor.bio && (
              <p className="mt-5 border-t border-[var(--color-hairline)] pt-5 text-sm leading-relaxed text-muted-foreground">
                {doctor.bio}
              </p>
            )}

            {/* Fee — quiet, but clear */}
            <div className="mt-5 flex items-center justify-between border-t border-[var(--color-hairline)] pt-4 text-sm">
              <span className="text-muted-foreground">Consultation fee</span>
              <span className="font-medium tabular-nums text-foreground">
                {formatKES(doctor.consultation_fee)}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  / session
                </span>
              </span>
            </div>
          </Card>

          {/* ── Your details ─────────────────────────────────────────── */}
          <Card step={2} title="Your details">
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
                  inputMode="numeric"
                  className={input}
                  placeholder="0712345678"
                />
              </Field>
            </div>
            {phone && !phoneOk && (
              <p className="mt-3 text-xs text-destructive">
                Use a Kenyan format: 07XXXXXXXX
              </p>
            )}
          </Card>

          {/* ── What would you like to discuss? ──────────────────────── */}
          <Card step={3} title="What would you like to discuss?">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Briefly describe your symptoms or question. The doctor will use this to prepare before calling you."
              className={textarea}
            />
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {reason && reason.trim().length < 10
                  ? "A few more details will help the doctor prepare."
                  : "Shared only with your doctor."}
              </span>
              <span className="tabular-nums text-muted-foreground/70">
                {reason.trim().length}/10
              </span>
            </div>
          </Card>

          {/* Emergency notice */}
          <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary-soft px-4 py-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--color-primary-deep)] text-accent">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              After payment, <span className="font-semibold text-foreground">{doctor.name}</span>{" "}
              will call you on the number above. This isn't an emergency
              service — if you're experiencing a medical emergency, please call
              emergency services or visit the nearest hospital.
            </p>
          </div>

          <button
            type="button"
            onClick={handleProceed}
            disabled={!canSubmit || submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:hover:scale-100"
          >
            Pay {formatKES(doctor.consultation_fee)} with M-Pesa
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> You'll be prompted on your phone to
            complete the payment
          </p>
        </div>
      </section>

      <StkPushModal
        open={showStk}
        phone={phone}
        amount={doctor.consultation_fee}
        submitting={submitting}
        checkoutRequestId={checkoutRequestId}
        onSuccess={() => navigate(`/consult/status/${consultationId}`)}
        onCancel={closeStk}
        onError={(msg) => {
          closeStk();
          alert(msg);
        }}
      />

      <Footer />
    </div>
  );
}

const input =
  "h-12 w-full rounded-xl border border-[var(--color-hairline)] bg-card px-4 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

const textarea =
  "w-full resize-none rounded-xl border border-[var(--color-hairline)] bg-card px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

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