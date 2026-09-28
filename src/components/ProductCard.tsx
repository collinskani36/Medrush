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
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/40 shadow-[var(--shadow-card)] backdrop-blur-md transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden">
        {hasImage ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary-soft via-accent-soft/50 to-primary-soft">
            <div className="rx-texture absolute inset-0 opacity-30" />
            <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-white/70 text-primary shadow-sm backdrop-blur-sm transition-transform duration-500 group-hover:scale-105">
              <Icon className="h-8 w-8" />
            </div>
          </div>
        )}

        {!product.in_stock && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-2.5 py-1 text-[11px] font-semibold text-background backdrop-blur-sm">
            Out of Stock
          </span>
        )}
        {product.requires_prescription && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground shadow-sm">
            <ShieldAlert className="h-3 w-3" /> Rx
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 border-t border-white/40 bg-white/60 p-4 backdrop-blur-md">
        <div className="text-[11px] font-medium uppercase tracking-wide text-primary/70">
          {product.category}
        </div>
        <Link
          to={`/products/${product.id}`}
          className="line-clamp-2 font-display text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="font-display text-base font-semibold text-[var(--color-ink)]">
            {formatKES(product.price)}
          </div>
          <button
            disabled={!product.in_stock}
            onClick={() => add(product)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-gold)] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
            aria-label="Add to cart"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}