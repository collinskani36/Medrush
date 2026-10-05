import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { getMessagingIfSupported } from "./firebase";
import { supabase, supabaseEnabled } from "./supabase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export type PushResult =
  | { ok: true; token: string }
  | { ok: false; reason: string };

/**
 * Asks for notification permission (if not already granted), gets this
 * browser's FCM token, and saves it to the admin_devices table.
 * Safe to call repeatedly — the token is upserted.
 */
export async function enableAdminPush(): Promise<PushResult> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) {
    return { ok: false, reason: "This browser doesn't support push notifications." };
  }
  if (!supabaseEnabled || !supabase) {
    return { ok: false, reason: "Supabase is not configured." };
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

    const { error } = await supabase
      .from("admin_devices")
      .upsert({ token, user_agent: navigator.userAgent }, { onConflict: "token" });
    if (error) return { ok: false, reason: error.message };

    return { ok: true, token };
  } catch (e) {
    console.error(e);
    return { ok: false, reason: e instanceof Error ? e.message : "Push setup failed." };
  }
}

/** Fires while the admin tab is open and focused (the browser shows nothing by itself then). */
export async function listenForegroundMessages(
  cb: (payload: MessagePayload) => void,
): Promise<() => void> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};
  return onMessage(messaging, cb);
}
