$Root = Split-Path (Split-Path $PSScriptRoot)

Write-Host ""
Write-Host "========== SATSET DOCTOR =========="
Write-Host ""

$Items = @(
    @{Name="Git";Path="$Root\.git"},
    @{Name="Apps";Path="$Root\apps"},
    @{Name="Admin";Path="$Root\apps\admin"},
    @{Name="Web";Path="$Root\apps\web"},
    @{Name="Schema";Path="$Root\apps\admin\prisma\schema.prisma"},
    @{Name="Generated";Path="$Root\apps\admin\generated\prisma"}
)

foreach($i in $Items){

    if(Test-Path $i.Path){

        Write-Host ("[ OK ] " + $i.Name) -ForegroundColor Green

    }else{

        Write-Host ("[FAIL] " + $i.Name) -ForegroundColor Red

    }

}

Write-Host ""
