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

function ConvertTo-SatsetSlug {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $Normalized = [string]$Name
    if ([string]::IsNullOrWhiteSpace($Normalized)) {
        return ""
    }

    $Normalized = $Normalized.Trim()
    $Normalized = $Normalized -replace '[\s_]+', '-'
    $Normalized = $Normalized -creplace '([a-z0-9])([A-Z])', '$1-$2'
    $Normalized = $Normalized -replace '[^a-zA-Z0-9]+', '-'
    $Normalized = $Normalized -replace '-{2,}', '-'
    $Normalized = $Normalized.Trim('-')
    $Normalized = $Normalized.ToLowerInvariant()

    if ([string]::IsNullOrWhiteSpace($Normalized)) {
        return ""
    }

    return $Normalized
}

function ConvertTo-SatsetPascalCase {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $Slug = ConvertTo-SatsetSlug -Name $Name
    if ([string]::IsNullOrWhiteSpace($Slug)) {
        return ""
    }

    $Parts = $Slug -split '-'
    $Pascal = ($Parts | ForEach-Object {
        if ([string]::IsNullOrWhiteSpace($_)) {
            return ""
        }

        return $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1)
    }) -join ''

    return $Pascal
}

function ConvertTo-SatsetCamelCase {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $Pascal = ConvertTo-SatsetPascalCase -Name $Name
    if ([string]::IsNullOrWhiteSpace($Pascal)) {
        return ""
    }

    return $Pascal.Substring(0, 1).ToLowerInvariant() + $Pascal.Substring(1)
}

function ConvertTo-SatsetPlural {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $Slug = ConvertTo-SatsetSlug -Name $Name
    if ([string]::IsNullOrWhiteSpace($Slug)) {
        return ""
    }

    if ($Slug.EndsWith('s')) {
        return $Slug
    }

    if ($Slug.EndsWith('y') -and $Slug.Length -gt 1 -and -not ($Slug.EndsWith('ay') -or $Slug.EndsWith('ey') -or $Slug.EndsWith('iy') -or $Slug.EndsWith('oy') -or $Slug.EndsWith('uy'))) {
        return "$($Slug.Substring(0, $Slug.Length - 1))ies"
    }

    return "$Slug" + 's'
}

function Test-SatsetModuleName {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    if ([string]::IsNullOrWhiteSpace($Name)) {
        throw "Module name is required."
    }

    $NormalizedName = ConvertTo-SatsetSlug -Name $Name
    if ([string]::IsNullOrWhiteSpace($NormalizedName)) {
        throw "Module name is required."
    }

    if ($NormalizedName -notmatch '^[a-z0-9]+(?:-[a-z0-9]+)*$') {
        throw "Invalid module name '$Name'."
    }

    return $NormalizedName
}

function Get-SatsetCrudTemplateDefinitions {
    return @(
        @{ Template = 'columns.txt'; Target = 'columns.ts' },
        @{ Template = 'schema.txt'; Target = 'schema.ts' },
        @{ Template = 'validation.txt'; Target = 'validation.ts' }
    )
}

function Get-SatsetCrudExtendedTemplateDefinitions {
    param(
        [Parameter(Mandatory)]
        [string]$ModuleName
    )

    $SafeModuleName = Test-SatsetModuleName -Name $ModuleName
    $RootPath = Get-SatsetRootPath
    $ModulePath = Get-SatsetModulePath -ModuleName $SafeModuleName
    $ApiRoot = Join-Path (Join-Path $RootPath "apps\admin\app\api") $SafeModuleName

    return @(
        @{ Template = 'admin-actions.txt'; Target = 'actions.ts'; OutputRoot = $ModulePath },
        @{ Template = 'admin-api-route.txt'; Target = 'route.ts'; OutputRoot = $ApiRoot },
        @{ Template = 'admin-api-id-route.txt'; Target = '[id]/route.ts'; OutputRoot = $ApiRoot }
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
    $ModuleUpper = ConvertTo-SatsetPascalCase -Name $ModuleName
    $ModuleCamel = ConvertTo-SatsetCamelCase -Name $ModuleName
    $ModuleKebab = ConvertTo-SatsetSlug -Name $ModuleName
    $ModulePlural = ConvertTo-SatsetPlural -Name $ModuleName

    $TemplateContent = Get-SatsetTemplate $TemplateName

    $ReplacementMap = [ordered]@{
        MODULE = $ModuleName
        MODULE_UPPER = $ModuleUpper
        MODULE_CAMEL = $ModuleCamel
        MODULE_KEBAB = $ModuleKebab
        MODULE_PLURAL = $ModulePlural
        MODULE_LOWER = $ModuleKebab
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
    $RelativeTarget = $ResolvedTarget -replace '^[\\/]+', ''
    $RelativeTarget = $RelativeTarget -replace '^[.][\\/]+', ''
    $RelativeTarget = $RelativeTarget -replace '[\\/]+', [System.IO.Path]::DirectorySeparatorChar
    $TargetPath = Join-Path $TargetBasePath $RelativeTarget
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

    $RenderedContent | Out-File -LiteralPath $TargetPath -Encoding UTF8 -NoNewline
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
