param(
    [string]$Name = 'sidebar',

    [switch]$Force
)

$ErrorActionPreference = 'Stop'

try {
    . "$PSScriptRoot\..\engine\BlueprintEngine.ps1"
    . "$PSScriptRoot\..\engine\TemplateEngine.ps1"
    . "$PSScriptRoot\..\engine\GeneratorEngine.ps1"

    $ResolvedName = if ([string]::IsNullOrWhiteSpace($Name)) { 'sidebar' } else { $Name }
    $EntityName = Test-SatsetModuleName -Name $ResolvedName

    $MetadataRoot = Join-Path (Get-SatsetRootPath) 'metadata'
    $EntityMetadataPath = Join-Path $MetadataRoot "$EntityName.entity.json"
    $FormMetadataPath = Join-Path $MetadataRoot "$EntityName.form.json"

    if (-not (Test-Path $EntityMetadataPath)) { throw "Missing metadata file: $EntityMetadataPath" }
    if (-not (Test-Path $FormMetadataPath)) { throw "Missing metadata file: $FormMetadataPath" }

    $EntityMetadata = Get-Content $EntityMetadataPath -Raw | ConvertFrom-Json
    $FormMetadata = Get-Content $FormMetadataPath -Raw | ConvertFrom-Json

    $TableName = if ($EntityMetadata.table) { [string]$EntityMetadata.table } else { $EntityName }
    $Fields = @()
    if ($FormMetadata.fields) {
        foreach ($Field in @($FormMetadata.fields)) {
            $FieldName = [string]$Field.name
            if (-not [string]::IsNullOrWhiteSpace($FieldName)) {
                $Fields += "'${FieldName}'"
            }
        }
    }

    $TemplateValues = [ordered]@{
        ENTITY = $EntityName
        TABLE = $TableName
        FIELDS = ($Fields -join ', ')
    }

    $OutputRoot = Join-Path (Get-SatsetRootPath) 'apps\admin\sidebar'
    $Blueprint = Get-SatsetBlueprint 'sidebar'

    foreach ($Item in $Blueprint) {
        $TemplateName = [string]$Item.template
        $TargetName = [string]$Item.target
        New-SatsetRenderedFile -ModuleName $EntityName -TemplateName $TemplateName -TargetName $TargetName -OutputRoot $OutputRoot -TemplateValues $TemplateValues -Force:$Force | Out-Null
    }

    Write-Host "[ OK ] Sidebar generation completed" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "[FAIL] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
