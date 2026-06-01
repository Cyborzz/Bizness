import { MapPin } from "lucide-react";
import { NearbyBusinesses } from "@/components/customer/NearbyBusinesses";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNav } from "@/components/public/PublicNav";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Près de vous",
  description: "Trouvez les commerces Fidélise-moi autour de vous.",
};

export default async function NearbyPage() {
  const supabase = createAdminClient();
  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, slug, name, latitude, longitude, primary_color")
    .eq("is_active", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  const businessIds = (businesses ?? []).map((b) => b.id);

  const offersByBusiness: Record<string, { title: string; body: string } | null> = {};
  if (businessIds.length > 0) {
    const { data: offers } = await supabase
      .from("offers")
      .select("business_id,title,body,sent_at")
      .in("business_id", businessIds)
      .eq("status", "sent")
      .order("sent_at", { ascending: false });

    for (const offer of offers ?? []) {
      if (!offersByBusiness[offer.business_id]) {
        offersByBusiness[offer.business_id] = {
          title: offer.title,
          body: offer.body,
        };
      }
    }
  }

  const nearbyList =
    (businesses ?? [])
      .filter((b): b is typeof b & { latitude: number; longitude: number } =>
        b.latitude !== null && b.longitude !== null,
      )
      .map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        latitude: b.latitude,
        longitude: b.longitude,
        primary_color: b.primary_color,
        latest_offer_title: offersByBusiness[b.id]?.title ?? null,
        latest_offer_body: offersByBusiness[b.id]?.body ?? null,
      })) ?? [];

  return (
    <>
      <PublicNav />
      <main className="section-grid py-14">
        <div className="container-page max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary-dark">
              <MapPin aria-hidden className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-normal text-primary">
                Géolocalisation
              </p>
              <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
                Près de vous
              </h1>
            </div>
          </div>
          <p className="mt-4 text-muted">
            Autorisez la géolocalisation : on vous montre les commerces Fidélise-moi à proximité et
            leurs offres en cours. Vos coordonnées ne sont jamais stockées.
          </p>
          <div className="mt-6">
            <NearbyBusinesses businesses={nearbyList} radiusMeters={1500} />
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
