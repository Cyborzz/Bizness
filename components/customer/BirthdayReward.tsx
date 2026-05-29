"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Cake } from "lucide-react";
import { claimBirthdayRewardAction } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { ConfettiBurst } from "@/components/ui/confetti-burst";

export function BirthdayReward({ cardId }: { cardId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [burst, setBurst] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function claim() {
    setError(null);
    startTransition(async () => {
      const result = await claimBirthdayRewardAction(cardId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setBurst((value) => value + 1);
      // Laisse le confetti s'afficher avant de rafraîchir la carte.
      setTimeout(() => router.refresh(), 900);
    });
  }

  return (
    <div className="animate-fade-in-up relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#7c3aed] to-[#2454ff] p-5 text-center text-white shadow-xl">
      <ConfettiBurst trigger={burst} />
      <div className="relative">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
          <Cake aria-hidden className="h-6 w-6" />
        </div>
        <p className="mt-3 text-lg font-black tracking-tight">
          Joyeux anniversaire ! 🎉
        </p>
        <p className="mt-1 text-sm font-semibold text-white/80">
          Une récompense vous attend. Réclamez-la et présentez votre carte au
          commerce.
        </p>
        {error ? (
          <p className="mt-3 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="mt-4 w-full"
          onClick={claim}
          disabled={pending}
        >
          {pending ? "Activation…" : "Réclamer mon cadeau 🎁"}
        </Button>
      </div>
    </div>
  );
}
