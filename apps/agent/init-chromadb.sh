#!/bin/sh
# Ingère les documents dans ChromaDB au démarrage si la collection n'existe pas
set -e

CHROMA_HOST="${CHROMA_HOST:-chromadb}"
CHROMA_PORT="${CHROMA_PORT:-8000}"

echo "[init-chromadb] Attente de ChromaDB (${CHROMA_HOST}:${CHROMA_PORT})..."
for _ in $(seq 1 30); do
  if python -c "import chromadb; chromadb.HttpClient(host='${CHROMA_HOST}', port=${CHROMA_PORT}).heartbeat()" 2>/dev/null; then
    break
  fi
  sleep 2
done

echo "[init-chromadb] Vérification de la collection 'kg_b'..."
if python -c "import sys, chromadb; \
c = chromadb.HttpClient(host='${CHROMA_HOST}', port=${CHROMA_PORT}); \
names = [getattr(col, 'name', col) for col in c.list_collections()]; \
sys.exit(0 if 'kg_b' in names else 1)"; then
  echo "[init-chromadb] Collection présente → ingestion ignorée."
else
  echo "[init-chromadb] Collection absente → ingestion des documents..."
  python -m agent.rag.ingest
fi

echo "[init-chromadb] Démarrage : $*"
exec "$@"
