. "$PSScriptRoot\tools\engine\MetadataEngine.ps1"

$Metadata = Get-SatsetMetadata -Name 'employee'
Write-Host "Metadata loaded: $($Metadata -ne $null)"
Write-Host "Entity type: $($Metadata.entity.GetType().FullName)"
Write-Host "Columns type: $($Metadata.columns.GetType().FullName)"
Write-Host "Columns count: $($Metadata.columns.columns.Count)"
$Column = $Metadata.columns.columns[0]
Write-Host "Column type: $($Column.GetType().FullName)"
Write-Host "Column name: $($Column.name)"
Write-Host "Column unique exists?"
try {
    $value = $Column.unique
    Write-Host "unique = $value"
} catch {
    Write-Host "unique error: $($_.Exception.Message)"
}
Write-Host "Column keys:"
$Column | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name | Sort-Object | ForEach-Object { Write-Host "prop=$_" }
