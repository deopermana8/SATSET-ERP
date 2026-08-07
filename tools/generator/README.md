# SATSET AI Software Factory

## Build

```powershell
pnpm build
```

## CLI

```powershell
node dist/index.js create "ERP Wisata"
node dist/index.js architect "Hotel"
node dist/index.js compose Finance
node dist/index.js generate module Finance
node dist/index.js workflow Finance
node dist/index.js doctor
node dist/index.js repair
node dist/index.js build
node dist/index.js deploy
```

## Arsitektur

- `ArchitectEngine` mengubah requirement bisnis menjadi blueprint tunggal.
- `BlueprintEngine` menjadikan blueprint YAML sebagai satu-satunya sumber kebenaran.
- `KnowledgeRegistry` mendaftarkan capability seluruh plugin.
- `Orchestrator` memilih plugin otomatis, menyusun pipeline, menjalankan generator, lalu memanggil autofix, doctor, repair, dan build bridge.
- `WorkflowEngine`, `DatabaseDesigner`, `UIDesigner`, `ApiDesigner`, `BusinessRuleEngine`, `RefactorEngine`, dan `ProjectAnalyzer` berjalan melalui plugin capability.
- `DomainPackRegistry` menyediakan blueprint reusable untuk ERP, CRM, POS, Hotel, Wisata, Restoran, Parkir, Inventory, Purchasing, Finance, HR, Analytics, dan Report.

## Struktur

- `src/core` berisi engine reusable.
- `src/plugins` berisi plugin generator dan engine plugin.
- `templates` berisi template reusable.
- `blueprints` berisi blueprint dasar dan domain pack reusable.
- `output` menjadi target artefak generator.
