param(
    [string]$Name = 'auth',

    [switch]$Force
)

$ErrorActionPreference = 'Stop'

try {
    . "$PSScriptRoot\..\engine\BlueprintEngine.ps1"
    . "$PSScriptRoot\..\engine\TemplateEngine.ps1"
    . "$PSScriptRoot\..\engine\GeneratorEngine.ps1"

    $ResolvedName = if ([string]::IsNullOrWhiteSpace($Name)) { 'auth' } else { $Name }
    $ModuleName = Test-SatsetModuleName -Name $ResolvedName

    Write-Host ""
    Write-Host "[INFO] Starting auth generation for '$ModuleName'" -ForegroundColor Cyan

    $Blueprint = Get-SatsetBlueprint "auth"

    foreach ($Item in $Blueprint) {
        $TemplateName = [string]$Item.template
        $TargetName = [string]$Item.target

        New-SatsetRenderedFile -ModuleName $ModuleName -TemplateName $TemplateName -TargetName $TargetName -Force:$Force | Out-Null
    }

    Write-Host "[ OK ] Auth generation completed" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
