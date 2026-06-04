# Roadmap — Pass Apple Wallet & Google Wallet

> Analyse / plan d'implémentation. Aucun code n'est encore écrit côté wallet.
> Objectif : permettre au client d'ajouter sa carte de fidélité dans **Apple Wallet**
> et **Google Wallet**, avec mise à jour automatique du nombre de tampons.

## 1. Pourquoi (contexte marché)

Tous les concurrents sérieux en font leur argument n°1 :

- **Loopy Loyalty** : « Digital stamp cards for Apple & Google Wallet » (titre du hero).
- **Stamp Me**, **Square Loyalty**, **Fivestars** : pass wallet natifs.

Aujourd'hui, Fidélise-moi propose le **PWA « ajouter à l'écran d'accueil »** (voir
[components/customer/SaveCardActions.tsx](../components/customer/SaveCardActions.tsx)).
C'est plus léger, mais :

- Le pass wallet natif est **attendu** par les commerçants et les clients.
- Il vit dans une app système connue (Wallet), avec **mise à jour live** des tampons
  et **notifications de proximité / lock screen**.

C'est le différenciateur le plus structurant qu'il nous manque. À mettre en avant
en marketing **une fois livré** (cf. section « Ce qui nous différencie » de la home).

## 2. État actuel (ce sur quoi on s'appuie)

- Carte client : [app/card/[cardId]/page.tsx](../app/card/[cardId]/page.tsx)
- Logique tampons / récompenses : [app/actions/loyalty.ts](../app/actions/loyalty.ts)
- Personnalisation par commerce (couleurs, logo, libellé récompense) : déjà en base.
- Supabase (Postgres + RLS) : source de vérité des cartes et transactions.
- Next.js 16 App Router : les **Route Handlers** (`app/api/...`) serviront les pass
  et les endpoints de mise à jour.

La donnée existe déjà (carte, tampons requis, tampons actuels, design commerce) :
le wallet est une **nouvelle surface de présentation + un canal de mise à jour**, pas
un nouveau modèle métier.

## 3. Cible fonctionnelle

