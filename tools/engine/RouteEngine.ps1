Set-StrictMode -Version Latest

function Get-SatsetRouteTemplateValues {

    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ModuleName,

        [Parameter(Mandatory)]
        $Metadata
    )

    $Entity = $Metadata.entity

    $Table = $ModuleName
    if($null -ne $Entity -and $Entity.table){
        $Table = [string]$Entity.table
    }

    $Title = (Get-Culture).TextInfo.ToTitleCase($ModuleName)

    return [ordered]@{

        MODULE          = $ModuleName
        MODULE_UPPER    = $Title

        ENTITY          = $ModuleName
        TABLE           = $Table

        ROUTE_NAME      = $ModuleName
        ROUTE_PREFIX    = "/api/$ModuleName"
        ROUTE_RESOURCE  = "/$ModuleName"

        CONTROLLER      = "${Title}Controller"
        SERVICE         = "${Title}Service"

        API_VERSION     = "v1"
    }
}

Export-ModuleMember -Function Get-SatsetRouteTemplateValues -ErrorAction SilentlyContinue
