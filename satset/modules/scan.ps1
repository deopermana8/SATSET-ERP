Write-Host ""
Write-Host "==============================" -ForegroundColor Cyan
Write-Host " SATSET PROJECT SCANNER" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

$Items=@(
".\apps\admin",
".\apps\web",
".\apps\admin\prisma",
".\apps\admin\generated",
".\satset"
)

foreach($i in $Items){
    if(Test-Path $i){
        Write-Host "[ OK ] $i" -ForegroundColor Green
    }
    else{
        Write-Host "[FAIL] $i" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "SCAN SELESAI" -ForegroundColor Cyan
