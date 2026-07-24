Write-Host ""
Write-Host "Checking Project..." -ForegroundColor Yellow

$admin = ".\apps\admin"
$schema = ".\apps\admin\prisma\schema.prisma"
$client = ".\apps\admin\generated\prisma"

Write-Host ""

if(Test-Path $admin){
    Write-Host "? Admin Project" -ForegroundColor Green
}else{
    Write-Host "? Admin Project" -ForegroundColor Red
}

if(Test-Path $schema){
    Write-Host "? Prisma Schema" -ForegroundColor Green
}else{
    Write-Host "? Prisma Schema" -ForegroundColor Red
}

if(Test-Path $client){
    Write-Host "? Prisma Client" -ForegroundColor Green
}else{
    Write-Host "? Prisma Client" -ForegroundColor Red
}

Write-Host ""
Write-Host "Doctor selesai." -ForegroundColor Cyan
