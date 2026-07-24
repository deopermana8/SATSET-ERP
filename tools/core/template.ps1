function Get-SatsetTemplate($Name){
    Join-Path "$PSScriptRoot\..\templates-tsx" $Name
}
