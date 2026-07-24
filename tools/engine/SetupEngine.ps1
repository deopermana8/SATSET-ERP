Set-StrictMode -Version Latest

function Get-SatsetSetupRootPath {
    return (Resolve-Path "$PSScriptRoot\..\..").Path
}

function Test-SatsetSetupCommand {
    param(
        [Parameter(Mandatory)]
        [string]$CommandName,

        [Parameter(Mandatory)]
        [string]$DisplayName
    )

    $CommandPath = (Get-Command $CommandName -ErrorAction SilentlyContinue)
    if ($null -ne $CommandPath) {
        return [ordered]@{ Name = $DisplayName; Passed = $true; Detail = $CommandName }
    }

    return [ordered]@{ Name = $DisplayName; Passed = $false; Detail = $CommandName }
}

function Invoke-SatsetSetup {
    $RootPath = Get-SatsetSetupRootPath

    $Checks = @()

    $Checks += [ordered]@{ Name = 'Root'; Passed = $true; Detail = $RootPath }

    $MetadataPath = Join-Path $RootPath 'metadata'
    if (-not (Test-Path $MetadataPath)) {
        New-Item -ItemType Directory -Path $MetadataPath -Force | Out-Null
    }
    $Checks += [ordered]@{ Name = 'Metadata'; Passed = $true; Detail = $MetadataPath }

    $DocsPath = Join-Path $RootPath 'docs'
    if (-not (Test-Path $DocsPath)) {
        New-Item -ItemType Directory -Path $DocsPath -Force | Out-Null
    }
    $Checks += [ordered]@{ Name = 'Docs'; Passed = $true; Detail = $DocsPath }

    $ReleasePath = Join-Path $RootPath 'release'
    if (-not (Test-Path $ReleasePath)) {
        New-Item -ItemType Directory -Path $ReleasePath -Force | Out-Null
    }
    $Checks += [ordered]@{ Name = 'Release'; Passed = $true; Detail = $ReleasePath }

    $ExamplesPath = Join-Path $RootPath 'examples'
    if (-not (Test-Path $ExamplesPath)) {
        New-Item -ItemType Directory -Path $ExamplesPath -Force | Out-Null
    }
    $Checks += [ordered]@{ Name = 'Examples'; Passed = $true; Detail = $ExamplesPath }

    $Checks += Test-SatsetSetupCommand -CommandName 'powershell' -DisplayName 'PowerShell'
    $Checks += Test-SatsetSetupCommand -CommandName 'node' -DisplayName 'Node'
    $Checks += Test-SatsetSetupCommand -CommandName 'pnpm' -DisplayName 'PNPM'

    return $Checks
}
