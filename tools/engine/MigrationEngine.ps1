Set-StrictMode -Version Latest

function Get-SatsetMigrationName {

    param(
        [Parameter(Mandatory)]
        [string]$ModuleName
    )

    $Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

    return "${Timestamp}_create_${ModuleName}_table"
}

function Get-SatsetMigrationTemplateValues {

    param(
        [Parameter(Mandatory)]
        [string]$ModuleName,

        [Parameter(Mandatory)]
        $Metadata
    )

    $Table = $Metadata.entity.table

    if ([string]::IsNullOrWhiteSpace($Table)) {
        $Table = $ModuleName
    }

    return [ordered]@{
        MODULE            = $ModuleName
        MODULE_UPPER      = (Get-Culture).TextInfo.ToTitleCase($ModuleName)
        TABLE             = $Table
        ENTITY            = $ModuleName
        MIGRATION_NAME    = Get-SatsetMigrationName -ModuleName $ModuleName
        TIMESTAMP         = Get-Date -Format "yyyyMMdd_HHmmss"
    }
}
