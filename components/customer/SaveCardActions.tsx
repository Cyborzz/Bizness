"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Download, Mail, Share2, Smartphone, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  url: string;
  cardLabel: string;
  googleWalletHref?: string | null;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const canShareInitial =
  typeof navigator !== "undefined" && typeof navigator.share === "function";

export function SaveCardActions({ url, cardLabel, googleWalletHref }: Props) {
  const [copied, setCopied] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [canShare] = useState(canShareInitial);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  }, [url]);

  const share = useCallback(async () => {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") return;
    try {
      await navigator.share({
        title: cardLabel,
        text: "Ma carte fidélité",
        url,
      });
    } catch {
      // user cancelled
    }
  }, [cardLabel, url]);

  const install = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
    }
    setInstallPrompt(null);
  }, [installPrompt]);

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mint-soft text-mint">
          <Smartphone aria-hidden className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-ink">Sauvegardez votre carte</p>
          <p className="mt-1 text-sm text-muted">
            Pour la retrouver à chaque passage. Ajoutez à l&apos;écran d&apos;accueil ou envoyez-la
            par message.
          </p>
        </div>
      </div>
      {googleWalletHref ? (
        <a
          href={googleWalletHref}
          className="focus-ring btn-press mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition hover:bg-ink-2"
        >
          <Wallet aria-hidden className="h-5 w-5" />
          Ajouter à Google Wallet
        </a>
      ) : null}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {installed ? (
          <div className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm font-semibold text-mint">
            <Check aria-hidden className="mr-1 inline h-4 w-4" />
            Installée sur l&apos;écran d&apos;accueil
          </div>
        ) : installPrompt ? (
          <Button type="button" onClick={install}>
            <Download aria-hidden className="h-4 w-4" />
            Ajouter à l&apos;écran d&apos;accueil
          </Button>
        ) : (
          <a
            href="#aide"
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-ink ring-1 ring-border transition hover:bg-surface-muted"
          >
            <Download aria-hidden className="h-4 w-4" />
            Comment l&apos;installer ?
          </a>
        )}
        {canShare ? (
          <Button type="button" variant="secondary" onClick={share}>
            <Share2 aria-hidden className="h-4 w-4" />
            Partager le lien
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={copy}>
          <Copy aria-hidden className="h-4 w-4" />
          {copied ? "Copié !" : "Copier le lien"}
        </Button>
        <a
          href={`mailto:?subject=${encodeURIComponent("Ma carte fidélité")}&body=${encodeURIComponent(url)}`}
          className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-ink ring-1 ring-border transition hover:bg-surface-muted"
        >
          <Mail aria-hidden className="h-4 w-4" />
          Envoyer par email
        </a>
      </div>
    </div>
  );
}
