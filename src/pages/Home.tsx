import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Pill,
  Stethoscope,
  Syringe,
  Search,
  BadgeCheck,
  Truck,
  Smartphone,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { SplashScreen } from "@capacitor/splash-screen";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PHARMACY_CONFIG } from "@/config";
import heroImg from "@/assets/home-hero.jpeg";

// Regulator registration number shown in the trust strip.
const REGULATOR_NUMBER = "75645454";

// Slides 2 and 3 live in public/services/ (same folder as nursing.jfif).
const NURSING_IMG = "/services/nursing.jfif";
const DOCTORS_IMG = "/services/doctors.jpg";

const SLIDE_INTERVAL_MS = 5000;

const SLIDES = [
  {
    image: heroImg,
    position: "object-[70%_center] md:object-right",
    title: "Pharmaceutical Services, delivered like it matters.",
    text: `${PHARMACY_CONFIG.name} — trusted medicines, real doctor consults, same-day delivery.`,
  },
  {
    image: NURSING_IMG,
    position: "object-center",
    title: "Home nursing, care that comes to you.",
    text: "Qualified nurses for injections, wound care and check-ups at home.",
  },
  {
    image: DOCTORS_IMG,
    position: "object-center",
    title: "Talk to real doctors. No queues.",
    text: "Book a consultation and see a doctor from your phone.",
  },
];

const ACTIONS = [
  {
    to: "/products",
    icon: Pill,
    title: "Visit pharmacy",
    text: "Trusted medicines, same-day delivery",
    primary: true,
  },
  {
    to: "/consult",
    icon: Stethoscope,
    title: "Consult a doctor",
    text: "Real doctors, no queues",
    primary: false,
  },
  {
    to: "/services",
    icon: Syringe,
    title: "Home & clinical services",
    text: "Nurses and care at your door",
    primary: false,
  },
];

const TRUST_ITEMS = [
  { icon: BadgeCheck, title: "Licensed pharmacy", detail: `PPB Reg. No. ${REGULATOR_NUMBER}` },
  { icon: Truck, title: "Same-day delivery", detail: "Order early, get it today" },
  { icon: Smartphone, title: "M-Pesa accepted", detail: "Pay securely on your phone" },
  { icon: UserCheck, title: "Qualified pharmacists", detail: "Every order is checked" },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  // Keep the native splash (logo) on screen until the first hero image has
  // loaded and painted, then fade it out. No-op in the browser.
  useEffect(() => {
    let done = false;

    const hide = () => {
      if (done) return;
      done = true;
      // wait two frames so the page is actually painted before the fade starts
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          SplashScreen.hide({ fadeOutDuration: 400 }).catch(() => {});
        }),
      );
    };

    const img = new Image();
    img.onload = hide;
    img.onerror = hide;
    img.src = heroImg;
    if (img.complete) hide();

    // safety net: never leave the splash stuck
    const timer = setTimeout(hide, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Warm the cache for slides 2 and 3 so the fade never shows a blank frame.
  useEffect(() => {
    [NURSING_IMG, DOCTORS_IMG].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Auto-advance. Depends on `index` so tapping a dot restarts the 5s timer.
  useEffect(() => {
    const timer = setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index]);

  const go = useCallback((dir: 1 | -1) => {
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  };

  const slide = SLIDES[index];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Hero: 3 swapping images, darkened so the text stays readable */}
      <section
        aria-roledescription="carousel"
        aria-label="Our services"
        className="relative isolate h-[52svh] min-h-[360px] overflow-hidden bg-[var(--color-ink)] md:h-[60svh]"
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={slide.image}
            src={slide.image}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
            className={`absolute inset-0 -z-20 h-full w-full object-cover ${slide.position}`}
          />
        </AnimatePresence>

        {/* Darken + blend: ink/primary tint, heavier at the bottom and left where the text sits */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[var(--color-primary-deep)]/70 via-[var(--color-ink)]/35 to-[var(--color-ink)]/90" />
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-[var(--color-ink)]/80 via-[var(--color-ink)]/35 to-transparent md:block" />

        {/* Bottom fade: melts the image into the section colour below */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-b from-transparent via-[#1a4fa8]/70 to-[#1a4fa8] md:h-36" />

        {/* Swipe left/right on phones */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(1);
            else if (info.offset.x > 60) go(-1);
          }}
          className="mx-auto flex h-full w-full max-w-5xl items-end px-4 pb-14 md:items-center md:pb-0"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              aria-live="polite"
            >
              <h1 className="tracking-display max-w-xl font-display text-3xl font-medium leading-[1.1] text-white md:text-5xl">
                {slide.title}
              </h1>
              <p className="mt-3 max-w-lg text-sm text-white/80 md:text-base">{slide.text}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Slide dots */}
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-accent" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Section background: the hero image, tinted deep blue so text stays readable */}
      <div className="relative isolate flex-1 overflow-hidden bg-[#061a45]">
        <img
          src={heroImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_center]"
        />
        {/* Opaque at the top to join the hero's fade, then lets the image show through */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1a4fa8] via-[#0a2a6b]/70 to-[#061a45]/90" />

        <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-7 md:pt-9">
          {/* 1. Search: the main action */}
          <h2 className="tracking-display font-display text-xl font-medium text-white md:text-2xl">
            What do you need today?
          </h2>

          <form onSubmit={onSearch} role="search" className="relative mt-3">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medicines"
              aria-label="Search medicines"
              className="h-14 w-full rounded-full border-2 border-white/60 bg-white pl-12 pr-32 text-base text-foreground shadow-[0_12px_32px_-8px_rgba(5,20,60,0.55)] outline-none transition-all placeholder:text-muted-foreground/70 focus:border-accent focus:ring-4 focus:ring-accent/30"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 inline-flex h-10 -translate-y-1/2 items-center gap-1.5 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.04] active:scale-95"
            >
              Search
            </button>
          </form>

          {/* 2. The three primary actions */}
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {ACTIONS.map(({ to, icon: Icon, title, text, primary }) => (
              <Link
                key={title}
                to={to}
                className={`group flex items-center gap-3 rounded-2xl p-4 shadow-[0_10px_24px_-10px_rgba(5,20,60,0.5)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] sm:flex-col sm:items-start sm:gap-4 ${
                  primary
                    ? "bg-accent text-accent-foreground shadow-[var(--shadow-gold)]"
                    : "bg-white text-foreground"
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    primary ? "bg-white/30" : "bg-primary-soft text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-tight">{title}</span>
                  <span
                    className={`mt-1 block text-xs ${
                      primary ? "text-accent-foreground/75" : "text-muted-foreground"
                    }`}
                  >
                    {text}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 sm:self-end" />
              </Link>
            ))}
          </div>

          {/* 3. Where and when */}
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur">
              <MapPin className="h-3.5 w-3.5" /> {PHARMACY_CONFIG.address}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 backdrop-blur">
              <Clock className="h-3.5 w-3.5" /> {PHARMACY_CONFIG.hours}
            </span>
          </div>

          {/* 4. Trust: one calm card, quieter than the actions above */}
          <section
            aria-label="Why customers trust us"
            className="mt-6 overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.5)]"
          >
            <ul className="grid grid-cols-2 gap-px md:grid-cols-4">
              {TRUST_ITEMS.map(({ icon: Icon, title, detail }) => (
                <li key={title} className="flex items-start gap-3 bg-[#0b3585]/90 p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold leading-tight text-white">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-xs text-white/65">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}