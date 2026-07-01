import { create }  from 'zustand'
import { persist } from 'zustand/middleware'

// ── Seed templates ────────────────────────────────────────────────────────────
const SEED = []

let _nextId = 1

function migrateTemplate(t) {
  const copy = { ...t }
  if (Array.isArray(copy.mainSections)) {
    copy.mainSections = copy.mainSections.filter(ms => ms.type)
  }
  copy.criteria = {
    employmentTypes: [], departmentIds: [], companyIds: [], positionIds: [],
    ...(copy.criteria ?? {}),
  }
  if (copy.autoAssign === undefined) copy.autoAssign = false
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
      name: 'hcm-master-onboarding-v3',
      migrate: (persisted) => ({
        ...persisted,
        templates: (persisted.templates ?? SEED).map(migrateTemplate),
      }),
      version: 3,
    }
  )
)
