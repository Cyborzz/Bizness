"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MapPin, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistance, haversineDistanceMeters } from "@/lib/utils/geo";

type NearbyBusiness = {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  primary_color: string;
  latest_offer_title: string | null;
  latest_offer_body: string | null;
};

type Props = {
  businesses: NearbyBusiness[];
  radiusMeters?: number;
};

type GeoState =
  | { status: "requesting" }
  | { status: "denied"; message: string }
  | { status: "unavailable"; message: string }
  | { status: "ok"; latitude: number; longitude: number };

const hasGeo =
  typeof navigator !== "undefined" && typeof navigator.geolocation !== "undefined";

export function NearbyBusinesses({ businesses, radiusMeters = 1500 }: Props) {
  const [geo, setGeo] = useState<GeoState>(() =>
    hasGeo
      ? { status: "requesting" }
      : {
          status: "unavailable",
          message: "Géolocalisation indisponible sur cet appareil.",
        },
  );

  useEffect(() => {
    if (!hasGeo) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return;
        setGeo({
          status: "ok",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (cancelled) return;
        setGeo(
          error.code === error.PERMISSION_DENIED
            ? {
                status: "denied",
                message:
                  "Géolocalisation refusée. Activez-la dans les réglages pour voir les commerces proches.",
              }
            : {
                status: "unavailable",
                message: "Position indisponible. Réessayez plus tard.",
              },
        );
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (geo.status === "requesting") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-white p-4 text-sm text-muted">
        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
        Recherche des commerces proches…
      </div>
    );
  }

  if (geo.status !== "ok") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
          {geo.message}
        </div>
      </div>
    );
  }

  const nearby = businesses
    .map((business) => ({
      ...business,
      distance: haversineDistanceMeters(
        { latitude: geo.latitude, longitude: geo.longitude },
        { latitude: business.latitude, longitude: business.longitude },
      ),
    }))
    .sort((a, b) => a.distance - b.distance);

  const withinRadius = nearby.filter((b) => b.distance <= radiusMeters);

  if (withinRadius.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white p-4 text-sm text-muted">
        Aucun commerce abonné à moins de {formatDistance(radiusMeters)}. Le plus proche est{" "}
        {nearby[0] ? (
          <>
            <strong>{nearby[0].name}</strong> à {formatDistance(nearby[0].distance)}.
          </>
        ) : (
          "trop loin."
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {withinRadius.map((business) => (
        <Link
          key={business.id}
          href={`/c/${business.slug}`}
          className="block overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center gap-4 p-4">
            <div
              aria-hidden
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: business.primary_color }}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-black text-ink">{business.name}</p>
                <Badge tone="mint">{formatDistance(business.distance)}</Badge>
              </div>
              {business.latest_offer_title ? (
                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-primary-dark">
                  <Sparkles aria-hidden className="h-3 w-3" />
                  {business.latest_offer_title}
                </p>
              ) : (
                <p className="mt-1 text-sm text-muted">Carte fidélité disponible</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
