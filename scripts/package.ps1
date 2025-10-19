<#
Packages the Masked extension directory into Masked.zip at the repo root.

Usage (PowerShell / pwsh):
  ./scripts/package.ps1
#>

Param(
  [string]$SourceDir = "Masked",
  [string]$OutFile = "Masked.zip"
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (Test-Path $OutFile) { Remove-Item $OutFile -Force }

Write-Host "Zipping $SourceDir -> $OutFile"

Compress-Archive -Path $SourceDir\* -DestinationPath $OutFile -Force

Write-Host "Done. Copy $OutFile into your browser's unpacked extension loader or upload as needed."
