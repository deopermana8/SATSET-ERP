param()

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\..\engine\ReleaseEngine.ps1"

$Commands = Get-SatsetSupportedCommands

Write-Host ""
Write-Host "===================================="
Write-Host " SATSET HELP"
Write-Host "===================================="
Write-Host ""

foreach ($Command in $Commands) {
    Write-Host ("{0,-12} {1}" -f $Command.Name, $Command.Description)
}

Write-Host ""
exit 0
