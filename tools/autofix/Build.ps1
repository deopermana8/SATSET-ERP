$scriptRoot = Split-Path -Parent $PSCommandPath
$projectRoot = Resolve-Path (Join-Path $scriptRoot "..\..")
$entryPoint = Join-Path $scriptRoot "dist\index.js"

if (-not (Test-Path $entryPoint)) {
    Write-Error "Entry point not found: $entryPoint"
    exit 1
}

Push-Location $scriptRoot
try {
    & node $entryPoint build --project-root $projectRoot.Path
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
