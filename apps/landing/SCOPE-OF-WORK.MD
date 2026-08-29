# Scope of Work

## 1. Tujuan

Dokumen ini menjadi pedoman bagi AI dalam mengembangkan dan memodifikasi aplikasi agar struktur kode tetap terorganisir, modular, mudah dipelihara, dan mengikuti best practice component-based development.

AI **WAJIB mengikuti aturan struktur dan pengelolaan kode di bawah ini sebelum membuat atau mengubah kode.**

---

## 2. Struktur Project

Project **tidak menggunakan folder \*\***`src/`\*\*.

Struktur utama berada langsung di root project:

```text
/
├── app/
├── components/
│   └── NamaHalaman/
│       ├── layout/
│       │   ├── ComponentBesar.tsx
│       │   └── ComponentBesarLainnya.tsx
│       │
│       └── ui/
│           ├── ComponentKecil.tsx
│           └── ComponentKecilLainnya.tsx
│
├── types/
│   └── namatypes.ts
│
├── public/
└── ...
```

**Jangan membuat folder \*\***`src/`\***\* jika sebelumnya memang tidak ada.**

AI harus mengikuti struktur project yang sudah ada dan tidak mengubah root architecture tanpa kebutuhan yang jelas.

---

## 3. Component Architecture

Gunakan pendekatan **component-based architecture**.

Jangan menaruh seluruh UI, logic, dan struktur halaman di dalam satu file page yang besar.

Component harus dipisahkan berdasarkan:

- Tanggung jawab
- Kompleksitas
- Struktur UI
- Logic yang dimiliki
- Reusability

### 3.1 Component Besar

Component yang memiliki struktur UI kompleks atau merepresentasikan section utama halaman harus berada di:

```text
/components/NamaHalaman/layout/
```

Contoh:

```text
/components/dashboard/layout/DashboardHeader.tsx
/components/dashboard/layout/StatisticsSection.tsx
/components/dashboard/layout/RecentActivity.tsx
```

Component pada `layout/` dapat menggunakan component dari folder `ui/`.

### 3.2 Component Kecil

Component yang menangani bagian kecil dari UI harus berada di:

```text
/components/NamaHalaman/ui/
```

Contoh:

```text
/components/dashboard/ui/StatCard.tsx
/components/dashboard/ui/StatusBadge.tsx
/components/dashboard/ui/FilterButton.tsx
```

Pemisahan component harus berdasarkan **tanggung jawab dan kompleksitas**, bukan sekadar memecah semua JSX menjadi file kecil.

---

## 4. Page Structure

File page hanya bertugas sebagai **composition layer**.

Page harus bertanggung jawab untuk menyusun component, bukan menampung seluruh implementasi UI halaman.

Contoh:

```tsx
export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <StatisticsSection />
      <RecentActivity />
    </>
  );
}
```

Jangan membuat page seperti:

```text
page.tsx
├── seluruh JSX halaman
├── semua card
├── semua table
├── semua modal
├── semua filter
└── seluruh logic
```

Jika sebuah page mulai terlalu besar atau memiliki beberapa section yang memiliki tanggung jawab berbeda, **pecah menjadi component.**

---

## 5. Global CSS

### DILARANG membuat class sembarangan di `global.css`.

AI **tidak boleh menambahkan custom CSS class ke \*\***`global.css`\***\* hanya untuk kebutuhan satu halaman atau satu component.**

Contoh yang harus dihindari:

```css
.dashboard-card {
  ...
}

.custom-header {
  ...
}

.special-button {
  ...
}
```

Jika styling hanya digunakan oleh component tertentu, gunakan **Tailwind CSS** atau styling lokal pada component tersebut.

### Prioritas Styling

Gunakan urutan berikut:

1. Tailwind utility classes
2. Existing component / design system
3. Component variants
4. CSS Module atau styling lokal jika benar-benar diperlukan
5. `global.css` hanya untuk kebutuhan global

### `global.css` hanya untuk:

- CSS reset
- CSS variables
- Theme
- Base typography
- Global background
- Global element styling
- Utility yang memang digunakan secara global

**Jangan menambahkan class ke \*\***`global.css`\***\* hanya karena styling tersebut lebih mudah ditulis menggunakan CSS biasa.**

Sebelum menambahkan sesuatu ke `global.css`, AI harus memastikan bahwa styling tersebut benar-benar bersifat global dan digunakan oleh lebih dari satu bagian aplikasi.

---

## 6. Types

Semua type/interface yang berkaitan dengan halaman atau domain harus disimpan di:

```text
/types/
```

Format:

```text
/types/namatypes.ts
```

Contoh:

```text
/types/dashboardtypes.ts
/types/patienttypes.ts
/types/monitoringtypes.ts
```

Contoh:

```ts
// types/dashboardtypes.ts

export interface DashboardSummary {
  totalPatients: number;
  totalMeals: number;
  completedMeals: number;
}
```

Kemudian digunakan:

```ts
import type { DashboardSummary } from '@/types/dashboardtypes';
```

### Rules

- Jangan menggunakan `any` jika type yang sesuai dapat dibuat.
- Jangan menduplikasi type yang sama di beberapa component.
- Jika type digunakan oleh beberapa component, simpan di `/types`.
- Type yang spesifik untuk suatu halaman/domain mengikuti nama halaman/domain tersebut.
- Jangan membuat folder `types` di dalam `/components` jika type tersebut seharusnya berada di root `/types`.
- Jangan membuat type baru jika type yang sama sudah tersedia.
- Sebelum membuat type baru, AI wajib memeriksa `/types/` terlebih dahulu.

---

## 7. Reusable Components

