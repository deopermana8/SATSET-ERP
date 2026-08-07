. "$PSScriptRoot/SolutionDefinition.ps1"

function Parse-SolutionText {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Text
  )

  $lines = @($Text -split "`r?`n")
  if ($lines.Count -eq 0) {
    throw "Solution text is empty."
  }

  $solutionName = ""
  $modules = @()
  $isModuleSection = $false

  foreach ($rawLine in $lines) {
    $line = if ($null -eq $rawLine) { "" } else { [string]$rawLine }
    $line = $line.Trim()
    if ($line.Length -eq 0) {
      continue
    }

    if ($line.ToLowerInvariant().StartsWith("solution ")) {
      $solutionName = $line.Substring(9).Trim()
      continue
    }

    if ($line.ToLowerInvariant() -eq "modules:") {
      $isModuleSection = $true
      continue
    }

    if ($isModuleSection) {
      $modules += $line
    }
  }

  if ([string]::IsNullOrWhiteSpace($solutionName)) {
    throw "Solution name is required. Use: solution <Name>."
  }

  if ($modules.Count -eq 0) {
    throw "At least one module is required under modules:."
  }

  return [SolutionDefinition]::new($solutionName, $modules)
}

function Parse-SolutionFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Solution file not found: $Path"
  }

  $content = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  return Parse-SolutionText -Text $content
}
