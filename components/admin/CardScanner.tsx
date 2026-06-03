"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { Camera, CameraOff, ScanLine, ZapOff } from "lucide-react";
import { Button, LinkButton } from "@/components/ui/button";

type ScannerState = "idle" | "starting" | "running" | "unsupported" | "denied";
type NativeQrDetector = {
  detect: (source: CanvasImageSource) => Promise<Array<{ rawValue: string }>>;
};

const CARD_PATH_RE = /\/card\/([0-9a-f-]{36})/i;
const SCAN_INTERVAL_MS = 150;

declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => NativeQrDetector;
  }
}

export function CardScanner({ allowManualSearch = true }: { allowManualSearch?: boolean }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastScanRef = useRef(0);
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

  async function detectQrValue(
    video: HTMLVideoElement,
    detector: NativeQrDetector | null,
  ) {
    if (detector) {
      const codes = await detector.detect(video);
      return codes[0]?.rawValue ?? null;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return null;

    const scale = Math.min(1, 720 / width);
    const scanWidth = Math.max(1, Math.floor(width * scale));
    const scanHeight = Math.max(1, Math.floor(height * scale));
    const canvas = canvasRef.current ?? document.createElement("canvas");
    canvasRef.current = canvas;
    canvas.width = scanWidth;
    canvas.height = scanHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, scanWidth, scanHeight);
    const image = ctx.getImageData(0, 0, scanWidth, scanHeight);
    const result = jsQR(image.data, scanWidth, scanHeight, {
      inversionAttempts: "attemptBoth",
    });

    return result?.data ?? null;
  }

  async function startCamera() {
    setError(null);
    setLastValue(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      setError(
        allowManualSearch
          ? "Camera indisponible sur ce navigateur. Utilisez la recherche dans Cartes."
          : "Camera indisponible sur ce navigateur. Demandez au responsable d'ouvrir la carte.",
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

      const detector = window.BarcodeDetector
        ? new window.BarcodeDetector({ formats: ["qr_code"] })
        : null;
      setState("running");
      if (!detector) {
        setError(
          "Mode compatibilite actif. Si le QR ne passe pas, rapprochez le telephone et augmentez la luminosite.",
        );
      }

      const detect = async () => {
        if (!videoRef.current) return;
        const now = performance.now();
        if (now - lastScanRef.current < SCAN_INTERVAL_MS) {
          rafRef.current = requestAnimationFrame(detect);
          return;
        }
        lastScanRef.current = now;

        try {
          const value = await detectQrValue(videoRef.current, detector);
          if (value) {
            setLastValue(value);
            const match = value.match(CARD_PATH_RE);
            if (match) {
              stopCamera();
              router.push(`/admin/cards?card=${match[1]}`);
              return;
            }
          }
        } catch {
          // On retente au frame suivant.
        }
        rafRef.current = requestAnimationFrame(detect);
      };
      rafRef.current = requestAnimationFrame(detect);
    } catch (err) {
      stopCamera();
      const e = err as { name?: string };
      if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
        setState("denied");
        setError("Camera refusee. Autorisez-la dans les reglages du navigateur.");
      } else {
        setState("unsupported");
        setError("Impossible de demarrer la camera.");
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
            aria-label="Apercu camera"
          />
          {state !== "running" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/80 text-white">
              {state === "starting" ? (
                <>
                  <Camera aria-hidden className="h-8 w-8 animate-pulse" />
                  <p className="text-sm font-semibold">Demarrage de la camera...</p>
                </>
              ) : state === "denied" ? (
                <>
                  <CameraOff aria-hidden className="h-8 w-8 text-coral" />
                  <p className="max-w-xs text-center text-sm font-semibold">
                    Camera refusee. Autorisez-la dans les reglages pour scanner.
                  </p>
                </>
              ) : state === "unsupported" ? (
                <>
                  <ZapOff aria-hidden className="h-8 w-8 text-sun" />
                  <p className="max-w-xs text-center text-sm font-semibold">
                    {allowManualSearch ? (
                      <>
                        Camera indisponible ici. Utilisez la recherche manuelle dans{" "}
                        <strong>Cartes</strong>.
                      </>
                    ) : (
                      "Camera indisponible ici. Demandez au responsable d'ouvrir la carte."
                    )}
                  </p>
                </>
              ) : (
                <>
                  <ScanLine aria-hidden className="h-8 w-8 text-sun" />
                  <p className="max-w-xs text-center text-sm font-semibold">
                    Pointez la camera vers le QR de la carte client.
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
          QR detecte mais pas une carte Fidelise-moi :{" "}
          <span className="font-mono">{lastValue}</span>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {state === "running" ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              stopCamera();
              setState("idle");
              setError(null);
            }}
          >
            <CameraOff aria-hidden className="h-4 w-4" />
            Arreter
          </Button>
        ) : (
          <Button type="button" onClick={startCamera} disabled={state === "starting"}>
            <Camera aria-hidden className="h-4 w-4" />
            Demarrer la camera
          </Button>
        )}
        {allowManualSearch ? (
          <LinkButton href="/admin/cards" variant="secondary">
            Recherche client
          </LinkButton>
        ) : null}
      </div>
    </div>
  );
}
