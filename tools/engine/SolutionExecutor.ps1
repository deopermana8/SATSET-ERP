. "$PSScriptRoot/SolutionCompiler.ps1"

function Invoke-SolutionExecutor {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Text
  )

  $compiled = Invoke-SolutionCompiler -Text $Text

  return [PSCustomObject]@{
    Name = $compiled.Definition.Name
    ExecutionPlan = $compiled.ExecutionPlan
    RegistryCount = $compiled.RegistryCount
    DependencyCount = $compiled.DependencyCount
    Executed = $false
    Status = "planned-only"
  }
}
