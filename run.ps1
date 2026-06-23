# Powershell
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

Write-Host "==> Build & démarrage des services..."
docker compose up --build -d

Write-Host "==> Attente d'Ollama..."
while ($true) {
    docker compose exec -T ollama ollama list *> $null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 2
}

Write-Host "==> Téléchargement du modèle qwen3:4b..."
docker compose exec -T ollama ollama pull qwen3:4b

Write-Host "==> Prêt."
Write-Host "    Front    : http://localhost"
Write-Host "    API chat : POST http://localhost/api/chat"
