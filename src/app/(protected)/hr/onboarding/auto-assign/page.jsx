'use client'
import { useState, useMemo }          from 'react'
import { useMasterOnboardingStore }    from '@/store/masterOnboardingStore'
import { useOnboardingStore }          from '@/store/onboardingStore'
import { useEmployeeStore }            from '@/store/employeeStore'
import { useStructureStore }           from '@/store/structureStore'
import { useT }                        from '@/store/languageStore'
import { PageHeader, SectionCard, ActionButton, BRAND_GRADIENT } from '@/components/ui'
import { EMP_TYPES }                   from '@/utils/constants'

const BLANK_BUDDY = {
  buddyEmpId: '', buddyName: '', buddyPosition: '',
  programDuration: '', programDurationUnit: 'Bulan',
  programStartDate: '', programEndDate: '', hrbpNotes: '',
}

export default function AutoAssignOnboardingPage() {
  const t                                = useT()
  const { templates }                    = useMasterOnboardingStore()
  const { onboardings, addOnboarding }   = useOnboardingStore()
  const { employees }                    = useEmployeeStore()
  const { positions, departments, companies } = useStructureStore()

  const [selectedTplId,      setSelectedTplId     ] = useState('')
  const [filterEmpTypes,     setFilterEmpTypes     ] = useState([])
  const [filterDeptIds,      setFilterDeptIds      ] = useState([])
  const [filterCompanyIds,   setFilterCompanyIds   ] = useState([])
  const [skipExisting,       setSkipExisting       ] = useState(true)
  const [msg,                setMsg                ] = useState(null)
  const [confirmed,          setConfirmed          ] = useState(false)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 4000)
  }

  const activeTemplates = templates.filter(t => t.active)
  const selectedTpl     = activeTemplates.find(t => String(t.id) === String(selectedTplId))

  const assignedEmpIds = useMemo(
    () => new Set(onboardings.map(o => Number(o.employeeId))),
    [onboardings]
  )

  const preview = useMemo(() => {
    if (!selectedTpl) return []
    return employees
      .filter(emp => {
        if (emp.status !== 'Active') return false
        if (skipExisting && assignedEmpIds.has(emp.id)) return false
        if (filterEmpTypes.length   && !filterEmpTypes.includes(emp.employmentType)) return false
        if (filterDeptIds.length    && !filterDeptIds.includes(emp.departmentId))   return false
        if (filterCompanyIds.length && !filterCompanyIds.includes(emp.companyId))   return false
        return true
      })
      .map(emp => ({
        emp,
        dept:     departments.find(d => d.id === emp.departmentId),
        company:  companies.find(c => c.id === emp.companyId),
        hasExisting: assignedEmpIds.has(emp.id),
      }))
  }, [selectedTpl, employees, filterEmpTypes, filterDeptIds, filterCompanyIds, skipExisting, assignedEmpIds, departments, companies])

  const toggleArr = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const handleRun = () => {
    if (!selectedTpl) return flash(t('Pilih template terlebih dahulu.', 'Please select a template.'), 'error')
    if (preview.length === 0) return flash(t('Tidak ada karyawan yang sesuai kriteria.', 'No employees match the criteria.'), 'error')
    if (!confirmed) { setConfirmed(true); return }

    const addRuntime = item => ({ ...item, id: Math.random(), date: '', completed: false })
    let count = 0

    preview.forEach(({ emp }) => {
      const supervisor = employees.find(e => e.id === emp.managerId)
      const dept       = departments.find(d => d.id === emp.departmentId)

      let mainSections = (selectedTpl.mainSections ?? []).filter(ms => ms.type).map(ms => ({
        ...ms,
        id:       `ms_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        sections: (ms.sections ?? []).map(s => ({ ...s })),
        items:    (ms.items    ?? []).map(addRuntime),
      }))
      if (mainSections.length === 0) {
        const genSec   = (selectedTpl.generalSections  ?? []).map(s => ({ ...s }))
        const genItem  = (selectedTpl.generalItems     ?? []).map(addRuntime)
        const techSec  = (selectedTpl.technicalSections ?? []).map(s => ({ ...s }))
        const techItem = (selectedTpl.technicalItems   ?? []).map(addRuntime)
        if (genItem.length || genSec.length)
          mainSections.push({ id: `ms_gen_${Date.now()}`, type: 'Materi Induksi General', sections: genSec, items: genItem })
        if (techItem.length || techSec.length)
          mainSections.push({ id: `ms_tech_${Date.now()}`, type: 'Materi Induksi Teknis', sections: techSec, items: techItem })
      }

      const rawReview  = (selectedTpl.reviewItems ?? []).map(addRuntime)
      const reviewItems = rawReview.length > 0
        ? rawReview.map(item => item.isDirectManager
            ? { ...item, reviewerEmpId: String(supervisor?.id ?? ''), reviewerName: supervisor?.name ?? 'Direct Manager', reviewerPosition: '' }
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
      })
      count++
    })

    flash(t(`${count} onboarding berhasil dibuat.`, `${count} onboarding records created successfully.`))
    setConfirmed(false)
    setSelectedTplId('')
    setFilterEmpTypes([])
    setFilterDeptIds([])
    setFilterCompanyIds([])
  }

  const tplType = (() => {
    if (!selectedTpl) return ''
    const ms = (selectedTpl.mainSections ?? []).find(s => s.type)
    if (ms) return ms.type
    if ((selectedTpl.generalItems  ?? []).length) return 'Materi Induksi General'
    if ((selectedTpl.technicalItems ?? []).length) return 'Materi Induksi Teknis'
    if ((selectedTpl.reviewItems   ?? []).length) return 'Periodic Review'
    return ''
  })()

  return (
    <div>
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold
          ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{msg.text}</span>
        </div>
      )}

      <PageHeader
        icon='⚡'
        title={t('Auto Assign Onboarding', 'Auto Assign Onboarding')}
        subtitle={t('Assign template onboarding ke banyak karyawan sekaligus berdasarkan kriteria.', 'Assign an onboarding template to multiple employees at once based on criteria.')}
      />

      <div className='space-y-5'>

        {/* Step 1 — Pilih Template */}
        <SectionCard title={t('1. Pilih Template', '1. Select Template')} icon='📋'>
          <div className='space-y-3'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {activeTemplates.length === 0 ? (
                <p className='text-sm text-gray-400 col-span-2'>{t('Belum ada template aktif.', 'No active templates.')}</p>
              ) : activeTemplates.map(tpl => {
                const ms = (tpl.mainSections ?? []).find(s => s.type)
                const type = ms?.type
                  || ((tpl.generalItems  ?? []).length ? 'Materi Induksi General' : '')
                  || ((tpl.technicalItems ?? []).length ? 'Materi Induksi Teknis' : '')
                  || ((tpl.reviewItems   ?? []).length ? 'Periodic Review' : '')
                const isSelected = String(tpl.id) === String(selectedTplId)
                return (
                  <button key={tpl.id} type='button'
                    onClick={() => { setSelectedTplId(String(tpl.id)); setConfirmed(false) }}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition
                      ${isSelected ? 'border-red-400 bg-red-50' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}>
                    <span className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'border-red-500 bg-red-500' : 'border-gray-300'}`}>
                      {isSelected && <span className='w-2 h-2 rounded-full bg-white' />}
                    </span>
                    <div className='flex-1 min-w-0'>
                      <div className='text-sm font-semibold text-gray-800'>{tpl.name}</div>
                      {tpl.description && <div className='text-xs text-gray-400 mt-0.5 line-clamp-2'>{tpl.description}</div>}
                      {type && (
                        <span className='inline-block mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700'>{type}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </SectionCard>

        {/* Step 2 — Kriteria Karyawan */}
        <SectionCard title={t('2. Kriteria Karyawan', '2. Employee Criteria')} icon='👥'>
          <div className='space-y-5'>

            {/* Skip existing toggle */}
            <div className='flex items-center gap-3'>
              <button type='button' onClick={() => setSkipExisting(v => !v)}
                className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 relative ${skipExisting ? 'bg-red-500' : 'bg-gray-200'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${skipExisting ? 'left-5' : 'left-1'}`} />
              </button>
              <span className='text-xs font-semibold text-gray-700'>
                {t('Lewati karyawan yang sudah memiliki onboarding', 'Skip employees who already have an onboarding record')}
              </span>
            </div>

            {/* Employment Type */}
            <div>
              <p className='text-xs font-bold text-gray-600 uppercase tracking-wide mb-2'>
                {t('Tipe Kepegawaian', 'Employment Type')}
                <span className='normal-case font-normal text-gray-400 ml-1'>({t('kosong = semua', 'empty = all')})</span>
              </p>
              <div className='flex flex-wrap gap-2'>
                {EMP_TYPES.map(et => {
                  const on = filterEmpTypes.includes(et)
                  return (
                    <button key={et} type='button'
                      onClick={() => { toggleArr(filterEmpTypes, setFilterEmpTypes, et); setConfirmed(false) }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition
                        ${on ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'}`}>
                      {et}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Company */}
            <div>
              <p className='text-xs font-bold text-gray-600 uppercase tracking-wide mb-2'>
                Company
                <span className='normal-case font-normal text-gray-400 ml-1'>({t('kosong = semua', 'empty = all')})</span>
              </p>
              <div className='flex flex-wrap gap-2'>
                {companies.map(c => {
                  const on = filterCompanyIds.includes(c.id)
                  return (
                    <button key={c.id} type='button'
                      onClick={() => { toggleArr(filterCompanyIds, setFilterCompanyIds, c.id); setConfirmed(false) }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition
                        ${on ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'}`}>
                      {c.name || c.companyCode}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Department */}
            <div>
              <p className='text-xs font-bold text-gray-600 uppercase tracking-wide mb-2'>
                Department
                <span className='normal-case font-normal text-gray-400 ml-1'>({t('kosong = semua', 'empty = all')})</span>
              </p>
              <div className='flex flex-wrap gap-2 max-h-36 overflow-y-auto'>
                {departments.map(d => {
                  const on = filterDeptIds.includes(d.id)
                  return (
                    <button key={d.id} type='button'
                      onClick={() => { toggleArr(filterDeptIds, setFilterDeptIds, d.id); setConfirmed(false) }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition
                        ${on ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-red-300'}`}>
                      {d.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Step 3 — Preview */}
        <SectionCard
          title={t(`3. Preview Karyawan (${preview.length})`, `3. Employee Preview (${preview.length})`)}
          icon='👁'>
          {!selectedTpl ? (
            <p className='text-sm text-gray-400 py-4 text-center'>{t('Pilih template untuk melihat preview.', 'Select a template to see a preview.')}</p>
          ) : preview.length === 0 ? (
            <p className='text-sm text-gray-400 py-4 text-center'>{t('Tidak ada karyawan yang sesuai kriteria.', 'No employees match the selected criteria.')}</p>
          ) : (
            <div className='overflow-x-auto rounded-xl border border-gray-100'>
              <table className='w-full text-xs'>
                <thead>
                  <tr style={{ background: BRAND_GRADIENT }}>
                    {['No', t('Nama Karyawan', 'Employee Name'), 'NIK', 'Company', 'Department',
                      t('Tipe', 'Type'), t('Status Onboarding', 'Onboarding Status')].map((h, i) => (
                      <th key={i} className='text-left px-3 py-2.5 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map(({ emp, dept, company, hasExisting }, idx) => (
                    <tr key={emp.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className='px-3 py-2 text-gray-400'>{idx + 1}</td>
                      <td className='px-3 py-2 font-semibold text-gray-800'>{emp.name}</td>
                      <td className='px-3 py-2 text-gray-500 font-mono'>{emp.nik}</td>
                      <td className='px-3 py-2 text-gray-600'>{company?.name || company?.companyCode || '—'}</td>
                      <td className='px-3 py-2 text-gray-600'>{dept?.name || '—'}</td>
                      <td className='px-3 py-2'>
                        <span className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full'>{emp.employmentType || '—'}</span>
                      </td>
                      <td className='px-3 py-2'>
                        {hasExisting
                          ? <span className='px-2 py-0.5 bg-yellow-100 text-yellow-700 font-semibold rounded-full'>{t('Sudah ada', 'Already exists')}</span>
                          : <span className='px-2 py-0.5 bg-green-100 text-green-700 font-semibold rounded-full'>{t('Akan dibuat', 'Will be created')}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Action */}
        {selectedTpl && preview.length > 0 && (
          <div className='flex items-center gap-4'>
            {confirmed ? (
              <>
                <button onClick={handleRun}
                  className='flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl hover:opacity-90 transition'
                  style={{ background: BRAND_GRADIENT }}>
                  ⚡ {t(`Ya, Buat ${preview.length} Onboarding`, `Yes, Create ${preview.length} Onboarding Records`)}
                </button>
                <button onClick={() => setConfirmed(false)}
                  className='px-5 py-3 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                  {t('Batal', 'Cancel')}
                </button>
                <span className='text-xs text-orange-600 font-semibold'>
                  {t('Konfirmasi: klik sekali lagi untuk memproses.', 'Confirm: click once more to proceed.')}
                </span>
              </>
            ) : (
              <button onClick={handleRun}
                className='flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl hover:opacity-90 transition'
                style={{ background: BRAND_GRADIENT }}>
                ⚡ {t(`Assign ke ${preview.length} Karyawan`, `Assign to ${preview.length} Employees`)}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
