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
    Write-Host "[INFO] Ensuring module '$ModuleName' exists" -ForegroundColor Cyan
    New-SatsetModule -Name $ModuleName -Force:$Force

    $CrudFiles = Get-SatsetCrudTemplateDefinitions
    $ExtendedCrudFiles = Get-SatsetCrudExtendedTemplateDefinitions -ModuleName $ModuleName

    Write-Host "[INFO] Adding CRUD files" -ForegroundColor Cyan
    foreach ($File in $CrudFiles) {
        New-SatsetRenderedFile -ModuleName $ModuleName -TemplateName $File.Template -TargetName $File.Target -Force:$Force | Out-Null
    }

    Write-Host "[INFO] Adding API and server action scaffolding" -ForegroundColor Cyan
    foreach ($File in $ExtendedCrudFiles) {
        New-SatsetRenderedFile `
            -ModuleName $ModuleName `
            -TemplateName $File.Template `
            -TargetName $File.Target `
            -OutputRoot $File.OutputRoot `
            -Force:$Force | Out-Null
    }

    Write-Host "[ OK ] CRUD generation completed" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
