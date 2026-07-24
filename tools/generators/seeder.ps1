param(
    [string]$Name='seeder',
    [switch]$Force
)

$ErrorActionPreference='Stop'

try{

. "$PSScriptRoot\..\engine\BlueprintEngine.ps1"
. "$PSScriptRoot\..\engine\TemplateEngine.ps1"
. "$PSScriptRoot\..\engine\GeneratorEngine.ps1"
. "$PSScriptRoot\..\engine\MetadataEngine.ps1"
. "$PSScriptRoot\..\engine\SeederEngine.ps1"

$ModuleName = Test-SatsetModuleName -Name $Name

$Metadata = Get-SatsetMetadata -ModuleName $ModuleName

$TemplateValues = Get-SatsetSeederTemplateValues `
    -ModuleName $ModuleName `
    -Metadata $Metadata

$Blueprint = Get-SatsetBlueprint "seeder"

$OutputRoot = Join-Path (Get-SatsetRootPath) "database\seeders"

foreach($Item in $Blueprint){

    New-SatsetRenderedFile `
        -ModuleName $ModuleName `
        -TemplateName $Item.template `
        -TargetName $Item.target `
        -OutputRoot $OutputRoot `
        -TemplateValues $TemplateValues `
        -Force:$Force | Out-Null
}

Write-Host ""
Write-Host "[ OK ] Seeder generation completed." -ForegroundColor Green
exit 0

}
catch{

Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
exit 1

}
