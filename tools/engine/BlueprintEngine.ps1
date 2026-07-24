function Get-SatsetBlueprint {

    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $Root = Resolve-Path "$PSScriptRoot\.."
    $BlueprintFile = Join-Path $Root "blueprints\$Name.json"

    if (!(Test-Path $BlueprintFile)) {
        throw "Blueprint tidak ditemukan: $Name"
    }

    try {
        $Blueprint = Get-Content $BlueprintFile -Raw | ConvertFrom-Json
    }
    catch {
        throw "Blueprint JSON tidak valid: $Name"
    }

    if ($null -eq $Blueprint) {
        throw "Blueprint kosong: $Name"
    }

    if ($Blueprint -isnot [System.Array]) {
        $Blueprint = @($Blueprint)
    }

    foreach ($Item in $Blueprint) {
        if ([string]::IsNullOrWhiteSpace([string]$Item.template) -or [string]::IsNullOrWhiteSpace([string]$Item.target)) {
            throw "Blueprint '$Name' tidak valid: setiap item harus memiliki template dan target."
        }
    }

    return $Blueprint

}
