param(
    [string]$Name = '__satset_test__'
)

$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\..\engine\TestEngine.ps1"

$Results = Invoke-SatsetTestSuite -ModuleName $Name

Write-Host ""
Write-Host "========================================"
Write-Host " SATSET TEST"
Write-Host "========================================"
Write-Host ""

$PassCount = 0
$FailCount = 0
$TotalTime = 0

foreach ($Result in $Results) {
    $Status = if ($Result.Passed) { '[PASS]' } else { '[FAIL]' }
    if ($Result.Passed) { $PassCount++ } else { $FailCount++ }
    $TotalTime += [double]$Result.Elapsed
    Write-Host "$Status $($Result.Name) ($($Result.Elapsed)s)"
}

Write-Host ""
Write-Host "----------------------------------------"
Write-Host "TOTAL : $($Results.Count)"
Write-Host "PASS  : $PassCount"
Write-Host "FAIL  : $FailCount"
Write-Host "TIME  : $([math]::Round($TotalTime, 2)) sec"
Write-Host "========================================"

if ($FailCount -gt 0) {
    exit 1
}

exit 0
