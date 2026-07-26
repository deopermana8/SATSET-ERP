param(
    [string]$Message
)

$LogDir = ".\satset\logs"
New-Item -ItemType Directory -Force $LogDir | Out-Null

$LogFile = Join-Path $LogDir ("SATSET-" + (Get-Date -Format "yyyyMMdd") + ".log")

$Time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$Text = "[$Time] $Message"

Add-Content $LogFile $Text
Write-Host $Text -ForegroundColor DarkGray
