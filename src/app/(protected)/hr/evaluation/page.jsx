'use client'
import { useState, useEffect }    from 'react'
import { useAuthStore }           from '@/store/authStore'
import { useEmployeeStore }       from '@/store/employeeStore'
import { useStructureStore }      from '@/store/structureStore'
import { useEvaluationStore }      from '@/store/evaluationStore'
import { usePositionProfileStore } from '@/store/positionProfileStore'
import { useT }                    from '@/store/languageStore'

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

const HEADER_GRAD = { background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }

// ─── Rating Select ─────────────────────────────────────────────────────────────
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

// ─── Section Group Header Row ─────────────────────────────────────────────────
function GroupHeaderRow({ label, pct }) {
  return (
    <tr style={{ background: '#e5e7eb' }}>
      <td colSpan={3} className='px-4 py-2 font-bold text-gray-700 text-xs uppercase tracking-wide'>
        {label}
      </td>
      <td className='px-4 py-2 text-xs font-bold text-gray-700 text-center'>{pct}</td>
      <td className='px-4 py-2'></td>
    </tr>
  )
}

// ─── Sub-section Header Row ───────────────────────────────────────────────────
function SubHeaderRow({ label }) {
  return (
    <tr style={{ background: '#f3f4f6' }}>
      <td colSpan={5} className='px-6 py-1.5 text-xs font-semibold text-gray-600 italic'>
        {label}
      </td>
    </tr>
  )
}

