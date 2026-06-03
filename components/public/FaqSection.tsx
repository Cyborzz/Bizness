import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const faqs = [
  {
    q: "Mes clients doivent-ils installer une application ?",
    a: "Non. Le client scanne le QR code en caisse, crée sa carte dans son navigateur et l'ajoute à son écran d'accueil s'il le souhaite. Aucun téléchargement sur un store.",
  },
  {
    q: "Combien de temps pour démarrer ?",
    a: "En général 48h : on crée votre commerce, on personnalise la carte (couleurs, logo, récompense) et on vous fournit le QR code prêt à afficher au comptoir.",
  },
  {
    q: "Les données de mes clients sont-elles protégées ?",
    a: "Oui. Hébergement sur serveur dédié en France, données séparées par commerce, accès par rôle, et parcours RGPD intégré (consentement et suppression à la demande).",
  },
  {
    q: "Sur quels appareils ça fonctionne ?",
    a: "La carte client fonctionne sur tout smartphone récent via le navigateur. Le scanner du staff utilise la caméra sur Chrome ou Edge (Android) ; sinon la recherche par prénom ou téléphone reste disponible.",
  },
  {
    q: "Puis-je personnaliser la carte et la récompense ?",
    a: "Oui : couleurs, logo, message, nombre de tampons requis et libellé de la récompense se règlent depuis l'administration, par commerce.",
  },
  {
    q: "Y a-t-il un engagement ?",
    a: "Non, c'est sans engagement. Vous pouvez arrêter quand vous le souhaitez et demander l'export ou la suppression de vos données.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-white py-20">
      <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <Reveal>
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-black uppercase tracking-normal text-primary">
              Questions fréquentes
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
              Tout ce qu&apos;un commerçant demande avant de se lancer.
            </h2>
            <p className="mt-4 text-muted">
              Une réponse manque ? Écrivez-nous, on répond clairement, sans jargon.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-3">
          {faqs.map((faq, index) => (
            <Reveal key={faq.q} delay={index * 50}>
              <details className="group rounded-2xl border border-border bg-surface-muted px-5 open:bg-white open:shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-black text-ink [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <ChevronDown
                    aria-hidden
                    className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="pb-5 pr-8 text-sm leading-7 text-muted">{faq.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
