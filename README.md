# FideliQR — Carte fidélité digitale SaaS

MVP Next.js 16 / Supabase pour vendre rapidement une carte fidélité digitale aux commerces locaux. Le client scanne un QR code, crée sa carte sur mobile, cumule des tampons et consulte ses récompenses.

## Stack

- Next.js 16 (App Router, React 19, Turbopack)
- TypeScript strict
- TailwindCSS 4
- Supabase Auth, PostgreSQL, Storage, Row Level Security
- Zod
- React Server Actions
- QRCode + BarcodeDetector (scanner)
- Web Push (VAPID)
- PWA + Service Worker (installable, offline)
- Lucide React
- Vercel

## Installation

```bash
npm install
```

## Variables d'environnement

Créer `.env.local` :

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Web Push
# Générer une fois : npx web-push generate-vapid-keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:hello@fideliqr.com

# V2 — Stripe (compte stripe.com requis)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# V2 — Email transactionnel (Resend recommandé)
RESEND_API_KEY=
RESEND_FROM=hello@fideliqr.com
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` reste uniquement côté serveur. Ne jamais l'exposer dans un composant client.

## Setup Supabase

1. Créer un projet Supabase
2. Copier les variables API dans `.env.local`
3. Exécuter `supabase/migrations/001_initial_schema.sql` (schéma de base)
4. Exécuter `supabase/migrations/002_push_geo_offers.sql` (geo, push, offres, RGPD)
5. Exécuter `supabase/seed.sql` pour créer Snack Démo
6. Créer un utilisateur Auth (Dashboard > Authentication > Add user)
7. Exécuter `supabase/bootstrap-super-admin.sql` (UUID + email du super admin)
8. Configurer SMTP Supabase pour que les invitations d'équipe et reset password partent
   (Project > Authentication > Email Templates)

## Lancement local

```bash
npm run dev
```

URLs :

- 🏠 Site public : http://localhost:3000
- 🎮 Démo interactive : http://localhost:3000/demo
- 📍 Près de vous : http://localhost:3000/nearby
- 🔐 Admin : http://localhost:3000/admin/login
- 📱 QR démo : http://localhost:3000/c/snack-demo

## Parcours commerçant (admin)

| Page | Action |
| ---- | ------ |
| `/admin/login` | Connexion + lien "Mot de passe oublié" |
| `/admin/dashboard` | KPIs + graphes 14 jours + exports CSV |
| `/admin/businesses` | Créer/modifier un commerce, design carte, position GPS |
| `/admin/businesses/[id]` | QR code + impression + stats par commerce |
| `/admin/customers` | Recherche, marketing, suppression, demandes RGPD |
| `/admin/cards` | Ajouter/retirer tampons, utiliser récompense |
| `/admin/scan` | Caméra : scanner le QR client (Chrome/Edge Android) |
| `/admin/offers` | Créer une offre, l'envoyer en push à tous les abonnés |
| `/admin/team` | Inviter owner/staff par email |
| `/admin/transactions` | Historique complet |
| `/admin/settings` | Compte + roadmap V2 |
| `/admin/export/customers` | CSV clients |
| `/admin/export/transactions` | CSV transactions |

## Parcours client

1. **Scan** du QR code au comptoir (appareil photo natif)
2. **Inscription** en 20s sur `/c/[slug]` (prénom + tel ou email)
3. **Carte** à `/card/[id]` avec design du commerce (couleurs, logo, message)
4. **Sauvegarder** : "Ajouter à l'écran d'accueil" (PWA) ou copier/partager le lien
5. **Activer les notifications** pour recevoir les offres push
6. **Présenter** le téléphone (ou le prénom) au passage suivant
7. **Page d'aide** : `/card/[id]/aide` (installation, FAQ, RGPD)
8. **Suppression données** : `/card/[id]/supprimer` (workflow RGPD)
9. **Près de vous** : `/nearby` montre les commerces FideliQR à 1.5 km

## Rôles & permissions

| Rôle | Création commerce | Modif design | Tampons | Suppression client | Envoi offre | Invitation |
| ---- | :-: | :-: | :-: | :-: | :-: | :-: |
| `super_admin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (tous rôles) |
| `business_owner` | ❌ | ✅ (sien) | ✅ | ✅ (sien) | ✅ | ✅ (staff seul) |
| `staff` | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |

Toutes les destructive actions appliquent la vérification de rôle **après** RLS Supabase.

## Notifications push

