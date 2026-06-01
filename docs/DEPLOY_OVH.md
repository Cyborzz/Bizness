# Deploiement OVH VPS

Ce projet doit tourner sur un serveur Node.js. Le deploiement recommande ici utilise Docker pour Next.js et Caddy pour HTTPS automatique.

## 1. DNS OVH

Dans la zone DNS de `fidelise-moi.fr`, creer ou modifier :

```txt
@    A    IP_DU_VPS
www  A    IP_DU_VPS
```

Attendre la propagation DNS, parfois quelques minutes, parfois plusieurs heures.

## 2. Connexion au VPS

Depuis Windows PowerShell :

```bash
ssh ubuntu@IP_DU_VPS
```

Si OVH a donne un utilisateur different, utiliser celui-la, par exemple :

```bash
ssh root@IP_DU_VPS
```

## 3. Preparation serveur

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl git ufw

sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

## 4. Installation Docker

Essayer d'abord l'installation officielle Docker :

```bash
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"${UBUNTU_CODENAME:-$VERSION_CODENAME}\") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

Se deconnecter puis se reconnecter en SSH pour activer le groupe `docker`.

Verifier :

```bash
docker --version
docker compose version
```

Si le depot Docker officiel n'est pas encore disponible pour Ubuntu 26.04, utiliser temporairement les paquets Ubuntu :

```bash
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
```

## 5. Recuperer le projet

```bash
sudo mkdir -p /opt/fidelise-moi
sudo chown -R $USER:$USER /opt/fidelise-moi
git clone https://github.com/Cyborzz/Bizness.git /opt/fidelise-moi
cd /opt/fidelise-moi
```

## 6. Variables de production

```bash
cp .env.production.example .env.production
nano .env.production
```

Renseigner au minimum :

```txt
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=https://fidelise-moi.fr
CRON_SECRET=
```

Pour les notifications push, ajouter aussi :

```txt
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:hello@fidelise-moi.fr
```

Important : les variables `NEXT_PUBLIC_*` sont integrees au build. Si elles changent, reconstruire l'image Docker.

## 7. Lancer le site

```bash
docker compose --env-file .env.production up -d --build
docker compose ps
```

Voir les logs :

```bash
docker compose logs -f app
docker compose logs -f caddy
```

Le site doit ensuite repondre sur :

```txt
https://fidelise-moi.fr
https://www.fidelise-moi.fr
```

## 8. Cron quotidien

Creer le cron cote VPS :

```bash
crontab -e
```

Ajouter :

```cron
0 9 * * * curl -fsS -H "Authorization: Bearer TON_CRON_SECRET" https://fidelise-moi.fr/api/cron/reengage >/dev/null 2>&1
```

Remplacer `TON_CRON_SECRET` par la meme valeur que dans `.env.production`.

## 9. Mise a jour

```bash
cd /opt/fidelise-moi
git pull
docker compose --env-file .env.production up -d --build
```

## 10. Tests apres mise en ligne

- `https://fidelise-moi.fr`
- `https://fidelise-moi.fr/admin/login`
- `https://fidelise-moi.fr/c/snack-demo`
- `https://fidelise-moi.fr/manifest.webmanifest`
- `https://fidelise-moi.fr/robots.txt`
- creation commerce + QR code
- creation carte client
- export CSV
- envoi push si VAPID est configure
