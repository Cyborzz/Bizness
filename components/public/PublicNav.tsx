"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button, LinkButton } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils/cn";

const nav = [
  { href: "/#fonctionnement", label: "Fonctionnement" },
  { href: "/#cas-metiers", label: "Métiers" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/demo", label: "Démo" },
];

export function PublicNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition",
        scrolled ? "frosted-bar" : "bg-white/0",
      )}
    >
      <div className="container-page flex min-h-[72px] items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-3 text-base font-black tracking-normal text-ink"
        >
          <BrandMark
            size={40}
            className="shadow-lg shadow-gray-950/15 transition group-hover:rotate-6"
          />
          <span className="hidden sm:block">
            {BRAND.name}
            <span className="block text-[11px] font-bold uppercase tracking-normal text-muted">
              {BRAND.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center rounded-full border border-border bg-white px-1.5 py-1 text-sm font-semibold text-muted shadow-sm lg:flex">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 transition",
                  isActive
                    ? "bg-ink text-white shadow-sm"
                    : "hover:bg-surface-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <LinkButton href="/admin/login" variant="ghost" size="sm">
            Connexion
          </LinkButton>
          <LinkButton href="/contact" size="sm">
            Démo gratuite
          </LinkButton>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="sm:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </Button>
      </div>

      <div
        className={cn(
          "sm:hidden",
          "fixed inset-x-0 top-[72px] z-30 origin-top transition",
          open
            ? "pointer-events-auto scale-y-100 opacity-100"
            : "pointer-events-none scale-y-95 opacity-0",
        )}
      >
        <div className="mx-3 mt-2 rounded-lg border border-border bg-white p-3 shadow-xl">
          <nav className="flex flex-col">
            {nav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-3 text-sm font-semibold transition",
                    isActive ? "bg-ink text-white" : "text-ink hover:bg-surface-muted",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-2 grid gap-2 border-t border-border pt-3">
            <LinkButton href="/admin/login" variant="secondary" className="w-full">
              Connexion admin
            </LinkButton>
            <LinkButton href="/contact" className="w-full">
              Demander une démo
            </LinkButton>
          </div>
        </div>
      </div>
    </header>
  );
}
