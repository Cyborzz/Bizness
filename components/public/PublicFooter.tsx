import Link from "next/link";
import { Mail, QrCode } from "lucide-react";

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
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white">
              <QrCode aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <p className="font-black text-ink">FideliQR</p>
              <p className="text-xs font-bold uppercase tracking-normal text-muted-2">
                Loyalty OS local
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            Carte fidélité digitale mobile-first pour commerces locaux. Pensé pour vendre vite,
            tester vite et apprendre avec les premiers clients.
          </p>
          <a
            href="mailto:hello@fideliqr.com"
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-bold text-ink"
          >
            <Mail aria-hidden className="h-3.5 w-3.5" />
            hello@fideliqr.com
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
          <p className="text-xs font-black uppercase tracking-normal text-muted-2">Légal</p>
          <ul className="mt-4 space-y-2 text-sm font-semibold text-ink">
            <li>RGPD ready</li>
            <li>RLS Supabase</li>
            <li>Hébergement Vercel</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} FideliQR. Tous droits réservés.</p>
          <p>Construit avec Next.js, Supabase et beaucoup de café ☕</p>
        </div>
      </div>
    </footer>
  );
}
