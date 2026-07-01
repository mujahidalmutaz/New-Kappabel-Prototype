'use client'
import React, { useState } from 'react'
import { useMasterOnboardingStore } from '@/store/masterOnboardingStore'
import { useMasterFormStore }       from '@/store/masterFormStore'
import { useEmployeeStore }         from '@/store/employeeStore'
import { useStructureStore }        from '@/store/structureStore'
import { useCourseBatchStore }      from '@/store/courseBatchStore'
import { useT }                     from '@/store/languageStore'

import { PageHeader, SectionCard, DataTable, Tr, Td, StatusBadge, ActionButton, EmptyState, BRAND_GRADIENT } from '@/components/ui'
import { assigneeLabel, assigneeBadgeCls } from '@/utils/assigneeUtils'
import FormPickerPanel from '@/components/onboarding/FormPickerPanel'

// ── Row factory helpers ───────────────────────────────────────────────────────
const newG = (category) => ({ id: Math.random(), module: '', type: '', link: '', description: '', duration: '', mandatory: true, mentorEmpId: '', mentorName: '', mentorPosition: '', assignedTo: 'employee', category })
const newT = (category) => ({ id: Math.random(), module: '', type: '', link: '', description: '', duration: '', mandatory: true, category, mentorEmpId: '', mentorName: '', mentorPosition: '', assignedTo: 'employee' })
const newR = () => ({ id: Math.random(), agenda: '', evaluationType: '', masterFormId: null, masterFormName: '', formSchema: [], formType: null, evalMethod: null, evalTopics: [], ojtParams: [], evaluators: [], reviewerEmpId: '', reviewerName: '', reviewerPosition: '' })

const EVAL_TYPE_LOV = [
  'Hire / Probation / Orientation',
  'Contract',
  'Promote / Adjustment / Transfer',
]

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

const MAIN_SECTION_TYPES = ['Onboarding General', 'Onboarding Teknis', 'Periodic Review']

