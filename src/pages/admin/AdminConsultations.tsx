import { useState } from "react";
import { Phone, MessageCircle } from "lucide-react";
import type { Consultation, ConsultationStatus } from "@/types";
import { PHARMACY_CONFIG } from "@/config";
import { formatKES, formatPhoneForWa } from "@/lib/format";
import { CARD, EMPTY, chip } from "./shared";

const CONSULTATION_STATUS_META: Record<
  ConsultationStatus,
  { label: string; color: string; bg: string; dot: string }
> = {
  awaiting_payment: { label: "Awaiting payment",  color: "text-muted-foreground", bg: "bg-surface border-[var(--color-hairline)]", dot: "bg-muted-foreground/50" },
  paid:             { label: "Paid — call needed", color: "text-sky-700",          bg: "bg-sky-50/80 border-sky-100",       dot: "bg-sky-500" },
  assigned:         { label: "Assigned",           color: "text-amber-700",        bg: "bg-amber-50/80 border-amber-100",   dot: "bg-amber-500" },
  in_progress:      { label: "Call in progress",   color: "text-violet-700",       bg: "bg-violet-50/80 border-violet-100", dot: "bg-violet-500" },
  completed:        { label: "Completed",          color: "text-emerald-700",      bg: "bg-emerald-50/80 border-emerald-100", dot: "bg-emerald-500" },
  cancelled:        { label: "Cancelled",          color: "text-destructive",      bg: "bg-destructive/10 border-destructive/30", dot: "bg-destructive" },
};

function ConsultationCard({
  c, onStatusChange, onSaveNotes,
}: {
  c: Consultation;
  onStatusChange: (id: string, s: ConsultationStatus) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
}) {
  const [notes, setNotes] = useState(c.notes_from_doctor ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updating, setUpdating] = useState(false);
  const meta = CONSULTATION_STATUS_META[c.status];

  const advance = async (next: ConsultationStatus) => {
    setUpdating(true);
    await onStatusChange(c.id, next);
    setUpdating(false);
  };

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
          {new Date(c.created_at).toLocaleString()}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              #{c.id.slice(-6).toUpperCase()}
            </div>
            <div className="truncate font-display text-lg font-medium">{c.customer_name}</div>
            <div className="truncate text-sm text-muted-foreground">{c.customer_phone}</div>
            {c.doctor && (
              <div className="mt-1.5 text-xs text-muted-foreground">
                Doctor: {c.doctor.name} · {c.doctor.specialty}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <div className="font-display text-lg font-medium tracking-display">{formatKES(c.fee)}</div>
            <div className="text-xs text-muted-foreground">M-Pesa</div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-[var(--color-hairline)] bg-surface/60 p-3.5 text-sm text-foreground/90">
          {c.reason}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={`tel:${c.customer_phone}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-primary-soft"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/${formatPhoneForWa(c.customer_phone)}?text=${encodeURIComponent(
              `Hi ${c.customer_name}, this is ${PHARMACY_CONFIG.name} calling about your consultation.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>

          {c.status === "paid" && (
            <button
              onClick={() => advance("assigned")}
              disabled={updating}
              className="ml-auto rounded-full bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600 disabled:opacity-60"
            >
              {updating ? "…" : "Mark assigned"}
            </button>
          )}
          {c.status === "assigned" && (
            <button
              onClick={() => advance("in_progress")}
              disabled={updating}
              className="ml-auto rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60"
            >
              {updating ? "…" : "Mark call in progress"}
            </button>
          )}
          {c.status === "in_progress" && (
            <button
              onClick={() => advance("completed")}
              disabled={updating}
              className="ml-auto rounded-full bg-[var(--color-ink)] px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {updating ? "…" : "Mark completed"}
            </button>
          )}
          {(c.status === "paid" || c.status === "assigned") && (
            <button
              onClick={() => advance("cancelled")}
              disabled={updating}
              className="rounded-full border border-[var(--color-hairline)] px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              Cancel
            </button>
          )}
        </div>

        {(c.status === "in_progress" || c.status === "completed") && (
          <div className="mt-4 rounded-2xl border border-[var(--color-hairline)] bg-surface/60 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Doctor's notes
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Summary of the call, advice given…"
              className="w-full rounded-xl border border-[var(--color-hairline)] bg-card p-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <button
              onClick={async () => { setSavingNotes(true); await onSaveNotes(c.id, notes); setSavingNotes(false); }}
              disabled={savingNotes || notes === (c.notes_from_doctor ?? "")}
              className="mt-2.5 rounded-full bg-[var(--color-ink)] px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {savingNotes ? "Saving…" : "Save notes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function ConsultationsPanel({
  consultations, onStatusChange, onSaveNotes,
}: {
  consultations: Consultation[];
  onStatusChange: (id: string, s: ConsultationStatus) => Promise<void>;
  onSaveNotes: (id: string, notes: string) => Promise<void>;
}) {
  const [filter, setFilter] = useState<ConsultationStatus | "all">("all");
  const list = consultations.filter((c) => filter === "all" || c.status === filter);
  const ALL_STATUSES: ConsultationStatus[] = ["paid", "assigned", "in_progress", "completed", "cancelled"];

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setFilter("all")} className={chip(filter === "all")}>
          All · {consultations.length}
        </button>
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={chip(filter === s)}>
            {CONSULTATION_STATUS_META[s].label} · {consultations.filter((c) => c.status === s).length}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className={EMPTY}>No consultations to show.</div>
      ) : (
        <div className="space-y-4">
          {list.map((c) => (
            <ConsultationCard key={c.id} c={c} onStatusChange={onStatusChange} onSaveNotes={onSaveNotes} />
          ))}
        </div>
      )}
    </div>
  );
}