Set-StrictMode -Version Latest

function Get-SatsetMenuTemplateValues {

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

    $Fields = @()
    if ($Metadata.form -and $Metadata.form.fields) {
        foreach ($Field in @($Metadata.form.fields)) {
            $FieldName = [string]$Field.name
            if (-not [string]::IsNullOrWhiteSpace($FieldName)) {
                $Fields += "'${FieldName}'"
            }
        }
    }

    return [ordered]@{
        MODULE       = $ModuleName
        MODULE_UPPER = (Get-Culture).TextInfo.ToTitleCase($ModuleName)
        ENTITY       = $ModuleName
        TABLE        = $Table
        MENU_TITLE   = (Get-Culture).TextInfo.ToTitleCase($ModuleName)
        MENU_ICON    = "circle"
        MENU_PATH    = "/admin/$ModuleName"
        FIELDS       = ($Fields -join ', ')
    }
}


