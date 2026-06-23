'use client'
import React, { useState } from 'react'
import { useMasterOnboardingStore } from '@/store/masterOnboardingStore'
import { useMasterFormStore }       from '@/store/masterFormStore'
import { useEmployeeStore }         from '@/store/employeeStore'
import { useStructureStore }        from '@/store/structureStore'
import { useCourseBatchStore }      from '@/store/courseBatchStore'
import { useT }                     from '@/store/languageStore'
import { EMP_TYPES }                from '@/utils/constants'
import { PageHeader, SectionCard, DataTable, Tr, Td, StatusBadge, ActionButton, EmptyState, BRAND_GRADIENT } from '@/components/ui'
import { assigneeLabel, assigneeBadgeCls } from '@/utils/assigneeUtils'
import { FIELD_TYPES, newField } from '@/utils/formBuilderUtils'

// ── Form Picker Panel (for rows with type = Configurable Form) ────────────────
function FormPickerPanel({ row, masterForms, onChange }) {
  const [mode, setMode] = useState(row.masterFormId ? 'library' : (row.formSchema?.length > 0 ? 'custom' : 'library'))
  const activeForms = masterForms.filter(f => f.active)

  const pickLibrary = (formId) => {
    const mf = masterForms.find(f => f.id === Number(formId))
    onChange({ masterFormId: mf ? mf.id : null, formSchema: mf ? mf.fields : [] })
  }
  const addField  = () => onChange({ formSchema: [...(row.formSchema ?? []), newField()] })
  const delField  = (id) => onChange({ formSchema: (row.formSchema ?? []).filter(f => f.id !== id) })
  const updField  = (id, key, val) => onChange({ formSchema: (row.formSchema ?? []).map(f => f.id === id ? { ...f, [key]: val } : f) })
  const moveField = (idx, dir) => {
    const arr = [...(row.formSchema ?? [])]; const swp = idx + dir
    if (swp < 0 || swp >= arr.length) return
    ;[arr[idx], arr[swp]] = [arr[swp], arr[idx]]; onChange({ formSchema: arr })
  }

  return (
    <div className='mt-2 mb-1 ml-8 mr-2 rounded-lg border border-dashed border-red-200 bg-red-50/40 p-3'>
      <div className='flex items-center gap-3 mb-3'>
        <span className='text-xs font-bold text-red-700'>⚙ Form Fields</span>
        <div className='flex rounded-lg overflow-hidden border border-red-200 text-xs'>
          <button onClick={() => setMode('library')}
            className={`px-2.5 py-1 font-semibold transition ${mode === 'library' ? 'bg-red-600 text-white' : 'bg-white text-red-600 hover:bg-red-50'}`}>
            Dari Library
          </button>
          <button onClick={() => setMode('custom')}
            className={`px-2.5 py-1 font-semibold transition ${mode === 'custom' ? 'bg-red-600 text-white' : 'bg-white text-red-600 hover:bg-red-50'}`}>
            Custom
          </button>
        </div>
      </div>

      {mode === 'library' ? (
        <div>
          {activeForms.length === 0
            ? <p className='text-xs text-gray-400 italic'>Belum ada form di library. Buat di menu <strong>Master Form</strong>.</p>
            : <select value={row.masterFormId ?? ''}
                onChange={e => pickLibrary(e.target.value)}
                className='w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                <option value=''>— Pilih Form dari Library —</option>
                {activeForms.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({(f.fields ?? []).length} field)</option>
                ))}
              </select>
          }
          {row.masterFormId && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {(row.formSchema ?? []).map(f => (
                <span key={f.id} className='text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600'>
                  {f.label || f.type}{f.required ? ' *' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className='flex justify-end mb-2'>
            <button onClick={addField}
              className='text-xs px-2.5 py-1 rounded border border-red-300 text-red-600 hover:bg-red-100 font-semibold transition'>
              + Tambah Field
            </button>
          </div>
          {(row.formSchema ?? []).length === 0 && (
            <p className='text-xs text-gray-400 italic text-center py-2'>Belum ada field.</p>
          )}
          <div className='space-y-2'>
            {(row.formSchema ?? []).map((f, idx) => (
              <div key={f.id} className='flex items-start gap-2 bg-white rounded border border-gray-200 px-2 py-1.5'>
                <div className='flex flex-col gap-0.5 pt-0.5'>
                  <button onClick={() => moveField(idx, -1)} disabled={idx === 0} className='text-[10px] text-gray-400 hover:text-gray-600 disabled:opacity-30 leading-none'>▲</button>
                  <button onClick={() => moveField(idx, 1)} disabled={idx === (row.formSchema ?? []).length - 1} className='text-[10px] text-gray-400 hover:text-gray-600 disabled:opacity-30 leading-none'>▼</button>
                </div>
                <div className='flex-1 grid grid-cols-1 md:grid-cols-4 gap-1.5'>
                  <input value={f.label} onChange={e => updField(f.id, 'label', e.target.value)} placeholder='Label field…'
                    className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 md:col-span-2' />
                  <select value={f.type} onChange={e => updField(f.id, 'type', e.target.value)}
                    className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white'>
                    {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <div className='flex items-center gap-2'>
                    <label className='flex items-center gap-1 text-xs text-gray-600 cursor-pointer'>
                      <input type='checkbox' checked={!!f.required} onChange={e => updField(f.id, 'required', e.target.checked)} className='w-3 h-3 accent-red-600' />Wajib
                    </label>
                    <button onClick={() => delField(f.id)} className='ml-auto text-red-400 hover:text-red-600 text-sm font-bold'>✕</button>
                  </div>
                  {(f.type === 'dropdown' || f.type === 'radio') && (
                    <input value={f.options || ''} onChange={e => updField(f.id, 'options', e.target.value)}
                      placeholder='Opsi dipisah koma: A, B, C'
                      className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 md:col-span-4' />
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

// ── Row factory helpers ───────────────────────────────────────────────────────
const newG = (category) => ({ id: Math.random(), module: '', type: '', link: '', mentorEmpId: '', mentorName: '', mentorPosition: '', assignedTo: 'employee', category })
const newT = (category) => ({ id: Math.random(), module: '', type: '', link: '', category, mentorEmpId: '', mentorName: '', mentorPosition: '', assignedTo: 'employee' })
const newR = () => ({ id: Math.random(), agenda: '', type: '', reviewerEmpId: '', reviewerName: '', reviewerPosition: '' })

const REVIEW_TYPE_LOV = ['Form Evaluation', 'Form Feedback']

const TYPE_LOV = [
  'Manual Task',
  'Video',
  'Document (Attachment)',
  'Report',
  'Application Task',
  'External URL',
  'Electronic Signature',
  'Questionnaire',
  'Configurable Form',
  'Learning Course',
]

const SEC_COLORS = [
  { rowCls: 'bg-blue-50',   textCls: 'text-blue-700',   borderCls: 'border-blue-400'   },
  { rowCls: 'bg-red-50', textCls: 'text-red-700', borderCls: 'border-red-400' },
  { rowCls: 'bg-amber-50',  textCls: 'text-amber-700',  borderCls: 'border-amber-400'  },
  { rowCls: 'bg-green-50',  textCls: 'text-green-700',  borderCls: 'border-green-400'  },
  { rowCls: 'bg-rose-50',   textCls: 'text-rose-700',   borderCls: 'border-rose-400'   },
  { rowCls: 'bg-teal-50',   textCls: 'text-teal-700',   borderCls: 'border-teal-400'   },
]


const DEFAULT_REVIEW_ITEMS = [
  { id: 'review_direct_manager', agenda: 'Probation Evaluation', type: 'Form Evaluation', reviewerEmpId: '', reviewerName: 'Direct Manager', reviewerPosition: '', isDirectManager: true },
]

const MAIN_SECTION_TYPES = ['Materi Induksi General', 'Materi Induksi Teknis', 'Periodic Review']

const EMPTY_FORM = {
  name: '', description: '', active: true,
  mainSections: [],
  reviewItems: null,
  reviewSections: [],
  autoAssign: false,
  criteria: { employmentTypes: [], departmentIds: [], companyIds: [], positionIds: [] },
}

// ── Criteria pill (Auto-Assign rule selector) ─────────────────────────────────
function CriteriaPill({ label, active, onClick }) {
  return (
    <button type='button' onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition
        ${active ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'}`}>
      {label}
    </button>
  )
}

// ── Inline editable cell ──────────────────────────────────────────────────────
function IC({ value, onChange, placeholder = '', wide = false }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={`px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white w-full ${wide ? 'min-w-[160px]' : ''}`} />
  )
}

// ── Select cell for Type LOV ──────────────────────────────────────────────────
function SC({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white w-full min-w-[160px]'>
      <option value=''>— {TYPE_LOV[0].split(' ')[0]}…</option>
      {TYPE_LOV.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  )
}

// ── Link cell: LOV Batch when type = 'Learning Course', else free text ────────
function LinkCell({ type, value, onChange, batches }) {
  if (type === 'Learning Course') {
    return (
      <select value={value} onChange={e => onChange(e.target.value)}
        className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white w-full min-w-[180px]'>
        <option value=''>— Pilih Batch…</option>
        {batches.map(b => <option key={b.id} value={b.batch_name}>{b.batch_name}</option>)}
      </select>
    )
  }
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder='https://…'
      className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white w-full min-w-[160px]' />
  )
}

// ── Mentor employee dropdown ──────────────────────────────────────────────────
function MentorSelect({ empId, employees, positions, onChange }) {
  return (
    <select
      value={empId || ''}
      onChange={e => {
        const emp = employees.find(em => em.id === Number(e.target.value))
        const pos = positions.find(p => p.id === emp?.positionId)
        onChange(e.target.value, emp?.name ?? '', pos?.name ?? '')
      }}
      className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white w-full min-w-[130px]'>
      <option value=''>— Pilih Mentor…</option>
      {employees.map(em => <option key={em.id} value={em.id}>{em.name}</option>)}
    </select>
  )
}

function AssigneeSelect({ value, onChange, employees = [] }) {
  const normalized = (!value || value === 'employee' || value === 'hr') ? 'self' : value
  const isEmp = normalized.startsWith('emp:')
  return (
    <select value={normalized} onChange={e => onChange(e.target.value)}
      className={`px-2 py-1 text-xs border rounded outline-none focus:border-red-400 w-full min-w-[120px] font-semibold ${assigneeBadgeCls(normalized)}`}>
      <option value='self'>Self (Karyawan)</option>
      <option value='manager'>Manager Langsung</option>
      {employees.length > 0 && <option disabled>──────────────</option>}
      {employees.map(e => (
        <option key={e.id} value={`emp:${e.id}`}>{e.name}</option>
      ))}
    </select>
  )
}

// ── Review type dropdown ──────────────────────────────────────────────────────
function RTC({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white w-full min-w-[140px]'>
      <option value=''>— Pilih Type…</option>
      {REVIEW_TYPE_LOV.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  )
}

// ── Periodic Review table header ──────────────────────────────────────────────
function ReviewHead({ t }) {
  return (
    <thead>
      <tr style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
        {['NO', t('Agenda','Agenda'), 'Type',
          t('Nama Reviewer','Reviewer Name'), t('Posisi Reviewer','Reviewer Position'), ''].map((h, i) => (
          <th key={i} className='text-left px-3 py-2 text-white font-semibold text-xs whitespace-nowrap'
            style={{ minWidth: i === 1 ? 220 : i === 2 ? 150 : i === 3 ? 150 : i === 4 ? 150 : i === 0 ? 40 : 36 }}>
            {h}
          </th>
        ))}
      </tr>
    </thead>
  )
}

// ── Agenda table header ───────────────────────────────────────────────────────
function TableHead({ t }) {
  return (
    <thead>
      <tr style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
        {['NO', t('AGENDA [Module]','AGENDA [Module]'), 'Type', 'Link',
          t('Nama Mentor','Mentor Name'), t('Posisi Mentor','Mentor Position'), t('Assignee','Assignee'), ''].map((h, i) => (
          <th key={i} className='text-left px-3 py-2 text-white font-semibold text-xs whitespace-nowrap'
            style={{ minWidth: i === 1 ? 200 : i === 2 ? 160 : i === 3 ? 200 : i === 6 ? 130 : i === 0 ? 40 : 110 }}>
            {h}
          </th>
        ))}
      </tr>
    </thead>
  )
}

export default function MasterOnboardingPage() {
  const t = useT()
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useMasterOnboardingStore()
  const { forms: masterForms } = useMasterFormStore()
  const { employees }  = useEmployeeStore()
  const { positions, departments, companies } = useStructureStore()
  const { batches }    = useCourseBatchStore()

  const [view,   setView  ] = useState('list')   // 'list' | 'form'
  const [editId,         setEditId        ] = useState(null)
  const [form,           setForm          ] = useState(EMPTY_FORM)
  const [msg,            setMsg           ] = useState(null)
  const [delId,          setDelId         ] = useState(null)
  const [newSectionType, setNewSectionType] = useState('')

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const openNew = () => {
    setEditId(null)
    setForm(JSON.parse(JSON.stringify(EMPTY_FORM)))
    setView('form')
  }

  const openEdit = (tpl) => {
    setEditId(tpl.id)
    const copy = JSON.parse(JSON.stringify(tpl))
    // Migrate old format (generalSections/generalItems) → mainSections
    if (!copy.mainSections) {
      copy.mainSections = [{
        id: 'ms_1',
        title: copy.generalSectionTitle || 'Materi Induksi General',
        sections: copy.generalSections || [],
        items: copy.generalItems || [],
      }]
    }
    // Migrate old title→type; filter out blank-type entries (legacy empty defaults)
    copy.mainSections = copy.mainSections
      .map(ms => ({ ...ms, type: ms.type || ms.title || '' }))
      .filter(ms => ms.type)
    // reviewItems: keep null if not added; keep existing array if already set
    if (copy.reviewItems === undefined) copy.reviewItems = null
    if (!copy.reviewSections) copy.reviewSections = []
    if (copy.autoAssign === undefined) copy.autoAssign = false
    copy.criteria = { employmentTypes: [], departmentIds: [], companyIds: [], positionIds: [], ...(copy.criteria ?? {}) }
    setForm(copy)
    setView('form')
  }

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── Auto-Assign criteria toggles ──────────────────────────────────────────
  const toggleCriteria = (key, val) =>
    setForm(f => {
      const cur = f.criteria?.[key] ?? []
      const next = cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]
      return { ...f, criteria: { ...f.criteria, [key]: next } }
    })

  // ── Main Section management ───────────────────────────────────────────────
  const addMainSection = (type) =>
    setForm(f => ({ ...f, mainSections: [...(f.mainSections ?? []), { id: `ms_${Date.now()}`, type, sections: [], items: [] }] }))

  const delMainSection = (msId) =>
    setForm(f => ({ ...f, mainSections: (f.mainSections ?? []).filter(ms => ms.id !== msId) }))

  const handleAddSection = () => {
    if (!newSectionType) return
    if (newSectionType === 'Periodic Review') {
      if (form.reviewItems === null) setForm(f => ({ ...f, reviewItems: JSON.parse(JSON.stringify(DEFAULT_REVIEW_ITEMS)) }))
    } else {
      addMainSection(newSectionType)
    }
    setNewSectionType('')
  }

  // ── General rows (per main section) ──────────────────────────────────────
  const addGeneral = (msId, category) =>
    setForm(f => ({
      ...f,
      mainSections: (f.mainSections ?? []).map(ms =>
        ms.id !== msId ? ms : { ...ms, items: [...ms.items, newG(category)] }
      ),
    }))

  const delGeneral = (msId, id) =>
    setForm(f => ({
      ...f,
      mainSections: (f.mainSections ?? []).map(ms =>
        ms.id !== msId ? ms : { ...ms, items: ms.items.filter(r => r.id !== id) }
      ),
    }))

  const updGeneral = (msId, id, key, val) =>
    setForm(f => ({
      ...f,
      mainSections: (f.mainSections ?? []).map(ms =>
        ms.id !== msId ? ms : { ...ms, items: ms.items.map(r => r.id === id ? { ...r, [key]: val } : r) }
      ),
    }))

  const patchGeneral = (msId, id, patch) =>
    setForm(f => ({
      ...f,
      mainSections: (f.mainSections ?? []).map(ms =>
        ms.id !== msId ? ms : { ...ms, items: ms.items.map(r => r.id === id ? { ...r, ...patch } : r) }
      ),
    }))

  // ── General section management (per main section) ─────────────────────────
  const addGeneralSection = (msId) =>
    setForm(f => ({
      ...f,
      mainSections: (f.mainSections ?? []).map(ms => {
        if (ms.id !== msId) return ms
        const colorIdx = ms.sections.length % SEC_COLORS.length
        return { ...ms, sections: [...ms.sections, { id: `gsec_${Date.now()}`, label: '', labelEN: '', colorIdx }] }
      }),
    }))

  const delGeneralSection = (msId, secId) =>
    setForm(f => ({
      ...f,
      mainSections: (f.mainSections ?? []).map(ms =>
        ms.id !== msId ? ms : {
          ...ms,
          sections: ms.sections.filter(s => s.id !== secId),
          items:    ms.items.filter(r => r.category !== secId),
        }
      ),
    }))

  const updGeneralSection = (msId, secId, val) =>
    setForm(f => ({
      ...f,
      mainSections: (f.mainSections ?? []).map(ms =>
        ms.id !== msId ? ms : {
          ...ms,
          sections: ms.sections.map(s => s.id === secId ? { ...s, label: val } : s),
        }
      ),
    }))

  // ── Periodic Review rows ──────────────────────────────────────────────────
  const addReview = () =>
    setForm(f => ({ ...f, reviewItems: [...f.reviewItems, newR()] }))

  const delReview = (id) =>
    setForm(f => ({ ...f, reviewItems: f.reviewItems.filter(r => r.id !== id) }))

  const updReview = (id, key, val) =>
    setForm(f => ({ ...f, reviewItems: f.reviewItems.map(r => r.id === id ? { ...r, [key]: val } : r) }))

  const patchReview = (id, patch) =>
    setForm(f => ({ ...f, reviewItems: f.reviewItems.map(r => r.id === id ? { ...r, ...patch } : r) }))


  const handleSave = () => {
    if (!form.name.trim()) return flash(t('Nama template wajib diisi.','Template name is required.'), 'error')
    if (editId) { updateTemplate(editId, form); flash(t('Template berhasil diperbarui.','Template updated.')) }
    else        { addTemplate(form);             flash(t('Template berhasil dibuat.','Template created.')) }
    setView('list')
  }

  const confirmDelete = () => {
    deleteTemplate(delId); setDelId(null)
    flash(t('Template dihapus.','Template deleted.'))
  }

  // ── FORM VIEW ─────────────────────────────────────────────────────────────
  const Toast = msg ? (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold transition-all
      ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
      <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
      <span>{msg.text}</span>
    </div>
  ) : null

  if (view === 'form') {
    return (
      <div>
        {Toast}
        {/* Top bar */}
        <div className='flex items-center gap-3 mb-5'>
          <button onClick={() => setView('list')}
            className='text-sm text-gray-500 hover:text-gray-700 transition'>
            ← {t('Kembali', 'Back')}
          </button>
          <span className='text-gray-300'>|</span>
          <h1 className='text-xl font-bold text-gray-800'>
            {editId ? t('Edit Template', 'Edit Template') : t('Template Baru', 'New Template')}
          </h1>
        </div>


        <div className='space-y-5'>
          {/* ── Template Info ── */}
          <SectionCard title={t('Informasi Template','Template Info')} icon='📋'>
            <div className='grid grid-cols-1 gap-4'>
              <div className='flex items-start gap-3'>
                <label className='text-xs font-semibold text-gray-600 w-32 pt-2 flex-shrink-0'>
                  {t('Nama Template','Template Name')} <span className='text-red-400'>*</span>
                </label>
                <input value={form.name} onChange={e => setField('name', e.target.value)}
                  placeholder={t('Masukkan nama template…','Enter template name…')}
                  className='flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div className='flex items-start gap-3'>
                <label className='text-xs font-semibold text-gray-600 w-32 pt-2 flex-shrink-0'>
                  {t('Deskripsi','Description')}
                </label>
                <textarea value={form.description} onChange={e => setField('description', e.target.value)}
                  rows={2} placeholder={t('Deskripsi singkat template…','Short description…')}
                  className='flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>
              {/* ── Main Section Type ── */}
              <div className='flex items-start gap-3'>
                <label className='text-xs font-semibold text-gray-600 w-32 pt-2 flex-shrink-0'>
                  Main Section
                </label>
                <div className='flex flex-wrap gap-2'>
                  {MAIN_SECTION_TYPES.map(type => {
                    const isReview = type === 'Periodic Review'
                    const selected = isReview
                      ? form.reviewItems !== null
                      : (form.mainSections ?? []).some(ms => ms.type === type)
                    const select = () => {
                      // Clear all existing, then set the chosen one
                      if (isReview) {
                        setForm(f => ({
                          ...f,
                          mainSections: [],
                          reviewItems: JSON.parse(JSON.stringify(DEFAULT_REVIEW_ITEMS)),
                        }))
                      } else {
                        setForm(f => ({
                          ...f,
                          mainSections: [{ id: `ms_${Date.now()}`, type, sections: [], items: [] }],
                          reviewItems: null,
                        }))
                      }
                    }
                    return (
                      <button key={type} type='button' onClick={select}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-xs font-semibold transition
                          ${selected
                            ? isReview ? 'bg-orange-50 border-orange-400 text-orange-700' : 'bg-red-50 border-red-500 text-red-700'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'}`}>
                        <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                          ${selected
                            ? isReview ? 'border-orange-400 bg-orange-400' : 'border-red-500 bg-red-500'
                            : 'border-gray-300'}`}>
                          {selected && <span className='w-1.5 h-1.5 rounded-full bg-white' />}
                        </span>
                        {type}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <label className='text-xs font-semibold text-gray-600 w-32 flex-shrink-0'>Status</label>
                <button onClick={() => setField('active', !form.active)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full transition ${form.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {form.active ? t('✓ Aktif','✓ Active') : t('✗ Nonaktif','✗ Inactive')}
                </button>
              </div>


            </div>
          </SectionCard>

          {/* ── Auto-Assign Rule ── */}
          <SectionCard title={t('Auto-Assign Rule','Auto-Assign Rule')} icon='⚡'>
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <button type='button' onClick={() => setField('autoAssign', !form.autoAssign)}
                  className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors ${form.autoAssign ? 'bg-red-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.autoAssign ? 'left-6' : 'left-1'}`} />
                </button>
                <div>
                  <span className='text-xs font-semibold text-gray-700'>
                    {form.autoAssign
                      ? t('✓ Auto-Assign aktif','✓ Auto-Assign enabled')
                      : t('✗ Auto-Assign nonaktif','✗ Auto-Assign disabled')}
                  </span>
                  <p className='text-xs text-gray-400 mt-0.5'>
                    {t('Karyawan baru yang cocok dengan kriteria di bawah otomatis dibuatkan onboarding (status Draft).',
                       'New hires matching the criteria below are automatically given an onboarding record (Draft status).')}
                  </p>
                </div>
              </div>

              {form.autoAssign && (
                <div className='space-y-4 pt-2 border-t border-gray-100'>
                  <p className='text-xs text-gray-400 italic'>
                    {t('Kosongkan sebuah kriteria untuk mencocokkan semua nilai. Template diproses berurutan — template paling atas yang cocok dipakai.',
                       'Leave a criterion empty to match all values. Templates are evaluated top-down — the first matching template is used.')}
                  </p>
                  {[
                    { key: 'employmentTypes', label: t('Tipe Kepegawaian','Employment Type'), items: EMP_TYPES.map(e => ({ id: e, name: e })) },
                    { key: 'companyIds',      label: 'Company',     items: companies.map(c => ({ id: c.id, name: c.name || c.companyCode })) },
                    { key: 'departmentIds',   label: 'Department',  items: departments },
                    { key: 'positionIds',     label: t('Posisi','Position'), items: positions },
                  ].map(({ key, label, items }) => (
                    <div key={key}>
                      <p className='text-xs font-bold text-gray-500 uppercase tracking-wide mb-2'>
                        {label} <span className='normal-case font-normal text-gray-400'>({t('kosong = semua','empty = all')})</span>
                      </p>
                      <div className='flex flex-wrap gap-2 max-h-28 overflow-y-auto'>
                        {items.map(item => (
                          <CriteriaPill key={item.id} label={item.name}
                            active={(form.criteria?.[key] ?? []).includes(item.id)}
                            onClick={() => toggleCriteria(key, item.id)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Main Sections ── */}
          {(form.mainSections ?? []).map((ms, msIdx) => (
            <div key={ms.id} className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
              <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
                <div className='flex items-center gap-2 min-w-0'>
                  <div className='w-1 h-5 rounded-full flex-shrink-0' style={{ background: 'linear-gradient(#8B1A1A,#D7252B)' }} />
                  <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0'>
                    Main Section
                  </span>
                  <span className='text-sm font-bold text-gray-800'>{ms.type}</span>
                  <span className='text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0'>
                    {ms.items.length} {t('baris','rows')}
                  </span>
                </div>
                <div className='flex items-center gap-2 flex-shrink-0'>
                  <button onClick={() => addGeneralSection(ms.id)}
                    className='px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition'>
                    + {t('Tambah Section','Add Section')}
                  </button>
                </div>
              </div>
              <div className='overflow-x-auto'>
                {ms.sections.length === 0 ? (
                  <div className='px-6 py-8 text-center text-gray-400 text-sm'>
                    {t('Belum ada section. Klik "+ Tambah Section" untuk memulai.','No sections yet. Click "+ Add Section" to start.')}
                  </div>
                ) : (
                  ms.sections.map(sec => {
                    const colors = SEC_COLORS[sec.colorIdx % SEC_COLORS.length]
                    const rows = ms.items.filter(r => r.category === sec.id)
                    return (
                      <table key={sec.id} className='w-full text-xs border-b border-gray-100 last:border-b-0'>
                        <TableHead t={t} />
                        <tbody>
                          <tr className={colors.rowCls}>
                            <td colSpan={8} className='px-3 py-2'>
                              <div className='flex items-center justify-between gap-3'>
                                <input
                                  value={sec.label}
                                  onChange={e => updGeneralSection(ms.id, sec.id, e.target.value)}
                                  placeholder={t('Nama section…','Section name…')}
                                  className={`text-xs font-semibold bg-transparent border-0 outline-none ${colors.textCls} flex-1 min-w-0`}
                                />
                                <div className='flex items-center gap-2 flex-shrink-0'>
                                  <button onClick={() => addGeneral(ms.id, sec.id)}
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${colors.textCls} border-current hover:bg-white/60`}>
                                    + {t('Tambah','Add')}
                                  </button>
                                  <button onClick={() => delGeneralSection(ms.id, sec.id)}
                                    className='text-red-400 hover:text-red-600 text-sm font-bold transition leading-none'>✕</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                          {rows.length === 0 && (
                            <tr>
                              <td colSpan={8} className='px-4 py-3 text-center text-gray-300 text-xs italic'>
                                {t('Belum ada baris di seksi ini.','No rows in this section.')}
                              </td>
                            </tr>
                          )}
                          {rows.map((row, idx) => (
                            <React.Fragment key={row.id}>
                              <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <td className='px-2 py-1.5 w-12 text-center text-xs text-gray-500 font-medium'>{idx + 1}</td>
                                <td className='px-2 py-1.5'>
                                  <IC value={row.module} onChange={v => updGeneral(ms.id, row.id, 'module', v)}
                                    placeholder={t('Nama modul…','Module name…')} wide />
                                </td>
                                <td className='px-2 py-1.5'>
                                  <SC value={row.type || ''} onChange={v => patchGeneral(ms.id, row.id, { type: v, link: '' })} />
                                </td>
                                <td className='px-2 py-1.5'>
                                  <LinkCell type={row.type} value={row.link || ''}
                                    onChange={v => updGeneral(ms.id, row.id, 'link', v)} batches={batches} />
                                </td>
                                <td className='px-2 py-1.5 w-36'>
                                  <MentorSelect empId={row.mentorEmpId} employees={employees} positions={positions}
                                    onChange={(empId, name, pos) => patchGeneral(ms.id, row.id, { mentorEmpId: empId, mentorName: name, mentorPosition: pos })} />
                                </td>
                                <td className='px-2 py-1.5 w-32 text-xs text-gray-500'>
                                  {row.mentorPosition || <span className='text-gray-300 italic'>{t('Otomatis','Auto')}</span>}
                                </td>
                                <td className='px-2 py-1.5 w-36'>
                                  <AssigneeSelect value={row.assignedTo || 'self'} employees={employees}
                                    onChange={v => updGeneral(ms.id, row.id, 'assignedTo', v)} />
                                </td>
                                <td className='px-2 py-1.5 w-10 text-center'>
                                  <button onClick={() => delGeneral(ms.id, row.id)}
                                    className='text-red-400 hover:text-red-600 text-sm font-bold transition'>✕</button>
                                </td>
                              </tr>
                              {row.type === 'Configurable Form' && (
                                <tr>
                                  <td colSpan={8} className='px-2 pb-2'>
                                    <FormPickerPanel row={row} masterForms={masterForms}
                                      onChange={patch => patchGeneral(ms.id, row.id, patch)} />
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    )
                  })
                )}
              </div>
            </div>
          ))}


          {/* ── Periodic Review ── */}
          {form.reviewItems !== null && (
            <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
              <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
                <div className='flex items-center gap-2'>
                  <div className='w-1 h-5 rounded-full' style={{ background: 'linear-gradient(#8B1A1A,#D7252B)' }} />
                  <h2 className='text-sm font-bold text-gray-800'>
                    {t('Periodic Review','Periodic Review')}
                  </h2>
                  <span className='text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full'>
                    {form.reviewItems.length} {t('baris','rows')}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <button onClick={addReview}
                    className='px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition'>
                    + {t('Tambah','Add')}
                  </button>
                  <button
                    onClick={() => { if (confirm(t('Hapus seluruh Periodic Review?','Remove entire Periodic Review section?'))) setForm(f => ({ ...f, reviewItems: null })) }}
                    className='px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition'>
                    ✕
                  </button>
                </div>
              </div>
              <div className='overflow-x-auto'>
                <table className='w-full text-xs'>
                  <ReviewHead t={t} />
                  <tbody>
                    {form.reviewItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className='px-6 py-8 text-center text-gray-400 text-sm'>
                          {t('Belum ada baris. Klik "+ Tambah" untuk menambahkan.','No rows yet. Click "+ Add" to start.')}
                        </td>
                      </tr>
                    ) : form.reviewItems.map((row, idx) => (
                      <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className='px-2 py-1.5 w-12 text-center text-xs text-gray-500 font-medium'>
                          {idx + 1}
                        </td>
                        <td className='px-2 py-1.5'>
                          <IC value={row.agenda} onChange={v => updReview(row.id, 'agenda', v)}
                            placeholder={t('Agenda…','Agenda…')} wide />
                        </td>
                        <td className='px-2 py-1.5'>
                          <RTC value={row.type || ''} onChange={v => updReview(row.id, 'type', v)} />
                        </td>
                        <td className='px-2 py-1.5 w-36'>
                          {idx === 0
                            ? <span className='text-xs font-semibold text-gray-700 px-1'>Direct Manager</span>
                            : <span className='text-xs text-gray-300 italic px-1'>—</span>
                          }
                        </td>
                        <td className='px-2 py-1.5 w-32 text-xs text-gray-500'>
                          <span className='text-gray-300 italic text-xs'>{t('Otomatis','Auto')}</span>
                        </td>
                        <td className='px-2 py-1.5 w-10 text-center'>
                          {idx > 0 && (
                            <button onClick={() => delReview(row.id)}
                              className='text-red-400 hover:text-red-600 text-sm font-bold transition'>✕</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className='flex gap-3'>
            <ActionButton icon='💾' onClick={handleSave}>
              {editId ? t('Simpan Perubahan','Save Changes') : t('Simpan Template','Save Template')}
            </ActionButton>
            <button onClick={() => setView('list')}
              className='px-5 py-2.5 text-sm font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition'>
              {t('Batal','Cancel')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div>
      {Toast}
      <PageHeader
        icon='🗂️'
        title={t('Master Onboarding Tracker','Master Onboarding Tracker')}
        subtitle={t('Kelola template agenda induksi yang dapat digunakan saat membuat Onboarding Tracker.', 'Manage induction agenda templates used when creating an Onboarding Tracker.')}
        actions={
          <ActionButton icon='+' onClick={openNew}>
            {t('Template Baru','New Template')}
          </ActionButton>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          icon='🗂️'
          title={t('Belum ada template.', 'No templates yet.')}
          description={t('Klik "Template Baru" untuk membuat template pertama.', 'Click "New Template" to create your first one.')}
          action={<ActionButton size='sm' icon='+' onClick={openNew}>{t('Template Baru','New Template')}</ActionButton>}
        />
      ) : (
        <DataTable
          columns={[
            { label: t('Nama Template','Template Name') },
            { label: t('Deskripsi','Description') },
            { label: 'Main Section' },
            { label: 'Status' },
            { label: t('Dibuat','Created') },
            { label: t('Aksi','Action'), align: 'right' },
          ]}
        >
          {templates.map(tpl => (
            <Tr key={tpl.id}>
              <Td className='font-semibold text-gray-800'>{tpl.name}</Td>
              <Td className='text-gray-500 text-xs max-w-xs'>
                <span className='line-clamp-2'>{tpl.description || '—'}</span>
              </Td>
              <Td>
                <div className='flex flex-wrap gap-1'>
                  {(tpl.mainSections ?? []).filter(ms => ms.type).map(ms => (
                    <span key={ms.id} className='text-xs bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full'>
                      {ms.type}
                    </span>
                  ))}
                  {(tpl.reviewItems ?? []).length > 0 && (
                    <span className='text-xs bg-orange-50 text-orange-700 font-semibold px-2 py-0.5 rounded-full'>
                      Periodic Review
                    </span>
                  )}
                  {(tpl.mainSections ?? []).filter(ms => ms.type).length === 0 && (tpl.reviewItems ?? []).length === 0 && (
                    <span className='text-xs text-gray-300 italic'>—</span>
                  )}
                </div>
              </Td>
              <Td>
                <div className='flex flex-col gap-1'>
                  <StatusBadge tone={tpl.active ? 'success' : 'neutral'}>
                    {tpl.active ? t('Aktif','Active') : t('Nonaktif','Inactive')}
                  </StatusBadge>

                </div>
              </Td>
              <Td className='text-gray-400 text-xs'>
                {tpl.createdAt ? new Date(tpl.createdAt).toLocaleDateString('id-ID') : '—'}
              </Td>
              <Td align='right'>
                <div className='flex gap-2 justify-end'>
                  <button onClick={() => openEdit(tpl)}
                    className='px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                    ✏️ {t('Edit','Edit')}
                  </button>
                  <button onClick={() => setDelId(tpl.id)}
                    className='px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition'>
                    🗑
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </DataTable>
      )}

      {/* Delete modal */}
      {delId && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'
          onClick={() => setDelId(null)}>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-80' onClick={e => e.stopPropagation()}>
            <h3 className='text-base font-bold text-gray-800 mb-2'>{t('Hapus Template?','Delete Template?')}</h3>
            <p className='text-sm text-gray-500 mb-5'>
              {t('Template ini akan dihapus permanen.','This template will be permanently deleted.')}
            </p>
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
    </div>
  )
}
