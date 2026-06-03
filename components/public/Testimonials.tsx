import { Quote, Star } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

// ⚠️ Témoignages ILLUSTRATIFS (placeholders réalistes).
// À remplacer par de vrais retours commerçants avant mise en avant publique
// (prénom + commerce + ville réels, avec leur accord). Aucun chiffre vérifiable
// n'est avancé ici pour rester honnête tant que les vrais témoignages manquent.
const testimonials = [
  {
    quote:
      "Mes clients adorent ne plus chercher leur carte papier. Au comptoir, je scanne, j'ajoute un tampon, c'est réglé en deux secondes.",
    name: "Karim",
    role: "Snack — Lyon",
    accent: "text-primary",
  },
  {
    quote:
      "Enfin je vois qui revient et qui décroche. La mise en place a pris une après-midi, pas besoin d'être à l'aise avec l'informatique.",
    name: "Sophie",
    role: "Institut de beauté — Nantes",
    accent: "text-mint",
  },
  {
    quote:
      "Mes employés peuvent tamponner sans toucher aux réglages. C'est exactement la limite dont j'avais besoin pour déléguer sereinement.",
    name: "Mehdi",
    role: "Barbier — Marseille",
    accent: "text-coral",
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-20">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-black uppercase tracking-normal text-primary">
              Paroles de commerçants
            </p>
            <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-ink">
              Conçu avec des commerces de proximité, pour le terrain.
            </h2>
            <p className="mt-4 text-muted">
              Un outil pensé au comptoir : simple à présenter, rapide à utiliser, et un suivi clair
              sans tableur ni jargon.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={index * 90}>
              <figure className="lift flex h-full flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
                <Quote aria-hidden className={`h-7 w-7 ${item.accent}`} />
                <blockquote className="mt-4 flex-1 text-[15px] leading-7 text-ink">
                  {item.quote}
                </blockquote>
                <div className="mt-5 flex items-center gap-1" aria-hidden>
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-sun text-sun" />
                  ))}
                </div>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-black text-white">
                    {item.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-black text-ink">{item.name}</span>
                    <span className="block text-xs font-semibold text-muted">{item.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
