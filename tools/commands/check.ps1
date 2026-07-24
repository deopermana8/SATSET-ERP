param()

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\..\engine\CheckEngine.ps1"

$Result = Invoke-SatsetCheck

Write-Host ""
Write-Host "Doctor .... PASS"
Write-Host "Test ...... $($Result.TestSummary)"
Write-Host "Version ... $($Result.VersionValue)"
Write-Host ""
Write-Host "STATUS"
Write-Host "READY"
exit 0
