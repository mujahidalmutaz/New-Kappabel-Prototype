import { create }  from 'zustand'
import { persist } from 'zustand/middleware'

// ── Seed templates ────────────────────────────────────────────────────────────
const SEED = []

// Next id derived from existing templates so it never collides after a reload
// (a module-level counter would reset to its initial value on every page load).
const nextId = (templates) =>
  templates.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0) + 1

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
            id: nextId(s.templates),
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
      migrate: (persisted) => {
        const templates = (persisted?.templates ?? SEED).map(migrateTemplate)
        // Repair legacy duplicate ids (caused by a reset id counter) by
        // reassigning unique sequential ids. Template ids are not referenced
        // elsewhere — onboarding records copy template content, not its id.
        templates.forEach((t, i) => { t.id = i + 1 })
        return { ...persisted, templates }
      },
      version: 4,
    }
  )
)
