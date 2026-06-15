#!/bin/bash
set -e

OUT="./certs"
DAYS=825  # Max Apple/Chrome pour les certs self-signed
SERVICES=("gateway" "auth-service" "user-service" "post-service" "notification-service")

echo "==> Création des dossiers..."
mkdir -p "$OUT/ca"
for svc in "${SERVICES[@]}"; do
  mkdir -p "$OUT/$svc"
done

# ─────────────────────────────────────────────
# 1. CA (Certificate Authority) interne
# ─────────────────────────────────────────────
echo "==> Génération de la CA..."
openssl genrsa -out "$OUT/ca/ca.key" 4096
openssl req -new -x509 -days $DAYS \
  -key "$OUT/ca/ca.key" \
  -out "$OUT/ca/ca.crt" \
  -subj "//CN=WeTalk-Internal-CA/O=WeTalk/C=FR"

# ─────────────────────────────────────────────
# 2. Certificat par service
# ─────────────────────────────────────────────
for svc in "${SERVICES[@]}"; do
  echo "==> Certificat pour $svc..."

  # Clé privée
  openssl genrsa -out "$OUT/$svc/$svc.key" 2048

  # CSR avec SAN (Subject Alternative Names) — obligatoire pour mTLS
  openssl req -new \
    -key "$OUT/$svc/$svc.key" \
    -out "$OUT/$svc/$svc.csr" \
    -subj "//CN=$svc/O=WeTalk/C=FR"

  # Extension SAN
  cat > "$OUT/$svc/$svc.ext" <<EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, keyEncipherment
extendedKeyUsage=serverAuth, clientAuth
subjectAltName=@alt_names

[alt_names]
DNS.1=$svc
DNS.2=localhost
IP.1=127.0.0.1
EOF

  # Signature par la CA
  openssl x509 -req -days $DAYS \
    -in "$OUT/$svc/$svc.csr" \
    -CA "$OUT/ca/ca.crt" \
    -CAkey "$OUT/ca/ca.key" \
    -CAcreateserial \
    -out "$OUT/$svc/$svc.crt" \
    -extfile "$OUT/$svc/$svc.ext"

  echo "    ✓ $svc.crt signé par la CA"
done

echo ""
echo "✅ Tous les certificats générés dans $OUT/"
echo "   CA publique : $OUT/ca/ca.crt"
echo "   Ne jamais committer ca.key et *.key dans Git !"