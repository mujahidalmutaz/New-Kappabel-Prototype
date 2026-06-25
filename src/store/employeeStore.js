import { create } from 'zustand'
import { persist as zustandPersist } from 'zustand/middleware'
import { autoAssignOnboardingForEmployee } from './onboardingAutoAssign'
import { persist } from '@/lib/persist'

// ─── Action & Reason LOV ──────────────────────────────────────────────────────
export const HISTORY_ACTIONS = [
  'Hire',
  'Transfer',
  'Promotion',
  'Demotion',
  'Salary Change',
  'Leave of Absence',
  'Return from Leave',
  'Data Change',
  'Termination',
]

export const HISTORY_REASONS = {
  'Hire':              ['New Hire', 'Rehire', 'Conversion from Contract', 'Acquisition'],
  'Transfer':          ['Internal Transfer', 'Interdepartmental Transfer', 'Intercompany Transfer', 'Relocation'],
  'Promotion':         ['Performance-Based', 'Merit Promotion', 'Acting Assignment'],
  'Demotion':          ['Performance Issue', 'Disciplinary Action', 'Voluntary Demotion'],
  'Salary Change':     ['Annual Review', 'Market Adjustment', 'Promotion', 'Merit Increase', 'Correction'],
  'Leave of Absence':  ['Maternity/Paternity Leave', 'Medical Leave', 'Personal Leave', 'Study Leave', 'Unpaid Leave'],
  'Return from Leave': ['Return from Maternity/Paternity', 'Return from Medical Leave', 'Return from Personal Leave', 'Return from Study Leave'],
  'Data Change':       ['Name Change', 'Address Change', 'Personal Data Update', 'Legal Data Change', 'Contract Renewal'],
  'Termination':       ['Resignation', 'End of Contract', 'Retirement', 'Layoff / Redundancy', 'Dismissal', 'Mutual Agreement', 'Death'],
}

export const ACTION_COLOR = {
  'Hire':              'bg-green-100 text-green-700',
  'Transfer':          'bg-blue-100 text-blue-700',
  'Promotion':         'bg-red-100 text-red-700',
  'Demotion':          'bg-orange-100 text-orange-700',
  'Salary Change':     'bg-cyan-100 text-cyan-700',
  'Leave of Absence':  'bg-yellow-100 text-yellow-700',
  'Return from Leave': 'bg-teal-100 text-teal-700',
  'Data Change':       'bg-gray-100 text-gray-600',
  'Termination':       'bg-red-100 text-red-700',
}

// ─── Structure IDs (aligned with structureStore seed data) ───────────────────
// Division: 1=Technology Group, 2=Operations Group, 3=Finance Group
// Company:  1=PT Nusantara Teknologi (NTK), 2=PT Nusantara Finance (NFC), 3=Philippines Inc (PHL)
// BUnit:    1=Software Engineering, 2=Infrastructure, 3=Accounting, 4=HR (NTK), 5=HR (NFC)
//           6=Product Engineering (PHL), 7=Quality Assurance (PHL), 8=HR (PHL)
// Dept:     1=Frontend, 2=Backend, 3=DevOps, 4=Procurement, 5=HR Ops (NTK), 6=HR Ops (NFC)
//           7=Web Development (PHL), 8=Mobile Development (PHL), 9=QA & Testing (PHL), 10=HR Ops (PHL)
// Position: 1=Junior SE(PC10), 2=SE(PC20), 3=Senior SE(PC30), 4=Eng Mgr(PC53),
//           5=IT Support(PC15), 6=Finance Analyst(PC20), 7=Finance Mgr(PC54),
//           22=HR Manager NTK(PC53), 23=HR Officer NTK(PC20),
//           24=HR Manager NFC(PC53), 25=HR Officer NFC(PC20),
//           26=Jr Web Dev(PC10), 27=Web Dev(PC20), 28=Sr Web Dev(PC30), 29=Eng Mgr PHL(PC53)
//           30=Mobile Dev(PC20), 31=Sr Mobile Dev(PC30), 32=QA Eng(PC15), 33=Sr QA Eng(PC25)
//           34=QA Lead(PC40), 35=HR Mgr PHL(PC53), 36=HR Officer PHL(PC20)

const SEED_EMPLOYEES = []

let _empId     = 1
let _depId     = 10
let _eduId     = 10
let _certId    = 10
let _skillId   = 10
let _histId    = 20