// ─── Assessment Row ───────────────────────────────────────────────────────────
function AssessmentRow({ item, section, idx, canEdit, onRatingChange, striped }) {
  return (
    <tr className={striped ? 'bg-white' : 'bg-gray-50/40'}>
      <td className='px-4 py-2 text-center text-xs text-gray-500 w-10'>{item.no}</td>
      <td className='px-4 py-2 text-xs font-medium text-gray-800 w-44'>{item.aspect}</td>
      <td className='px-4 py-2 text-xs text-gray-600 leading-relaxed'>{item.keyBehaviors}</td>
      <td className='px-4 py-2 text-center w-12'></td>
      <td className='px-4 py-2 w-52'>
        <RatingSelect
          value={item.rating}
          onChange={val => onRatingChange(section, item.id, val)}
          disabled={!canEdit}
        />
      </td>
    </tr>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cls = {
    Pending:   'bg-yellow-100 text-yellow-700',
    Submitted: 'bg-green-100 text-green-700',
  }[status] || 'bg-gray-100 text-gray-600'
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{status}</span>
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HREvaluationPage() {
  const t                                   = useT()
  const { currentUser }                     = useAuthStore()
  const { employees }                       = useEmployeeStore()
  const { companies, departments, positions } = useStructureStore()
  const { evaluations, ensureEvaluation,
          updateEvaluation, submitEvaluation,
          syncFromProfile }                     = useEvaluationStore()
  const { profiles: positionProfiles, seed }   = usePositionProfileStore()

  // Employees list: active + have joinDate, sorted by joinDate desc
  const empList = employees
    .filter(e => e.joinDate && e.status === 'Active' && e.employmentType !== 'Contract')
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))

  const [selectedEmpId, setSelectedEmpId] = useState(empList[0]?.id ?? null)
  const [form, setForm]                   = useState(null)
  const [msg, setMsg]                     = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3500)
  }

  // Seed position profiles once on mount
  useEffect(() => { seed() }, []) // eslint-disable-line

  // Ensure evaluations exist for all visible employees
  useEffect(() => {
    const fp = usePositionProfileStore.getState().profiles
    empList.forEach(emp => {
      const profile = fp.find(pr => pr.positionId === emp.positionId) ?? null
      ensureEvaluation(emp, profile)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empList.length])

  // When selected employee changes: sync competencies from profile, then load form
  useEffect(() => {
    if (!selectedEmpId) return
    const emp = empList.find(e => e.id === selectedEmpId)
    if (!emp) return
    const fp      = usePositionProfileStore.getState().profiles
    const profile = fp.find(pr => pr.positionId === emp.positionId) ?? null
    const ev      = useEvaluationStore.getState().evaluations.find(e => e.employeeId === selectedEmpId)
                    ?? ensureEvaluation(emp, profile)
    if (profile && ev.status !== 'Submitted') syncFromProfile(ev.id, profile)
    const freshEval = useEvaluationStore.getState().evaluations.find(e => e.employeeId === selectedEmpId)
    if (freshEval) setForm(JSON.parse(JSON.stringify(freshEval)))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmpId])

  // Selected employee + evaluation (for rendering)
  const selectedEmp = empList.find(e => e.id === selectedEmpId) ?? empList[0] ?? null
  const storedEv    = selectedEmp
    ? evaluations.find(ev => ev.employeeId === selectedEmp.id) ?? null
    : null

  if (!selectedEmp || !form) return null

  const eligible  = isEligible(selectedEmp)
  const remaining = daysUntilEligible(selectedEmp)
  const days      = daysSinceJoining(selectedEmp.joinDate)

  const role     = currentUser?.role
  const canEdit  = eligible && storedEv?.status !== 'Submitted' &&
                   (role === 'hr' || role === 'superadmin' || storedEv?.managerId === currentUser?.id)

  // Company name for legal entity
  const company  = companies?.find(c => c.id === selectedEmp.companyId)
  const dept     = departments?.find(d => d.id === selectedEmp.departmentId)
  const position = positions?.find(p => p.id === selectedEmp.positionId)
  const showStrategicLeadership = (position?.gradeId ?? 0) >= 53

  // ── Local state updaters ───────────────────────────────────────────────────
  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleRatingChange = (section, itemId, val) => {
    setForm(f => ({
      ...f,
      [section]: f[section].map(item => item.id === itemId ? { ...item, rating: val } : item),
    }))
  }

  // Auto-save on any form change (debounce via blur or explicit save on navigate)
  const handleSaveProgress = () => {
    if (!form || !storedEv) return
    updateEvaluation(storedEv.id, {
      legalEntity:     form.legalEntity,
      documentNumber:  form.documentNumber,
      revision:        form.revision,
      classification:  form.classification,
      effectiveDate:   form.effectiveDate,
      coreValues:          form.coreValues,
      coreCompetency:      form.coreCompetency,
      strategicLeadership: form.strategicLeadership,
      technicalCompetency: form.technicalCompetency,
      finalDecision:       form.finalDecision,
      finalEffectiveDate:  form.finalEffectiveDate,
      strength:            form.strength,
      areaDevelopment:     form.areaDevelopment,
    })
    flash(t('Progress tersimpan.', 'Progress saved.'))
  }

  const handleSubmit = () => {
    if (!form.finalDecision) {
      flash(t('Pilih Final Decision terlebih dahulu.', 'Please select a Final Decision.'), 'error')
      return
    }
    // Save latest form data then submit
    updateEvaluation(storedEv.id, {
      legalEntity:     form.legalEntity,
      documentNumber:  form.documentNumber,
      revision:        form.revision,
      classification:  form.classification,
      effectiveDate:   form.effectiveDate,
      coreValues:          form.coreValues,
      coreCompetency:      form.coreCompetency,
      strategicLeadership: form.strategicLeadership,
      technicalCompetency: form.technicalCompetency,
      finalDecision:       form.finalDecision,
      finalEffectiveDate:  form.finalEffectiveDate,
      strength:            form.strength,
      areaDevelopment:     form.areaDevelopment,
    })
    submitEvaluation(storedEv.id, currentUser?.id, currentUser?.name)
    flash(t('Evaluasi berhasil disubmit.', 'Evaluation submitted successfully.'))
  }

  const score = calcScore(form)

  return (
    <div className='flex h-[calc(100vh-56px)] bg-gray-100'>

      {/* ── Left Panel: Employee List ────────────────────────────────────── */}
      <aside className='w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden'>
        <div className='px-4 py-3 border-b border-gray-200' style={HEADER_GRAD}>
          <h2 className='text-sm font-bold text-white'>{t('Form Evaluasi', 'Form Evaluation')}</h2>
          <p className='text-[11px] text-red-200 mt-0.5'>{empList.length} {t('karyawan aktif', 'active employees')}</p>
        </div>

        <div className='overflow-y-auto flex-1'>
          {empList.map(emp => {
            const ev      = evaluations.find(ev => ev.employeeId === emp.id)
            const elig    = isEligible(emp)
            const rem     = daysUntilEligible(emp)
            const deptObj = departments?.find(d => d.id === emp.departmentId)
            const active  = selectedEmpId === emp.id

            const badgeStatus = !elig ? 'Not Eligible' : (ev?.status ?? 'Pending')
            const badgeCls = {
              Pending:      'bg-yellow-100 text-yellow-700',
              Submitted:    'bg-green-100 text-green-700',
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
                    <p className={`text-xs font-semibold truncate ${active ? 'text-red-800' : 'text-gray-800'}`}>
                      {emp.name}
                    </p>
                    <p className='text-[11px] text-gray-500 truncate mt-0.5'>{deptObj?.name ?? '—'}</p>
                    <p className='text-[10px] text-gray-400 mt-0.5'>
                      {t('Bergabung', 'Joined')}: {emp.joinDate}
                    </p>
                    <p className='text-[10px] text-gray-400'>
                      {daysSinceJoining(emp.joinDate)} {t('hari', 'days')}
                      {!elig && rem > 0 && (
                        <span className='text-orange-500 ml-1'>· {rem} {t('hari lagi', 'days left')}</span>
                      )}
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

      {/* ── Right Panel: Evaluation Form ─────────────────────────────────── */}
      <main className='flex-1 overflow-y-auto p-6'>

        {/* Flash message */}
        {msg && (
          <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium ${
            msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {msg.text}
          </div>
        )}

        {/* Not Eligible Banner */}
        {!eligible && (
          <div className='mb-4 px-4 py-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-sm flex items-center gap-2'>
            <span className='text-lg'>⏳</span>
            <span>
              <strong>{t('Belum Dapat Dievaluasi', 'Not Yet Eligible')}:</strong>{' '}
              {t(
                `Karyawan ini baru bergabung ${days} hari yang lalu. Dapat dievaluasi dalam ${remaining} hari lagi (minimal 2 bulan masa kerja).`,
                `This employee joined ${days} days ago. Eligible to be evaluated in ${remaining} more days (minimum 2 months tenure).`
              )}
            </span>
          </div>
        )}

        {/* Already Submitted Banner */}
        {storedEv?.status === 'Submitted' && (
          <div className='mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2'>
            <span className='text-lg'>✅</span>
            <span>
              <strong>{t('Sudah Disubmit', 'Already Submitted')}:</strong>{' '}
              {t('Formulir evaluasi ini telah disubmit oleh', 'This evaluation form was submitted by')}{' '}
              <strong>{storedEv.submittedByName}</strong>{' '}
              {t('pada', 'on')}{' '}
              {storedEv.submittedAt ? new Date(storedEv.submittedAt).toLocaleString() : '—'}.
            </span>
          </div>
        )}

        {/* Page Title */}
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h1 className='text-lg font-bold text-gray-800'>
              {t('Form Evaluasi Masa Percobaan', 'Probation Evaluation Form')}
            </h1>
            <p className='text-xs text-gray-500 mt-0.5'>{t('Masa Probasi: 3 Bulan', 'Probation Period: 3 Months')}</p>
          </div>
          <div className='flex gap-2'>
            {canEdit && (
              <button
                onClick={handleSaveProgress}
                className='px-4 py-2 text-xs font-semibold rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors'
              >
                {t('Simpan Progress', 'Save Progress')}
              </button>
            )}
          </div>
        </div>

        {/* ── Card 1: Header Fields ──────────────────────────────────────── */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden'>
          <div className='px-5 py-3 border-b border-gray-100' style={HEADER_GRAD}>
            <h2 className='text-xs font-bold text-white uppercase tracking-wide'>
              {t('Informasi Dokumen', 'Document Information')}
            </h2>
          </div>
          <div className='p-5 flex flex-col gap-4'>

            {/* ── Employee Info ── */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-3 pb-4 border-b border-gray-100'>
              <div>
                <label className='block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide'>
                  {t('Nama Karyawan', 'Employee Name')} <span className='text-red-400'>*</span>
                </label>
                <p className='text-sm font-bold text-gray-800'>{selectedEmp.name}</p>
              </div>
              <div>
                <label className='block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide'>
                  {t('Employee ID / NIK', 'Employee ID / NIK')}
                </label>
                <p className='text-sm font-bold text-gray-800 font-mono'>{selectedEmp.nik || `#${selectedEmp.id}`}</p>
              </div>
              <div>
                <label className='block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide'>
                  {t('Jabatan / Position', 'Position')}
                </label>
                <p className='text-sm font-bold text-gray-800'>{position?.name ?? '—'}</p>
              </div>
              <div>
                <label className='block text-[11px] font-semibold text-gray-500 mb-1 uppercase tracking-wide'>
                  {t('Position ID', 'Position ID')}
                </label>
                <p className='text-sm font-bold text-gray-800 font-mono'>{selectedEmp.positionId || '—'}</p>
              </div>
            </div>

            {/* ── Document Fields ── */}
            <div className='grid grid-cols-2 gap-4'>

            {/* Legal Entity - read-only */}
            <div>
              <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                {t('Legal Entity', 'Legal Entity')} <span className='text-red-400'>*</span>
              </label>
              <input
                value={company?.name ?? ''}
                readOnly
                className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 bg-gray-50 text-gray-700 cursor-default'
              />
            </div>

            {/* Effective Date */}
            <div>
              <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                {t('Tanggal Efektif', 'Effective Date')}
              </label>
              <input
                type='date'
                value={form.effectiveDate}
                onChange={e => setField('effectiveDate', e.target.value)}
                disabled={!canEdit}
                className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400'
              />
            </div>

            {/* Document Number */}
            <div>
              <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                {t('No. Dokumen', 'Document Number')}
              </label>
              <input
                type='text'
                value={form.documentNumber}
                onChange={e => setField('documentNumber', e.target.value)}
                disabled={!canEdit}
                placeholder='e.g. HRD/EVL/2024/001'
                className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400'
              />
            </div>

            {/* Revision */}
            <div>
              <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                {t('Revisi', 'Revision')}
              </label>
              <input
                type='text'
                value={form.revision}
                onChange={e => setField('revision', e.target.value)}
                disabled={!canEdit}
                placeholder='e.g. 00'
                className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400'
              />
            </div>

            {/* Classification */}
            <div className='col-span-2'>
              <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                {t('Klasifikasi', 'Classification')}
              </label>
              <input
                type='text'
                value={form.classification}
                onChange={e => setField('classification', e.target.value)}
                disabled={!canEdit}
                placeholder='e.g. Internal'
                className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400'
              />
            </div>

            </div>{/* end document grid */}
          </div>
        </div>

        {/* ── Card 2: Assessment Table ───────────────────────────────────── */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden'>
          <div className='px-5 py-3 border-b border-gray-100' style={HEADER_GRAD}>
            <h2 className='text-xs font-bold text-white uppercase tracking-wide'>
              {t('Penilaian Aspek', 'Assessment Aspects')}
            </h2>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead>
                <tr style={HEADER_GRAD}>
                  <th className='px-4 py-2.5 text-left text-white font-semibold w-10'>NO</th>
                  <th className='px-4 py-2.5 text-left text-white font-semibold w-44'>
                    {t('Aspek Penilaian', 'Assessment Aspect')}
                  </th>
                  <th className='px-4 py-2.5 text-left text-white font-semibold'>
                    {t('Key Behaviors / Indikator', 'Key Behaviors / Indicator')}
                  </th>
                  <th className='px-4 py-2.5 text-center text-white font-semibold w-16'>%</th>
                  <th className='px-4 py-2.5 text-left text-white font-semibold w-52'>
                    {t('Rating', 'Rating')}
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>

                {/* ── Core Values ── */}
                <GroupHeaderRow label={t('Core Values', 'Core Values')} pct='50%' />
                {form.coreValues.map((item, idx) => (
                  <AssessmentRow
                    key={item.id}
                    item={item}
                    section='coreValues'
                    idx={idx}
                    canEdit={canEdit}
                    onRatingChange={handleRatingChange}
                    striped={idx % 2 === 0}
                  />
                ))}

                {/* ── Competency Based ── */}
                <GroupHeaderRow label={t('Competency Based', 'Competency Based')} pct='50%' />

                {/* A. Core Competency */}
                <SubHeaderRow label='A. Core Competency' />
                {form.coreCompetency.map((item, idx) => (
                  <AssessmentRow
                    key={item.id}
                    item={item}
                    section='coreCompetency'
                    idx={idx}
                    canEdit={canEdit}
                    onRatingChange={handleRatingChange}
                    striped={idx % 2 === 0}
                  />
                ))}

                {/* B. Strategic Leadership — only for PC >= 53 */}
                {showStrategicLeadership && <>
                  <SubHeaderRow label={t('B. Strategic Leadership', 'B. Strategic Leadership')} />
                  {form.strategicLeadership.map((item, idx) => (
                    <AssessmentRow
                      key={item.id}
                      item={item}
                      section='strategicLeadership'
                      idx={idx}
                      canEdit={canEdit}
                      onRatingChange={handleRatingChange}
                      striped={idx % 2 === 0}
                    />
                  ))}
                </>}

                {/* B/C. Technical Competency */}
                <SubHeaderRow label={showStrategicLeadership
                  ? t('C. Technical Competency *Target TC sesuai level posisi', 'C. Technical Competency *Target TC per position level')
                  : t('B. Technical Competency *Target TC sesuai level posisi', 'B. Technical Competency *Target TC per position level')
                } />
                {form.technicalCompetency.map((item, idx) => (
                  <AssessmentRow
                    key={item.id}
                    item={item}
                    section='technicalCompetency'
                    idx={idx}
                    canEdit={canEdit}
                    onRatingChange={handleRatingChange}
                    striped={idx % 2 === 0}
                  />
                ))}

              </tbody>
            </table>
          </div>
        </div>

        {/* ── Card 3: Summary & Decision ─────────────────────────────────── */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='px-5 py-3 border-b border-gray-100' style={HEADER_GRAD}>
            <h2 className='text-xs font-bold text-white uppercase tracking-wide'>
              {t('Keputusan Akhir', 'Final Decision')}
            </h2>
          </div>
          <div className='p-5 space-y-4'>

            <div className='grid grid-cols-2 gap-4'>
              {/* Employee Name */}
              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                  {t('Nama Karyawan', 'Employee Name')} <span className='text-red-400'>*</span>
                </label>
                <input
                  value={selectedEmp.name}
                  readOnly
                  className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 bg-gray-50 text-gray-700 cursor-default'
                />
              </div>

              {/* Final Score */}
              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                  {t('Final Score', 'Final Score')}
                </label>
                <div className='flex items-center gap-2'>
                  <div className={`w-full px-3 py-1.5 text-xs rounded border font-bold text-center
                    ${score >= 75 ? 'bg-green-50 border-green-300 text-green-700'
                      : score >= 50 ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                      : 'bg-red-50 border-red-300 text-red-600'}`}>
                    {score}
                  </div>
                </div>
                <p className='text-[10px] text-gray-400 mt-1'>
                  {t('Skala 0–100 (CV 50% + CB 50%)', 'Scale 0–100 (CV 50% + CB 50%)')}
                </p>
              </div>

              {/* Final Decision */}
              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                  {t('Final Decision', 'Final Decision')} <span className='text-red-400'>*</span>
                </label>
                <select
                  value={form.finalDecision}
                  onChange={e => setField('finalDecision', e.target.value)}
                  disabled={!canEdit}
                  className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400'
                >
                  <option value=''>{t('-- Pilih --', '-- Select --')}</option>
                  <option value='Passed to be Permanent'>{t('Lulus Menjadi Karyawan Tetap', 'Passed to be Permanent')}</option>
                  <option value='Not Passed'>{t('Tidak Lulus', 'Not Passed')}</option>
                </select>
              </div>

              {/* Effective Date (Final) */}
              <div>
                <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                  {t('Tanggal Efektif Keputusan', 'Decision Effective Date')}
                </label>
                <input
                  type='date'
                  value={form.finalEffectiveDate}
                  onChange={e => setField('finalEffectiveDate', e.target.value)}
                  disabled={!canEdit}
                  className='w-full px-3 py-1.5 text-xs rounded border border-gray-200 focus:border-red-400 outline-none disabled:bg-gray-50 disabled:text-gray-400'
                />
              </div>
            </div>

            {/* Strength */}
            <div>
              <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                {t('Kekuatan (Strength)', 'Strength')} <span className='text-red-400'>*</span>
              </label>
              <textarea
                rows={3}
                value={form.strength}
                onChange={e => setField('strength', e.target.value)}
                disabled={!canEdit}
                placeholder={t('Tuliskan kekuatan karyawan...', 'Describe employee strengths...')}
                className='w-full px-3 py-2 text-xs rounded border border-gray-200 focus:border-red-400 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400'
              />
            </div>

            {/* Area Development */}
            <div>
              <label className='block text-[11px] font-semibold text-gray-600 mb-1'>
                {t('Area Pengembangan (Area Development)', 'Area Development')} <span className='text-red-400'>*</span>
              </label>
              <textarea
                rows={3}
                value={form.areaDevelopment}
                onChange={e => setField('areaDevelopment', e.target.value)}
                disabled={!canEdit}
                placeholder={t('Tuliskan area pengembangan karyawan...', 'Describe employee development areas...')}
                className='w-full px-3 py-2 text-xs rounded border border-gray-200 focus:border-red-400 outline-none resize-none disabled:bg-gray-50 disabled:text-gray-400'
              />
            </div>

            {/* Rating Legend */}
            <div className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
              <p className='text-[11px] font-semibold text-gray-600 mb-1'>{t('Keterangan Rating:', 'Rating Legend:')}</p>
              <div className='flex flex-wrap gap-x-6 gap-y-0.5'>
                {[
                  ['1', t('Far Below Expectation', 'Far Below Expectation')],
                  ['2', t('Slightly Below Expectation', 'Slightly Below Expectation')],
                  ['3', t('Meet Expectation', 'Meet Expectation')],
                  ['4', t('Exceed Expectation', 'Exceed Expectation')],
                ].map(([n, lbl]) => (
                  <span key={n} className='text-[10px] text-gray-500'>
                    <span className='font-semibold text-gray-700'>{n}</span> = {lbl}
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            {canEdit && (
              <div className='flex justify-end pt-2'>
                <button
                  onClick={handleSubmit}
                  className='px-6 py-2.5 text-sm font-bold text-white rounded-lg shadow transition-opacity hover:opacity-90'
                  style={HEADER_GRAD}
                >
                  {t('Submit Evaluasi', 'Submit Evaluation')}
                </button>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  )
}
