import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import { HeartbeatLoader } from "@/components/HeartbeatLoader";
import { fetchOrdersByIds } from "@/lib/api";
import { getSavedOrderIds } from "@/lib/orderHistory";
import { formatKES } from "@/lib/format";
import type { Order } from "@/types";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  received:         { label: "Order received",   className: "bg-primary-soft text-primary" },
  preparing:        { label: "Preparing",        className: "bg-primary-soft text-primary" },
  out_for_delivery: { label: "Out for delivery", className: "bg-violet-100 text-violet-700" },
  delivered:        { label: "Delivered",        className: "bg-green-100 text-green-700" },
};

function badgeFor(order: Order): { label: string; className: string } {
  // Unpaid / failed M-Pesa orders matter more to the customer than the delivery step.
  const pay = order.payment_status as string;
  if (order.payment_method === "mpesa" && pay === "pending") {
    return { label: "Awaiting payment", className: "bg-amber-100 text-amber-700" };
  }
  if (pay === "failed") {
    return { label: "Payment failed", className: "bg-red-100 text-red-700" };
  }
  return (
    STATUS_BADGE[order.status] ?? {
      label: String(order.status).replace(/_/g, " "),
      className: "bg-secondary text-foreground",
    }
  );
}

interface RecentOrdersProps {
  /** Max orders to show. */
  limit?: number;
  /** Show a "View all" link to /orders (used on the cart page). */
  showViewAll?: boolean;
  /** Show a message when there are no orders (the /orders page). Otherwise render nothing. */
  showEmptyState?: boolean;
  className?: string;
}

export function RecentOrders({
  limit = 5,
  showViewAll = false,
  showEmptyState = false,
  className = "",
}: RecentOrdersProps) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ids = getSavedOrderIds().slice(0, limit);
    if (ids.length === 0) {
      setOrders([]);
      return;
    }
    fetchOrdersByIds(ids)
      .then((rows) => { if (!cancelled) setOrders(rows); })
      .catch(() => { if (!cancelled) { setFailed(true); setOrders([]); } });
    return () => { cancelled = true; };
  }, [limit]);

  // Still loading: render nothing on the cart page rather than flashing a placeholder.
  if (orders === null) {
    return showEmptyState ? (
      <HeartbeatLoader tone="background" label="Loading your orders" className={`py-12 ${className}`} />
    ) : null;
  }

  if (orders.length === 0) {
    if (!showEmptyState) return null;
    return (
      <div className={`rounded-2xl border border-dashed border-border bg-surface p-10 text-center ${className}`}>
        <Package className="mx-auto h-8 w-8 text-muted-foreground" />
        <div className="mt-3 font-display text-lg">
          {failed ? "Couldn't load your orders" : "No orders on this device yet"}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {failed ? "Check your connection and try again." : "Orders you place will show up here."}
        </p>
        <Link
          to="/products"
          className="mt-5 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground"
        >
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Your recent orders</h2>
        {showViewAll && (
          <Link to="/orders" className="text-xs font-medium text-primary hover:opacity-75">
            View all
          </Link>
        )}
      </div>

      <div className="space-y-2">
        {orders.map((o) => {
          const badge = badgeFor(o);
          return (
            <Link
              key={o.id}
              to={`/order/${o.id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary">
                <Package className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">#{o.id.slice(-6).toUpperCase()}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString([], {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                  {" · "}
                  {formatKES(o.total)}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}