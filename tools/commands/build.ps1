param()

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\..\engine\ReleaseEngine.ps1"

$ArchivePath = Invoke-SatsetBuildRelease

Write-Host ""
Write-Host "===================================="
Write-Host " SATSET BUILD"
Write-Host "===================================="
Write-Host ""
Write-Host "[ OK ] $ArchivePath"
Write-Host ""
exit 0
