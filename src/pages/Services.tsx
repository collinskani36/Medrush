import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  Syringe, Stethoscope, HeartHandshake, Users, MessageCircle,
  Loader2, CheckCircle2, ArrowRight, ShieldCheck, Lock, Home as HomeIcon,
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
  mode: "whatsapp" | "form";
  waMessage?: string;
};

const SERVICES: ServiceDef[] = [
  {
    type: "nursing",
    title: "In-home nursing",
    description: "Wound care, injections, IV drips, post-surgery and elderly care from a nurse in our network.",
    icon: Syringe,
    mode: "whatsapp",
    waMessage: "Hi, I'd like to request in-home nursing services.",
  },
  {
    type: "medical_call",
    title: "In-house medical calls",
    description: "A doctor or clinician visits you at home for a consultation when a clinic visit isn't practical.",
    icon: Stethoscope,
    mode: "whatsapp",
    waMessage: "Hi, I'd like to request an in-house medical call (doctor home visit).",
  },
  {
    type: "family_planning",
    title: "Family planning",
    description: "Confidential counselling and contraceptive services from qualified practitioners.",
    icon: HeartHandshake,
    mode: "form",
  },
  {
    type: "other",
    title: "Other practitioner services",
    description: "Physiotherapy, maternal care, or another specialist service — tell us what you need.",
    icon: Users,
    mode: "form",
  },
];

const TRUST = [
  { icon: ShieldCheck, label: "Qualified practitioners" },
  { icon: Lock, label: "Confidential & discreet" },
  { icon: HomeIcon, label: "Care at your doorstep" },
];

const STEPS = [
  { title: "Choose a service", body: "Pick the care you need from the options above." },
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
  const [active, setActive] = useState<ServiceType | null>(null);
  const activeService = SERVICES.find((s) => s.type === active) ?? null;
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeService) {
      const t = setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(t);
    }
  }, [activeService]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero banner */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div className="rx-texture absolute inset-0 opacity-50" style={{ backgroundColor: "var(--color-primary-deep)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_88%_0%,oklch(0.80_0.125_82/0.16),transparent)]" />

        <div className="relative mx-auto max-w-5xl px-4 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              <span className="h-px w-8 bg-accent/70" /> Home &amp; clinical care
            </div>
            <h1 className="tracking-display mt-4 max-w-2xl font-display text-3xl font-medium leading-[1.08] text-white md:text-5xl">
              Professional care, brought to your door.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65 md:text-base">
              Nursing, home doctor visits, and specialist services — connected through our trusted network of
              practitioners.
            </p>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {TRUST.map(({ icon: Icon, label }) => (
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

      {/* Services */}
      <section className="bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Our services</div>
              <h2 className="tracking-display mt-2 font-display text-2xl font-medium md:text-3xl">
                How can we help you today?
              </h2>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              const isActive = active === service.type;

              const cardClasses = `group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card p-6 text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] md:p-7 ${
                isActive
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-[var(--color-hairline)] hover:border-primary/30"
              }`;

              const inner = (
                <>
                  {/* Soft gold glow on hover */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative flex items-start justify-between">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-primary-deep)] text-accent shadow-[var(--shadow-lift)]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-display text-3xl font-medium text-foreground/10 transition-colors group-hover:text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="relative mt-6">
                    <div className="tracking-display font-display text-xl font-medium leading-tight text-foreground">
                      {service.title}
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between border-t border-[var(--color-hairline)] pt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      {service.mode === "whatsapp" ? (
                        <>
                          <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                        </>
                      ) : (
                        <>Request this service</>
                      )}
                    </span>
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-hairline)] text-primary transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </>
              );

              return (
                <motion.div
                  key={service.type}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: (index % 2) * 0.08 }}
                >
                  {service.mode === "whatsapp" ? (
                    <a
                      href={waLink(service.waMessage!)}
                      target="_blank"
                      rel="noreferrer"
                      className={cardClasses}
                    >
                      {inner}
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActive(service.type)}
                      className={`${cardClasses} w-full`}
                    >
                      {inner}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {activeService && (
            <motion.div
              ref={formRef}
              key={activeService.type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-10 scroll-mt-24"
            >
              <ServiceForm service={activeService} onDone={() => setActive(null)} />
            </motion.div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden bg-[var(--color-ink)]">
        <div className="rx-texture absolute inset-0 opacity-40" style={{ backgroundColor: "var(--color-primary-deep)" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-ink)] to-[var(--color-primary-deep)] opacity-95" />

        <div className="relative mx-auto max-w-5xl px-4 py-12 md:py-16">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">How it works</div>
          <h2 className="tracking-display mt-2 font-display text-2xl font-medium text-white md:text-3xl">
            Simple from start to finish
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-accent font-display text-base font-semibold text-accent-foreground shadow-[var(--shadow-gold)]">
                  {i + 1}
                </div>
                <div className="mt-4 font-display text-lg font-medium text-white">{step.title}</div>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}