param($Name)

if([string]::IsNullOrWhiteSpace($Name)){
    Write-Host ""
    Write-Host "Pemakaian:"
    Write-Host "  .\satset.ps1 crud ticket"
    Write-Host ""
    exit
}

$Root = Split-Path (Split-Path $PSScriptRoot)

$Dirs = @(
"$Root\apps\admin\app\$Name",
"$Root\apps\admin\app\api\$Name",
"$Root\apps\admin\components\$Name",
"$Root\apps\admin\lib"
)

foreach($d in $Dirs){
    New-Item -ItemType Directory -Force $d | Out-Null
}

@"
import { NextResponse } from "next/server";

export async function GET() {

    return NextResponse.json([]);

}
"@ | Set-Content "$Root\apps\admin\app\api\$Name\route.ts" -Encoding UTF8

@"
export default function Page(){

    return(
        <div>
            <h1>$Name</h1>
        </div>
    )

}
"@ | Set-Content "$Root\apps\admin\app\$Name\page.tsx" -Encoding UTF8

@"
export default function ${Name}Form(){

    return(
        <div>FORM $Name</div>
    )

}
"@ | Set-Content "$Root\apps\admin\components\$Name\Form.tsx" -Encoding UTF8

@"
export default function ${Name}Table(){

    return(
        <div>TABLE $Name</div>
    )

}
"@ | Set-Content "$Root\apps\admin\components\$Name\Table.tsx" -Encoding UTF8

Write-Host ""
Write-Host "CRUD [$Name] berhasil dibuat." -ForegroundColor Green
Write-Host ""
