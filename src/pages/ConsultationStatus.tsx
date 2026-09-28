import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  PhoneCall,
  Clock,
  Stethoscope,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchConsultation } from "@/lib/api";
import { formatKES } from "@/lib/format";
import type { Consultation, ConsultationStatus as Status } from "@/types";

const STEPS: { key: Status; label: string; icon: React.ReactNode }[] = [
  { key: "paid", label: "Payment received", icon: <CheckCircle2 className="h-4 w-4" /> },
  { key: "assigned", label: "Doctor assigned", icon: <Stethoscope className="h-4 w-4" /> },
  { key: "in_progress", label: "Call in progress", icon: <PhoneCall className="h-4 w-4" /> },
  { key: "completed", label: "Consultation complete", icon: <CheckCircle2 className="h-4 w-4" /> },
];

export default function ConsultationStatus() {
  const { id } = useParams<{ id: string }>();
  const [consultation, setConsultation] = useState<Consultation | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    const load = () => fetchConsultation(id).then(setConsultation);
    load();
    const interval = setInterval(load, 8000); // simple polling until realtime is wired up
    return () => clearInterval(interval);
  }, [id]);

  if (consultation === undefined) {
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

  if (!consultation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
          Consultation not found.
        </div>
        <Footer />
      </div>
    );
  }

  const isCancelled = consultation.status === "cancelled";
  const currentIdx = STEPS.findIndex((s) => s.key === consultation.status);
  const currentStep = currentIdx >= 0 ? STEPS[currentIdx] : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Page header — same surface as Consultation / Booking ────── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
          <Link
            to="/consult"
            className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Book another consultation
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
            <span>Consultation status</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-mono normal-case tracking-normal">
              #{consultation.id.slice(-6).toUpperCase()}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="normal-case tracking-normal">
              {new Date(consultation.created_at).toLocaleString()}
            </span>
          </div>

          <h1 className="mt-1 font-display text-2xl font-semibold leading-tight md:text-3xl">
            {isCancelled ? "Consultation cancelled" : "Your doctor is on the way"}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            {isCancelled
              ? "This consultation was cancelled. Contact support if you have questions about your payment."
              : "We're matching you with your doctor. Keep your phone nearby — you'll receive a call shortly."}
          </p>

          {/* trust chips — single line, always */}
          <div className="mt-4 flex flex-nowrap items-center gap-1.5 sm:gap-2">
            {[
              { icon: ShieldCheck, label: "Licensed Kenyan doctors", short: "Licensed" },
              { icon: Clock, label: "Callback within the hour", short: "1-hr callback" },
              { icon: Stethoscope, label: "Not an emergency service", short: "Not emergency" },
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

      {/* ── Doctor + progress ───────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        {/* Doctor summary */}
        <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
            {consultation.doctor?.photo_url ? (
              <img
                src={consultation.doctor.photo_url}
                alt={consultation.doctor.name}
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
              {consultation.doctor?.specialty ?? "Consultation"}
            </div>
            <div className="truncate font-display text-lg font-semibold leading-tight">
              {consultation.doctor?.name ?? "Your doctor"}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              We'll call you on {consultation.customer_phone}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="font-display text-lg font-semibold leading-none text-primary">
              {formatKES(consultation.fee)}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground">amount paid</div>
          </div>
        </div>

        {/* Status */}
        {isCancelled ? (
          <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            This consultation was cancelled. Contact support if you have questions
            about your payment.
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-display text-base font-semibold">Progress</div>
              {currentStep && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                  <Clock className="h-3.5 w-3.5" /> {currentStep.label}
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              {STEPS.map((s, i) => {
                const done = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div
                    key={s.key}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
                      done
                        ? "border-primary/30 bg-primary-soft text-foreground"
                        : "border-border bg-surface text-muted-foreground"
                    } ${isCurrent ? "ring-1 ring-primary/30" : ""}`}
                  >
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                        done
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : s.icon}
                    </div>
                    <span className="font-medium">{s.label}</span>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Now
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Callback notice */}
        {(consultation.status === "paid" || consultation.status === "assigned") && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-700">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            We'll call you on {consultation.customer_phone} shortly. Keep your phone
            nearby.
          </div>
        )}

        {/* Doctor's notes */}
        {consultation.notes_from_doctor && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Doctor's notes
            </div>
            <p className="mt-2 text-sm text-foreground/90">
              {consultation.notes_from_doctor}
            </p>
          </div>
        )}

        {/* Summary */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Summary
          </div>
          <div className="mt-3 flex items-start justify-between gap-6 text-sm">
            <span className="text-muted-foreground">Reason</span>
            <span className="max-w-[65%] text-right text-foreground/90">
              {consultation.reason}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">Amount paid</span>
            <span className="font-display font-semibold text-foreground">
              {formatKES(consultation.fee)}
            </span>
          </div>
        </div>

        {/* Emergency disclaimer */}
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary-soft p-4 text-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-foreground/80">
            This isn't an emergency service. If you're experiencing a medical
            emergency, please call emergency services or visit the nearest
            hospital.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}