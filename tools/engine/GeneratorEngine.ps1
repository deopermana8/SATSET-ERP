. "$PSScriptRoot\BlueprintEngine.ps1"
. "$PSScriptRoot\TemplateEngine.ps1"

function Get-SatsetRootPath {
    $RootPath = (Resolve-Path "$PSScriptRoot\..\..").Path
    if ([string]::IsNullOrWhiteSpace($RootPath)) {
        throw "Unable to resolve project root."
    }

    return $RootPath
}

function Get-SatsetDashboardPath {
    $RootPath = Get-SatsetRootPath
    return Join-Path $RootPath "apps\admin\app\(dashboard)"
}

function Get-SatsetModulePath {
    param(
        [Parameter(Mandatory)]
        [string]$ModuleName
    )

    Test-SatsetModuleName -Name $ModuleName | Out-Null
    return Join-Path (Get-SatsetDashboardPath) $ModuleName
}

function Test-SatsetModuleName {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    if ([string]::IsNullOrWhiteSpace($Name)) {
        throw "Module name is required."
    }

    $InvalidChars = [System.IO.Path]::GetInvalidFileNameChars()
    if ($Name.IndexOfAny($InvalidChars) -ge 0 -or $Name -match '[\\/<>:"|?*]') {
        throw "Invalid module name '$Name'."
    }

    return $Name
}

function Get-SatsetCrudTemplateDefinitions {
    return @(
        @{ Template = 'columns.txt'; Target = 'columns.ts' },
        @{ Template = 'schema.txt'; Target = 'schema.ts' },
        @{ Template = 'validation.txt'; Target = 'validation.ts' }
    )
}

function New-SatsetRenderedFile {
    param(
        [Parameter(Mandatory)]
        [string]$ModuleName,

        [Parameter(Mandatory)]
        [string]$TemplateName,

        [Parameter(Mandatory)]
        [string]$TargetName,

        [string]$OutputRoot,

        [hashtable]$TemplateValues,

        [switch]$Force
    )

    $ModuleName = Test-SatsetModuleName -Name $ModuleName
    $ModulePath = Get-SatsetModulePath -ModuleName $ModuleName
    $ModuleUpper = ($ModuleName.Substring(0, 1).ToUpperInvariant()) + $ModuleName.Substring(1)

    $TemplateContent = Get-SatsetTemplate $TemplateName

    $ReplacementMap = [ordered]@{
        MODULE = $ModuleName
        MODULE_UPPER = $ModuleUpper
    }

    if ($TemplateValues) {
        foreach ($Key in $TemplateValues.Keys) {
            $ReplacementMap[$Key] = [string]$TemplateValues[$Key]
        }
    }

    $RenderedContent = $TemplateContent
    foreach ($Key in $ReplacementMap.Keys) {
        $RenderedContent = $RenderedContent.Replace("{{${Key}}}", [string]$ReplacementMap[$Key])
    }
    $RenderedContent = $RenderedContent.Replace("useModule", "use$ModuleUpper")

    $ResolvedTarget = $TargetName
    foreach ($Key in $ReplacementMap.Keys) {
        $ResolvedTarget = $ResolvedTarget.Replace("{{${Key}}}", [string]$ReplacementMap[$Key])
    }

    $TargetBasePath = if ([string]::IsNullOrWhiteSpace($OutputRoot)) { $ModulePath } else { $OutputRoot }
    $TargetPath = Join-Path $TargetBasePath $ResolvedTarget
    $TargetDir = Split-Path -Parent $TargetPath
    $TargetFileName = [System.IO.Path]::GetFileName($TargetPath)

    if ($TargetDir -and -not (Test-Path $TargetDir)) {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    }

    $ExistingEntries = @()
    if (Test-Path $TargetDir) {
        $ExistingEntries = Get-ChildItem -LiteralPath $TargetDir -Force
    }

    $ExactMatch = $ExistingEntries | Where-Object { [System.StringComparer]::Ordinal.Equals($_.Name, $TargetFileName) } | Select-Object -First 1
    $CaseInsensitiveMatch = $null
    if (-not $ExactMatch) {
        $CaseInsensitiveMatch = $ExistingEntries | Where-Object { [System.StringComparer]::OrdinalIgnoreCase.Equals($_.Name, $TargetFileName) } | Select-Object -First 1
    }

    if ($ExactMatch -and -not $Force) {
        Write-Host "[ SKIP ] File : $TargetPath" -ForegroundColor Yellow
        return $TargetPath
    }

    if ($CaseInsensitiveMatch -and -not $Force) {
        Write-Host "[ SKIP ] File : $TargetPath" -ForegroundColor Yellow
        return $TargetPath
    }

    if ($CaseInsensitiveMatch -and $Force) {
        Remove-Item -LiteralPath $CaseInsensitiveMatch.FullName -Force
    }

    Set-Content -Path $TargetPath -Value $RenderedContent -Encoding UTF8
    Write-Host "[ OK ] File : $TargetPath" -ForegroundColor Green
    return $TargetPath
}

function New-SatsetModule {
    param(
        [Parameter(Mandatory)]
        [string]$Name,

        [switch]$Force
    )

    $ModuleName = Test-SatsetModuleName -Name $Name
    $ModulePath = Get-SatsetModulePath -ModuleName $ModuleName

    $Folders = @(
        $ModulePath,
        (Join-Path $ModulePath "components"),
        (Join-Path $ModulePath "hooks"),
        (Join-Path $ModulePath "services")
    )

    foreach ($Folder in $Folders) {
        if (-not (Test-Path $Folder)) {
            New-Item -ItemType Directory -Path $Folder -Force | Out-Null
            Write-Host "[ OK ] Folder : $Folder" -ForegroundColor Green
        }
    }

    $Blueprint = Get-SatsetBlueprint "module"

    foreach ($Item in $Blueprint) {
        $TemplateName = [string]$Item.template
        $TargetName = [string]$Item.target

        New-SatsetRenderedFile -ModuleName $ModuleName -TemplateName $TemplateName -TargetName $TargetName -Force:$Force | Out-Null
    }
}
