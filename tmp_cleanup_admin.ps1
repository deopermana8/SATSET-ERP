$ErrorActionPreference = 'Stop'
$dirs = @("apps/admin/menu", "apps/admin/routes", "apps/admin/sidebar", "apps/admin/permissions")
$removed = @()
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) { continue }
    $files = Get-ChildItem -Path $dir -File | Where-Object { $_.Name -match '\.entity\.' }
    foreach ($file in $files) {
        Remove-Item -LiteralPath $file.FullName -Force
        $removed += $file.FullName
        Write-Host "Removed stale file: $($file.FullName)"
    }
}
if ($removed.Count -eq 0) {
    Write-Host 'No stale invalid generated files found.'
}
Write-Host ''
Write-Host 'Remaining invalid generated files:'
Get-ChildItem apps/admin/menu,apps/admin/routes,apps/admin/sidebar,apps/admin/permissions -File | Where-Object { $_.Name -match '\.entity\.' } | Select-Object FullName | Format-Table -AutoSize
