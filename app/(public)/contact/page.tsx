import { Clock, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNav } from "@/components/public/PublicNav";
import { Reveal } from "@/components/ui/reveal";

export const metadata = {
  title: "Contact",
  description: "Demandez une démonstration de la carte fidélité digitale FideliQR.",
};

export default function ContactPage() {
  return (
    <>
      <PublicNav />
      <main className="section-grid py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <Reveal>
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-primary">Contact</p>
              <h1 className="mt-3 text-5xl font-black leading-tight tracking-tight text-ink">
                Demander une démo
              </h1>
              <p className="mt-4 text-muted">
                Enregistre la demande dans Supabase. Pour le MVP, pas de paiement ni
                d&apos;automatisation commerciale.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint-soft text-mint">
                    <Clock aria-hidden className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-ink">Réponse sous 24h</p>
                    <p className="text-sm text-muted">
                      Les demandes sont relevées chaque jour ouvré.
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-ink p-5 text-white shadow-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles aria-hidden className="h-4 w-4 text-sun" />
                    <p className="text-sm font-bold text-white/60">Objectif terrain</p>
                  </div>
                  <p className="mt-2 text-xl font-black">
                    Répondre vite, montrer la démo, créer le commerce.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <ContactForm />
          </Reveal>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
