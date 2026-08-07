Set-StrictMode -Version Latest

class SolutionDefinition {
  [string]$Name
  [string[]]$Modules

  SolutionDefinition([string]$name, [string[]]$modules) {
    $this.Name = $name
    $this.Modules = @($modules)
  }
}

class ExecutionPlan {
  [string[]]$OrderedModules

  ExecutionPlan([string[]]$orderedModules) {
    $this.OrderedModules = @($orderedModules)
  }

  [string] ToDisplay() {
    if (-not $this.OrderedModules -or $this.OrderedModules.Count -eq 0) {
      return "ExecutionPlan"
    }

    $lines = @("ExecutionPlan", "")
    $arrow = [char]0x2193

    for ($i = 0; $i -lt $this.OrderedModules.Count; $i++) {
      $lines += $this.OrderedModules[$i]
      if ($i -lt ($this.OrderedModules.Count - 1)) {
        $lines += [string]$arrow
      }
    }

    return ($lines -join [Environment]::NewLine)
  }
}

class GeneratorRegistry {
  [hashtable]$Entries

  GeneratorRegistry() {
    $this.Entries = @{}
  }

  [void] Register([string]$name, [object]$component) {
    if ([string]::IsNullOrWhiteSpace($name)) {
      throw "Registry name is required."
    }

    $this.Entries[$name] = $component
  }

  [object] Get([string]$name) {
    return $this.Entries[$name]
  }

  [int] Count() {
    return $this.Entries.Count
  }
}

class BlueprintCompiler {
  [string[]] Compile([SolutionDefinition]$definition) {
    if ($null -eq $definition) {
      throw "SolutionDefinition is required."
    }

    $result = @()
    $seen = @{}

    foreach ($module in $definition.Modules) {
      $trimmed = if ($null -eq $module) { "" } else { [string]$module }
      $trimmed = $trimmed.Trim()
      if ($trimmed.Length -eq 0) {
        continue
      }

      if (-not $seen.ContainsKey($trimmed)) {
        $seen[$trimmed] = $true
        $result += $trimmed
      }
    }

    return $result
  }
}

class ManifestCompiler {
  [hashtable] Compile([SolutionDefinition]$definition) {
    if ($null -eq $definition) {
      throw "SolutionDefinition is required."
    }

    $manifest = @{}
    $modules = @($definition.Modules)

    for ($i = 0; $i -lt $modules.Count; $i++) {
      $moduleName = if ($null -eq $modules[$i]) { "" } else { [string]$modules[$i] }
      $moduleName = $moduleName.Trim()
      if ($moduleName.Length -eq 0) {
        continue
      }

      if ($i -eq 0) {
        $manifest[$moduleName] = @()
        continue
      }

      $dependsOn = if ($null -eq $modules[$i - 1]) { "" } else { [string]$modules[$i - 1] }
      $dependsOn = $dependsOn.Trim()
      if ($dependsOn.Length -eq 0) {
        $manifest[$moduleName] = @()
      }
      else {
        $manifest[$moduleName] = @($dependsOn)
      }
    }

    return $manifest
  }
}

class DependencyResolver {
  [string[]] Resolve([string[]]$modules, [hashtable]$manifest) {
    $ordered = New-Object System.Collections.Generic.List[string]
    $visited = @{}
    $visiting = @{}

    foreach ($module in $modules) {
      $name = if ($null -eq $module) { "" } else { [string]$module }
      $name = $name.Trim()
      if ($name.Length -eq 0) {
        continue
      }

      $this.Visit($name, $manifest, $visited, $visiting, $ordered)
    }

    return $ordered.ToArray()
  }

  hidden [void] Visit(
    [string]$module,
    [hashtable]$manifest,
    [hashtable]$visited,
    [hashtable]$visiting,
    [System.Collections.Generic.List[string]]$ordered
  ) {
    if ($visited.ContainsKey($module)) {
      return
    }

    if ($visiting.ContainsKey($module)) {
      throw "Cyclic dependency detected: $module"
    }

    $visiting[$module] = $true
    $dependencies = @()
    if ($manifest.ContainsKey($module)) {
      $dependencies = @($manifest[$module])
    }

    foreach ($dependency in $dependencies) {
      $dependencyName = if ($null -eq $dependency) { "" } else { [string]$dependency }
      $dependencyName = $dependencyName.Trim()
      if ($dependencyName.Length -eq 0) {
        continue
      }

      $this.Visit($dependencyName, $manifest, $visited, $visiting, $ordered)
    }

    [void]$visiting.Remove($module)
    $visited[$module] = $true

    if (-not $ordered.Contains($module)) {
      [void]$ordered.Add($module)
    }
  }
}

class ExecutionPipeline {
  [ExecutionPlan] Build([string[]]$orderedModules) {
    return [ExecutionPlan]::new($orderedModules)
  }
}

class GeneratorCompiler {
  [BlueprintCompiler]$BlueprintCompiler
  [ManifestCompiler]$ManifestCompiler
  [DependencyResolver]$DependencyResolver
  [ExecutionPipeline]$ExecutionPipeline

  GeneratorCompiler() {
    $this.BlueprintCompiler = [BlueprintCompiler]::new()
    $this.ManifestCompiler = [ManifestCompiler]::new()
    $this.DependencyResolver = [DependencyResolver]::new()
    $this.ExecutionPipeline = [ExecutionPipeline]::new()
  }

  [ExecutionPlan] Compile([SolutionDefinition]$definition) {
    $modules = $this.BlueprintCompiler.Compile($definition)
    $manifest = $this.ManifestCompiler.Compile($definition)
    $orderedModules = $this.DependencyResolver.Resolve($modules, $manifest)
    return $this.ExecutionPipeline.Build($orderedModules)
  }
}
