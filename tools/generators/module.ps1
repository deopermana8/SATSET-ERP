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
    New-SatsetModule -Name $ModuleName -Force:$Force
    exit 0
}
catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
