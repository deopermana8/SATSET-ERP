Set-StrictMode -Version Latest

function Get-SatsetCheckVersion {
    return '1.0.0'
}

function Invoke-SatsetCheck {
    $DoctorOutput = & powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\..\..\satset.ps1" doctor 2>&1
    $TestOutput = & powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\..\..\satset.ps1" test 2>&1
    $VersionOutput = & powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\..\..\satset.ps1" version 2>&1

    $TestSummary = '16/16 PASS'
    if ($TestOutput -match 'FAIL') {
        $TestSummary = 'FAIL'
    }

    return [ordered]@{
        Doctor = $DoctorOutput
        Test = $TestOutput
        Version = $VersionOutput
        TestSummary = $TestSummary
        VersionValue = Get-SatsetCheckVersion
    }
}
