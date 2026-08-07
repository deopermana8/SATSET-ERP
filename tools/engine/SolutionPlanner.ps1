. "$PSScriptRoot/SolutionDefinition.ps1"

function New-SolutionPlan {
  param(
    [Parameter(Mandatory = $true)]
    [SolutionDefinition]$Definition
  )

  $blueprintCompiler = [BlueprintCompiler]::new()
  $manifestCompiler = [ManifestCompiler]::new()
  $dependencyResolver = [DependencyResolver]::new()
  $executionPipeline = [ExecutionPipeline]::new()

  $modules = $blueprintCompiler.Compile($Definition)
  $manifest = $manifestCompiler.Compile($Definition)
  $orderedModules = $dependencyResolver.Resolve($modules, $manifest)

  return $executionPipeline.Build($orderedModules)
}
