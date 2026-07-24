Set-StrictMode -Version Latest

function Get-SatsetFormFields {

    param(
        [Parameter(Mandatory)]
        $Metadata
    )

    $Fields = @()

    foreach ($Column in @($Metadata.columns.columns)) {

        if ([string]::IsNullOrWhiteSpace($Column.name)) {
            continue
        }

        $InputType = "text"

        switch ($Column.type.ToLowerInvariant()) {
            "int"       { $InputType = "number" }
            "integer"   { $InputType = "number" }
            "bigint"    { $InputType = "number" }
            "decimal"   { $InputType = "number" }
            "float"     { $InputType = "number" }
            "double"    { $InputType = "number" }
            "boolean"   { $InputType = "checkbox" }
            "bool"      { $InputType = "checkbox" }
            "date"      { $InputType = "date" }
            "datetime"  { $InputType = "datetime-local" }
            "timestamp" { $InputType = "datetime-local" }
        }

        $Fields += [ordered]@{
            name      = $Column.name
            label     = (Get-Culture).TextInfo.ToTitleCase(($Column.name -replace '_',' '))
            type      = $InputType
            required  = (-not $Column.nullable)
            readonly  = ($Column.primary -eq $true)
        }
    }

    return $Fields
}

function Get-SatsetFormTemplateValues {

    param(
        [Parameter(Mandatory)]
        [string]$ModuleName,

        [Parameter(Mandatory)]
        $Metadata
    )

    return [ordered]@{
        MODULE       = $ModuleName
        MODULE_UPPER = (Get-Culture).TextInfo.ToTitleCase($ModuleName)
        FORM_JSON    = (
            Get-SatsetFormFields -Metadata $Metadata |
            ConvertTo-Json -Depth 10
        )
    }
}
