# Powershell
$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

# Modèle Ollama : lu depuis .env (AGENT_MODEL), défaut qwen3:4b.
$model = "qwen3:4b"
if (Test-Path "./.env") {
    $line = Select-String -Path "./.env" -Pattern '^\s*AGENT_MODEL\s*=\s*(.+?)\s*$' | Select-Object -First 1
    if ($line) { $model = $line.Matches[0].Groups[1].Value.Trim() }
}

Write-Host "==> Build & démarrage des services..."
docker compose up --build -d

Write-Host "==> Attente d'Ollama..."
while ($true) {
    docker compose exec -T ollama ollama list *> $null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 2
}

Write-Host "==> Téléchargement du modèle $model..."
docker compose exec -T ollama ollama pull $model

Write-Host "==> Prêt."
Write-Host "    Front    : http://localhost"
Write-Host "    API chat : POST http://localhost/api/chat"
