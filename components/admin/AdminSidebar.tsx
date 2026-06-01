"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  Camera,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand/BrandMark";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/businesses", label: "Commerces", icon: Building2 },
  { href: "/admin/customers", label: "Clients", icon: Users },
  { href: "/admin/cards", label: "Cartes", icon: CreditCard },
  { href: "/admin/scan", label: "Scanner", icon: Camera },
  { href: "/admin/offers", label: "Offres push", icon: Bell },
  { href: "/admin/transactions", label: "Transactions", icon: ListChecks },
  { href: "/admin/team", label: "Équipe", icon: Users },
  { href: "/admin/settings", label: "Réglages", icon: Settings },
];

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition",
              isActive
                ? "bg-white/10 text-white shadow-inner"
                : "text-white/60 hover:bg-white/5 hover:text-white",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive ? (
              <span
                aria-hidden
                className="absolute inset-y-2 left-0 w-1 rounded-r bg-sun"
              />
            ) : null}
            <Icon aria-hidden className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Ouvrir la navigation"
        onClick={() => setOpen(true)}
        className="focus-ring fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-white shadow-lg lg:hidden"
      >
        <Menu aria-hidden className="h-5 w-5" />
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-ink text-white shadow-2xl transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-20 items-center justify-between px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-3 font-black">
            <BrandMark size={44} className="ring-1 ring-white/15" />
            <span>
              {BRAND.name}
              <span className="block text-[11px] font-bold uppercase tracking-normal text-white/50">
                Back office
              </span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Fermer la navigation"
            onClick={() => setOpen(false)}
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 lg:hidden"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>
        <NavLinks pathname={pathname} />
        <div className="hidden p-4 lg:block">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sun text-ink shadow-md">
              <BarChart3 aria-hidden className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-black">MVP terrain</p>
            <p className="mt-1 text-xs leading-5 text-white/55">
              Crée un commerce, partage le QR, ajoute les tampons. Tout reste lisible.
            </p>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      ) : null}
    </>
  );
}
