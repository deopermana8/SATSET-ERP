. "$PSScriptRoot\PluginLoader.ps1"

function Get-SatsetPluginList {
    return Get-SatsetPluginRegistry
}

function Get-SatsetPluginInfo {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $Plugins = Get-SatsetPluginRegistry
    $Plugin = $Plugins | Where-Object { $_.name -ieq $Name } | Select-Object -First 1
    if ($null -eq $Plugin) {
        throw "Plugin '$Name' not found."
    }

    return $Plugin
}

function Load-SatsetPlugin {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    return Load-SatsetPluginByName -Name $Name
}

function Enable-SatsetPlugin {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $Plugin = Get-SatsetPluginByName -Name $Name
    $Manifest = Get-Content $Plugin.manifestPath -Raw | ConvertFrom-Json
    $Manifest.enabled = $true
    $Manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $Plugin.manifestPath -Encoding UTF8

    return Get-SatsetPluginInfo -Name $Name
}

function Disable-SatsetPlugin {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $Plugin = Get-SatsetPluginByName -Name $Name
    $Manifest = Get-Content $Plugin.manifestPath -Raw | ConvertFrom-Json
    $Manifest.enabled = $false
    $Manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $Plugin.manifestPath -Encoding UTF8

    return Get-SatsetPluginInfo -Name $Name
}

function Install-SatsetPlugin {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $RootPath = (Resolve-Path "$PSScriptRoot\..\..").Path
    $PluginsRoot = Join-Path $RootPath 'plugins'
    $PluginFolder = Join-Path $PluginsRoot $Name

    if (Test-Path $PluginFolder) {
        throw "Plugin '$Name' is already installed."
    }

    New-Item -ItemType Directory -Path $PluginFolder -Force | Out-Null
    $Manifest = [ordered]@{
        name = $Name
        version = '0.0.1'
        author = 'SATSET'
        description = "Installed plugin $Name"
        enabled = $false
        generators = @('module')
    }

    $ManifestPath = Join-Path $PluginFolder 'plugin.json'
    $Manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $ManifestPath -Encoding UTF8

    return Get-SatsetPluginInfo -Name $Name
}

function Uninstall-SatsetPlugin {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $RootPath = (Resolve-Path "$PSScriptRoot\..\..").Path
    $PluginsRoot = Join-Path $RootPath 'plugins'
    $PluginFolder = Join-Path $PluginsRoot $Name

    if (-not (Test-Path $PluginFolder)) {
        throw "Plugin '$Name' is not installed."
    }

    Remove-Item -Path $PluginFolder -Recurse -Force
    return $true
}
