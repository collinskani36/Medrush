import { useState } from "react";
import { Phone } from "lucide-react";
import type { EquipmentRequest, EquipmentRequestStatus } from "@/types";
import { formatKES } from "@/lib/format";
import { CARD, EMPTY, FIELD, chip, LocationBadge } from "./shared";

const EQUIPMENT_STATUS_META: Record<
  EquipmentRequestStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  pending:   { label: "Needs quote", color: "text-sky-700",          bg: "bg-sky-50/80 border-sky-100",         dot: "bg-sky-500" },
  quoted:    { label: "Quoted",      color: "text-amber-700",        bg: "bg-amber-50/80 border-amber-100",     dot: "bg-amber-500" },
  accepted:  { label: "Accepted",    color: "text-violet-700",       bg: "bg-violet-50/80 border-violet-100",   dot: "bg-violet-500" },
  fulfilled: { label: "Fulfilled",   color: "text-emerald-700",      bg: "bg-emerald-50/80 border-emerald-100", dot: "bg-emerald-500" },
  rejected:  { label: "Declined",    color: "text-muted-foreground", bg: "bg-surface border-[var(--color-hairline)]", dot: "bg-muted-foreground/50" },
};

function EquipmentCard({
  r, onQuote, onStatusChange,
}: {
  r: EquipmentRequest;
  onQuote: (id: string, price: number, notes: string | null) => Promise<void>;
  onStatusChange: (id: string, s: EquipmentRequestStatus) => Promise<void>;
}) {
  const [price, setPrice] = useState(r.quoted_price?.toString() ?? "");
  const [quoteNotes, setQuoteNotes] = useState(r.quote_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const meta = EQUIPMENT_STATUS_META[r.status];

  return (
    <div className={CARD}>
      <div className="flex items-center gap-2.5 border-b border-[var(--color-hairline)] px-5 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
        <span className="ml-auto text-[10px] font-normal text-muted-foreground">
          {new Date(r.created_at).toLocaleString()}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              #{r.id.slice(-6).toUpperCase()}
            </div>
            <div className="truncate font-display text-lg font-medium">{r.customer_name}</div>
            <div className="truncate text-sm text-muted-foreground">
              {r.customer_phone} · {r.delivery_address}
            </div>
            <LocationBadge
              distanceKm={r.distance_km}
              lat={r.delivery_lat}
              lng={r.delivery_lng}
              className="mt-1"
            />
          </div>
          <div className="shrink-0 text-right text-sm text-muted-foreground">Qty: {r.quantity}</div>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--color-hairline)] bg-surface/60 p-3.5 text-sm text-foreground/90">
          {r.item_description}
        </div>
        {r.notes && <div className="mt-2 text-xs text-muted-foreground">Note: {r.notes}</div>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={`tel:${r.customer_phone}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary-soft"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        </div>

        {(r.status === "pending" || r.status === "quoted") && (
          <div className="mt-4 rounded-2xl border border-[var(--color-hairline)] bg-surface/60 p-4">
            <div className="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {r.status === "pending" ? "Send a quote" : "Update quote"}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="number"
                placeholder="Price (KES)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={`${FIELD} w-40`}
              />
              <input
                placeholder="Notes (lead time, terms…)"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                className={`${FIELD} min-w-[160px] flex-1`}
              />
              <button
                onClick={async () => { setSaving(true); await onQuote(r.id, Number(price), quoteNotes || null); setSaving(false); }}
                disabled={saving || !price || Number(price) <= 0}
                className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Sending…" : "Send quote"}
              </button>
            </div>
          </div>
        )}

        {r.status === "accepted" && (
          <button
            onClick={async () => { setUpdating(true); await onStatusChange(r.id, "fulfilled"); setUpdating(false); }}
            disabled={updating}
            className="mt-4 w-full rounded-xl bg-[var(--color-ink)] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {updating ? "Updating…" : "Mark as delivered"}
          </button>
        )}
      </div>
    </div>
  );
}

export function EquipmentPanel({
  requests, onQuote, onStatusChange,
}: {
  requests: EquipmentRequest[];
  onQuote: (id: string, price: number, notes: string | null) => Promise<void>;
  onStatusChange: (id: string, s: EquipmentRequestStatus) => Promise<void>;
}) {
  const [filter, setFilter] = useState<EquipmentRequestStatus | "all">("all");
  const list = requests.filter((r) => filter === "all" || r.status === filter);
  const ALL_STATUSES: EquipmentRequestStatus[] = ["pending", "quoted", "accepted", "fulfilled", "rejected"];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={chip(filter === "all")}>
          All · {requests.length}
        </button>
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={chip(filter === s)}>
            {EQUIPMENT_STATUS_META[s].label} · {requests.filter((r) => r.status === s).length}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className={EMPTY}>No equipment requests to show.</div>
      ) : (
        <div className="space-y-4">
          {list.map((r) => (
            <EquipmentCard key={r.id} r={r} onQuote={onQuote} onStatusChange={onStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}