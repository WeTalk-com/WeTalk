if (-not (Test-Path -Path "./.env")) {
	Copy-Item -Path "./.env.example" -Destination "./.env" -Force
}

docker compose up --build -d