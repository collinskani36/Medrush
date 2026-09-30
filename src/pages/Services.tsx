import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Syringe, Stethoscope, HeartHandshake, Users, MessageCircle,
  Loader2, CheckCircle2, ArrowRight, ShieldCheck, Lock, Home as HomeIcon, Plus, X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { PHARMACY_CONFIG } from "@/config";

type ServiceType = "nursing" | "medical_call" | "family_planning" | "other";

type ServiceDef = {
  type: ServiceType;
  title: string;
  description: string;
  icon: LucideIcon;
  image: string;
  mode: "whatsapp" | "form";
  waMessage?: string;
};

const SERVICES: ServiceDef[] = [
  {
    type: "nursing",
    title: "In-home nursing",
    description: "Wound care, injections, IV drips, post-surgery and elderly care from a nurse in our network.",
    icon: Syringe,
    image: "/services/nursing.jfif",
    mode: "whatsapp",
    waMessage: "Hi, I'd like to request in-home nursing services.",
  },
  {
    type: "medical_call",
    title: "In-house medical calls",
    description: "A doctor or clinician visits you at home for a consultation when a clinic visit isn't practical.",
    icon: Stethoscope,
    image: "/services/medical-call.jpg",
    mode: "whatsapp",
    waMessage: "Hi, I'd like to request an in-house medical call (doctor home visit).",
  },
  {
    type: "family_planning",
    title: "Family planning",
    description: "Confidential counselling and contraceptive services from qualified practitioners.",
    icon: HeartHandshake,
    image: "/services/family-planning.webp",
    mode: "form",
  },
  {
    type: "other",
    title: "Other practitioner services",
    description: "Physiotherapy, maternal care, or another specialist service — tell us what you need.",
    icon: Users,
    image: "/services/other.jpeg",
    mode: "form",
  },
];

const TRUST = [
  { icon: ShieldCheck, label: "Qualified practitioners", short: "Qualified" },
  { icon: Lock, label: "Confidential & discreet", short: "Confidential" },
  { icon: HomeIcon, label: "Care at your doorstep", short: "At your door" },
];

const STEPS = [
  { title: "Choose a service", body: "Pick the care you need from our range of home and clinical services." },
  { title: "Tell us what you need", body: "Message us on WhatsApp or send a short request form." },
  { title: "We connect you", body: "Our team matches you with a suitable practitioner from our network." },
];

const FIELD =
  "h-12 w-full rounded-xl border border-[var(--color-hairline)] bg-card px-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10";

function waLink(message: string) {
  return `https://wa.me/${PHARMACY_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`;
}

