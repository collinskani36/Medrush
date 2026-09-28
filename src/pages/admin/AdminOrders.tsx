import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ChefHat, Bike, Home as HomeIcon, ArrowRight, Star,
  UserCircle2, MessageCircle, Phone, MapPin,
} from "lucide-react";
import type { Order, OrderStatus, Rider } from "@/types";
import { PHARMACY_CONFIG } from "@/config";
import { formatKES, formatPhoneForWa } from "@/lib/format";
import { CARD, chip } from "./shared";

const STATUSES: OrderStatus[] = ["received", "preparing", "out_for_delivery", "delivered"];

const STATUS_META: Record<
  OrderStatus,
  { label: string; icon: React.ReactNode; color: string; bg: string; dot: string; next: string }
> = {
  received: {
    label: "Received",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-sky-700",
    bg: "bg-sky-50/80 border-sky-100",
    dot: "bg-sky-500",
    next: "Mark as Preparing",
  },
  preparing: {
    label: "Preparing",
    icon: <ChefHat className="h-4 w-4" />,
    color: "text-amber-700",
    bg: "bg-amber-50/80 border-amber-100",
    dot: "bg-amber-500",
    next: "Mark as Out for Delivery",
  },
  out_for_delivery: {
    label: "Out for delivery",
    icon: <Bike className="h-4 w-4" />,
    color: "text-violet-700",
    bg: "bg-violet-50/80 border-violet-100",
    dot: "bg-violet-500",
    next: "Mark as Delivered",
  },
  delivered: {
    label: "Delivered",
    icon: <HomeIcon className="h-4 w-4" />,
    color: "text-emerald-700",
    bg: "bg-emerald-50/80 border-emerald-100",
    dot: "bg-emerald-500",
    next: "",
  },
};

