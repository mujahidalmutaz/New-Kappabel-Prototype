import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const PERNYATAAN = [
  'Sebagai bagian dari Rencana Perbaikan Kinerja (PIP) ini, karyawan diharapkan untuk mencapai target kinerja yang telah ditetapkan dalam periode yang disepakati. Apabila karyawan tidak dapat memenuhi standar kinerja yang diharapkan, baik dalam hal pencapaian target, peningkatan kualitas, atau pengembangan keterampilan yang telah disepakati, maka perusahaan berhak untuk mengambil tindakan lebih lanjut sesuai dengan kebijakan perusahaan, yang dapat mencakup Pemutusan Hubungan Kerja (PHK).',
  'Atasan langsung akan melakukan evaluasi secara berkala untuk menilai kemajuan karyawan dalam mencapai tujuan yang telah ditetapkan dalam PIP. Jika, setelah periode evaluasi dan setelah diberikannya kesempatan untuk perbaikan, karyawan tetap tidak dapat memenuhi standar yang ditentukan, maka Pemutusan Hubungan Kerja (PHK) dapat diberlakukan sebagai langkah terakhir sesuai dengan peraturan dan ketentuan yang berlaku.',
  'Karyawan diharapkan memahami bahwa keputusan ini diambil dengan didasarkan pada evaluasi yang objektif, prinsip keadilan, dan kepentingan bersama untuk mendukung keberlangsungan operasional perusahaan.',
]

export { PERNYATAAN }

const SEED = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'Budi Santoso',
    employeeDept: 'Operations',
    employeePosition: 'Operations Staff',
    employeeIdNo: 'EMP-001',
    managerId: 2,
    managerName: 'Ahmad Fauzi',
    managerIdNo: 'EMP-002',
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    alasanPip: 'Ketidaksesuaian kinerja dengan standar yang diharapkan dalam hal produktivitas dan kualitas kerja selama Q1 2025.',
    rencanaPerbaikan: 'Meningkatkan produktivitas harian minimal 20%, mengikuti pelatihan manajemen waktu, dan melakukan sesi coaching mingguan dengan atasan.',
    kpiRows: [
      { id: 1, kpi: 'Produktivitas Harian', deskripsi: 'Penyelesaian tugas harian sesuai target', target: '95%', bulan1: '', bulan2: '', bulan3: '' },
      { id: 2, kpi: 'Kualitas Output', deskripsi: 'Error rate di bawah threshold', target: '< 2%', bulan1: '', bulan2: '', bulan3: '' },
      { id: 3, kpi: 'Kehadiran', deskripsi: 'Tingkat kehadiran dan ketepatan waktu', target: '100%', bulan1: '', bulan2: '', bulan3: '' },
    ],
    evaluasiRows: [
      { bulan: 'Bulan I', tanggal: '2025-07-01', sudah: '', belum: '', rencana: '' },
      { bulan: 'Bulan II', tanggal: '2025-08-01', sudah: '', belum: '', rencana: '' },
      { bulan: 'Bulan III', tanggal: '2025-08-31', sudah: '', belum: '', rencana: '' },
    ],
    status: 'Pending Approval',
    submittedAt: '2025-06-01T09:00:00+07:00',
    approvedAt: null,
    employeeNote: '',
  },
]

export const usePipStore = create(
  persist(
    (set, get) => ({
      sessions: SEED,

      submitPip: (data) => {
        const newSession = {
          id: Date.now(),
          status: 'Pending Approval',
          submittedAt: new Date().toISOString(),
          approvedAt: null,
          employeeNote: '',
          ...data,
        }
        set(s => ({ sessions: [newSession, ...s.sessions] }))
        return newSession.id
      },

      updatePip: (id, data) => {
        set(s => ({
          sessions: s.sessions.map(p => p.id === id ? { ...p, ...data } : p),
        }))
      },

      approvePip: (id, note) => {
        set(s => ({
          sessions: s.sessions.map(p =>
            p.id === id ? { ...p, status: 'Approved', approvedAt: new Date().toISOString(), employeeNote: note || '' } : p
          ),
        }))
      },

      getByEmployee: (employeeId) =>
        get().sessions.filter(p => p.employeeId === employeeId),

      getByManager: (managerId) =>
        get().sessions.filter(p => p.managerId === managerId),
    }),
    { name: 'pip-store' }
  )
)
