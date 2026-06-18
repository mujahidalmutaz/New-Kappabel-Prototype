'use client'
import { useState, useEffect } from 'react'
import { useAuthStore }        from '@/store/authStore'
import { useOnboardingStore }  from '@/store/onboardingStore'
import { useT }                from '@/store/languageStore'

const STATUS_CLS = {
  Draft:    'bg-gray-100 text-gray-600',
  Pending:  'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
}

const SEC_COLORS = [
  'bg-blue-50 text-blue-700',
  'bg-red-50 text-red-700',
  'bg-amber-50 text-amber-700',
  'bg-green-50 text-green-700',
  'bg-rose-50 text-rose-700',
  'bg-teal-50 text-teal-700',
]

function toDateInput(val) {
  if (!val) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  const d = new Date(val)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

// ── Shared table header ───────────────────────────────────────────────────────
function AgendaHead({ t }) {
  return (
    <thead>
      <tr style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
        {['NO', t('Tanggal','Date'), t('AGENDA [Module]','AGENDA [Module]'), 'Type', 'Link',
          t('Nama Mentor','Mentor Name'), t('Posisi Mentor','Mentor Position'),
          t('Completed','Completed')].map((h, i) => (
          <th key={i} className='text-left px-3 py-2 text-white font-semibold whitespace-nowrap'
            style={{ minWidth: i===2?180 : i===4?160 : i===7?80 : i===0?40 : 100 }}>{h}</th>
        ))}
      </tr>
    </thead>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function EssOnboardingPage() {
  const t               = useT()
  const { currentUser } = useAuthStore()
  const { onboardings, updateOnboarding } = useOnboardingStore()

  const myOnboarding = onboardings.find(o => o.employeeId === currentUser?.id) ?? null
  const isApproved   = myOnboarding?.workflowStatus === 'Approved'

  const [form,  setForm ] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (myOnboarding) setForm(JSON.parse(JSON.stringify(myOnboarding)))
  }, [myOnboarding?.id, myOnboarding?.workflowStatus])

  const updG = (id, key, val) =>
    setForm(f => ({ ...f, generalItems:   f.generalItems.map(i   => i.id === id ? { ...i, [key]: val } : i) }))
  const updT = (id, key, val) =>
    setForm(f => ({ ...f, technicalItems: f.technicalItems.map(i => i.id === id ? { ...i, [key]: val } : i) }))
  const updR = (id, key, val) =>
    setForm(f => ({ ...f, reviewItems:    (f.reviewItems ?? []).map(i => i.id === id ? { ...i, [key]: val } : i) }))

  const handleSave = () => {
    if (!form) return
    updateOnboarding(form.id, {
      generalItems:          form.generalItems,
      technicalItems:        form.technicalItems,
      reviewItems:           form.reviewItems,
      hasilInductionChecked: form.hasilInductionChecked,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // ── No record ───────────────────────────────────────────────────────────────
  if (!myOnboarding) {
    return (
      <div>
        <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Onboarding Saya','My Onboarding')}</h1>
        <p className='text-gray-500 text-sm mb-6'>
          {t('Formulir induksi / onboarding karyawan.','Employee induction / onboarding form.')}
        </p>
        <div className='bg-white rounded-xl shadow-sm px-8 py-16 text-center text-gray-400 text-sm'>
          {t('Belum ada data onboarding untuk akun Anda.','No onboarding record found for your account.')}
        </div>
      </div>
    )
  }

  if (!form) return null

  const generalSections   = form.generalSections   ?? []
  const technicalSections = form.technicalSections ?? []
  const reviewItems       = form.reviewItems        ?? []

  // ── shared row renderer ───────────────────────────────────────────────────
  const renderAgendaRow = (item, idx, updFn) => (
    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
      <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8 text-xs'>{idx + 1}</td>
      <td className='px-2 py-1.5 w-28'>
        {isApproved
          ? <input type='date' value={toDateInput(item.date || '')}
              onChange={e => updFn(item.id, 'date', e.target.value)}
              className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white' />
          : <span className='text-xs text-gray-600 px-2'>{item.date || <span className='text-gray-300'>—</span>}</span>
        }
      </td>
      <td className='px-3 py-1.5 text-gray-800 font-medium text-xs'>{item.module || <span className='text-gray-300'>—</span>}</td>
      <td className='px-3 py-1.5 text-gray-600 text-xs w-36'>{item.type || <span className='text-gray-300'>—</span>}</td>
      <td className='px-3 py-1.5 text-xs'>
        {item.link
          ? <a href={item.link} target='_blank' rel='noreferrer'
              className='text-red-600 hover:underline break-all'>{item.link}</a>
          : <span className='text-gray-300'>—</span>}
      </td>
      <td className='px-3 py-1.5 text-gray-700 text-xs w-28'>{item.mentorName || <span className='text-gray-300'>—</span>}</td>
      <td className='px-3 py-1.5 text-gray-600 text-xs w-28'>{item.mentorPosition || <span className='text-gray-300'>—</span>}</td>
      <td className='px-3 py-1.5 text-center w-16'>
        <input type='checkbox' checked={!!item.completed}
          onChange={e => updFn(item.id, 'completed', e.target.checked)}
          disabled={!isApproved}
          className='w-4 h-4 accent-red-600 disabled:cursor-not-allowed disabled:opacity-40' />
      </td>
    </tr>
  )

  return (
    <div className='pb-10'>
      <div className='flex items-center justify-between mb-1'>
        <h1 className='text-2xl font-bold text-gray-800'>{t('Onboarding Saya','My Onboarding')}</h1>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_CLS[myOnboarding.workflowStatus] ?? 'bg-gray-100 text-gray-600'}`}>
          {myOnboarding.workflowStatus}
        </span>
      </div>
      <p className='text-gray-500 text-sm mb-5'>
        {t('Formulir induksi / onboarding karyawan.','Employee induction / onboarding form.')}
      </p>

      {/* Status banner */}
      {!isApproved && (
        <div className={`mb-5 rounded-xl px-5 py-3.5 text-sm font-medium border
          ${myOnboarding.workflowStatus === 'Pending'
            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
            : myOnboarding.workflowStatus === 'Rejected'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
          {myOnboarding.workflowStatus === 'Pending'
            ? t('⏳ Form sedang dalam proses approval. Anda dapat melihat data tetapi tidak dapat mengedit.','⏳ Form is pending approval. You can view but not edit.')
            : myOnboarding.workflowStatus === 'Rejected'
              ? t('❌ Pengajuan onboarding ditolak. Hubungi HR untuk informasi lebih lanjut.','❌ Onboarding was rejected. Contact HR for more information.')
              : t('📋 Form masih dalam status Draft.','📋 Form is still in Draft status.')}
        </div>
      )}
      {isApproved && (
        <div className='mb-5 rounded-xl px-5 py-3.5 text-sm font-medium border bg-green-50 border-green-200 text-green-700'>
          ✅ {t('Onboarding telah disetujui. Anda dapat memperbarui progress di bawah ini.','Onboarding has been approved. You can update your progress below.')}
        </div>
      )}
      {saved && (
        <div className='mb-4 rounded-lg px-4 py-2.5 bg-green-50 border border-green-200 text-green-600 text-sm'>
          ✓ {t('Data berhasil disimpan.','Changes saved successfully.')}
        </div>
      )}

      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>

        {/* ── Header gradient ── */}
        <div style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }} className='px-6 py-4'>
          <h2 className='text-sm font-bold text-white mb-3'>
            {t('FORMULIR ONBOARDING / INDUKSI KARYAWAN','EMPLOYEE ONBOARDING / INDUCTION FORM')}
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-3'>
            {[
              [t('Nama','Name'),                         myOnboarding.employeeName],
              ['Department',                               myOnboarding.department || '—'],
              [t('Nama / Posisi Atasan','Supervisor'),    `${myOnboarding.supervisorName || '—'} / ${myOnboarding.supervisorPosition || '—'}`],
              [t('Status Karyawan','Employee Status'),    myOnboarding.employmentStatus],
              [t('Masa Probation/Orientasi','Probation'), `${myOnboarding.probationPeriod} ${t('Bulan','Month(s)')}`],
            ].map(([label, val]) => (
              <div key={label} className='flex items-center gap-2'>
                <span className='text-xs text-red-200 w-36 flex-shrink-0'>{label} :</span>
                <span className='text-xs text-white font-semibold'>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 1: Materi Induksi General ── */}
        <div className='px-6 pt-5 pb-2'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='w-1 h-5 rounded-full' style={{ background: 'linear-gradient(#8B1A1A,#D7252B)' }} />
            <h3 className='text-sm font-bold text-gray-800'>{t('Materi Induksi General','General Induction Material')}</h3>
          </div>
          <div className='overflow-x-auto rounded-lg border border-gray-200'>
            {generalSections.length === 0 ? (
              <div className='px-6 py-6 text-center text-gray-400 text-sm'>{t('Tidak ada data.','No data.')}</div>
            ) : generalSections.map(sec => {
              const cls  = SEC_COLORS[sec.colorIdx % SEC_COLORS.length]
              const rows = (form.generalItems ?? []).filter(i => i.category === sec.id)
              return (
                <table key={sec.id} className='w-full text-xs border-b border-gray-100 last:border-b-0'>
                  <AgendaHead t={t} />
                  <tbody>
                    <tr className={cls.split(' ').filter(c => c.startsWith('bg-')).join(' ')}>
                      <td colSpan={8} className='px-3 py-2'>
                        <span className={`text-xs font-semibold ${cls.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                          {sec.label || sec.labelEN || '—'}
                        </span>
                      </td>
                    </tr>
                    {rows.length === 0 && (
                      <tr><td colSpan={8} className='px-4 py-3 text-center text-gray-300 text-xs italic'>{t('Tidak ada baris.','No rows.')}</td></tr>
                    )}
                    {rows.map((item, idx) => renderAgendaRow(item, idx, updG))}
                  </tbody>
                </table>
              )
            })}
          </div>
        </div>

        {/* ── SECTION 2: Materi Induksi Teknis ── */}
        <div className='px-6 pt-5 pb-2'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='w-1 h-5 rounded-full' style={{ background: 'linear-gradient(#8B1A1A,#D7252B)' }} />
            <h3 className='text-sm font-bold text-gray-800'>{t('Materi Induksi Teknis','Technical Induction Material')}</h3>
          </div>
          <div className='overflow-x-auto rounded-lg border border-gray-200'>
            {technicalSections.length === 0 ? (
              <div className='px-6 py-6 text-center text-gray-400 text-sm'>{t('Tidak ada data.','No data.')}</div>
            ) : technicalSections.map(sec => {
              const cls  = SEC_COLORS[sec.colorIdx % SEC_COLORS.length]
              const rows = (form.technicalItems ?? []).filter(i => i.category === sec.id)
              return (
                <table key={sec.id} className='w-full text-xs border-b border-gray-100 last:border-b-0'>
                  <AgendaHead t={t} />
                  <tbody>
                    <tr className={cls.split(' ').filter(c => c.startsWith('bg-')).join(' ')}>
                      <td colSpan={8} className='px-3 py-2'>
                        <span className={`text-xs font-semibold ${cls.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                          {sec.label || sec.labelEN || '—'}
                        </span>
                      </td>
                    </tr>
                    {rows.length === 0 && (
                      <tr><td colSpan={8} className='px-4 py-3 text-center text-gray-300 text-xs italic'>{t('Tidak ada baris.','No rows.')}</td></tr>
                    )}
                    {rows.map((item, idx) => renderAgendaRow(item, idx, updT))}
                  </tbody>
                </table>
              )
            })}
          </div>
        </div>

        {/* ── SECTION 3: Periodic Review ── */}
        <div className='px-6 pt-5 pb-2'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='w-1 h-5 rounded-full' style={{ background: 'linear-gradient(#8B1A1A,#D7252B)' }} />
            <h3 className='text-sm font-bold text-gray-800'>{t('Periodic Review','Periodic Review')}</h3>
          </div>
          <div className='overflow-x-auto rounded-lg border border-gray-200'>
            <table className='w-full text-xs'>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                  {['NO', t('Tanggal','Date'), t('Agenda','Agenda'), 'Type',
                    t('Nama Reviewer','Reviewer Name'), t('Posisi Reviewer','Reviewer Position'),
                    t('Completed','Completed')].map((h, i) => (
                    <th key={i} className='text-left px-3 py-2 text-white font-semibold whitespace-nowrap'
                      style={{ minWidth: i===2?200 : i===6?80 : i===0?40 : 100 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reviewItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='px-6 py-6 text-center text-gray-400 text-sm'>
                      {t('Tidak ada data.','No data.')}
                    </td>
                  </tr>
                ) : reviewItems.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                    <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8'>{idx + 1}</td>
                    <td className='px-2 py-1.5 w-28'>
                      {isApproved
                        ? <input type='date' value={toDateInput(item.date || '')}
                            onChange={e => updR(item.id, 'date', e.target.value)}
                            className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white' />
                        : <span className='text-xs text-gray-600 px-2'>{item.date || <span className='text-gray-300'>—</span>}</span>
                      }
                    </td>
                    <td className='px-3 py-1.5 text-gray-800'>{item.agenda || <span className='text-gray-300'>—</span>}</td>
                    <td className='px-3 py-1.5 text-gray-600 w-36'>{item.type || <span className='text-gray-300'>—</span>}</td>
                    <td className='px-3 py-1.5 text-gray-700 w-28'>{item.reviewerName || <span className='text-gray-300'>—</span>}</td>
                    <td className='px-3 py-1.5 text-gray-600 w-28'>{item.reviewerPosition || <span className='text-gray-300'>—</span>}</td>
                    <td className='px-3 py-1.5 text-center w-16'>
                      <input type='checkbox' checked={!!item.completed}
                        onChange={e => updR(item.id, 'completed', e.target.checked)}
                        disabled={!isApproved}
                        className='w-4 h-4 accent-red-600 disabled:cursor-not-allowed disabled:opacity-40' />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Save button ── */}
        {isApproved && (
          <div className='px-6 py-5 flex gap-3'>
            <button onClick={handleSave}
              className='px-6 py-2.5 text-sm font-bold text-white rounded-xl transition'
              style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
              💾 {t('Simpan Perubahan','Save Changes')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
