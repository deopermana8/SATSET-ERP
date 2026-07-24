. 'h:\SATSET AI\POS WISATA\tools\engine\TestEngine.ps1'
$results = Invoke-SatsetTestSuite -ModuleName '__satset_test__'
$pass = 0
$fail = 0
foreach ($result in $results) {
  if ($result.Passed) { $pass++ } else { $fail++ }
  Write-Host ("[{0}] {1} ({2}s)" -f $(if ($result.Passed) { 'PASS' } else { 'FAIL' }), $result.Name, $result.Elapsed)
}
Write-Host "TOTAL:$($results.Count)"
Write-Host "PASS:$pass"
Write-Host "FAIL:$fail"
