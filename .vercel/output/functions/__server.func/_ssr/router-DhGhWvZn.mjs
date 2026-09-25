import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { d as distExports } from "../_libs/react-router-dom.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import { M as MapPin, C as Clock, S as ShoppingBag, F as FileText, a as Search, A as ArrowLeft, b as ShieldAlert, c as Minus, P as Plus, T as Trash2, d as FileUp, e as Smartphone, B as Banknote, L as LoaderCircle, f as CircleCheck, g as MessageCircle, h as Bike, i as Phone, j as PartyPopper, k as Star, l as ShoppingCart, X, m as Menu, n as ChefHat, H as House, o as Lock, p as LogOut, q as TrendingUp, r as ClipboardList, s as Package, t as Pill$1, u as ArrowRight, v as CircleUserRound } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/react-router.mjs";
import "../_libs/cookie.mjs";
import "../_libs/set-cookie-parser.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const appCss = "/assets/styles-D23IVvj4.css";
const CartContext = reactExports.createContext(null);
const STORAGE_KEY$1 = "medrush_cart_v1";
function CartProvider({ children }) {
  const [items, setItems] = reactExports.useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY$1);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  reactExports.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY$1, JSON.stringify(items));
    } catch {
    }
  }, [items]);
  const value = reactExports.useMemo(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const requiresPrescription = items.some((i) => i.product.requires_prescription);
    return {
      items,
      count,
      subtotal,
      requiresPrescription,
      add: (product, qty = 1) => {
        setItems((curr) => {
          const ex = curr.find((i) => i.product.id === product.id);
          if (ex) {
            return curr.map(
              (i) => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
            );
          }
          return [...curr, { product, quantity: qty }];
        });
      },
      remove: (id) => setItems((curr) => curr.filter((i) => i.product.id !== id)),
      setQty: (id, qty) => setItems(
        (curr) => qty <= 0 ? curr.filter((i) => i.product.id !== id) : curr.map((i) => i.product.id === id ? { ...i, quantity: qty } : i)
      ),
      clear: () => setItems([])
    };
  }, [items]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CartContext.Provider, { value, children });
}
function useCart() {
  const ctx = reactExports.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
const PHARMACY_CONFIG = {
  name: "LifeCare Pharmacy",
  tagline: "Medicine delivered to your door in 30 minutes",
  address: "Rongai, Kenya",
  phone: "0712345678",
  whatsapp: "254712345678",
  hours: "Open 8:00 AM – 9:00 PM · Mon–Sat",
  deliveryFee: 150,
  primaryColor: "#1A7A4A",
  accentColor: "#F5A623"
};
const CATEGORIES = [
  "Pain Relief",
  "Cold & Flu",
  "Vitamins",
  "First Aid",
  "Baby Care",
  "Supplements",
  "Personal Care",
  "Prescription"
];
function Header() {
  const { count } = useCart();
  const { pathname } = distExports.useLocation();
  const navigate = distExports.useNavigate();
  const [open, setOpen] = reactExports.useState(false);
  const tapCount = reactExports.useRef(0);
  const tapTimer = reactExports.useRef(null);
  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Shop" },
    { to: "/prescription", label: "Prescription" }
  ];
  const handleLogoTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current === 2) {
      tapCount.current = 0;
      navigate("/admin");
      return;
    }
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 400);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          onClick: handleLogoTap,
          className: "flex items-center gap-2 cursor-pointer select-none",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-bold", children: "M" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-none", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg font-semibold", children: "MedRush" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: PHARMACY_CONFIG.name })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden items-center gap-7 md:flex", children: links.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        distExports.Link,
        {
          to: l.to,
          className: `text-sm font-medium transition-colors ${pathname === l.to ? "text-primary" : "text-foreground/70 hover:text-foreground"}`,
          children: l.label
        },
        l.to
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          distExports.Link,
          {
            to: "/cart",
            className: "relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary hover:bg-primary-soft transition-colors",
            "aria-label": "Cart",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-5 w-5" }),
              count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.span,
                {
                  initial: { scale: 0 },
                  animate: { scale: 1 },
                  className: "absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground",
                  children: count
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setOpen((o) => !o),
            className: "inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary md:hidden",
            "aria-label": "Menu",
            children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" })
          }
        )
      ] })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border bg-background md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex max-w-6xl flex-col px-4 py-2", children: links.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      distExports.Link,
      {
        to: l.to,
        onClick: () => setOpen(false),
        className: "py-3 text-sm font-medium",
        children: l.label
      },
      l.to
    )) }) })
  ] });
}
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "mt-16 border-t border-border bg-surface", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl font-semibold", children: "MedRush" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: PHARMACY_CONFIG.tagline })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
          " ",
          PHARMACY_CONFIG.address
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4 w-4" }),
          " ",
          PHARMACY_CONFIG.phone
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
          " ",
          PHARMACY_CONFIG.hours
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-foreground", children: "Need help?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: `https://wa.me/${PHARMACY_CONFIG.whatsapp}`,
            className: "mt-1 inline-block text-primary hover:underline",
            target: "_blank",
            rel: "noreferrer",
            children: "Chat with us on WhatsApp"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border-t border-border pt-4 text-xs text-muted-foreground", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " ",
      PHARMACY_CONFIG.name,
      ". All rights reserved."
    ] })
  ] }) });
}
function CategoryPills({ active, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "-mx-4 overflow-x-auto px-4 no-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pb-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: "All", active: active === null, onClick: () => onChange(null) }),
    CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: c, active: active === c, onClick: () => onChange(c) }, c))
  ] }) });
}
function Pill({ label, active, onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick,
      className: `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground/80 hover:border-primary hover:text-primary"}`,
      children: label
    }
  );
}
const formatKES = (n) => `KES ${Math.round(n).toLocaleString("en-KE")}`;
const formatPhoneForWa = (phone) => phone.replace(/\D/g, "").replace(/^0/, "254");
function ProductCard({ product }) {
  const { add } = useCart();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      whileHover: { y: -4 },
      transition: { type: "spring", stiffness: 300, damping: 22 },
      className: "group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(distExports.Link, { to: `/products/${product.id}`, className: "relative block aspect-square overflow-hidden bg-surface", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: product.image_url,
              alt: product.name,
              loading: "lazy",
              className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            }
          ),
          !product.in_stock && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-3 rounded-full bg-foreground/80 px-2.5 py-1 text-[11px] font-semibold text-background", children: "Out of Stock" }),
          product.requires_prescription && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3 w-3" }),
            " Rx"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col gap-2 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wide text-muted-foreground", children: product.category }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Link, { to: `/products/${product.id}`, className: "line-clamp-2 text-sm font-semibold leading-snug hover:text-primary", children: product.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-center justify-between pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-semibold", children: formatKES(product.price) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                disabled: !product.in_stock,
                onClick: () => add(product),
                className: "inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
                "aria-label": "Add to cart",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
              }
            )
          ] })
        ] })
      ]
    }
  );
}
const url = "https://xiodcdsgwcupuvlnitqr.supabase.co";
const anon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpb2RjZHNnd2N1cHV2bG5pdHFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNjcwMzgsImV4cCI6MjA5Njk0MzAzOH0.SA4sly6hXgLgP-HgajSa5OGmDH1X3Aq0LrmPZIp1BpY";
const supabaseEnabled = Boolean(anon);
const supabase = supabaseEnabled ? createClient(url, anon) : null;
const MOCK_PRODUCTS = [
  { id: "1", name: "Panadol Extra", description: "Fast pain relief — paracetamol + caffeine. 24 tablets.", price: 250, category: "Pain Relief", image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "2", name: "Brufen 400mg", description: "Ibuprofen for inflammation and pain. 20 tablets.", price: 320, category: "Pain Relief", image_url: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "3", name: "Strepsils Honey & Lemon", description: "Soothing lozenges for sore throat. Pack of 16.", price: 180, category: "Cold & Flu", image_url: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "4", name: "Coldcap Flu Caps", description: "Multi-symptom cold & flu relief. 12 capsules.", price: 290, category: "Cold & Flu", image_url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80", requires_prescription: false, in_stock: false },
  { id: "5", name: "Vitamin C 1000mg", description: "Immune support, effervescent tablets. 20 pcs.", price: 450, category: "Vitamins", image_url: "https://images.unsplash.com/photo-1626516586908-c9a6dca72b95?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "6", name: "Centrum Multivitamin", description: "Complete daily multivitamin. 60 tablets.", price: 1200, category: "Vitamins", image_url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "7", name: "Elastoplast Bandages", description: "Assorted waterproof plasters. Box of 40.", price: 220, category: "First Aid", image_url: "https://images.unsplash.com/photo-1603807008857-ad66b70431e2?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "8", name: "Dettol Antiseptic 250ml", description: "Trusted antiseptic liquid for wounds & cleaning.", price: 380, category: "First Aid", image_url: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "9", name: "Pampers Baby Diapers M", description: "Pack of 30, ultra-soft & absorbent.", price: 950, category: "Baby Care", image_url: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "10", name: "Johnson's Baby Lotion", description: "Gentle daily moisturizer, 200ml.", price: 520, category: "Baby Care", image_url: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "11", name: "Omega-3 Fish Oil", description: "Heart & brain support, 60 softgels.", price: 1450, category: "Supplements", image_url: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "12", name: "Whey Protein 1kg", description: "Vanilla flavor, 25g protein per serving.", price: 2800, category: "Supplements", image_url: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "13", name: "Colgate Total Toothpaste", description: "Complete oral care, 150g.", price: 280, category: "Personal Care", image_url: "https://images.unsplash.com/photo-1559591935-c6c92c6e44a3?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "14", name: "Nivea Body Lotion 400ml", description: "24h moisture for normal skin.", price: 690, category: "Personal Care", image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80", requires_prescription: false, in_stock: true },
  { id: "15", name: "Amoxicillin 500mg", description: "Antibiotic — prescription only. 21 capsules.", price: 540, category: "Prescription", image_url: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&q=80", requires_prescription: true, in_stock: true },
  { id: "16", name: "Metformin 850mg", description: "Type 2 diabetes management. 60 tablets.", price: 780, category: "Prescription", image_url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&q=80", requires_prescription: true, in_stock: true }
];
const mockOrders = [];
const mockPrescriptions = [];
const mockRiders = [];
const orderListeners = /* @__PURE__ */ new Set();
function emitOrders() {
  orderListeners.forEach((l) => l([...mockOrders]));
}
async function fetchProducts() {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return MOCK_PRODUCTS;
}
async function fetchProduct(id) {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ?? null;
  }
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
}
async function createOrder(input2) {
  const status = input2.status ?? "received";
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("orders").insert({ ...input2, status }).select().single();
    if (error) throw error;
    return data;
  }
  const order = { ...input2, status, id: `ord_${Date.now().toString(36)}`, created_at: (/* @__PURE__ */ new Date()).toISOString() };
  mockOrders.unshift(order);
  emitOrders();
  return order;
}
async function fetchOrders() {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("orders").select("*, rider:riders(*)").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return [...mockOrders];
}
async function updateOrderStatus(id, status) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
    return;
  }
  const o = mockOrders.find((x) => x.id === id);
  if (o) {
    o.status = status;
    emitOrders();
  }
}
async function assignRider(orderId, riderId) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("orders").update({ rider_id: riderId }).eq("id", orderId);
    if (error) throw error;
    return;
  }
  const o = mockOrders.find((x) => x.id === orderId);
  if (o) {
    o.rider_id = riderId;
    o.rider = riderId ? mockRiders.find((r) => r.id === riderId) ?? null : null;
    emitOrders();
  }
}
async function confirmDelivery(orderId) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("orders").update({ status: "delivered" }).eq("id", orderId);
    if (error) throw error;
    return;
  }
  const o = mockOrders.find((x) => x.id === orderId);
  if (o) {
    o.status = "delivered";
    emitOrders();
  }
}
async function submitRating(orderId, rating) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("orders").update({ rating }).eq("id", orderId);
    if (error) throw error;
    return;
  }
  const o = mockOrders.find((x) => x.id === orderId);
  if (o) {
    o.rating = rating;
    emitOrders();
  }
}
function subscribeOrders(cb) {
  if (supabaseEnabled && supabase) {
    const channel = supabase.channel("orders-changes").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, async () => {
      const orders = await fetchOrders();
      cb(orders);
    }).subscribe();
    const client = supabase;
    fetchOrders().then(cb).catch(() => {
    });
    return () => {
      client.removeChannel(channel);
    };
  }
  orderListeners.add(cb);
  cb([...mockOrders]);
  return () => {
    orderListeners.delete(cb);
  };
}
function subscribeOrder(id, cb) {
  return subscribeOrders((orders) => {
    cb(orders.find((o) => o.id === id) ?? null);
  });
}
async function uploadPrescriptionFile(file) {
  if (!supabase) throw new Error("Supabase not configured");
  const ext = file.name.split(".").pop();
  const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("prescriptions").upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("prescriptions").getPublicUrl(path);
  return data.publicUrl;
}
async function createPrescription(input2) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("prescriptions").insert({ ...input2, status: "pending" });
    if (error) throw error;
    return { ...input2, status: "pending", id: crypto.randomUUID(), created_at: (/* @__PURE__ */ new Date()).toISOString() };
  }
  const p = { ...input2, id: `rx_${Date.now().toString(36)}`, status: "pending", created_at: (/* @__PURE__ */ new Date()).toISOString() };
  mockPrescriptions.unshift(p);
  return p;
}
async function fetchPrescriptions() {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("prescriptions").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return [...mockPrescriptions];
}
async function updatePrescriptionStatus(id, status) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("prescriptions").update({ status }).eq("id", id);
    if (error) throw error;
    return;
  }
  const p = mockPrescriptions.find((x) => x.id === id);
  if (p) p.status = status;
}
async function toggleProductStock(id, in_stock) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("products").update({ in_stock }).eq("id", id);
    if (error) throw error;
    return;
  }
  const p = MOCK_PRODUCTS.find((x) => x.id === id);
  if (p) p.in_stock = in_stock;
}
async function addProduct(input2) {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("products").insert(input2).select().single();
    if (error) throw error;
    return data;
  }
  const p = { ...input2, id: `prod_${Date.now().toString(36)}`, created_at: (/* @__PURE__ */ new Date()).toISOString() };
  MOCK_PRODUCTS.unshift(p);
  return p;
}
async function deleteProduct(id) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const idx = MOCK_PRODUCTS.findIndex((x) => x.id === id);
  if (idx !== -1) MOCK_PRODUCTS.splice(idx, 1);
}
async function fetchRiders() {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("riders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
  return [...mockRiders];
}
async function addRider(input2) {
  if (supabaseEnabled && supabase) {
    const { data, error } = await supabase.from("riders").insert(input2).select().single();
    if (error) throw error;
    return data;
  }
  const r = { ...input2, id: `rider_${Date.now().toString(36)}`, created_at: (/* @__PURE__ */ new Date()).toISOString() };
  mockRiders.unshift(r);
  return r;
}
async function deleteRider(id) {
  if (supabaseEnabled && supabase) {
    const { error } = await supabase.from("riders").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const idx = mockRiders.findIndex((x) => x.id === id);
  if (idx !== -1) mockRiders.splice(idx, 1);
}
function Home() {
  const [products, setProducts] = reactExports.useState([]);
  const [cat, setCat] = reactExports.useState(null);
  const [q, setQ] = reactExports.useState("");
  reactExports.useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);
  const filtered = reactExports.useMemo(() => {
    return products.filter((p) => cat ? p.category === cat : true).filter((p) => q ? p.name.toLowerCase().includes(q.toLowerCase()) : true).slice(0, 8);
  }, [products, cat, q]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "relative overflow-hidden bg-gradient-to-br from-primary-soft via-background to-accent-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-6xl px-4 pb-12 pt-10 md:pb-20 md:pt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        className: "max-w-2xl",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3.5 w-3.5 text-primary" }),
            PHARMACY_CONFIG.address
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl", children: [
            PHARMACY_CONFIG.tagline.split(" in ")[0],
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: " in 30 minutes." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 max-w-xl text-base text-muted-foreground md:text-lg", children: [
            "Order trusted medicines from ",
            PHARMACY_CONFIG.name,
            ". Fast delivery, real pharmacists, no hassle."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-sm shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/80", children: PHARMACY_CONFIG.hours })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              distExports.Link,
              {
                to: "/products",
                className: "inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-transform hover:scale-[1.03]",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "h-4 w-4" }),
                  " Order Now"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              distExports.Link,
              {
                to: "/prescription",
                className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
                  " Upload Prescription"
                ]
              }
            )
          ] })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: q,
            onChange: (e) => setQ(e.target.value),
            placeholder: "Search medicines, vitamins, baby care…",
            className: "h-14 w-full rounded-full border border-border bg-card pl-12 pr-4 text-sm shadow-sm outline-none transition-shadow focus:shadow-[var(--shadow-lift)]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryPills, { active: cat, onChange: setCat }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-4 pb-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-5 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-semibold md:text-3xl", children: "Featured products" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Link, { to: "/products", className: "text-sm font-medium text-primary hover:underline", children: "View all →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p }, p.id)) }),
      filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground", children: "No products match your search." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function Products() {
  const [products, setProducts] = reactExports.useState([]);
  const [cat, setCat] = reactExports.useState(null);
  const [sort, setSort] = reactExports.useState("popular");
  const [maxPrice, setMaxPrice] = reactExports.useState(5e3);
  const [rxOnly, setRxOnly] = reactExports.useState(false);
  reactExports.useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);
  const filtered = reactExports.useMemo(() => {
    let list = products.filter((p) => cat ? p.category === cat : true).filter((p) => p.price <= maxPrice).filter((p) => rxOnly ? p.requires_prescription : true);
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, cat, sort, maxPrice, rxOnly]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold md:text-4xl", children: "All products" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Browse our full catalog. Add anything to cart in one tap." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryPills, { active: cat, onChange: setCat }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-4 rounded-xl border border-border bg-surface p-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 font-medium", children: "Sort" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: sort,
              onChange: (e) => setSort(e.target.value),
              className: "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "popular", children: "Popular" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_asc", children: "Price: low to high" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_desc", children: "Price: high to low" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 font-medium", children: [
            "Max price: KES ",
            maxPrice.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "range",
              min: 100,
              max: 5e3,
              step: 50,
              value: maxPrice,
              onChange: (e) => setMaxPrice(Number(e.target.value)),
              className: "w-full accent-[var(--color-primary)]"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: rxOnly,
              onChange: (e) => setRxOnly(e.target.checked),
              className: "h-4 w-4 accent-[var(--color-primary)]"
            }
          ),
          "Prescription required only"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-2 gap-4 md:grid-cols-4", children: filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p }, p.id)) }),
      filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 rounded-xl border border-dashed border-border bg-surface p-10 text-center text-sm text-muted-foreground", children: "No products match these filters." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function ProductDetail() {
  const { id } = distExports.useParams();
  const [product, setProduct] = reactExports.useState(null);
  const [related, setRelated] = reactExports.useState([]);
  const [qty, setQty] = reactExports.useState(1);
  const { add } = useCart();
  reactExports.useEffect(() => {
    if (!id) return;
    setQty(1);
    fetchProduct(id).then(setProduct);
    fetchProducts().then((all) => setRelated(all));
  }, [id]);
  if (!product) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground", children: "Loading product…" })
    ] });
  }
  const rel = related.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-6xl px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(distExports.Link, { to: "/products", className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to products"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto grid max-w-6xl gap-10 px-4 pb-12 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl bg-surface", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image_url, alt: product.name, className: "aspect-square w-full object-cover" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: product.category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-2 font-display text-3xl font-semibold md:text-4xl", children: product.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 font-display text-2xl font-semibold text-primary", children: formatKES(product.price) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-sm leading-relaxed text-muted-foreground", children: product.description }),
        product.requires_prescription && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent-soft p-4 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "mt-0.5 h-5 w-5 shrink-0 text-accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Requires Prescription" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground/70", children: "You'll be asked to upload a valid prescription at checkout." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center rounded-full border border-border bg-card", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQty((q) => Math.max(1, q - 1)), className: "grid h-11 w-11 place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 text-center text-sm font-semibold", children: qty }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQty((q) => q + 1), className: "grid h-11 w-11 place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              disabled: !product.in_stock,
              onClick: () => add(product, qty),
              className: "flex-1 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
              children: product.in_stock ? `Add to cart · ${formatKES(product.price * qty)}` : "Out of Stock"
            }
          )
        ] })
      ] })
    ] }),
    rel.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-4 pb-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 font-display text-2xl font-semibold", children: "You may also like" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-4 md:grid-cols-4", children: rel.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ProductCard, { product: p }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function Cart() {
  const { items, setQty, remove, subtotal, requiresPrescription } = useCart();
  const [address, setAddress] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [rxName, setRxName] = reactExports.useState(null);
  const navigate = distExports.useNavigate();
  const total = subtotal + (items.length ? PHARMACY_CONFIG.deliveryFee : 0);
  const handleCheckout = () => {
    if (items.length === 0) return;
    sessionStorage.setItem(
      "medrush_checkout",
      JSON.stringify({ address, notes, rxName })
    );
    navigate("/checkout");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-6xl px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold md:text-4xl", children: "Your cart" }),
      items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 rounded-2xl border border-dashed border-border bg-surface p-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl", children: "Your cart is empty" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Browse our shop and add medicines you need." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          distExports.Link,
          {
            to: "/products",
            className: "mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground",
            children: "Shop now"
          }
        )
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-8 lg:grid-cols-[1fr_380px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          items.map(({ product, quantity }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 rounded-xl border border-border bg-card p-3 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: product.image_url, alt: product.name, className: "h-24 w-24 shrink-0 rounded-lg object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wide text-muted-foreground", children: product.category }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium leading-tight", children: product.name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => remove(product.id), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex items-end justify-between pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center rounded-full border border-border", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQty(product.id, quantity - 1), className: "grid h-9 w-9 place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "h-3.5 w-3.5" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 text-center text-sm font-semibold", children: quantity }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setQty(product.id, quantity + 1), className: "grid h-9 w-9 place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-3.5 w-3.5" }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: formatKES(product.price * quantity) })
              ] })
            ] })
          ] }, product.id)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-medium", children: "Delivery address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  value: address,
                  onChange: (e) => setAddress(e.target.value),
                  placeholder: "e.g. Apartment 4B, Kago Road, Eldoret",
                  className: "h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block text-sm font-medium", children: "Special instructions (optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  value: notes,
                  onChange: (e) => setNotes(e.target.value),
                  rows: 3,
                  placeholder: "Gate code, landmark, allergies…",
                  className: "w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary"
                }
              )
            ] }),
            requiresPrescription && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-accent/40 bg-accent-soft p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4 w-4 text-accent" }),
                " Prescription required"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-foreground/70", children: "One or more items in your cart need a valid prescription. Upload an image or PDF." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileUp, { className: "h-4 w-4" }),
                rxName ?? "Choose file",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "file",
                    accept: "image/*,application/pdf",
                    className: "hidden",
                    onChange: (e) => setRxName(e.target.files?.[0]?.name ?? null)
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "h-fit rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg font-semibold", children: "Order summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Subtotal", value: formatKES(subtotal) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Delivery fee", value: formatKES(PHARMACY_CONFIG.deliveryFee) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-3 border-t border-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: "Total", value: formatKES(total), bold: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleCheckout,
              disabled: !address || requiresPrescription && !rxName,
              className: "mt-5 w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
              children: "Proceed to checkout"
            }
          ),
          requiresPrescription && !rxName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Upload a prescription to continue." }),
          !address && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Enter a delivery address to continue." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function Row({ label, value, bold }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center justify-between ${bold ? "text-base font-semibold" : "text-muted-foreground"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: bold ? "text-foreground" : "", children: value })
  ] });
}
function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = distExports.useNavigate();
  const [name, setName] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [address, setAddress] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [rxName, setRxName] = reactExports.useState(null);
  const [method, setMethod] = reactExports.useState("mpesa");
  const [showStk, setShowStk] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    try {
      const raw = sessionStorage.getItem("medrush_checkout");
      if (raw) {
        const d = JSON.parse(raw);
        setAddress(d.address ?? "");
        setNotes(d.notes ?? "");
        setRxName(d.rxName ?? null);
      }
    } catch {
    }
  }, []);
  const total = subtotal + PHARMACY_CONFIG.deliveryFee;
  const phoneOk = /^0\d{9}$/.test(phone);
  const submitOrder = async () => {
    setSubmitting(true);
    try {
      const order = await createOrder({
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        items: items.map((i) => ({
          product_id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity
        })),
        prescription_url: rxName ? `uploads/${rxName}` : null,
        subtotal,
        delivery_fee: PHARMACY_CONFIG.deliveryFee,
        total,
        payment_method: method,
        special_instructions: notes || null
      });
      clear();
      sessionStorage.removeItem("medrush_checkout");
      navigate(`/order/${order.id}`);
    } catch (e) {
      console.error(e);
      alert("Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleProceed = () => {
    if (!name || !phoneOk || !address) return;
    if (method === "mpesa") {
      setShowStk(true);
    } else {
      submitOrder();
    }
  };
  if (items.length === 0 && !submitting) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground", children: "Your cart is empty." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-3xl px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold md:text-4xl", children: "Checkout" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { title: "Contact", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full name", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: input, placeholder: "John Doe" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Phone (07XXXXXXXX)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: phone, onChange: (e) => setPhone(e.target.value), className: input, placeholder: "0712345678" }) })
          ] }),
          phone && !phoneOk && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-destructive", children: "Use a Kenyan format: 07XXXXXXXX" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Delivery", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Address", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: address, onChange: (e) => setAddress(e.target.value), className: input, placeholder: "Apartment, street, area" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Payment", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PaymentOption,
            {
              active: method === "mpesa",
              onClick: () => setMethod("mpesa"),
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-5 w-5" }),
              title: "M-Pesa",
              subtitle: "STK push to your phone"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PaymentOption,
            {
              active: method === "cod",
              onClick: () => setMethod("cod"),
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-5 w-5" }),
              title: "Pay on delivery",
              subtitle: "Cash when courier arrives"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { title: "Order summary", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
          items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              i.quantity,
              " × ",
              i.product.name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatKES(i.product.price * i.quantity) })
          ] }, i.product.id)),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-2 border-t border-border" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatKES(subtotal) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delivery" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatKES(PHARMACY_CONFIG.deliveryFee) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex justify-between text-base font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatKES(total) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleProceed,
            disabled: !name || !phoneOk || !address || submitting,
            className: "w-full rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
            children: submitting ? "Placing order…" : method === "mpesa" ? `Pay ${formatKES(total)} with M-Pesa` : `Place order · ${formatKES(total)}`
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showStk && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        className: "fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { scale: 0.92, y: 10 },
            animate: { scale: 1, y: 0 },
            exit: { scale: 0.95, opacity: 0 },
            className: "w-full max-w-md rounded-2xl bg-card p-7 text-center shadow-2xl",
            children: [
              submitting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "mx-auto h-10 w-10 animate-spin text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-7 w-7 text-primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 font-display text-xl font-semibold", children: "Check your phone" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
                "We've sent an M-Pesa STK push to ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: phone }),
                ". Enter your PIN to pay ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: formatKES(total) }),
                "."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: submitOrder,
                    disabled: submitting,
                    className: "inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
                      "I've completed payment"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setShowStk(false),
                    className: "text-xs text-muted-foreground hover:text-foreground",
                    disabled: submitting,
                    children: "Cancel"
                  }
                )
              ] })
            ]
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
const input = "h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary";
function Card({ title, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 font-display text-base font-semibold", children: title }),
    children
  ] });
}
function Field({ label, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 font-medium", children: label }),
    children
  ] });
}
function PaymentOption({ active, onClick, icon, title, subtitle }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      className: `flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${active ? "border-primary bg-primary-soft" : "border-border bg-card hover:border-primary"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-10 w-10 place-items-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`, children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: subtitle })
        ] })
      ]
    }
  );
}
const STORAGE_KEY = "recent_orders";
function saveOrderToHistory(orderId) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const updated = [orderId, ...existing.filter((id) => id !== orderId)].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
  }
}
const STEPS = [
  { key: "received", label: "Order received", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }), description: "We've received your order and it's being reviewed." },
  { key: "preparing", label: "Preparing", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChefHat, { className: "h-5 w-5" }), description: "Your order is being packed and prepared for dispatch." },
  { key: "out_for_delivery", label: "Out for delivery", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "h-5 w-5" }), description: "Your order is on its way to you!" },
  { key: "delivered", label: "Delivered", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-5 w-5" }), description: "Your order has been delivered. Thank you!" }
];
function OrderTracking() {
  const { id } = distExports.useParams();
  const [order, setOrder] = reactExports.useState(null);
  const [rider, setRider] = reactExports.useState(null);
  const [confirming, setConfirming] = reactExports.useState(false);
  const [hoveredStar, setHoveredStar] = reactExports.useState(0);
  const [selectedStar, setSelectedStar] = reactExports.useState(0);
  const [ratingSubmitted, setRatingSubmitted] = reactExports.useState(false);
  const [submittingRating, setSubmittingRating] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!id) return;
    saveOrderToHistory(id);
    const unsub = subscribeOrder(id, (o) => {
      setOrder(o);
      if (o?.rating) {
        setSelectedStar(o.rating);
        setRatingSubmitted(true);
      }
    });
    return unsub;
  }, [id]);
  reactExports.useEffect(() => {
    if (!order?.rider_id) {
      setRider(null);
      return;
    }
    if (order.rider) {
      setRider(order.rider);
      return;
    }
    if (!supabase) return;
    supabase.from("riders").select("*").eq("id", order.rider_id).maybeSingle().then(({ data }) => {
      if (data) setRider(data);
    });
  }, [order?.rider_id, order?.rider]);
  if (!order) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground", children: "Loading order…" })
    ] });
  }
  const currentIdx = STEPS.findIndex((s) => s.key === order.status);
  const currentStep = STEPS[currentIdx];
  const isOutForDelivery = order.status === "out_for_delivery";
  const isDelivered = order.status === "delivered";
  const waMessage = encodeURIComponent(
    `Hi ${PHARMACY_CONFIG.name}, I'm checking on my order #${order.id.slice(-6).toUpperCase()} (Total: ${formatKES(order.total)}).`
  );
  const handleConfirmDelivery = async () => {
    if (confirming) return;
    setConfirming(true);
    await confirmDelivery(order.id);
    setConfirming(false);
  };
  const handleStarClick = async (star) => {
    if (ratingSubmitted || submittingRating) return;
    setSelectedStar(star);
    setSubmittingRating(true);
    await submitRating(order.id, star);
    setRatingSubmitted(true);
    setSubmittingRating(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-3xl px-4 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: "Order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-display text-2xl font-semibold", children: [
              "#",
              order.id.slice(-6).toUpperCase()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
              "Placed ",
              new Date(order.created_at).toLocaleString()
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: `https://wa.me/${PHARMACY_CONFIG.whatsapp}?text=${waMessage}`,
              target: "_blank",
              rel: "noreferrer",
              className: "inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
                " WhatsApp"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-5 rounded-xl border px-4 py-3 ${isDelivered ? "bg-green-50 border-green-200" : "bg-primary-soft border-primary/20"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-sm font-semibold ${isDelivered ? "text-green-700" : "text-primary"}`, children: currentStep?.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-0.5 text-xs ${isDelivered ? "text-green-600" : "text-primary/70"}`, children: currentStep?.description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 right-0 top-5 h-1 rounded-full bg-secondary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { width: 0 },
              animate: { width: `${currentIdx / (STEPS.length - 1) * 100}%` },
              transition: { duration: 0.6, ease: "easeInOut" },
              className: "absolute left-0 top-5 h-1 rounded-full bg-primary"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid grid-cols-4", children: STEPS.map((s, i) => {
            const done = i <= currentIdx;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: false,
                  animate: done ? { scale: [1, 1.15, 1] } : {},
                  transition: { duration: 0.3 },
                  className: `grid h-11 w-11 place-items-center rounded-full border-2 transition-colors ${done ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-muted-foreground"}`,
                  children: s.icon
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `mt-2 text-[11px] font-medium md:text-xs ${done ? "text-foreground" : "text-muted-foreground"}`, children: s.label })
            ] }, s.key);
          }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOutForDelivery && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
          className: "mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-violet-800", children: "Your order is on the way!" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xs text-violet-600", children: "Once you receive your medicine, tap below to confirm delivery." })
              ] })
            ] }),
            rider ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-xl border border-violet-200 bg-white p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[11px] uppercase tracking-wide text-violet-400 font-medium", children: "Your delivery rider" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700 font-bold text-base", children: rider.name.charAt(0).toUpperCase() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm text-foreground leading-tight", children: rider.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: rider.phone })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "a",
                  {
                    href: `tel:${rider.phone}`,
                    className: "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-white py-2.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
                      " Call rider"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "a",
                  {
                    href: `https://wa.me/${formatPhoneForWa(rider.phone)}`,
                    target: "_blank",
                    rel: "noreferrer",
                    className: "flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2.5 text-xs font-semibold text-white hover:bg-[#1ebe5d] transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3.5 w-3.5" }),
                      " WhatsApp rider"
                    ]
                  }
                )
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-xl border border-violet-100 bg-white/60 px-3 py-2.5 text-xs text-violet-500", children: "Rider details will appear here once assigned." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleConfirmDelivery,
                disabled: confirming,
                className: "mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 transition-colors",
                children: [
                  confirming ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }),
                  confirming ? "Confirming…" : "I have received my order"
                ]
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isDelivered && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          className: "mt-4 rounded-2xl border border-green-200 bg-green-50 p-5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-green-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PartyPopper, { className: "h-5 w-5 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Order delivered!" })
            ] }),
            ratingSubmitted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-1", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-7 w-7 ${i < selectedStar ? "fill-amber-400 text-amber-400" : "text-border"}` }, i)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm font-medium text-green-700", children: "Thanks for your rating!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xs text-green-600", children: "We appreciate your feedback." })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-green-800", children: "How was your experience?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-green-600", children: "Tap a star to rate your order" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex justify-center gap-2", children: Array.from({ length: 5 }).map((_, i) => {
                const star = i + 1;
                const filled = star <= (hoveredStar || selectedStar);
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onMouseEnter: () => setHoveredStar(star),
                    onMouseLeave: () => setHoveredStar(0),
                    onClick: () => handleStarClick(star),
                    disabled: submittingRating,
                    className: "transition-transform hover:scale-110 disabled:opacity-60",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-9 w-9 transition-colors ${filled ? "fill-amber-400 text-amber-400" : "text-border hover:text-amber-300"}` })
                  },
                  star
                );
              }) }),
              submittingRating && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-center text-xs text-muted-foreground", children: "Saving…" })
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid gap-4 md:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-semibold", children: "Items" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2 text-sm", children: [
            order.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                it.quantity,
                " × ",
                it.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: formatKES(it.price * it.quantity) })
            ] }, it.product_id)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-2 border-t border-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatKES(order.subtotal) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delivery" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatKES(order.delivery_fee) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex justify-between text-base font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatKES(order.total) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-semibold", children: "Delivery" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-1 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "To: " }),
              order.customer_name
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Phone: " }),
              order.customer_phone
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Address: " }),
              order.delivery_address
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Payment: " }),
              order.payment_method === "mpesa" ? "M-Pesa" : "Pay on delivery"
            ] }),
            order.special_instructions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 rounded-lg bg-surface p-3 text-xs text-muted-foreground", children: order.special_instructions })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground", children: "💡 Bookmark this page or save the link to check your order anytime — no account needed." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
function Prescription() {
  const [phone, setPhone] = reactExports.useState("");
  const [address, setAddress] = reactExports.useState("");
  const [file, setFile] = reactExports.useState(null);
  const [fileName, setFileName] = reactExports.useState(null);
  const [done, setDone] = reactExports.useState(false);
  const [submitting, setSubmitting] = reactExports.useState(false);
  const phoneOk = /^0\d{9}$/.test(phone);
  const canSubmit = phoneOk && address && file;
  const handleSubmit = async () => {
    if (!canSubmit || !file) return;
    setSubmitting(true);
    try {
      const prescription_url = await uploadPrescriptionFile(file);
      await createPrescription({
        customer_phone: phone,
        delivery_address: address,
        prescription_url
      });
      setDone(true);
    } catch (e) {
      console.error(e);
      alert("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-2xl px-4 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold md:text-4xl", children: "Upload prescription" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Send us a photo or PDF of your prescription. A pharmacist will call you within 30 minutes to confirm." }),
      done ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          className: "mt-10 rounded-2xl border border-primary/30 bg-primary-soft p-8 text-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mx-auto h-12 w-12 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 font-display text-xl font-semibold", children: "Prescription received" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "We'll call you within 30 minutes to confirm your order." })
          ]
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 font-medium", children: "Phone (07XXXXXXXX)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: phone,
              onChange: (e) => setPhone(e.target.value),
              placeholder: "0712345678",
              className: "h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 font-medium", children: "Delivery address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: address,
              onChange: (e) => setAddress(e.target.value),
              placeholder: "Apartment, street, area",
              className: "h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 text-sm font-medium", children: "Prescription file" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface p-6 text-sm text-muted-foreground hover:border-primary hover:text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileUp, { className: "h-6 w-6 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-foreground", children: fileName ?? "Click to choose a file" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", children: "PNG, JPG or PDF — up to 10 MB" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: "image/*,application/pdf",
                className: "hidden",
                onChange: (e) => {
                  const f = e.target.files?.[0] ?? null;
                  setFile(f);
                  setFileName(f?.name ?? null);
                }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleSubmit,
            disabled: !canSubmit || submitting,
            className: "w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
            children: submitting ? "Uploading & submitting…" : "Submit prescription"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
const STATUSES = ["received", "preparing", "out_for_delivery", "delivered"];
const STATUS_META = {
  received: { label: "Received", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }), color: "text-blue-600", bg: "bg-blue-50 border-blue-200", next: "Mark as Preparing" },
  preparing: { label: "Preparing", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChefHat, { className: "h-4 w-4" }), color: "text-amber-600", bg: "bg-amber-50 border-amber-200", next: "Mark as Out for Delivery" },
  out_for_delivery: { label: "Out for delivery", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "h-4 w-4" }), color: "text-violet-600", bg: "bg-violet-50 border-violet-200", next: "Mark as Delivered" },
  delivered: { label: "Delivered", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-4 w-4" }), color: "text-green-600", bg: "bg-green-50 border-green-200", next: "" }
};
function Admin() {
  const [authed, setAuthed] = reactExports.useState(null);
  reactExports.useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: listener } = supabase?.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    }) ?? { data: null };
    return () => listener?.subscription.unsubscribe();
  }, []);
  if (authed === null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-surface text-sm text-muted-foreground", children: "Loading…" });
  }
  if (!authed) return /* @__PURE__ */ jsxRuntimeExports.jsx(Login, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dashboard, {});
}
function Login() {
  const [email, setEmail] = reactExports.useState("");
  const [pw, setPw] = reactExports.useState("");
  const [err, setErr] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(false);
  const submit = async () => {
    if (!email || !pw) return;
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setErr("Incorrect email or password.");
    setLoading(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center bg-surface px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-[var(--shadow-card)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 font-display text-2xl font-semibold", children: "Admin access" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sign in with your admin account." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "email",
        value: email,
        onChange: (e) => {
          setEmail(e.target.value);
          setErr(null);
        },
        onKeyDown: (e) => e.key === "Enter" && submit(),
        className: "mt-5 h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary",
        placeholder: "Email"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "password",
        value: pw,
        onChange: (e) => {
          setPw(e.target.value);
          setErr(null);
        },
        onKeyDown: (e) => e.key === "Enter" && submit(),
        className: "mt-3 h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary",
        placeholder: "Password"
      }
    ),
    err && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-destructive", children: err }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: submit,
        disabled: loading || !email || !pw,
        className: "mt-4 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60",
        children: loading ? "Signing in…" : "Sign in"
      }
    )
  ] }) });
}
function Dashboard() {
  const [tab, setTab] = reactExports.useState("overview");
  const [orders, setOrders] = reactExports.useState([]);
  const [products, setProducts] = reactExports.useState([]);
  const [prescriptions, setPrescriptions] = reactExports.useState([]);
  const [riders, setRiders] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const unsub = subscribeOrders(setOrders);
    fetchProducts().then(setProducts);
    fetchPrescriptions().then(setPrescriptions);
    fetchRiders().then(setRiders);
    return unsub;
  }, []);
  const handleLogout = async () => {
    await supabase?.auth.signOut();
  };
  const today = (/* @__PURE__ */ new Date()).toDateString();
  const ordersToday = orders.filter((o) => new Date(o.created_at).toDateString() === today);
  const pending = orders.filter((o) => o.status !== "delivered");
  const revenue = ordersToday.reduce((s, o) => s + o.total, 0);
  const NAV = [
    ["overview", "Overview", TrendingUp],
    ["orders", "Orders", ClipboardList],
    ["products", "Products", Package],
    ["prescriptions", "Prescriptions", FileText],
    ["riders", "Riders", Bike]
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-surface", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-16 max-w-7xl items-center justify-between px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-display font-bold", children: "M" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg font-semibold", children: "Admin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: PHARMACY_CONFIG.name })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleLogout, className: "inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:border-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-3.5 w-3.5" }),
          " Sign out"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "mx-auto flex max-w-7xl gap-1 px-4 pb-2 overflow-x-auto no-scrollbar", children: NAV.map(([key, label, Icon]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setTab(key),
          className: `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap ${tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }),
            " ",
            label
          ]
        },
        key
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-7xl px-4 py-6", children: [
      tab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Orders today", value: ordersToday.length.toString(), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Pending orders", value: pending.length.toString(), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Pill$1, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Revenue today", value: formatKES(revenue), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Total products", value: products.length.toString(), icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5" }) })
      ] }),
      tab === "orders" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        OrdersPanel,
        {
          orders,
          riders,
          onStatusChange: async (id, s) => {
            await updateOrderStatus(id, s);
          },
          onAssignRider: async (orderId, riderId) => {
            await assignRider(orderId, riderId);
          }
        }
      ),
      tab === "products" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        ProductsPanel,
        {
          products,
          onToggle: async (id, v) => {
            await toggleProductStock(id, v);
            setProducts(await fetchProducts());
          },
          onAdd: async (p) => {
            await addProduct(p);
            setProducts(await fetchProducts());
          },
          onDelete: async (id) => {
            await deleteProduct(id);
            setProducts(await fetchProducts());
          }
        }
      ),
      tab === "prescriptions" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        PrescriptionsPanel,
        {
          rxs: prescriptions,
          onChange: async (id, s) => {
            await updatePrescriptionStatus(id, s);
            setPrescriptions(await fetchPrescriptions());
          }
        }
      ),
      tab === "riders" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        RidersPanel,
        {
          riders,
          onAdd: async (r) => {
            await addRider(r);
            setRiders(await fetchRiders());
          },
          onDelete: async (id) => {
            await deleteRider(id);
            setRiders(await fetchRiders());
          }
        }
      )
    ] })
  ] });
}
function Stat({ label, value, icon }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, className: "rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary", children: icon })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 font-display text-3xl font-semibold", children: value })
  ] });
}
function OrderCard({
  order,
  riders,
  onStatusChange,
  onAssignRider
}) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const [advancing, setAdvancing] = reactExports.useState(false);
  const [assigning, setAssigning] = reactExports.useState(false);
  const currentIdx = STATUSES.indexOf(order.status);
  const nextStatus = STATUSES[currentIdx + 1];
  const meta = STATUS_META[order.status];
  const isDelivered = order.status === "delivered";
  const isOutForDelivery = order.status === "out_for_delivery";
  const isPreparing = order.status === "preparing";
  const handleAdvance = async () => {
    if (!nextStatus || advancing) return;
    setAdvancing(true);
    await onStatusChange(order.id, nextStatus);
    setAdvancing(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      layout: true,
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      className: "overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 border-b px-3 sm:px-5 py-2.5 text-[10px] sm:text-xs font-semibold ${meta.bg} ${meta.color}`, children: [
          meta.icon,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "uppercase tracking-wide", children: meta.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-[9px] sm:text-[10px] font-normal opacity-70", children: new Date(order.created_at).toLocaleString() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 sm:p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] sm:text-[11px] uppercase tracking-wide text-muted-foreground", children: [
                "#",
                order.id.slice(-6).toUpperCase()
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base sm:text-lg font-semibold truncate", children: order.customer_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs sm:text-sm text-muted-foreground truncate", children: [
                order.customer_phone,
                " · ",
                order.delivery_address
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base sm:text-lg font-semibold", children: formatKES(order.total) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] sm:text-xs text-muted-foreground", children: order.payment_method === "mpesa" ? "M-Pesa" : "Cash on delivery" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2", children: order.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 right-0 top-[18px] h-[3px] rounded-full bg-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              motion.div,
              {
                className: "absolute left-0 top-[18px] h-[3px] rounded-full bg-primary",
                initial: false,
                animate: { width: `${currentIdx / (STATUSES.length - 1) * 100}%` },
                transition: { duration: 0.4, ease: "easeInOut" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid grid-cols-4", children: STATUSES.map((s, i) => {
              const done = i <= currentIdx;
              const stepMeta = STATUS_META[s];
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1.5 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border-2 transition-all duration-300 ${done ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-card text-muted-foreground"}`, children: stepMeta.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[9px] sm:text-[10px] font-medium leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`, children: stepMeta.label })
              ] }, s);
            }) })
          ] }),
          !isDelivered && nextStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleAdvance,
              disabled: advancing,
              className: `mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-semibold transition-all disabled:opacity-60 ${isOutForDelivery ? "bg-violet-600 text-white hover:bg-violet-700" : isPreparing ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-primary text-primary-foreground hover:opacity-90"}`,
              children: [
                advancing ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5 sm:h-4 sm:w-4" }),
                advancing ? "Updating…" : meta.next
              ]
            }
          ),
          isDelivered && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-3 sm:px-4 py-2 sm:py-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs sm:text-sm font-medium text-green-700", children: "Delivered" }),
            order.rating != null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex items-center gap-0.5 sm:gap-1", children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-3 w-3 sm:h-3.5 sm:w-3.5 ${i < order.rating ? "fill-amber-400 text-amber-400" : "text-border"}` }, i)) })
          ] }),
          (isPreparing || isOutForDelivery) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 rounded-xl border border-border bg-surface p-2.5 sm:p-3", children: order.rider ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 sm:gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-primary-soft text-primary shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleUserRound, { className: "h-3.5 w-3.5 sm:h-4 sm:w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs sm:text-sm font-semibold truncate", children: order.rider.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] sm:text-xs text-muted-foreground truncate", children: order.rider.phone })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 sm:gap-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: `https://wa.me/${formatPhoneForWa(order.rider.phone)}?text=${encodeURIComponent(`Hi ${order.rider.name}, please pick up order #${order.id.slice(-6).toUpperCase()} for ${order.customer_name} at ${order.delivery_address}.`)}`,
                  target: "_blank",
                  rel: "noreferrer",
                  className: "inline-flex items-center gap-1 rounded-full bg-primary px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium text-primary-foreground",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3 w-3 sm:h-3.5 sm:w-3.5" }),
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "WhatsApp" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: async () => {
                    setAssigning(true);
                    await onAssignRider(order.id, null);
                    setAssigning(false);
                  },
                  className: "rounded-full border border-border px-2 sm:px-2.5 py-1.5 text-[10px] sm:text-xs text-muted-foreground hover:border-destructive hover:text-destructive whitespace-nowrap",
                  children: "Unassign"
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleUserRound, { className: "h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                defaultValue: "",
                disabled: assigning,
                onChange: async (e) => {
                  if (!e.target.value) return;
                  setAssigning(true);
                  await onAssignRider(order.id, e.target.value);
                  setAssigning(false);
                },
                className: "flex-1 h-8 sm:h-9 rounded-lg border border-border bg-card px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground min-w-0",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", disabled: true, children: assigning ? "Assigning…" : riders.length === 0 ? "No riders — add one in Riders tab" : "Assign a rider…" }),
                  riders.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: r.id, children: [
                    r.name,
                    " · ",
                    r.phone
                  ] }, r.id))
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: `tel:${order.customer_phone}`,
                className: "inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-secondary px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium hover:bg-primary-soft",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3 sm:h-3.5 sm:w-3.5" }),
                  " Call"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: `https://wa.me/${formatPhoneForWa(order.customer_phone)}?text=${encodeURIComponent(`Hi ${order.customer_name}, this is ${PHARMACY_CONFIG.name} regarding your order #${order.id.slice(-6).toUpperCase()}.`)}`,
                target: "_blank",
                rel: "noreferrer",
                className: "inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-primary px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs font-medium text-primary-foreground",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-3 w-3 sm:h-3.5 sm:w-3.5" }),
                  " WhatsApp"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setExpanded((v) => !v),
                className: "ml-auto rounded-full border border-border px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground whitespace-nowrap",
                children: expanded ? "Less" : "Details"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: expanded && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              className: "overflow-hidden",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-1 rounded-xl border border-border bg-surface p-3 sm:p-4 text-xs sm:text-sm", children: [
                order.items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate mr-2", children: [
                    it.quantity,
                    " × ",
                    it.name
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground shrink-0", children: formatKES(it.price * it.quantity) })
                ] }, it.product_id)),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "my-2 border-t border-border" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Subtotal" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatKES(order.subtotal) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Delivery" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatKES(order.delivery_fee) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-semibold", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatKES(order.total) })
                ] }),
                order.special_instructions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded-lg bg-card p-2 sm:p-3 text-[10px] sm:text-xs text-muted-foreground", children: [
                  "Note: ",
                  order.special_instructions
                ] })
              ] })
            }
          ) })
        ] })
      ]
    }
  );
}
function OrdersPanel({
  orders,
  riders,
  onStatusChange,
  onAssignRider
}) {
  const [filter, setFilter] = reactExports.useState("all");
  const list = orders.filter((o) => filter === "all" || o.status === filter);
  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setFilter("all"),
          className: `rounded-full border px-3 py-1.5 text-xs font-medium ${filter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`,
          children: [
            "All · ",
            orders.length
          ]
        }
      ),
      STATUSES.map((s) => {
        const m = STATUS_META[s];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setFilter(s),
            className: `inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`,
            children: [
              m.icon,
              " ",
              m.label,
              " · ",
              counts[s] ?? 0
            ]
          },
          s
        );
      })
    ] }),
    list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground", children: "No orders to show." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: list.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      OrderCard,
      {
        order: o,
        riders,
        onStatusChange,
        onAssignRider
      },
      o.id
    )) })
  ] });
}
function ProductsPanel({
  products,
  onToggle,
  onAdd,
  onDelete
}) {
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const [uploading, setUploading] = reactExports.useState(false);
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({
    name: "",
    description: "",
    price: 0,
    category: CATEGORIES[0],
    image_url: "",
    requires_prescription: false,
    in_stock: true
  });
  const handleDelete = async (id) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };
  const resetForm = () => {
    setForm({ name: "", description: "", price: 0, category: CATEGORIES[0], image_url: "", requires_prescription: false, in_stock: true });
    setUploading(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        products.length,
        " products"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowAdd(true), className: "inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " Add product"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Product" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Rx" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "In stock" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: products.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.image_url, alt: p.name, className: "h-10 w-10 rounded-lg object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: p.name })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: p.category }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: formatKES(p.price) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: p.requires_prescription ? "Yes" : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex cursor-pointer items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: p.in_stock, onChange: (e) => onToggle(p.id, e.target.checked), className: "h-4 w-4 accent-[var(--color-primary)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: p.in_stock ? "text-primary" : "text-muted-foreground", children: p.in_stock ? "Available" : "Out" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: confirmDeleteId === p.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Sure?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(p.id), disabled: deletingId === p.id, className: "rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60", children: deletingId === p.id ? "…" : "Yes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfirmDeleteId(null), className: "rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground", children: "No" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setConfirmDeleteId(p.id), className: "inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
          " Delete"
        ] }) })
      ] }, p.id)) })
    ] }) }) }),
    showAdd && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4", onClick: () => {
      setShowAdd(false);
      resetForm();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => e.stopPropagation(), className: "w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl font-semibold", children: "Add product" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "Name", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), className: "h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.category, onChange: (e) => setForm({ ...form, category: e.target.value }), className: "h-11 rounded-lg border border-border px-3 text-sm", children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: c }, c)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", placeholder: "Price (KES)", value: form.price || "", onChange: (e) => setForm({ ...form, price: Number(e.target.value) }), className: "h-11 rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" }),
        form.image_url ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-border p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: form.image_url, alt: "preview", className: "h-12 w-12 rounded-lg object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate text-xs text-muted-foreground", children: form.image_url }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setForm({ ...form, image_url: "" }), className: "text-xs text-destructive hover:underline", children: "Remove" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground transition-colors", children: [
          uploading ? "Uploading…" : "📁 Upload product image",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "file",
              accept: "image/*",
              className: "hidden",
              disabled: uploading,
              onChange: async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const ext = file.name.split(".").pop();
                const path = `${Date.now()}.${ext}`;
                const { error } = await supabase.storage.from("products").upload(path, file, { upsert: true, contentType: file.type });
                if (!error) {
                  const { data } = supabase.storage.from("products").getPublicUrl(path);
                  setForm((f) => ({ ...f, image_url: data.publicUrl }));
                }
                setUploading(false);
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { placeholder: "Description", rows: 3, value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), className: "rounded-lg border border-border p-3 text-sm outline-none focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.requires_prescription, onChange: (e) => setForm({ ...form, requires_prescription: e.target.checked }), className: "h-4 w-4 accent-[var(--color-primary)]" }),
          "Requires prescription"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setShowAdd(false);
          resetForm();
        }, className: "rounded-full border border-border px-4 py-2 text-sm", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              onAdd(form);
              setShowAdd(false);
              resetForm();
            },
            disabled: !form.name || !form.price || !form.image_url || uploading,
            className: "rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60",
            children: "Save"
          }
        )
      ] })
    ] }) })
  ] });
}
function PrescriptionsPanel({ rxs, onChange }) {
  if (rxs.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground", children: "No prescriptions yet." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: rxs.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-wide text-muted-foreground", children: new Date(r.created_at).toLocaleString() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: r.customer_phone }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: r.delivery_address }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: r.prescription_url, target: "_blank", rel: "noreferrer", className: "mt-1 inline-block text-sm text-primary hover:underline", children: "View prescription" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: r.status, onChange: (e) => onChange(r.id, e.target.value), className: "h-10 rounded-lg border border-border bg-card px-3 text-sm capitalize", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: "Pending" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "reviewed", children: "Reviewed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "fulfilled", children: "Fulfilled" })
    ] })
  ] }, r.id)) });
}
function RidersPanel({
  riders,
  onAdd,
  onDelete
}) {
  const [form, setForm] = reactExports.useState({ name: "", phone: "" });
  const [saving, setSaving] = reactExports.useState(false);
  const [deletingId, setDeletingId] = reactExports.useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = reactExports.useState(null);
  const handleAdd = async () => {
    if (!form.name || !form.phone) return;
    setSaving(true);
    await onAdd(form);
    setForm({ name: "", phone: "" });
    setSaving(false);
  };
  const handleDelete = async (id) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-semibold", children: "Add rider" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "Full name", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), className: "h-11 flex-1 min-w-[160px] rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "Phone (e.g. 0712345678)", value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }), onKeyDown: (e) => e.key === "Enter" && handleAdd(), className: "h-11 flex-1 min-w-[160px] rounded-lg border border-border px-3 text-sm outline-none focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleAdd, disabled: saving || !form.name || !form.phone, className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
          " ",
          saving ? "Adding…" : "Add"
        ] })
      ] })
    ] }),
    riders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground", children: "No riders yet. Add one above to start assigning deliveries." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Rider" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Phone" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Added" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: riders.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary font-semibold text-sm", children: r.name.charAt(0).toUpperCase() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: r.name })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: r.phone }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: new Date(r.created_at).toLocaleDateString() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:${r.phone}`, className: "inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5" }),
            " Call"
          ] }),
          confirmDeleteId === r.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "Sure?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(r.id), disabled: deletingId === r.id, className: "rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60", children: deletingId === r.id ? "…" : "Yes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfirmDeleteId(null), className: "rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground", children: "No" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setConfirmDeleteId(r.id), className: "inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }),
            " Remove"
          ] })
        ] }) })
      ] }, r.id)) })
    ] }) }) })
  ] });
}
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(CartProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.BrowserRouter, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(distExports.Routes, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "/", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Home, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "/products", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Products, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "/products/:id", element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductDetail, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "/cart", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Cart, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "/checkout", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkout, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "/order/:id", element: /* @__PURE__ */ jsxRuntimeExports.jsx(OrderTracking, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "/prescription", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Prescription, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "/admin", element: /* @__PURE__ */ jsxRuntimeExports.jsx(Admin, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Route, { path: "*", element: /* @__PURE__ */ jsxRuntimeExports.jsx(distExports.Navigate, { to: "/", replace: true }) })
  ] }) }) });
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({
  error,
  reset
}) {
  console.error(error);
  const router = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$2 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Medrush Pharmacy" },
      { name: "description", content: "Online Pharmacy" },
      { name: "author", content: "Kanito" },
      { property: "og:title", content: "Medrush Pharmacy" },
      { property: "og:description", content: "Kanito Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
      },
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$2.useRouteContext();
  const [mounted, setMounted] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setMounted(true);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: mounted ? /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) : null });
}
const $$splitComponentImporter$1 = () => import("../_-BTU5dmpx.mjs");
const Route$1 = createFileRoute("/$")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-BTU5dmpx.mjs");
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SplatRoute = Route$1.update({
  id: "/$",
  path: "/$",
  getParentRoute: () => Route$2
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$2
});
const rootRouteChildren = {
  IndexRoute,
  SplatRoute
};
const routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
