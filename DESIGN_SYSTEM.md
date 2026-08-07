# SATSET Design System

## Ringkasan
SATSET Design System adalah fondasi UI frontend admin ERP yang berfokus pada:
- konsistensi visual
- komponen reusable
- token terpusat
- layout engine seragam

Lokasi utama: `apps/admin/src/design-system/`

## Struktur
- `tokens/` token desain global (color, spacing, radius, shadow, typography, animation, z-index, breakpoints, theme)
- `components/` primitive dan reusable UI components
- `layouts/` AppShell dan engine layout halaman
- `icons/` icon set konsisten
- `hooks/` helper state/performance berbasis frontend
- `utils/` utility render, a11y, class, lazy render, virtual table
- `styles/` generator CSS global design system

## Tokens
File token:
- `apps/admin/src/design-system/tokens/colors.ts`
- `apps/admin/src/design-system/tokens/spacing.ts`
- `apps/admin/src/design-system/tokens/radius.ts`
- `apps/admin/src/design-system/tokens/shadow.ts`
- `apps/admin/src/design-system/tokens/typography.ts`
- `apps/admin/src/design-system/tokens/animation.ts`
- `apps/admin/src/design-system/tokens/zindex.ts`
- `apps/admin/src/design-system/tokens/breakpoints.ts`
- `apps/admin/src/design-system/tokens/theme.ts`

Palette utama:
- Primary `#F59E0B`
- Primary Hover `#D97706`
- Dark Background `#0F172A`
- Surface `#111827`
- Card `#1F2937`
- Border `#374151`
- Text Primary `#F9FAFB`
- Text Secondary `#94A3B8`
- Success `#10B981`
- Danger `#EF4444`
- Warning `#FBBF24`
- Info `#3B82F6`

## Komponen
Semua komponen reusable diekspor dari:
- `apps/admin/src/design-system/components/index.ts`

Komponen mencakup:
- Button, IconButton, Card, GlassCard
- Input, Textarea, Select, Checkbox, Radio, Switch
- Badge, Chip, Avatar, Tooltip, Dropdown
- Dialog, Drawer, Modal, Toast
- Tabs, Accordion, Stepper, Breadcrumb
- Sidebar, Topbar, CommandPalette, SearchBox
- Calendar, DatePicker
- Table, DataTable, Pagination
- DataGrid, Progress
- Alert, Popover, Toggle
- StatCard, MetricCard, Timeline, ActivityFeed, Notification
- Skeleton, Spinner, EmptyState, ErrorState, LoadingOverlay

### State Support
Setiap komponen inti mendukung state visual berikut:
- light mode
- dark mode
- disabled
- hover
- focus
- loading
- error
- success

State class yang dapat dipakai:
- `.is-loading`
- `.is-error`
- `.is-success`

Semua komponen juga mendukung `attrs` untuk injeksi atribut ARIA dan keyboard hooks.

## Layout Engine
Layout utama diekspor dari:
- `apps/admin/src/design-system/layouts/index.ts`

Blok layout:
- AppShell
- Sidebar
- Topbar
- PageHeader
- PageContent
- WidgetGrid
- Footer

## Theme & Visual
- Mendukung dark mode/light mode via semantic CSS variables
- Glass effect, soft shadow, radius besar (hingga 24px)
- Typografi: Manrope, IBM Plex Sans, Inter

## Accessibility
- Focus ring konsisten via utility class
- ARIA-ready wrapper untuk area kritikal
- Keyboard shortcut untuk command palette
- Focus-visible dan state navigasi keyboard untuk kontrol form/action

## Performance
- `requestIdleRender` untuk lazy render non-kritis
- `createVirtualSlice` untuk virtual table data besar
- `memoizeValue` helper memoization ringan
- `requestAnimationFrame` untuk render chart dashboard
- Debounced autosave untuk form input

## Cara Penggunaan
Contoh inject CSS design system di app shell server-rendered:

```ts
import { designSystemCss } from "./design-system/styles/designSystemCss.js";
import { buildThemeCssVariables } from "./design-system/tokens/theme.js";

const css = `
<style>
${designSystemCss()}
:root{${buildThemeCssVariables(false)}}
html.dark{${buildThemeCssVariables(true)}}
</style>`;
```

Contoh komponen reusable:

```ts
import { Button, Card } from "./design-system/components/index.js";

const html = Card({
  children: Button({ label: "Simpan" }),
});
```

## Aturan
- Hindari style hardcode berulang
- Reuse token dan komponen
- Prioritaskan kelas utilitas design-system dibanding inline style
- Jangan mengubah backend/API/business logic/routing untuk kebutuhan visual
