# Intégration Apple Wallet & Google Wallet (V2)

Cette doc décrit comment ajouter le support **Apple Wallet (.pkpass)** et **Google Wallet (Loyalty Card)** à FideliQR. Ces formats supportent nativement les **notifications géolocalisées** déclenchées par l'OS — la vraie solution à « ping le client quand il passe à 1km ».

---

## Pourquoi Wallet plutôt que Web Push ?

| Capacité                                 | Web Push  | Apple/Google Wallet |
| ---------------------------------------- | :-------: | :-----------------: |
| Notifications quand l'app est fermée     |     ✅    |          ✅         |
| Notification quand le téléphone est verrouillé |  ✅    |          ✅         |
| **Géofence native (background)**         |     ❌    |          ✅         |
| Ne nécessite pas d'ouvrir la PWA         |     ✅    |          ✅         |
| Apparaît dans Cartes/Wallet              |     ❌    |          ✅         |
| Mises à jour serveur de la carte         |   limité  |          ✅         |

---

## Apple Wallet (.pkpass)

### Prérequis
- Compte **Apple Developer** (99 €/an) : https://developer.apple.com
- Créer un **Pass Type ID** dans le portail Apple Developer.
- Générer un certificat de signature **Pass Type Certificate** (.p12).
- Récupérer le **Apple Worldwide Developer Relations** certificate (WWDR).

### Variables d'environnement à ajouter
```bash
APPLE_PASS_TYPE_ID=pass.com.fideliqr.loyalty
APPLE_TEAM_ID=ABCDE12345
APPLE_PASS_CERTIFICATE_BASE64=...   # contenu de .p12 base64
APPLE_PASS_CERTIFICATE_PASSWORD=
APPLE_WWDR_CERTIFICATE_BASE64=...
```

### Architecture proposée
- `app/wallet/apple/[cardId]/route.ts` : génère et sert un `.pkpass` signé.
- Le `.pkpass` embarque jusqu'à **10 entrées `locations`** (lat/lng + 1km radius) — l'iPhone notifie automatiquement quand l'utilisateur s'en approche.
- Le pass contient un **`webServiceURL`** + `authenticationToken` pour les mises à jour serveur quand le nombre de tampons change.

### Librairie recommandée
- [`@walletpass/pass-js`](https://github.com/walletpass/pass-js) ou [`passkit-generator`](https://github.com/alexandercerutti/passkit-generator)

### Bouton dans la carte client
```tsx
<a
  href={`/wallet/apple/${cardId}`}
  className="..."
>
  Ajouter à Apple Wallet
</a>
```

---

## Google Wallet (Loyalty Class)

### Prérequis
- Compte Google Cloud + projet activé pour **Google Wallet API**.
- Créer un **Issuer Account** (gratuit).
- Service account JSON pour signer les JWT.

### Variables d'environnement à ajouter
```bash
GOOGLE_WALLET_ISSUER_ID=
GOOGLE_WALLET_SERVICE_ACCOUNT_JSON=  # JSON stringifié ou base64
```

### Architecture proposée
- `app/wallet/google/[cardId]/route.ts` : génère un JWT `loyaltyObject`, redirige vers `https://pay.google.com/gp/v/save/{jwt}`.
- Google Wallet supporte aussi des **locations** (jusqu'à 10) avec notifications.
- Mise à jour des points via l'API REST `loyaltyobject.patch`.

### Librairie recommandée
- [`google-auth-library`](https://www.npmjs.com/package/google-auth-library) pour signer le JWT.

---

## Mise à jour temps réel des cartes

Pour qu'Apple/Google Wallet affichent le bon nombre de tampons :
1. Quand un tampon est ajouté (server action `addStampAction`), pinger l'API Apple/Google.
2. Apple Wallet : POST `/v1/devices/{deviceID}/registrations/{passTypeID}` puis push silencieux APNs.
3. Google Wallet : PATCH le `loyaltyObject` correspondant.

Un job Supabase Edge Function ou un cron Vercel peut aussi mettre à jour en batch.

---

## Géolocalisation : limites à connaître

- iOS : 10 emplacements max par .pkpass, rayon ~100m, notification déclenchée à l'approche.
- Android : Google Wallet supporte ~10 emplacements aussi, déclenchement géo natif.
- Les coordonnées sont stockées **par le téléphone** (jamais envoyées en push) → pas de risque RGPD.

---

## Quand passer à un vrai app natif ?

Si FideliQR doit :
- Personnaliser les rayons par client/segment dynamiquement
- Combiner géoloc + plages horaires personnalisées
- Notifier plus de 10 lieux par carte

→ App React Native ou Flutter avec Firebase Cloud Messaging + Geofencing API natif.

---

## TL;DR

1. Achète un compte Apple Developer + Google Wallet issuer.
2. Pose les variables d'env ci-dessus.
3. Crée les routes `app/wallet/apple/[cardId]/route.ts` et `app/wallet/google/[cardId]/route.ts`.
4. Ajoute un bouton « Ajouter à Wallet » dans `app/card/[cardId]/page.tsx`.
5. Géofence : remplis `latitude`/`longitude` sur chaque commerce (déjà supporté dans le BusinessForm).
6. Les clients reçoivent automatiquement la notif quand ils passent à 1km. 🎯
