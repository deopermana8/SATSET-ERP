param()

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\..\engine\ReleaseEngine.ps1"

$Info = Get-SatsetFrameworkVersionInfo

Write-Host ""
Write-Host "===================================="
Write-Host " SATSET Framework"
Write-Host "===================================="
Write-Host ""
Write-Host "Version : $($Info.Version)"
Write-Host "Build   : $($Info.Build)"
Write-Host "Status  : $($Info.Status)"
exit 0
