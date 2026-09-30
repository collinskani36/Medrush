import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Stethoscope, ArrowRight, ArrowLeft, ShieldCheck, Clock, Lock,
  Baby, Flower2, HeartPulse, Sparkles, Brain, User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { fetchDoctors } from "@/lib/api";
import type { Doctor } from "@/types";

// ---------------------------------------------------------------------------
// Care areas shown on the landing page.
// Put the images in  public/consult/  (e.g. public/consult/children.jpg).
// If an image is missing, the card falls back to a soft gradient + icon.
// `match` = keywords compared against each doctor's `specialty` (lowercase).
// ---------------------------------------------------------------------------
type CareArea = {
  key: string;
  title: string;
  blurb: string;
  image: string;
  icon: LucideIcon;
  match: string[];
};

const CARE_AREAS: CareArea[] = [
  {
    key: "children",
    title: "Children's health",
    blurb: "Gentle, caring doctors for your little ones.",
    image: "/consult/children.jpg",
    icon: Baby,
    match: ["paed", "pedi", "child"],
  },
  {
    key: "women",
    title: "Women's health",
    blurb: "Private, respectful care at every stage of life.",
    image: "/consult/women.jpg",
    icon: Flower2,
    match: ["gyn", "obst", "women", "maternal", "reproductive"],
  },
  {
    key: "family",
    title: "Family & general",
    blurb: "Everyday health concerns, answered with care.",
    image: "/consult/family.jpg",
    icon: HeartPulse,
    match: ["general", "family", "internal", "physician"],
  },
  {
    key: "skin",
    title: "Skin & hair",
    blurb: "Feel comfortable in your own skin.",
    image: "/consult/skin.jpeg",
    icon: Sparkles,
    match: ["derm", "skin"],
  },
  {
    key: "mind",
    title: "Mental wellness",
    blurb: "A calm, confidential space to talk.",
    image: "/consult/mind.jpg",
    icon: Brain,
    match: ["psych", "mental", "counsel"],
  },
  {
    key: "men",
    title: "Men's health",
    blurb: "Discreet advice, without the awkwardness.",
    image: "/consult/men.png",
    icon: User,
    match: ["urolog", "andro", "men's"],
  },
];

