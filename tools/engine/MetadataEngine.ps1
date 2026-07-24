Set-StrictMode -Version Latest

function Get-SatsetMetadata {
    param(
        [Parameter(Mandatory = $true)]
        [Alias('Name')]
        [string]$ModuleName
    )

    if ([string]::IsNullOrWhiteSpace($ModuleName)) {
        throw "Metadata name is required."
    }

    $InvalidChars = [System.IO.Path]::GetInvalidFileNameChars()
    if ($ModuleName.IndexOfAny($InvalidChars) -ge 0 -or $ModuleName -match '[\\/:"|?*]') {
        throw "Invalid metadata name '$ModuleName'."
    }

    $RootPath = (Resolve-Path "$PSScriptRoot\..\..").Path
    if ([string]::IsNullOrWhiteSpace($RootPath)) {
        throw "Unable to resolve project root."
    }

    $MetadataRoot = Join-Path $RootPath 'metadata'
    $MetadataFiles = [ordered]@{
        entity = "$ModuleName.entity.json"
        columns = "$ModuleName.columns.json"
        relations = "$ModuleName.relations.json"
        validation = "$ModuleName.validation.json"
        form = "$ModuleName.form.json"
    }

    $Metadata = [ordered]@{
        entity = $null
        columns = $null
        relations = $null
        validation = $null
        form = $null
    }

    foreach ($Key in $MetadataFiles.Keys) {
        $Path = Join-Path $MetadataRoot $MetadataFiles[$Key]
        if (-not (Test-Path $Path)) {
            continue
        }

        try {
            $Metadata[$Key] = Get-Content $Path -Raw | ConvertFrom-Json
        }
        catch {
            $Metadata[$Key] = $null
        }
    }

    return $Metadata
}
