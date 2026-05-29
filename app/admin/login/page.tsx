import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = {
  title: "Connexion admin",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const success = typeof params.success === "string" ? params.success : undefined;

  return (
    <main className="section-grid relative flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(36,84,255,0.45),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-160px] right-1/4 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(245,184,75,0.25),transparent_70%)] blur-3xl"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur">
            <ShieldCheck aria-hidden className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-black uppercase tracking-normal text-sun">Admin</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight">Connexion</h1>
          <p className="mt-2 text-sm text-white/60">Accès sécurisé par Supabase Auth.</p>
        </div>
        <LoginForm success={success} />
      </div>
    </main>
  );
}
