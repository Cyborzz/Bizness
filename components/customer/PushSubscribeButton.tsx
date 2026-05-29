"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { subscribePushAction, unsubscribePushAction } from "@/app/actions/push";
import { Button } from "@/components/ui/button";
import {
  ensureServiceWorker,
  isPushSupported,
  urlBase64ToUint8Array,
} from "@/lib/push/client";

type State = "checking" | "unsupported" | "blocked" | "idle" | "subscribed" | "loading";

type Props = {
  cardId: string;
  vapidPublicKey: string | null;
  businessName: string;
};

function initialState(vapidPublicKey: string | null): State {
  if (!vapidPublicKey) return "unsupported";
  if (!isPushSupported()) return "unsupported";
  if (typeof Notification !== "undefined" && Notification.permission === "denied") {
    return "blocked";
  }
  return "checking";
}

export function PushSubscribeButton({ cardId, vapidPublicKey, businessName }: Props) {
  const [state, setState] = useState<State>(() => initialState(vapidPublicKey));
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null);

  useEffect(() => {
    if (state !== "checking") return;
    let cancelled = false;

    (async () => {
      try {
        const registration = await ensureServiceWorker();
        if (cancelled) return;
        if (!registration) {
          setState("unsupported");
          return;
        }
        const existing = await registration.pushManager.getSubscription();
        if (cancelled) return;
        if (existing) {
          setEndpoint(existing.endpoint);
          setState("subscribed");
        } else {
          setState("idle");
        }
      } catch {
        if (!cancelled) setState("idle");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state]);

  const subscribe = useCallback(async () => {
    if (!vapidPublicKey) return;
    setState("loading");
    setError(null);
    try {
      const registration = await ensureServiceWorker();
      if (!registration) throw new Error("Service worker indisponible.");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "idle");
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      const json = subscription.toJSON();
      const result = await subscribePushAction({
        cardId,
        endpoint: subscription.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth_key: json.keys?.auth ?? "",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 480) : null,
      });
      if (!result.ok) {
        await subscription.unsubscribe();
        throw new Error(result.error ?? "Échec de l'inscription.");
      }
      setEndpoint(subscription.endpoint);
      setState("subscribed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'activer les notifications.");
      setState("idle");
    }
  }, [cardId, vapidPublicKey]);

  const unsubscribe = useCallback(async () => {
    setState("loading");
    try {
      const registration = await ensureServiceWorker();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      if (endpoint) {
        await unsubscribePushAction(endpoint);
      }
      setEndpoint(null);
      setState("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Désabonnement impossible.");
      setState("subscribed");
    }
  }, [endpoint]);

  if (state === "checking") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-white p-4 text-sm text-muted">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        Vérification du support des notifications…
      </div>
    );
  }

  if (state === "unsupported") {
    return null;
  }

  if (state === "blocked") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <BellOff aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>Notifications bloquées.</strong> Activez-les dans les réglages de votre
            navigateur pour recevoir les offres de {businessName}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-dark">
          {state === "subscribed" ? (
            <BellRing aria-hidden className="h-5 w-5" />
          ) : (
            <Bell aria-hidden className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-ink">
            {state === "subscribed" ? "Notifications activées" : "Recevoir les offres"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {state === "subscribed"
              ? `Vous serez prévenu·e quand ${businessName} publie une nouvelle offre.`
              : `Soyez le premier à savoir quand ${businessName} lance une offre.`}
          </p>
          {error ? (
            <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
          ) : null}
          <div className="mt-3">
            {state === "subscribed" ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={unsubscribe}
              >
                <BellOff aria-hidden className="h-4 w-4" />
                Désactiver
              </Button>
            ) : (
              <Button type="button" size="sm" onClick={subscribe} disabled={state === "loading"}>
                {state === "loading" ? (
                  <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                ) : (
                  <Bell aria-hidden className="h-4 w-4" />
                )}
                Activer les notifications
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
