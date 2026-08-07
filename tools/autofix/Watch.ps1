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
$startScript = Join-Path $scriptRoot "Start-AutoFix.ps1"
$state = [hashtable]::Synchronized(@{
    Pending = $false
    LastEventUtc = [datetime]::MinValue
    Running = $false
})
$extensions = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
[void]$extensions.Add('.ts')
[void]$extensions.Add('.tsx')
[void]$extensions.Add('.js')
[void]$extensions.Add('.mjs')
[void]$extensions.Add('.cjs')
$messageData = @{
    State = $state
    Extensions = $extensions
}

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $resolvedRoot.Path
$watcher.Filter = '*'
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, DirectoryName, LastWrite, CreationTime, Size'

$action = {
    $fullPath = $event.SourceEventArgs.FullPath
    $leafName = [System.IO.Path]::GetFileName($fullPath)
    $extension = [System.IO.Path]::GetExtension($fullPath)
    $normalizedPath = $fullPath.Replace('/', '\\')
    $isIgnored = $normalizedPath -match '\\tools\\autofix\\(dist|logs|\.backup|\.cache|node_modules)\\'
    $isWatched = -not $isIgnored -and ($leafName.Equals('schema.prisma', [System.StringComparison]::OrdinalIgnoreCase) -or $event.MessageData.Extensions.Contains($extension))

    if ($isWatched) {
        $event.MessageData.State.Pending = $true
        $event.MessageData.State.LastEventUtc = [datetime]::UtcNow
    }
}

$subscriptions = @(
    Register-ObjectEvent -InputObject $watcher -EventName Changed -MessageData $messageData -Action $action,
    Register-ObjectEvent -InputObject $watcher -EventName Created -MessageData $messageData -Action $action,
    Register-ObjectEvent -InputObject $watcher -EventName Deleted -MessageData $messageData -Action $action,
    Register-ObjectEvent -InputObject $watcher -EventName Renamed -MessageData $messageData -Action $action
)

$watcher.EnableRaisingEvents = $true
Write-Host "Watching $($resolvedRoot.Path)"

try {
    while ($true) {
        if ($state.Pending -and -not $state.Running) {
            $elapsed = [datetime]::UtcNow - $state.LastEventUtc
            if ($elapsed.TotalMilliseconds -ge 2000) {
                $state.Pending = $false
                $state.Running = $true

                if (Test-Path $startScript) {
                    & powershell -ExecutionPolicy Bypass -File $startScript -ProjectRoot $resolvedRoot.Path
                }
                else {
                    Write-Warning "Start script not found: $startScript"
                }

                $state.Running = $false
            }
        }

        $queuedEvent = Wait-Event -Timeout 1
        if ($null -ne $queuedEvent) {
            Remove-Event -EventIdentifier $queuedEvent.EventIdentifier -ErrorAction SilentlyContinue
        }
    }
}
finally {
    $watcher.EnableRaisingEvents = $false
    foreach ($subscription in $subscriptions) {
        Unregister-Event -SubscriptionId $subscription.Id -ErrorAction SilentlyContinue
    }
    $watcher.Dispose()
}
