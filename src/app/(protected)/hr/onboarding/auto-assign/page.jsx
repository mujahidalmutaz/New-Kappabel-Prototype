'use client'
import { useState, useMemo }          from 'react'
import { useMasterOnboardingStore }    from '@/store/masterOnboardingStore'
import { useOnboardingStore }          from '@/store/onboardingStore'
import { useEmployeeStore }            from '@/store/employeeStore'
import { useStructureStore }           from '@/store/structureStore'
import { useT }                        from '@/store/languageStore'
import { PageHeader, SectionCard, BRAND_GRADIENT } from '@/components/ui'
import { EMP_TYPES }                   from '@/utils/constants'

const BLANK_BUDDY = {
  buddyEmpId:'', buddyName:'', buddyPosition:'',
  programDuration:'', programDurationUnit:'Bulan',
  programStartDate:'', programEndDate:'', hrbpNotes:'',
}

const STEPS = [
  { id: 1, icon: '📋', labelID: 'Pilih Template',      labelEN: 'Select Template' },
  { id: 2, icon: '👥', labelID: 'Kriteria Karyawan',   labelEN: 'Employee Criteria' },
  { id: 3, icon: '📅', labelID: 'Filter Tanggal',      labelEN: 'Date Filter' },
  { id: 4, icon: '👁', labelID: 'Preview & Eksekusi',  labelEN: 'Preview & Execute' },
]

function todayStr() { return new Date().toISOString().slice(0,10) }
function tomorrowStr() {
  const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10)
}

function Toggle({ active, onChange }) {
  return (
    <button type='button' onClick={() => onChange(!active)}
      className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${active ? 'bg-red-500' : 'bg-gray-200'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${active ? 'left-5' : 'left-1'}`} />
    </button>
  )
}

function Pill({ label, active, onClick }) {
  return (
    <button type='button' onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition
        ${active ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'}`}>
      {label}
    </button>
  )
}

