import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Stethoscope, ArrowRight, ShieldCheck, Clock, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchDoctors } from "@/lib/api";
import { formatKES } from "@/lib/format";
import { SPECIALTIES, type Specialty } from "@/lib/specialties";
import type { Doctor } from "@/types";


// ---------------------------------------------------------------------------
export default function Consultation() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Specialty>("All");

  useEffect(() => {
    fetchDoctors()
      .then((list) => setDoctors(list.filter((d) => d.is_available)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      active === "All"
        ? doctors
        : doctors.filter((d) =>
            d.specialty.toLowerCase().includes(active.toLowerCase()),
          ),
    [doctors, active],
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── Page header — same surface as Booking / Status ──────────── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-6 md:py-8">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Talk to a doctor
          </div>
          <h1 className="mt-1 font-display text-2xl font-semibold leading-tight md:text-3xl">
            A real doctor, on a call with you
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground">
            Pay a small fee, describe your concern, and a licensed doctor calls
            you back. No waiting room, no travel.
          </p>

          {/* trust chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { icon: ShieldCheck, label: "Licensed Kenyan doctors" },
              { icon: Clock, label: "Callback within the hour" },
              { icon: Star, label: "M-Pesa · secure payment" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground/80"
              >
                <Icon className="h-3.5 w-3.5 text-primary" /> {label}
              </span>
            ))}
          </div>

          {/* Specialty filter pills */}
          <div className="-mx-4 mt-5 overflow-x-auto px-4">
            <div className="flex gap-2 pb-1">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  onClick={() => setActive(s)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    active === s
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Doctor list ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 py-6 md:py-8">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-24 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <div className="mt-3 font-display text-base font-semibold">
              No doctors available right now
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {active !== "All"
                ? "Try a different specialty, or check back shortly."
                : "Please check back shortly."}
            </p>
            {active !== "All" && (
              <button
                onClick={() => setActive("All")}
                className="mt-4 inline-flex items-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground"
              >
                Show all doctors
              </button>
            )}
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((d) => (
            <DoctorRow key={d.id} doctor={d} />
          ))}
        </div>
      </section>

      {/* ── Trust footer band ────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div className="border-t border-border bg-surface">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-1.5 px-4 py-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Not an emergency service
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-primary" /> Registered medical practitioners
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Callback, not a video call
            </span>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// DoctorRow — compact card, same styling as the Booking doctor summary
// ---------------------------------------------------------------------------
function DoctorRow({ doctor: d }: { doctor: Doctor }) {
  return (
    <Link
      to={`/consult/${d.id}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-colors hover:border-primary/40"
    >
      {/* Photo */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
        {d.photo_url ? (
          <img
            src={d.photo_url}
            alt={d.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-soft">
            <Stethoscope className="h-7 w-7 text-primary/60" strokeWidth={1.2} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {d.specialty}
        </div>
        <div className="truncate font-display text-lg font-semibold leading-tight">
          {d.name}
        </div>
        {d.bio && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:line-clamp-2">
            {d.bio}
          </p>
        )}
      </div>

      {/* Fee + CTA */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="text-right">
          <div className="font-display text-lg font-semibold leading-none text-primary">
            {formatKES(d.consultation_fee)}
          </div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">per consultation</div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition-transform group-hover:scale-[1.03]">
          Consult <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}