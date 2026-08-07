# SATSET AutoFix Platform

## Build

```powershell
pnpm build
```

## CLI

```powershell
.\Start-AutoFix.ps1
node dist/index.js autofix
node dist/index.js doctor
node dist/index.js repair
node dist/index.js build
```

## Arsitektur

- `BuildRunner` menjalankan pipeline `pnpm`, `tsc`, `eslint`, `next build`, dan `prisma validate`.
- `ErrorParser` membentuk diagnostic object lintas sumber log.
- `RuleRegistry` menemukan rule plugin otomatis dari `src/rules`.
- `RuleEngine` memilih rule melalui manifest dan prioritas, tanpa rantai IF panjang di engine utama.
- `PatchEngine` menerapkan patch dengan `ts-morph`.
- `Doctor` dan `Repair` terintegrasi ke generator factory pipeline.
