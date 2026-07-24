. "$PSScriptRoot\PluginManifest.ps1"

function Get-SatsetPluginRegistry {
    $RootPath = (Resolve-Path "$PSScriptRoot\..\..").Path
    $PluginsRoot = Join-Path $RootPath 'plugins'

    if (-not (Test-Path $PluginsRoot)) {
        return @()
    }

    $PluginFolders = Get-ChildItem -Path $PluginsRoot -Directory -ErrorAction SilentlyContinue
    $Plugins = @()

    foreach ($Folder in $PluginFolders) {
        $ManifestPath = Join-Path $Folder.FullName 'plugin.json'
        if (Test-Path $ManifestPath) {
            try {
                $Plugin = Get-SatsetPluginManifest -ManifestPath $ManifestPath
                $Plugins += $Plugin
            }
            catch {
                Write-Warning "Skipping plugin folder '$($Folder.Name)': $($_.Exception.Message)"
            }
        }
        else {
            Write-Warning "Skipping plugin folder '$($Folder.Name)': plugin.json not found."
        }
    }

    return $Plugins
}