Sebelum membuat component baru, AI **WAJIB memeriksa component yang sudah tersedia.**

Prioritaskan:

```text
Existing Component
        ↓
Existing Utility
        ↓
Existing Design System
        ↓
Create UI Component
        ↓
Create Layout Component
```

Jangan membuat component baru jika component existing masih dapat digunakan atau dikembangkan dengan aman.

Jika component digunakan oleh banyak halaman dan memang bersifat global, component dapat ditempatkan di:

```text
/components/
```

Jika component hanya digunakan oleh satu halaman, letakkan di:

```text
/components/NamaHalaman/
```

Component yang hanya digunakan pada satu halaman **tidak perlu dipaksakan menjadi global component.**

---

## 8. Modifikasi Existing Code

Ketika memodifikasi existing code:

- Jangan melakukan refactor besar tanpa kebutuhan.
- Jangan mengubah business logic yang tidak berkaitan dengan task.
- Jangan membuat duplicate component.
- Jangan membuat duplicate type.
- Jangan menambahkan CSS global untuk kebutuhan lokal.
- Gunakan component existing jika tersedia.
- Pertahankan struktur yang sudah baik.
- Jangan membuat folder atau architecture baru tanpa alasan yang jelas.
- Jangan membuat `src/` karena project ini tidak menggunakan `src/`.
- Jangan memindahkan file existing tanpa alasan teknis yang jelas.
- Jangan mengubah naming convention existing tanpa kebutuhan.
- Jangan melakukan perubahan di luar scope task.

---

## 9. Component Splitting Rules

AI harus memecah component jika:

- File menjadi terlalu panjang.
- Sebuah section memiliki tanggung jawab yang jelas.
- Sebuah bagian UI memiliki logic sendiri.
- Sebuah component memiliki terlalu banyak conditional rendering.
- Sebuah bagian UI berpotensi digunakan kembali.
- Pemisahan membuat kode lebih mudah dibaca dan dipelihara.
- Sebuah component menangani beberapa tanggung jawab yang berbeda.

Namun, **jangan melakukan over-componentization.**

Tidak perlu membuat component terpisah untuk JSX sederhana seperti:

```tsx
<div className='flex items-center gap-2'>
  <span>{name}</span>
</div>
```

jika tidak memiliki alasan untuk reusable atau memiliki logic tersendiri.

### Prinsip Splitting

Jangan menentukan component berdasarkan jumlah baris saja.

Contoh:

```text
50 lines dengan satu tanggung jawab
→ Tidak harus dipecah.

30 lines dengan 3 tanggung jawab berbeda
→ Pertimbangkan untuk dipecah.
```

Tujuan utama component splitting adalah **separation of concerns**, bukan sekadar mengurangi jumlah baris dalam sebuah file.

---

## 10. Folder Naming

Gunakan struktur berikut:

```text
/components/
└── NamaHalaman/
    ├── layout/
    │   ├── ComponentBesar.tsx
    │   └── ComponentBesarLainnya.tsx
    │
    └── ui/
        ├── ComponentKecil.tsx
        └── ComponentKecilLainnya.tsx

/types/
└── namatypes.ts
```

Gunakan **PascalCase** untuk nama React component.

Contoh:

```text
DashboardHeader.tsx
PatientTable.tsx
MealStatusCard.tsx
```

Gunakan nama file type sesuai domain:

dashboardtypes.ts
patienttypes.ts
monitoringtypes.ts

Jangan membuat nama component yang terlalu generic jika component tersebut sebenarnya spesifik terhadap suatu halaman.

---

## 11. Rules untuk AI

Sebelum membuat atau mengubah kode, AI harus:

1. Memahami struktur project existing.
2. Mengecek component yang sudah tersedia.
3. Mengecek type yang sudah tersedia.
4. Menggunakan component existing jika memungkinkan.
5. Memecah UI berdasarkan tanggung jawab.
6. Menempatkan component besar di `/components/NamaHalaman/layout/`.
7. Menempatkan component kecil di `/components/NamaHalaman/ui/`.
8. Menyimpan type di `/types/namatypes.ts`.
9. Menghindari custom class di `global.css`.
10. Menggunakan Tailwind untuk styling lokal jika memungkinkan.
11. Tidak membuat `src/`.
12. Tidak melakukan perubahan di luar scope task.
13. Tidak membuat duplicate component.
14. Tidak membuat duplicate type.
15. Tidak melakukan over-componentization.
16. Tidak melakukan over-engineering.
17. Mempertahankan architecture dan behavior existing yang tidak berkaitan dengan task.

---

## 12. Definition of Done

Task dianggap selesai jika:

- Struktur component mengikuti aturan pada dokumen ini.
- Component besar berada di `layout/`.
- Component kecil berada di `ui/`.
- Page berfungsi sebagai composition layer.
- Type berada di `/types/`.
- Tidak ada duplicate component.
- Tidak ada duplicate type.
- Tidak ada custom class yang tidak diperlukan di `global.css`.
- Styling lokal menggunakan Tailwind jika memungkinkan.
- Tidak ada folder `src/` yang dibuat.
- Existing functionality tetap berjalan.
- Tidak ada perubahan di luar scope task.
- Code tetap mudah dibaca dan dipelihara.

---

## 13. Prinsip Utama

> **Keep the page clean, keep components modular, keep types centralized, and keep global CSS truly global.**

AI harus mengutamakan struktur kode yang **clean, modular, maintainable, consistent, dan reusable**, tanpa melakukan over-engineering.

**Jika terdapat konflik antara membuat implementasi lebih cepat dengan mengikuti struktur ini, struktur dan aturan pada Scope of Work ini harus diprioritaskan.**
