function Get-SatsetPluginManifest {
    param(
        [Parameter(Mandatory)]
        [string]$ManifestPath
    )

    if (-not (Test-Path $ManifestPath)) {
        throw "Plugin manifest not found: $ManifestPath"
    }

    $RawContent = Get-Content $ManifestPath -Raw
    try {
        $PluginData = $RawContent | ConvertFrom-Json
    }
    catch {
        throw "Invalid plugin manifest JSON: $ManifestPath"
    }

    if ($null -eq $PluginData) {
        throw "Plugin manifest is empty: $ManifestPath"
    }

    $Plugin = [ordered]@{
        name = [string]$PluginData.name
        version = [string]$PluginData.version
        author = [string]$PluginData.author
        description = [string]$PluginData.description
        enabled = $false
        generators = @()
        manifestPath = $ManifestPath
        folderPath = Split-Path -Parent $ManifestPath
    }

    if ($PluginData.enabled -eq $true -or $PluginData.enabled -eq $false) {
        $Plugin.enabled = [bool]$PluginData.enabled
    }

    if ($null -ne $PluginData.generators) {
        $Plugin.generators = @($PluginData.generators) | ForEach-Object { [string]$_ }
    }

    Validate-SatsetPluginManifest -Plugin $Plugin
    return $Plugin
}

function Validate-SatsetPluginManifest {
    param(
        [Parameter(Mandatory)]
        $Plugin
    )

    if ([string]::IsNullOrWhiteSpace([string]$Plugin.name)) {
        throw "Plugin manifest must contain a non-empty 'name'."
    }

    if ([string]::IsNullOrWhiteSpace([string]$Plugin.version)) {
        throw "Plugin manifest must contain a non-empty 'version'."
    }

    if ($Plugin.enabled -ne $true -and $Plugin.enabled -ne $false) {
        throw "Plugin manifest 'enabled' must be true or false."
    }

    if ($null -eq $Plugin.generators -or $Plugin.generators.Count -eq 0) {
        throw "Plugin manifest must contain at least one generator in 'generators'."
    }

    foreach ($GeneratorName in $Plugin.generators) {
        if ([string]::IsNullOrWhiteSpace([string]$GeneratorName)) {
            throw "Plugin manifest contains invalid generator name."
        }
    }
}
