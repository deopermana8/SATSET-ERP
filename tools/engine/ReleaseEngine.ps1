Set-StrictMode -Version Latest

function Get-SatsetFrameworkRootPath {
    return (Resolve-Path "$PSScriptRoot\..\..").Path
}

function Get-SatsetFrameworkVersionInfo {
    return [ordered]@{
        Version = '1.0.0'
        Build = 'RC1'
        Status = 'Stable'
    }
}

function Get-SatsetSupportedCommands {
    return @(
        [ordered]@{ Name = 'doctor'; Description = 'Run SATSET health checks' },
        [ordered]@{ Name = 'test'; Description = 'Run the SATSET regression test suite' },
        [ordered]@{ Name = 'version'; Description = 'Show the SATSET framework version information' },
        [ordered]@{ Name = 'help'; Description = 'Show supported SATSET commands' },
        [ordered]@{ Name = 'docs'; Description = 'Generate framework documentation files' },
        [ordered]@{ Name = 'build'; Description = 'Build the SATSET release package' },
        [ordered]@{ Name = 'make'; Description = 'Run a SATSET generator' }
    )
}

function Get-SatsetDocsManifest {
    $VersionInfo = Get-SatsetFrameworkVersionInfo

    return @(
        [ordered]@{
            Path = 'docs/README.md'
            Content = @"
# SATSET Framework

SATSET is an AI-assisted framework for generating modules, metadata, database assets, frontend and backend scaffolding.

## Version
- Version: $($VersionInfo.Version)
- Build: $($VersionInfo.Build)
- Status: $($VersionInfo.Status)

## Quick Start
Run `satset doctor` to validate the workspace and `satset test` to run the regression suite.
"@
        },
        [ordered]@{
            Path = 'docs/INSTALL.md'
            Content = @"
# Installation

1. Run the SATSET bootstrap script.
2. Verify the workspace with `satset doctor`.
3. Start generating modules with `satset make module <name>`.
"@
        },
        [ordered]@{
            Path = 'docs/QUICKSTART.md'
            Content = @"
# Quick Start

Use the generator commands in sequence:

- `satset make module employee`
- `satset make api employee`
- `satset make menu employee`
"@
        },
        [ordered]@{
            Path = 'docs/CLI.md'
            Content = @"
# CLI Reference

Supported commands:
- `satset doctor`
- `satset test`
- `satset version`
- `satset help`
- `satset docs`
- `satset build`
"@
        },
        [ordered]@{
            Path = 'docs/GENERATORS.md'
            Content = @"
# Generators

SATSET supports module, CRUD, entity, relation, validation, form, SQL, migration, seeder, permission, menu, sidebar, route, API, and OpenAPI generators.
"@
        },
        [ordered]@{
            Path = 'docs/ARCHITECTURE.md'
            Content = @"
# Architecture

SATSET uses a command layer and engine layer. Commands invoke engine functions, while generators use the engine helpers to build files from blueprints and templates.
"@
        },
        [ordered]@{
            Path = 'docs/CHANGELOG.md'
            Content = @"
# Changelog

## 1.0.0-RC1
- Added doctor command.
- Added regression test command.
- Added version, help, docs, and build commands.
"@
        },
        [ordered]@{
            Path = 'docs/ROADMAP.md'
            Content = @"
# Roadmap

- Expand the generator catalog.
- Add richer validation checks.
- Improve release packaging.
"@
        }
    )
}

function Invoke-SatsetDocsGeneration {
    param(
        [string]$RootPath = (Get-SatsetFrameworkRootPath)
    )

    $DocsPath = Join-Path $RootPath 'docs'
    if (-not (Test-Path $DocsPath)) {
        New-Item -ItemType Directory -Path $DocsPath -Force | Out-Null
    }

    $Manifest = Get-SatsetDocsManifest
    $Generated = @()

    foreach ($Item in $Manifest) {
        $FullPath = Join-Path $RootPath $Item.Path
        $Parent = Split-Path -Parent $FullPath
        if (-not (Test-Path $Parent)) {
            New-Item -ItemType Directory -Path $Parent -Force | Out-Null
        }

        Set-Content -Path $FullPath -Value $Item.Content -Encoding UTF8
        $Generated += $FullPath
    }

    return $Generated
}

function Invoke-SatsetBuildRelease {
    param(
        [string]$RootPath = (Get-SatsetFrameworkRootPath)
    )

    $ReleasePath = Join-Path $RootPath 'release'
    if (-not (Test-Path $ReleasePath)) {
        New-Item -ItemType Directory -Path $ReleasePath -Force | Out-Null
    }

    $ArchivePath = Join-Path $ReleasePath 'SATSET-v1.0.0.zip'

    $Entries = @(
        (Join-Path $RootPath 'docs'),
        (Join-Path $RootPath 'examples'),
        (Join-Path $RootPath 'tools'),
        (Join-Path $RootPath 'satset.cmd'),
        (Join-Path $RootPath 'satset.ps1')
    )

    if (Test-Path $ArchivePath) {
        Remove-Item -Path $ArchivePath -Force
    }

    Compress-Archive -Path $Entries -DestinationPath $ArchivePath -Force

    return $ArchivePath
}
