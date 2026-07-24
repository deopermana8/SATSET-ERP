param(
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\..\engine\DoctorEngine.ps1"

$Results = Get-SatsetDoctorResults

Write-Host ""
Write-Host "========================================"
Write-Host " SATSET DOCTOR"
Write-Host "========================================"
Write-Host ""

foreach ($Result in $Results) {
    Write-Host "$($Result.Status) $($Result.Name)"
    if (-not [string]::IsNullOrWhiteSpace($Result.Detail)) {
        Write-Host "    $($Result.Detail)"
    }
}

Write-Host ""
Write-Host "========================================"

if ($Results | Where-Object { -not $_.Passed }) {
    Write-Host "SATSET HEALTH : FAIL"
    exit 1
}

Write-Host "SATSET HEALTH : PASS"
exit 0
