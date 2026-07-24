. "$PSScriptRoot\tools\generators\sql.ps1"
. "$PSScriptRoot\tools\engine\MetadataEngine.ps1"

$ResolvedName = 'employee'
$EntityName = Test-SatsetModuleName -Name $ResolvedName
$Metadata = Get-SatsetMetadata -Name $EntityName
Write-Host "Metadata loaded: $($Metadata -ne $null)"
Write-Host "Entity meta type: $($Metadata.entity.GetType().FullName)"
Write-Host "Column meta type: $($Metadata.columns.GetType().FullName)"
Write-Host "Column count: $($Metadata.columns.columns.Count)"
$col = $Metadata.columns.columns[0]
Write-Host "Column type: $($col.GetType().FullName)"
Write-Host "name=$($col.name)"
Write-Host "unique direct="$($col.unique)""
Write-Host "primary direct="$($col.primary)""
Write-Host "unique via member access:"
try { Write-Host $col.unique } catch { Write-Host "ERROR: $_" }
try { Write-Host $col | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name | Sort-Object | ForEach-Object { Write-Host "prop=$_" } } catch { Write-Host "GM ERROR: $_" }

function TestMetaVal {
    param($Object, [string[]]$Keys, $Default)
    foreach ($Key in $Keys) {
        Write-Host "Testing key=$Key"
        try { $v = $Object.$Key; Write-Host "value=[$v] type=$($v.GetType().FullName)" } catch { Write-Host "ERROR access $Key: $_" }
    }
}
TestMetaVal -Object $col -Keys @('unique','isUnique') -Default $false
