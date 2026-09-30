import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { PHARMACY_CONFIG } from "@/config";
import { motion } from "framer-motion";

export function Header() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const links = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Pharmacy" },
    { to: "/prescription", label: "Prescription" },
    { to: "/consult", label: "Consult a Doctor" },
    { to: "/services", label: "Home & Clinical Services" },
    
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
    }, 400); // 400ms window between taps
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div
          onClick={handleLogoTap}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <img
            src="/logo-v.png"
            alt="Velpure"
            width={36}
            height={36}
            draggable={false}
            className="h-9 w-9 rounded-lg object-cover shadow-sm ring-1 ring-black/5"
          />
          <div className="leading-none">
            <div className="font-display text-lg font-semibold">Velpure Limited</div>
            <div className="text-[11px] text-muted-foreground">{PHARMACY_CONFIG.name}</div>
          </div>
        </div>

        <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`whitespace-nowrap text-sm font-medium transition-colors ${
                  active ? "text-primary" : "text-foreground/70 hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary hover:bg-primary-soft transition-colors"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground"
              >
                {count}
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}