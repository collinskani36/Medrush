import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { type DeliveryTier } from "@/lib/geo";

interface DeliveryPricingRow {
  id: string;
  road_distance_factor: number;
  tiers: DeliveryTier[];
  notes: string | null;
}

export default function AdminDelivery() {
  const [pricing, setPricing]           = useState<DeliveryPricingRow | null>(null);
  const [factorInput, setFactorInput]   = useState("1.5");
  const [tiersInput, setTiersInput]     = useState<DeliveryTier[]>([]);
  const [notesInput, setNotesInput]     = useState("");
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [saved, setSaved]               = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured — check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars.");
      setLoading(false);
      return;
    }

    const { data, error: dbErr } = await supabase
      .from("delivery_pricing")
      .select("id, road_distance_factor, tiers, notes")
      .limit(1)
      .single();

    if (dbErr || !data) {
      setError("Could not load delivery pricing. Check your Supabase connection.");
      setLoading(false);
      return;
    }

    const row = data as DeliveryPricingRow;
    setPricing(row);
    setFactorInput(String(row.road_distance_factor));
    setTiersInput([...(row.tiers as DeliveryTier[])].sort((a, b) => a.max_km - b.max_km));
    setNotesInput(row.notes ?? "");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateTier = (index: number, field: keyof DeliveryTier, value: number) => {
    setTiersInput((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const addTier = () => {
    const lastMax = tiersInput.length > 0 ? tiersInput[tiersInput.length - 1].max_km : 0;
    setTiersInput((prev) => [...prev, { max_km: lastMax + 5, fee: 0 }]);
  };

  const removeTier = (index: number) => {
    setTiersInput((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): string | null => {
    const factor = Number(factorInput);
    if (Number.isNaN(factor) || factor < 1.0 || factor > 2.5)
      return "Road distance factor must be between 1.0 and 2.5.";
    if (tiersInput.length === 0)
      return "Add at least one distance tier.";
    for (const t of tiersInput) {
      if (Number.isNaN(t.max_km) || t.max_km <= 0)
        return "Every tier needs a distance greater than 0 km.";
      if (Number.isNaN(t.fee) || t.fee < 0)
        return "Every tier needs a fee of 0 or more.";
    }
    const maxKms = tiersInput.map((t) => t.max_km);
    if (new Set(maxKms).size !== maxKms.length)
      return "Each tier must have a unique distance value.";
    return null;
  };

  const save = async () => {
    if (!pricing) return;
    if (!supabase) {
      setError("Supabase is not configured — check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars.");
      return;
    }
    const validationErr = validate();
    if (validationErr) { setError(validationErr); setSaved(false); return; }

    setSaving(true);
    setError(null);
    setSaved(false);

    const sortedTiers = [...tiersInput].sort((a, b) => a.max_km - b.max_km);

    const { error: dbErr } = await supabase
      .from("delivery_pricing")
      .update({
        road_distance_factor: Number(factorInput),
        tiers: sortedTiers,
        notes: notesInput || null,
      })
      .eq("id", pricing.id);

    setSaving(false);

    if (dbErr) {
      setError("Failed to save — check your admin permissions or connection.");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading delivery pricing…
      </div>
    );
  }

  if (!pricing) {
    return (
      <p className="py-4 text-sm text-destructive">
        {error ?? "Pricing settings unavailable."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Delivery Pricing</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Tune how straight-line distance becomes a delivery fee.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Road Distance Factor
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            Multiplies the straight-line distance to estimate on-road km.
            Typical range: 1.2 (grid roads) → 1.8 (winding terrain). Default: 1.5.
          </p>
          <input
            type="number"
            step="0.1"
            min="1.0"
            max="2.5"
            value={factorInput}
            onChange={(e) => setFactorInput(e.target.value)}
            className="h-11 w-32 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Distance Tiers</label>
          <p className="mb-3 text-xs text-muted-foreground">
            First matching tier wins. Keep them in ascending order — the save button
            sorts them automatically.
          </p>

          <div className="space-y-2">
            {tiersInput.map((tier, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-xs text-muted-foreground">Up to</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={tier.max_km}
                  onChange={(e) => updateTier(i, "max_km", Number(e.target.value))}
                  className="h-10 w-20 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
                />
                <span className="shrink-0 text-xs text-muted-foreground">km — KSh</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={tier.fee}
                  onChange={(e) => updateTier(i, "fee", Number(e.target.value))}
                  className="h-10 w-24 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => removeTier(i)}
                  className="p-1.5 text-muted-foreground hover:text-destructive"
                  title="Remove tier"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addTier}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:opacity-75"
          >
            <Plus className="h-3.5 w-3.5" /> Add tier
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Notes <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. increased factor after rider feedback on hill routes"
            value={notesInput}
            onChange={(e) => setNotesInput(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        {error  && <p className="text-sm text-destructive">{error}</p>}
        {saved  && <p className="text-sm text-primary">Saved successfully.</p>}

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save Pricing"}
        </button>
      </div>
    </div>
  );
}