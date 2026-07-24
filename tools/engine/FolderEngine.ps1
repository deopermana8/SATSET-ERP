function New-SatsetFolder {

    param(
        [Parameter(Mandatory)]
        [string]$Path
    )

    if (!(Test-Path $Path)) {

        New-Item `
            -ItemType Directory `
            -Path $Path `
            -Force | Out-Null

        Write-Host "[ OK ] Folder : $Path" -ForegroundColor Green

    }
    else {

        Write-Host "[SKIP] Folder : $Path" -ForegroundColor Yellow

    }

}