// ---------------------------------------------------------------------------
export default function Consultation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const care = searchParams.get("care"); // null = landing page

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors()
      .then((list) => setDoctors(list.filter((d) => d.is_available)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [care]);

  const area = CARE_AREAS.find((a) => a.key === care) ?? null;

  const filtered = useMemo(() => {
    if (!care || care === "all" || !area) return doctors;
    return doctors.filter((d) =>
      area.match.some((m) => d.specialty.toLowerCase().includes(m)),
    );
  }, [doctors, care, area]);

  const openCare = (key: string) => setSearchParams({ care: key });
  const backToLanding = () => setSearchParams({});

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {!care ? (
        <Landing onPick={openCare} />
      ) : (
        <DoctorsView
          title={area?.title ?? "All doctors"}
          loading={loading}
          doctors={filtered}
          onBack={backToLanding}
          onShowAll={() => openCare("all")}
          isAll={care === "all"}
          // the exact list the client is viewing, so the booking page can return here
          listUrl={`/consult?care=${care}`}
        />
      )}

      <Footer />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Landing — warm welcome + care-area cards (no prices here)
// ---------------------------------------------------------------------------
function Landing({ onPick }: { onPick: (key: string) => void }) {
  return (
    <>
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div
          className="rx-texture absolute inset-0 opacity-50"
          style={{ backgroundColor: "var(--color-primary-deep)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_88%_0%,oklch(0.80_0.125_82/0.16),transparent)]" />

        <div className="relative mx-auto max-w-5xl px-4 pt-12 pb-10 md:pt-16 md:pb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              <span className="h-px w-8 bg-accent/70" /> You're in good hands
            </div>
            <h1 className="tracking-display mt-4 max-w-2xl font-display text-3xl font-medium leading-[1.1] text-white md:text-5xl">
              Welcome. How can we care for you today?
            </h1>
            <p className="mt-4 max-w-lg text-sm text-white/65 md:text-base">
              Choose who the visit is for. A caring, licensed doctor will call
              you back, from the comfort of your home.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent/80" /> Licensed Kenyan doctors
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-accent/80" /> Private & confidential
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent/80" /> Callback within the hour
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {CARE_AREAS.map((a, i) => (
              <motion.button
                key={a.key}
                type="button"
                onClick={() => onPick(a.key)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i, ease: "easeOut" }}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-[var(--color-primary-deep)] text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-[var(--shadow-gold)] md:aspect-[4/4.4]"
              >
                {/* fallback backdrop (visible if the image is missing) */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-primary-deep)] to-[var(--color-ink)]">
                  <a.icon className="h-14 w-14 text-accent/30" strokeWidth={1} />
                </div>

                <img
                  src={a.image}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* soft overlay for legible text */}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/90 via-[var(--color-ink)]/30 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                  <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-accent ring-1 ring-accent/30 backdrop-blur-md transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <a.icon className="h-4 w-4" />
                  </span>
                  <div className="tracking-display font-display text-lg font-medium leading-tight text-white md:text-xl">
                    {a.title}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-snug text-white/70">
                    {a.blurb}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
                    Meet our doctors
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => onPick("all")}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              Not sure where to start? Speak to any available doctor
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// DoctorsView — shown after picking a care area (no prices on this page)
// ---------------------------------------------------------------------------
function DoctorsView({
  title, loading, doctors, onBack, onShowAll, isAll, listUrl,
}: {
  title: string;
  loading: boolean;
  doctors: Doctor[];
  onBack: () => void;
  onShowAll: () => void;
  isAll: boolean;
  listUrl: string;
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div
          className="rx-texture absolute inset-0 opacity-50"
          style={{ backgroundColor: "var(--color-primary-deep)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="relative mx-auto max-w-5xl px-4 py-8 md:py-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All care areas
          </button>
          <h1 className="tracking-display mt-3 font-display text-2xl font-medium text-white md:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-md text-sm text-white/60">
            Pick a doctor you feel comfortable with. They'll call you back
            personally.
          </p>

          {/* Shared assurances — shown once here instead of on every card */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-accent/80" /> Registered medical practitioners
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-accent/80" /> Personal callback within the hour
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-accent/80" /> Private & confidential
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-3 py-5 sm:px-4 md:py-10">
        {loading && (
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-72 animate-pulse rounded-2xl bg-muted sm:h-96 sm:rounded-3xl" />
            ))}
          </div>
        )}

        {!loading && doctors.length === 0 && (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <Stethoscope className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <div className="mt-3 font-display text-base font-semibold">
              Our doctors here are busy right now
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAll
                ? "Please check back shortly."
                : "Try another care area, or speak to any available doctor."}
            </p>
            {!isAll && (
              <button
                type="button"
                onClick={onShowAll}
                className="mt-4 inline-flex items-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground"
              >
                See all available doctors
              </button>
            )}
          </div>
        )}

        {/* 2 columns on mobile, 2 on small tablets, 3 on desktop */}
        {!loading && doctors.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3">
            {doctors.map((d, i) => (
              <DoctorCard key={d.id} doctor={d} index={i} listUrl={listUrl} />
            ))}
          </div>
        )}
      </section>

      {!loading && doctors.length > 0 && (
        <div className="border-t border-border bg-surface">
          <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Not an emergency service
            </span>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// DoctorCard — compact, welcoming profile card; no price (fee shows after selection)
// ---------------------------------------------------------------------------
function DoctorCard({
  doctor: d, index, listUrl,
}: {
  doctor: Doctor;
  index: number;
  listUrl: string;
}) {
  const firstName = d.name.replace(/^dr\.?\s+/i, "").split(" ")[0];

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index, ease: "easeOut" }}
    >
      <Link
        to={`/consult/${d.id}`}
        state={{ from: listUrl }}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-[var(--shadow-gold)] sm:rounded-3xl"
      >
        {/* Photo */}
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-primary-soft">
          {d.photo_url ? (
            <img
              src={d.photo_url}
              alt={d.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary-deep)] to-[var(--color-ink)]">
              <Stethoscope className="h-10 w-10 text-accent/40" strokeWidth={1} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/50 via-transparent to-transparent" />

          {/* Availability badge */}
          <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-foreground backdrop-blur sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-full w-full rounded-full bg-emerald-500" />
            </span>
            Available
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <span className="w-fit max-w-full truncate rounded-full bg-primary-soft px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary sm:px-2.5 sm:py-1 sm:text-[11px]">
            {d.specialty}
          </span>

          <h3 className="mt-2 font-display text-sm font-semibold leading-tight sm:mt-3 sm:text-xl">
            {d.name}
          </h3>

          {d.bio && (
            <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground sm:mt-2 sm:line-clamp-4 sm:text-sm">
              {d.bio}
            </p>
          )}

          {/* Button pinned to the bottom so cards of different heights line up */}
          <div className="mt-auto pt-3 sm:pt-4">
            <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground transition-transform group-hover:scale-[1.02] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm">
              <span className="truncate">
                <span className="sm:hidden">Consult</span>
                <span className="hidden sm:inline">Talk to Dr. {firstName}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}