"use client";

import { useEffect, useState } from "react";
import { MapPin, Sparkles } from "lucide-react";
import { haversineDistanceMeters } from "@/lib/utils/geo";

type Offer = {
  title: string;
  body: string;
  ctaUrl: string | null;
};

type Props = {
  businessName: string;
  latitude: number | null;
  longitude: number | null;
  offer: Offer | null;
  cardId: string;
  // Rayon de déclenchement (mètres). ~300 m = "sur place / juste à côté".
  radiusMeters?: number;
};

const hasGeo =
  typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined";

// Alerte affichée à l'ouverture de la carte quand le client est physiquement
// proche du commerce. Web only : pas de géofence en arrière-plan (impossible
// sans app native), mais déclenchement fiable à l'ouverture de la page.
// La position n'est jamais envoyée au serveur ni stockée.
export function NearbyOfferAlert({
  businessName,
  latitude,
  longitude,
  offer,
  cardId,
  radiusMeters = 300,
}: Props) {
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!hasGeo || latitude == null || longitude == null) return;
    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        const distance = haversineDistanceMeters(
          { latitude: position.coords.latitude, longitude: position.coords.longitude },
          { latitude, longitude },
        );
        if (distance > radiusMeters) return;
        setNear(true);

        // Notification locale (une seule fois par session) si déjà autorisée.
        const key = `near-${cardId}-${offer?.title ?? "visit"}`;
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "granted" &&
          !sessionStorage.getItem(key)
        ) {
          sessionStorage.setItem(key, "1");
          const title = offer ? `${businessName} : ${offer.title}` : `Bienvenue chez ${businessName} !`;
          const body = offer ? offer.body : "Pensez à faire tamponner votre carte de fidélité.";
          navigator.serviceWorker?.ready
            .then((reg) => reg.showNotification(title, { body, tag: key, icon: "/icon-192.png" }))
            .catch(() => {
              try {
                new Notification(title, { body });
              } catch {
                /* no-op */
              }
            });
        }
      },
      () => {
        /* refus / indisponible : on n'affiche rien, c'est un bonus */
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, radiusMeters, cardId, offer, businessName]);

  if (!near) return null;

  return (
    <div className="animate-fade-in-up rounded-2xl border border-mint/40 bg-mint/10 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint text-white">
          <MapPin aria-hidden className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-black text-ink">📍 Vous êtes chez {businessName} !</p>
          {offer ? (
            <>
              <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-primary-dark">
                <Sparkles aria-hidden className="h-3.5 w-3.5" />
                {offer.title}
              </p>
              <p className="mt-0.5 text-sm text-muted">{offer.body}</p>
              {offer.ctaUrl ? (
                <a
                  href={offer.ctaUrl}
                  className="mt-2 inline-block rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-white"
                >
                  En profiter
                </a>
              ) : null}
            </>
          ) : (
            <p className="mt-1 text-sm text-muted">
              Pensez à faire tamponner votre carte pour gagner votre récompense.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
