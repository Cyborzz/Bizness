#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/fidelise-moi}"
BRANCH="${BRANCH:-main}"
GITHUB_KEY="${GITHUB_KEY:-$HOME/.ssh/github_bizness}"
FORCE_DEPLOY="${FORCE_DEPLOY:-0}"

export COMPOSE_BAKE=false

cd "$APP_DIR"

if [ ! -f .env.production ]; then
  echo "Missing .env.production in $APP_DIR" >&2
  exit 1
fi

GIT_SSH_COMMAND="ssh -i $GITHUB_KEY -o IdentitiesOnly=yes" git fetch origin "$BRANCH"

current_commit="$(git rev-parse HEAD)"
target_commit="$(git rev-parse "origin/$BRANCH")"

if [ "$current_commit" = "$target_commit" ] && [ "$FORCE_DEPLOY" != "1" ]; then
  echo "Already deployed: ${current_commit:0:7}"
  sudo docker compose --env-file .env.production ps
  exit 0
fi

GIT_SSH_COMMAND="ssh -i $GITHUB_KEY -o IdentitiesOnly=yes" git merge --ff-only "origin/$BRANCH"

sudo docker compose --env-file .env.production up -d --build
sudo docker compose --env-file .env.production ps
