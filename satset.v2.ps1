param(
    [Parameter(Position=0)]
    [string]$Command,

    [Parameter(Position=1)]
    [string]$Type,

    [Parameter(Position=2)]
    [string]$Name
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

switch($Command){

    "doctor"{

        Write-Host ""
        Write-Host "======================================"
        Write-Host " SATSET AI v3"
        Write-Host "======================================"
        Write-Host ""

        node -v
        git --version

        break
    }

    default{

        Write-Host ""
        Write-Host "======================================"
        Write-Host " SATSET AI CLI"
        Write-Host "======================================"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  .\satset.ps1 doctor"
        Write-Host "  .\satset.ps1 make module employee"
        Write-Host ""

    }

}
