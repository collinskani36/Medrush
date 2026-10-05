import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { enableAdminPush, isPushGranted, listenForegroundMessages } from "@/lib/push";

type State = "idle" | "working" | "on" | "error";

/** Compact bell button for the admin header. Icon-only on small screens. */
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
    isPushGranted().then((granted) => { if (granted) enable(); });
  }, []);

  // Web only: while the admin tab is focused, FCM doesn't show anything itself.
  useEffect(() => {
    if (state !== "on") return;
    let unsubscribe = () => {};
    listenForegroundMessages(async (payload) => {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(payload.notification?.title ?? "New activity", {
        body: payload.notification?.body,
        icon: "/favicon.ico",
      });
    }).then((u) => { unsubscribe = u; });
    return () => unsubscribe();
  }, [state]);

  if (state === "on") {
    return (
      <div
        className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs font-medium text-primary"
        title="Notifications are on for this device"
      >
        <BellRing className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Notifications on</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={enable}
        disabled={state === "working"}
        aria-label="Enable notifications"
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-hairline)] px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-60"
      >
        <Bell className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">
          {state === "working" ? "Enabling…" : "Enable notifications"}
        </span>
      </button>
      {state === "error" && (
        <p className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-destructive/30 bg-card p-2.5 text-xs text-destructive shadow-lg">
          {error}
        </p>
      )}
    </div>
  );
}