function OrderCard({
  order, riders, onStatusChange, onAssignRider,
}: {
  order: Order;
  riders: Rider[];
  onStatusChange: (id: string, s: OrderStatus) => Promise<void>;
  onAssignRider: (orderId: string, riderId: string | null) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const currentIdx = STATUSES.indexOf(order.status);
  const nextStatus = STATUSES[currentIdx + 1] as OrderStatus | undefined;
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

  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={CARD}>
      <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-4 py-3 sm:px-5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        <span className="ml-auto text-[10px] font-normal text-muted-foreground">
          {new Date(order.created_at).toLocaleString()}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px]">
              #{order.id.slice(-6).toUpperCase()}
            </div>
            <div className="truncate font-display text-base font-medium sm:text-lg">
              {order.customer_name}
            </div>
            <div className="truncate text-xs text-muted-foreground sm:text-sm">
              {order.customer_phone} · {order.delivery_address}
            </div>
            {order.distance_km != null && (
              <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> ~{order.distance_km.toFixed(1)} km by road
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-base font-medium tracking-display sm:text-lg">
              {formatKES(order.total)}
            </div>
            <div className="text-[10px] text-muted-foreground sm:text-xs">
              {order.payment_method === "mpesa" ? "M-Pesa" : "Cash on delivery"}
            </div>
          </div>
        </div>

        <div className="mt-2 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join(" · ")}
        </div>

        <div className="relative mt-6">
          <div className="absolute left-0 right-0 top-[18px] h-[3px] rounded-full bg-[var(--color-hairline)]" />
          <motion.div
            className="absolute left-0 top-[18px] h-[3px] rounded-full bg-primary"
            initial={false}
            animate={{ width: `${(currentIdx / (STATUSES.length - 1)) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
          <div className="relative grid grid-cols-4">
            {STATUSES.map((s, i) => {
              const done = i <= currentIdx;
              const stepMeta = STATUS_META[s];
              return (
                <div key={s} className="flex flex-col items-center gap-1.5 text-center">
                  <div
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 transition-all duration-300 sm:h-9 sm:w-9 ${
                      done
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-[var(--color-hairline)] bg-card text-muted-foreground"
                    }`}
                  >
                    {stepMeta.icon}
                  </div>
                  <span
                    className={`text-[9px] font-medium leading-tight sm:text-[10px] ${
                      done ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {stepMeta.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {!isDelivered && nextStatus && (
          <button
            onClick={handleAdvance}
            disabled={advancing}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-60 sm:text-sm ${
              isOutForDelivery
                ? "bg-violet-600 hover:bg-violet-700"
                : isPreparing
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-[var(--color-ink)] hover:bg-[var(--color-ink)]/90"
            }`}
          >
            {advancing ? (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white sm:h-4 sm:w-4" />
            ) : (
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            {advancing ? "Updating…" : meta.next}
          </button>
        )}

        {isDelivered && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-2.5">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 sm:h-4 sm:w-4" />
            <span className="text-xs font-medium text-emerald-700 sm:text-sm">Delivered</span>
            {order.rating != null && (
              <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                      i < order.rating! ? "fill-amber-400 text-amber-400" : "text-border"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {(isPreparing || isOutForDelivery) && (
          <div className="mt-3 rounded-2xl border border-[var(--color-hairline)] bg-surface/60 p-3">
            {order.rider ? (
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                    <UserCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold sm:text-sm">{order.rider.name}</div>
                    <div className="truncate text-[10px] text-muted-foreground sm:text-xs">
                      {order.rider.phone}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                  <a
                    href={`https://wa.me/${formatPhoneForWa(order.rider.phone)}?text=${encodeURIComponent(
                      `Hi ${order.rider.name}, please pick up order #${order.id.slice(-6).toUpperCase()} for ${order.customer_name} at ${order.delivery_address}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-[var(--color-ink)] px-2.5 py-1.5 text-[10px] font-medium text-white transition-opacity hover:opacity-90 sm:px-3 sm:text-xs"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                  <button
                    onClick={async () => { setAssigning(true); await onAssignRider(order.id, null); setAssigning(false); }}
                    className="whitespace-nowrap rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-[10px] text-muted-foreground transition-colors hover:border-destructive hover:text-destructive sm:px-3 sm:text-xs"
                  >
                    Unassign
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <UserCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                <select
                  defaultValue=""
                  disabled={assigning}
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    setAssigning(true);
                    await onAssignRider(order.id, e.target.value);
                    setAssigning(false);
                  }}
                  className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--color-hairline)] bg-card px-3 text-xs text-muted-foreground outline-none transition-colors focus:border-primary sm:text-sm"
                >
                  <option value="" disabled>
                    {assigning ? "Assigning…" : riders.length === 0 ? "No riders — add one below" : "Assign a rider…"}
                  </option>
                  {riders.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} · {r.phone}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <a
            href={`tel:${order.customer_phone}`}
            className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1.5 text-[10px] font-medium transition-colors hover:bg-primary-soft sm:gap-1.5 sm:px-3 sm:text-xs"
          >
            <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/${formatPhoneForWa(order.customer_phone)}?text=${encodeURIComponent(
              `Hi ${order.customer_name}, this is ${PHARMACY_CONFIG.name} regarding your order #${order.id.slice(-6).toUpperCase()}.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-ink)] px-2.5 py-1.5 text-[10px] font-medium text-white transition-opacity hover:opacity-90 sm:gap-1.5 sm:px-3 sm:text-xs"
          >
            <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> WhatsApp
          </a>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto whitespace-nowrap rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-foreground sm:px-3 sm:text-xs"
          >
            {expanded ? "Less" : "Details"}
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-1 rounded-2xl border border-[var(--color-hairline)] bg-surface/60 p-4 text-xs sm:text-sm">
                {order.items.map((it) => (
                  <div key={it.product_id} className="flex justify-between text-muted-foreground">
                    <span className="mr-2 truncate">{it.quantity} × {it.name}</span>
                    <span className="shrink-0 text-foreground">{formatKES(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="my-2 border-t border-[var(--color-hairline)]" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatKES(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{formatKES(order.delivery_fee)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatKES(order.total)}</span>
                </div>
                {order.special_instructions && (
                  <div className="mt-2 rounded-lg bg-card p-3 text-[10px] text-muted-foreground sm:text-xs">
                    Note: {order.special_instructions}
                  </div>
                )}
                {order.delivery_lat != null && order.delivery_lng != null && (
                  <a
                    href={`https://www.google.com/maps?q=${order.delivery_lat},${order.delivery_lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[10px] text-primary hover:underline sm:text-xs"
                  >
                    <MapPin className="h-3 w-3" /> Open delivery location in Maps
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function OrdersPanel({
  orders, riders, onStatusChange, onAssignRider,
}: {
  orders: Order[];
  riders: Rider[];
  onStatusChange: (id: string, s: OrderStatus) => Promise<void>;
  onAssignRider: (orderId: string, riderId: string | null) => Promise<void>;
}) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const list = orders.filter((o) => filter === "all" || o.status === filter);
  const counts = STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={chip(filter === "all")}>
          All · {orders.length}
        </button>
        {STATUSES.map((s) => {
          const m = STATUS_META[s];
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`inline-flex items-center gap-1.5 ${chip(filter === s)}`}
            >
              {m.icon} {m.label} · {counts[s] ?? 0}
            </button>
          );
        })}
      </div>
      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--color-hairline)] bg-card/60 p-12 text-center text-sm text-muted-foreground">No orders to show.</div>
      ) : (
        <div className="space-y-4">
          {list.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              riders={riders}
              onStatusChange={onStatusChange}
              onAssignRider={onAssignRider}
            />
          ))}
        </div>
      )}
    </div>
  );
}