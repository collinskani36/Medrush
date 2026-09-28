import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Clock, Stethoscope } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StkPushModal } from "@/components/StkPushModal";
import { fetchDoctor, createConsultation } from "@/lib/api";
import { formatKES } from "@/lib/format";
import type { Doctor } from "@/types";

export default function ConsultationBooking() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [showStk, setShowStk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    fetchDoctor(doctorId).then(setDoctor);
  }, [doctorId]);

  const phoneOk = /^0\d{9}$/.test(phone);
  const canSubmit = !!doctor && !!name && phoneOk && reason.trim().length >= 10;

  const submitBooking = async () => {
    if (!doctor) return;
    setSubmitting(true);
    try {
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
      navigate(`/consult/status/${consultation.id}`);
    } catch (e) {
      console.error(e);
      alert("Could not book your consultation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    if (!canSubmit) return;
    setShowStk(true);
  };

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
          Loading…
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Page header — same surface as Consultation / Status ─────── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
          <Link
            to="/consult"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All doctors
          </Link>

          <div className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">
            Confirm your consultation
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold leading-tight md:text-3xl">
            Book a callback with {doctor.name.split(" ")[0]}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Fill in your details, tell the doctor what's going on, and pay
            securely with M-Pesa. You'll receive a call shortly after.
          </p>

          {/* trust chips — single line, always */}
          <div className="mt-4 flex flex-nowrap items-center gap-1.5 sm:gap-2">
            {[
              { icon: ShieldCheck, label: "Licensed Kenyan doctors", short: "Licensed" },
              { icon: Clock, label: "Callback within the hour", short: "1-hr callback" },
              { icon: Stethoscope, label: "M-Pesa · secure payment", short: "M-Pesa" },
            ].map(({ icon: Icon, label, short }) => (
              <span
                key={label}
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-surface px-2.5 py-1.5 text-[10px] font-medium text-foreground/80 sm:flex-none sm:px-3 sm:text-xs"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Doctor summary ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 pt-6 md:pt-8">
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
            {doctor.photo_url ? (
              <img
                src={doctor.photo_url}
                alt={doctor.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-soft">
                <Stethoscope className="h-7 w-7 text-primary/60" strokeWidth={1.2} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {doctor.specialty}
            </div>
            <div className="truncate font-display text-lg font-semibold leading-tight">
              {doctor.name}
            </div>
            {doctor.bio && (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:line-clamp-2">
                {doctor.bio}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <div className="font-display text-lg font-semibold leading-none text-primary">
              {formatKES(doctor.consultation_fee)}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              per consultation
            </div>
          </div>
        </div>
      </section>

      {/* ── Form ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl space-y-4 px-4 py-6 md:py-8">
        <Card title="Your details">
          <div className="grid gap-4 sm:grid-cols-2">
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
            <p className="mt-2 text-xs text-destructive">
              Use a Kenyan format: 07XXXXXXXX
            </p>
          )}
        </Card>

        <Card title="What would you like to discuss?">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="Briefly describe your symptoms or question. The doctor will use this to prepare before calling you."
            className="w-full resize-none rounded-xl border border-border bg-card p-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
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

        <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary-soft p-4 text-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-foreground/80">
            After payment, {doctor.name} will call you on the number above. This
            isn't an emergency service — if you're experiencing a medical
            emergency, please call emergency services or visit the nearest
            hospital.
          </p>
        </div>

        <button
          onClick={handleProceed}
          disabled={!canSubmit}
          className="group flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-card)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:hover:scale-100"
        >
          Pay {formatKES(doctor.consultation_fee)} with M-Pesa
        </button>

        <p className="text-center text-xs text-muted-foreground">
          You'll be prompted on your phone to complete the payment.
        </p>
      </section>

      <StkPushModal
        open={showStk}
        phone={phone}
        amount={doctor.consultation_fee}
        submitting={submitting}
        onConfirm={submitBooking}
        onCancel={() => setShowStk(false)}
      />

      <Footer />
    </div>
  );
}

const input =
  "h-12 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 font-display text-base font-semibold">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="mb-1.5 font-medium">{label}</div>
      {children}
    </label>
  );
}