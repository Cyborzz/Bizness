import { AlertCircle, HelpCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LoyaltyCardPreview } from "@/components/loyalty/LoyaltyCardPreview";
import { TierBadge } from "@/components/loyalty/TierBadge";
import { TransactionList } from "@/components/loyalty/TransactionList";
import { GoogleReviewCta } from "@/components/customer/GoogleReviewCta";
import { PushSubscribeButton } from "@/components/customer/PushSubscribeButton";
import { ReferralShare } from "@/components/customer/ReferralShare";
import { SaveCardActions } from "@/components/customer/SaveCardActions";
import { BirthdayReward } from "@/components/customer/BirthdayReward";
import { CardQRCode } from "@/components/customer/CardQRCode";
import { generateQRCodeDataUrl } from "@/lib/qr";
import { getVapidPublicKey } from "@/lib/push/env";
import {
  BIRTHDAY_NOTE,
  isBirthdayDue,
  startOfYearISO,
} from "@/lib/loyalty/milestones";
import { createAdminClient } from "@/lib/supabase/admin";
import { isGoogleWalletConfigured } from "@/lib/wallet/env";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  return {
    title: `Carte fidélité ${cardId.slice(0, 8)}`,
  };
}

export default async function CustomerCardPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  const supabase = createAdminClient();
  const { data: card } = await supabase
    .from("loyalty_cards")
    .select(
      "*, businesses(name,slug,logo_url,primary_color,secondary_color,card_style,welcome_message,reward_label,stamps_required,points_required,loyalty_type,is_active,birthday_reward_enabled,google_review_url), customers(birthdate)",
    )
    .eq("id", cardId)
    .maybeSingle();

  if (!card) {
    return (
      <main className="section-grid flex min-h-screen items-center justify-center bg-[#eef2f7] px-4 py-10">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-xl ring-1 ring-border">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle aria-hidden className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-ink">
            Carte introuvable
          </h1>
          <p className="mt-2 text-muted">
            Vérifiez le lien ou demandez au commerce de retrouver votre carte.
          </p>
        </div>
      </main>
    );
  }

  const business = card.businesses;
  if (!business) notFound();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("card_id", card.id)
    .order("created_at", { ascending: false })
    .limit(8);

  const inactive = card.status !== "active" || !business.is_active;

  let birthdayDue = false;
  if (
    !inactive &&
    business.birthday_reward_enabled &&
    isBirthdayDue(card.customers?.birthdate)
  ) {
    const { data: claimed } = await supabase
      .from("transactions")
      .select("id")
      .eq("card_id", card.id)
      .eq("note", BIRTHDAY_NOTE)
      .gte("created_at", startOfYearISO())
      .limit(1);
    birthdayDue = !(claimed && claimed.length > 0);
  }

  const vapidPublicKey = getVapidPublicKey();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cardUrl = `${appUrl}/card/${card.id}`;
  const qrDataUrl = inactive ? null : await generateQRCodeDataUrl(cardUrl);

  return (
    <main className="section-grid min-h-screen bg-[#eef2f7] px-4 py-6">
      <div className="mx-auto max-w-md space-y-5">
        {inactive ? (
          <div className="animate-fade-in-up flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            <AlertCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            Cette carte est inactive. Rapprochez-vous du commerce.
          </div>
        ) : null}

        <LoyaltyCardPreview business={business} card={card} />

        {inactive ? null : <TierBadge total={card.total_stamps ?? 0} />}

        {!inactive && business.google_review_url && card.rewards_available > 0 ? (
          <GoogleReviewCta url={business.google_review_url} businessName={business.name} />
        ) : null}

        {birthdayDue ? <BirthdayReward cardId={card.id} /> : null}

        {qrDataUrl ? <CardQRCode dataUrl={qrDataUrl} /> : null}

        <SaveCardActions
          url={cardUrl}
          cardLabel={`Carte ${business.name}`}
          googleWalletHref={
            !inactive && isGoogleWalletConfigured() ? `/api/wallet/google/${card.id}` : null
          }
        />

        <PushSubscribeButton
          cardId={card.id}
          vapidPublicKey={vapidPublicKey}
          businessName={business.name}
        />

        {inactive ? null : (
          <ReferralShare
            shareUrl={`${appUrl}/c/${business.slug}?ref=${card.id}`}
            businessName={business.name}
            rewardLabel={business.reward_label}
          />
        )}

        <section className="rounded-[24px] bg-white p-5 shadow-xl ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-ink">Historique</h2>
            <span className="text-xs font-bold uppercase text-muted-2">
              {transactions?.length ?? 0} entrée
              {(transactions?.length ?? 0) > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-4">
            <TransactionList transactions={transactions ?? []} />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-center gap-2 text-center text-xs text-muted">
          <Link
            href={`/card/${card.id}/aide`}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 font-semibold text-ink ring-1 ring-border hover:bg-surface-muted"
          >
            <HelpCircle aria-hidden className="h-3 w-3" />
            Comment ça marche ?
          </Link>
          <Link
            href={`/card/${card.id}/supprimer`}
            className="rounded-full bg-white px-3 py-1.5 font-semibold text-muted ring-1 ring-border hover:bg-surface-muted"
          >
            Supprimer mes données
          </Link>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs font-semibold text-muted">
          <ShieldCheck aria-hidden className="h-3.5 w-3.5 text-mint" />
          Vos données ne sont jamais revendues — partagées uniquement avec {business.name}.
        </p>

        <p className="text-center text-xs text-muted">
          Propulsé par{" "}
          <Link href="/" className="font-bold text-ink hover:underline">
            Fidélise-moi
          </Link>{" "}
          ·{" "}
          <Link href={`/c/${business.slug}`} className="hover:underline">
            Retour au commerce
          </Link>
        </p>

        {/* Anchor utilisé par SaveCardActions */}
        <div id="aide" />
      </div>
    </main>
  );
}
