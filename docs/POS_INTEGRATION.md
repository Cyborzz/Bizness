# Intégration caisse (API d'attribution automatique)

Objectif : créditer un passage fidélité **automatiquement au paiement**, sans
geste du commerçant. L'approche est volontairement agnostique : une seule API
authentifiée que n'importe quelle caisse ou outil d'automatisation peut appeler.

## Principe

1. Le commerçant génère une **clé API** dans `Admin → Intégration caisse`.
2. La caisse (ou un outil no-code) envoie une requête `POST` à chaque encaissement.
3. L'API retrouve la carte du client et crédite tampons/points selon les règles
   du commerce. Idempotent via `external_ref`.

La clé n'est affichée **qu'une seule fois** à la création. Seul son hash SHA-256
est stocké ; le préfixe `fmpos_xxxxxxxx` sert à l'identifier.

## Endpoint

```
POST /api/pos/ingest
Authorization: Bearer fmpos_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxx
Content-Type: application/json
```

### Corps

| Champ          | Type   | Requis | Description                                              |
| -------------- | ------ | ------ | ------------------------------------------------------- |
| `contact`      | string | l'un¹  | Téléphone (E.164 ou FR) ou email du client              |
| `card_id`      | uuid   | l'un¹  | Identifiant direct de la carte (alternative à `contact`)|
| `amount`       | int    | non    | Montant en points (mode points). Ignoré en mode tampons |
| `external_ref` | string | non²   | Id du ticket de caisse → garantit l'idempotence         |

¹ Fournir `contact` **ou** `card_id`.
² Fortement recommandé : sans lui, un même paiement rejoué crédite deux fois.

### Réponses

```jsonc
// 200 — crédité
{ "ok": true, "card_id": "…", "credited": 1, "current_stamps": 4,
  "threshold": 10, "rewards_available": 0, "reward_unlocked": false }

// 200 — déjà traité (external_ref connu)
{ "ok": true, "duplicate": true, "card_id": "…" }

// 401 clé invalide/révoquée · 404 carte introuvable · 429 trop de requêtes
{ "ok": false, "error": "…" }
```

### Exemple

```bash
curl -X POST https://VOTRE_DOMAINE/api/pos/ingest \
  -H "Authorization: Bearer fmpos_ab12cd34_xxxxxxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"contact":"+33612345678","external_ref":"TICKET-2026-000123"}'
```

## Brancher une caisse / un outil

L'API étant un simple webhook HTTP, plusieurs chemins selon la caisse :

- **SumUp / Square / Shopify** : configurer un webhook « paiement réussi » côté
  caisse pointant vers l'endpoint. Mapper l'identifiant client (téléphone/email
  saisi à l'encaissement, ou champ custom) vers `contact`, et l'id de transaction
  vers `external_ref`.
- **Zapier / Make / n8n** : déclencheur « nouvelle vente » → action « Webhook
  POST » vers l'endpoint avec le header `Authorization`. Idéal quand la caisse
  n'expose pas de webhook natif mais existe dans le catalogue Zapier/Make.
- **Script de caisse maison** : appel HTTP direct au moment du paiement.

> Le client doit pouvoir être identifié côté caisse (téléphone/email ou carte).
> Si la caisse ne capture pas cette donnée, privilégier le **QR comptoir**
> (`/c/[slug]/passage`) ou le **scan** admin.

## Sécurité

- Clé secrète hashée (SHA-256), comparaison à temps constant.
- Révocation immédiate depuis l'admin (`revoked_at`).
- Rate-limit par clé (600 req/min).
- Journal d'ingestion (`pos_events`) consultable, avec statut par appel.
