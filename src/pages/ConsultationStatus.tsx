import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, PhoneCall, Clock, Stethoscope, ArrowLeft } from "lucide-react";
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
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Consultation not found.</div>
      </div>
    );
  }

  const isCancelled = consultation.status === "cancelled";
  const currentIdx = STEPS.findIndex((s) => s.key === consultation.status);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-2xl px-4 py-8">
        <Link to="/consult" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Book another consultation
        </Link>

        <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            #{consultation.id.slice(-6).toUpperCase()} · {new Date(consultation.created_at).toLocaleString()}
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold">
            {consultation.doctor?.name ?? "Your doctor"}
          </h1>
          <div className="mt-1 text-sm text-muted-foreground">{consultation.doctor?.specialty}</div>

          {isCancelled ? (
            <div className="mt-6 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
              This consultation was cancelled. Contact support if you have questions about your payment.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {STEPS.map((s, i) => {
                const done = i <= currentIdx;
                return (
                  <div key={s.key} className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
                    done ? "border-primary/30 bg-primary-soft text-foreground" : "border-border bg-surface text-muted-foreground"
                  }`}>
                    <div className={`grid h-8 w-8 place-items-center rounded-full ${done ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"}`}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : s.icon}
                    </div>
                    <span className="font-medium">{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {consultation.status === "paid" || consultation.status === "assigned" ? (
            <div className="mt-5 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              We'll call you on {consultation.customer_phone} shortly.
            </div>
          ) : null}

          {consultation.notes_from_doctor && (
            <div className="mt-5 rounded-xl border border-border bg-surface p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Doctor's notes</div>
              <p className="mt-1 text-sm text-foreground/90">{consultation.notes_from_doctor}</p>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">Reason</span>
            <span className="max-w-[60%] text-right">{consultation.reason}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount paid</span>
            <span className="font-semibold">{formatKES(consultation.fee)}</span>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
