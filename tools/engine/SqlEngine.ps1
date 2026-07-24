Set-StrictMode -Version Latest

function Convert-SatsetColumnToSql {

    param(
        [Parameter(Mandatory)]
        $Column
    )

    $Line = "    $($Column.name) "

    if ([string]::IsNullOrWhiteSpace($Column.type)) {
        $Line += "TEXT"
    }
    else {
        $Line += $Column.type.ToUpperInvariant()
    }

    if ($Column.length) {
        $Line += "($($Column.length))"
    }

    if ($Column.primary -eq $true) {
        $Line += " PRIMARY KEY"
    }

    if ($Column.identity -eq $true) {
        $Line += " IDENTITY(1,1)"
    }

    if ($Column.nullable -ne $true) {
        $Line += " NOT NULL"
    }

    if ($null -ne $Column.default) {
        $Line += " DEFAULT $($Column.default)"
    }

    return $Line
}

function Get-SatsetCreateTableSql {

    param(
        [Parameter(Mandatory)]
        $Metadata
    )

    $Table = $Metadata.entity.table

    if ([string]::IsNullOrWhiteSpace($Table)) {
        $Table = $Metadata.entity.name
    }

    $Columns = @()

    foreach ($Column in @($Metadata.columns.columns)) {
        $Columns += (Convert-SatsetColumnToSql $Column)
    }

    return @"
CREATE TABLE $Table (
$($Columns -join ",`r`n")
);
"@
}

function Get-SatsetSqlTemplateValues {

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

    return [ordered]@{
        MODULE       = $ModuleName
        MODULE_UPPER = (Get-Culture).TextInfo.ToTitleCase($ModuleName)
        ENTITY       = $ModuleName
        TABLE        = $Table
        COLUMNS_SQL  = ''
        RELATIONS_SQL = ''
        VALIDATION_SQL = ''
    }
}
