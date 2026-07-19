import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createEquipmentRequest } from "@/lib/api";

export default function EquipmentRequest() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const phoneOk = /^0\d{9}$/.test(phone);
  const canSubmit = !!name && phoneOk && !!address && itemDescription.trim().length >= 5 && quantity > 0;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const req = await createEquipmentRequest({
        customer_name: name,
        customer_phone: phone,
        delivery_address: address,
        item_description: itemDescription,
        quantity,
        notes: notes || null,
      });
      navigate(`/equipment/status/${req.id}`);
    } catch (e) {
      console.error(e);
      alert("Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center gap-2 text-primary">
          <PackageSearch className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-wide">Pharmaceutical equipment</span>
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Request a quotation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tell us what equipment you need — hospital beds, monitors, mobility aids, and more.
          We'll get back to you with pricing.
        </p>

        <div className="mt-6 space-y-6">
          <Card title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input value={name} onChange={(e) => setName(e.target.value)} className={input} placeholder="John Doe" />
              </Field>
              <Field label="Phone (07XXXXXXXX)">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={input} placeholder="0712345678" />
              </Field>
            </div>
            {phone && !phoneOk && <p className="mt-2 text-xs text-destructive">Use a Kenyan format: 07XXXXXXXX</p>}
            <div className="mt-4">
              <Field label="Delivery address">
                <input value={address} onChange={(e) => setAddress(e.target.value)} className={input} placeholder="Apartment, street, area" />
              </Field>
            </div>
          </Card>

          <Card title="What do you need?">
            <textarea
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              rows={4}
              placeholder="e.g. Adjustable hospital bed with side rails, or a digital blood pressure monitor"
              className="w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary"
            />
            <div className="mt-4 max-w-[160px]">
              <Field label="Quantity">
                <input
                  type="number" min={1} value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className={input}
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Additional notes (optional)">
                <textarea
                  value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                  placeholder="Preferred brand, budget range, urgency…"
                  className="w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary"
                />
              </Field>
            </div>
          </Card>

          <button
            onClick={submit}
            disabled={!canSubmit || submitting}
            className="w-full rounded-full bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            {submitting ? "Submitting…" : "Request quotation"}
          </button>
        </div>
      </section>
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
