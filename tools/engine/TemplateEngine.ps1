function Get-SatsetTemplate {

    param(
        [Parameter(Mandatory)]
        [string]$Template
    )

    $Root = Resolve-Path "$PSScriptRoot\.."
    $TemplateFile = Join-Path $Root "templates\$Template"

    if (!(Test-Path $TemplateFile)) {
        throw "Template tidak ditemukan: $Template"
    }

    $TemplateContent = Get-Content $TemplateFile -Raw
    if ([string]::IsNullOrWhiteSpace($TemplateContent)) {
        throw "Template kosong: $Template"
    }

    return $TemplateContent

}
