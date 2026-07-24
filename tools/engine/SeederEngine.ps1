Set-StrictMode -Version Latest

function Get-SatsetSeederTemplateValues {

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
        MODULE       = $ModuleName
        MODULE_UPPER = (Get-Culture).TextInfo.ToTitleCase($ModuleName)
        ENTITY       = $ModuleName
        TABLE        = $Table
        CREATED_AT   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
}

function Get-SatsetSeederFileName {

    param(
        [string]$ModuleName
    )

    return "$ModuleName.seeder.sql"
}
