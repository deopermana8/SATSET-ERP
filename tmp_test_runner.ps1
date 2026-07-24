. 'h:\SATSET AI\POS WISATA\tools\engine\TestEngine.ps1'
$x = Invoke-SatsetTestGenerator -GeneratorName 'module' -ModuleName '__satset_test__' -RootPath 'h:\SATSET AI\POS WISATA'
$x | Format-List
