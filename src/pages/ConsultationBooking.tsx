import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
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
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/consult" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All doctors
        </Link>

        <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          {doctor.photo_url && <img src={doctor.photo_url} alt={doctor.name} className="h-16 w-16 rounded-xl object-cover" />}
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{doctor.specialty}</div>
            <div className="font-display text-lg font-semibold">{doctor.name}</div>
          </div>
          <div className="ml-auto font-display text-lg font-semibold text-primary">{formatKES(doctor.consultation_fee)}</div>
        </div>

        <div className="mt-6 space-y-6">
          <Card title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="John Doe" />
              </Field>
              <Field label="Phone (07XXXXXXXX)">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={input} placeholder="0712345678" />
              </Field>
            </div>
            {phone && !phoneOk && <p className="mt-2 text-xs text-destructive">Use a Kenyan format: 07XXXXXXXX</p>}
          </Card>

          <Card title="What would you like to discuss?">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Briefly describe your symptoms or question. The doctor will use this to prepare before calling you."
              className="w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary"
            />
            {reason && reason.trim().length < 10 && (
              <p className="mt-2 text-xs text-muted-foreground">A few more details will help the doctor prepare.</p>
            )}
          </Card>

          <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary-soft p-4 text-sm">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="text-foreground/80">
              After payment, {doctor.name} will call you on the number above. This isn't an emergency
              service — if you're experiencing a medical emergency, please call emergency services or
              visit the nearest hospital.
            </p>
          </div>

          <button
            onClick={handleProceed}
            disabled={!canSubmit}
            className="w-full rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            Pay {formatKES(doctor.consultation_fee)} with M-Pesa
          </button>
        </div>
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

const input = "h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary";

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
