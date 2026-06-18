import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const SEED = [
  {
    id: 1,
    employeeId: 1,
    employeeName: 'Budi Santoso',
    managerId: 2,
    managerName: 'Ahmad Fauzi',
    date: '2025-06-10',
    status: 'Replied',
    topic:   'Diskusi target Q3 dan kendala yang dihadapi saat ini',
    goal:    'Mendapatkan clarity tentang prioritas pekerjaan Q3 dan dukungan yang dibutuhkan',
    reality: 'Saat ini merasa overload dengan 3 proyek berjalan bersamaan, sulit fokus',
    options: 'Delegasi sebagian tugas ke junior, atau reschedule deadline salah satu proyek',
    wayForward: 'Akan mendelegasikan laporan bulanan ke Rizky, dan reschedule proyek C ke minggu depan',
    managerReply: 'Setuju dengan rencana delegasi. Saya akan bantu koordinasi dengan tim C untuk reschedule.',
    repliedAt: '2025-06-10T14:30:00+07:00',
    submittedAt: '2025-06-10T09:00:00+07:00',
  },
  {
    id: 2,
    employeeId: 1,
    employeeName: 'Budi Santoso',
    managerId: 2,
    managerName: 'Ahmad Fauzi',
    date: '2025-05-15',
    status: 'Replied',
    topic:   'Review performance mid-year dan rencana pengembangan',
    goal:    'Memastikan track untuk mencapai target tahunan dan skill yang perlu dikembangkan',
    reality: 'Performance on-track, tapi merasa perlu upgrade skill leadership untuk jenjang karir',
    options: 'Ikut program leadership, atau mentoring dari senior manager',
    wayForward: 'Daftarkan ke Leadership Fundamentals L1 bulan depan',
    managerReply: 'Bagus! Saya akan rekomendasikan ke HR untuk enrollment Leadership Fundamentals L1.',
    repliedAt: '2025-05-15T15:00:00+07:00',
    submittedAt: '2025-05-15T10:00:00+07:00',
  },
]

export const useHayStore = create(
  persist(
    (set, get) => ({
      sessions: SEED,

      submitHay: (data) => {
        const newSession = {
          id: Date.now(),
          status: 'Submitted',
          submittedAt: new Date().toISOString(),
          managerReply: '',
          repliedAt: null,
          ...data,
        }
        set(s => ({ sessions: [newSession, ...s.sessions] }))
        return newSession.id
      },

      replyHay: (id, reply) => {
        set(s => ({
          sessions: s.sessions.map(h =>
            h.id === id
              ? { ...h, managerReply: reply, status: 'Replied', repliedAt: new Date().toISOString() }
              : h
          ),
        }))
      },

      getByEmployee: (employeeId) =>
        get().sessions.filter(h => h.employeeId === employeeId),

      getByManager: (managerId) =>
        get().sessions.filter(h => h.managerId === managerId),
    }),
    { name: 'hay-store' }
  )
)
