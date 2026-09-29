import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, RotateCcw, FileText, ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { fetchProducts } from "@/lib/api";
import { CATEGORIES } from "@/config";
import { getCategoryIcon } from "@/lib/categoryIcons";
import type { Product } from "@/types";

const DEFAULT_MAX_PRICE = 5000;
const MAX_SUGGESTIONS = 6;

// Where a suggestion should take the user. Change this if your product
// detail route is different (e.g. `/product/${id}`).
const productHref = (p: Product) => `/products/${p.id}`;

export default function Products() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [cat, setCat] = useState<string | null>(() => searchParams.get("category"));
  const [search, setSearch] = useState<string>(() => searchParams.get("search") ?? "");
  const [sort, setSort] = useState<"popular" | "price_asc" | "price_desc">("popular");
  const [maxPrice, setMaxPrice] = useState<number>(DEFAULT_MAX_PRICE);
  const [rxOnly, setRxOnly] = useState(false);

  // Search dropdown state
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  // Picks up ?search=... when arriving from a shared link.
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) setSearch(q);
  }, [searchParams]);

  // Close the dropdown when clicking anywhere outside the search box.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ---- Search suggestions (name matches, starts-with ranked first) ----
  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    const matches = products.filter((p) => p.name.toLowerCase().includes(q));
    matches.sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts || a.name.localeCompare(b.name);
    });
    return matches.slice(0, MAX_SUGGESTIONS);
  }, [products, search]);

  const showDropdown = suggestOpen && search.trim().length > 0;

  const openProduct = (p: Product) => {
    setSuggestOpen(false);
    navigate(productHref(p));
  };

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestOpen(true);
      setActiveIdx((i) => (suggestions.length ? (i + 1) % suggestions.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) =>
        suggestions.length ? (i <= 0 ? suggestions.length - 1 : i - 1) : -1,
      );
    } else if (e.key === "Enter") {
      const pick = suggestions[activeIdx] ?? suggestions[0];
      if (pick) {
        e.preventDefault();
        openProduct(pick);
      }
    } else if (e.key === "Escape") {
      setSuggestOpen(false);
    }
  };

  // ---- Products inside the opened category ----
  const categoryProducts = useMemo(() => {
    if (!cat) return [];
    let list = products
      .filter((p) => p.category === cat)
      .filter((p) => p.price <= maxPrice)
      .filter((p) => (rxOnly ? p.requires_prescription : true));

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, cat, sort, maxPrice, rxOnly]);

  const resetFilters = () => {
    setSort("popular");
    setMaxPrice(DEFAULT_MAX_PRICE);
    setRxOnly(false);
  };

  const toggleCategory = (category: string) => {
    const opening = cat !== category;
    setCat(opening ? category : null);
    resetFilters();
    if (opening) {
      // Wait for the panel to mount, then bring it into view.
      setTimeout(
        () => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        60,
      );
    }
  };

  const ActiveIcon = cat ? getCategoryIcon(cat) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero banner with integrated search */}
      <section className="relative bg-[var(--color-ink)]">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="rx-texture absolute inset-0 opacity-50"
            style={{ backgroundColor: "var(--color-primary-deep)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-deep)] to-[var(--color-ink)] opacity-95" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_88%_0%,oklch(0.80_0.125_82/0.16),transparent)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-6 md:pt-16 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              <span className="h-px w-8 bg-accent/70" /> The pharmacy
            </div>
            <h1 className="tracking-display mt-4 font-display text-3xl font-medium leading-[1.08] text-white md:text-5xl">
              Shop by category
            </h1>
            <p className="mt-3 text-sm text-white/60 md:text-base">
              Pick a category to see its medicines, or search for one by name.
            </p>

            {/* Search + prescription upload */}
            <div className="mt-7 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-start">
              <div ref={searchBoxRef} className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-6 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  role="combobox"
                  aria-expanded={showDropdown}
                  aria-controls="product-suggestions"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    activeIdx >= 0 ? `suggestion-${activeIdx}` : undefined
                  }
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSuggestOpen(true);
                    setActiveIdx(-1);
                  }}
                  onFocus={() => setSuggestOpen(true)}
                  onKeyDown={onSearchKeyDown}
                  placeholder="Search for a medicine…"
                  className="h-12 w-full rounded-full border border-white/15 bg-white/10 pl-11 pr-11 text-sm text-white outline-none backdrop-blur-md transition-all placeholder:text-white/50 focus:border-accent focus:ring-4 focus:ring-accent/15"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveIdx(-1);
                    }}
                    className="absolute right-4 top-6 -translate-y-1/2 text-white/50 transition-colors hover:text-white"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                {/* Live suggestions */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.ul
                      id="product-suggestions"
                      role="listbox"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 top-14 z-30 max-h-96 overflow-y-auto rounded-2xl border border-[var(--color-hairline)] bg-card p-2 shadow-[var(--shadow-card)]"
                    >
                      {suggestions.length === 0 ? (
                        <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                          No medicines match “{search.trim()}”
                        </li>
                      ) : (
                        suggestions.map((p, i) => {
                          const Icon = getCategoryIcon(p.category);
                          const active = i === activeIdx;
                          return (
                            <li
                              key={p.id}
                              id={`suggestion-${i}`}
                              role="option"
                              aria-selected={active}
                            >
                              <button
                                type="button"
                                onMouseEnter={() => setActiveIdx(i)}
                                onClick={() => openProduct(p)}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                                  active ? "bg-primary-soft" : "hover:bg-primary-soft"
                                }`}
                              >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                                  <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-sm font-medium text-foreground">
                                    {p.name}
                                  </span>
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {p.category}
                                    {p.requires_prescription ? " · Prescription required" : ""}
                                  </span>
                                </span>
                                <span className="shrink-0 text-sm font-semibold text-primary">
                                  KES {p.price.toLocaleString()}
                                </span>
                              </button>
                            </li>
                          );
                        })
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/prescription"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition-transform hover:scale-[1.02]"
              >
                <FileText className="h-4 w-4" /> Upload prescription
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Category cards — tap one to open its medicines below */}
        <div className="relative mx-auto max-w-6xl px-4 pb-10 md:pb-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((category) => {
              const Icon = getCategoryIcon(category);
              const active = cat === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  aria-pressed={active}
                  aria-expanded={active}
                  className={`group flex items-center gap-3 rounded-2xl border p-3 text-left backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.12] hover:shadow-[var(--shadow-gold)] sm:flex-col sm:items-start sm:gap-4 sm:p-4 ${
                    active
                      ? "border-accent/60 bg-white/[0.14] shadow-[var(--shadow-gold)]"
                      : "border-white/10 bg-white/[0.06]"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors group-hover:bg-accent group-hover:text-accent-foreground ${
                      active ? "bg-accent text-accent-foreground" : "bg-accent/15 text-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex w-full items-center justify-between gap-2">
                    <span className="text-sm font-medium leading-tight text-white">
                      {category}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${
                        active ? "rotate-180 text-accent" : ""
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Opened category: filters + its medicines. Nothing shows until a card is opened. */}
      <AnimatePresence initial={false}>
        {cat && ActiveIcon && (
          <motion.section
            key={cat}
            ref={panelRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="scroll-mt-20 overflow-hidden bg-surface"
          >
            <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <ActiveIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="tracking-display font-display text-2xl font-medium text-foreground">
                      {cat}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {categoryProducts.length}{" "}
                      {categoryProducts.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCat(null)}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/30"
                >
                  <X className="h-4 w-4" /> Close
                </button>
              </div>

              {/* Filter bar */}
              <div className="flex flex-col gap-5 rounded-2xl border border-[var(--color-hairline)] bg-card p-4 shadow-[var(--shadow-card)] md:flex-row md:items-center md:justify-between md:gap-8 md:px-6">
                <label className="flex items-center gap-3 text-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Sort
                  </span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as typeof sort)}
                    className="h-10 rounded-full border border-[var(--color-hairline)] bg-card px-4 text-sm outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                  >
                    <option value="popular">Popular</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                  </select>
                </label>

                <label className="flex items-center gap-4 text-sm md:w-72">
                  <span className="whitespace-nowrap font-medium text-foreground">
                    Max <span className="text-primary">KES {maxPrice.toLocaleString()}</span>
                  </span>
                  <input
                    type="range"
                    min={100}
                    max={5000}
                    step={50}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[var(--color-primary)]"
                  />
                </label>

                <label
                  className={`inline-flex cursor-pointer items-center gap-2.5 self-start rounded-full border px-4 py-2.5 text-sm font-medium transition-colors md:self-auto ${
                    rxOnly
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-[var(--color-hairline)] text-foreground hover:border-primary/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={rxOnly}
                    onChange={(e) => setRxOnly(e.target.checked)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  Prescription required only
                </label>
              </div>

              {categoryProducts.length > 0 ? (
                <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                  {categoryProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="mt-7 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[var(--color-hairline)] bg-card px-6 py-14 text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-primary">
                    <Search className="h-6 w-6" />
                  </div>
                  <div className="tracking-display font-display text-xl font-medium">
                    No products match these filters
                  </div>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Raise the price limit or clear the filters to see everything in {cat}.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset filters
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}