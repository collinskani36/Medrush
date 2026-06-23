import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Bike, Home as HomeIcon, MessageCircle,
  ChefHat, Star, PartyPopper, Phone,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { subscribeOrder, confirmDelivery, submitRating } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { PHARMACY_CONFIG } from "@/config";
import { formatKES, formatPhoneForWa } from "@/lib/format";
import type { Order, OrderStatus, Rider } from "@/types";

// ─── helpers moved to @/lib/orderHistory to satisfy Vite Fast Refresh ────────
const STORAGE_KEY = "recent_orders";

function saveOrderToHistory(orderId: string) {
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const updated = [orderId, ...existing.filter((id) => id !== orderId)].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* silently ignore */ }
}

const STEPS: { key: OrderStatus; label: string; icon: React.ReactNode; description: string }[] = [
  { key: "received",         label: "Order received",   icon: <CheckCircle2 className="h-5 w-5" />, description: "We've received your order and it's being reviewed."     },
  { key: "preparing",        label: "Preparing",        icon: <ChefHat className="h-5 w-5" />,      description: "Your order is being packed and prepared for dispatch."  },
  { key: "out_for_delivery", label: "Out for delivery", icon: <Bike className="h-5 w-5" />,         description: "Your order is on its way to you!"                      },
  { key: "delivered",        label: "Delivered",        icon: <HomeIcon className="h-5 w-5" />,     description: "Your order has been delivered. Thank you!"             },
];

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder]                   = useState<Order | null>(null);
  const [rider, setRider]                   = useState<Rider | null>(null);
  const [confirming, setConfirming]         = useState(false);
  const [hoveredStar, setHoveredStar]       = useState(0);
  const [selectedStar, setSelectedStar]     = useState(0);
  const [ratingSubmitted, setRatingSubmitted]   = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  // Subscribe to order changes
  useEffect(() => {
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

  // Fetch rider directly from Supabase whenever rider_id changes
  useEffect(() => {
    if (!order?.rider_id) {
      setRider(null);
      return;
    }
    // If the join already populated order.rider, use it directly
    if (order.rider) {
      setRider(order.rider as Rider);
      return;
    }
    // Otherwise fetch explicitly by rider_id
    if (!supabase) return;
    supabase
      .from("riders")
      .select("*")
      .eq("id", order.rider_id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setRider(data as Rider);
      });
  }, [order?.rider_id, order?.rider]);

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
          Loading order…
        </div>
      </div>
    );
  }

  const currentIdx  = STEPS.findIndex((s) => s.key === order.status);
  const currentStep = STEPS[currentIdx];
  const isOutForDelivery = order.status === "out_for_delivery";
  const isDelivered      = order.status === "delivered";

  const waMessage = encodeURIComponent(
    `Hi ${PHARMACY_CONFIG.name}, I'm checking on my order #${order.id.slice(-6).toUpperCase()} (Total: ${formatKES(order.total)}).`,
  );

  const handleConfirmDelivery = async () => {
    if (confirming) return;
    setConfirming(true);
    await confirmDelivery(order.id);
    setConfirming(false);
  };

  const handleStarClick = async (star: number) => {
    if (ratingSubmitted || submittingRating) return;
    setSelectedStar(star);
    setSubmittingRating(true);
    await submitRating(order.id, star);
    setRatingSubmitted(true);
    setSubmittingRating(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-8">

        {/* Order header card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Order</div>
              <div className="font-display text-2xl font-semibold">#{order.id.slice(-6).toUpperCase()}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Placed {new Date(order.created_at).toLocaleString()}
              </div>
            </div>
            <a
              href={`https://wa.me/${PHARMACY_CONFIG.whatsapp}?text=${waMessage}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          {/* Current status callout */}
          <div className={`mt-5 rounded-xl border px-4 py-3 ${isDelivered ? "bg-green-50 border-green-200" : "bg-primary-soft border-primary/20"}`}>
            <div className={`text-sm font-semibold ${isDelivered ? "text-green-700" : "text-primary"}`}>
              {currentStep?.label}
            </div>
            <div className={`mt-0.5 text-xs ${isDelivered ? "text-green-600" : "text-primary/70"}`}>
              {currentStep?.description}
            </div>
          </div>

          {/* Progress stepper */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-secondary" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="absolute left-0 top-5 h-1 rounded-full bg-primary"
              />
              <div className="relative grid grid-cols-4">
                {STEPS.map((s, i) => {
                  const done = i <= currentIdx;
                  return (
                    <div key={s.key} className="flex flex-col items-center text-center">
                      <motion.div
                        initial={false}
                        animate={done ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.3 }}
                        className={`grid h-11 w-11 place-items-center rounded-full border-2 transition-colors ${
                          done
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {s.icon}
                      </motion.div>
                      <div className={`mt-2 text-[11px] font-medium md:text-xs ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {s.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONFIRM DELIVERY CARD — shows when out for delivery ── */}
        <AnimatePresence>
          {isOutForDelivery && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-5"
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600">
                  <Bike className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-violet-800">Your order is on the way!</div>
                  <div className="mt-0.5 text-xs text-violet-600">
                    Once you receive your medicine, tap below to confirm delivery.
                  </div>
                </div>
              </div>

              {/* Rider contact card */}
              {rider ? (
                <div className="mt-4 rounded-xl border border-violet-200 bg-white p-3">
                  <div className="mb-2 text-[11px] uppercase tracking-wide text-violet-400 font-medium">
                    Your delivery rider
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700 font-bold text-base">
                      {rider.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground leading-tight">
                        {rider.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {rider.phone}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`tel:${rider.phone}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-violet-200 bg-white py-2.5 text-xs font-semibold text-violet-700 hover:bg-violet-50 transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call rider
                    </a>
                    <a
                      href={`https://wa.me/${formatPhoneForWa(rider.phone)}`}
                      target="_blank" rel="noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#25D366] py-2.5 text-xs font-semibold text-white hover:bg-[#1ebe5d] transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp rider
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-violet-100 bg-white/60 px-3 py-2.5 text-xs text-violet-500">
                  Rider details will appear here once assigned.
                </div>
              )}

              {/* Confirm button */}
              <button
                onClick={handleConfirmDelivery}
                disabled={confirming}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60 transition-colors"
              >
                {confirming ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {confirming ? "Confirming…" : "I have received my order"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RATING CARD — shows after delivered ── */}
        <AnimatePresence>
          {isDelivered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5"
            >
              <div className="flex items-center gap-2 text-green-700">
                <PartyPopper className="h-5 w-5 shrink-0" />
                <span className="font-semibold">Order delivered!</span>
              </div>

              {ratingSubmitted ? (
                <div className="mt-3 text-center">
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-7 w-7 ${i < selectedStar ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                    ))}
                  </div>
                  <div className="mt-2 text-sm font-medium text-green-700">Thanks for your rating!</div>
                  <div className="mt-0.5 text-xs text-green-600">We appreciate your feedback.</div>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="text-sm font-medium text-green-800">How was your experience?</div>
                  <div className="mt-1 text-xs text-green-600">Tap a star to rate your order</div>
                  <div className="mt-3 flex justify-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const star = i + 1;
                      const filled = star <= (hoveredStar || selectedStar);
                      return (
                        <button
                          key={star}
                          onMouseEnter={() => setHoveredStar(star)}
                          onMouseLeave={() => setHoveredStar(0)}
                          onClick={() => handleStarClick(star)}
                          disabled={submittingRating}
                          className="transition-transform hover:scale-110 disabled:opacity-60"
                        >
                          <Star className={`h-9 w-9 transition-colors ${filled ? "fill-amber-400 text-amber-400" : "text-border hover:text-amber-300"}`} />
                        </button>
                      );
                    })}
                  </div>
                  {submittingRating && (
                    <div className="mt-2 text-center text-xs text-muted-foreground">Saving…</div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order details */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="font-display text-base font-semibold">Items</div>
            <div className="mt-3 space-y-2 text-sm">
              {order.items.map((it) => (
                <div key={it.product_id} className="flex justify-between text-muted-foreground">
                  <span>{it.quantity} × {it.name}</span>
                  <span className="text-foreground">{formatKES(it.price * it.quantity)}</span>
                </div>
              ))}
              <div className="my-2 border-t border-border" />
              <div className="flex justify-between"><span>Subtotal</span><span>{formatKES(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatKES(order.delivery_fee)}</span></div>
              <div className="mt-1 flex justify-between text-base font-semibold">
                <span>Total</span><span>{formatKES(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="font-display text-base font-semibold">Delivery</div>
            <div className="mt-3 space-y-1 text-sm">
              <div><span className="text-muted-foreground">To: </span>{order.customer_name}</div>
              <div><span className="text-muted-foreground">Phone: </span>{order.customer_phone}</div>
              <div><span className="text-muted-foreground">Address: </span>{order.delivery_address}</div>
              <div>
                <span className="text-muted-foreground">Payment: </span>
                {order.payment_method === "mpesa" ? "M-Pesa" : "Pay on delivery"}
              </div>
              {order.special_instructions && (
                <div className="mt-2 rounded-lg bg-surface p-3 text-xs text-muted-foreground">
                  {order.special_instructions}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-center text-xs text-muted-foreground">
          💡 Bookmark this page or save the link to check your order anytime — no account needed.
        </div>

      </section>
      <Footer />
    </div>
  );
}