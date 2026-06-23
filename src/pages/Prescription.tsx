import { useState } from "react";
import { FileUp, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { createPrescription, uploadPrescriptionFile } from "@/lib/api";

export default function Prescription() {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const phoneOk = /^0\d{9}$/.test(phone);
  const canSubmit = phoneOk && address && file;

  const handleSubmit = async () => {
    if (!canSubmit || !file) return;
    setSubmitting(true);
    try {
      // 1. Upload file to Supabase Storage → get public URL
      const prescription_url = await uploadPrescriptionFile(file);
      // 2. Insert prescription row with real URL
      await createPrescription({
        customer_phone: phone,
        delivery_address: address,
        prescription_url,
      });
      setDone(true);
    } catch (e) {
      console.error(e);
      alert("Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl font-semibold md:text-4xl">Upload prescription</h1>
        <p className="mt-2 text-muted-foreground">
          Send us a photo or PDF of your prescription. A pharmacist will call you within 30 minutes to confirm.
        </p>

        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl border border-primary/30 bg-primary-soft p-8 text-center"
          >
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <div className="mt-3 font-display text-xl font-semibold">Prescription received</div>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll call you within 30 minutes to confirm your order.
            </p>
          </motion.div>
        ) : (
          <div className="mt-8 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <label className="block text-sm">
              <div className="mb-1.5 font-medium">Phone (07XXXXXXXX)</div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0712345678"
                className="h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block text-sm">
              <div className="mb-1.5 font-medium">Delivery address</div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Apartment, street, area"
                className="h-12 w-full rounded-lg border border-border bg-card px-4 text-sm outline-none focus:border-primary"
              />
            </label>

            <label className="block">
              <div className="mb-1.5 text-sm font-medium">Prescription file</div>
              <div className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface p-6 text-sm text-muted-foreground hover:border-primary hover:text-foreground">
                <FileUp className="h-6 w-6 text-primary" />
                <div className="flex-1">
                  <div className="font-medium text-foreground">{fileName ?? "Click to choose a file"}</div>
                  <div className="text-xs">PNG, JPG or PDF — up to 10 MB</div>
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                    setFileName(f?.name ?? null);
                  }}
                />
              </div>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              {submitting ? "Uploading & submitting…" : "Submit prescription"}
            </button>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}