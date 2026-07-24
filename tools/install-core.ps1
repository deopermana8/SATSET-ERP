$Core = Join-Path $PSScriptRoot "core"

$Files = @{
    "logger.ps1" = @'
function Write-SatsetInfo($Message){
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-SatsetSuccess($Message){
    Write-Host "[ OK ] $Message" -ForegroundColor Green
}

function Write-SatsetWarning($Message){
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-SatsetError($Message){
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}
'@

    "filesystem.ps1" = @'
function New-SatsetFolder($Path){
    if(!(Test-Path $Path)){
        New-Item -ItemType Directory -Force $Path | Out-Null
    }
}

function New-SatsetFile($Path){
    if(!(Test-Path $Path)){
        New-Item -ItemType File -Force $Path | Out-Null
    }
}
'@

    "template.ps1" = @'
function Get-SatsetTemplate($Name){
    Join-Path "$PSScriptRoot\..\templates-tsx" $Name
}
'@

    "token.ps1" = @'
function Replace-SatsetToken($Content,$Key,$Value){
    return $Content.Replace($Key,$Value)
}
'@

    "doctor.ps1" = @'
function Test-SatsetDoctor(){
    Write-Host ""
    Write-Host "SATSET Doctor"
    Write-Host "--------------"

    node -v
    pnpm -v
}
'@

    "config.ps1" = @'
$Global:SATSET_VERSION="1.0.0"
'@

    "lib.ps1" = @'
. "$PSScriptRoot\logger.ps1"
. "$PSScriptRoot\filesystem.ps1"
. "$PSScriptRoot\template.ps1"
. "$PSScriptRoot\token.ps1"
. "$PSScriptRoot\doctor.ps1"
. "$PSScriptRoot\config.ps1"
'@
}

foreach($File in $Files.Keys){
    $Files[$File] | Set-Content (Join-Path $Core $File) -Encoding UTF8
    Write-Host "Installed $File"
}

Write-Host ""
Write-Host "==================================="
Write-Host " SATSET CORE INSTALLED"
Write-Host "==================================="