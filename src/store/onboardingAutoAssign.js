// ── Shared Auto-Assign Onboarding engine ──────────────────────────────────────
// Single source of truth for "rule-based" onboarding assignment so the logic
// stays identical whether triggered automatically (on new hire) or manually
// (backfill / reconcile from the HR pages).
//
// NOTE: this module intentionally does NOT import employeeStore to avoid a
// circular import — the caller passes the employee list in instead.
import { useMasterOnboardingStore } from './masterOnboardingStore'
import { useOnboardingStore }       from './onboardingStore'
import { useStructureStore }        from './structureStore'

const addRuntime = (item) => ({ ...item, id: Math.random(), date: '', completed: false })

const BLANK_BUDDY = {
  buddyEmpId: '', buddyName: '', buddyPosition: '',
  programDuration: '', programDurationUnit: 'Bulan',
  programStartDate: '', programEndDate: '', hrbpNotes: '',
}

// ── Does an Auto-Assign template apply to this employee? ───────────────────────
export function templateMatchesEmployee(tpl, emp) {
  if (!tpl?.active || !tpl?.autoAssign) return false
  const c = tpl.criteria ?? {}
  const etOk   = !c.employmentTypes?.length || c.employmentTypes.includes(emp.employmentType)
  const deptOk = !c.departmentIds?.length   || c.departmentIds.includes(emp.departmentId)
  const compOk = !c.companyIds?.length      || c.companyIds.includes(emp.companyId)
  const posOk  = !c.positionIds?.length     || c.positionIds.includes(emp.positionId)
  return etOk && deptOk && compOk && posOk
}

// ── Build a Draft onboarding record from a template for one employee ──────────
export function buildOnboardingFromTemplate(tpl, emp, employees) {
  const { positions, departments } = useStructureStore.getState()
  const supervisor = (employees ?? []).find(e => e.id === emp.managerId)
  const dept       = departments.find(d => d.id === emp.departmentId)

  let mainSections = (tpl.mainSections ?? [])
    .filter(ms => ms.type)
    .map(ms => ({
      ...ms,
      id:       `ms_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      sections: (ms.sections ?? []).map(s => ({ ...s })),
      items:    (ms.items    ?? []).map(addRuntime),
    }))

  // Migrate old-format templates (generalItems/technicalItems)
  if (mainSections.length === 0) {
    const genSec   = (tpl.generalSections   ?? []).map(s => ({ ...s }))
    const genItem  = (tpl.generalItems      ?? []).map(addRuntime)
    const techSec  = (tpl.technicalSections ?? []).map(s => ({ ...s }))
    const techItem = (tpl.technicalItems    ?? []).map(addRuntime)
    if (genItem.length || genSec.length)
      mainSections.push({ id: `ms_gen_${Date.now()}`,  type: 'Onboarding General', sections: genSec,  items: genItem  })
    if (techItem.length || techSec.length)
      mainSections.push({ id: `ms_tech_${Date.now()}`, type: 'Onboarding Teknis',  sections: techSec, items: techItem })
  }

  const rawReview   = (tpl.reviewItems ?? []).map(addRuntime)
  const reviewItems = rawReview.length > 0
    ? rawReview.map(item => item.isDirectManager
        ? { ...item, reviewerEmpId: String(supervisor?.id ?? ''), reviewerName: supervisor?.name ?? 'Direct Manager', reviewerPosition: '' }
        : item)
    : null

  return {
    employeeId:         emp.id,
    employeeName:       emp.name,
    department:         dept?.name ?? '',
    supervisorName:     supervisor?.name ?? '',
    supervisorPosition: positions.find(p => p.id === supervisor?.positionId)?.name ?? '',
    employmentStatus:   'New Hire',
    probationPeriod:    '3',
    mainSections,
    reviewItems,
    hasilInductionChecked: false,
    buddyAssignment: {
      ...BLANK_BUDDY,
      programStartDate: emp.joinDate ? String(emp.joinDate).slice(0, 10) : '',
    },
    workflowStatus: 'Preparation',
    steps: [],
    submittedAt: null,
    submittedBy: null,
    submittedByName: null,
    createdVia: 'auto-assign',
    templateId: tpl.id,
    templateName: tpl.name,
  }
}

// ── Assign onboarding for a single employee (idempotent) ──────────────────────
// Returns 1 if a record was created, 0 otherwise.
export function autoAssignOnboardingForEmployee(emp, employees) {
  if (!emp) return 0
  const { templates } = useMasterOnboardingStore.getState()
  const { onboardings, addOnboarding } = useOnboardingStore.getState()

  // Skip employees who already have an onboarding record
  if (onboardings.some(o => Number(o.employeeId) === Number(emp.id))) return 0

  // First matching active + auto-assign template wins (template ordering = priority)
  const tpl = templates.find(t => templateMatchesEmployee(t, emp))
  if (!tpl) return 0

  addOnboarding(buildOnboardingFromTemplate(tpl, emp, employees))
  return 1
}

// ── Backfill: scan all active employees and assign any that were missed ───────
// Returns the number of records created.
export function reconcileAutoAssign(employees) {
  let count = 0
  ;(employees ?? []).forEach(emp => {
    if (emp.status === 'Active') count += autoAssignOnboardingForEmployee(emp, employees)
  })
  return count
}
