param()

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\..\engine\ReleaseEngine.ps1"

$Generated = Invoke-SatsetDocsGeneration

Write-Host ""
Write-Host "===================================="
Write-Host " SATSET DOCS"
Write-Host "===================================="
Write-Host ""

foreach ($Path in $Generated) {
    Write-Host "[ OK ] $Path"
}

Write-Host ""
exit 0
