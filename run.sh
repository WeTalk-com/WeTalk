#!/usr/bin/env bash
# Linux / macOS / Git-Bash (Windows).
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Build & démarrage des services..."
docker compose up --build -d

echo "==> Attente d'Ollama..."
until docker compose exec -T ollama ollama list >/dev/null 2>&1; do
  sleep 2
done

echo "==> Téléchargement du modèle qwen3:4b..."
docker compose exec -T ollama ollama pull qwen3:4b

echo "==> Prêt."
echo "    Front      : http://localhost"
echo "    API chat   : POST http://localhost/api/chat"
