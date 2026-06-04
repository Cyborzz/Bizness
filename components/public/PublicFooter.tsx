import Link from "next/link";
import { Mail } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { BRAND } from "@/lib/brand";

const productLinks = [
  { href: "/demo", label: "Démo interactive" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/contact", label: "Demander une démo" },
];

const usefulLinks = [
  { href: "/admin/login", label: "Connexion admin" },
  { href: "/c/snack-demo", label: "QR public démo" },
];

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <BrandMark size={40} />
            <div>
              <p className="font-black text-ink">{BRAND.name}</p>
              <p className="text-xs font-bold uppercase tracking-normal text-muted-2">
                {BRAND.tagline}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            Carte fidélité digitale mobile-first pour commerces locaux : QR code, carte mobile,
            tampons, rôles équipe et suivi responsable.
          </p>
          <a
            href={`mailto:${BRAND.email}`}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-bold text-ink"
          >
            <Mail aria-hidden className="h-3.5 w-3.5" />
            {BRAND.email}
          </a>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-normal text-muted-2">Produit</p>
          <ul className="mt-4 space-y-2 text-sm font-semibold text-ink">
            {productLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-normal text-muted-2">Pratique</p>
          <ul className="mt-4 space-y-2 text-sm font-semibold text-ink">
            {usefulLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-normal text-muted-2">Confiance</p>
          <ul className="mt-4 space-y-2 text-sm font-semibold text-ink">
            <li>Données clients séparées</li>
            <li>Accès par rôle</li>
            <li>Hébergement VPS sécurisé</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name}. Tous droits réservés.</p>
          <p>Hébergé en France · Conforme RGPD</p>
        </div>
      </div>
    </footer>
  );
}
