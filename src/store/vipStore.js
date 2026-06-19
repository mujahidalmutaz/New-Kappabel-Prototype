import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const SEED = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'Budi Santoso',
    managerId: 2,
    managerName: 'Ahmad Fauzi',
    name: 'OKR Q2 2025',
    date: '2025-06-10',
    submittedAt: '2025-06-10T09:00:00+07:00',
    topics: [
      {
        id: 1,
        title: 'Penyelesaian Modul Laporan Keuangan Q2',
        description: 'Menyelesaikan pengembangan modul laporan keuangan termasuk integrasi dengan sistem ERP perusahaan.',
        goalPlan: 'Goal Plan for Self-Input Goal 2025',
        weight: 60,
        status: 'In Progress',
        checkInNotes: 'Progress 80%, tinggal testing dan UAT yang dijadwalkan minggu depan.',
      },
      {
        id: 2,
        title: 'Peningkatan Skill Leadership',
        description: 'Mengikuti program Leadership Fundamentals L1 dan menerapkannya dalam koordinasi tim sehari-hari.',
        goalPlan: 'Goal Plan for Self-Input Goal 2025',
        weight: 40,
        status: 'In Progress',
        checkInNotes: 'Sudah menyelesaikan modul 1 dan 2. Lanjut modul 3 bulan depan.',
      },
    ],
  },
]

export const useVipStore = create(
  persist(
    (set, get) => ({
      sessions: SEED,

      submitVip: (data) => {
        const newSession = {
          id: Date.now(),
          submittedAt: new Date().toISOString(),
          ...data,
        }
        set(s => ({ sessions: [newSession, ...s.sessions] }))
        return newSession.id
      },

      getByEmployee: (employeeId) =>
        get().sessions.filter(s => s.employeeId === employeeId),

      getByManager: (managerId) =>
        get().sessions.filter(s => s.managerId === managerId),
    }),
    { name: 'vip-store-v2' }
  )
)
