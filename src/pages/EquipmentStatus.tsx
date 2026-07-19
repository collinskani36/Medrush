import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, PackageSearch, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { StkPushModal } from "@/components/StkPushModal";
import { fetchEquipmentRequest, updateEquipmentRequestStatus } from "@/lib/api";
import { formatKES } from "@/lib/format";
import type { EquipmentRequest } from "@/types";

export default function EquipmentStatus() {
  const { id } = useParams<{ id: string }>();
  const [req, setReq] = useState<EquipmentRequest | null | undefined>(undefined);
  const [showStk, setShowStk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    if (!id) return;
    fetchEquipmentRequest(id).then(setReq);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const accept = async () => {
    if (!req) return;
    setSubmitting(true);
    try {
      await updateEquipmentRequestStatus(req.id, "accepted");
      setShowStk(false);
      load();
    } catch (e) {
      console.error(e);
      alert("Could not confirm payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reject = async () => {
    if (!req) return;
    await updateEquipmentRequestStatus(req.id, "rejected");
    load();
  };

  if (req === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center text-muted-foreground">Request not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-2xl px-4 py-8">
        <Link to="/equipment/request" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> New request
        </Link>

        <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-primary">
            <PackageSearch className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              #{req.id.slice(-6).toUpperCase()}
            </span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold">{req.item_description}</h1>
          <div className="mt-1 text-sm text-muted-foreground">Quantity: {req.quantity}</div>

          {req.status === "pending" && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
              <Clock className="h-4 w-4 shrink-0" />
              We're preparing your quotation. Check back shortly — we'll also call {req.customer_phone}.
            </div>
          )}

          {req.status === "quoted" && (
            <div className="mt-6 rounded-xl border border-primary/30 bg-primary-soft p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your quotation</div>
              <div className="mt-1 font-display text-3xl font-semibold text-primary">{formatKES(req.quoted_price!)}</div>
              {req.quote_notes && <p className="mt-2 text-sm text-foreground/80">{req.quote_notes}</p>}
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={() => setShowStk(true)}
                  className="flex-1 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.02]"
                >
                  Accept &amp; pay with M-Pesa
                </button>
                <button
                  onClick={reject}
                  className="rounded-full border border-border px-5 py-3 text-sm font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {req.status === "accepted" && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Payment confirmed — we're arranging delivery to {req.delivery_address}.
            </div>
          )}

          {req.status === "fulfilled" && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Delivered. Thanks for ordering with us!
            </div>
          )}

          {req.status === "rejected" && (
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-surface border border-border p-4 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 shrink-0" />
              You declined this quotation.
            </div>
          )}

          {req.notes && (
            <div className="mt-5 border-t border-border pt-4 text-sm">
              <span className="text-muted-foreground">Your notes: </span>{req.notes}
            </div>
          )}
        </div>
      </section>

      {req.quoted_price != null && (
        <StkPushModal
          open={showStk}
          phone={req.customer_phone}
          amount={req.quoted_price}
          submitting={submitting}
          onConfirm={accept}
          onCancel={() => setShowStk(false)}
        />
      )}

      <Footer />
    </div>
  );
}
