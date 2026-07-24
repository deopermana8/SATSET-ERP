Set-StrictMode -Version Latest

function Get-SatsetOpenApiSchema {

    param(
        [Parameter(Mandatory)]
        $Metadata
    )

    $Properties = [ordered]@{}

    foreach ($Column in @($Metadata.columns.columns)) {

        if ([string]::IsNullOrWhiteSpace($Column.name)) {
            continue
        }

        $Type = "string"

        switch ($Column.type.ToLowerInvariant()) {

            "int"       { $Type = "integer" }
            "integer"   { $Type = "integer" }
            "bigint"    { $Type = "integer" }
            "decimal"   { $Type = "number" }
            "float"     { $Type = "number" }
            "double"    { $Type = "number" }
            "boolean"   { $Type = "boolean" }
            "bool"      { $Type = "boolean" }
        }

        $Properties[$Column.name] = @{
            type = $Type
        }
    }

    return $Properties
}

function Get-SatsetOpenApiTemplateValues {

    param(
        [Parameter(Mandatory)]
        [string]$ModuleName,

        [Parameter(Mandatory)]
        $Metadata
    )

    return [ordered]@{

        MODULE       = $ModuleName
        MODULE_UPPER = (Get-Culture).TextInfo.ToTitleCase($ModuleName)
        ENTITY       = $ModuleName

        OPENAPI_JSON = (
            @{
                openapi = "3.0.0"

                info = @{
                    title = "$ModuleName API"
                    version = "1.0.0"
                }

                paths = @{}

                components = @{
                    schemas = @{
                        $ModuleName = @{
                            type = "object"
                            properties = (
                                Get-SatsetOpenApiSchema -Metadata $Metadata
                            )
                        }
                    }
                }

            } | ConvertTo-Json -Depth 20
        )
    }
}
