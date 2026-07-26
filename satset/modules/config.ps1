$Config = Get-Content ".\satset\config.json" | ConvertFrom-Json
return $Config
