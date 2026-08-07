. "$PSScriptRoot/SolutionDefinition.ps1"
. "$PSScriptRoot/SolutionParser.ps1"
. "$PSScriptRoot/SolutionPlanner.ps1"

function Get-SolutionDependencyCount {
  param(
    [Parameter(Mandatory = $true)]
    [hashtable]$Manifest
  )

  $count = 0
  foreach ($module in $Manifest.Keys) {
    $count += @($Manifest[$module]).Count
  }

  return $count
}

function Invoke-SolutionCompiler {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Text
  )

  $registry = [GeneratorRegistry]::new()
  $registry.Register("SolutionParser", (Get-Command Parse-SolutionText))
  $registry.Register("GeneratorCompiler", [GeneratorCompiler]::new())
  $registry.Register("ExecutionPipeline", [ExecutionPipeline]::new())
  $registry.Register("DependencyResolver", [DependencyResolver]::new())
  $registry.Register("BlueprintCompiler", [BlueprintCompiler]::new())
  $registry.Register("ManifestCompiler", [ManifestCompiler]::new())

  $definition = Parse-SolutionText -Text $Text
  $generatorCompiler = [GeneratorCompiler]$registry.Get("GeneratorCompiler")
  $plan = $generatorCompiler.Compile($definition)
  $manifest = ([ManifestCompiler]$registry.Get("ManifestCompiler")).Compile($definition)

  return [PSCustomObject]@{
    Definition = $definition
    ExecutionPlan = $plan
    Registry = $registry
    RegistryCount = $registry.Count()
    DependencyCount = Get-SolutionDependencyCount -Manifest $manifest
  }
}
