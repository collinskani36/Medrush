// ProductCard.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ShieldAlert } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { formatKES } from "@/lib/format";
import { getCategoryIcon } from "@/lib/categoryIcons";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const hasImage = Boolean(product.image_url);
  const Icon = getCategoryIcon(product.category);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/40 shadow-[var(--shadow-card)] backdrop-blur-md transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <Link
        to={`/products/${product.id}`}
        aria-label={product.name}
        className="relative block overflow-hidden"
      >
        {hasImage ? (
          <div className="aspect-square w-full overflow-hidden bg-muted">
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          /* Compact placeholder — no more giant empty square */
          <div className="relative flex h-24 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary-soft via-accent-soft/50 to-primary-soft md:h-28">
            <div className="rx-texture absolute inset-0 opacity-30" />
            <div className="relative grid h-11 w-11 place-items-center rounded-xl bg-white/70 text-primary shadow-sm backdrop-blur-sm transition-transform duration-500 group-hover:scale-105">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        )}

        {!product.in_stock && (
          <span className="absolute left-2.5 top-2.5 rounded-full bg-foreground/80 px-2.5 py-1 text-[11px] font-semibold text-background backdrop-blur-sm">
            Out of Stock
          </span>
        )}
        {product.requires_prescription && (
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground shadow-sm">
            <ShieldAlert className="h-3 w-3" /> Rx
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 border-t border-white/40 bg-white/60 p-3.5 backdrop-blur-md md:p-4">
        <div className="text-[11px] font-medium uppercase tracking-wide text-primary/70">
          {product.category}
        </div>
        <Link
          to={`/products/${product.id}`}
          title={product.name}
          className="line-clamp-2 min-h-[2.5rem] break-words font-display text-sm font-semibold leading-snug tracking-tight text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="font-display text-base font-semibold text-[var(--color-ink)]">
            {formatKES(product.price)}
          </div>
          <button
            disabled={!product.in_stock}
            onClick={() => add(product)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            aria-label="Add to cart"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}