'use client'
import { useState, useEffect }           from 'react'
import { useAuthStore }                  from '@/store/authStore'
import { useEmployeeStore }              from '@/store/employeeStore'
import { useStructureStore }             from '@/store/structureStore'
import { useContractEvaluationStore }    from '@/store/contractEvaluationStore'
import { usePositionProfileStore }       from '@/store/positionProfileStore'
import { useT }                          from '@/store/languageStore'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isEligible = (emp) => {
  if (!emp.joinDate) return false
  const monthsWorked = (Date.now() - new Date(emp.joinDate)) / (1000 * 60 * 60 * 24 * 30)
  return monthsWorked >= 2
}

const daysUntilEligible = (emp) => {
  if (!emp.joinDate) return null
  const eligibleDate = new Date(new Date(emp.joinDate).getTime() + 60 * 24 * 60 * 60 * 1000)
  const diff = Math.ceil((eligibleDate - Date.now()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

const daysSinceJoining = (joinDate) => {
  if (!joinDate) return 0
  return Math.floor((Date.now() - new Date(joinDate)) / (1000 * 60 * 60 * 24))
}

const calcScore = (ev) => {
  const cvRated = ev.coreValues.filter(i => i.rating)
  const cbRated = [
    ...ev.coreCompetency,
    ...ev.strategicLeadership,
    ...ev.technicalCompetency,
  ].filter(i => i.rating)
  const cvAvg = cvRated.length ? cvRated.reduce((s, i) => s + Number(i.rating), 0) / cvRated.length : 0
  const cbAvg = cbRated.length ? cbRated.reduce((s, i) => s + Number(i.rating), 0) / cbRated.length : 0
  return Math.round((cvAvg / 4 * 50) + (cbAvg / 4 * 50))
}

const GRAD = { background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }
const FINAL_DECISIONS = ['Passed, to be Permanent', 'Not Passed']
const EXTEND_MONTHS   = ['0', '3', '6', '12']

function RatingSelect({ value, onChange, disabled }) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
      disabled={disabled}
      className='w-44 px-2 py-1 text-xs rounded border border-gray-200 focus:border-red-400 outline-none bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'
    >
      <option value=''>Select</option>
      <option value={1}>1 - Far Below Expectation</option>
      <option value={2}>2 - Slightly Below Expectation</option>
      <option value={3}>3 - Meet Expectation</option>
      <option value={4}>4 - Exceed Expectation</option>
    </select>
  )
}

function GroupHeaderRow({ label, pct }) {
  return (
    <tr style={{ background: '#e5e7eb' }}>
      <td colSpan={3} className='px-4 py-2 font-bold text-gray-700 text-xs uppercase tracking-wide'>{label}</td>
      <td className='px-4 py-2 text-xs font-bold text-gray-700 text-center'>{pct}</td>
      <td className='px-4 py-2'></td>
    </tr>
  )
}

function SubHeaderRow({ label }) {
  return (
    <tr style={{ background: '#f3f4f6' }}>
      <td colSpan={5} className='px-6 py-1.5 text-xs font-semibold text-gray-600 italic'>{label}</td>
    </tr>
  )
}

function AssessmentRow({ item, section, idx, canEdit, onRatingChange }) {
  return (
    <tr className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
      <td className='px-4 py-2 text-center text-xs text-gray-500 w-10'>{item.no}</td>
      <td className='px-4 py-2 text-xs font-medium text-gray-800 w-44'>{item.aspect}</td>
      <td className='px-4 py-2 text-xs text-gray-600 leading-relaxed'>{item.keyBehaviors}</td>
      <td className='px-4 py-2 text-center w-12'></td>
      <td className='px-4 py-2 w-52'>
        <RatingSelect value={item.rating} onChange={val => onRatingChange(section, item.id, val)} disabled={!canEdit} />
      </td>
    </tr>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MSSContractEvaluationPage() {
  const t                                     = useT()
  const { currentUser }                       = useAuthStore()
  const { employees }                         = useEmployeeStore()
  const { companies, departments, positions } = useStructureStore()
  const { evaluations, ensureEvaluation,
          updateEvaluation, submitEvaluation,
          syncFromProfile }                   = useContractEvaluationStore()
  const { profiles: positionProfiles, seed }  = usePositionProfileStore()

  // MSS: only direct reports with Contract employment type
  const myTeam = employees.filter(
    e => e.managerId === currentUser?.id &&
         e.employmentType === 'Contract' &&
         e.joinDate && e.status === 'Active'
  ).sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))

  const [selectedEmpId, setSelectedEmpId] = useState(myTeam[0]?.id ?? null)
  const [form, setForm]                   = useState(null)
  const [msg, setMsg]                     = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3500)
  }

  useEffect(() => { seed() }, []) // eslint-disable-line

  useEffect(() => {
    const fp = usePositionProfileStore.getState().profiles
    myTeam.forEach(emp => {
      const profile = fp.find(pr => pr.positionId === emp.positionId) ?? null
      ensureEvaluation(emp, profile)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myTeam.length])

  useEffect(() => {
    if (!selectedEmpId && myTeam.length > 0) setSelectedEmpId(myTeam[0].id)
  }, [myTeam.length]) // eslint-disable-line

  useEffect(() => {
    if (!selectedEmpId) return
    const emp = myTeam.find(e => e.id === selectedEmpId)
    if (!emp) return
    const fp      = usePositionProfileStore.getState().profiles
    const profile = fp.find(pr => pr.positionId === emp.positionId) ?? null
    const ev      = useContractEvaluationStore.getState().evaluations.find(e => e.employeeId === selectedEmpId)
                    ?? ensureEvaluation(emp, profile)
    if (profile && ev.status !== 'Submitted') syncFromProfile(ev.id, profile)
    const freshEval = useContractEvaluationStore.getState().evaluations.find(e => e.employeeId === selectedEmpId)
    if (freshEval) setForm(JSON.parse(JSON.stringify(freshEval)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmpId])

  const selectedEmp = myTeam.find(e => e.id === selectedEmpId) ?? myTeam[0] ?? null
  const storedEv    = selectedEmp
    ? evaluations.find(ev => ev.employeeId === selectedEmp.id) ?? null
    : null

  if (myTeam.length === 0) {
    return (
      <div className='flex items-center justify-center h-[calc(100vh-56px)] bg-gray-100'>
        <div className='text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200 max-w-sm'>
          <div className='text-4xl mb-3'>👥</div>
          <h2 className='text-base font-bold text-gray-700 mb-2'>
            {t('Tidak Ada Tim Kontrak', 'No Contract Team Members')}
          </h2>
          <p className='text-xs text-gray-500'>
            {t('Anda tidak memiliki bawahan langsung dengan status kontrak saat ini.', 'You have no direct reports with contract status at this time.')}
          </p>
        </div>
      </div>
    )
  }

  if (!selectedEmp || !form) return null

  const eligible  = isEligible(selectedEmp)
  const remaining = daysUntilEligible(selectedEmp)
  const days      = daysSinceJoining(selectedEmp.joinDate)

  const role    = currentUser?.role
  const canEdit = eligible && storedEv?.status !== 'Submitted' &&
                  (storedEv?.managerId === currentUser?.id || role === 'hr' || role === 'superadmin')

  const company  = companies?.find(c => c.id === selectedEmp.companyId)
  const position = positions?.find(p => p.id === selectedEmp.positionId)
  const showStrategicLeadership = (position?.gradeId ?? 0) >= 53

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleRatingChange = (section, itemId, val) => {
    setForm(f => ({
      ...f,
      [section]: f[section].map(item => item.id === itemId ? { ...item, rating: val } : item),
    }))
  }

  const handleSaveProgress = () => {
    if (!form || !storedEv) return
    updateEvaluation(storedEv.id, {
      legalEntity: form.legalEntity, documentNumber: form.documentNumber,
      revision: form.revision, classification: form.classification,
      effectiveDate: form.effectiveDate,
      coreValues: form.coreValues, coreCompetency: form.coreCompetency,
      strategicLeadership: form.strategicLeadership, technicalCompetency: form.technicalCompetency,
      finalDecision: form.finalDecision, extendMonths: form.extendMonths,
      finalEffectiveDate: form.finalEffectiveDate,
      strength: form.strength, areaDevelopment: form.areaDevelopment,
    })
    flash(t('Progress tersimpan.', 'Progress saved.'))
  }

  const handleSubmit = () => {
    if (!form.finalDecision) {
      flash(t('Pilih Final Decision terlebih dahulu.', 'Please select a Final Decision.'), 'error')
      return
    }
    updateEvaluation(storedEv.id, {
      legalEntity: form.legalEntity, documentNumber: form.documentNumber,
      revision: form.revision, classification: form.classification,
      effectiveDate: form.effectiveDate,
      coreValues: form.coreValues, coreCompetency: form.coreCompetency,
      strategicLeadership: form.strategicLeadership, technicalCompetency: form.technicalCompetency,
      finalDecision: form.finalDecision, extendMonths: form.extendMonths,
      finalEffectiveDate: form.finalEffectiveDate,
      strength: form.strength, areaDevelopment: form.areaDevelopment,
    })
    submitEvaluation(storedEv.id, currentUser?.id, currentUser?.name)
    flash(t('Evaluasi berhasil disubmit.', 'Evaluation submitted successfully.'))
  }

  const score = calcScore(form)

  return (
    <div className='flex h-[calc(100vh-56px)] bg-gray-100'>

      {/* ── Left Panel ───────────────────────────────────────────────── */}
      <aside className='w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden'>
        <div className='px-4 py-3 border-b border-gray-200' style={GRAD}>
          <h2 className='text-sm font-bold text-white'>{t('Form Evaluasi Kontrak', 'Form Evaluation (Contract)')}</h2>
          <p className='text-[11px] text-red-200 mt-0.5'>{myTeam.length} {t('anggota tim kontrak', 'contract team members')}</p>
        </div>
        <div className='overflow-y-auto flex-1'>
          {myTeam.map(emp => {
            const ev      = evaluations.find(ev => ev.employeeId === emp.id)
            const elig    = isEligible(emp)
            const rem     = daysUntilEligible(emp)
            const deptObj = departments?.find(d => d.id === emp.departmentId)
            const active  = selectedEmpId === emp.id
            const badgeStatus = !elig ? 'Not Eligible' : (ev?.status ?? 'Pending')
            const badgeCls = {
              Pending:        'bg-yellow-100 text-yellow-700',
              Submitted:      'bg-green-100 text-green-700',
              'Not Eligible': 'bg-gray-200 text-gray-500',
            }[badgeStatus] || 'bg-gray-100 text-gray-600'

            return (
              <button
                key={emp.id}
                onClick={() => setSelectedEmpId(emp.id)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors
                  ${active ? 'bg-red-50 border-l-4 border-l-red-500' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1 min-w-0'>
                    <p className={`text-xs font-semibold truncate ${active ? 'text-red-800' : 'text-gray-800'}`}>{emp.name}</p>
                    <p className='text-[11px] text-gray-500 truncate mt-0.5'>{deptObj?.name ?? '—'}</p>
                    <p className='text-[10px] text-gray-400 mt-0.5'>{t('Bergabung', 'Joined')}: {emp.joinDate}</p>
                    <p className='text-[10px] text-gray-400'>
                      {daysSinceJoining(emp.joinDate)} {t('hari', 'days')}
                      {!elig && rem > 0 && <span className='text-orange-500 ml-1'>· {rem} {t('hari lagi', 'days left')}</span>}
                    </p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${badgeCls}`}>
                    {badgeStatus}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </aside>

      {/* ── Right Panel ──────────────────────────────────────────────── */}
      <main className='flex-1 overflow-y-auto p-6'>

        {msg && (
          <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${
            msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {msg.text}
          </div>
        )}

        {!eligible && (
          <div className='mb-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3'>
            <span className='text-xl'>⏳</span>
            <div>
              <p className='text-xs font-semibold text-orange-700'>{t('Belum Eligible untuk Evaluasi', 'Not Yet Eligible for Evaluation')}</p>
              <p className='text-[11px] text-orange-600 mt-0.5'>
                {t(`Karyawan baru bekerja ${days} hari. Evaluasi tersedia setelah 2 bulan (${remaining} hari lagi).`,
                   `Employee has worked ${days} days. Evaluation available after 2 months (${remaining} more days).`)}
              </p>
            </div>
          </div>
        )}

        {/* Header card */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden'>
          <div className='px-5 py-3 flex items-center justify-between' style={GRAD}>
            <div>
              <p className='text-xs font-bold text-white uppercase tracking-wider'>{t('EVALUATION FORM — CONTRACT', 'EVALUATION FORM — CONTRACT')}</p>
              <p className='text-[11px] text-red-200 mt-0.5'>{selectedEmp.name}</p>
            </div>
            <div className='flex items-center gap-2'>
              {storedEv?.status === 'Submitted' && (
                <span className='px-2 py-0.5 bg-green-400 text-white rounded-full text-[10px] font-bold'>✓ Submitted</span>
              )}
              {canEdit && (
                <button onClick={handleSaveProgress} className='px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition'>
                  💾 {t('Simpan', 'Save')}
                </button>
              )}
            </div>
          </div>

          <div className='px-5 py-3 grid grid-cols-4 gap-4 border-b border-gray-100 bg-gray-50/50'>
            <div>
              <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5'>{t('Nama Karyawan', 'Employee Name')}</p>
              <p className='text-xs font-bold text-gray-800'>{selectedEmp.name}</p>
            </div>
            <div>
              <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5'>{t('Employee ID / NIK', 'Employee ID / NIK')}</p>
              <p className='text-xs font-bold text-gray-800 font-mono'>{selectedEmp.nik || `#${selectedEmp.id}`}</p>
            </div>
            <div>
              <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5'>{t('Jabatan', 'Position')}</p>
              <p className='text-xs font-bold text-gray-800'>{position?.name ?? '—'}</p>
            </div>
            <div>
              <p className='text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5'>{t('Position ID', 'Position ID')}</p>
              <p className='text-xs font-bold text-gray-800 font-mono'>{selectedEmp.positionId || '—'}</p>
            </div>
          </div>

          <div className='px-5 py-4 grid grid-cols-3 gap-4'>
            <div>
              <label className='block text-[11px] font-semibold text-gray-500 mb-1'>{t('Legal Entity', 'Legal Entity')} <span className='text-red-400'>*</span></label>
              <input value={company?.name ?? ''} readOnly className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 bg-gray-50 text-gray-700 cursor-default' />
            </div>
            <div>
              <label className='block text-[11px] font-semibold text-gray-500 mb-1'>{t('No. Dokumen', 'Document Number')}</label>
              <input type='text' value={form.documentNumber} onChange={e => setField('documentNumber', e.target.value)} disabled={!canEdit} placeholder='e.g. HRD/EVL-C/2024/001' className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400' />
            </div>
            <div>
              <label className='block text-[11px] font-semibold text-gray-500 mb-1'>{t('Revisi', 'Revision')}</label>
              <input type='text' value={form.revision} onChange={e => setField('revision', e.target.value)} disabled={!canEdit} placeholder='e.g. 00' className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400' />
            </div>
            <div>
              <label className='block text-[11px] font-semibold text-gray-500 mb-1'>{t('Klasifikasi', 'Classification')}</label>
              <input type='text' value={form.classification} onChange={e => setField('classification', e.target.value)} disabled={!canEdit} placeholder='e.g. Internal' className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400' />
            </div>
            <div>
              <label className='block text-[11px] font-semibold text-gray-500 mb-1'>{t('Tanggal Efektif', 'Effective Date')}</label>
              <input type='date' value={form.effectiveDate} onChange={e => setField('effectiveDate', e.target.value)} disabled={!canEdit} className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400' />
            </div>
          </div>
        </div>

        {/* Assessment table */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden'>
          <div className='px-5 py-3 border-b border-gray-100' style={GRAD}>
            <h2 className='text-xs font-bold text-white uppercase tracking-wide'>{t('Penilaian Aspek', 'Assessment Aspects')}</h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead>
                <tr style={GRAD}>
                  <th className='px-4 py-2.5 text-left text-white font-semibold w-10'>NO</th>
                  <th className='px-4 py-2.5 text-left text-white font-semibold w-44'>{t('Aspek Penilaian', 'Assessment Aspect')}</th>
                  <th className='px-4 py-2.5 text-left text-white font-semibold'>{t('Key Behaviors Based on JCP', 'Key Behaviors Based on JCP')}</th>
                  <th className='px-4 py-2.5 text-center text-white font-semibold w-16'>%</th>
                  <th className='px-4 py-2.5 text-left text-white font-semibold w-52'>{t('Rating', 'Rating')}</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                <GroupHeaderRow label='Core Values' pct='50%' />
                {form.coreValues.map((item, idx) => (
                  <AssessmentRow key={item.id} item={item} section='coreValues' idx={idx} canEdit={canEdit} onRatingChange={handleRatingChange} />
                ))}
                <GroupHeaderRow label='Competency Based' pct='50%' />
                <SubHeaderRow label='A. Core Competency' />
                {form.coreCompetency.map((item, idx) => (
                  <AssessmentRow key={item.id} item={item} section='coreCompetency' idx={idx} canEdit={canEdit} onRatingChange={handleRatingChange} />
                ))}
                {showStrategicLeadership && <>
                  <SubHeaderRow label='B. Strategic Leadership' />
                  {form.strategicLeadership.map((item, idx) => (
                    <AssessmentRow key={item.id} item={item} section='strategicLeadership' idx={idx} canEdit={canEdit} onRatingChange={handleRatingChange} />
                  ))}
                </>}
                <SubHeaderRow label={showStrategicLeadership
                  ? t('C. Technical Competency *Target TC sesuai level posisi', 'C. Technical Competency *Target TC per position level')
                  : t('B. Technical Competency *Target TC sesuai level posisi', 'B. Technical Competency *Target TC per position level')
                } />
                {form.technicalCompetency.map((item, idx) => (
                  <AssessmentRow key={item.id} item={item} section='technicalCompetency' idx={idx} canEdit={canEdit} onRatingChange={handleRatingChange} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary & Decision */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='px-5 py-3 border-b border-gray-100' style={GRAD}>
            <h2 className='text-xs font-bold text-white uppercase tracking-wide'>{t('Keputusan Akhir', 'Final Decision')}</h2>
          </div>
          <div className='p-5 space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Nama Karyawan', 'Employee Name')} <span className='text-red-400'>*</span></label>
                <input value={selectedEmp.name} readOnly className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 bg-gray-50 text-gray-700 cursor-default' />
              </div>
              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Final Score', 'Final Score')}</label>
                <div className={`px-3 py-1.5 text-sm rounded border font-bold text-center
                  ${score >= 75 ? 'bg-green-50 border-green-200 text-green-700'
                    : score >= 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                >
                  {score}
                </div>
              </div>
              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Final Decision', 'Final Decision')} <span className='text-red-400'>*</span></label>
                <select value={form.finalDecision} onChange={e => setField('finalDecision', e.target.value)} disabled={!canEdit}
                  className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400'>
                  <option value=''>Select</option>
                  {FINAL_DECISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Extend Contract (Months)', 'Extend Contract (Months)')}</label>
                <select value={form.extendMonths} onChange={e => setField('extendMonths', e.target.value)}
                  disabled={!canEdit || form.finalDecision === 'Passed, to be Permanent'}
                  className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400'>
                  <option value=''>Select</option>
                  {EXTEND_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Tanggal Efektif Keputusan', 'Decision Effective Date')}</label>
                <input type='date' value={form.finalEffectiveDate} onChange={e => setField('finalEffectiveDate', e.target.value)} disabled={!canEdit}
                  className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400' />
              </div>
            </div>

            <div>
              <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Strength', 'Strength')} <span className='text-red-400'>*</span></label>
              <textarea value={form.strength} onChange={e => setField('strength', e.target.value)} disabled={!canEdit}
                placeholder={t('Tuliskan kekuatan karyawan...', 'Describe employee strengths...')} rows={4}
                className='w-full px-3 py-2 text-xs rounded border border-gray-200 focus:border-red-400 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400' />
            </div>

            <div>
              <label className='block text-[11px] font-semibold text-gray-600 mb-1'>{t('Area Development', 'Area Development')} <span className='text-red-400'>*</span></label>
              <textarea value={form.areaDevelopment} onChange={e => setField('areaDevelopment', e.target.value)} disabled={!canEdit}
                placeholder={t('Tuliskan area pengembangan karyawan...', 'Describe areas for employee development...')} rows={4}
                className='w-full px-3 py-2 text-xs rounded border border-gray-200 focus:border-red-400 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400' />
            </div>

            {canEdit && (
              <div className='flex justify-end gap-3 pt-2 border-t border-gray-100'>
                <button onClick={handleSaveProgress} className='px-5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition'>
                  💾 {t('Simpan Progress', 'Save Progress')}
                </button>
                <button onClick={handleSubmit} className='px-6 py-2 text-xs font-bold text-white rounded-lg hover:opacity-90 transition' style={GRAD}>
                  ✓ SUBMIT
                </button>
              </div>
            )}

            {storedEv?.status === 'Submitted' && (
              <div className='mt-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium'>
                ✅ {t('Evaluasi telah disubmit', 'Evaluation has been submitted')}
                {storedEv.submittedByName && ` ${t('oleh', 'by')} ${storedEv.submittedByName}`}
                {storedEv.submittedAt && ` • ${new Date(storedEv.submittedAt).toLocaleDateString('id-ID')}`}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
