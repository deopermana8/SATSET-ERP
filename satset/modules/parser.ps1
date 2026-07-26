param()

$Schema = ".\apps\admin\prisma\schema.prisma"
$Cache  = ".\satset\cache\models.json"

if(!(Test-Path $Schema)){
    Write-Host "schema.prisma tidak ditemukan." -ForegroundColor Red
    exit
}

$Models = @()
$Current = $null
