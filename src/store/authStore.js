import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Seed users (sementara, nanti ganti ke API)
const SEED_USERS = [
  // ── Existing ──────────────────────────────────────────────────────────────
  { id:1,  username:'employee',  password:'pass123', name:'Budi Santoso',     role:'employee',   dept:'Engineering',    position:'Software Engineer',        email:'budi@company.com'    },
  { id:2,  username:'manager',   password:'pass123', name:'Dewi Rahayu',      role:'manager',    dept:'Engineering',    position:'Engineering Manager',      email:'dewi@company.com'    },
  { id:3,  username:'hr',        password:'pass123', name:'Rina Marlina',     role:'hr',         dept:'HR',             position:'HR Specialist',            email:'rina@company.com'    },
  { id:4,  username:'admin',     password:'pass123', name:'Ahmad Fauzi',      role:'superadmin', dept:'IT',             position:'System Administrator',     email:'ahmad@company.com'   },
  // ── Indirect Supervisors ──────────────────────────────────────────────────
  { id:7,  username:'rizky',     password:'pass123', name:'Rizky Pratama',    role:'manager',    dept:'Engineering',    position:'Chief Technology Officer',  email:'rizky@company.com'   },
  { id:9,  username:'kartika',   password:'pass123', name:'Kartika Sari',     role:'hr',         dept:'HR',             position:'Chief Human Resources Officer', email:'kartika@company.com' },
  // ── HR Team — NTK ─────────────────────────────────────────────────────────
  { id:12, username:'bagas',     password:'pass123', name:'Bagas Pratiwi',    role:'hr',         dept:'HR Operations',  position:'HR Manager',               email:'bagas@company.com'   },
  { id:13, username:'desi',      password:'pass123', name:'Desi Kurniawati',  role:'hr',         dept:'HR Operations',  position:'HR Officer',               email:'desi@company.com'    },
  { id:14, username:'faisal',    password:'pass123', name:'Faisal Rahman',    role:'hr',         dept:'HR Operations',  position:'HR Officer',               email:'faisal@company.com'  },
  // ── HR Team — NFC ─────────────────────────────────────────────────────────
  { id:15, username:'yuliani',   password:'pass123', name:'Yuliani Suharto',  role:'hr',         dept:'HR Operations',  position:'HR Manager',               email:'yuliani@company.com' },
  { id:16, username:'hendri',    password:'pass123', name:'Hendri Wijaksono', role:'hr',         dept:'HR Operations',  position:'HR Officer',               email:'hendri@company.com'  },
]

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      realUser:    null,   // original user when in proxy mode
      userList: SEED_USERS,
      _hydrated: false,

      setHydrated: () => set({ _hydrated: true }),

      login: (username, password) => {
        const user = get().userList.find(
          u => u.username === username && u.password === password
        )
        if (!user) return false
        set({ currentUser: user, realUser: null })
        return true
      },

      logout: () => set({ currentUser: null, realUser: null }),

      // Proxy: start viewing as another user
      startProxy: (targetUser) => {
        const real = get().realUser || get().currentUser
        set({ realUser: real, currentUser: targetUser })
      },

      // Proxy: return to original session
      endProxy: () => {
        const real = get().realUser
        if (real) set({ currentUser: real, realUser: null })
      },

      addUser:    (u)     => set(s => ({ userList: [...s.userList, u] })),
      updateUser: (id, d) => set(s => ({ userList: s.userList.map(u => u.id===id ? {...u,...d} : u) })),
      deleteUser: (id)    => set(s => ({ userList: s.userList.filter(u => u.id !== id) })),
    }),
    {
      name: 'hcm-auth',
      partialize: (s) => ({ currentUser: s.currentUser, realUser: s.realUser }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)