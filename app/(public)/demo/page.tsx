import { DemoLoyaltyCard } from "@/components/public/DemoLoyaltyCard";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNav } from "@/components/public/PublicNav";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Démonstration",
  description:
    "Démonstration interactive d'une carte fidélité digitale : ajoutez des tampons, débloquez une récompense.",
};

export default function DemoPage() {
  return (
    <>
      <PublicNav />
      <main className="section-grid py-14">
        <div className="container-page">
          <Reveal>
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-normal text-primary">
                Démonstration interactive
              </p>
              <h1 className="mt-3 text-5xl font-black leading-tight tracking-tight text-ink">
                Testez le parcours client et le mode caisse.
              </h1>
              <p className="mt-4 text-muted">
                Ajoutez des tampons comme un employé, regardez la carte client se mettre à jour et
                déclenchez la récompense lorsque la progression arrive à 10.
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-8">
              <DemoLoyaltyCard />
            </div>
          </Reveal>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
