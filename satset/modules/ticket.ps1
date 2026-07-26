param($Root)

$Schema = Join-Path $Root "apps\admin\prisma\schema.prisma"

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host " SATSET CLI - TICKET" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

if(!(Test-Path $Schema)){
    Write-Host "[FAIL] schema.prisma tidak ditemukan." -ForegroundColor Red
    exit
}

Copy-Item $Schema "$Schema.bak" -Force
Write-Host "[ OK ] Backup schema dibuat." -ForegroundColor Green

$content = Get-Content $Schema -Raw

if($content -match "model\s+Ticket"){
    Write-Host "[ OK ] Model Ticket sudah ada." -ForegroundColor Yellow
}
else{
    Write-Host "[INFO] Model Ticket belum ada." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Silakan tambahkan model Ticket terlebih dahulu." -ForegroundColor White
}

Write-Host ""
Write-Host "SATSET Ticket selesai." -ForegroundColor Green
