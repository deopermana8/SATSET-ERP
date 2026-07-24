. "$PSScriptRoot\PluginRegistry.ps1"

function Get-SatsetPluginByName {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $Plugins = Get-SatsetPluginRegistry
    $Plugin = $Plugins | Where-Object { $_.name -ieq $Name } | Select-Object -First 1

    if ($null -eq $Plugin) {
        throw "Plugin '$Name' not found in registry."
    }

    Validate-SatsetPluginLoader -Plugin $Plugin
    return $Plugin
}

function Load-SatsetPluginByName {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $Plugin = Get-SatsetPluginByName -Name $Name

    if (-not $Plugin.enabled) {
        throw "Plugin '$Name' is disabled."
    }

    return $Plugin
}

function Validate-SatsetPluginLoader {
    param(
        [Parameter(Mandatory)]
        $Plugin
    )

    if (-not (Test-Path $Plugin.folderPath)) {
        throw "Plugin folder not found: $($Plugin.folderPath)"
    }

    if (-not (Test-Path $Plugin.manifestPath)) {
        throw "Plugin manifest path no longer exists: $($Plugin.manifestPath)"
    }

    if ($null -eq $Plugin.generators -or $Plugin.generators.Count -eq 0) {
        throw "Plugin '$($Plugin.name)' contains no generators."
    }

    $RootPath = (Resolve-Path "$PSScriptRoot\..\..").Path
    $GeneratorRoot = Join-Path $RootPath 'tools\generators'

    foreach ($GeneratorName in $Plugin.generators) {
        $GeneratorPath = Join-Path $GeneratorRoot "$GeneratorName.ps1"
        if (-not (Test-Path $GeneratorPath)) {
            throw "Plugin '$($Plugin.name)' declares unknown generator '$GeneratorName'."
        }
    }
}
