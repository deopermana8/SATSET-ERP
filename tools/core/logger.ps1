function Write-Info($t){
 Write-Host "[INFO] $t" -ForegroundColor Cyan
}

function Write-Ok($t){
 Write-Host "[ OK ] $t" -ForegroundColor Green
}

function Write-ErrorSatset($t){
 Write-Host "[FAIL] $t" -ForegroundColor Red
}
