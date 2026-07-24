. "$PSScriptRoot\tools\engine\MetadataEngine.ps1"
$Metadata = Get-SatsetMetadata -Name 'employee'
Write-Host "meta=$($Metadata -eq $null)"
if ($Metadata -ne $null) {
    Write-Host "entityType=$($Metadata.entity.GetType().FullName)"
    Write-Host "columnsType=$($Metadata.columns.GetType().FullName)"
    Write-Host "relationsType=$($Metadata.relations.GetType().FullName)"
    Write-Host "validationType=$($Metadata.validation.GetType().FullName)"
    Write-Host "formType=$($Metadata.form.GetType().FullName)"
    if ($Metadata.columns -ne $null) {
        Write-Host "columnsCount=$($Metadata.columns.columns.Count)"
        $col = $Metadata.columns.columns[0]
        Write-Host "colType=$($col.GetType().FullName)"
        $col | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name | Sort-Object | ForEach-Object { Write-Host "prop=$_" }
    }
}
