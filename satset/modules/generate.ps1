$Root = Split-Path (Split-Path $PSScriptRoot)

$Schema = "$Root\apps\admin\prisma\schema.prisma"

$Models = @()

Get-Content $Schema | ForEach-Object{

    if($_ -match '^\s*model\s+([A-Za-z0-9_]+)'){

        $Models += $Matches[1]

    }

}

Write-Host ""
Write-Host "===================================="
Write-Host " SATSET AUTO GENERATOR"
Write-Host "===================================="
Write-Host ""

foreach($Model in $Models){

    $Name = $Model.ToLower()

    Write-Host "Generate CRUD : $Name" -ForegroundColor Cyan

    & "$PSScriptRoot\crud.ps1" $Name

}

Write-Host ""
Write-Host "===================================="
Write-Host " SEMUA CRUD BERHASIL DIGENERATE"
Write-Host "===================================="
Write-Host ""
