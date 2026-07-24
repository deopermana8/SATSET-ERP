param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("doctor","ticket","wahana","kuliner","kasir","report")]
    [string]$Command
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Module = Join-Path $Root "satset\$Command.ps1"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host " SATSET POS WISATA CLI v1.0" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if(Test-Path $Module){
    & $Module
}
else{
    Write-Host "Module $Command belum tersedia." -ForegroundColor Red
}