export const useEmployeeStore = create(
  zustandPersist(
  (set, get) => ({
  // Demo seed employees (ids 1–50, used by login/demo flows). Imported employees
  // from the Excel upload (ids 200001+) are hydrated at runtime — see bottom of file.
  employees: SEED_EMPLOYEES.map(e => ({ ...e,
    dependents:     (e.dependents     || []).map(x=>({...x})),
    education:      (e.education      || []).map(x=>({...x})),
    certifications: (e.certifications || []).map(x=>({...x})),
    skills:         (e.skills         || []).map(x=>({...x})),
    history:        (e.history        || []).map(x=>({...x})),
  })),
  lastAddedEmpId: null,

  // ── Employee CRUD ──────────────────────────────────────────────
  addEmployee: (d) => {
    const id = _empId++
    const emp = {
      id, photo: null,
      dependents: [], education: [], certifications: [], skills: [],
      history: d.joinDate ? [{
        id: _histId++, effectiveDate: d.joinDate, effectiveSeq: 1,
        action: 'Hire', reason: 'New Hire',
        companyId: d.companyId||'', departmentId: d.departmentId||'',
        positionId: d.positionId||'', gradeId: d.gradeId||'', note: '',
      }] : [],
      ...d, id,
    }
    set(s => ({ lastAddedEmpId: id, employees: [...s.employees, emp] }))
    persist('/api/employees', 'POST', emp)   // write-through to DB (best-effort)

    // Rule-based auto-assign onboarding for the new hire so no one is missed.
    // Done after state update; failures must not block employee creation.
    try {
      autoAssignOnboardingForEmployee(emp, get().employees)
    } catch (e) {
      console.error('Auto-assign onboarding failed:', e)
    }
    return id
  },
  updateEmployee: (id, d) => {
    set(s => ({ employees: s.employees.map(e => e.id === id ? { ...e, ...d } : e) }))
    persist(`/api/employees/${id}`, 'PUT', d)
  },
  deleteEmployee: (id) => {
    set(s => ({ employees: s.employees.filter(e => e.id !== id) }))
    persist(`/api/employees/${id}`, 'DELETE')
  },

  // ── Photo ──────────────────────────────────────────────────────
  setPhoto: (id, dataUrl) => set(s => ({
    employees: s.employees.map(e => e.id === id ? { ...e, photo: dataUrl } : e)
  })),

  // ── Dependents ─────────────────────────────────────────────────
  addDependent: (empId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, dependents: [...e.dependents, { id: _depId++, ...d }] }
      : e)
  })),
  updateDependent: (empId, depId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, dependents: e.dependents.map(x => x.id === depId ? {...x,...d} : x) }
      : e)
  })),
  deleteDependent: (empId, depId) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, dependents: e.dependents.filter(x => x.id !== depId) }
      : e)
  })),

  // ── Education ──────────────────────────────────────────────────
  addEducation: (empId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, education: [...e.education, { id: _eduId++, ...d }] }
      : e)
  })),
  updateEducation: (empId, eduId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, education: e.education.map(x => x.id === eduId ? { ...x, ...d } : x) }
      : e)
  })),
  deleteEducation: (empId, eduId) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, education: e.education.filter(x => x.id !== eduId) }
      : e)
  })),

  // ── Certifications ─────────────────────────────────────────────
  addCertification: (empId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, certifications: [...e.certifications, { id: _certId++, ...d }] }
      : e)
  })),
  updateCertification: (empId, certId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, certifications: e.certifications.map(x => x.id === certId ? { ...x, ...d } : x) }
      : e)
  })),
  deleteCertification: (empId, certId) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, certifications: e.certifications.filter(x => x.id !== certId) }
      : e)
  })),

  // ── Skills ─────────────────────────────────────────────────────
  addSkill: (empId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, skills: [...e.skills, { id: _skillId++, ...d }] }
      : e)
  })),
  updateSkill: (empId, skillId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, skills: e.skills.map(x => x.id === skillId ? { ...x, ...d } : x) }
      : e)
  })),
  deleteSkill: (empId, skillId) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, skills: e.skills.filter(x => x.id !== skillId) }
      : e)
  })),

  // ── History ────────────────────────────────────────────────────
  addHistory: (empId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, history: [...(e.history||[]), { id: _histId++, ...d }]
            .sort((a,b) => a.effectiveDate.localeCompare(b.effectiveDate) || a.effectiveSeq - b.effectiveSeq) }
      : e)
  })),
  updateHistory: (empId, histId, d) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, history: e.history.map(h => h.id === histId ? {...h,...d} : h) }
      : e)
  })),
  deleteHistory: (empId, histId) => set(s => ({
    employees: s.employees.map(e => e.id === empId
      ? { ...e, history: e.history.filter(h => h.id !== histId) }
      : e)
  })),
  }),
  { name: 'kpb-employees' }
))

// ─── Hydrate imported employees (from Excel upload) ───────────────────────────
// Source priority: DB via /api/employees (when a database is configured & seeded),
// otherwise the static /public JSON. Appended once on the client, non-destructively,
// on top of the demo seed. Nested arrays are normalized so DB rows (which omit them)
// don't break the CRUD actions above.
if (typeof window !== 'undefined' && !window.__kpbEmployeesLoaded) {
  window.__kpbEmployeesLoaded = true
  const norm = (e) => ({ dependents: [], education: [], certifications: [], skills: [], history: [], ...e })
  const load = async () => {
    try { const r = await fetch('/api/employees'); if (r.ok) return await r.json() } catch {}
    return (await fetch('/data/importedEmployees.json')).json()
  }
  load()
    .then(list => useEmployeeStore.setState(s => ({ employees: [...s.employees, ...list.map(norm)] })))
    .catch(() => { window.__kpbEmployeesLoaded = false })
}
