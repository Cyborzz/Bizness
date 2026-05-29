import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gift, ShieldCheck, Stamp } from "lucide-react";
import { CustomerSignupForm } from "@/components/loyalty/CustomerSignupForm";
import { FindCardForm } from "@/components/loyalty/FindCardForm";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  const name = business?.name ?? slug;
  return {
    title: `Carte fidélité — ${name}`,
    description: `Créez votre carte fidélité ${name} en 20 secondes, sans application.`,
  };
}

export default async function BusinessSignupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!business) notFound();

  const isPoints = business.loyalty_type === "points";
  const threshold = isPoints ? business.points_required ?? 100 : business.stamps_required;

  return (
    <main className="section-grid min-h-screen bg-[#eef2f7] px-4 py-6">
      <div className="mx-auto max-w-xl space-y-5">
        <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.16)] ring-1 ring-border">
          <div
            className="relative overflow-hidden p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${business.primary_color}, #0a0f1f)`,
            }}
          >
            <div className="absolute inset-0 opacity-20 section-grid" />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl"
            />
            <div className="relative flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
                {business.logo_url ? (
                  <Image
                    src={business.logo_url}
                    alt=""
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black">{business.name.slice(0, 1)}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-2xl font-black tracking-tight">{business.name}</p>
                <p className="text-sm text-white/75">Carte fidélité digitale</p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 p-5">
            <div className="flex gap-3 rounded-lg bg-surface-muted p-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: business.primary_color }}
              >
                <Stamp aria-hidden className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-ink">
                {isPoints ? (
                  <>
                    Cumulez <strong>{threshold} points</strong> pour débloquer votre récompense.
                  </>
                ) : (
                  <>
                    Cumulez <strong>{threshold} tampon(s)</strong> à chaque passage pour débloquer
                    votre récompense.
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-3 rounded-lg bg-surface-muted p-4">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: business.primary_color }}
              >
                <Gift aria-hidden className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-ink">{business.reward_label}</p>
            </div>
            <div className="flex gap-3 rounded-lg bg-surface-muted p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint text-white">
                <ShieldCheck aria-hidden className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-ink">
                Votre carte reste accessible sur téléphone à tout moment.
              </p>
            </div>
          </div>
        </section>

        <CustomerSignupForm businessSlug={business.slug} />

        <FindCardForm businessSlug={business.slug} />

        <p className="text-center text-xs text-muted">
          Propulsé par{" "}
          <Link href="/" className="font-bold text-ink hover:underline">
            FideliQR
          </Link>
        </p>
      </div>
    </main>
  );
}
