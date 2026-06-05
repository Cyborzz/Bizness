"use client";

import { useCallback, useState } from "react";
import { Check, Copy, Gift, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_GREEN = "#25D366";

export function ReferralShare({
  shareUrl,
  businessName,
  rewardLabel,
}: {
  shareUrl: string;
  businessName: string;
  rewardLabel?: string | null;
}) {
  const [copied, setCopied] = useState(false);

  const message = rewardLabel
    ? `Rejoins la carte de fidélité ${businessName} 🎁 On gagne tous les deux une récompense (${rewardLabel}) ! ${shareUrl}`
    : `Rejoins la carte de fidélité ${businessName} 🎁 On gagne tous les deux une récompense ! ${shareUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  }, [shareUrl]);

  const share = useCallback(async () => {
    if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
      void copy();
      return;
    }
    try {
      await navigator.share({ title: `Carte ${businessName}`, text: message, url: shareUrl });
    } catch {
      // user cancelled
    }
  }, [businessName, copy, message, shareUrl]);

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sun-soft text-[#9a5b00]">
          <Gift aria-hidden className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-ink">Parrainez un ami</p>
          <p className="mt-1 text-sm text-muted">
            Votre ami crée sa carte avec votre lien&nbsp;: vous recevez{" "}
            <strong>chacun une récompense</strong>.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring btn-press inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition hover:brightness-110"
          style={{ backgroundColor: WHATSAPP_GREEN }}
        >
          <Share2 aria-hidden className="h-4 w-4" />
          Partager sur WhatsApp
        </a>
        <Button type="button" variant="secondary" onClick={share}>
          <Share2 aria-hidden className="h-4 w-4" />
          Autres apps
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={copy}
          className="sm:col-span-2"
        >
          {copied ? (
            <>
              <Check aria-hidden className="h-4 w-4" />
              Lien copié !
            </>
          ) : (
            <>
              <Copy aria-hidden className="h-4 w-4" />
              Copier mon lien de parrainage
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