- Configurer VAPID : `npx web-push generate-vapid-keys`
- Pas de VAPID → la souscription est invisible côté client, l'admin voit un bandeau d'alerte
- Le service worker (`/sw.js`) gère push + click → ouvre l'URL CTA
- Service offline : la PWA affiche `public/offline.html` si déconnecté

**Limites importantes** (à connaître avant de promettre du géo-fence) :
- Web push fonctionne pour des **broadcasts du resto vers les abonnés** (offres, news)
- Le déclencheur géo en arrière-plan (« 1 km du resto » avec téléphone en poche) **n'est pas faisable en web** — c'est une limite navigateur, surtout iOS
- Pour le vrai géo-trigger : voir [`docs/WALLET_INTEGRATION.md`](docs/WALLET_INTEGRATION.md) — Apple Wallet + Google Wallet supportent nativement jusqu'à 10 emplacements par carte

## Architecture

```
app/
├── (public)/            # vitrine + démo + tarifs + contact + merci
├── c/[slug]/            # QR code → inscription client
├── card/[cardId]/       # carte client + aide + suppression RGPD
├── nearby/              # commerces à proximité (geolocation)
├── admin/               # dashboard, commerces, clients, cartes, scan, offres, équipe, transactions, settings, exports
├── actions/             # Server Actions (auth, business, customer, loyalty, push, offers, team, password, rgpd)
├── error.tsx / not-found.tsx / loading.tsx  # UX d'erreur globale
├── icon.tsx / apple-icon.tsx / opengraph-image.tsx  # assets dynamiques
├── icon-192.png/ / icon-512.png/  # icônes PWA
├── manifest.ts / robots.ts / sitemap.ts
proxy.ts                 # middleware Next 16 (protection /admin/*)
public/
├── sw.js                # service worker push + offline
├── offline.html         # fallback offline
supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   └── 002_push_geo_offers.sql
├── seed.sql
└── bootstrap-super-admin.sql
docs/
└── WALLET_INTEGRATION.md  # Apple Wallet + Google Wallet (V2)
```

## Commandes utiles

```bash
npm run dev                              # serveur de développement
npm run build                            # build de production
npm run start                            # serveur production local
npm run lint                             # ESLint
npx web-push generate-vapid-keys         # clés VAPID pour les push
```

## Déploiement Vercel

1. Connecter le dépôt à Vercel
2. Renseigner les variables d'env :
   - Obligatoire : 4 vars Supabase + URL
   - Notifications push : `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
3. Définir `NEXT_PUBLIC_APP_URL` sur l'URL de production (sans slash final)
4. Déployer

## Checklist mise en prod

- [ ] Variables d'env Vercel renseignées (`NEXT_PUBLIC_APP_URL` = URL prod)
- [ ] `supabase/migrations/001_initial_schema.sql` exécuté
- [ ] `supabase/migrations/002_push_geo_offers.sql` exécuté
- [ ] `supabase/bootstrap-super-admin.sql` exécuté avec votre UUID Auth
- [ ] SMTP Supabase configuré (pour invitations équipe + reset password)
- [ ] Clés VAPID générées et ajoutées en env
- [ ] Test de connexion `/admin/login`
- [ ] Test création de commerce + QR code + position GPS
- [ ] Test parcours client `/c/[slug]` → `/card/[id]` → install PWA → souscription push
- [ ] Test envoi d'une offre depuis `/admin/offers`
- [ ] Test scanner caméra `/admin/scan` (sur Android Chrome)
- [ ] Test export CSV
- [ ] Vérifier `<URL>/sitemap.xml`, `<URL>/robots.txt`, `<URL>/manifest.webmanifest`
- [ ] Tester partage social (Open Graph) avec metatags.io
- [ ] Tester reset password (réception email)

## V2 prévue (avec dépendances externes)

| Feature | Dépendance | Doc |
| ------- | ---------- | --- |
| Apple Wallet (.pkpass) + géo natif | Apple Developer 99 €/an | [docs/WALLET_INTEGRATION.md](docs/WALLET_INTEGRATION.md) |
| Google Wallet + géo natif | Google Cloud | [docs/WALLET_INTEGRATION.md](docs/WALLET_INTEGRATION.md) |
| Stripe Checkout + Billing | Compte stripe.com | À documenter |
| Email transactionnel | Compte Resend | Var `RESEND_API_KEY` prête |
| SMS / WhatsApp | Twilio / Meta Business | À documenter |
| Monitoring | Sentry | À documenter |
| Auto-signup commerçant | — | Page `/admin/businesses/new` accessible si super_admin |
