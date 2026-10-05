import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { getMessagingIfSupported } from "./firebase";
import { supabase, supabaseEnabled } from "./supabase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const CHANNEL_ID = "orders"; // must match android.notification.channel_id in the Edge Function

export type PushResult =
  | { ok: true; token: string }
  | { ok: false; reason: string };

const isNative = () => Capacitor.isNativePlatform();

async function saveToken(token: string, platform: "android" | "web"): Promise<PushResult> {
  if (!supabaseEnabled || !supabase) return { ok: false, reason: "Supabase is not configured." };
  const { error } = await supabase
    .from("admin_devices")
    .upsert({ token, user_agent: `${platform}: ${navigator.userAgent}` }, { onConflict: "token" });
  if (error) return { ok: false, reason: error.message };
  return { ok: true, token };
}

// ─── Native (Capacitor / Android APK) ────────────────────────────────────────

async function enableNative(): Promise<PushResult> {
  try {
    let perm = await PushNotifications.checkPermissions();
    if (perm.receive === "prompt" || perm.receive === "prompt-with-rationale") {
      perm = await PushNotifications.requestPermissions();
    }
    if (perm.receive !== "granted") {
      return { ok: false, reason: "Notification permission was not granted." };
    }

    // Android 8+ needs a channel; importance 5 = heads-up banner with sound.
    await PushNotifications.createChannel({
      id: CHANNEL_ID,
      name: "New activity",
      description: "Orders, prescriptions, consultations and equipment requests",
      importance: 5,
      visibility: 1,
      vibration: true,
    });

    const token = await new Promise<string>((resolve, reject) => {
      let regHandle: PluginListenerHandle | undefined;
      let errHandle: PluginListenerHandle | undefined;
      const timer = setTimeout(() => { cleanup(); reject(new Error("Timed out getting a push token.")); }, 15000);
      const cleanup = () => { clearTimeout(timer); regHandle?.remove(); errHandle?.remove(); };

      Promise.all([
        PushNotifications.addListener("registration", (t) => { cleanup(); resolve(t.value); }),
        PushNotifications.addListener("registrationError", (e) => { cleanup(); reject(new Error(e.error)); }),
      ])
        .then(([r, e]) => { regHandle = r; errHandle = e; return PushNotifications.register(); })
        .catch((err) => { cleanup(); reject(err); });
    });

    return await saveToken(token, "android");
  } catch (e) {
    console.error(e);
    return { ok: false, reason: e instanceof Error ? e.message : "Push setup failed." };
  }
}

// ─── Web (desktop / mobile Chrome) ───────────────────────────────────────────

async function enableWeb(): Promise<PushResult> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) {
    return { ok: false, reason: "This browser doesn't support push notifications." };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, reason: "Notification permission was not granted." };
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return { ok: false, reason: "Could not get a push token." };
    return await saveToken(token, "web");
  } catch (e) {
    console.error(e);
    return { ok: false, reason: e instanceof Error ? e.message : "Push setup failed." };
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Asks for permission (if needed), gets this device's FCM token and saves it to admin_devices. */
export async function enableAdminPush(): Promise<PushResult> {
  return isNative() ? enableNative() : enableWeb();
}

/** True if permission was already granted earlier (used to silently refresh the token on load). */
export async function isPushGranted(): Promise<boolean> {
  if (isNative()) {
    return (await PushNotifications.checkPermissions()).receive === "granted";
  }
  return typeof Notification !== "undefined" && Notification.permission === "granted";
}

/**
 * Web only: fires while the admin tab is focused (the browser shows nothing by itself then).
 * On Android the app list already updates live, so this is a no-op there.
 */
export async function listenForegroundMessages(
  cb: (payload: MessagePayload) => void,
): Promise<() => void> {
  if (isNative()) return () => {};
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};
  return onMessage(messaging, cb);
}

