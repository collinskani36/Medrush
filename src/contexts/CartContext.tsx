import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/types";

interface CartContextValue {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  requiresPrescription: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "medrush_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
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
            return curr.map((i) =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i,
            );
          }
          return [...curr, { product, quantity: qty }];
        });
      },
      remove: (id) => setItems((curr) => curr.filter((i) => i.product.id !== id)),
      setQty: (id, qty) =>
        setItems((curr) =>
          qty <= 0
            ? curr.filter((i) => i.product.id !== id)
            : curr.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i)),
        ),
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
