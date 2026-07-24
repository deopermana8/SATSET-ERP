Set-StrictMode -Version Latest

function Get-SatsetApiMetadata {

    param(
        [Parameter(Mandatory)]
        [string]$ModuleName
    )

    . "$PSScriptRoot\MetadataEngine.ps1"

    $Metadata = Get-SatsetMetadata -ModuleName $ModuleName

    if ($null -eq $Metadata.entity) {
        throw "Entity metadata not found."
    }

    if ($null -eq $Metadata.columns) {
        throw "Columns metadata not found."
    }

    return $Metadata
}

function Convert-SatsetSqlTypeToTsType {

    param(
        [string]$Type
    )

    if ([string]::IsNullOrWhiteSpace($Type)) {
        return "string"
    }

    switch ($Type.ToLowerInvariant()) {
        "uuid"      { "string" }
        "varchar"   { "string" }
        "string"    { "string" }
        "text"      { "string" }
        "char"      { "string" }
        "int"       { "number" }
        "integer"   { "number" }
        "bigint"    { "number" }
        "decimal"   { "number" }
        "float"     { "number" }
        "double"    { "number" }
        "boolean"   { "boolean" }
        "bool"      { "boolean" }
        "date"      { "string" }
        "datetime"  { "string" }
        "timestamp" { "string" }
        "json"      { "any" }
        default     { "string" }
    }
}

function Get-SatsetDtoProperties {

    param(
        [Parameter(Mandatory)]
        $Columns
    )

    $Lines = @()

    foreach ($Column in @($Columns.columns)) {

        if ([string]::IsNullOrWhiteSpace($Column.name)) {
            continue
        }

        $TsType = Convert-SatsetSqlTypeToTsType $Column.type

        $Optional = ""

        if ($Column.nullable -eq $true) {
            $Optional = "?"
        }

        $Lines += "$($Column.name)$Optional`: $TsType;"
    }

    return ($Lines -join "`r`n")
}

function Get-SatsetApiTemplateValues {

    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ModuleName,

        [Parameter(Mandatory)]
        $Metadata
    )

    $Entity = $Metadata.entity
    $Table = $ModuleName

    if ($null -ne $Entity -and $Entity.table) {
        $Table = [string]$Entity.table
    }

    $EntityUpper = (Get-Culture).TextInfo.ToTitleCase($ModuleName)

    $DtoProperties = ''
    if ($null -ne $Metadata.columns) {
        $DtoProperties = Get-SatsetDtoProperties -Columns $Metadata.columns
    }

    return [ordered]@{
        MODULE         = $ModuleName
        MODULE_UPPER   = $EntityUpper
        ENTITY         = $ModuleName
        ENTITY_UPPER   = $EntityUpper
        TABLE          = $Table
        DTO_PROPERTIES = $DtoProperties
        ROUTE_PATH     = "/$ModuleName"
    }
}
