$modules = @('visitor','destination','category','facility','ticket','reservation','payment')
foreach ($m in $modules) {
    Write-Host "==> $m"
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make module $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make crud $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make entity $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make column $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make relation $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make validation $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make form $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make sql $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make migration $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make seeder $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make permission $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make menu $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make sidebar $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make route $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make api $m
    & 'h:\SATSET AI\POS WISATA\satset.ps1' make openapi $m
}
