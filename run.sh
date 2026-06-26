#!/usr/bin/env bash
# Linux / macOS / Git-Bash (Windows).
set -euo pipefail
cd "$(dirname "$0")"

# Modèle Ollama : lu depuis .env (AGENT_MODEL), défaut qwen3:4b.
MODEL="$(grep -E '^[[:space:]]*AGENT_MODEL[[:space:]]*=' .env 2>/dev/null | tail -n1 | cut -d= -f2- | tr -d ' \r')"
MODEL="${MODEL:-qwen3:4b}"

echo "==> Build & démarrage des services..."
docker compose up --build -d

echo "==> Attente d'Ollama..."
until docker compose exec -T ollama ollama list >/dev/null 2>&1; do
  sleep 2
done

echo "==> Téléchargement du modèle ${MODEL}..."
docker compose exec -T ollama ollama pull "${MODEL}"

echo "==> Prêt."
echo "    Front      : http://localhost"
echo "    API chat   : POST http://localhost/api/chat"
