function Write-File($Path,$Content){

$Dir=Split-Path $Path

if(!(Test-Path $Dir)){
 New-Item $Dir -ItemType Directory -Force|Out-Null
}

$Content|Set-Content $Path -Encoding UTF8

}