1. Sur `/card/[cardId]`, deux boutons : **« Ajouter à Apple Wallet »** et
   **« Ajouter à Google Wallet »** (en plus du « écran d'accueil » actuel).
2. Quand le staff ajoute un tampon, le pass se met à jour **tout seul** (sans que le
   client rouvre quoi que ce soit).
3. À la récompense débloquée : champ « Récompense prête » visible sur le pass.

## 4. Apple Wallet (PassKit)

### Prérequis (compte)
- **Apple Developer Program** (99 $/an).
- Créer un **Pass Type ID** (`pass.fr.fidelise-moi.loyalty`).
- Générer le **certificat de signature** du Pass Type ID (`.p12`) + le certificat
  **Apple WWDR**. Ces fichiers sont des **secrets** → jamais dans le repo, montés via
  `.env.production` (base64) ou fichiers protégés sur le VPS.

### Format du pass
- Un `.pkpass` = archive zip signée contenant :
  - `pass.json` (type **`storeCard`** : tampons en `secondaryFields` /
    `auxiliaryFields`, libellé récompense, couleurs = design du commerce).
  - Images : `icon.png`, `logo.png`, `strip.png` (déclinées @2x/@3x).
  - `manifest.json` (SHA1 de chaque fichier) + `signature` (PKCS#7 détachée).
- Champs clés à activer pour les updates : `webServiceURL`, `authenticationToken`
  (un token aléatoire **par carte**, stocké en base).

### Librairie Node
- [`passkit-generator`](https://github.com/alexandercerutti/passkit-generator)
  (génération + signature `.pkpass`), ou
  [`pass-js`](https://github.com/tinovyatkin/pass-js).

### Route de distribution
- `GET /api/wallet/apple/[cardId]` → renvoie le `.pkpass`
  (`Content-Type: application/vnd.apple.pkpass`).

### Web service de mise à jour (obligatoire pour le live)
Implémenter le protocole PassKit (auth header `Authorization: ApplePass <token>`) :

| Méthode | Route | Rôle |
| --- | --- | --- |
| `POST` | `/api/wallet/apple/v1/devices/{deviceId}/registrations/{passTypeId}/{serial}` | Enregistre l'appareil + son **push token** |
| `DELETE` | idem | Désenregistre |
| `GET` | `/api/wallet/apple/v1/devices/{deviceId}/registrations/{passTypeId}?passesUpdatedSince=...` | Liste les serials modifiés |
| `GET` | `/api/wallet/apple/v1/passes/{passTypeId}/{serial}` | Renvoie le pass à jour |
| `POST` | `/api/wallet/apple/v1/log` | Journaux Apple (debug) |

### Déclenchement de l'update
- À chaque tampon ajouté (dans `app/actions/loyalty.ts`), envoyer un **push APNs vide**
  aux push tokens enregistrés (topic = Pass Type ID, signé avec le cert Pass Type ID).
- Apple Wallet rappelle alors le `GET .../passes/...` pour récupérer le pass régénéré.

## 5. Google Wallet (Wallet API)

### Prérequis (compte)
- **Google Cloud project** + **Google Wallet API** activée.
- **Service account** (clé JSON = secret) avec accès Wallet.
- Un **Issuer ID** (console Google Pay & Wallet).

### Modèle
- **Loyalty Class** : 1 par commerce (programme, logo, couleurs, libellé récompense).
- **Loyalty Object** : 1 par carte client (référence la class, `loyaltyPoints` =
  tampons, `accountId`, code-barres/QR, `secondaryFields`).

### Ajout au wallet
- Bouton « Add to Google Wallet » = lien `https://pay.google.com/gp/v/save/{JWT}`.
- Le **JWT** (RS256, signé avec la clé du service account) embarque le/les
  loyaltyObject(s) + `origins`. Librairie : `google-auth-library` + REST Wallet.

### Mise à jour
- `PATCH`/`UPDATE` du loyaltyobject (nouveau `loyaltyPoints`, état récompense).
- Google propage la mise à jour **automatiquement** : pas de push par appareil à gérer
  (plus simple qu'Apple).

## 6. Changements de données (Supabase)

Nouvelle table (ex. `wallet_passes`) liée à `cards` :

- `card_id` (fk)
- `platform` (`apple` | `google`)
- `serial` / `object_id`
- `auth_token` (Apple)
- `device_push_tokens` (Apple, 1..n) — table fille `wallet_devices`
- `updated_at`

Hook commun : un util `lib/wallet/notifyPassUpdate(cardId)` appelé après chaque
mutation de tampon (un seul point d'entrée, déjà centralisé dans `loyalty.ts`).

## 7. Plan de fichiers (proposé)

```
lib/wallet/
  apple.ts        # build + signe le .pkpass (passkit-generator)
  google.ts       # crée class/object + JWT "save"
  notify.ts       # notifyPassUpdate(cardId) -> APNs (Apple) + PATCH (Google)
app/api/wallet/
  apple/[cardId]/route.ts          # GET .pkpass
  apple/v1/.../route.ts            # web service PassKit (registrations, passes, log)
  google/[cardId]/route.ts         # GET -> redirect lien "save"
components/customer/
  SaveCardActions.tsx              # + boutons Apple/Google Wallet
```

## 8. Secrets & déploiement OVH

- Apple : `.p12` (base64), mot de passe du `.p12`, cert WWDR, `APPLE_PASS_TYPE_ID`,
  `APPLE_TEAM_ID`.
- Google : `GOOGLE_WALLET_ISSUER_ID`, clé de service (JSON base64).
- Ajouter au modèle [.env.production.example](../.env.production.example) **les noms
  des variables uniquement** (jamais les valeurs).
- Rappel : `NEXT_PUBLIC_*` non concernés ici (tout est côté serveur). Pas besoin de
  rebuild pour changer un secret serveur — sauf si on expose un flag public.

## 9. Phasage proposé

1. **Phase 1 — Google Wallet d'abord** (le plus simple : pas de push par appareil,
   pas de certificat payant). Bouton « Add to Google Wallet » + update auto. *(~2–3 j)*
2. **Phase 2 — Apple Wallet** : compte développeur, certificats, génération `.pkpass`,
   bouton d'ajout. *(~3–4 j)*
3. **Phase 3 — Updates live Apple** : web service PassKit + push APNs sur ajout de
   tampon. *(~3–5 j)*
4. **Phase 4 — Marketing** : mettre Apple/Google Wallet dans le hero et la section
   « Ce qui nous différencie ».

## 10. Risques / points d'attention

- **Coût Apple** : 99 $/an + renouvellement annuel des certificats (à monitorer).
- **Sécurité** : les certificats/clés sont des secrets critiques → coffre / fichiers
  600 sur le VPS, jamais commités.
- **APNs** : bien isoler l'envoi push (échecs partiels = retry/backoff).
- **RGPD** : le pass contient des données client → couvrir dans la politique existante
  (export/suppression doivent aussi retirer les pass).

## Sources

- [passkit-generator (Node.js)](https://github.com/alexandercerutti/passkit-generator)
- [pass-js (Node.js)](https://github.com/tinovyatkin/pass-js)
- [PassKit Node quickstart (Apple + Google)](https://github.com/PassKit/passkit-node-quickstart)
- [Guide web service Apple Wallet (Node.js)](https://medium.com/@raidiaz/build-a-web-service-for-apple-wallet-passes-with-node-js-b6bf77b4282f)