function ServiceForm({ service, onDone }: { service: ServiceDef; onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !description.trim()) {
      setError("Please fill in your name, phone number, and a short description.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const { error: dbErr } = await supabase!.from("service_requests").insert({
      service_type: service.type,
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      description: description.trim(),
    });

    setSubmitting(false);
    if (dbErr) {
      setError("Something went wrong submitting your request. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-card p-10 text-center shadow-[var(--shadow-ambient)]">
        <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-primary-deep)] text-accent shadow-[var(--shadow-gold)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="tracking-display font-display text-2xl font-medium">Request received</div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Thanks, {name.split(" ")[0]} — we've got your {service.title.toLowerCase()} request and will reach out
            on {phone} shortly.
          </p>
          <button
            type="button"
            onClick={onDone}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-hairline)] px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary-soft"
          >
            Back to services <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-3xl border border-[var(--color-hairline)] bg-card shadow-[var(--shadow-ambient)]"
    >
      {/* Dark header strip — echoes the hero */}
      <div className="relative overflow-hidden bg-[var(--color-ink)] px-6 py-6 md:px-8">
        <div className="rx-texture absolute inset-0 opacity-40" style={{ backgroundColor: "var(--color-primary-deep)" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-accent backdrop-blur-md">
            <service.icon className="h-5 w-5" />
          </div>
          <div>
            <div className="tracking-display font-display text-xl font-medium text-white">{service.title}</div>
            <div className="mt-0.5 text-xs text-white/60">
              We'll get back to you shortly on WhatsApp or a call
            </div>
          </div>
          <button
            type="button"
            onClick={onDone}
            aria-label="Close"
            className="relative z-10 ml-auto grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-foreground">Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD} placeholder="Jane Doe" />
          </label>
          <label className="block text-sm">
            <span className="mb-2 block font-medium text-foreground">Phone number</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={FIELD} placeholder="07xx xxx xxx" />
          </label>
        </div>

        <label className="mt-5 block text-sm">
          <span className="mb-2 block font-medium text-foreground">What do you need?</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-[var(--color-hairline)] bg-card px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="A short description of what you're looking for…"
          />
        </label>

        {error && (
          <p className="mt-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit request
          </button>
          <button
            type="button"
            onClick={onDone}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <span className="ml-auto hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
            <Lock className="h-3.5 w-3.5" /> Your details stay private
          </span>
        </div>
      </div>
    </form>
  );
}

export default function Services() {
  const [focus, setFocus] = useState<ServiceType>(SERVICES[0].type);
  const [formFor, setFormFor] = useState<ServiceType | null>(null);
  const formService = SERVICES.find((s) => s.type === formFor) ?? null;

  // Close the request form with Escape and lock page scroll while it's open
  useEffect(() => {
    if (!formFor) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFormFor(null);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [formFor]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ───────── Hero ───────── */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div className="rx-texture absolute inset-0 opacity-40" style={{ backgroundColor: "var(--color-primary-deep)" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-deep)] via-[var(--color-ink)] to-[var(--color-ink)] opacity-95" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              <span className="h-px w-10 bg-accent/70" /> Home &amp; clinical care
            </div>
            <h1 className="tracking-display mt-4 max-w-3xl font-display text-4xl font-medium leading-[1.05] text-white md:text-6xl">
              Healthcare that <span className="text-accent">comes to you.</span>
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">
              Nursing, home doctor visits, and specialist services — connected through our trusted network of
              practitioners.
            </p>

            <ul className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4">
              {TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2 text-xs text-white/60">
                  <Icon className="h-3.5 w-3.5 text-accent" />
                  {label}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* ───────── Services: sticky image panel + service index ───────── */}
      <section id="services" className="scroll-mt-20 bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="mb-6 flex flex-col justify-between gap-3 md:mb-8 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                <span className="h-px w-10 bg-primary/60" /> Our services
              </div>
              <h2 className="tracking-display mt-2 font-display text-3xl font-medium md:text-4xl">
                How can we help you today?
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              Select a service to see what's included and how to get started.
            </p>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-12">
            {/* Image panel — desktop only, stays in view while you browse */}
            <div className="hidden lg:col-span-6 lg:block">
              <div className="sticky top-24">
                <div className="relative aspect-[6/5] overflow-hidden rounded-[2rem] bg-[var(--color-primary-deep)] shadow-[var(--shadow-card)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-deep)] to-[var(--color-ink)]" />
                  {SERVICES.map((s) => (
                    <img
                      key={s.type}
                      src={s.image}
                      alt={s.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                        focus === s.type ? "scale-100 opacity-100" : "scale-105 opacity-0"
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)]/70 via-transparent to-transparent" />

                  {/* caption chip */}
                  <div className="absolute inset-x-5 bottom-5 flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-xl">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-accent">
                        {String(SERVICES.findIndex((s) => s.type === focus) + 1).padStart(2, "0")} /{" "}
                        {String(SERVICES.length).padStart(2, "0")}
                      </div>
                      <div className="mt-1 font-display text-lg font-medium text-white">
                        {SERVICES.find((s) => s.type === focus)?.title}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {SERVICES.map((s) => (
                        <span
                          key={s.type}
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            focus === s.type ? "w-6 bg-accent" : "w-1.5 bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -left-4 -top-4 -z-10 h-full w-full rounded-[2rem] border border-accent/30" />
              </div>
            </div>

            {/* Service index */}
            <div className="lg:col-span-6">
              <ul className="border-t border-[var(--color-hairline)]">
                {SERVICES.map((service, index) => {
                  const Icon = service.icon;
                  const open = focus === service.type;
                  return (
                    <li key={service.type} className="border-b border-[var(--color-hairline)]">
                      <button
                        type="button"
                        onClick={() => setFocus(service.type)}
                        aria-expanded={open}
                        className="group flex w-full items-center gap-5 py-4 text-left md:py-5"
                      >
                        <span
                          className={`font-display text-sm font-medium tabular-nums transition-colors ${
                            open ? "text-accent" : "text-muted-foreground/60"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`tracking-display flex-1 font-display text-xl font-medium transition-colors md:text-2xl ${
                            open ? "text-foreground" : "text-foreground/55 group-hover:text-foreground"
                          }`}
                        >
                          {service.title}
                        </span>
                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-300 ${
                            open
                              ? "rotate-45 border-accent bg-accent text-accent-foreground"
                              : "border-[var(--color-hairline)] text-muted-foreground group-hover:border-primary/40"
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pb-5 pl-0 md:pl-11">
                              {/* image shown inline on mobile / tablet */}
                              <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl bg-[var(--color-primary-deep)] shadow-[var(--shadow-card)] lg:hidden">
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-primary-deep)] to-[var(--color-ink)]">
                                  <Icon className="h-12 w-12 text-accent/30" strokeWidth={1} />
                                </div>
                                <img
                                  src={service.image}
                                  alt={service.title}
                                  loading="lazy"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                  }}
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                              </div>

                              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                                {service.description}
                              </p>

                              <div className="mt-4">
                                {service.mode === "whatsapp" ? (
                                  <a
                                    href={waLink(service.waMessage!)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group/cta inline-flex items-center gap-2.5 rounded-full bg-[var(--color-primary-deep)] px-7 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-all duration-300 hover:bg-[var(--color-ink)] hover:shadow-[var(--shadow-gold)]"
                                  >
                                    <MessageCircle className="h-4 w-4 text-accent" />
                                    Chat on WhatsApp
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setFormFor(service.type)}
                                    className="group/cta inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.03]"
                                  >
                                    Request this service
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── How it works: horizontal timeline ───────── */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              <span className="h-px w-10 bg-primary/60" /> How it works
              <span className="h-px w-10 bg-primary/60" />
            </div>
            <h2 className="tracking-display mt-2 font-display text-3xl font-medium md:text-4xl">
              Simple from start to finish
            </h2>
          </div>

          <div className="relative mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
            <div className="absolute left-[16.6%] right-[16.6%] top-6 hidden h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent md:block" />
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="relative mx-auto grid h-12 w-12 place-items-center rounded-full bg-[var(--color-primary-deep)] font-display text-base font-semibold text-accent shadow-[var(--shadow-gold)] ring-4 ring-background">
                  {i + 1}
                </div>
                <div className="mt-3 font-display text-lg font-medium">{step.title}</div>
                <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Closing CTA band ───────── */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div className="rx-texture absolute inset-0 opacity-40" style={{ backgroundColor: "var(--color-primary-deep)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-8 md:flex-row md:items-center md:py-10">
          <div>
            <h2 className="tracking-display font-display text-xl font-medium text-white md:text-3xl">
              Not sure which service you need?
            </h2>
            <p className="mt-2 text-sm text-white/60 md:text-base">Message us and our team will point you in the right direction.</p>
          </div>
          <a
            href={waLink("Hi, I'd like to find out more about your services.")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.03]"
          >
            <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
          </a>
        </div>
      </section>

      <Footer />

      {/* ───────── Request form modal ───────── */}
      {formService &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-end justify-center bg-[var(--color-ink)]/70 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={() => setFormFor(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl sm:rounded-3xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={formService.title}
            >
              <ServiceForm service={formService} onDone={() => setFormFor(null)} />
            </motion.div>
          </div>,
          document.body,
        )}
    </div>
  );
}