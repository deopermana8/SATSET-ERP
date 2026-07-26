param($Name)

if(!$Name){

    Write-Host ""
    Write-Host "Contoh:"
    Write-Host ".\satset.ps1 api ticket"
    Write-Host ""
    exit

}

$Root = Split-Path (Split-Path $PSScriptRoot)

$Api = Join-Path $Root "apps\admin\app\api\$Name"

New-Item -ItemType Directory -Force $Api | Out-Null

@"
import { NextResponse } from "next/server";

export async function GET(){

    return NextResponse.json([]);

}
"@ | Set-Content (Join-Path $Api "route.ts") -Encoding UTF8

Write-Host ""
Write-Host "API [$Name] berhasil dibuat." -ForegroundColor Green
Write-Host ""
