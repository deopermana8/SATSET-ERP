function Write-SatsetFile {

    param(
        [Parameter(Mandatory)]
        [string]$Path,

        [Parameter(Mandatory)]
        [string]$Content
    )

    $Folder = Split-Path $Path -Parent

    if (!(Test-Path $Folder)) {

        New-Item `
            -ItemType Directory `
            -Path $Folder `
            -Force | Out-Null

    }

    $Content | Set-Content `
        -Path $Path `
        -Encoding UTF8

    Write-Host "[ OK ] File : $Path" -ForegroundColor Green

}
