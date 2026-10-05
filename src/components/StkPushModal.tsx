import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { formatKES } from "@/lib/format";

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export function StkPushModal({
  open,
  phone,
  amount,
  submitting,
  checkoutRequestId,
  onSuccess,
  onCancel,
  onError,
}: {
  open: boolean;
  phone: string;
  amount: number;
  submitting: boolean;
  checkoutRequestId: string | null;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (msg: string) => void;
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);
  const failuresRef = useRef(0);

  // Always call the latest handlers without restarting the polling interval.
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!open || !checkoutRequestId) return;

    attemptsRef.current = 0;
    failuresRef.current = 0;
    let finished = false;

    const stop = () => {
      finished = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    intervalRef.current = setInterval(async () => {
      if (finished) return;
      attemptsRef.current += 1;

      try {
        const res = await fetch(`${FN_BASE}/mpesa-query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ checkoutRequestId }),
        });
        const data = await res.json();
        if (finished) return; // a slower earlier request must not fire twice
        failuresRef.current = 0;

        if (data.status === "completed") {
          stop();
          onSuccessRef.current();
        } else if (data.status === "cancelled") {
          stop();
          onErrorRef.current("Payment was cancelled. Please try again.");
        } else if (data.status === "failed") {
          stop();
          onErrorRef.current(data.message ?? "Payment failed. Please try again.");
        } else if (attemptsRef.current >= 40) {
          // ~2 minutes. The order stays saved and is updated automatically if payment lands later.
          stop();
          onErrorRef.current(
            "We haven't received your payment yet. If you were charged, your order will update automatically — check My Orders.",
          );
        }
      } catch {
        // Tolerate a brief connection drop; give up only after 3 failed checks in a row.
        failuresRef.current += 1;
        if (failuresRef.current >= 3 && !finished) {
          stop();
          onErrorRef.current("Could not verify payment. Check your connection and try again.");
        }
      }
    }, 3000);

    return stop;
  }, [open, checkoutRequestId]);

  const isPolling = !!checkoutRequestId;

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
            {/* Icon */}
            {submitting || isPolling ? (
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            ) : (
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary-soft">
                <Smartphone className="h-7 w-7 text-primary" />
              </div>
            )}

            {/* Heading */}
            <h3 className="mt-4 font-display text-xl font-semibold">
              {submitting
                ? "Sending prompt…"
                : isPolling
                ? "Waiting for payment…"
                : "Check your phone"}
            </h3>

            {/* Body */}
            <p className="mt-2 text-sm text-muted-foreground">
              {isPolling ? (
                <>
                  Enter your M-Pesa PIN on{" "}
                  <span className="font-medium text-foreground">{phone}</span> to
                  pay{" "}
                  <span className="font-medium text-foreground">
                    {formatKES(amount)}
                  </span>
                  . This will confirm automatically.
                </>
              ) : (
                <>
                  We've sent an M-Pesa STK push to{" "}
                  <span className="font-medium text-foreground">{phone}</span>.
                  Enter your PIN to pay{" "}
                  <span className="font-medium text-foreground">
                    {formatKES(amount)}
                  </span>
                  .
                </>
              )}
            </p>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2">
              {!isPolling && !submitting && (
                <p className="text-xs text-muted-foreground">
                  Sending prompt to your phone…
                </p>
              )}

              {isPolling && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Checking payment status…
                </div>
              )}

              <button
                onClick={onCancel}
                disabled={submitting}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
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