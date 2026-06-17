import { create }  from 'zustand'
import { persist } from 'zustand/middleware'

// ── Row factories (no date/completed — those are runtime fields) ──────────────
const mkG = (no, module, tujuan, mentorName = '', mentorPosition = '') => ({
  id: Math.random(), no, module, tujuan, mentorName, mentorPosition,
})
const mkT = (no, module, tujuan, category = 'all_level', mentorName = '', mentorPosition = '') => ({
  id: Math.random(), no, module, tujuan, category, mentorName, mentorPosition,
})

// ── Seed templates ────────────────────────────────────────────────────────────
const SEED = [
  {
    id: 1,
    name: 'Template Induksi Umum – All Staff',
    description: 'Template standar induksi untuk semua karyawan baru (Manager, Officer, Staff), mencakup materi general dan teknis.',
    active: true,
    generalItems: [
      mkG('-',  'Kelengkapan Administrasi dan Pengantar', 'Melengkapi Administrasi'),
      mkG('1',  'Company Profile', 'Mengenal Perusahaan: Visi, Misi, Sejarah Perusahaan, Product & Principal', 'Tito', 'HRD'),
      mkG('2',  'Peraturan Perusahaan & Kode Etik', 'Mengenal Peraturan Perusahaan dan memahami kode etik', 'Regional/Tito', 'HRD'),
      mkG('3',  'Keunggulan Bersaing', 'Mengetahui Keunggulan Bersaing dan Implementasinya', 'Self Learning', ''),
      mkG('4',  'Culture Perusahaan', 'Memahami Budaya Perusahaan', 'Michael', 'HRD'),
      mkG('5',  'Pemahaman Good Documentation Practices (GDP) dan Data Integritas',
          'Memahami dan menerapkan Good Documentation Practices (GDP) dan Data Integrity untuk menjamin keakuratan, kesetiaan, dan keluluran data sesuai ketentuan regulasi', 'Ferlino', 'SQM'),
      mkG('6',  'Overview Departemen dan Struktur', 'Mengetahui Departemen yang ada: Peran, Fungsi, dan Struktur', 'Cishi', 'HRD'),
      mkG('7',  'Pemahaman CDOB dan CDAKB secara umum', 'Memenuhi standar pendistribusian obat dan alkes yang baik sesuai persyaratan pemerintah', 'Self Learning', ''),
      mkG('8',  'Pemahaman Terkait Sistem Jaminan Halal', 'Memenuhi standar kebijakan halal sesuai persyaratan LPPOM MUI', 'Self Learning', ''),
      mkG('9',  'Pengelolaan NAPZA dan OOT di distribusi farmasi', 'Memahami pengelolaan NAPZA dan Obat-obat tertentu di distribusi farmasi', 'Self Learning', ''),
      mkG('10', 'Pharmacovigilance', 'Memahami peran yang perlu dilakukan terhadap isu keamanan produk yang didistribusikan', 'Self Learning', ''),
      mkG('11', 'Pengenalan Industri Farmasi', 'Mengenal Industri Farmasi & Distribusi', 'Self Learning', ''),
      mkG('12', 'Bisnis Proses Cabang', 'Mengenal Bisnis: Order Kirim Tagih', 'Cishi', 'HRD'),
      mkG('13', 'Tes Induksi', 'Memastikan Peserta sudah memahami Materi Induksi yang diberikan', 'Tito', 'HRD'),
    ],
    technicalItems: [
      mkT('1', 'Jobdesc: Sudah membaca dan memahami', 'Mendapat gambaran terkait job yang dilakukan, sistem penilaian dan karir', 'all_level'),
      mkT('2', 'Pengukuran Produktivitas', 'Mendapat gambaran pengukuran produktivitas dalam organisasi', 'all_level'),
      mkT('3', 'Incentive', 'Mendapat pengetahuan tentang perhitungan insentif', 'all_level'),
      mkT('4', 'Technical Knowledge [Sesuai Posisi]', 'Mengetahui technical knowledge yang terkait dengan kegiatan operational', 'all_level'),
      mkT('5', 'SOP/WI terkait pekerjaan', 'Memahami prosedur kerja menjadi tanggung jawab dan tim', 'all_level'),
      mkT('6', 'Inbound, Storage, Outbound', 'Mengetahui gambaran umum proses inbound, storage, outbound', 'all_level'),
      mkT('7', 'Materi & Online Test (IWT)', 'Mengetahui teknis pelaksanaan In Warehouse Training dan membaca SOP/WI di dalamnya', 'all_level'),
      mkT('-', 'Coaching & Counseling', 'Memahami peran leader di dalam memberikan coaching & counseling', 'manager_level'),
      mkT('-', 'Balanced Scorecard', 'Memahami konsep dan fungsi dari Balanced Scorecard', 'manager_level'),
      mkT('-', 'Review atasan', 'Mengevaluasi proses pembelajaran selama induksi, termasuk on-the-job training dan arahan kerja', 'review'),
    ],
    createdAt: '2026-01-01T00:00:00+07:00',
  },
  {
    id: 2,
    name: 'Template Induksi General – Staff Non-Teknis',
    description: 'Template materi induksi general saja, cocok untuk karyawan non-operasional dan support function.',
    active: true,
    generalItems: [
      mkG('-',  'Kelengkapan Administrasi dan Pengantar', 'Melengkapi Administrasi'),
      mkG('1',  'Company Profile', 'Mengenal Perusahaan: Visi, Misi, Sejarah Perusahaan, Product & Principal', 'Tito', 'HRD'),
      mkG('2',  'Peraturan Perusahaan & Kode Etik', 'Mengenal Peraturan Perusahaan dan memahami kode etik', 'Regional/Tito', 'HRD'),
      mkG('3',  'Keunggulan Bersaing', 'Mengetahui Keunggulan Bersaing dan Implementasinya', 'Self Learning', ''),
      mkG('4',  'Culture Perusahaan', 'Memahami Budaya Perusahaan', 'Michael', 'HRD'),
      mkG('5',  'Overview Departemen dan Struktur', 'Mengetahui Departemen yang ada: Peran, Fungsi, dan Struktur', 'Cishi', 'HRD'),
      mkG('6',  'Pengenalan Industri Farmasi', 'Mengenal Industri Farmasi & Distribusi', 'Self Learning', ''),
      mkG('7',  'Tes Induksi', 'Memastikan Peserta sudah memahami Materi Induksi yang diberikan', 'Tito', 'HRD'),
    ],
    technicalItems: [],
    createdAt: '2026-01-15T00:00:00+07:00',
  },
  {
    id: 3,
    name: 'Template Induksi Teknis – Warehouse & Logistik',
    description: 'Template materi teknis untuk karyawan operasional warehouse, distribusi, dan logistik.',
    active: true,
    generalItems: [
      mkG('-',  'Kelengkapan Administrasi dan Pengantar', 'Melengkapi Administrasi'),
      mkG('1',  'Company Profile', 'Mengenal Perusahaan: Visi, Misi, Sejarah Perusahaan, Product & Principal', 'Tito', 'HRD'),
      mkG('2',  'Peraturan Perusahaan & Kode Etik', 'Mengenal Peraturan Perusahaan dan memahami kode etik', 'Regional/Tito', 'HRD'),
      mkG('3',  'Bisnis Proses Cabang', 'Mengenal Bisnis: Order Kirim Tagih', 'Cishi', 'HRD'),
      mkG('4',  'Tes Induksi', 'Memastikan Peserta sudah memahami Materi Induksi yang diberikan', 'Tito', 'HRD'),
    ],
    technicalItems: [
      mkT('1', 'Jobdesc: Sudah membaca dan memahami', 'Mendapat gambaran terkait job yang dilakukan, sistem penilaian dan karir', 'all_level'),
      mkT('2', 'Pengukuran Produktivitas', 'Mendapat gambaran pengukuran produktivitas dalam organisasi', 'all_level'),
      mkT('3', 'SOP/WI terkait pekerjaan', 'Memahami prosedur kerja menjadi tanggung jawab dan tim', 'all_level'),
      mkT('4', 'Inbound, Storage, Outbound', 'Mengetahui gambaran umum proses inbound, storage, outbound', 'all_level'),
      mkT('5', 'Materi & Online Test (IWT)', 'Mengetahui teknis pelaksanaan In Warehouse Training dan membaca SOP/WI di dalamnya', 'all_level'),
      mkT('-', 'Review atasan', 'Mengevaluasi proses pembelajaran selama induksi, termasuk on-the-job training dan arahan kerja', 'review'),
    ],
    createdAt: '2026-02-01T00:00:00+07:00',
  },
]

let _nextId = 4

function migrateTemplate(t) {
  const copy = { ...t }
  // Strip empty-type mainSection entries (from old EMPTY_FORM default)
  if (Array.isArray(copy.mainSections)) {
    copy.mainSections = copy.mainSections.filter(ms => ms.type)
  }
  return copy
}

export const useMasterOnboardingStore = create(
  persist(
    (set) => ({
      templates: SEED,

      addTemplate: (data) =>
        set(s => ({
          templates: [...s.templates, {
            mainSections: [], reviewItems: null,
            active: true,
            createdAt: new Date().toISOString(),
            ...data,
            id: _nextId++,
          }],
        })),

      updateTemplate: (id, patch) =>
        set(s => ({
          templates: s.templates.map(t => t.id === id ? { ...t, ...patch } : t),
        })),

      deleteTemplate: (id) =>
        set(s => ({ templates: s.templates.filter(t => t.id !== id) })),
    }),
    {
      name: 'hcm-master-onboarding-v2',
      migrate: (persisted) => ({
        ...persisted,
        templates: (persisted.templates ?? SEED).map(migrateTemplate),
      }),
      version: 2,
    }
  )
)
