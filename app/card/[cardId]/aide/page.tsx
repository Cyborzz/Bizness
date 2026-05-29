import Link from "next/link";
import { ArrowLeft, Bell, Check, Download, QrCode, Smartphone, Trophy } from "lucide-react";

export const metadata = {
  title: "Comment ça marche ?",
};

const steps = [
  {
    icon: Smartphone,
    title: "Gardez votre carte sur le téléphone",
    body: "Ajoutez-la à l'écran d'accueil pour la retrouver en un clic. Aucun téléchargement d'app nécessaire.",
  },
  {
    icon: QrCode,
    title: "Présentez-vous à la caisse",
    body: "Montrez votre prénom ou le commerçant vous retrouve par téléphone. Pas besoin de tendre votre écran à chaque fois.",
  },
  {
    icon: Check,
    title: "Le commerçant ajoute un tampon",
    body: "Votre progression se met à jour automatiquement. Rafraîchissez la carte si besoin.",
  },
  {
    icon: Trophy,
    title: "Récompense débloquée",
    body: "Quand la carte est pleine, la récompense apparaît et reste utilisable jusqu'à ce que vous la fassiez valider.",
  },
  {
    icon: Bell,
    title: "Recevez les offres en exclusivité",
    body: "Activez les notifications pour être informé·e des promos et événements directement sur votre écran.",
  },
];

const installInstructions = [
  {
    os: "iPhone — Safari",
    steps: [
      "Ouvrez votre carte dans Safari (pas un autre navigateur).",
      "Touchez le bouton Partager (carré avec flèche).",
      "Choisissez « Sur l'écran d'accueil ».",
      "Validez avec « Ajouter ».",
    ],
  },
  {
    os: "Android — Chrome / Samsung Internet",
    steps: [
      "Touchez le menu (•••) en haut à droite.",
      "Choisissez « Installer l'application » ou « Ajouter à l'écran d'accueil ».",
      "Validez. L'icône apparaît avec vos autres apps.",
    ],
  },
];

export default async function CardHelpPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;
  return (
    <main className="section-grid min-h-screen bg-[#eef2f7] px-4 py-6">
      <div className="mx-auto max-w-md space-y-5">
        <Link
          href={`/card/${cardId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-ink"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Retour à ma carte
        </Link>
        <header>
          <p className="text-xs font-black uppercase tracking-normal text-primary">Aide</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Comment fonctionne ma carte fidélité ?
          </h1>
          <p className="mt-2 text-muted">
            Pas d&apos;application à télécharger. Tout se passe depuis cette page.
          </p>
        </header>

        <section className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-dark">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-ink">{step.title}</p>
                  <p className="mt-1 text-sm text-muted">{step.body}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Download aria-hidden className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-black tracking-tight text-ink">
              Installer la carte sur le téléphone
            </h2>
          </div>
          <div className="mt-4 space-y-4">
            {installInstructions.map((group) => (
              <div key={group.os}>
                <p className="text-sm font-black text-ink">{group.os}</p>
                <ol className="mt-2 space-y-2 text-sm text-muted">
                  {group.steps.map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-black text-ink">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-ink p-5 text-white shadow-xl">
          <p className="text-xs font-black uppercase text-white/55">RGPD</p>
          <h2 className="mt-2 text-lg font-black tracking-tight">
            Vos données vous appartiennent
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Vous pouvez demander la suppression complète de votre carte et de vos données à tout
            moment.
          </p>
          <Link
            href={`/card/${cardId}/supprimer`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-muted"
          >
            Demander la suppression
          </Link>
        </section>
      </div>
    </main>
  );
}
