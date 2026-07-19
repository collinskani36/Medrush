import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Loader2, CheckCircle2 } from "lucide-react";
import { formatKES } from "@/lib/format";

/**
 * Shared M-Pesa "STK push" confirmation modal.
 * Used by Checkout, ConsultationBooking, and EquipmentStatus (quote acceptance).
 *
 * This mirrors the existing checkout flow exactly: it does NOT verify payment
 * server-side, it just asks the customer to confirm once they've entered their
 * M-Pesa PIN on their phone. `onConfirm` is where the caller actually creates/
 * updates the record. Swap this for real STK verification later without
 * touching any of the call sites.
 */
export function StkPushModal({
  open,
  phone,
  amount,
  submitting,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  phone: string;
  amount: number;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.92, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-2xl bg-card p-7 text-center shadow-2xl"
          >
            {submitting ? (
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            ) : (
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft">
                <Smartphone className="h-7 w-7 text-primary" />
              </div>
            )}
            <h3 className="mt-4 font-display text-xl font-semibold">Check your phone</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent an M-Pesa STK push to <span className="font-medium text-foreground">{phone}</span>.
              Enter your PIN to pay <span className="font-medium text-foreground">{formatKES(amount)}</span>.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={onConfirm}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                I've completed payment
              </button>
              <button
                onClick={onCancel}
                className="text-xs text-muted-foreground hover:text-foreground"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
