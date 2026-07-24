param()

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\..\engine\InitEngine.ps1"

$Results = Invoke-SatsetInit

foreach ($Result in $Results) {
    Write-Host "[$($Result.Status)] $($Result.Name)"
}

exit 0
