import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScanLine } from "lucide-react";
import { PassageForm } from "@/components/loyalty/PassageForm";
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
    title: `Valider mon passage — ${name}`,
    description: `Validez votre passage chez ${name} et cumulez votre fidélité.`,
  };
}

export default async function PassagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("name,slug,logo_url,primary_color,loyalty_type,is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!business) notFound();

  const isPoints = business.loyalty_type === "points";

  return (
    <main className="section-grid min-h-screen bg-[#eef2f7] px-4 py-6">
      <div className="mx-auto max-w-md space-y-5">
        <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.16)] ring-1 ring-border">
          <div
            className="relative overflow-hidden p-6 text-white"
            style={{ background: `linear-gradient(135deg, ${business.primary_color}, #0a0f1f)` }}
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
                <p className="flex items-center gap-1.5 text-sm text-white/75">
                  <ScanLine aria-hidden className="h-4 w-4" />
                  Validation de passage
                </p>
              </div>
            </div>
          </div>
        </section>

        <PassageForm businessSlug={business.slug} isPoints={isPoints} />

        <p className="text-center text-xs text-muted">
          Propulsé par{" "}
          <Link href="/" className="font-bold text-ink hover:underline">
            Fidélise-moi
          </Link>
        </p>
      </div>
    </main>
  );
}
