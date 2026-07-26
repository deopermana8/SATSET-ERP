$Root = Split-Path (Split-Path $PSScriptRoot)
$Tpl = Join-Path $Root "satset\templates"
New-Item -ItemType Directory -Force $Tpl | Out-Null

$Files=@(
    "dialog.tpl"
    "service.tpl"
    "hook.tpl"
    "type.tpl"
    "validation.tpl"
    "repository.tpl"
)

foreach($f in $Files){
    New-Item -ItemType File -Force (Join-Path $Tpl $f) | Out-Null
    Write-Host "[ OK ] $f" -ForegroundColor Green
}

Write-Host ""
Write-Host "TEMPLATE INSTALL SELESAI" -ForegroundColor Cyan
