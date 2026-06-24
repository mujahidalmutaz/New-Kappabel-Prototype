'use client'
import React, { useState, useEffect }   from 'react'
import { useAuthStore }          from '@/store/authStore'
import { useEmployeeStore }      from '@/store/employeeStore'
import { useWorkflowStore }      from '@/store/workflowStore'
import { useOnboardingStore }    from '@/store/onboardingStore'
import { useMasterOnboardingStore } from '@/store/masterOnboardingStore'
import { useMasterFormStore }       from '@/store/masterFormStore'
import { templateMatchesEmployee, buildOnboardingFromTemplate } from '@/store/onboardingAutoAssign'
import { useStructureStore }     from '@/store/structureStore'
import { useCourseBatchStore }   from '@/store/courseBatchStore'
import { useT }                  from '@/store/languageStore'
import { PageHeader, StatCard, SectionCard, DataTable, Tr, Td, StatusBadge, ActionButton, EmptyState, BRAND_GRADIENT } from '@/components/ui'
import { assigneeLabel, assigneeBadgeCls } from '@/utils/assigneeUtils'
import { FIELD_TYPES, newField } from '@/utils/formBuilderUtils'

// ── Form Picker Panel (library + custom) ──────────────────────────────────────
function FormPickerPanel({ item, masterForms, onChange }) {
  const [mode, setMode] = useState(item.masterFormId ? 'library' : (item.formSchema?.length > 0 ? 'custom' : 'library'))
  const activeForms = masterForms.filter(f => f.active)

  const pickLibrary = (formId) => {
    const mf = masterForms.find(f => f.id === Number(formId))
    if (!mf) { onChange({ masterFormId: null, formSchema: [], formType: null, evalMethod: null, evalTopics: [], ojtParams: [] }); return }
    onChange({
      masterFormId: mf.id,
      formSchema: mf.fields ?? [],
      formType: mf.formType ?? 'field',
      evalMethod: mf.evalMethod ?? 'nilai',
      evalTopics: mf.evalTopics ?? [],
      ojtParams: mf.ojtParams ?? [],
    })
  }
  const addField  = () => onChange({ formSchema: [...(item.formSchema ?? []), newField()] })
  const delField  = (id) => onChange({ formSchema: (item.formSchema ?? []).filter(f => f.id !== id) })
  const updField  = (id, key, val) => onChange({ formSchema: (item.formSchema ?? []).map(f => f.id === id ? { ...f, [key]: val } : f) })
  const moveField = (idx, dir) => {
    const arr = [...(item.formSchema ?? [])]; const swp = idx + dir
    if (swp < 0 || swp >= arr.length) return
    ;[arr[idx], arr[swp]] = [arr[swp], arr[idx]]; onChange({ formSchema: arr })
  }

  return (
    <div className='mt-1 mb-1 ml-6 mr-1 rounded-lg border border-dashed border-red-200 bg-red-50/40 p-3'>
      <div className='flex items-center gap-3 mb-2'>
        <span className='text-xs font-bold text-red-700'>⚙ Form Fields</span>
        <div className='flex rounded overflow-hidden border border-red-200 text-xs'>
          <button onClick={() => setMode('library')} className={`px-2.5 py-1 font-semibold transition ${mode === 'library' ? 'bg-red-600 text-white' : 'bg-white text-red-600 hover:bg-red-50'}`}>Dari Library</button>
          <button onClick={() => setMode('custom')} className={`px-2.5 py-1 font-semibold transition ${mode === 'custom' ? 'bg-red-600 text-white' : 'bg-white text-red-600 hover:bg-red-50'}`}>Custom</button>
        </div>
      </div>
      {mode === 'library' ? (
        <div>
          {activeForms.length === 0
            ? <p className='text-xs text-gray-400 italic'>Belum ada form di library. Buat di menu <strong>Master Form</strong>.</p>
            : <select value={item.masterFormId ?? ''} onChange={e => pickLibrary(e.target.value)}
                className='w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                <option value=''>— Pilih Form dari Library —</option>
                {activeForms.map(f => {
                  const ft = f.formType ?? 'field'
                  const suffix = ft === 'field' ? `${(f.fields ?? []).length} field`
                    : ft === 'evaluasi' ? `Evaluasi · ${f.evalMethod ?? 'nilai'}`
                    : ft === 'ojt' ? `OJT · ${(f.ojtParams ?? []).length} param`
                    : 'Summary'
                  return <option key={f.id} value={f.id}>{f.name} ({suffix})</option>
                })}
              </select>
          }
          {item.masterFormId && (() => {
            const ft = item.formType ?? 'field'
            if (ft === 'summary') return <p className='mt-1 text-[10px] text-teal-600 italic'>Form Summary: ringkasan otomatis task selesai.</p>
            if (ft === 'evaluasi') return (
              <p className='mt-1 text-[10px] text-amber-600 italic'>
                Form Evaluasi · metode: {item.evalMethod ?? 'nilai'} · {(item.evalTopics ?? []).length} topik
              </p>
            )
            if (ft === 'ojt') return (
              <p className='mt-1 text-[10px] text-violet-600 italic'>
                Form OJT · {(item.ojtParams ?? []).length} parameter · {(item.ojtParams ?? []).reduce((s, p) => s + (p.activities ?? []).length, 0)} aktivitas
              </p>
            )
            return (
              <div className='mt-2 flex flex-wrap gap-1'>
                {(item.formSchema ?? []).map(f => (
                  <span key={f.id} className='text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600'>{f.label || f.type}{f.required ? ' *' : ''}</span>
                ))}
              </div>
            )
          })()}
        </div>
      ) : (
        <div>
          <div className='flex justify-end mb-1'>
            <button onClick={addField} className='text-xs px-2.5 py-1 rounded border border-red-300 text-red-600 hover:bg-red-100 font-semibold transition'>+ Tambah Field</button>
          </div>
          {(item.formSchema ?? []).length === 0 && <p className='text-xs text-gray-400 italic text-center py-2'>Belum ada field.</p>}
          <div className='space-y-2'>
            {(item.formSchema ?? []).map((f, idx) => (
              <div key={f.id} className='flex items-start gap-2 bg-white rounded border border-gray-200 px-2 py-1.5'>
                <div className='flex flex-col gap-0.5 pt-0.5'>
                  <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className='text-[10px] text-gray-400 hover:text-gray-600 disabled:opacity-30 leading-none'>▲</button>
                  <button onClick={() => moveField(idx, 1)} disabled={idx === (item.formSchema ?? []).length - 1} className='text-[10px] text-gray-400 hover:text-gray-600 disabled:opacity-30 leading-none'>▼</button>
                </div>
                <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-1.5'>
                  <input value={f.label} onChange={e => updField(f.id, 'label', e.target.value)} placeholder='Label field…' className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 md:col-span-2' />
                  <select value={f.type} onChange={e => updField(f.id, 'type', e.target.value)} className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white'>
                    {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <div className='flex items-center gap-2'>
                    <label className='flex items-center gap-1 text-xs text-gray-600 cursor-pointer'>
                      <input type='checkbox' checked={!!f.required} onChange={e => updField(f.id, 'required', e.target.checked)} className='w-3 h-3 accent-red-600' />Wajib
                    </label>
                    <button onClick={() => delField(f.id)} className='ml-auto text-red-400 hover:text-red-600 text-sm font-bold'>✕</button>
                  </div>
                  {(f.type === 'dropdown' || f.type === 'radio') && (
                    <input value={f.options || ''} onChange={e => updField(f.id, 'options', e.target.value)} placeholder='Opsi dipisah koma: A, B, C' className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 md:col-span-4' />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Evaluator Picker ──────────────────────────────────────────────────────────
function EvaluatorPicker({ evaluators = [], employees = [], onChange }) {
  const FIXED = [
    { id: 'manager', label: 'Direct Manager' },
    { id: 'self',    label: 'Karyawan Sendiri' },
  ]
  const toggle = (opt) => {
    const exists = evaluators.some(e => e.id === opt.id)
    onChange(exists ? evaluators.filter(e => e.id !== opt.id) : [...evaluators, opt])
  }
  return (
    <div className='space-y-1 min-w-[180px]'>
      <div className='flex flex-wrap gap-1'>
        {FIXED.map(opt => {
          const sel = evaluators.some(e => e.id === opt.id)
          return (
            <button key={opt.id} type='button' onClick={() => toggle(opt)}
              className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border transition
                ${sel ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 border-gray-200 hover:border-red-300'}`}>
              {opt.label}
            </button>
          )
        })}
        <select defaultValue='' onChange={e => {
          if (!e.target.value) return
          const emp = employees.find(em => String(em.id) === e.target.value)
          if (!emp) return
          const opt = { id: `emp:${emp.id}`, label: emp.name }
          if (!evaluators.some(x => x.id === opt.id)) onChange([...evaluators, opt])
          e.target.value = ''
        }} className='px-1.5 py-0.5 text-[10px] border border-gray-200 rounded outline-none bg-white'>
          <option value=''>+ Karyawan…</option>
          {employees.map(em => <option key={em.id} value={em.id}>{em.name}</option>)}
        </select>
      </div>
      {evaluators.length > 0 && (
        <div className='flex flex-wrap gap-1 mt-0.5'>
          {evaluators.map(e => (
            <span key={e.id} className='flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-red-50 text-red-700 rounded-full border border-red-100'>
              {e.label}
              <button type='button' onClick={() => onChange(evaluators.filter(x => x.id !== e.id))} className='ml-0.5 font-bold text-red-400 hover:text-red-600'>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const PROBATION_OPTIONS = ['0', '3', '6', '12']
const EMPLOYMENT_STATUS = ['New Hire', 'Existing Employee']

const BLANK_BUDDY = {
  buddyEmpId: '', buddyName: '', buddyPosition: '',
  programDuration: '', programDurationUnit: 'Bulan',
  programStartDate: '', programEndDate: '', hrbpNotes: '',
}

function calcEndDate(startDate, duration, unit) {
  if (!startDate || !duration) return ''
  const d = new Date(startDate)
  if (isNaN(d.getTime())) return ''
  const n = parseInt(duration, 10)
  if (isNaN(n) || n <= 0) return ''
  if (unit === 'Hari')   d.setDate(d.getDate() + n)
  if (unit === 'Minggu') d.setDate(d.getDate() + n * 7)
  if (unit === 'Bulan')  d.setMonth(d.getMonth() + n)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

const TYPE_LOV        = ['Manual Task','Video','Document (Attachment)','Report','Application Task','External URL','Electronic Signature','Questionnaire','Configurable Form','Learning Course']
const REVIEW_TYPE_LOV = ['Form Evaluation', 'Form Feedback', 'Configurable Form']

const STATUS_BADGE = {
  Draft:       'bg-gray-100 text-gray-600',
  Preparation: 'bg-indigo-100 text-indigo-700',
  Active:      'bg-blue-100 text-blue-700',
  Pending:     'bg-yellow-100 text-yellow-700',
  Approved:    'bg-green-100 text-green-700',
  Rejected:    'bg-red-100 text-red-700',
}

function toDateInput(val) {
  if (!val) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  const d = new Date(val)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

function InputCell({ value, onChange, placeholder = '', className = '', disabled = false, type = 'text' }) {
  const inputValue = type === 'date' ? toDateInput(value) : value
  return (
    <input
      type={type}
      value={inputValue}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-2 py-1 text-xs rounded outline-none
        ${disabled
          ? 'border-0 bg-transparent text-gray-700 cursor-default'
          : 'border border-gray-200 focus:border-red-400 bg-white'} ${className}`}
    />
  )
}

const EMPTY_FORM = {
  employeeId: '', employeeName: '', department: '',
  supervisorName: '', supervisorPosition: '',
  employmentStatus: 'New Hire', probationPeriod: '3',
  mainSections: [],
  reviewItems: null,
  hasilInductionChecked: false,
  buddyAssignment: { ...BLANK_BUDDY },
}

function migrateOnboarding(ob) {
  const copy = JSON.parse(JSON.stringify(ob))
  if (!copy.mainSections) {
    copy.mainSections = []
    if ((copy.generalItems ?? []).length > 0 || (copy.generalSections ?? []).length > 0) {
      copy.mainSections.push({
        id: 'ms_general', type: 'Onboarding General',
        sections: copy.generalSections ?? [],
        items:    copy.generalItems   ?? [],
      })
    }
    if ((copy.technicalItems ?? []).length > 0 || (copy.technicalSections ?? []).length > 0) {
      copy.mainSections.push({
        id: 'ms_technical', type: 'Onboarding Teknis',
        sections: copy.technicalSections ?? [],
        items:    copy.technicalItems    ?? [],
      })
    }
  }
  if (copy.reviewItems === undefined) copy.reviewItems = null
  // old format: reviewItems was [] (empty array) → treat as null (not added)
  if (Array.isArray(copy.reviewItems) && copy.reviewItems.length === 0 && !copy._hadReviewItems)
    copy.reviewItems = null
  return copy
}

export default function OnboardingTrackerPage() {
  const t                                           = useT()
  const { currentUser }                             = useAuthStore()
  const { employees }                               = useEmployeeStore()
  const { positions, departments, companies }        = useStructureStore()
  const { getLevelsForPage }                        = useWorkflowStore()
  const { onboardings, addOnboarding, updateOnboarding,
          deleteOnboarding, submitOnboarding,
          activateOnboarding }                       = useOnboardingStore()

  const { templates }  = useMasterOnboardingStore()
  const { forms: masterForms } = useMasterFormStore()
  const { batches }    = useCourseBatchStore()

  const [view,       setView      ] = useState('list')
  const [editId,     setEditId    ] = useState(null)
  const [viewOnly,   setViewOnly  ] = useState(false)
  const [msg,        setMsg       ] = useState(null)
  const [delId,      setDelId     ] = useState(null)
  const [perTypeTplId,   setPerTypeTplId ] = useState({})
  const [form,           setForm         ] = useState(null)
  const [autoAssignOpen, setAutoAssignOpen] = useState(false)
  const [autoAssignRows, setAutoAssignRows] = useState([])

  const flash = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3500)
  }

  const openNew = () => {
    setEditId(null)
    setForm(JSON.parse(JSON.stringify(EMPTY_FORM)))
    setView('form')
  }

  const openEdit = (ob) => {
    setEditId(ob.id)
    setForm(migrateOnboarding(ob))
    setViewOnly(false)
    setView('form')
  }

  const resolveDirectManager = (reviewItems, supervisor) =>
    (reviewItems ?? []).map(item =>
      item.isDirectManager
        ? { ...item,
            reviewerEmpId:    String(supervisor?.id ?? ''),
            reviewerName:     supervisor?.name ?? 'Direct Manager',
            reviewerPosition: supervisor ? `Position ${supervisor.positionId}` : '',
          }
        : item
    )

  const handleGenerateByType = (type) => {
    const tplId = perTypeTplId[type]
    if (!tplId) return
    const tpl = templates.find(t => String(t.id) === String(tplId))
    if (!tpl) return
    const addRuntime = (item) => ({ ...item, id: Math.random(), date: '', completed: false })

    if (type === 'Periodic Review') {
      const rawReview = (tpl.reviewItems ?? []).map(addRuntime)
      if (rawReview.length === 0) return
      setForm(f => {
        if (f.reviewItems !== null) return f
        const currentEmp = employees.find(e => e.id === Number(f.employeeId))
        const supervisor  = currentEmp ? employees.find(e => e.id === currentEmp.managerId) : null
        return { ...f, reviewItems: resolveDirectManager(rawReview, supervisor) }
      })
    } else {
      let ms = (tpl.mainSections ?? []).find(s => s.type === type)
      // Old format fallback
      if (!ms) {
        if (type === 'Onboarding General' && (tpl.generalItems ?? []).length > 0)
          ms = { type, sections: tpl.generalSections ?? [], items: tpl.generalItems ?? [] }
        else if (type === 'Onboarding Teknis' && (tpl.technicalItems ?? []).length > 0)
          ms = { type, sections: tpl.technicalSections ?? [], items: tpl.technicalItems ?? [] }
      }
      if (!ms) return
      const newSection = {
        ...ms,
        id:       `ms_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        sections: (ms.sections ?? []).map(s => ({ ...s })),
        items:    (ms.items    ?? []).map(addRuntime),
      }
      setForm(f => ({ ...f, mainSections: [...(f.mainSections ?? []), newSection] }))
    }
    setPerTypeTplId(prev => ({ ...prev, [type]: '' }))
  }

  const openAutoAssign = () => {
    const autoTemplates = templates.filter(tpl => tpl.active && tpl.autoAssign)
    if (autoTemplates.length === 0) {
      flash(t('Belum ada template dengan Auto Assign aktif. Aktifkan di Master Onboarding.', 'No templates with Auto Assign enabled. Enable it in Master Onboarding.'), 'error')
      return
    }
    const assignedEmpIds = new Set(onboardings.map(o => Number(o.employeeId)))
    const candidates = employees.filter(e =>
      e.status === 'Active' && !assignedEmpIds.has(e.id)
    )
    const rows = candidates.map(emp => {
      const dept = departments.find(d => d.id === emp.departmentId)
      const matched = autoTemplates.find(tpl => templateMatchesEmployee(tpl, emp))
      return { emp, dept, template: matched || null }
    }).filter(r => r.template !== null)
    setAutoAssignRows(rows)
    setAutoAssignOpen(true)
  }

  const runAutoAssign = () => {
    let count = 0
    autoAssignRows.forEach(({ emp, template }) => {
      addOnboarding(buildOnboardingFromTemplate(template, emp, employees))
      count++
    })
    setAutoAssignOpen(false)
    setAutoAssignRows([])
    flash(t(`${count} onboarding berhasil dibuat secara otomatis.`, `${count} onboarding records created automatically.`))
  }

  const handleEmployeeChange = (empId) => {
    const emp = employees.find(e => e.id === Number(empId))
    if (!emp) {
      setForm(f => ({ ...f, employeeId: empId, employeeName: '', department: '', supervisorName: '', supervisorPosition: '' }))
      return
    }
    const supervisor = employees.find(e => e.id === emp.managerId)
    setForm(f => {
      const buddy    = f.buddyAssignment ?? BLANK_BUDDY
      const startDate = emp.joinDate ? new Date(emp.joinDate).toISOString().slice(0, 10) : buddy.programStartDate
      const endDate   = calcEndDate(startDate, buddy.programDuration, buddy.programDurationUnit)
      return {
        ...f,
        employeeId:         emp.id,
        employeeName:       emp.name,
        department:         departments.find(d => d.id === emp.departmentId)?.name ?? '',
        supervisorName:     supervisor?.name ?? '',
        supervisorPosition: positions.find(p => p.id === supervisor?.positionId)?.name ?? '',
        buddyAssignment:    { ...buddy, programStartDate: startDate, programEndDate: endDate },
        reviewItems:        f.reviewItems !== null ? resolveDirectManager(f.reviewItems, supervisor) : null,
      }
    })
  }

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // ── Main Section item helpers ─────────────────────────────────────────────
  const updateMsItem = (msId, itemId, key, val) =>
    setForm(f => ({ ...f, mainSections: f.mainSections.map(ms => ms.id !== msId ? ms :
      { ...ms, items: ms.items.map(i => i.id === itemId ? { ...i, [key]: val } : i) }) }))
  const addMsItem = (msId, category) =>
    setForm(f => ({ ...f, mainSections: f.mainSections.map(ms => ms.id !== msId ? ms :
      { ...ms, items: [...ms.items, { id: Math.random(), module: '', type: '', link: '',
          date: '', mentorName: '', mentorPosition: '', mentorEmpId: '', completed: false,
          assignedTo: 'employee', category }] }) }))
  const delMsItem = (msId, itemId) =>
    setForm(f => ({ ...f, mainSections: f.mainSections.map(ms => ms.id !== msId ? ms :
      { ...ms, items: ms.items.filter(i => i.id !== itemId) }) }))
  const patchMsItem = (msId, itemId, patch) =>
    setForm(f => ({ ...f, mainSections: f.mainSections.map(ms => ms.id !== msId ? ms :
      { ...ms, items: ms.items.map(i => i.id === itemId ? { ...i, ...patch } : i) }) }))
  const addMsSection = (msId) =>
    setForm(f => ({ ...f, mainSections: f.mainSections.map(ms => ms.id !== msId ? ms :
      { ...ms, sections: [...ms.sections, { id: `sec_${Date.now()}`, label: '', labelEN: '', colorIdx: ms.sections.length % 6 }] }) }))
  const delMsSection = (msId, secId) =>
    setForm(f => ({ ...f, mainSections: f.mainSections.map(ms => ms.id !== msId ? ms :
      { ...ms, sections: ms.sections.filter(s => s.id !== secId), items: ms.items.filter(i => i.category !== secId) }) }))
  const updMsSection = (msId, secId, val) =>
    setForm(f => ({ ...f, mainSections: f.mainSections.map(ms => ms.id !== msId ? ms :
      { ...ms, sections: ms.sections.map(s => s.id === secId ? { ...s, label: val } : s) }) }))

  // ── Periodic Review helpers ───────────────────────────────────────────────
  const updateReview = (itemId, key, val) =>
    setForm(f => ({ ...f, reviewItems: (f.reviewItems ?? []).map(i => i.id === itemId ? { ...i, [key]: val } : i) }))
  const patchReview = (itemId, patch) =>
    setForm(f => ({ ...f, reviewItems: (f.reviewItems ?? []).map(i => i.id === itemId ? { ...i, ...patch } : i) }))
  const addReviewItem = () =>
    setForm(f => ({ ...f, reviewItems: [...(f.reviewItems ?? []), { id: Math.random(), agenda: '', type: '', date: '', reviewerEmpId: '', reviewerName: '', reviewerPosition: '', completed: false }] }))
  const delReviewItem = (itemId) =>
    setForm(f => ({ ...f, reviewItems: (f.reviewItems ?? []).filter(i => i.id !== itemId) }))

  // ── Buddy helper ─────────────────────────────────────────────────────────
  const patchBuddy = (patch) =>
    setForm(f => {
      const prev   = f.buddyAssignment ?? BLANK_BUDDY
      const merged = { ...prev, ...patch }
      return { ...f, buddyAssignment: merged }
    })

  const handleSaveDraft = () => {
    if (!form.employeeId) return flash(t('Pilih karyawan terlebih dahulu', 'Please select an employee'), 'error')
    if (editId) {
      updateOnboarding(editId, { ...form })
      flash(t('Draft berhasil disimpan', 'Draft saved'))
    } else {
      addOnboarding({ ...form })
      flash(t('Onboarding baru dibuat', 'New onboarding created'))
    }
    setView('list')
  }

  const handleSubmit = () => {
    if (!form.employeeId) return flash(t('Pilih karyawan terlebih dahulu', 'Please select an employee'), 'error')
    const levels = getLevelsForPage('Onboarding Tracker')
    if (editId) {
      updateOnboarding(editId, { ...form })
      submitOnboarding(editId, currentUser, levels)
      flash(t('Berhasil disubmit untuk approval', 'Submitted for approval'))
      setView('list')
    } else {
      // Add then immediately submit using the id returned by the store action
      const newId = addOnboarding({ ...form })
      if (newId) {
        submitOnboarding(newId, currentUser, levels)
        flash(t('Berhasil disubmit untuk approval', 'Submitted for approval'))
      } else {
        flash(t('Gagal membuat onboarding', 'Failed to create onboarding'), 'error')
      }
      setView('list')
    }
  }

  const handleSubmitExisting = (ob) => {
    if (ob.workflowStatus !== 'Draft') return
    const levels = getLevelsForPage('Onboarding Tracker')
    submitOnboarding(ob.id, currentUser, levels)
    flash(t('Berhasil disubmit untuk approval', 'Submitted for approval'))
  }

  const confirmDelete = () => {
    deleteOnboarding(delId)
    setDelId(null)
    flash(t('Data onboarding dihapus', 'Onboarding record deleted'))
  }

  // Auto-activate: move to useEffect to avoid side-effects during render
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    onboardings.forEach(ob => {
      if (ob.workflowStatus !== 'Preparation') return
      const emp = employees.find(e => e.id === Number(ob.employeeId))
      if (emp?.joinDate && String(emp.joinDate).slice(0, 10) <= today) {
        activateOnboarding(ob.id, null, 'System (Auto)')
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardings.map(o => o.id + o.workflowStatus).join(',')])

  // ── FORM VIEW ─────────────────────────────────────────────────────────────
  if (view === 'form' && form) {
    const savedStatus   = editId ? (onboardings.find(o => o.id === editId)?.workflowStatus ?? 'Draft') : 'Draft'
    // HRBP may edit the onboarding agenda in ANY status (Draft / Pending / Approved).
    // The form is only locked when explicitly opened in view-only mode.
    const isReadOnly    = viewOnly
    const showCompleted = viewOnly && savedStatus === 'Approved'
    const colSpanMain   = 9
    const colSpanRev    = 7

    const SEC_COLORS = [
      'bg-blue-50 text-blue-700 border-blue-400',
      'bg-red-50 text-red-700 border-red-400',
      'bg-amber-50 text-amber-700 border-amber-400',
      'bg-green-50 text-green-700 border-green-400',
      'bg-rose-50 text-rose-700 border-rose-400',
      'bg-teal-50 text-teal-700 border-teal-400',
    ]

    return (
      <div>
        {/* Page header */}
        <div className='flex items-center gap-3 mb-5'>
          <button onClick={() => setView('list')}
            className='text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1'>
            ← {t('Kembali', 'Back')}
          </button>
          <span className='text-gray-300'>|</span>
          <h1 className='text-xl font-bold text-gray-800'>
            {editId
              ? viewOnly ? t('Lihat Onboarding', 'View Onboarding') : t('Edit Onboarding', 'Edit Onboarding')
              : t('Onboarding Baru', 'New Onboarding')}
          </h1>
          {viewOnly && (
            <span className='text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full'>
              {t('Hanya Lihat', 'View Only')}
            </span>
          )}
        </div>

        {msg && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold
            ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
            <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{msg.text}</span>
          </div>
        )}


        {/* ── Form card ────────────────────────────────────────────── */}
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>

          {/* ── HEADER: Employee info ─────────────────────────────── */}
          <div style={{ background: BRAND_GRADIENT }} className='px-6 py-4'>
            <h2 className='text-sm font-bold text-white mb-3'>
              {t('FORMULIR ONBOARDING / INDUKSI KARYAWAN', 'EMPLOYEE ONBOARDING / INDUCTION FORM')}
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3'>

              {/* Row 1: Nama | Department */}
              <div className='flex items-center gap-2'>
                <span className='text-xs text-red-200 w-28 flex-shrink-0'>{t('Nama', 'Name')} :</span>
                <select value={form.employeeId}
                  onChange={e => handleEmployeeChange(e.target.value)}
                  disabled={isReadOnly}
                  className='flex-1 text-xs px-2 py-1 rounded border border-red-300 bg-white/10 text-white outline-none focus:border-white disabled:opacity-60'>
                  <option value='' className='text-gray-800'>{t('-- Pilih Karyawan --', '-- Select Employee --')}</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id} className='text-gray-800'>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-xs text-red-200 w-28 flex-shrink-0'>Department :</span>
                <input value={form.department} onChange={e => setField('department', e.target.value)}
                  disabled={isReadOnly}
                  className='flex-1 text-xs px-2 py-1 rounded border border-red-300 bg-white/10 text-white placeholder-red-300 outline-none focus:border-white disabled:opacity-60' />
              </div>

              {/* Row 2: Status | Masa Probation */}
              <div className='flex items-center gap-2'>
                <span className='text-xs text-red-200 w-28 flex-shrink-0'>{t('Status Karyawan', 'Employee Status')} :</span>
                <select value={form.employmentStatus} onChange={e => setField('employmentStatus', e.target.value)}
                  disabled={isReadOnly}
                  className='flex-1 text-xs px-2 py-1 rounded border border-red-300 bg-white/10 text-white outline-none focus:border-white disabled:opacity-60'>
                  {EMPLOYMENT_STATUS.map(s => <option key={s} value={s} className='text-gray-800'>{s}</option>)}
                </select>
              </div>

              <div className='flex items-center gap-2'>
                <span className='text-xs text-red-200 w-28 flex-shrink-0'>{t('Masa Probation/Orientasi', 'Probation Period')} :</span>
                <select value={form.probationPeriod} onChange={e => setField('probationPeriod', e.target.value)}
                  disabled={isReadOnly}
                  className='flex-1 text-xs px-2 py-1 rounded border border-red-300 bg-white/10 text-white outline-none focus:border-white disabled:opacity-60'>
                  {PROBATION_OPTIONS.map(p => (
                    <option key={p} value={p} className='text-gray-800'>{p} {t('Bulan', 'Month(s)')}</option>
                  ))}
                </select>
              </div>

              {/* Row 3: Atasan (full width) */}
              <div className='flex items-center gap-2 md:col-span-2'>
                <span className='text-xs text-red-200 w-28 flex-shrink-0'>{t('Nama / Posisi Atasan', 'Supervisor')} :</span>
                <div className='flex flex-1 gap-3'>
                  <input value={form.supervisorName} onChange={e => setField('supervisorName', e.target.value)}
                    placeholder={t('Nama Atasan', 'Supervisor Name')} disabled={isReadOnly}
                    className='flex-1 text-xs px-2 py-1 rounded border border-red-300 bg-white/10 text-white placeholder-red-300 outline-none focus:border-white disabled:opacity-60' />
                  <input value={form.supervisorPosition} onChange={e => setField('supervisorPosition', e.target.value)}
                    placeholder={t('Posisi Atasan', 'Supervisor Position')} disabled={isReadOnly}
                    className='flex-1 text-xs px-2 py-1 rounded border border-red-300 bg-white/10 text-white placeholder-red-300 outline-none focus:border-white disabled:opacity-60' />
                </div>
              </div>

            </div>
          </div>

          {/* ── Section builder (only for new/draft records) ── */}
          {!isReadOnly && (!editId || savedStatus === 'Draft') && (() => {
            const activeTemplates = templates.filter(tpl => tpl.active)
            const ALL_SECTION_TYPES = ['Onboarding General', 'Onboarding Teknis', 'Periodic Review']

            const tplsForType = (type) => {
              if (type === 'Periodic Review')
                return activeTemplates.filter(tpl => (tpl.reviewItems ?? []).length > 0)
              if (type === 'Onboarding General')
                return activeTemplates.filter(tpl =>
                  (tpl.mainSections ?? []).some(ms => ms.type === 'Onboarding General') ||
                  (tpl.generalItems ?? []).length > 0
                )
              if (type === 'Onboarding Teknis')
                return activeTemplates.filter(tpl =>
                  (tpl.mainSections ?? []).some(ms => ms.type === 'Onboarding Teknis') ||
                  (tpl.technicalItems ?? []).filter(ti => ti.category !== 'review').length > 0
                )
              return []
            }

            const addBlankSection = (type) => {
              if (type === 'Periodic Review') {
                setForm(f => f.reviewItems !== null ? f : {
                  ...f,
                  reviewItems: [{ id: Math.random(), agenda: '', type: '', date: '', reviewerEmpId: '', reviewerName: 'Direct Manager', reviewerPosition: '', completed: false, isDirectManager: true }],
                })
              } else {
                setForm(f => {
                  if ((f.mainSections ?? []).some(ms => ms.type === type)) return f
                  const newMs = { id: `ms_${Date.now()}`, type, sections: [], items: [] }
                  return { ...f, mainSections: [...(f.mainSections ?? []), newMs] }
                })
              }
            }

            return (
              <div className='px-6 py-4 border-b border-gray-100 bg-gray-50'>
                <div className='text-xs font-bold text-gray-500 uppercase tracking-wide mb-3'>
                  {t('Tambah Section', 'Add Section')}
                </div>
                <div className='space-y-2'>
                  {ALL_SECTION_TYPES.map(type => {
                    const alreadyAdded = type === 'Periodic Review'
                      ? form.reviewItems !== null
                      : (form.mainSections ?? []).some(ms => ms.type === type)
                    const tpls = tplsForType(type)
                    return (
                      <div key={type} className='flex items-center gap-3'>
                        <span className='text-xs font-semibold text-gray-700 w-52 flex-shrink-0'>{type}</span>
                        {alreadyAdded ? (
                          <span className='text-xs text-green-600 font-semibold flex items-center gap-1'>
                            ✓ {t('Sudah ditambahkan', 'Already added')}
                          </span>
                        ) : (
                          <>
                            {tpls.length > 0 && (
                              <>
                                <select
                                  value={perTypeTplId[type] || ''}
                                  onChange={e => setPerTypeTplId(prev => ({ ...prev, [type]: e.target.value }))}
                                  className='text-xs px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white flex-1 max-w-xs'>
                                  <option value=''>{t('-- Pilih Template (opsional) --', '-- Select Template (optional) --')}</option>
                                  {tpls.map(tpl => (
                                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleGenerateByType(type)}
                                  disabled={!perTypeTplId[type]}
                                  className='px-3 py-1.5 text-xs font-semibold rounded-lg text-white transition disabled:opacity-40 disabled:cursor-not-allowed'
                                  style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                                  + {t('Dari Template', 'From Template')}
                                </button>
                                <span className='text-xs text-gray-300'>atau</span>
                              </>
                            )}
                            <button
                              onClick={() => addBlankSection(type)}
                              className='px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-white transition'>
                              + {t('Kosong', 'Blank')}
                            </button>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* ── Dynamic Main Sections ─────────────────────────────── */}
          {form.employeeId && (form.mainSections ?? []).length === 0 && form.reviewItems === null && (
            <div className='px-6 py-8 text-center text-gray-400 text-sm'>
              {t('Belum ada agenda. Pilih template per tipe di atas untuk menambahkan section.', 'No agenda yet. Select a template per type above to add sections.')}
            </div>
          )}

          {(form.mainSections ?? []).map(ms => (
            <div key={ms.id} className='px-6 pt-5 pb-2'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <div className='w-1 h-5 rounded-full' style={{ background: 'linear-gradient(#8B1A1A,#D7252B)' }} />
                  <h3 className='text-sm font-bold text-gray-800'>{ms.type}</h3>
                </div>
                {!isReadOnly && (
                  <div className='flex items-center gap-2'>
                    <button onClick={() => addMsSection(ms.id)}
                      className='px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition'>
                      + {t('Tambah Section','Add Section')}
                    </button>
                    <button
                      onClick={() => { if (confirm(t(`Hapus section "${ms.type}"?`, `Remove "${ms.type}" section?`))) setForm(f => ({ ...f, mainSections: f.mainSections.filter(s => s.id !== ms.id) })) }}
                      className='px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition'>
                      🗑
                    </button>
                  </div>
                )}
              </div>
              <div className='overflow-x-auto rounded-lg border border-gray-200'>
                {(ms.sections ?? []).length === 0 ? (
                  <div className='px-6 py-6 text-center text-gray-400 text-sm'>
                    {t('Belum ada section. Klik "+ Tambah Section" untuk memulai.', 'No sections yet. Click "+ Add Section" to start.')}
                  </div>
                ) : (ms.sections ?? []).map(sec => {
                  const cls  = SEC_COLORS[sec.colorIdx % SEC_COLORS.length]
                  const rows = ms.items.filter(i => i.category === sec.id)
                  return (
                    <table key={sec.id} className='w-full text-xs border-b border-gray-100 last:border-b-0'>
                      <thead>
                        <tr style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                          {['NO', t('Tanggal','Date'), t('AGENDA [Module]','AGENDA [Module]'), 'Type', 'Link',
                            t('Nama Mentor','Mentor Name'), t('Posisi Mentor','Mentor Position'), t('Assignee','Assignee'),
                            showCompleted ? t('Completed','Completed') : ''].map((h, i) => (
                            <th key={i} className='text-left px-3 py-2 text-white font-semibold whitespace-nowrap'
                              style={{ minWidth: i===2?180 : i===4?160 : i===7?130 : i===8?36 : 70 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={cls.split(' ').filter(c=>c.startsWith('bg-')).join(' ')}>
                          <td colSpan={colSpanMain} className='px-3 py-2'>
                            <div className='flex items-center justify-between gap-3'>
                              {isReadOnly
                                ? <span className={`text-xs font-semibold ${cls.split(' ').filter(c=>c.startsWith('text-')).join(' ')}`}>{sec.label}</span>
                                : <input value={sec.label} onChange={e => updMsSection(ms.id, sec.id, e.target.value)}
                                    placeholder={t('Nama section…','Section name…')}
                                    className={`text-xs font-semibold bg-transparent border-0 outline-none ${cls.split(' ').filter(c=>c.startsWith('text-')).join(' ')} flex-1 min-w-0`} />
                              }
                              {!isReadOnly && (
                                <div className='flex items-center gap-2 flex-shrink-0'>
                                  <button onClick={() => addMsItem(ms.id, sec.id)}
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${cls.split(' ').filter(c=>c.startsWith('text-')||c.startsWith('border-')).join(' ')} hover:bg-white/60`}>
                                    + {t('Tambah','Add')}
                                  </button>
                                  <button onClick={() => delMsSection(ms.id, sec.id)}
                                    className='text-red-400 hover:text-red-600 text-sm font-bold transition leading-none'>✕</button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                        {rows.map((item, idx) => (
                          <React.Fragment key={item.id}>
                          <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                            <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8'>{idx + 1}</td>
                            <td className='px-2 py-1.5 w-28'>
                              <InputCell value={item.date || ''} onChange={v => updateMsItem(ms.id, item.id, 'date', v)} type='date' disabled={isReadOnly} />
                            </td>
                            <td className='px-2 py-1.5'>
                              <InputCell value={item.module || ''} onChange={v => updateMsItem(ms.id, item.id, 'module', v)} disabled={isReadOnly} />
                            </td>
                            <td className='px-2 py-1.5 w-36'>
                              {isReadOnly
                                ? <span className='text-xs text-gray-600'>{item.type || '—'}</span>
                                : <select value={item.type || ''} onChange={e => patchMsItem(ms.id, item.id, { type: e.target.value, link: '' })}
                                    className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white'>
                                    <option value=''>— Pilih —</option>
                                    {TYPE_LOV.map(o => <option key={o} value={o}>{o}</option>)}
                                  </select>
                              }
                            </td>
                            <td className='px-2 py-1.5'>
                              {isReadOnly
                                ? <span className='text-xs text-gray-600'>{item.link || '—'}</span>
                                : item.type === 'Learning Course'
                                  ? <select value={item.link || ''} onChange={e => updateMsItem(ms.id, item.id, 'link', e.target.value)}
                                      className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white min-w-[180px]'>
                                      <option value=''>— Pilih Batch —</option>
                                      {batches.map(b => <option key={b.id} value={b.batch_name}>{b.batch_name}</option>)}
                                    </select>
                                  : <InputCell value={item.link || ''} onChange={v => updateMsItem(ms.id, item.id, 'link', v)} placeholder='https://…' />
                              }
                            </td>
                            <td className='px-2 py-1.5 w-36'>
                              {isReadOnly
                                ? <span className='text-xs text-gray-600'>{item.mentorName || '—'}</span>
                                : <select value={item.mentorEmpId || ''} onChange={e => {
                                    const emp = employees.find(em => em.id === Number(e.target.value))
                                    const pos = positions.find(p => p.id === emp?.positionId)
                                    patchMsItem(ms.id, item.id, { mentorEmpId: e.target.value, mentorName: emp?.name ?? '', mentorPosition: pos?.name ?? '' })
                                  }}
                                    className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white min-w-[130px]'>
                                    <option value=''>— Pilih Mentor —</option>
                                    {employees.map(em => <option key={em.id} value={em.id}>{em.name}</option>)}
                                  </select>
                              }
                            </td>
                            <td className='px-2 py-1.5 w-28 text-gray-600 text-xs'>{item.mentorPosition || '—'}</td>
                            <td className='px-2 py-1.5 w-36'>
                              {isReadOnly
                                ? <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${assigneeBadgeCls(item.assignedTo)}`}>
                                    {assigneeLabel(item.assignedTo, employees)}
                                  </span>
                                : <select value={item.assignedTo || 'self'}
                                    onChange={e => updateMsItem(ms.id, item.id, 'assignedTo', e.target.value)}
                                    className={`px-2 py-1 text-xs border rounded outline-none focus:border-red-400 w-full font-semibold ${assigneeBadgeCls(item.assignedTo || 'self')}`}>
                                    <option value='self'>Self (Karyawan)</option>
                                    <option value='manager'>Manager Langsung</option>
                                    {employees.length > 0 && <option disabled>──────────────</option>}
                                    {employees.map(e => <option key={e.id} value={`emp:${e.id}`}>{e.name}</option>)}
                                  </select>
                              }
                            </td>
                            <td className='px-2 py-1.5 w-9 text-center'>
                              {showCompleted
                                ? <input type='checkbox' checked={!!item.completed} readOnly disabled className='w-4 h-4 accent-red-600 opacity-60 cursor-default' />
                                : !isReadOnly && <button onClick={() => delMsItem(ms.id, item.id)} className='text-red-400 hover:text-red-600 text-sm font-bold transition'>✕</button>
                              }
                            </td>
                          </tr>
                          {item.type === 'Configurable Form' && !isReadOnly && (
                            <tr>
                              <td colSpan={9} className='px-2 pb-2'>
                                <FormPickerPanel item={item} masterForms={masterForms}
                                  onChange={patch => patchMsItem(ms.id, item.id, patch)} />
                              </td>
                            </tr>
                          )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  )
                })}
              </div>
            </div>
          ))}

          {/* ── Periodic Review (only when added via template) ─────── */}
          {form.reviewItems !== null && (
            <div className='px-6 pt-5 pb-2'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <div className='w-1 h-5 rounded-full' style={{ background: 'linear-gradient(#8B1A1A,#D7252B)' }} />
                  <h3 className='text-sm font-bold text-gray-800'>{t('Periodic Review', 'Periodic Review')}</h3>
                </div>
                {!isReadOnly && (
                  <div className='flex items-center gap-2'>
                    <button onClick={addReviewItem}
                      className='px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition'>
                      + {t('Tambah','Add')}
                    </button>
                    <button
                      onClick={() => { if (confirm(t('Hapus Periodic Review?','Remove Periodic Review?'))) setForm(f => ({ ...f, reviewItems: null })) }}
                      className='px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition'>
                      🗑
                    </button>
                  </div>
                )}
              </div>
              <div className='overflow-x-auto rounded-lg border border-gray-200'>
                <table className='w-full text-xs'>
                  <thead>
                    <tr style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                      {['NO', t('Tanggal','Date'), t('Agenda','Agenda'), 'Type',
                        t('Evaluators','Evaluators'),
                        showCompleted ? t('Completed','Completed') : ''].map((h, i) => (
                        <th key={i} className='text-left px-3 py-2 text-white font-semibold whitespace-nowrap'
                          style={{ minWidth: i===2?200 : i===5?36 : i===4?200 : 70 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(form.reviewItems ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className='px-6 py-6 text-center text-gray-400 text-sm'>
                          {t('Belum ada baris. Klik "+ Tambah" untuk menambahkan.', 'No rows yet. Click "+ Add" to start.')}
                        </td>
                      </tr>
                    ) : (form.reviewItems ?? []).map((item, idx) => (
                      <React.Fragment key={item.id}>
                        <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                          <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8'>{idx + 1}</td>
                          <td className='px-2 py-1.5 w-28'>
                            <InputCell value={item.date || ''} onChange={v => updateReview(item.id, 'date', v)} type='date' disabled={isReadOnly} />
                          </td>
                          <td className='px-2 py-1.5'>
                            {isReadOnly
                              ? <span className='text-xs text-gray-600'>{item.agenda || '—'}</span>
                              : <InputCell value={item.agenda || ''} onChange={v => updateReview(item.id, 'agenda', v)} placeholder={t('Agenda…','Agenda…')} />
                            }
                          </td>
                          <td className='px-2 py-1.5 w-36'>
                            {isReadOnly
                              ? <span className='text-xs text-gray-600'>{item.type || '—'}</span>
                              : <select value={item.type || ''} onChange={e => patchReview(item.id, { type: e.target.value, masterFormId: null, formSchema: [], formType: null, evalMethod: null, evalTopics: [], ojtParams: [] })}
                                  className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white min-w-[140px]'>
                                  <option value=''>— Pilih —</option>
                                  {REVIEW_TYPE_LOV.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            }
                          </td>
                          <td className='px-2 py-1.5'>
                            {isReadOnly ? (
                              <div className='flex flex-wrap gap-1'>
                                {(item.evaluators ?? []).length === 0
                                  ? <span className='text-xs text-gray-400'>—</span>
                                  : (item.evaluators ?? []).map(e => (
                                    <span key={e.id} className='text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full'>{e.label}</span>
                                  ))
                                }
                                {(item.formSubmissions ?? []).length > 0 && (
                                  <span className='text-[10px] text-green-600 ml-1'>
                                    ✓ {(item.formSubmissions ?? []).length}/{(item.evaluators ?? []).length || '?'}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <EvaluatorPicker
                                evaluators={item.evaluators ?? []}
                                employees={employees}
                                onChange={v => patchReview(item.id, { evaluators: v })} />
                            )}
                          </td>
                          <td className='px-2 py-1.5 w-9 text-center'>
                            {showCompleted
                              ? <input type='checkbox' checked={!!item.completed} readOnly disabled className='w-4 h-4 accent-red-600 opacity-60 cursor-default' />
                              : !isReadOnly && <button onClick={() => delReviewItem(item.id)} className='text-red-400 hover:text-red-600 text-sm font-bold transition'>✕</button>
                            }
                          </td>
                        </tr>
                        {item.type === 'Configurable Form' && !isReadOnly && (
                          <tr>
                            <td colSpan={6} className='px-2 pb-2'>
                              <FormPickerPanel item={item} masterForms={masterForms}
                                onChange={patch => patchReview(item.id, patch)} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Assign Buddy ─────────────────────────────────────────── */}
          <div className='px-6 pt-5 pb-4'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-1 h-5 rounded-full' style={{ background: 'linear-gradient(#8B1A1A,#D7252B)' }} />
              <h3 className='text-sm font-bold text-gray-800'>👥 {t('Assign Buddy','Assign Buddy')}</h3>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-white rounded-xl border border-gray-200 p-5'>

              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Buddy Name','Buddy Name')}</label>
                <select
                  value={form.buddyAssignment?.buddyEmpId || ''}
                  onChange={e => {
                    const emp = employees.find(em => em.id === Number(e.target.value))
                    const pos = positions.find(p => p.id === emp?.positionId)
                    patchBuddy({ buddyEmpId: e.target.value, buddyName: emp?.name ?? '', buddyPosition: pos?.name ?? '' })
                  }}
                  disabled={isReadOnly}
                  className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400'>
                  <option value=''>— {t('Pilih Buddy','Select Buddy')} —</option>
                  {employees.map(em => (
                    <option key={em.id} value={em.id}>{em.nik ? em.nik : `#${em.id}`} — {em.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Buddy Program Duration','Buddy Program Duration')}</label>
                <div className='flex gap-2'>
                  <input type='number' min={1}
                    value={form.buddyAssignment?.programDuration || ''}
                    onChange={e => {
                      const dur = e.target.value
                      patchBuddy({ programDuration: dur, programEndDate: calcEndDate(form.buddyAssignment?.programStartDate, dur, form.buddyAssignment?.programDurationUnit || 'Bulan') })
                    }}
                    disabled={isReadOnly}
                    placeholder='e.g. 3'
                    className='w-24 px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50' />
                  <select
                    value={form.buddyAssignment?.programDurationUnit || 'Bulan'}
                    onChange={e => {
                      const unit = e.target.value
                      patchBuddy({ programDurationUnit: unit, programEndDate: calcEndDate(form.buddyAssignment?.programStartDate, form.buddyAssignment?.programDuration, unit) })
                    }}
                    disabled={isReadOnly}
                    className='flex-1 px-2 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none bg-white disabled:bg-gray-50'>
                    <option value='Hari'>{t('Hari','Days')}</option>
                    <option value='Minggu'>{t('Minggu','Weeks')}</option>
                    <option value='Bulan'>{t('Bulan','Months')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Program Start Date','Program Start Date')}</label>
                <input type='date'
                  value={form.buddyAssignment?.programStartDate || ''}
                  onChange={e => {
                    const sd = e.target.value
                    patchBuddy({ programStartDate: sd, programEndDate: calcEndDate(sd, form.buddyAssignment?.programDuration, form.buddyAssignment?.programDurationUnit || 'Bulan') })
                  }}
                  disabled={isReadOnly}
                  className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50' />
                <p className='text-[10px] text-gray-400 mt-1'>({t("Auto-defaults to New Hire's Join Date","Auto-defaults to New Hire's Join Date")})</p>
              </div>

              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Program End Date','Program End Date')}</label>
                <input type='date'
                  value={form.buddyAssignment?.programEndDate || ''}
                  onChange={e => patchBuddy({ programEndDate: e.target.value })}
                  disabled={isReadOnly}
                  className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none bg-gray-50 disabled:bg-gray-100' />
                <p className='text-[10px] text-gray-400 mt-1'>({t('Auto-Calculates','Auto-Calculates')})</p>
              </div>

              <div className='md:col-span-2'>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('HRBP Special Instructions / Notes:','HRBP Special Instructions / Notes:')}</label>
                <textarea rows={3}
                  value={form.buddyAssignment?.hrbpNotes || ''}
                  onChange={e => patchBuddy({ hrbpNotes: e.target.value })}
                  disabled={isReadOnly}
                  placeholder={t('Type here','Type here')}
                  className='w-full px-3 py-2 text-xs rounded border border-gray-200 focus:border-red-400 outline-none resize-none disabled:bg-gray-50' />
              </div>

            </div>
          </div>

          {/* ── Actions ─────────────────────────────────────────────── */}
          {viewOnly ? (
            <div className='px-6 pb-6 flex gap-3'>
              <button onClick={() => { setViewOnly(false); setView('list') }}
                className='px-5 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition'>
                ← {t('Kembali', 'Back')}
              </button>
            </div>
          ) : (
            <div className='px-6 pb-6'>
              {savedStatus === 'Preparation' && (
                <div className='mb-3 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5 text-xs text-indigo-700 flex items-center justify-between gap-3'>
                  <span>🔧 {t('Fase Persiapan — karyawan belum bisa melihat task. Aktifkan saat join date tiba atau klik tombol di bawah.',
                    'Preparation phase — employee cannot see tasks yet. Activate on join date or click below.')}</span>
                  <button onClick={() => { activateOnboarding(editId, currentUser?.id, currentUser?.name); flash(t('Onboarding diaktifkan.','Onboarding activated.')) }}
                    className='flex-shrink-0 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition'>
                    🚀 {t('Aktifkan Sekarang','Activate Now')}
                  </button>
                </div>
              )}
              {savedStatus === 'Pending' && (
                <div className='mb-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-xs text-amber-700'>
                  {t('Form ini sedang dalam proses approval. Perubahan yang Anda simpan akan ikut terlihat oleh approver.',
                     'This form is pending approval. Any changes you save will be visible to the approver.')}
                </div>
              )}
              {savedStatus === 'Active' && (
                <div className='mb-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-xs text-blue-700'>
                  🚀 {t('Onboarding sedang berjalan. Karyawan sudah dapat melihat dan mengerjakan task.',
                    'Onboarding is active. Employee can now see and complete their tasks.')}
                </div>
              )}
              <div className='flex gap-3'>
                <ActionButton variant='secondary' icon='💾' onClick={handleSaveDraft}>
                  {savedStatus === 'Draft' ? t('Simpan Draft', 'Save Draft') : t('Simpan', 'Save')}
                </ActionButton>
                {savedStatus === 'Draft' && (
                  <ActionButton icon='📤' onClick={handleSubmit}>
                    {t('Submit untuk Approval', 'Submit for Approval')}
                  </ActionButton>
                )}
                <button onClick={() => setView('list')}
                  className='px-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition ml-auto'>
                  {t('Batal', 'Cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────

  const kpis = {
    total:       onboardings.length,
    preparation: onboardings.filter(o => o.workflowStatus === 'Preparation').length,
    active:      onboardings.filter(o => o.workflowStatus === 'Active').length,
    draft:       onboardings.filter(o => o.workflowStatus === 'Draft').length,
  }

  return (
    <div>
      <PageHeader
        icon='🚀'
        title={t('Onboarding Tracker', 'Onboarding Tracker')}
        subtitle={t('Kelola dan pantau proses onboarding/induksi karyawan baru.', 'Manage and monitor the onboarding/induction process for new employees.')}
        actions={
          <div className='flex gap-2'>
            <button onClick={openAutoAssign}
              className='px-4 py-2 text-sm font-semibold rounded-xl border border-violet-300 text-violet-700 hover:bg-violet-50 transition'>
              ⚡ {t('Auto Assign', 'Auto Assign')}
            </button>
            <ActionButton icon='+' onClick={openNew}>
              {t('Onboarding Manual', 'Manual Onboarding')}
            </ActionButton>
          </div>
        }
      />

      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <StatCard label={t('Total', 'Total')} value={kpis.total} icon='📋' tone='brand' />
        <StatCard label={t('Persiapan', 'Preparation')} value={kpis.preparation} icon='🔧' tone='gray' />
        <StatCard label={t('Aktif', 'Active')} value={kpis.active} icon='🚀' tone='orange' />
        <StatCard label={t('Draft', 'Draft')} value={kpis.draft} icon='📝' tone='gray' />
      </div>

      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold
          ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      {onboardings.length === 0 ? (
        <EmptyState
          icon='🚀'
          title={t('Belum ada data onboarding.', 'No onboarding records yet.')}
          description={t('Buat onboarding pertama untuk memulai.', 'Create your first onboarding to get started.')}
          action={<ActionButton size='sm' icon='+' onClick={openNew}>{t('Onboarding Manual', 'Manual Onboarding')}</ActionButton>}
        />
      ) : (
        <DataTable
          columns={[
            { label: t('Karyawan','Employee') },
            { label: 'Department' },
            { label: t('Status Karyawan','Employment Status') },
            { label: t('Masa Probasi','Probation') },
            { label: t('Atasan','Supervisor') },
            { label: t('Status Workflow','Workflow Status') },
            { label: t('Sumber','Source') },
            { label: t('Tanggal Dibuat','Created') },
            { label: t('Aksi','Action'), align: 'right' },
          ]}
        >
          {onboardings.map(ob => (
            <Tr key={ob.id}>
              <Td className='font-medium text-gray-800'>{ob.employeeName || '—'}</Td>
              <Td>{ob.department || '—'}</Td>
              <Td>
                <StatusBadge tone='info'>{ob.employmentStatus}</StatusBadge>
              </Td>
              <Td>{ob.probationPeriod} {t('bln','mo')}</Td>
              <Td>{ob.supervisorName || '—'}</Td>
              <Td>
                <StatusBadge status={ob.workflowStatus} />
              </Td>
              <Td>
                {ob.createdVia === 'auto-assign'
                  ? <span className='text-xs bg-violet-50 text-violet-700 font-semibold px-2 py-0.5 rounded-full'>⚡ Auto</span>
                  : <span className='text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full'>✏️ Manual</span>
                }
              </Td>
              <Td className='text-gray-500 text-xs'>
                {ob.createdAt ? new Date(ob.createdAt).toLocaleDateString('id-ID') : '—'}
              </Td>
              <Td align='right'>
                <div className='flex gap-2 justify-end flex-wrap'>
                  <button onClick={() => openEdit(ob)}
                    className='px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                    ✏️ {t('Edit','Edit')}
                  </button>
                  {ob.workflowStatus === 'Preparation' && (() => {
                    const emp = employees.find(e => e.id === Number(ob.employeeId))
                    const joinDate = emp?.joinDate ? String(emp.joinDate).slice(0, 10) : null
                    return (
                      <button onClick={() => activateOnboarding(ob.id, currentUser?.id, currentUser?.name)}
                        className='px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition'>
                        🚀 {t('Aktifkan','Activate')}
                        {joinDate && <span className='ml-1 text-indigo-400'>({joinDate})</span>}
                      </button>
                    )
                  })()}
                  {ob.workflowStatus === 'Draft' && (
                    <button onClick={() => handleSubmitExisting(ob)}
                      className='px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition'>
                      📤 {t('Submit','Submit')}
                    </button>
                  )}
                  {(ob.workflowStatus === 'Draft' || ob.workflowStatus === 'Preparation') && (
                    <button onClick={() => setDelId(ob.id)}
                      className='px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition'>
                      🗑
                    </button>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </DataTable>
      )}

      {delId && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'
          onClick={() => setDelId(null)}>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-80' onClick={e => e.stopPropagation()}>
            <h3 className='text-base font-bold text-gray-800 mb-2'>{t('Hapus Onboarding?','Delete Onboarding?')}</h3>
            <p className='text-sm text-gray-500 mb-5'>{t('Data ini akan dihapus permanen dan tidak dapat dikembalikan.','This record will be permanently deleted.')}</p>
            <div className='flex gap-3'>
              <button onClick={confirmDelete}
                className='flex-1 py-2 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition'>
                {t('Hapus','Delete')}
              </button>
              <button onClick={() => setDelId(null)}
                className='flex-1 py-2 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                {t('Batal','Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Auto Assign Modal ── */}
      {autoAssignOpen && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
          onClick={() => setAutoAssignOpen(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col'
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0'>
              <div>
                <h2 className='text-base font-bold text-gray-800'>⚡ {t('Auto Assign Onboarding','Auto Assign Onboarding')}</h2>
                <p className='text-xs text-gray-400 mt-0.5'>
                  {autoAssignRows.length === 0
                    ? t('Semua karyawan aktif sudah memiliki onboarding atau tidak ada template yang cocok.', 'All active employees already have onboarding or no matching template found.')
                    : t(`${autoAssignRows.length} karyawan akan dibuatkan onboarding secara otomatis.`, `${autoAssignRows.length} employees will be assigned onboarding automatically.`)}
                </p>
              </div>
              <button onClick={() => setAutoAssignOpen(false)} className='text-gray-400 hover:text-gray-600 text-lg'>✕</button>
            </div>

            {/* Body */}
            <div className='flex-1 overflow-y-auto px-6 py-4'>
              {autoAssignRows.length === 0 ? (
                <div className='text-center py-10 text-gray-400 text-sm'>
                  {t('Tidak ada karyawan yang perlu di-assign.', 'No employees need to be assigned.')}
                </div>
              ) : (
                <table className='w-full text-xs'>
                  <thead>
                    <tr className='border-b border-gray-100'>
                      <th className='text-left py-2 px-2 font-semibold text-gray-500'>Karyawan</th>
                      <th className='text-left py-2 px-2 font-semibold text-gray-500'>Department</th>
                      <th className='text-left py-2 px-2 font-semibold text-gray-500'>{t('Tipe','Type')}</th>
                      <th className='text-left py-2 px-2 font-semibold text-gray-500'>Template</th>
                    </tr>
                  </thead>
                  <tbody>
                    {autoAssignRows.map(({ emp, dept, template }) => (
                      <tr key={emp.id} className='border-b border-gray-50 hover:bg-gray-50'>
                        <td className='py-2 px-2'>
                          <div className='font-semibold text-gray-800'>{emp.name}</div>
                          <div className='text-gray-400'>{emp.nik}</div>
                        </td>
                        <td className='py-2 px-2 text-gray-600'>{dept?.name || '—'}</td>
                        <td className='py-2 px-2'>
                          <span className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs'>{emp.employmentType || '—'}</span>
                        </td>
                        <td className='py-2 px-2'>
                          <span className='px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-full'>{template.name}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            {autoAssignRows.length > 0 && (
              <div className='px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0'>
                <button onClick={runAutoAssign}
                  className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition'
                  style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                  ⚡ {t(`Buat ${autoAssignRows.length} Onboarding`, `Create ${autoAssignRows.length} Onboarding Records`)}
                </button>
                <button onClick={() => setAutoAssignOpen(false)}
                  className='px-6 py-2.5 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                  {t('Batal','Cancel')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
