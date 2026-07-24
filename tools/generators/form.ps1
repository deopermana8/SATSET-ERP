param(
    [string]$Name = 'form',

    [switch]$Force
)

$ErrorActionPreference = 'Stop'

try {
    . "$PSScriptRoot\..\engine\BlueprintEngine.ps1"
    . "$PSScriptRoot\..\engine\TemplateEngine.ps1"
    . "$PSScriptRoot\..\engine\GeneratorEngine.ps1"

    $ResolvedName = if ([string]::IsNullOrWhiteSpace($Name)) { 'form' } else { $Name }
    $EntityName = Test-SatsetModuleName -Name $ResolvedName

    Write-Host ""
    Write-Host "[INFO] Starting form generation for '$EntityName'" -ForegroundColor Cyan

    $Blueprint = Get-SatsetBlueprint "form"

    foreach ($Item in $Blueprint) {
        $TemplateName = [string]$Item.template
        $TargetName = [string]$Item.target

        $OutputRoot = Join-Path (Get-SatsetRootPath) 'metadata'
        New-SatsetRenderedFile -ModuleName $EntityName -TemplateName $TemplateName -TargetName $TargetName -OutputRoot $OutputRoot -Force:$Force | Out-Null
    }

    Write-Host "[ OK ] Form generation completed" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
