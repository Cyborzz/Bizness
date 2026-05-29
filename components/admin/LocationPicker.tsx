"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";

type Props = {
  defaultLatitude: number | null;
  defaultLongitude: number | null;
};

export function LocationPicker({ defaultLatitude, defaultLongitude }: Props) {
  const [lat, setLat] = useState<string>(
    defaultLatitude !== null ? String(defaultLatitude) : "",
  );
  const [lng, setLng] = useState<string>(
    defaultLongitude !== null ? String(defaultLongitude) : "",
  );
  const [state, setState] = useState<"idle" | "loading" | "denied">("idle");
  const [error, setError] = useState<string | null>(null);

  function useMyPosition() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Géolocalisation indisponible sur cet appareil.");
      return;
    }
    setState("loading");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setState("idle");
      },
      (err) => {
        setState(err.code === err.PERMISSION_DENIED ? "denied" : "idle");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Autorisation refusée. Vous pouvez aussi saisir la latitude/longitude manuellement."
            : "Impossible d'obtenir la position. Saisissez-la manuellement.",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface-muted p-4">
      <div className="flex items-center gap-2">
        <MapPin aria-hidden className="h-4 w-4 text-primary" />
        <p className="text-sm font-black text-ink">
          Position du commerce (pour les notifications de proximité)
        </p>
      </div>
      <p className="mt-1 text-xs text-muted">
        Optionnel. Renseignez la position pour que les clients voient ce commerce dans « Près de
        vous » et reçoivent les futures notifications géolocalisées (Apple/Google Wallet en V2).
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            value={lat}
            onChange={(event) => setLat(event.target.value)}
            placeholder="48.8566"
            inputMode="decimal"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            value={lng}
            onChange={(event) => setLng(event.target.value)}
            placeholder="2.3522"
            inputMode="decimal"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={useMyPosition}
          disabled={state === "loading"}
        >
          {state === "loading" ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin aria-hidden className="h-4 w-4" />
          )}
          Ma position
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
