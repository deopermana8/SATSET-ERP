param(
    [Parameter(Mandatory)]
    [string]$Name,

    [switch]$Force
)

$ErrorActionPreference = 'Stop'

try {
    Write-Host ""
    Write-Host "[INFO] Starting resource generation for '$Name'" -ForegroundColor Cyan

    . "$PSScriptRoot\..\engine\BlueprintEngine.ps1"
    . "$PSScriptRoot\..\engine\TemplateEngine.ps1"
    . "$PSScriptRoot\..\engine\GeneratorEngine.ps1"

    $ModuleName = Test-SatsetModuleName -Name $Name

    $ModuleScript = Join-Path $PSScriptRoot 'module.ps1'
    $CrudScript = Join-Path $PSScriptRoot 'crud.ps1'

    if (-not (Test-Path $ModuleScript)) {
        throw "Module generator not found: $ModuleScript"
    }

    if (-not (Test-Path $CrudScript)) {
        throw "CRUD generator not found: $CrudScript"
    }

    Write-Host "[INFO] Executing module generator for '$ModuleName'" -ForegroundColor Cyan
    if ($Force) {
        & powershell -ExecutionPolicy Bypass -File $ModuleScript -Name $ModuleName -Force
    }
    else {
        & powershell -ExecutionPolicy Bypass -File $ModuleScript -Name $ModuleName
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Module generator failed with exit code $LASTEXITCODE"
    }

    Write-Host "[INFO] Executing CRUD generator (module CRUD + API + actions) for '$ModuleName'" -ForegroundColor Cyan
    if ($Force) {
        & powershell -ExecutionPolicy Bypass -File $CrudScript -Name $ModuleName -Force
    }
    else {
        & powershell -ExecutionPolicy Bypass -File $CrudScript -Name $ModuleName
    }

    if ($LASTEXITCODE -ne 0) {
        throw "CRUD generator failed with exit code $LASTEXITCODE"
    }

    Write-Host "[ OK ] Resource generation completed" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
