import { AlertCircle, CheckCircle2 } from "lucide-react";

const successMessages: Record<string, string> = {
  "stamp-added": "Tampon ajouté avec succès.",
  "stamp-removed": "Tampon retiré.",
  "reward-redeemed": "Récompense utilisée.",
  "customer-deleted": "Client supprimé.",
  "consent-updated": "Consentement mis à jour.",
  "business-created": "Commerce créé.",
  "business-updated": "Commerce mis à jour.",
  "business-deleted": "Commerce supprimé.",
  "offer-created": "Offre enregistrée en brouillon.",
  "offer-sent": "Offre envoyée aux abonnés.",
  "offer-deleted": "Offre supprimée.",
  "key-revoked": "Clé API révoquée.",
  "staff-invited": "Invitation envoyée.",
  "member-removed": "Membre retiré.",
  "password-reset-sent": "Email de réinitialisation envoyé.",
};

const errorMessages: Record<string, string> = {
  "invalid-card": "Carte invalide.",
  "card-unavailable": "Carte introuvable ou inactive.",
  "no-stamp": "Aucun tampon à retirer.",
  "stamp-cooldown":
    "Tampon déjà ajouté récemment à cette carte. Patientez avant le prochain.",
  "no-reward": "Aucune récompense disponible.",
  "invalid-customer": "Client invalide.",
  "customer-delete-failed": "Suppression du client impossible.",
  "access-denied": "Accès refusé.",
  "invalid-business": "Commerce invalide.",
  "business-delete-failed": "Suppression du commerce impossible.",
  "invalid-offer": "Offre invalide.",
  "already-sent": "Cette offre a déjà été envoyée.",
  "push-not-configured":
    "Web Push n'est pas configuré (clés VAPID manquantes).",
};

export function ToastBanner({ success, error }: { success?: string; error?: string }) {
  const message = success ? successMessages[success] : error ? errorMessages[error] : null;
  if (!message) return null;

  const isSuccess = Boolean(success);

  return (
    <div
      role="status"
      className={
        "animate-fade-in-up flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold " +
        (isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700")
      }
    >
      {isSuccess ? (
        <CheckCircle2 aria-hidden className="h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle aria-hidden className="h-4 w-4 shrink-0" />
      )}
      {message}
    </div>
  );
}
