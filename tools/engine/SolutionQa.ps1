. "$PSScriptRoot/SolutionDefinition.ps1"
. "$PSScriptRoot/SolutionParser.ps1"
. "$PSScriptRoot/SolutionPlanner.ps1"
. "$PSScriptRoot/SolutionCompiler.ps1"
. "$PSScriptRoot/SolutionExecutor.ps1"

class GeneratorQa {
  [int]$ErrorCount
  [int]$WarningCount

  GeneratorQa() {
    $this.ErrorCount = 0
    $this.WarningCount = 0
  }

  [void] Assert([bool]$condition, [string]$message) {
    if (-not $condition) {
      $this.ErrorCount += 1
      throw $message
    }
  }
}

function Get-SolutionSample {
  return @"
solution Tourism

modules:
Identity
Dashboard
Master
Transaction
Report
Settings
"@
}

function Invoke-SolutionQa {
  $qa = [GeneratorQa]::new()
  $sample = Get-SolutionSample

  $parserStatus = "PASS"
  $compilerStatus = "PASS"
  $pipelineStatus = "PASS"

  try {
    $definition = Parse-SolutionText -Text $sample
    $qa.Assert($definition.Name -eq "Tourism", "Parser should read solution name Tourism.")
    $qa.Assert($definition.Modules.Count -eq 6, "Parser should read exactly 6 modules.")
    $qa.Assert($definition.Modules[0] -eq "Identity", "Parser should keep module order.")
  }
  catch {
    $parserStatus = "FAIL"
    $qa.ErrorCount += 1
  }

  try {
    $compiled = Invoke-SolutionCompiler -Text $sample
    $expectedOrder = @("Identity", "Dashboard", "Master", "Transaction", "Report", "Settings")
    $actualOrder = @($compiled.ExecutionPlan.OrderedModules)

    $qa.Assert($compiled.RegistryCount -ge 6, "Registry should contain mandatory components.")
    $qa.Assert($compiled.DependencyCount -eq 5, "Dependency chain should contain 5 links.")
    $qa.Assert(($actualOrder -join "|") -eq ($expectedOrder -join "|"), "Compiler should preserve dependency order.")
  }
  catch {
    $compilerStatus = "FAIL"
    $qa.ErrorCount += 1
  }

  try {
    $definition = Parse-SolutionText -Text $sample
    $plan = New-SolutionPlan -Definition $definition
    $display = $plan.ToDisplay()

    $qa.Assert($display.Contains("ExecutionPlan"), "Pipeline should generate ExecutionPlan header.")
    $qa.Assert($display.Contains("Identity"), "Pipeline should include first module.")
    $qa.Assert($display.Contains("Settings"), "Pipeline should include last module.")

    $execution = Invoke-SolutionExecutor -Text $sample
    $qa.Assert(-not $execution.Executed, "Executor must remain plan-only.")
    $qa.Assert($execution.Status -eq "planned-only", "Executor status should remain planned-only.")
  }
  catch {
    $pipelineStatus = "FAIL"
    $qa.ErrorCount += 1
  }

  $solutionStatus = if ($parserStatus -eq "PASS" -and $compilerStatus -eq "PASS" -and $pipelineStatus -eq "PASS" -and $qa.ErrorCount -eq 0) { "PASS" } else { "FAIL" }

  return [PSCustomObject]@{
    RegistryCount = (Invoke-SolutionCompiler -Text $sample).RegistryCount
    DependencyCount = (Invoke-SolutionCompiler -Text $sample).DependencyCount
    SolutionTest = $solutionStatus
    Compiler = $compilerStatus
    Pipeline = $pipelineStatus
    Error = $qa.ErrorCount
    Warning = $qa.WarningCount
  }
}

if ($MyInvocation.InvocationName -ne ".") {
  Invoke-SolutionQa | ConvertTo-Json -Depth 6
}
