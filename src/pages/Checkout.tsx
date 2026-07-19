import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Banknote } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { PHARMACY_CONFIG } from "@/config";
import { formatKES } from "@/lib/format";
import { createOrder } from "@/lib/api";
import { StkPushModal } from "@/components/StkPushModal";

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [rxName, setRxName] = useState<string | null>(null);
  const [method, setMethod] = useState<"mpesa" | "cod">("mpesa");
  const [showStk, setShowStk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("medrush_checkout");
      if (raw) {
        const d = JSON.parse(raw);
        setAddress(d.address ?? "");
        setNotes(d.notes ?? "");
        setRxName(d.rxName ?? null);
      }
    } catch {}
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
          quantity: i.quantity,
        })),
        prescription_url: rxName ? `uploads/${rxName}` : null,
        subtotal,
        delivery_fee: PHARMACY_CONFIG.deliveryFee,
        total,
        payment_method: method,
        special_instructions: notes || null,
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
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">
          Your cart is empty.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Checkout</h1>

        <div className="mt-8 space-y-6">
          <Card title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="John Doe" />
              </Field>
              <Field label="Phone (07XXXXXXXX)">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={input} placeholder="0712345678" />
              </Field>
            </div>
            {phone && !phoneOk && (
              <p className="mt-2 text-xs text-destructive">Use a Kenyan format: 07XXXXXXXX</p>
            )}
          </Card>

          <Card title="Delivery">
            <Field label="Address">
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={input} placeholder="Apartment, street, area" />
            </Field>
          </Card>

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
                subtitle="Cash when courier arrives"
              />
            </div>
          </Card>

          <Card title="Order summary">
            <div className="space-y-2 text-sm">
              {items.map((i) => (
                <div key={i.product.id} className="flex justify-between text-muted-foreground">
                  <span>{i.quantity} × {i.product.name}</span>
                  <span>{formatKES(i.product.price * i.quantity)}</span>
                </div>
              ))}
              <div className="my-2 border-t border-border" />
              <div className="flex justify-between"><span>Subtotal</span><span>{formatKES(subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatKES(PHARMACY_CONFIG.deliveryFee)}</span></div>
              <div className="mt-2 flex justify-between text-base font-semibold"><span>Total</span><span>{formatKES(total)}</span></div>
            </div>
          </Card>

          <button
            onClick={handleProceed}
            disabled={!name || !phoneOk || !address || submitting}
            className="w-full rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {submitting ? "Placing order…" : method === "mpesa" ? `Pay ${formatKES(total)} with M-Pesa` : `Place order · ${formatKES(total)}`}
          </button>
        </div>
      </section>

      <StkPushModal
        open={showStk}
        phone={phone}
        amount={total}
        submitting={submitting}
        onConfirm={submitOrder}
        onCancel={() => setShowStk(false)}
      />

      <Footer />
    </div>
  );
}

const input = "h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary";

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

function PaymentOption({ active, onClick, icon, title, subtitle }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
        active ? "border-primary bg-primary-soft" : "border-border bg-card hover:border-primary"
      }`}
    >
      <div className={`grid h-10 w-10 place-items-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>{icon}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </button>
  );
}