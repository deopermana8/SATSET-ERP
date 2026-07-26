param(
    [string]$Command,
    [string]$Argument
)

$Root = Join-Path $PSScriptRoot "satset\modules"

switch($Command){

    "doctor"{
        & (Join-Path $Root "doctor.ps1")
    }

    "scan"{
        & (Join-Path $Root "scan.ps1")
    }

    "generate"{
        & (Join-Path $Root "generate.ps1")
    }

    "crud"{
        & (Join-Path $Root "crud.ps1") $Argument
    }

    default{
        Write-Host ""
        Write-Host "SATSET Framework v2" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  doctor"
        Write-Host "  scan"
        Write-Host "  generate"
        Write-Host "  crud <module>"
        Write-Host ""
    }
}
