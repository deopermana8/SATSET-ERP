Set-StrictMode -Version Latest

function Invoke-SatsetInit {
    $RootPath = (Resolve-Path "$PSScriptRoot\..\..").Path

    $Folders = @(
        'apps',
        'metadata',
        'docs',
        'release',
        'examples'
    )

    $Results = @()

    foreach ($Folder in $Folders) {
        $FullPath = Join-Path $RootPath $Folder
        if (Test-Path $FullPath) {
            $Results += [ordered]@{ Name = $Folder; Status = 'SKIP' }
            continue
        }

        New-Item -ItemType Directory -Path $FullPath -Force | Out-Null
        $Results += [ordered]@{ Name = $Folder; Status = 'OK' }
    }

    return $Results
}
