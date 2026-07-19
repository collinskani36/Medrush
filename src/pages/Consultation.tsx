import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchDoctors } from "@/lib/api";
import { formatKES } from "@/lib/format";
import type { Doctor } from "@/types";

export default function Consultation() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors()
      .then(setDoctors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-2 text-primary">
          <Stethoscope className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wide">Talk to a doctor</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Consult a real doctor</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Pay a small consultation fee and a licensed doctor will call you back to discuss your
          concern. No waiting rooms, no appointments to travel for.
        </p>

        {loading && (
          <div className="mt-10 text-center text-sm text-muted-foreground">Loading doctors…</div>
        )}

        {!loading && doctors.length === 0 && (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            No doctors are available for consultation right now. Please check back shortly.
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {doctors.map((d) => (
            <Link
              key={d.id}
              to={`/consult/${d.id}`}
              className="group flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary hover:shadow-[var(--shadow-lift)]"
            >
              {d.photo_url ? (
                <img src={d.photo_url} alt={d.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Stethoscope className="h-8 w-8" />
                </div>
              )}
              <div className="flex flex-1 flex-col">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{d.specialty}</div>
                <div className="font-display text-lg font-semibold leading-tight">{d.name}</div>
                {d.bio && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.bio}</p>}
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="font-display text-base font-semibold text-primary">{formatKES(d.consultation_fee)}</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Consult <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
