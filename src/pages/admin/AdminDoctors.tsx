import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ImagePlus, Loader2, Pencil } from "lucide-react";
import { uploadDoctorPhoto } from "@/lib/api";
import { formatKES } from "@/lib/format";
import { DOCTOR_CATEGORIES } from "@/lib/specialties";
import type { Doctor } from "@/types";
import { FIELD, BTN_PRIMARY, BTN_GHOST, CARD, EMPTY } from "./shared";

export function DoctorsPanel({
  doctors, onAdd, onUpdate, onToggle, onDelete,
}: {
  doctors: Doctor[];
  onAdd: (d: Omit<Doctor, "id" | "created_at">) => void;
  onUpdate: (id: string, patch: Omit<Doctor, "id" | "created_at">) => Promise<void> | void;
  onToggle: (id: string, v: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Doctor, "id" | "created_at">>({
    name: "", specialty: "", bio: "", photo_url: "", consultation_fee: 0, is_available: true,
  });

  const resetForm = () => {
    setForm({ name: "", specialty: "", bio: "", photo_url: "", consultation_fee: 0, is_available: true });
    setPhotoError(null);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditingId(null);
    resetForm();
  };

  const openEdit = (doc: Doctor) => {
    setForm({
      name: doc.name,
      specialty: doc.specialty,
      bio: doc.bio ?? "",
      photo_url: doc.photo_url ?? "",
      consultation_fee: doc.consultation_fee,
      is_available: doc.is_available,
    });
    setPhotoError(null);
    setEditingId(doc.id);
    setShowAdd(true);
  };

  const handlePhotoSelect = async (file: File | undefined) => {
    if (!file) return;
    setPhotoError(null);
    setUploadingPhoto(true);
    try {
      const url = await uploadDoctorPhoto(file);
      setForm((f) => ({ ...f, photo_url: url }));
    } catch (e) {
      console.error(e);
      setPhotoError("Could not upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAdd = async () => {
    if (!form.name || !form.specialty || !form.consultation_fee) return;
    setSaving(true);
    try {
      if (editingId) await onUpdate(editingId, form);
      else await onAdd(form);
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{doctors.length} doctors</div>
        <button onClick={() => setShowAdd(true)} className={BTN_PRIMARY}>
          <Plus className="h-4 w-4" /> Add doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <div className={EMPTY}>No doctors yet. Add one so customers can book consultations.</div>
      ) : (
        <div className={CARD}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface/70 text-left text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Doctor</th>
                  <th className="px-5 py-3.5 font-medium">Specialty</th>
                  <th className="px-5 py-3.5 font-medium">Fee</th>
                  <th className="px-5 py-3.5 font-medium">Available</th>
                  <th className="px-5 py-3.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr
                    key={d.id}
                    className="border-t border-[var(--color-hairline)] transition-colors hover:bg-surface/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {d.photo_url ? (
                          <img
                            src={d.photo_url}
                            alt={d.name}
                            className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--color-hairline)]"
                          />
                        ) : (
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                            {d.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{d.specialty}</td>
                    <td className="px-5 py-3.5">{formatKES(d.consultation_fee)}</td>
                    <td className="px-5 py-3.5">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={d.is_available}
                          onChange={(e) => onToggle(d.id, e.target.checked)}
                          className="h-4 w-4 accent-[var(--color-primary)]"
                        />
                        <span className={d.is_available ? "text-primary" : "text-muted-foreground"}>
                          {d.is_available ? "Available" : "Off"}
                        </span>
                      </label>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(d)}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </button>
                      {confirmDeleteId === d.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Sure?</span>
                          <button
                            onClick={() => handleDelete(d.id)}
                            disabled={deletingId === d.id}
                            className="rounded-full bg-destructive px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-60"
                          >
                            {deletingId === d.id ? "…" : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-full border border-[var(--color-hairline)] px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(d.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline)] px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
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

      {showAdd && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-ink)]/40 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-[var(--color-hairline)] bg-card p-6 shadow-[var(--shadow-ambient)]"
          >
            <div className="font-display text-xl font-medium tracking-display">{editingId ? "Edit doctor" : "Add doctor"}</div>
            <div className="mt-5 grid gap-3">
              <input
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={FIELD}
              />
              <select
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                className={`${FIELD} ${form.specialty ? "" : "text-muted-foreground"}`}
              >
                <option value="" disabled>Select category</option>
                {DOCTOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Consultation fee (KES)"
                value={form.consultation_fee || ""}
                onChange={(e) => setForm({ ...form, consultation_fee: Number(e.target.value) })}
                className={FIELD}
              />

              <div>
                <div className="mb-2 text-sm font-medium">Photo (optional)</div>
                <div className="flex items-center gap-3">
                  {form.photo_url ? (
                    <img
                      src={form.photo_url}
                      alt="Preview"
                      className="h-14 w-14 rounded-full object-cover ring-1 ring-[var(--color-hairline)]"
                    />
                  ) : (
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-hairline)] px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary">
                    {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    {uploadingPhoto ? "Uploading…" : form.photo_url ? "Replace photo" : "Upload photo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingPhoto}
                      onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
                    />
                  </label>
                </div>
                {photoError && <p className="mt-1.5 text-xs text-destructive">{photoError}</p>}
              </div>

              <textarea
                placeholder="Short bio (optional)"
                rows={3}
                value={form.bio ?? ""}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="rounded-xl border border-[var(--color-hairline)] bg-card p-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeModal} className={BTN_GHOST}>
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!form.name || !form.specialty || !form.consultation_fee || saving || uploadingPhoto}
                className={BTN_PRIMARY}
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}