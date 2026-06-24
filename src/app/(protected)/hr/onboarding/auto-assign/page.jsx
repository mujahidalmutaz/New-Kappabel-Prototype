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

const JOIN_DATE_MODES = ['all','today','tomorrow','range']

function todayStr() { return new Date().toISOString().slice(0,10) }
function tomorrowStr() {
  const d = new Date(); d.setDate(d.getDate()+1); return d.toISOString().slice(0,10)
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

export default function AutoAssignOnboardingPage() {
  const t                                    = useT()
  const { templates }                        = useMasterOnboardingStore()
  const { onboardings, addOnboarding }       = useOnboardingStore()
  const { employees }                        = useEmployeeStore()
  const { positions, departments, companies} = useStructureStore()

  // Step 1 — templates
  const [tplGeneral,   setTplGeneral  ] = useState('')
  const [tplTeknis,    setTplTeknis   ] = useState('')
  const [tplReview,    setTplReview   ] = useState('')
  const [autoSubmit,   setAutoSubmit  ] = useState(false)

  // Step 2 — criteria
  const [filterEmpTypes,   setFilterEmpTypes  ] = useState([])
  const [filterDeptIds,    setFilterDeptIds   ] = useState([])
  const [filterCompanyIds, setFilterCompanyIds] = useState([])
  const [filterPosIds,     setFilterPosIds    ] = useState([])
  const [skipExisting,     setSkipExisting    ] = useState(true)

  // Step 3 — join date
  const [joinMode,     setJoinMode    ] = useState('all')
  const [joinFrom,     setJoinFrom    ] = useState('')
  const [joinTo,       setJoinTo      ] = useState('')

  // Step 4 — confirm
  const [confirmed, setConfirmed] = useState(false)
  const [msg,       setMsg       ] = useState(null)

  const flash = (text, type='success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 4000)
  }

  const activeTemplates = templates.filter(t => t.active)

  const tplsGeneral = activeTemplates.filter(t =>
    (t.mainSections ?? []).some(ms => ms.type === 'Onboarding General') ||
    (t.generalItems ?? []).length > 0)

  const tplsTeknis = activeTemplates.filter(t =>
    (t.mainSections ?? []).some(ms => ms.type === 'Onboarding Teknis') ||
    (t.technicalItems ?? []).length > 0)

  const tplsReview = activeTemplates.filter(t => (t.reviewItems ?? []).length > 0)

  const assignedEmpIds = useMemo(
    () => new Set(onboardings.map(o => Number(o.employeeId))),
    [onboardings]
  )

  const preview = useMemo(() => {
    if (!tplGeneral && !tplTeknis && !tplReview) return []

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
    }).map(emp => ({
      emp,
      dept:     departments.find(d => d.id === emp.departmentId),
      company:  companies.find(c => c.id === emp.companyId),
      pos:      positions.find(p => p.id === emp.positionId),
      hasExisting: assignedEmpIds.has(emp.id),
      sections: [
        tplGeneral ? 'General' : null,
        tplTeknis  ? 'Teknis'  : null,
        tplReview  ? 'Periodic Review' : null,
      ].filter(Boolean),
    }))
  }, [tplGeneral, tplTeknis, tplReview, employees, filterEmpTypes, filterDeptIds,
      filterCompanyIds, filterPosIds, skipExisting, joinMode, joinFrom, joinTo,
      assignedEmpIds, departments, companies, positions])

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const handleRun = () => {
    if (!tplGeneral && !tplTeknis && !tplReview)
      return flash(t('Pilih minimal satu template.','Select at least one template.'), 'error')
    if (preview.length === 0)
      return flash(t('Tidak ada karyawan yang sesuai kriteria.','No employees match the criteria.'), 'error')
    if (!confirmed) { setConfirmed(true); return }

    const addRuntime = item => ({ ...item, id: Math.random(), date:'', completed:false })

    const tplG = activeTemplates.find(t => String(t.id) === tplGeneral)
    const tplT = activeTemplates.find(t => String(t.id) === tplTeknis)
    const tplR = activeTemplates.find(t => String(t.id) === tplReview)

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
        buddyAssignment:    { ...BLANK_BUDDY },
        createdVia:         'auto-assign',
        ...(autoSubmit ? { workflowStatus:'Pending', submittedAt: new Date().toISOString() } : {}),
      })
      count++
    })

    flash(t(`${count} onboarding berhasil dibuat.`,`${count} onboarding records created.`))
    setConfirmed(false)
    setTplGeneral(''); setTplTeknis(''); setTplReview('')
    setFilterEmpTypes([]); setFilterDeptIds([]); setFilterCompanyIds([]); setFilterPosIds([])
    setJoinMode('all')
  }

  const TplSelect = ({ label, value, onChange, options }) => (
    <div className='flex items-center gap-3'>
      <span className='text-xs font-semibold text-gray-700 w-52 flex-shrink-0'>{label}</span>
      <select value={value} onChange={e => { onChange(e.target.value); setConfirmed(false) }}
        className='text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white flex-1 max-w-sm'>
        <option value=''>— {t('Tidak digunakan','Not used')} —</option>
        {options.map(tpl => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
      </select>
      {value && <span className='text-xs text-green-600 font-semibold'>✓</span>}
    </div>
  )

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

      <div className='space-y-5'>

        {/* Step 1 */}
        <SectionCard title={t('1. Pilih Template','1. Select Templates')} icon='📋'>
          <div className='space-y-4'>
            <TplSelect label='Onboarding General' value={tplGeneral} onChange={setTplGeneral} options={tplsGeneral} />
            <TplSelect label='Onboarding Teknis'  value={tplTeknis}  onChange={setTplTeknis}  options={tplsTeknis} />
            <TplSelect label='Periodic Review'        value={tplReview}  onChange={setTplReview}  options={tplsReview} />

            <div className='pt-2 border-t border-gray-100 flex items-center gap-3'>
              <button type='button' onClick={() => setAutoSubmit(v => !v)}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${autoSubmit ? 'bg-blue-500' : 'bg-gray-200'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${autoSubmit ? 'left-5' : 'left-1'}`} />
              </button>
              <div>
                <span className='text-xs font-semibold text-gray-700'>⚡ {t('Langsung Submit setelah assign','Auto-submit after assign')}</span>
                <p className='text-xs text-gray-400 mt-0.5'>
                  {autoSubmit
                    ? t('Onboarding langsung Pending, melewati review HR','Onboarding goes directly to Pending, skipping HR review')
                    : t('Onboarding tetap Draft, HR perlu review terlebih dahulu','Onboarding stays Draft, HR needs to review first')}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Step 2 */}
        <SectionCard title={t('2. Kriteria Karyawan','2. Employee Criteria')} icon='👥'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <button type='button' onClick={() => { setSkipExisting(v => !v); setConfirmed(false) }}
                className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${skipExisting ? 'bg-red-500' : 'bg-gray-200'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${skipExisting ? 'left-5' : 'left-1'}`} />
              </button>
              <span className='text-xs font-semibold text-gray-700'>{t('Lewati karyawan yang sudah punya onboarding','Skip employees who already have onboarding')}</span>
            </div>

            {[
              { label: t('Tipe Kepegawaian','Employment Type'), items: EMP_TYPES.map(e => ({ id:e, name:e })), arr: filterEmpTypes, setArr: setFilterEmpTypes },
              { label: 'Company',     items: companies.map(c => ({ id:c.id, name:c.name||c.companyCode })), arr: filterCompanyIds, setArr: setFilterCompanyIds },
              { label: 'Department',  items: departments, arr: filterDeptIds,  setArr: setFilterDeptIds  },
              { label: 'Posisi',      items: positions,   arr: filterPosIds,   setArr: setFilterPosIds   },
            ].map(({ label, items, arr, setArr }) => (
              <div key={label}>
                <p className='text-xs font-bold text-gray-500 uppercase tracking-wide mb-2'>
                  {label} <span className='normal-case font-normal text-gray-400'>({t('kosong = semua','empty = all')})</span>
                </p>
                <div className='flex flex-wrap gap-2 max-h-28 overflow-y-auto'>
                  {items.map(item => (
                    <Pill key={item.id} label={item.name} active={arr.includes(item.id)}
                      onClick={() => { toggle(arr, setArr, item.id); setConfirmed(false) }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Step 3 */}
        <SectionCard title={t('3. Filter Join Date','3. Join Date Filter')} icon='📅'>
          <div className='space-y-3'>
            <div className='flex flex-wrap gap-2'>
              {[
                { mode:'all',      label:t('Semua','All') },
                { mode:'today',    label:t('Hari ini','Today') + ` (${todayStr()})` },
                { mode:'tomorrow', label:t('Besok','Tomorrow') + ` (${tomorrowStr()})` },
                { mode:'range',    label:t('Rentang tanggal','Date range') },
              ].map(({ mode, label }) => (
                <RadioBtn key={mode} label={label} active={joinMode===mode}
                  onClick={() => { setJoinMode(mode); setConfirmed(false) }} />
              ))}
            </div>
            {joinMode === 'range' && (
              <div className='flex items-center gap-3 mt-2'>
                <input type='date' value={joinFrom} onChange={e => { setJoinFrom(e.target.value); setConfirmed(false) }}
                  className='text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                <span className='text-gray-400 text-xs'>—</span>
                <input type='date' value={joinTo} onChange={e => { setJoinTo(e.target.value); setConfirmed(false) }}
                  className='text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
            )}
          </div>
        </SectionCard>

        {/* Step 4 — Preview */}
        <SectionCard title={t(`4. Preview Karyawan (${preview.length})`,`4. Employee Preview (${preview.length})`)} icon='👁'>
          {!tplGeneral && !tplTeknis && !tplReview ? (
            <p className='text-sm text-gray-400 py-4 text-center'>{t('Pilih minimal satu template untuk melihat preview.','Select at least one template to see a preview.')}</p>
          ) : preview.length === 0 ? (
            <p className='text-sm text-gray-400 py-4 text-center'>{t('Tidak ada karyawan yang sesuai kriteria.','No employees match the selected criteria.')}</p>
          ) : (
            <div className='overflow-x-auto rounded-xl border border-gray-100'>
              <table className='w-full text-xs'>
                <thead>
                  <tr style={{ background: BRAND_GRADIENT }}>
                    {['No', t('Nama','Name'), 'NIK', 'Dept', t('Posisi','Position'), t('Tipe','Type'), 'Join Date', t('Sections','Sections'), 'Status'].map((h,i) => (
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

        {/* Action */}
        {(tplGeneral || tplTeknis || tplReview) && preview.length > 0 && (
          <div className='flex items-center gap-4'>
            <button onClick={handleRun}
              className='flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl hover:opacity-90 transition'
              style={{ background: BRAND_GRADIENT }}>
              ⚡ {confirmed
                ? t(`Konfirmasi — Buat ${preview.length} Onboarding`,`Confirm — Create ${preview.length} Records`)
                : t(`Assign ke ${preview.length} Karyawan`,`Assign to ${preview.length} Employees`)}
            </button>
            {confirmed && (
              <button onClick={() => setConfirmed(false)}
                className='px-5 py-3 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                {t('Batal','Cancel')}
              </button>
            )}
            {confirmed && (
              <span className='text-xs text-orange-600 font-semibold animate-pulse'>
                ⚠️ {t('Klik sekali lagi untuk memproses','Click once more to proceed')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
