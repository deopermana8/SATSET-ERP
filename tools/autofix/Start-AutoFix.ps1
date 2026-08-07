param(
    [string]$ProjectRoot
)

$scriptRoot = Split-Path -Parent $PSCommandPath
$resolvedRoot = if ($ProjectRoot) {
    Resolve-Path $ProjectRoot
}
else {
    Resolve-Path (Join-Path $scriptRoot "..\..")
}
$entryPoint = Join-Path $scriptRoot "dist\index.js"

trap [System.Management.Automation.PipelineStoppedException] {
    Write-Host ""
    Write-Host "SATSET AutoFix stopped."
    exit 130
}

$banner = @"
================================
        SATSET AutoFix
            Sprint 2
================================
Project Root: $($resolvedRoot.Path)
Mode        : scan -> build -> autofix loop -> logger
Press Ctrl+C to stop.
"@

Write-Host $banner

if (-not (Test-Path $entryPoint)) {
    Write-Error "Entry point not found: $entryPoint"
    exit 1
}

Push-Location $scriptRoot
try {
    & node $entryPoint start --project-root $resolvedRoot.Path
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
