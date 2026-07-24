param(
    [Parameter(Mandatory)]
    [string]$Name,

    [switch]$Force
)

$ErrorActionPreference = 'Stop'

try {
    . "$PSScriptRoot\..\engine\BlueprintEngine.ps1"
    . "$PSScriptRoot\..\engine\TemplateEngine.ps1"
    . "$PSScriptRoot\..\engine\GeneratorEngine.ps1"

    $ModuleName = Test-SatsetModuleName -Name $Name

    Write-Host ""
    Write-Host "[INFO] Running module generation for '$ModuleName'" -ForegroundColor Cyan
    if ($Force) {
        & powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\module.ps1" -Name $ModuleName -Force
    }
    else {
        & powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\module.ps1" -Name $ModuleName
    }
    if ($LASTEXITCODE -ne 0) {
        throw "Module generation failed for '$ModuleName'."
    }

    Write-Host "[INFO] Running CRUD generation for '$ModuleName'" -ForegroundColor Cyan
    if ($Force) {
        & powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\crud.ps1" -Name $ModuleName -Force
    }
    else {
        & powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\crud.ps1" -Name $ModuleName
    }
    if ($LASTEXITCODE -ne 0) {
        throw "CRUD generation failed for '$ModuleName'."
    }

    Write-Host "[ OK ] Resource generation completed" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
param(
    [Parameter(Mandatory)]
    [string]$Name,

    [switch]$Force
)

$ErrorActionPreference = 'Stop'

try {
    Write-Host ""
    Write-Host "[INFO] Starting resource generation for '$Name'" -ForegroundColor Cyan

    $ModuleScript = Join-Path $PSScriptRoot 'module.ps1'
    $CrudScript = Join-Path $PSScriptRoot 'crud.ps1'

    if (-not (Test-Path $ModuleScript)) {
        throw "Module generator not found: $ModuleScript"
    }

    if (-not (Test-Path $CrudScript)) {
        throw "CRUD generator not found: $CrudScript"
    }

    Write-Host "[INFO] Executing module generator" -ForegroundColor Cyan
    if ($Force) {
        & powershell -ExecutionPolicy Bypass -File $ModuleScript -Name $Name -Force
    }
    else {
        & powershell -ExecutionPolicy Bypass -File $ModuleScript -Name $Name
    }

    if ($LASTEXITCODE -ne 0) {
        throw "Module generator failed with exit code $LASTEXITCODE"
    }

    Write-Host "[INFO] Executing CRUD generator" -ForegroundColor Cyan
    if ($Force) {
        & powershell -ExecutionPolicy Bypass -File $CrudScript -Name $Name -Force
    }
    else {
        & powershell -ExecutionPolicy Bypass -File $CrudScript -Name $Name
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
