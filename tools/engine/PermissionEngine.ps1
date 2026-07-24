Set-StrictMode -Version Latest

function Get-SatsetPermissionTemplateValues {

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

    $ModuleUpper = (Get-Culture).TextInfo.ToTitleCase($ModuleName)

    $Permissions = @(
        "'$ModuleName.view'",
        "'$ModuleName.create'",
        "'$ModuleName.update'",
        "'$ModuleName.delete'"
    )

    $Permissions = @(
        "'$ModuleName.view'",
        "'$ModuleName.create'",
        "'$ModuleName.update'",
        "'$ModuleName.delete'"
    )

    return [ordered]@{
        MODULE             = $ModuleName
        MODULE_UPPER       = $ModuleUpper
        ENTITY             = $ModuleName
        TABLE              = $Table

        PERMISSION_VIEW    = "$ModuleName.view"
        PERMISSION_CREATE  = "$ModuleName.create"
        PERMISSION_UPDATE  = "$ModuleName.update"
        PERMISSION_DELETE  = "$ModuleName.delete"

        PERMISSIONS        = ($Permissions -join ', ')
        DISPLAY_NAME       = $ModuleUpper
    }
}


