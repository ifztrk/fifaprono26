"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type Status = "loading" | "unsupported" | "enabled" | "default" | "denied";

export default function NotificationsButton() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") return setStatus("denied");
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "enabled" : "default"))
      .catch(() => setStatus("default"));
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setStatus(perm === "denied" ? "denied" : "default");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
        ) as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setStatus(res.ok ? "enabled" : "default");
    } catch {
      setStatus("default");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2 className="mb-1 font-bold">🔔 Notifications</h2>
      <p className="mb-3 text-sm text-muted">
        Reçois un rappel avant les matchs pour ne jamais oublier de pronostiquer.
      </p>

      {status === "loading" && <p className="text-sm text-muted">…</p>}
      {status === "unsupported" && (
        <p className="text-sm text-muted">
          Non disponible sur ce navigateur. Astuce : installe l&apos;app sur ton
          écran d&apos;accueil (iPhone : Partager → « Sur l&apos;écran
          d&apos;accueil »), puis réessaie.
        </p>
      )}
      {status === "denied" && (
        <p className="text-sm text-danger">
          Notifications bloquées. Autorise-les dans les réglages de ton
          navigateur pour ce site.
        </p>
      )}
      {status === "enabled" && (
        <p className="rounded-lg bg-primary/15 px-3 py-2 text-sm font-semibold text-primary">
          ✅ Notifications activées
        </p>
      )}
      {status === "default" && (
        <button
          type="button"
          onClick={enable}
          disabled={busy}
          className="btn-primary w-full"
        >
          {busy ? "Activation…" : "Activer les notifications"}
        </button>
      )}
    </div>
  );
}
