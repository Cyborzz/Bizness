import Image from "next/image";
import { Gift, RefreshCcw, ShieldCheck, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { calculateRemainingStamps } from "@/lib/utils/format";
import { StampProgress } from "./StampProgress";

type LoyaltyCardPreviewProps = {
  business: {
    name: string;
    logo_url: string | null;
    primary_color: string;
    secondary_color?: string | null;
    card_style?: "gradient" | "solid" | "glass" | null;
    welcome_message?: string | null;
    reward_label: string;
    stamps_required: number;
  };
  card: {
    id: string;
    current_stamps: number;
    total_stamps: number;
    rewards_available: number;
    status: string;
  };
};

function buildHeaderBackground(
  primary: string,
  secondary: string | null,
  style: LoyaltyCardPreviewProps["business"]["card_style"],
) {
  const sec = secondary ?? "#0a0f1f";
  switch (style) {
    case "solid":
      return primary;
    case "glass":
      return `linear-gradient(135deg, ${primary} 0%, ${sec} 60%, #0a0f1f 100%)`;
    case "gradient":
    default:
      return `linear-gradient(135deg, ${primary}, ${sec})`;
  }
}

export function LoyaltyCardPreview({ business, card }: LoyaltyCardPreviewProps) {
  const remaining = calculateRemainingStamps(card.current_stamps, business.stamps_required);
  const hasReward = card.rewards_available > 0;
  const progress = (card.current_stamps / Math.max(business.stamps_required, 1)) * 100;
  const headerBg = buildHeaderBackground(
    business.primary_color,
    business.secondary_color ?? null,
    business.card_style ?? "gradient",
  );

  return (
    <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)] ring-1 ring-border">
      <div className="relative overflow-hidden p-5 text-white" style={{ background: headerBg }}>
        {business.card_style === "glass" ? (
          <div className="absolute inset-0 opacity-20 section-grid" />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl"
        />
        <div className="relative flex items-center gap-3">
          <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
            {business.logo_url ? (
              <Image
                src={business.logo_url}
                alt=""
                width={60}
                height={60}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-black">{business.name.slice(0, 1)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-2xl font-black tracking-tight">{business.name}</p>
            <p className="text-sm font-semibold text-white/70">{business.reward_label}</p>
          </div>
        </div>

        {business.welcome_message ? (
          <div className="relative mt-5 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-white/90 backdrop-blur">
            « {business.welcome_message} »
          </div>
        ) : null}

        <div className="relative mt-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white/60">Progression</p>
            <p className="text-6xl font-black leading-none tracking-tight tabular-nums">
              {card.current_stamps}
              <span className="text-2xl text-white/50">/{business.stamps_required}</span>
            </p>
          </div>
          <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase">
            {card.status}
          </div>
        </div>

        <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#f5b84b,#18a77a)] transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-5 p-5">
        <StampProgress
          current={card.current_stamps}
          required={business.stamps_required}
          color={business.primary_color}
        />
        <div
          className={
            hasReward
              ? "relative overflow-hidden rounded-2xl bg-mint-soft p-4 text-center"
              : "rounded-2xl bg-surface-muted p-4 text-center"
          }
        >
          {hasReward ? (
            <div
              aria-hidden
              className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-mint/20 blur-2xl"
            />
          ) : null}
          <div className="relative flex items-center justify-center gap-2">
            {hasReward ? <Sparkles aria-hidden className="h-4 w-4 text-mint" /> : null}
            <p className="text-sm font-black text-ink">
              {hasReward
                ? `🎉 ${card.rewards_available} récompense(s) disponible(s) !`
                : remaining > 0
                  ? `Plus que ${remaining} passage(s) avant votre récompense`
                  : "Récompense disponible"}
            </p>
          </div>
          <p className="relative mt-1 text-xs font-semibold text-muted">
            La carte se met à jour après chaque passage en caisse.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-3">
              <div
                className={
                  hasReward
                    ? "flex h-10 w-10 items-center justify-center rounded-lg text-white animate-pulse-ring-mint"
                    : "flex h-10 w-10 items-center justify-center rounded-lg text-white"
                }
                style={{ backgroundColor: business.primary_color }}
              >
                <Gift aria-hidden className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black tabular-nums text-ink">
                  {card.rewards_available}
                </p>
                <p className="text-xs font-semibold text-muted">récompense(s)</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-soft text-mint">
                <ShieldCheck aria-hidden className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black tabular-nums text-ink">{card.total_stamps}</p>
                <p className="text-xs font-semibold text-muted">tampons total</p>
              </div>
            </div>
          </div>
        </div>

        <LinkButton href={`/card/${card.id}`} variant="secondary" className="w-full">
          <RefreshCcw aria-hidden className="h-4 w-4" />
          Actualiser ma carte
        </LinkButton>
      </div>
    </div>
  );
}
