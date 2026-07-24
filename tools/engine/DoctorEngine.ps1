Set-StrictMode -Version Latest

function Get-SatsetDoctorRootPath {
    return (Resolve-Path "$PSScriptRoot\..\..").Path
}

function Get-SatsetDoctorCheckResult {
    param(
        [Parameter(Mandatory)]
        [string]$Name,

        [Parameter(Mandatory)]
        [bool]$Passed,

        [string]$Detail
    )

    if ($Passed) {
        return [ordered]@{
            Name = $Name
            Passed = $true
            Status = "[ OK ]"
            Detail = $Detail
        }
    }

    return [ordered]@{
        Name = $Name
        Passed = $false
        Status = "[FAIL]"
        Detail = $Detail
    }
}

function Test-SatsetDoctorPath {
    param(
        [Parameter(Mandatory)]
        [string]$Path,

        [Parameter(Mandatory)]
        [string]$Name
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return Get-SatsetDoctorCheckResult -Name $Name -Passed $false -Detail "Missing path"
    }

    if (Test-Path $Path) {
        return Get-SatsetDoctorCheckResult -Name $Name -Passed $true -Detail $Path
    }

    return Get-SatsetDoctorCheckResult -Name $Name -Passed $false -Detail $Path
}

function Test-SatsetDoctorFile {
    param(
        [Parameter(Mandatory)]
        [string]$Path,

        [Parameter(Mandatory)]
        [string]$Name
    )

    if (Test-Path $Path) {
        return Get-SatsetDoctorCheckResult -Name $Name -Passed $true -Detail $Path
    }

    return Get-SatsetDoctorCheckResult -Name $Name -Passed $false -Detail $Path
}

function Get-SatsetDoctorResults {

    $RootPath = Get-SatsetDoctorRootPath

    $Checks = @(
        (Test-SatsetDoctorPath -Path $RootPath -Name 'Root Path'),
        (Test-SatsetDoctorPath -Path (Join-Path $RootPath 'tools/blueprints') -Name 'Blueprint Folder'),
        (Test-SatsetDoctorPath -Path (Join-Path $RootPath 'tools/templates') -Name 'Template Folder'),
        (Test-SatsetDoctorPath -Path (Join-Path $RootPath 'metadata') -Name 'Metadata Folder'),
        (Test-SatsetDoctorPath -Path (Join-Path $RootPath 'tools/generators') -Name 'Generator Folder')
    )

    $Blueprints = @(
        'module','crud','entity','column','relation','validation','form','sql','migration','seeder','permission','menu','sidebar','route','api','openapi'
    )

    foreach ($BlueprintName in $Blueprints) {
        $BlueprintPath = Join-Path $RootPath "tools/blueprints/$BlueprintName.json"
        $Checks += Test-SatsetDoctorFile -Path $BlueprintPath -Name "Blueprint: $BlueprintName"
    }

    $EngineFiles = @(
        'BlueprintEngine.ps1','TemplateEngine.ps1','GeneratorEngine.ps1','MetadataEngine.ps1','SqlEngine.ps1','MigrationEngine.ps1','ApiEngine.ps1','PermissionEngine.ps1','MenuEngine.ps1','SidebarEngine.ps1','RouteEngine.ps1','OpenApiEngine.ps1'
    )

    foreach ($EngineFile in $EngineFiles) {
        $EnginePath = Join-Path $RootPath "tools/engine/$EngineFile"
        $Checks += Test-SatsetDoctorFile -Path $EnginePath -Name "Engine: $EngineFile"
    }

    return $Checks
}
