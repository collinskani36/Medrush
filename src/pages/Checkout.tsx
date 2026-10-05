import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Smartphone, Banknote, KeyRound } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { formatKES } from "@/lib/format";
import { createOrder, startStkPush } from "@/lib/api";
import { StkPushModal } from "@/components/StkPushModal";
import LocationPicker from "@/components/LocationPicker";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PinLocation {
  lat: number;
  lng: number;
  address: string;
  distanceKm: number; // client-side estimate — display only
  fee: number;        // client-side estimate — display only
}

// "manual" = customer/tester types an M-Pesa receipt code instead of an STK push.
// It is stored in the DB as payment_method "mpesa" + payment_status "pending_verification".
type PayMethod = "mpesa" | "cod" | "manual";

// Dev/test gate: set VITE_ENABLE_MANUAL_MPESA=true in your local .env only.
const MANUAL_MPESA_ENABLED = import.meta.env.VITE_ENABLE_MANUAL_MPESA === "true";

// ─── Component ───────────────────────────────────────────────────────────────

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [notes, setNotes]       = useState("");
  const [method, setMethod]     = useState<PayMethod>("mpesa");
  const [mpesaCode, setMpesaCode] = useState("");
  const [showStk, setShowStk]           = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);

  // Location state
  const [pinLocation, setPinLocation] = useState<PinLocation | null>(null);
  const [description, setDescription] = useState("");

  // Set to true the moment the order is saved, BEFORE the cart is cleared.
  // An empty cart after a successful order is expected, so the empty-cart
  // redirect/early-return below must not fire. A ref (not state) is used so
  // the value is already correct on the very next render, with no extra tick.
  const orderPlaced = useRef(false);
  // Blocks double submits (e.g. StkPushModal calling onSuccess twice).
  const inFlight = useRef(false);
  // The unpaid M-Pesa order for the current form contents, so a retry after a
  // cancelled/failed prompt re-sends the push for the SAME order instead of
  // creating a duplicate. `sig` detects if the customer changed anything.
  const pendingOrder = useRef<{ id: string; sig: string } | null>(null);

  useEffect(() => {
    if (items.length === 0 && !submitting && !orderPlaced.current) navigate("/cart");
  }, [items, submitting, navigate]);

  // ── Derived totals ────────────────────────────────────────────────────────

  const deliveryFee   = pinLocation?.fee ?? 0;
  const safeSubtotal  = Number(subtotal) || 0;
  const total         = safeSubtotal + deliveryFee;

  const phoneOk          = /^0\d{9}$/.test(phone);
  const codeOk           = /^[A-Z0-9]{10}$/.test(mpesaCode); // M-Pesa receipts are 10 chars
  const hasValidDelivery = pinLocation !== null;
  const canProceed =
    !!name &&
    phoneOk &&
    hasValidDelivery &&
    !submitting &&
    (method !== "manual" || codeOk);

  // ── Order submission ──────────────────────────────────────────────────────

  // M-Pesa flow:  create order (unpaid) → STK push for that order → customer pays
  //               → server marks it paid → onSuccess → tracking page.
  // COD / manual: create order → tracking page.

  const buildOrderInput = (
    paymentStatus: "pending" | "pending_verification",
  ): Parameters<typeof createOrder>[0] => {
    return {
      customer_name:    name,
      customer_phone:   phone,
      // Combine geocoded address with the optional landmark hint
      delivery_address: description
        ? `${pinLocation!.address} (${description})`
        : pinLocation!.address,
      items: items.map((i) => ({
        product_id: i.product.id,
        name:       i.product.name,
        price:      i.product.price,
        quantity:   i.quantity,
      })),
      prescription_url: null,
      subtotal:         safeSubtotal,
      delivery_fee:     deliveryFee,
      total,
      // DB check constraint only allows 'mpesa' | 'cod'
      payment_method:   method === "manual" ? "mpesa" : method,
      payment_status:   paymentStatus,
      mpesa_code:       method === "manual" ? mpesaCode : null,
      special_instructions: notes || null,
      // ── Location columns ──
      delivery_lat:  pinLocation!.lat,
      delivery_lng:  pinLocation!.lng,
      distance_km:   pinLocation!.distanceKm,
    };
  };

  // Order is saved (and, for M-Pesa, paid). From here on an empty cart is
  // expected, so mark it BEFORE clearing — see the orderPlaced ref above.
  const finishOrder = (orderId: string) => {
    if (orderPlaced.current) return;
    orderPlaced.current = true;
    setShowStk(false);
    clear();
    // replace: Back from the tracking page shouldn't return to checkout.
    // submitting is intentionally left as-is on success — this page is about
    // to unmount, and resetting it would re-expose the empty-cart UI.
    navigate(`/order/${orderId}`, { replace: true });
  };

  // Pay on delivery, or a manually typed M-Pesa code.
  const submitOrder = async () => {
    if (!pinLocation || inFlight.current || orderPlaced.current) return;
    inFlight.current = true;
    setSubmitting(true);
    try {
      const order = await createOrder(
        buildOrderInput(method === "manual" ? "pending_verification" : "pending"),
      );
      finishOrder(order.id);
    } catch (e) {
      console.error(e);
      inFlight.current = false;
      setSubmitting(false);
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("orders_mpesa_code_unique")) {
        alert("That M-Pesa code has already been used on another order.");
      } else {
        alert("Could not place order. Please try again.");
      }
    }
  };

  // M-Pesa STK push.
  const startMpesa = async () => {
    if (!pinLocation || inFlight.current || orderPlaced.current) return;
    inFlight.current = true;
    setSubmitting(true);
    setCheckoutRequestId(null);
    setShowStk(true); // shows "Sending prompt…" while we create the order + push
    try {
      const input = buildOrderInput("pending");
      const sig = JSON.stringify(input);

      let orderId = pendingOrder.current?.sig === sig ? pendingOrder.current.id : null;
      if (!orderId) {
        const order = await createOrder(input);
        orderId = order.id;
        pendingOrder.current = { id: order.id, sig };
      }

      const { checkoutRequestId: id } = await startStkPush({
        phone,
        reference_type: "order",
        reference_id: orderId,
      });
      setCheckoutRequestId(id); // the modal starts polling for the result
    } catch (e) {
      console.error(e);
      setShowStk(false);
      alert(
        e instanceof Error && e.message
          ? e.message
          : "Could not start M-Pesa payment. Please try again.",
      );
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  };

  const handleProceed = () => {
    if (!canProceed) return;
    if (method === "mpesa") startMpesa();
    else submitOrder();
  };

  // ── Early-exit: empty cart ────────────────────────────────────────────────

  // Order saved, cart cleared, navigation to /order/:id in flight.
  if (orderPlaced.current) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
          Order placed — loading your tracking page…
        </div>
      </div>
    );
  }

  if (items.length === 0 && !submitting) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
          Your cart is empty.
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="mx-auto max-w-lg px-4 py-8 space-y-6">

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="font-display text-3xl font-semibold">Checkout</h1>

        {/* Contact */}
        <Card title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={input}
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Phone (07XXXXXXXX)">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={input}
                placeholder="0712345678"
              />
            </Field>
          </div>
          {phone && !phoneOk && (
            <p className="mt-2 text-xs text-destructive">
              Use a Kenyan format: 07XXXXXXXX
            </p>
          )}
        </Card>

        {/* Delivery location */}
        <Card title="Delivery Location">
          {pinLocation ? (
            // Confirmed location summary
            <div className="space-y-3">
              <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-sm text-foreground">{pinLocation.address}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ~{pinLocation.distanceKm.toFixed(1)} km · est. {formatKES(pinLocation.fee)} delivery
                  </p>
                </div>
              </div>

              <Field label="Landmark hint (optional)">
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={input}
                  placeholder="e.g. blue gate, near stage"
                />
              </Field>

              <button
                type="button"
                onClick={() => setPinLocation(null)}
                className="text-xs text-primary hover:opacity-75"
              >
                Change location
              </button>
            </div>
          ) : (
            // Map picker
            <LocationPicker
              onConfirm={(data) => {
                if (data.fee === null) return; // out of range — LocationPicker shows its own message
                setPinLocation({
                  lat:        data.lat,
                  lng:        data.lng,
                  address:    data.address,
                  distanceKm: data.distanceKm,
                  fee:        data.fee,
                });
              }}
            />
          )}
        </Card>

        {/* Payment method */}
        <Card title="Payment">
          <div className="grid gap-3 sm:grid-cols-2">
            <PaymentOption
              active={method === "mpesa"}
              onClick={() => setMethod("mpesa")}
              icon={<Smartphone className="h-5 w-5" />}
              title="M-Pesa"
              subtitle="STK push to your phone"
            />
            <PaymentOption
              active={method === "cod"}
              onClick={() => setMethod("cod")}
              icon={<Banknote className="h-5 w-5" />}
              title="Pay on delivery"
              subtitle="Cash when rider arrives"
            />
            {MANUAL_MPESA_ENABLED && (
              <PaymentOption
                active={method === "manual"}
                onClick={() => setMethod("manual")}
                icon={<KeyRound className="h-5 w-5" />}
                title="Enter M-Pesa code"
                subtitle="Test mode: skip STK push"
              />
            )}
          </div>

          {MANUAL_MPESA_ENABLED && method === "manual" && (
            <div className="mt-4">
              <Field label="M-Pesa code">
                <input
                  value={mpesaCode}
                  onChange={(e) =>
                    setMpesaCode(e.target.value.toUpperCase().replace(/\s/g, ""))
                  }
                  maxLength={10}
                  className={input}
                  placeholder="QGH7XYZ123"
                  autoCapitalize="characters"
                  autoComplete="off"
                />
              </Field>
              {mpesaCode && !codeOk && (
                <p className="mt-2 text-xs text-destructive">
                  Code is 10 letters/digits
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Order will be marked as awaiting payment verification.
              </p>
            </div>
          )}
        </Card>

        {/* Special instructions */}
        <Card title="Special Instructions">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Anything the pharmacy or rider should know…"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary resize-none"
          />
        </Card>

        {/* Order summary */}
        <Card title="Order Summary">
          <div className="space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.product.id} className="flex justify-between text-muted-foreground">
                <span>{i.quantity} × {i.product.name}</span>
                <span>{formatKES(i.product.price * i.quantity)}</span>
              </div>
            ))}
            <div className="my-2 border-t border-border" />
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatKES(safeSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery{pinLocation ? " (est.)" : ""}</span>
              <span>{pinLocation ? formatKES(deliveryFee) : "—"}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{pinLocation ? formatKES(total) : "—"}</span>
            </div>
            {pinLocation && (
              <p className="text-xs text-muted-foreground pt-1">
                Delivery fee is an estimate — the final amount is confirmed before payment.
              </p>
            )}
          </div>
        </Card>

        {/* CTA */}
        <button
          onClick={handleProceed}
          disabled={!canProceed}
          className="w-full rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {submitting
            ? "Placing order…"
            : !hasValidDelivery
            ? "Set delivery location to continue"
            : method === "mpesa"
            ? `Pay ${formatKES(total)} with M-Pesa`
            : method === "manual"
            ? codeOk
              ? `Place order with code · ${formatKES(total)}`
              : "Enter M-Pesa code to continue"
            : `Place order · ${formatKES(total)}`}
        </button>
      </section>

      <StkPushModal
        open={showStk}
        phone={phone}
        amount={total}
        submitting={submitting}
        checkoutRequestId={checkoutRequestId}
        onSuccess={() => {
          if (pendingOrder.current) finishOrder(pendingOrder.current.id);
        }}
        onCancel={() => {
          setShowStk(false);
          setCheckoutRequestId(null);
        }}
        onError={(msg) => {
          setShowStk(false);
          alert(msg);
        }}
      />

      <Footer />
    </div>
  );
}

// ─── Local sub-components ─────────────────────────────────────────────────────

const input =
  "h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 font-display text-base font-semibold">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="mb-1.5 font-medium">{label}</div>
      {children}
    </label>
  );
}

function PaymentOption({
  active, onClick, icon, title, subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
        active ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary"
      }`}
    >
      <div
        className={`grid h-10 w-10 place-items-center rounded-full ${
          active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
        }`}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </button>
  );
}