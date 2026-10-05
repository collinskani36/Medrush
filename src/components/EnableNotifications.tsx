import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { enableAdminPush, listenForegroundMessages } from "@/lib/push";

type State = "idle" | "working" | "on" | "error";

export default function EnableNotifications() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  const enable = async () => {
    setState("working");
    setError("");
    const res = await enableAdminPush();
    if (res.ok) {
      setState("on");
    } else {
      setError(res.reason);
      setState("error");
    }
  };

  // If permission was already granted earlier, silently refresh the token
  // (FCM tokens can rotate) without showing a prompt.
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      enable();
    }
  }, []);

  // While the admin tab is focused, FCM doesn't show anything itself — do it manually.
  useEffect(() => {
    if (state !== "on") return;
    let unsubscribe = () => {};
    listenForegroundMessages(async (payload) => {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(payload.notification?.title ?? "New order", {
        body: payload.notification?.body,
        icon: "/favicon.ico",
      });
    }).then((u) => { unsubscribe = u; });
    return () => unsubscribe();
  }, [state]);

  if (state === "on") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
        <BellRing className="h-4 w-4" /> Notifications on
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={enable}
        disabled={state === "working"}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:border-primary disabled:opacity-60"
      >
        <Bell className="h-4 w-4" />
        {state === "working" ? "Enabling…" : "Enable order notifications"}
      </button>
      {state === "error" && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}