if (-not (Test-Path ".husky")) {
    Write-Host "Instalando hooks do Husky..."
    husky install
} else {
    Write-Host "Hooks do Husky já instalados."
}
