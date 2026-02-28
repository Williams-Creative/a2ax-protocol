# Build PDFs from LaTeX sources.
# Requires: pdflatex (e.g. MiKTeX, TeX Live)
# Usage: .\build.ps1 [-OutputDir path]
# Default output: whitepapers\pdf\

param([string]$OutputDir = "")

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($OutputDir -eq "") { $OutputDir = Join-Path $ScriptDir "pdf" }
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Get-ChildItem -Path $ScriptDir -Filter "*.tex" | ForEach-Object {
    $name = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    Write-Host "[build] $($_.Name) -> $OutputDir\$name.pdf"
    Push-Location $ScriptDir
    try {
        pdflatex -interaction=nonstopmode -output-directory=$OutputDir $_.Name 2>&1 | Out-Null
        pdflatex -interaction=nonstopmode -output-directory=$OutputDir $_.Name 2>&1 | Out-Null
    } finally {
        Pop-Location
    }
}

Write-Host "[build] Done. PDFs in $OutputDir"
