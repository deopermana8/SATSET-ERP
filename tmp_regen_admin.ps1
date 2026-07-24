$ErrorActionPreference = 'Stop'
$files = Get-ChildItem metadata -Filter '*.entity.json'
foreach ($file in $files) {
    $name = $file.BaseName -replace '\.entity$', ''
    Write-Host "Generating $name"
    & .\tools\generators\menu.ps1 -Name $name -Force
    & .\tools\generators\route.ps1 -Name $name -Force
    & .\tools\generators\sidebar.ps1 -Name $name -Force
    & .\tools\generators\permission.ps1 -Name $name -Force
}
