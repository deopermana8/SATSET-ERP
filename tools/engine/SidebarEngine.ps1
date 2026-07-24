Set-StrictMode -Version Latest

function Get-SatsetSidebarTemplateValues {

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
        MODULE        = $ModuleName
        MODULE_UPPER  = $Title
        ENTITY        = $ModuleName
        TABLE         = $Table

        SIDEBAR_TITLE = $Title
        SIDEBAR_ICON  = "circle"
        SIDEBAR_PATH  = "/admin/$ModuleName"
        SIDEBAR_GROUP = "Master Data"
        SIDEBAR_ORDER = "100"
    }
}

Export-ModuleMember -Function Get-SatsetSidebarTemplateValues -ErrorAction SilentlyContinue
