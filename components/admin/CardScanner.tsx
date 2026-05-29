"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, CameraOff, ScanLine, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type ScannerState = "idle" | "starting" | "running" | "unsupported" | "denied";

const CARD_PATH_RE = /\/card\/([0-9a-f-]{36})/i;

declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => {
      detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
    };
  }
}

export function CardScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [state, setState] = useState<ScannerState>("idle");
  const [lastValue, setLastValue] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera() {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  async function startCamera() {
    setError(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }
    if (!window.BarcodeDetector) {
      setState("unsupported");
      setError(
        "Lecteur QR natif non disponible sur ce navigateur. Utilisez Chrome / Edge sur Android, ou la recherche client.",
      );
      return;
    }
    setState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setState("running");
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      const detect = async () => {
        if (!videoRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes.length > 0) {
            const value = codes[0].rawValue;
            setLastValue(value);
            const match = value.match(CARD_PATH_RE);
            if (match) {
              stopCamera();
              // Vers la gestion de la carte (boutons tampon), pas la vue publique.
              router.push(`/admin/cards?card=${match[1]}`);
              return;
            }
          }
        } catch {
          // ignore, on retente
        }
        rafRef.current = requestAnimationFrame(detect);
      };
      rafRef.current = requestAnimationFrame(detect);
    } catch (err) {
      stopCamera();
      const e = err as { name?: string };
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setState("denied");
        setError("Caméra refusée. Autorisez-la dans les réglages.");
      } else {
        setState("unsupported");
        setError("Impossible de démarrer la caméra.");
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-ink">
        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
            aria-label="Aperçu caméra"
          />
          {state !== "running" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/80 text-white">
              {state === "starting" ? (
                <>
                  <Camera aria-hidden className="h-8 w-8 animate-pulse" />
                  <p className="text-sm font-semibold">Démarrage de la caméra…</p>
                </>
              ) : state === "denied" ? (
                <>
                  <CameraOff aria-hidden className="h-8 w-8 text-coral" />
                  <p className="max-w-xs text-center text-sm font-semibold">
                    Caméra refusée. Autorisez-la dans les réglages pour scanner.
                  </p>
                </>
              ) : state === "unsupported" ? (
                <>
                  <ZapOff aria-hidden className="h-8 w-8 text-sun" />
                  <p className="max-w-xs text-center text-sm font-semibold">
                    Scanner QR non supporté ici. Utilisez la recherche manuelle dans{" "}
                    <strong>Cartes</strong>.
                  </p>
                </>
              ) : (
                <>
                  <ScanLine aria-hidden className="h-8 w-8 text-sun" />
                  <p className="max-w-xs text-center text-sm font-semibold">
                    Pointez la caméra vers le QR de la carte client.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-2/3 w-2/3 max-w-sm rounded-2xl border-4 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
            </div>
          )}
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          {error}
        </p>
      ) : null}

      {lastValue && !lastValue.match(CARD_PATH_RE) ? (
        <p className="rounded-lg border border-border bg-surface-muted p-3 text-sm font-semibold text-muted">
          QR détecté mais pas une carte FideliQR : <span className="font-mono">{lastValue}</span>
        </p>
      ) : null}

      <div className="flex gap-2">
        {state === "running" ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              stopCamera();
              setState("idle");
            }}
          >
            <CameraOff aria-hidden className="h-4 w-4" />
            Arrêter
          </Button>
        ) : (
          <Button type="button" onClick={startCamera} disabled={state === "starting"}>
            <Camera aria-hidden className="h-4 w-4" />
            Démarrer la caméra
          </Button>
        )}
      </div>
    </div>
  );
}
