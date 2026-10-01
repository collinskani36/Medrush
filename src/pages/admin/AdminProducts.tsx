import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Search, X, Upload, AlertTriangle,
  CheckCircle2, Loader2, FileText, ChevronDown, ImageOff, Pencil,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/config";
import { formatKES } from "@/lib/format";
import type { Product } from "@/types";
import { FIELD, BTN_PRIMARY, BTN_GHOST, EMPTY, chip, MiniStat } from "./shared";

/* ─── Products Panel ─────────────────────────────────────────────────────────── */

export function ProductsPanel({
  products, onToggle, onAdd, onUpdate, onDelete, onBulkAdd,
}: {
  products: Product[];
  onToggle: (id: string, v: boolean) => void;
  onAdd: (p: Omit<Product, "id" | "created_at">) => void;
  onUpdate: (id: string, patch: Omit<Product, "id" | "created_at">) => Promise<void> | void;
  onDelete: (id: string) => void;
  onBulkAdd: (rows: Omit<Product, "id" | "created_at">[]) => Promise<void>;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [form, setForm] = useState<Omit<Product, "id" | "created_at">>({
    name: "", description: "", price: 0, category: CATEGORIES[0], image_url: "", requires_prescription: false, in_stock: true,
  });

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: 0, category: CATEGORIES[0], image_url: "", requires_prescription: false, in_stock: true });
    setUploading(false);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditingId(null);
    resetForm();
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      description: p.description ?? "",
      price: p.price,
      category: p.category,
      image_url: p.image_url ?? "",
      requires_prescription: p.requires_prescription,
      in_stock: p.in_stock,
    });
    setEditingId(p.id);
    setShowAdd(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) await onUpdate(editingId, form);
      else await onAdd(form);
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" ||
      (categoryFilter === "__no_image" ? !p.image_url : p.category === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const inStockCount = products.filter((p) => p.in_stock).length;
  const rxCount = products.filter((p) => p.requires_prescription).length;
  const noImageCount = products.filter((p) => !p.image_url).length;
  const categoriesInUse = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div>
      {/* Summary strip */}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <MiniStat label="Total" value={products.length.toString()} />
        <MiniStat label="In stock" value={inStockCount.toString()} tone="positive" />
        <MiniStat label="Rx-only" value={rxCount.toString()} />
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className={`${FIELD} pl-10`}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <button onClick={() => setShowBulk(true)} className={BTN_GHOST}>
          <Upload className="h-4 w-4" /> Bulk upload
        </button>
        <button onClick={() => setShowAdd(true)} className={BTN_PRIMARY}>
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      {/* Category chips */}
      {categoriesInUse.length > 0 && (
        <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => setCategoryFilter("all")} className={chip(categoryFilter === "all")}>
            All · {products.length}
          </button>
          {noImageCount > 0 && (
            <button onClick={() => setCategoryFilter("__no_image")} className={chip(categoryFilter === "__no_image")}>
              No image · {noImageCount}
            </button>
          )}
          {categoriesInUse.map((c) => {
            const count = products.filter((p) => p.category === c).length;
            return (
              <button key={c} onClick={() => setCategoryFilter(c)} className={chip(categoryFilter === c)}>
                {c} · {count}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className={EMPTY}>
          {products.length === 0
            ? "No products yet. Add your first product to get started."
            : "No products match your filters."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-hairline)] bg-card shadow-[var(--shadow-ambient)]">
          {filtered.map((p) => {
            const hasImage = !!p.image_url;
            const open = expandedId === p.id;
            return (
              <div key={p.id} className="border-b border-[var(--color-hairline)] last:border-b-0">
                <div className="flex items-center gap-3 px-3 py-2.5 sm:px-4">
                  {/* Name / category / price — click to reveal image */}
                  <button
                    type="button"
                    onClick={() => hasImage && setExpandedId(open ? null : p.id)}
                    disabled={!hasImage}
                    aria-expanded={hasImage ? open : undefined}
                    className={`flex min-w-0 flex-1 items-center gap-3 text-left ${hasImage ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {hasImage ? (
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    ) : (
                      <ImageOff className="h-4 w-4 shrink-0 text-muted-foreground/40" aria-label="No image" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-display text-[13px] font-medium">{p.name}</span>
                        {p.requires_prescription && (
                          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[var(--color-ink)]/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                            <FileText className="h-2.5 w-2.5" /> Rx
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                        {p.category}
                      </div>
                    </div>
                    <div className="shrink-0 font-display text-sm font-medium tracking-display text-[var(--color-ink)]">
                      {formatKES(p.price)}
                    </div>
                  </button>

                  {/* Stock toggle */}
                  <label className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px]">
                    <input
                      type="checkbox"
                      checked={p.in_stock}
                      onChange={(e) => onToggle(p.id, e.target.checked)}
                      className="h-3.5 w-3.5 accent-[var(--color-primary)]"
                    />
                    <span className={p.in_stock ? "text-primary" : "text-muted-foreground"}>
                      {p.in_stock ? "In" : "Out"}
                    </span>
                  </label>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-hairline)] p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    title={hasImage ? "Edit product" : "Edit product / add image"}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  {/* Delete */}
                  <div className="shrink-0">
                    <AnimatePresence mode="wait" initial={false}>
                      {confirmDeleteId === p.id ? (
                        <motion.div
                          key="confirm"
                          initial={{ opacity: 0, x: 6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 6 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1"
                        >
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deletingId === p.id}
                            className="rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white disabled:opacity-60"
                          >
                            {deletingId === p.id ? "…" : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-full border border-[var(--color-hairline)] px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                          >
                            No
                          </button>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="delete"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline)] p-1.5 text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
                          title="Delete product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Image, only when the row is opened */}
                <AnimatePresence initial={false}>
                  {open && hasImage && (
                    <motion.div
                      key="image"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden bg-surface"
                    >
                      <div className="flex justify-center p-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          loading="lazy"
                          className="max-h-64 rounded-xl object-contain"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
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
            <div className="font-display text-xl font-medium tracking-display">{editingId ? "Edit product" : "Add product"}</div>
            <div className="mt-5 grid gap-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={FIELD}
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className={FIELD}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input
                type="number"
                placeholder="Price (KES)"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className={FIELD}
              />

              {form.image_url ? (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--color-hairline)] p-2.5">
                  <img src={form.image_url} alt="preview" className="h-12 w-12 rounded-lg object-cover" />
                  <span className="flex-1 truncate text-xs text-muted-foreground">{form.image_url}</span>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image_url: "" })}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--color-hairline)] px-3.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground">
                  {uploading ? "Uploading…" : "📁 Upload product image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      const ext = file.name.split(".").pop();
                      const path = `${Date.now()}.${ext}`;
                      const { error } = await supabase!.storage
                        .from("products")
                        .upload(path, file, { upsert: true, contentType: file.type });
                      if (!error) {
                        const { data } = supabase!.storage.from("products").getPublicUrl(path);
                        setForm((f) => ({ ...f, image_url: data.publicUrl }));
                      }
                      setUploading(false);
                    }}
                  />
                </label>
              )}

              <textarea
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-xl border border-[var(--color-hairline)] bg-card p-3.5 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.requires_prescription}
                  onChange={(e) => setForm({ ...form, requires_prescription: e.target.checked })}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                Requires prescription (Rx-only)
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeModal} className={BTN_GHOST}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.price || uploading || saving}
                className={BTN_PRIMARY}
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showBulk && (
        <BulkUploadModal
          onClose={() => setShowBulk(false)}
          onImport={onBulkAdd}
        />
      )}
    </div>
  );
}

/* ─── Bulk Upload Modal ──────────────────────────────────────────────────────── */

type BulkRow = {
  name: string;
  category: string;
  price: string;
  description: string;
  requires_prescription: boolean;
};

const emptyBulkRow = (): BulkRow => ({
  name: "", category: CATEGORIES[0], price: "", description: "", requires_prescription: false,
});

const INITIAL_BULK_ROWS = 10;

function BulkUploadModal({
  onClose, onImport,
}: {
  onClose: () => void;
  onImport: (rows: Omit<Product, "id" | "created_at">[]) => Promise<void>;
}) {
  const [rows, setRows] = useState<BulkRow[]>(() =>
    Array.from({ length: INITIAL_BULK_ROWS }, emptyBulkRow)
  );
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const updateRow = (index: number, patch: Partial<BulkRow>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const addRows = (n: number) =>
    setRows((prev) => [...prev, ...Array.from({ length: n }, emptyBulkRow)]);

  const removeRow = (index: number) =>
    setRows((prev) => prev.filter((_, i) => i !== index));

  const touchedRows = rows
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => r.name.trim() || r.description.trim() || r.price.trim());

  const invalidTouched = touchedRows.filter(
    ({ r }) => !r.name.trim() || !r.price.trim() || Number(r.price) <= 0
  );
  const readyRows = touchedRows.filter(
    ({ r }) => r.name.trim() && r.price.trim() && Number(r.price) > 0
  );

  const handleImport = async () => {
    if (readyRows.length === 0) return;
    setImporting(true);
    setImportError(null);
    try {
      const payload = readyRows.map(({ r }) => ({
        name: r.name.trim(),
        category: r.category,
        price: Number(r.price),
        description: r.description.trim(),
        requires_prescription: r.requires_prescription,
        in_stock: true,
        image_url: "",
      }));
      await onImport(payload);
      setDone(payload.length);
    } catch {
      setImportError("Import failed — check your Supabase connection or permissions and try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[var(--color-ink)]/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-4xl flex-col rounded-3xl border border-[var(--color-hairline)] bg-card p-6 shadow-[var(--shadow-ambient)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-xl font-medium tracking-display">Bulk add products</div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Type directly into the rows below — leave any unused rows blank, they're skipped.
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground transition-colors hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {done !== null ? (
          <div className="mt-8 flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-9 w-9 text-primary" />
            <div className="font-display text-lg font-medium">{done} products added</div>
            <p className="max-w-sm text-sm text-muted-foreground">
              They're live now without images — add photos any time from the product grid; products with none show a
              clean placeholder on the storefront.
            </p>
            <button onClick={onClose} className={`${BTN_PRIMARY} mt-2`}>Done</button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex-1 overflow-y-auto pr-1">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[28px_1.4fr_1fr_0.7fr_0.7fr_1.4fr_28px] gap-2 px-1 pb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <div>#</div>
                  <div>Name</div>
                  <div>Category</div>
                  <div>Price (KES)</div>
                  <div>Rx</div>
                  <div>Description</div>
                  <div />
                </div>

                <div className="space-y-1.5">
                  {rows.map((r, i) => {
                    const touched = r.name.trim() || r.description.trim() || r.price.trim();
                    const invalid = touched && (!r.name.trim() || !r.price.trim() || Number(r.price) <= 0);
                    return (
                      <div
                        key={i}
                        className={`grid grid-cols-[28px_1.4fr_1fr_0.7fr_0.7fr_1.4fr_28px] items-center gap-2 rounded-lg p-1 ${
                          invalid ? "bg-destructive/5" : ""
                        }`}
                      >
                        <div className="text-center text-xs text-muted-foreground">{i + 1}</div>
                        <input
                          value={r.name}
                          onChange={(e) => updateRow(i, { name: e.target.value })}
                          placeholder="Product name"
                          className={`${FIELD} h-9 text-sm`}
                        />
                        <select
                          value={r.category}
                          onChange={(e) => updateRow(i, { category: e.target.value })}
                          className={`${FIELD} h-9 text-sm`}
                        >
                          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <input
                          type="number"
                          value={r.price}
                          onChange={(e) => updateRow(i, { price: e.target.value })}
                          placeholder="0"
                          className={`${FIELD} h-9 text-sm`}
                        />
                        <label className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={r.requires_prescription}
                            onChange={(e) => updateRow(i, { requires_prescription: e.target.checked })}
                            className="h-4 w-4 accent-[var(--color-primary)]"
                          />
                        </label>
                        <input
                          value={r.description}
                          onChange={(e) => updateRow(i, { description: e.target.value })}
                          placeholder="Short description"
                          className={`${FIELD} h-9 text-sm`}
                        />
                        <button
                          onClick={() => removeRow(i)}
                          className="grid h-9 w-9 place-items-center text-muted-foreground transition-colors hover:text-destructive"
                          aria-label="Remove row"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => addRows(5)}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-[var(--color-primary-deep)]"
              >
                <Plus className="h-3.5 w-3.5" /> Add 5 more rows
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-hairline)] pt-4">
              <div className="text-sm">
                <span className="font-medium text-foreground">{readyRows.length} ready to import</span>
                {invalidTouched.length > 0 && (
                  <span className="ml-2 inline-flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" /> {invalidTouched.length} need a name and price
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className={BTN_GHOST}>Cancel</button>
                <button
                  onClick={handleImport}
                  disabled={readyRows.length === 0 || importing}
                  className={BTN_PRIMARY}
                >
                  {importing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Import {readyRows.length || ""} product{readyRows.length === 1 ? "" : "s"}
                </button>
              </div>
            </div>
            {importError && <p className="mt-2 text-sm text-destructive">{importError}</p>}
          </>
        )}
      </motion.div>
    </div>
  );
}