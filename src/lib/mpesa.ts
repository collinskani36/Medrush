const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function initiateStkPush(params: {
  phone: string;
  amount: number;
  reference_type: "order" | "consultation";
  reference_id: string;
}): Promise<{ checkoutRequestId: string }> {
  const res = await fetch(`${FN_BASE}/mpesa-stk-push`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "STK push failed");
  return data;
}

export async function pollPaymentStatus(
  checkoutRequestId: string,
  onSuccess: () => void,
  onCancel: () => void,
  onError: (msg: string) => void
): Promise<() => void> {
  let attempts = 0;
  const MAX_ATTEMPTS = 20; // ~60 seconds

  const interval = setInterval(async () => {
    attempts++;
    try {
      const res = await fetch(`${FN_BASE}/mpesa-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkoutRequestId }),
      });
      const data = await res.json();

      if (data.status === "completed") {
        clearInterval(interval);
        onSuccess();
      } else if (data.status === "cancelled") {
        clearInterval(interval);
        onCancel();
      } else if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        onError("Payment timed out. Please try again.");
      }
    } catch {
      clearInterval(interval);
      onError("Could not verify payment. Check your connection.");
    }
  }, 3000);

  return () => clearInterval(interval); // returns cleanup fn
}