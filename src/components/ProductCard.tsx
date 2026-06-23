import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, ShieldAlert } from "lucide-react";
import type { Product } from "@/types";
import { useCart } from "@/contexts/CartContext";
import { formatKES } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]"
    >
      <Link to={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-surface">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {!product.in_stock && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-2.5 py-1 text-[11px] font-semibold text-background">
            Out of Stock
          </span>
        )}
        {product.requires_prescription && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
            <ShieldAlert className="h-3 w-3" /> Rx
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {product.category}
        </div>
        <Link to={`/products/${product.id}`} className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary">
          {product.name}
        </Link>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="font-display text-base font-semibold">{formatKES(product.price)}</div>
          <button
            disabled={!product.in_stock}
            onClick={() => add(product)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            aria-label="Add to cart"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