function RadioBtn({ label, active, onClick }) {
  return (
    <button type='button' onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-xs font-semibold transition
        ${active ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}>
      <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
        ${active ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
        {active && <span className='w-1.5 h-1.5 rounded-full bg-white' />}
      </span>
      {label}
    </button>
  )
}

function StepIndicator({ currentStep, onStepClick, t }) {
  return (
    <div className='flex items-center justify-between mb-6 px-2'>
      {STEPS.map((step, idx) => {
        const done    = currentStep > step.id
        const active  = currentStep === step.id
        return (
          <div key={step.id} className='flex items-center flex-1'>
            <button
              type='button'
              onClick={() => onStepClick(step.id)}
              className={`flex flex-col items-center gap-1 group transition`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold border-2 transition
                ${done   ? 'bg-green-500 border-green-500 text-white' :
                  active ? 'border-red-500 bg-red-50 text-red-600'   :
                           'border-gray-200 bg-white text-gray-300'}`}>
                {done ? '✓' : step.icon}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap transition
                ${done   ? 'text-green-600' :
                  active ? 'text-red-600'   :
                           'text-gray-400'}`}>
                {t(step.labelID, step.labelEN)}
              </span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mt-[-10px] transition-colors
                ${currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function AutoAssignOnboardingPage() {
  const t                                    = useT()
  const { templates }                        = useMasterOnboardingStore()
  const { onboardings, addOnboarding }       = useOnboardingStore()
  const { employees }                        = useEmployeeStore()
  const { positions, departments, companies} = useStructureStore()

  const [step, setStep] = useState(1)

  // Step 1 — template (single or multi-section)
  const [selectedTplId, setSelectedTplId] = useState('')
  const [useAdvanced,   setUseAdvanced  ] = useState(false)
  const [tplGeneral,    setTplGeneral   ] = useState('')
  const [tplTeknis,     setTplTeknis    ] = useState('')
  const [tplReview,     setTplReview    ] = useState('')
  const [autoSubmit,    setAutoSubmit   ] = useState(false)
  const [progStartDate, setProgStartDate] = useState('')

  // Step 2 — criteria
  const [filterEmpTypes,   setFilterEmpTypes  ] = useState([])
  const [filterDeptIds,    setFilterDeptIds   ] = useState([])
  const [filterCompanyIds, setFilterCompanyIds] = useState([])
  const [filterPosIds,     setFilterPosIds    ] = useState([])
  const [skipExisting,     setSkipExisting    ] = useState(true)

  // Step 3 — join date
  const [joinMode,  setJoinMode ] = useState('all')
  const [joinFrom,  setJoinFrom ] = useState('')
  const [joinTo,    setJoinTo   ] = useState('')

  // Step 4 — confirm
  const [confirmed,   setConfirmed  ] = useState(false)
  const [msg,         setMsg        ] = useState(null)
  const [runHistory,  setRunHistory ] = useState([])

  const flash = (text, type='success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 4000)
  }

  const activeTemplates = templates.filter(tpl => tpl.active)

  const tplsGeneral = activeTemplates.filter(tpl =>
    (tpl.mainSections ?? []).some(ms => ms.type === 'Onboarding General') ||
    (tpl.generalItems ?? []).length > 0)

  const tplsTeknis = activeTemplates.filter(tpl =>
    (tpl.mainSections ?? []).some(ms => ms.type === 'Onboarding Teknis') ||
    (tpl.technicalItems ?? []).length > 0)

  const tplsReview = activeTemplates.filter(tpl => (tpl.reviewItems ?? []).length > 0)

  // Effective template IDs derived from single vs advanced mode
  const effGeneral = useAdvanced ? tplGeneral : selectedTplId
  const effTeknis  = useAdvanced ? tplTeknis  : selectedTplId
  const effReview  = useAdvanced ? tplReview  : selectedTplId

  const hasAnyTpl = effGeneral || effTeknis || effReview

  const selectedTplObj = useMemo(
    () => activeTemplates.find(tpl => String(tpl.id) === selectedTplId),
    [activeTemplates, selectedTplId]
  )

  const tplSectionBadges = useMemo(() => {
    if (!selectedTplObj) return []
    const badges = []
    const ms = selectedTplObj.mainSections ?? []
    if (ms.some(s => s.type === 'Onboarding General') || (selectedTplObj.generalItems ?? []).length > 0)
      badges.push({ label:'General', color:'bg-blue-100 text-blue-700' })
    if (ms.some(s => s.type === 'Onboarding Teknis') || (selectedTplObj.technicalItems ?? []).length > 0)
      badges.push({ label:'Teknis', color:'bg-purple-100 text-purple-700' })
    if ((selectedTplObj.reviewItems ?? []).length > 0)
      badges.push({ label:'Periodic Review', color:'bg-orange-100 text-orange-700' })
    return badges
  }, [selectedTplObj])

  const assignedEmpIds = useMemo(
    () => new Set(onboardings.map(o => Number(o.employeeId))),
    [onboardings]
  )

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const toggleAll = (items, arr, setArr) => {
    const ids = items.map(i => i.id)
    const allActive = ids.every(id => arr.includes(id))
    setArr(allActive ? [] : ids)
    setConfirmed(false)
  }

  const preview = useMemo(() => {
    if (!hasAnyTpl) return []
    const today    = todayStr()
    const tomorrow = tomorrowStr()

    return employees.filter(emp => {
      if (emp.status !== 'Active') return false
      if (skipExisting && assignedEmpIds.has(emp.id)) return false
      if (filterEmpTypes.length   && !filterEmpTypes.includes(emp.employmentType)) return false
      if (filterDeptIds.length    && !filterDeptIds.includes(emp.departmentId))    return false
      if (filterCompanyIds.length && !filterCompanyIds.includes(emp.companyId))    return false
      if (filterPosIds.length     && !filterPosIds.includes(emp.positionId))       return false
      if (joinMode === 'today')    return emp.joinDate?.slice(0,10) === today
      if (joinMode === 'tomorrow') return emp.joinDate?.slice(0,10) === tomorrow
      if (joinMode === 'range') {
        const jd = emp.joinDate?.slice(0,10) ?? ''
        if (joinFrom && jd < joinFrom) return false
        if (joinTo   && jd > joinTo)   return false
      }
      return true
    }).map(emp => {
      const sections = []
      if (!useAdvanced) {
        tplSectionBadges.forEach(b => sections.push(b.label))
      } else {
        if (tplGeneral) sections.push('General')
        if (tplTeknis)  sections.push('Teknis')
        if (tplReview)  sections.push('Periodic Review')
      }
      return {
        emp,
        dept:        departments.find(d => d.id === emp.departmentId),
        pos:         positions.find(p => p.id === emp.positionId),
        hasExisting: assignedEmpIds.has(emp.id),
        sections,
      }
    })
  }, [hasAnyTpl, employees, skipExisting, assignedEmpIds, filterEmpTypes, filterDeptIds,
      filterCompanyIds, filterPosIds, joinMode, joinFrom, joinTo, useAdvanced,
      tplSectionBadges, tplGeneral, tplTeknis, tplReview, departments, positions])

  const handleRun = () => {
    if (!hasAnyTpl)
      return flash(t('Pilih minimal satu template.','Select at least one template.'), 'error')
    if (preview.length === 0)
      return flash(t('Tidak ada karyawan yang sesuai kriteria.','No employees match the criteria.'), 'error')
    if (!confirmed) { setConfirmed(true); return }

    const addRuntime = item => ({ ...item, id: Math.random(), date:'', completed:false })

    const findTpl = id => activeTemplates.find(tpl => String(tpl.id) === id)

    const tplG = findTpl(effGeneral)
    const tplT = findTpl(effTeknis)
    const tplR = findTpl(effReview)

    const buildSection = (tpl, type, fallbackItems, fallbackSections) => {
      if (!tpl) return null
      const ms = (tpl.mainSections ?? []).find(s => s.type === type)
      if (ms) return {
        ...ms,
        id: `ms_${Date.now()}_${Math.floor(Math.random()*10000)}`,
        sections: (ms.sections ?? []).map(s => ({ ...s })),
        items:    (ms.items ?? []).map(addRuntime),
      }
      const items = (tpl[fallbackItems] ?? []).map(addRuntime)
      const secs  = (tpl[fallbackSections] ?? []).map(s => ({ ...s }))
      if (!items.length && !secs.length) return null
      return { id:`ms_${type}_${Date.now()}`, type, sections:secs, items }
    }

    let count = 0
    preview.forEach(({ emp }) => {
      const supervisor = employees.find(e => e.id === emp.managerId)
      const dept       = departments.find(d => d.id === emp.departmentId)

      const mainSections = [
        buildSection(tplG, 'Onboarding General', 'generalItems',  'generalSections'),
        buildSection(tplT, 'Onboarding Teknis',  'technicalItems','technicalSections'),
      ].filter(Boolean)

      const rawReview = tplR ? (tplR.reviewItems ?? []).map(addRuntime) : []
      const reviewItems = rawReview.length > 0
        ? rawReview.map(item => item.isDirectManager
            ? { ...item, reviewerEmpId: String(supervisor?.id ?? ''), reviewerName: supervisor?.name ?? 'Direct Manager', reviewerPosition:'' }
            : item)
        : null

      addOnboarding({
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
        buddyAssignment:    { ...BLANK_BUDDY, ...(progStartDate ? { programStartDate: progStartDate } : {}) },
        createdVia:         'auto-assign',
        ...(autoSubmit ? { workflowStatus:'Pending', submittedAt: new Date().toISOString() } : {}),
      })
      count++
    })

    setRunHistory(h => [{
      at: new Date().toLocaleString('id-ID'),
      count,
      template: useAdvanced
        ? [tplG?.name, tplT?.name, tplR?.name].filter(Boolean).join(', ')
        : (selectedTplObj?.name ?? '—'),
      autoSubmit,
    }, ...h].slice(0,10))

    flash(t(`${count} onboarding berhasil dibuat.`,`${count} onboarding records created.`))
    setConfirmed(false)
    setSelectedTplId(''); setTplGeneral(''); setTplTeknis(''); setTplReview('')
    setFilterEmpTypes([]); setFilterDeptIds([]); setFilterCompanyIds([]); setFilterPosIds([])
    setJoinMode('all')
    setStep(1)
  }

  const canProceed = (toStep) => {
    if (toStep >= 2 && !hasAnyTpl) return false
    return true
  }

  const nextStep = () => {
    if (step === 1 && !hasAnyTpl)
      return flash(t('Pilih minimal satu template terlebih dahulu.','Please select at least one template first.'), 'error')
    setStep(s => Math.min(s+1, 4))
  }

  const prevStep = () => setStep(s => Math.max(s-1, 1))

  const criteriaCount = filterEmpTypes.length + filterDeptIds.length + filterCompanyIds.length + filterPosIds.length

  return (
    <div>
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold
          ${msg.type==='error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          <span>{msg.type==='error' ? '⚠️' : '✅'}</span><span>{msg.text}</span>
        </div>
      )}

      <PageHeader icon='⚡'
        title={t('Auto Assign Onboarding','Auto Assign Onboarding')}
        subtitle={t('Assign template onboarding ke banyak karyawan sekaligus berdasarkan kriteria.','Assign onboarding templates to multiple employees at once.')} />

      {/* Step Indicator */}
      <StepIndicator currentStep={step} onStepClick={s => canProceed(s) && setStep(s)} t={t} />

      <div className='space-y-5'>

        {/* ── STEP 1: Template ── */}
        {step === 1 && (
          <SectionCard title={t('Pilih Template Onboarding','Select Onboarding Template')} icon='📋'>
            <div className='space-y-5'>

              {/* Mode toggle */}
              <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
                <Toggle active={useAdvanced} onChange={v => { setUseAdvanced(v); setConfirmed(false) }} />
                <div>
                  <p className='text-xs font-bold text-gray-700'>
                    {t('Mode Lanjutan (per tipe seksi)','Advanced Mode (per section type)')}
                  </p>
                  <p className='text-xs text-gray-400'>
                    {useAdvanced
                      ? t('Pilih template berbeda untuk setiap tipe seksi','Choose different templates for each section type')
                      : t('Satu template dipakai untuk semua seksi','Single template applied to all sections')}
                  </p>
                </div>
              </div>

              {!useAdvanced ? (
                /* Single template */
                <div className='space-y-2'>
                  <label className='text-xs font-bold text-gray-500 uppercase tracking-wide'>
                    {t('Template','Template')}
                  </label>
                  <select value={selectedTplId} onChange={e => { setSelectedTplId(e.target.value); setConfirmed(false) }}
                    className='w-full text-sm px-4 py-2.5 border-2 border-gray-200 rounded-xl outline-none focus:border-red-400 bg-white transition'>
                    <option value=''>— {t('Pilih template','Select a template')} —</option>
                    {activeTemplates.map(tpl => (
                      <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                    ))}
                  </select>
                  {selectedTplObj && (
                    <div className='flex flex-wrap gap-2 mt-2'>
                      <span className='text-xs text-gray-400 mr-1'>{t('Mengandung seksi:','Contains sections:')}</span>
                      {tplSectionBadges.length > 0
                        ? tplSectionBadges.map(b => (
                          <span key={b.label} className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${b.color}`}>{b.label}</span>
                        ))
                        : <span className='text-xs text-gray-400'>{t('Tidak ada seksi terdeteksi','No sections detected')}</span>}
                    </div>
                  )}
                </div>
              ) : (
                /* Advanced: 3 selects */
                <div className='space-y-3'>
                  {[
                    { label:'Onboarding General', value:tplGeneral, onChange:setTplGeneral, options:tplsGeneral },
                    { label:'Onboarding Teknis',  value:tplTeknis,  onChange:setTplTeknis,  options:tplsTeknis },
                    { label:'Periodic Review',    value:tplReview,  onChange:setTplReview,  options:tplsReview },
                  ].map(({ label, value, onChange, options }) => (
                    <div key={label} className='flex items-center gap-3'>
                      <span className='text-xs font-semibold text-gray-600 w-44 flex-shrink-0'>{label}</span>
                      <select value={value} onChange={e => { onChange(e.target.value); setConfirmed(false) }}
                        className='flex-1 text-xs px-3 py-2 border-2 border-gray-200 rounded-xl outline-none focus:border-red-400 bg-white max-w-sm'>
                        <option value=''>— {t('Tidak digunakan','Not used')} —</option>
                        {options.map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
                      </select>
                      {value && <span className='text-green-500 font-bold'>✓</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Program start date */}
              <div className='border-t border-gray-100 pt-4 flex flex-wrap gap-6 items-start'>
                <div className='flex-1 min-w-48'>
                  <label className='text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1'>
                    📅 {t('Tanggal Mulai Program (opsional)','Program Start Date (optional)')}
                  </label>
                  <input type='date' value={progStartDate} onChange={e => setProgStartDate(e.target.value)}
                    className='text-xs px-3 py-2 border-2 border-gray-200 rounded-xl outline-none focus:border-red-400 w-full max-w-xs' />
                </div>

                <div className='flex items-center gap-3'>
                  <Toggle active={autoSubmit} onChange={setAutoSubmit} />
                  <div>
                    <p className='text-xs font-bold text-gray-700'>⚡ {t('Langsung Submit','Auto-submit')}</p>
                    <p className='text-xs text-gray-400'>
                      {autoSubmit
                        ? t('Status Pending, melewati draft','Status Pending, skips draft')
                        : t('Status Draft, HR review terlebih dahulu','Status Draft, HR reviews first')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        {/* ── STEP 2: Criteria ── */}
        {step === 2 && (
          <SectionCard title={t('Kriteria Karyawan','Employee Criteria')} icon='👥'>
            <div className='space-y-5'>
              <div className='flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl'>
                <Toggle active={skipExisting} onChange={v => { setSkipExisting(v); setConfirmed(false) }} />
                <p className='text-xs font-semibold text-amber-800'>
                  {t('Lewati karyawan yang sudah punya onboarding','Skip employees who already have onboarding')}
                </p>
              </div>

              {[
                { label: t('Tipe Kepegawaian','Employment Type'), items: EMP_TYPES.map(e => ({ id:e, name:e })), arr: filterEmpTypes, setArr: setFilterEmpTypes },
                { label: 'Company',    items: companies.map(c => ({ id:c.id, name:c.name||c.companyCode })), arr: filterCompanyIds, setArr: setFilterCompanyIds },
                { label: 'Department', items: departments, arr: filterDeptIds,  setArr: setFilterDeptIds  },
                { label: 'Posisi',     items: positions,   arr: filterPosIds,   setArr: setFilterPosIds   },
              ].map(({ label, items, arr, setArr }) => (
                <div key={label}>
                  <div className='flex items-center justify-between mb-2'>
                    <p className='text-xs font-bold text-gray-500 uppercase tracking-wide'>
                      {label} {arr.length > 0 && <span className='ml-1 text-red-500'>({arr.length})</span>}
                    </p>
                    <div className='flex gap-2'>
                      <button type='button' onClick={() => toggleAll(items, arr, setArr)}
                        className='text-[10px] text-red-500 font-bold hover:underline'>
                        {items.every(i => arr.includes(i.id)) ? t('Hapus Semua','Clear All') : t('Pilih Semua','Select All')}
                      </button>
                      {arr.length > 0 && (
                        <button type='button' onClick={() => { setArr([]); setConfirmed(false) }}
                          className='text-[10px] text-gray-400 font-bold hover:underline'>
                          {t('Reset','Reset')}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2 max-h-32 overflow-y-auto py-1'>
                    {items.map(item => (
                      <Pill key={item.id} label={item.name} active={arr.includes(item.id)}
                        onClick={() => { toggle(arr, setArr, item.id); setConfirmed(false) }} />
                    ))}
                  </div>
                  {arr.length === 0 && (
                    <p className='text-[10px] text-gray-400 mt-1'>{t('Kosong = semua data','Empty = all records')}</p>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* ── STEP 3: Join Date ── */}
        {step === 3 && (
          <SectionCard title={t('Filter Tanggal Bergabung','Join Date Filter')} icon='📅'>
            <div className='space-y-4'>
              <div className='flex flex-wrap gap-2'>
                {[
                  { mode:'all',      label:t('Semua tanggal','All dates') },
                  { mode:'today',    label:t('Hari ini','Today') + ` — ${todayStr()}` },
                  { mode:'tomorrow', label:t('Besok','Tomorrow') + ` — ${tomorrowStr()}` },
                  { mode:'range',    label:t('Rentang tanggal','Date range') },
                ].map(({ mode, label }) => (
                  <RadioBtn key={mode} label={label} active={joinMode===mode}
                    onClick={() => { setJoinMode(mode); setConfirmed(false) }} />
                ))}
              </div>
              {joinMode === 'range' && (
                <div className='flex items-center gap-3 mt-2 p-3 bg-gray-50 rounded-xl'>
                  <div>
                    <p className='text-[10px] text-gray-400 mb-1'>{t('Dari','From')}</p>
                    <input type='date' value={joinFrom} onChange={e => { setJoinFrom(e.target.value); setConfirmed(false) }}
                      className='text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white' />
                  </div>
                  <span className='text-gray-300 mt-4 text-lg'>→</span>
                  <div>
                    <p className='text-[10px] text-gray-400 mb-1'>{t('Sampai','Until')}</p>
                    <input type='date' value={joinTo} onChange={e => { setJoinTo(e.target.value); setConfirmed(false) }}
                      className='text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white' />
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ── STEP 4: Preview & Execute ── */}
        {step === 4 && (
          <>
            {/* Summary Card */}
            {hasAnyTpl && (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                {[
                  { label: t('Template','Template'),  value: useAdvanced
                      ? [tplGeneral && 'General', tplTeknis && 'Teknis', tplReview && 'Review'].filter(Boolean).join(', ') || '—'
                      : (selectedTplObj?.name || '—'),
                    icon:'📋', color:'text-blue-700 bg-blue-50' },
                  { label: t('Kriteria Aktif','Active Filters'), value: criteriaCount || t('Semua','All'), icon:'🎯', color:'text-purple-700 bg-purple-50' },
                  { label: t('Filter Tanggal','Date Filter'), value: joinMode === 'all' ? t('Semua','All') : joinMode === 'range' ? `${joinFrom||'...'} – ${joinTo||'...'}` : joinMode, icon:'📅', color:'text-orange-700 bg-orange-50' },
                  { label: t('Akan Dibuat','Will Create'), value: preview.length, icon:'👥', color:'text-green-700 bg-green-50' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className={`p-3 rounded-xl flex items-center gap-3 ${color}`}>
                    <span className='text-xl'>{icon}</span>
                    <div>
                      <p className='text-[10px] font-semibold opacity-70 uppercase tracking-wide'>{label}</p>
                      <p className='text-sm font-bold truncate max-w-28'>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <SectionCard title={t(`Preview Karyawan (${preview.length})`,`Employee Preview (${preview.length})`)} icon='👁'>
              {!hasAnyTpl ? (
                <div className='py-10 text-center'>
                  <p className='text-2xl mb-2'>📋</p>
                  <p className='text-sm text-gray-400'>{t('Pilih template di Step 1 terlebih dahulu.','Please select a template in Step 1 first.')}</p>
                  <button onClick={() => setStep(1)} className='mt-3 text-xs text-red-500 font-bold hover:underline'>
                    ← {t('Kembali ke Step 1','Back to Step 1')}
                  </button>
                </div>
              ) : preview.length === 0 ? (
                <div className='py-10 text-center'>
                  <p className='text-2xl mb-2'>🔍</p>
                  <p className='text-sm text-gray-400'>{t('Tidak ada karyawan yang sesuai kriteria.','No employees match the selected criteria.')}</p>
                  <button onClick={() => setStep(2)} className='mt-3 text-xs text-red-500 font-bold hover:underline'>
                    ← {t('Ubah kriteria','Edit criteria')}
                  </button>
                </div>
              ) : (
                <div className='overflow-x-auto rounded-xl border border-gray-100'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr style={{ background: BRAND_GRADIENT }}>
                        {['No', t('Nama','Name'), 'NIK', 'Dept', t('Posisi','Position'), t('Tipe','Type'), 'Join Date', t('Seksi','Sections'), 'Status'].map((h,i) => (
                          <th key={i} className='text-left px-3 py-2.5 text-white font-semibold whitespace-nowrap'>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map(({ emp, dept, pos, hasExisting, sections }, idx) => (
                        <tr key={emp.id} className={idx%2===0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className='px-3 py-2 text-gray-400'>{idx+1}</td>
                          <td className='px-3 py-2 font-semibold text-gray-800'>{emp.name}</td>
                          <td className='px-3 py-2 text-gray-500 font-mono'>{emp.nik}</td>
                          <td className='px-3 py-2 text-gray-600'>{dept?.name || '—'}</td>
                          <td className='px-3 py-2 text-gray-600'>{pos?.name || '—'}</td>
                          <td className='px-3 py-2'><span className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full'>{emp.employmentType || '—'}</span></td>
                          <td className='px-3 py-2 text-gray-500'>{emp.joinDate?.slice(0,10) || '—'}</td>
                          <td className='px-3 py-2'>
                            <div className='flex flex-wrap gap-1'>
                              {sections.map(s => (
                                <span key={s} className='px-1.5 py-0.5 bg-red-50 text-red-700 font-semibold rounded text-[10px]'>{s}</span>
                              ))}
                            </div>
                          </td>
                          <td className='px-3 py-2'>
                            {hasExisting
                              ? <span className='px-2 py-0.5 bg-yellow-100 text-yellow-700 font-semibold rounded-full'>{t('Sudah ada','Exists')}</span>
                              : <span className='px-2 py-0.5 bg-green-100 text-green-700 font-semibold rounded-full'>{t('Akan dibuat','Will create')}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>

            {/* Confirmation panel */}
            {hasAnyTpl && preview.length > 0 && confirmed && (
              <div className='p-4 bg-orange-50 border-2 border-orange-300 rounded-xl flex items-start gap-3'>
                <span className='text-xl'>⚠️</span>
                <div>
                  <p className='text-sm font-bold text-orange-800'>
                    {t(`Konfirmasi: ${preview.length} record onboarding akan dibuat`,`Confirm: ${preview.length} onboarding records will be created`)}
                  </p>
                  <p className='text-xs text-orange-600 mt-0.5'>
                    {autoSubmit
                      ? t('Status akan langsung Pending (melewati draft). Tindakan tidak dapat dibatalkan.','Status will be directly Pending (skip draft). This action cannot be undone.')
                      : t('Status akan Draft. HR perlu review sebelum diproses.','Status will be Draft. HR needs to review before processing.')}
                  </p>
                </div>
              </div>
            )}

            {hasAnyTpl && preview.length > 0 && (
              <div className='flex flex-wrap items-center gap-3'>
                <button onClick={handleRun}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl hover:opacity-90 transition
                    ${confirmed ? 'ring-4 ring-orange-300' : ''}`}
                  style={{ background: BRAND_GRADIENT }}>
                  {confirmed
                    ? `✅ ${t(`Konfirmasi Buat ${preview.length} Onboarding`,`Confirm Create ${preview.length} Records`)}`
                    : `⚡ ${t(`Assign ke ${preview.length} Karyawan`,`Assign to ${preview.length} Employees`)}`}
                </button>
                {confirmed && (
                  <button onClick={() => setConfirmed(false)}
                    className='px-5 py-3 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                    {t('Batal','Cancel')}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className='flex items-center justify-between pt-2'>
          <button onClick={prevStep} disabled={step === 1}
            className='flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed'>
            ← {t('Sebelumnya','Previous')}
          </button>

          <div className='flex items-center gap-2'>
            {STEPS.map(s => (
              <button key={s.id} type='button' onClick={() => canProceed(s.id) && setStep(s.id)}
                className={`w-2 h-2 rounded-full transition-all ${step===s.id ? 'w-6 bg-red-500' : 'bg-gray-300 hover:bg-gray-400'}`} />
            ))}
          </div>

          {step < 4 ? (
            <button onClick={nextStep}
              className='flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition'
              style={{ background: BRAND_GRADIENT }}>
              {t('Lanjut','Next')} →
            </button>
          ) : (
            <div className='w-24' />
          )}
        </div>

        {/* Run History */}
        {runHistory.length > 0 && (
          <SectionCard title={t('Riwayat Auto Assign','Auto Assign History')} icon='🕐'>
            <div className='space-y-2'>
              {runHistory.map((run, idx) => (
                <div key={idx} className='flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg text-xs'>
                  <span className='text-green-500 font-bold text-base'>✓</span>
                  <div className='flex-1'>
                    <p className='font-semibold text-gray-700'>{run.template}</p>
                    <p className='text-gray-400'>{run.at}</p>
                  </div>
                  <span className='font-bold text-gray-800'>{run.count} {t('record','records')}</span>
                  {run.autoSubmit && (
                    <span className='px-2 py-0.5 bg-blue-100 text-blue-700 font-semibold rounded-full'>{t('Auto-submit','Auto-submit')}</span>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>
        )}

      </div>
    </div>
  )
}
