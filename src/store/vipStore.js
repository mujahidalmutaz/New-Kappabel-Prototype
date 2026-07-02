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
    status: 'Active',
    managerApprovedAt: '2025-06-11T09:00:00+07:00',
    managerApprovedBy: 'Ahmad Fauzi',
    finalScore: null,
    ratingNote: '',
    ratedAt: null,
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

// Goal lifecycle: employee submits goals → Pending Manager (approve goals &
// weights) → Active (period runs) → Closed (manager rates at period end).
export const VIP_STATUS = {
  PENDING: 'Pending Manager',
  ACTIVE:  'Active',
  CLOSED:  'Closed',
}

export const useVipStore = create(
  persist(
    (set, get) => ({
      sessions: SEED,

      submitVip: (data) => {
        const newSession = {
          id: Date.now(),
          submittedAt: new Date().toISOString(),
          status: VIP_STATUS.PENDING,
          managerApprovedAt: null,
          managerApprovedBy: null,
          finalScore: null,
          ratingNote: '',
          ratedAt: null,
          ...data,
        }
        set(s => ({ sessions: [newSession, ...s.sessions] }))
        return newSession.id
      },

      // Manager approves the goals & weights at the start of the period.
      approveVip: (id, mgr) =>
        set(s => ({
          sessions: s.sessions.map(v => v.id === id
            ? { ...v, status: VIP_STATUS.ACTIVE, managerApprovedAt: new Date().toISOString(), managerApprovedBy: mgr?.name ?? 'Manager' }
            : v),
        })),

      // Manager rates achievement at the end of the period.
      rateVip: (id, finalScore, note) =>
        set(s => ({
          sessions: s.sessions.map(v => v.id === id
            ? { ...v, status: VIP_STATUS.CLOSED, finalScore, ratingNote: note || '', ratedAt: new Date().toISOString() }
            : v),
        })),

      getByEmployee: (employeeId) =>
        get().sessions.filter(s => s.employeeId === employeeId),

      getByManager: (managerId) =>
        get().sessions.filter(s => s.managerId === managerId),
    }),
    { name: 'vip-store-v3' }
  )
)
