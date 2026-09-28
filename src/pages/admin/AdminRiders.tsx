import { useState } from "react";
import { Bike as BikeIcon, Phone, Plus, Trash2 } from "lucide-react";
import type { Rider } from "@/types";
import { FIELD, BTN_PRIMARY, CARD, EMPTY, SectionHeading } from "./shared";

export function RidersPanel({
  riders, onAdd, onDelete,
}: {
  riders: Rider[];
  onAdd: (r: { name: string; phone: string }) => void;
  onDelete: (id: string) => void;
}) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!form.name || !form.phone) return;
    setSaving(true);
    await onAdd(form);
    setForm({ name: "", phone: "" });
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        icon={<BikeIcon className="h-5 w-5" />}
        title="Riders"
        subtitle="Add your delivery riders here — they can then be assigned to orders above."
      />

      <div className={`${CARD} p-6`}>
        <div className="font-display text-base font-medium">Add rider</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`${FIELD} min-w-[160px] flex-1`}
          />
          <input
            placeholder="Phone (e.g. 0712345678)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className={`${FIELD} min-w-[160px] flex-1`}
          />
          <button onClick={handleAdd} disabled={saving || !form.name || !form.phone} className={BTN_PRIMARY}>
            <Plus className="h-4 w-4" /> {saving ? "Adding…" : "Add"}
          </button>
        </div>
      </div>

      {riders.length === 0 ? (
        <div className={EMPTY}>No riders yet. Add one above to start assigning deliveries.</div>
      ) : (
        <div className={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface/70 text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Rider</th>
                  <th className="px-5 py-3.5 font-medium">Phone</th>
                  <th className="px-5 py-3.5 font-medium">Added</th>
                  <th className="px-5 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {riders.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-[var(--color-hairline)] transition-colors hover:bg-surface/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                          {r.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.phone}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${r.phone}`}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          <Phone className="h-3.5 w-3.5" /> Call
                        </a>
                        {confirmDeleteId === r.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Sure?</span>
                            <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deletingId === r.id}
                              className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              {deletingId === r.id ? "…" : "Yes"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="rounded-full border border-[var(--color-hairline)] px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(r.id)}
                            className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}