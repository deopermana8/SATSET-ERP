Set-StrictMode -Version Latest

function Get-SatsetTestRootPath {
    return (Resolve-Path "$PSScriptRoot\..\..").Path
}

function Get-SatsetTestGeneratorOrder {
    return @(
        'module',
        'crud',
        'entity',
        'column',
        'relation',
        'validation',
        'form',
        'sql',
        'migration',
        'seeder',
        'permission',
        'menu',
        'sidebar',
        'route',
        'api',
        'openapi'
    )
}

function Invoke-SatsetTestGenerator {
    param(
        [Parameter(Mandatory)]
        [string]$GeneratorName,

        [Parameter(Mandatory)]
        [string]$ModuleName,

        [Parameter(Mandatory)]
        [string]$RootPath
    )

    $Start = Get-Date
    $GeneratorScript = Join-Path $RootPath "tools/generators/$GeneratorName.ps1"
    $Output = & powershell -ExecutionPolicy Bypass -File $GeneratorScript -Name $ModuleName 2>&1
    $Elapsed = [math]::Round(((Get-Date) - $Start).TotalSeconds, 2)

    $Passed = $LASTEXITCODE -eq 0

    return [ordered]@{
        Name = $GeneratorName
        Passed = $Passed
        Elapsed = $Elapsed
        Output = $Output
    }
}

function Invoke-SatsetTestSuite {
    param(
        [string]$ModuleName = '__satset_test__'
    )

    $RootPath = Get-SatsetTestRootPath
    $Results = @()

    foreach ($GeneratorName in Get-SatsetTestGeneratorOrder) {
        $Result = Invoke-SatsetTestGenerator -GeneratorName $GeneratorName -ModuleName $ModuleName -RootPath $RootPath
        $Results += [pscustomobject]@{
            Name = $Result.Name
            Passed = $Result.Passed
            Elapsed = $Result.Elapsed
        }
    }

    return $Results
}