const EMPTY_FORM = {
  name: '', description: '', active: true,
  mainSections: [],
  reviewItems: null,
  reviewSections: [],
  autoAssign: false,
  criteria: { employmentTypes: [], departmentIds: [], companyIds: [], positionIds: [] },
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
  const normalized = (!value || value === 'employee') ? 'self' : value
  return (
    <select value={normalized} onChange={e => onChange(e.target.value)}
      className={`px-2 py-1 text-xs border rounded outline-none focus:border-red-400 w-full min-w-[120px] font-semibold ${assigneeBadgeCls(normalized)}`}>
      <option value='self'>Self (Karyawan)</option>
      <option value='manager'>Manager Langsung</option>
      <option value='hr'>HR / Admin</option>
      {employees.length > 0 && <option disabled>──────────────</option>}
      {employees.map(e => (
        <option key={e.id} value={`emp:${e.id}`}>{e.name}</option>
      ))}
    </select>
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

// ── Periodic Review table header ──────────────────────────────────────────────
function ReviewHead({ t }) {
  return (
    <thead>
      <tr style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
        {['NO', t('Agenda','Agenda'), t('Evaluation Type','Evaluation Type'), t('Evaluators','Evaluators'), ''].map((h, i) => (
          <th key={i} className='text-left px-3 py-2 text-white font-semibold text-xs whitespace-nowrap'
            style={{ minWidth: i === 1 ? 220 : i === 2 ? 200 : i === 3 ? 220 : i === 0 ? 40 : 36 }}>
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
        {['NO', t('AGENDA [Module]','AGENDA [Module]'), 'H+', 'Type', 'Link',
          t('Mentor','Mentor'), t('Wajib','Mandatory'), t('Durasi','Duration'), t('Assignee','Assignee'), ''].map((h, i) => (
          <th key={i} className='text-left px-3 py-2 text-white font-semibold text-xs whitespace-nowrap'
            style={{ minWidth: i === 1 ? 200 : i === 2 ? 70 : i === 3 ? 160 : i === 4 ? 200 : i === 8 ? 130 : i === 6 ? 70 : i === 7 ? 90 : i === 0 ? 40 : 110 }}>
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
        title: copy.generalSectionTitle || 'Onboarding General',
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

  // ── Main Section management ───────────────────────────────────────────────
  const addMainSection = (type) =>
    setForm(f => ({ ...f, mainSections: [...(f.mainSections ?? []), { id: `ms_${Date.now()}`, type, sections: [], items: [] }] }))

  const delMainSection = (msId) =>
    setForm(f => ({ ...f, mainSections: (f.mainSections ?? []).filter(ms => ms.id !== msId) }))

  const handleAddSection = () => {
    if (!newSectionType) return
    if (newSectionType === 'Periodic Review') {
      if (form.reviewItems === null) setForm(f => ({ ...f, reviewItems: [] }))
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
    if (editId) updateTemplate(editId, form)
    else addTemplate(form)
    flash(t('Template berhasil disimpan.','Template saved.'))
    setView('list')
  }

  const confirmDelete = () => {
    const id = delId
    setDelId(null)
    deleteTemplate(id)
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
                          reviewItems: [],
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
                            <td colSpan={10} className='px-3 py-2'>
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
                              <td colSpan={10} className='px-4 py-3 text-center text-gray-300 text-xs italic'>
                                {t('Belum ada baris di seksi ini.','No rows in this section.')}
                              </td>
                            </tr>
                          )}
                          {rows.map((row, idx) => (
                            <React.Fragment key={row.id}>
                              <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                <td className='px-2 py-1.5 w-12 text-center text-xs text-gray-500 font-medium'>{idx + 1}</td>
                                <td className='px-2 py-1.5'>
                                  <div className='flex flex-col gap-1'>
                                    <IC value={row.module} onChange={v => updGeneral(ms.id, row.id, 'module', v)}
                                      placeholder={t('Nama modul…','Module name…')} wide />
                                    <input value={row.description || ''} onChange={e => updGeneral(ms.id, row.id, 'description', e.target.value)}
                                      placeholder={t('Instruksi tambahan (opsional)…','Additional instructions (optional)…')}
                                      className='px-2 py-1 text-[11px] border border-gray-100 rounded outline-none focus:border-red-300 bg-gray-50 w-full min-w-[160px] text-gray-500' />
                                  </div>
                                </td>
                                <td className='px-2 py-1.5 w-20'>
                                  <div className='flex items-center gap-1'>
                                    <span className='text-[10px] font-bold text-red-600'>H+</span>
                                    <input type='number' value={row.dueDate || ''} onChange={e => updGeneral(ms.id, row.id, 'dueDate', e.target.value)}
                                      placeholder='0'
                                      className='w-14 px-1.5 py-0.5 text-xs border border-gray-200 rounded outline-none focus:border-red-400 text-center' />
                                  </div>
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
                                  {row.mentorPosition && (
                                    <div className='text-[10px] text-gray-400 mt-0.5 truncate'>{row.mentorPosition}</div>
                                  )}
                                </td>
                                <td className='px-2 py-1.5 w-14 text-center'>
                                  <input type='checkbox' checked={row.mandatory !== false}
                                    onChange={e => updGeneral(ms.id, row.id, 'mandatory', e.target.checked)}
                                    className='w-4 h-4 accent-red-600' title={t('Wajib diisi','Required')} />
                                </td>
                                <td className='px-2 py-1.5 w-20'>
                                  <input type='number' min='0' value={row.duration || ''} onChange={e => updGeneral(ms.id, row.id, 'duration', e.target.value)}
                                    placeholder={t('menit','min')}
                                    className='w-16 px-1.5 py-0.5 text-xs border border-gray-200 rounded outline-none focus:border-red-400 text-center' />
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
                                  <td colSpan={10} className='px-2 pb-2'>
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
                        <td colSpan={4} className='px-6 py-8 text-center text-gray-400 text-sm'>
                          {t('Belum ada baris. Klik "+ Tambah" untuk menambahkan.','No rows yet. Click "+ Add" to start.')}
                        </td>
                      </tr>
                    ) : form.reviewItems.map((row, idx) => (
                      <React.Fragment key={row.id}>
                        <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className='px-2 py-1.5 w-12 text-center text-xs text-gray-500 font-medium'>
                            {idx + 1}
                          </td>
                          <td className='px-2 py-1.5'>
                            <IC value={row.agenda} onChange={v => updReview(row.id, 'agenda', v)}
                              placeholder={t('Agenda…','Agenda…')} wide />
                          </td>
                          <td className='px-2 py-1.5'>
                            <select
                              value={row.evaluationType ?? ''}
                              onChange={e => patchReview(row.id, { evaluationType: e.target.value })}
                              className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white w-full min-w-[180px]'>
                              <option value=''>— {t('Pilih Tipe','Select Type')} —</option>
                              {EVAL_TYPE_LOV.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                              <optgroup label={`── ${t('Dari Configurable Form','From Configurable Form')} ──`}>
                                {masterForms.filter(f => f.active).map(f => (
                                  <option key={`form-${f.id}`} value={`form:${f.id}:${f.name}`}>{f.name}</option>
                                ))}
                              </optgroup>
                            </select>
                          </td>
                          <td className='px-2 py-1.5'>
                            <EvaluatorPicker
                              evaluators={row.evaluators ?? (idx === 0 ? [{ id: 'manager', label: 'Direct Manager' }] : [])}
                              employees={employees}
                              onChange={v => patchReview(row.id, { evaluators: v })} />
                          </td>
                          <td className='px-2 py-1.5 w-10 text-center'>
                            {idx > 0 && (
                              <button onClick={() => delReview(row.id)}
                                className='text-red-400 hover:text-red-600 text-sm font-bold transition'>✕</button>
                            )}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          {!form.name.trim() && (
            <div className='px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-700 font-semibold'>
              ⚠️ {t('Isi Nama Template terlebih dahulu sebelum menyimpan.','Fill in the Template Name before saving.')}
            </div>
          )}
          <div className='flex gap-3'>
            <ActionButton icon='💾' onClick={handleSave} disabled={!form.name.trim()}>
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
        title={t('Master Employee Onboarding','Master Employee Onboarding')}
        subtitle={t('Kelola template agenda induksi yang dapat digunakan saat membuat Employee Onboarding.', 'Manage induction agenda templates used when creating an Employee Onboarding.')}
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
                  <button onClick={() => {
                    const copy = JSON.parse(JSON.stringify(tpl))
                    copy.name = t(`Salinan dari ${tpl.name}`, `Copy of ${tpl.name}`)
                    copy.active = false
                    addTemplate(copy)
                    flash(t('Template berhasil diduplikat.', 'Template duplicated.'))
                  }}
                    className='px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition'
                    title={t('Duplikat', 'Duplicate')}>
                    📋
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
