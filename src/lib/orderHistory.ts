const STORAGE_KEY = "recent_orders";

export function saveOrderToHistory(orderId: string) {
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    const updated = [orderId, ...existing.filter((id) => id !== orderId)].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch { /* silently ignore */ }
}

export function getSavedOrderIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}