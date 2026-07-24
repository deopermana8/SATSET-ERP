param()

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\..\engine\SetupEngine.ps1"

$Results = Invoke-SatsetSetup

Write-Host ""
Write-Host "[ OK ] Root"
foreach ($Result in $Results) {
    if ($Result.Passed) {
        Write-Host "[ OK ] $($Result.Name)"
    }
    else {
        Write-Host "[FAIL] $($Result.Name)"
    }
}
Write-Host "Setup completed."
exit 0
