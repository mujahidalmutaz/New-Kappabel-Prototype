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
  { bg: 'bg-blue-50',   text: 'text-blue-700'   },
  { bg: 'bg-red-50',    text: 'text-red-700'     },
  { bg: 'bg-amber-50',  text: 'text-amber-700'   },
  { bg: 'bg-green-50',  text: 'text-green-700'   },
  { bg: 'bg-rose-50',   text: 'text-rose-700'    },
  { bg: 'bg-teal-50',   text: 'text-teal-700'    },
]

function toDateInput(val) {
  if (!val) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  const d = new Date(val)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

// ── Migrate old format to mainSections ────────────────────────────────────────
function migrateOnboarding(ob) {
  if (!ob) return ob
  if ((ob.mainSections ?? []).length > 0) return ob
  const sections = []
  if ((ob.generalItems ?? []).length > 0 || (ob.generalSections ?? []).length > 0) {
    sections.push({
      id: 'ms_general',
      type: 'Materi Induksi General',
      sections: ob.generalSections ?? [],
      items: ob.generalItems ?? [],
    })
  }
  if ((ob.technicalItems ?? []).length > 0 || (ob.technicalSections ?? []).length > 0) {
    sections.push({
      id: 'ms_teknis',
      type: 'Materi Induksi Teknis',
      sections: ob.technicalSections ?? [],
      items: ob.technicalItems ?? [],
    })
  }
  if ((ob.reviewItems ?? []).length > 0) {
    sections.push({
      id: 'ms_review',
      type: 'Periodic Review',
      sections: [],
      items: ob.reviewItems ?? [],
    })
  }
  return { ...ob, mainSections: sections }
}

// ── Agenda table header ───────────────────────────────────────────────────────
function AgendaHead({ t }) {
  return (
    <thead>
      <tr style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
        {['NO', t('Tanggal','Date'), t('AGENDA [Module]','AGENDA [Module]'), 'Type', 'Link',
          t('Nama Mentor','Mentor Name'), t('Posisi Mentor','Mentor Position'),
          t('Completed','Completed')].map((h, i) => (
          <th key={i} className='text-left px-3 py-2 text-white font-semibold whitespace-nowrap text-xs'
            style={{ minWidth: i===2?180 : i===4?160 : i===7?80 : i===0?40 : 100 }}>{h}</th>
        ))}
      </tr>
    </thead>
  )
}

function ReviewHead({ t }) {
  return (
    <thead>
      <tr style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
        {['NO', t('Tanggal','Date'), t('Agenda','Agenda'), 'Type',
          t('Nama Reviewer','Reviewer Name'), t('Posisi Reviewer','Reviewer Position'),
          t('Completed','Completed')].map((h, i) => (
          <th key={i} className='text-left px-3 py-2 text-white font-semibold whitespace-nowrap text-xs'
            style={{ minWidth: i===2?200 : i===6?80 : i===0?40 : 100 }}>{h}</th>
        ))}
      </tr>
    </thead>
  )
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ mainSections, t }) {
  const allItems = (mainSections ?? []).flatMap(ms => ms.items ?? [])
  const total  = allItems.length
  const done   = allItems.filter(i => i.completed).length
  const pct    = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className='mb-5'>
      <div className='flex justify-between items-center mb-1'>
        <span className='text-xs text-gray-500'>{t('Progress Onboarding','Onboarding Progress')}</span>
        <span className='text-xs font-bold text-red-700'>{done}/{total} ({pct}%)</span>
      </div>
      <div className='h-2.5 bg-gray-100 rounded-full overflow-hidden'>
        <div className='h-full rounded-full transition-all' style={{ width: `${pct}%`, background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function EssOnboardingPage() {
  const t               = useT()
  const { currentUser } = useAuthStore()
  const { onboardings, updateOnboarding } = useOnboardingStore()

  const raw          = onboardings.find(o => o.employeeId === currentUser?.id) ?? null
  const myOnboarding = migrateOnboarding(raw)
  const isApproved   = myOnboarding?.workflowStatus === 'Approved'

  const [form,  setForm ] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (myOnboarding) setForm(JSON.parse(JSON.stringify(myOnboarding)))
  }, [myOnboarding?.id, myOnboarding?.workflowStatus])

  const updItem = (msId, itemId, key, val) =>
    setForm(f => ({
      ...f,
      mainSections: f.mainSections.map(ms =>
        ms.id === msId
          ? { ...ms, items: ms.items.map(i => i.id === itemId ? { ...i, [key]: val } : i) }
          : ms
      ),
    }))

  const handleSave = () => {
    if (!form) return
    updateOnboarding(form.id, { mainSections: form.mainSections })
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

  const mainSections = form.mainSections ?? []

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
            ? t('⏳ Form sedang dalam proses approval.','⏳ Form is pending approval. You can view but not edit.')
            : myOnboarding.workflowStatus === 'Rejected'
              ? t('❌ Pengajuan onboarding ditolak. Hubungi HR.','❌ Onboarding was rejected. Contact HR.')
              : t('📋 Form masih dalam status Draft.','📋 Form is still in Draft status.')}
        </div>
      )}
      {isApproved && (
        <div className='mb-5 rounded-xl px-5 py-3.5 text-sm font-medium border bg-green-50 border-green-200 text-green-700'>
          ✅ {t('Onboarding telah disetujui. Anda dapat memperbarui progress di bawah ini.','Onboarding approved. Update your progress below.')}
        </div>
      )}
      {saved && (
        <div className='mb-4 rounded-lg px-4 py-2.5 bg-green-50 border border-green-200 text-green-600 text-sm'>
          ✓ {t('Data berhasil disimpan.','Changes saved successfully.')}
        </div>
      )}

      <ProgressBar mainSections={mainSections} t={t} />

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
              [t('Masa Probation/Orientasi','Probation'), `${myOnboarding.probationPeriod ?? '—'} ${t('Bulan','Month(s)')}`],
            ].map(([label, val]) => (
              <div key={label} className='flex items-center gap-2'>
                <span className='text-xs text-red-200 w-36 flex-shrink-0'>{label} :</span>
                <span className='text-xs text-white font-semibold'>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Dynamic sections ── */}
        {mainSections.length === 0 ? (
          <div className='px-6 py-12 text-center text-gray-400 text-sm'>
            {t('Belum ada materi onboarding.','No onboarding material yet.')}
          </div>
        ) : mainSections.map((ms, msIdx) => {
          const isReview = ms.type === 'Periodic Review'
          return (
            <div key={ms.id} className='px-6 pt-5 pb-2'>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-1 h-5 rounded-full' style={{ background: 'linear-gradient(#8B1A1A,#D7252B)' }} />
                <h3 className='text-sm font-bold text-gray-800'>{ms.type}</h3>
              </div>
              <div className='overflow-x-auto rounded-lg border border-gray-200'>
                {isReview ? (
                  <table className='w-full text-xs'>
                    <ReviewHead t={t} />
                    <tbody>
                      {(ms.items ?? []).length === 0 ? (
                        <tr><td colSpan={7} className='px-6 py-6 text-center text-gray-400 text-sm'>{t('Tidak ada data.','No data.')}</td></tr>
                      ) : (ms.items ?? []).map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                          <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8'>{idx + 1}</td>
                          <td className='px-2 py-1.5 w-28'>
                            {isApproved
                              ? <input type='date' value={toDateInput(item.date || '')}
                                  onChange={e => updItem(ms.id, item.id, 'date', e.target.value)}
                                  className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white' />
                              : <span className='text-xs text-gray-600 px-2'>{item.date || <span className='text-gray-300'>—</span>}</span>
                            }
                          </td>
                          <td className='px-3 py-1.5 text-gray-800'>{item.agenda || item.module || <span className='text-gray-300'>—</span>}</td>
                          <td className='px-3 py-1.5 text-gray-600 w-36'>{item.type || <span className='text-gray-300'>—</span>}</td>
                          <td className='px-3 py-1.5 text-gray-700 w-28'>{item.reviewerName || item.mentorName || <span className='text-gray-300'>—</span>}</td>
                          <td className='px-3 py-1.5 text-gray-600 w-28'>{item.reviewerPosition || item.mentorPosition || <span className='text-gray-300'>—</span>}</td>
                          <td className='px-3 py-1.5 text-center w-16'>
                            <input type='checkbox' checked={!!item.completed}
                              onChange={e => updItem(ms.id, item.id, 'completed', e.target.checked)}
                              disabled={!isApproved}
                              className='w-4 h-4 accent-red-600 disabled:cursor-not-allowed disabled:opacity-40' />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (ms.sections ?? []).length === 0 ? (
                  // flat items (no sub-sections)
                  <table className='w-full text-xs'>
                    <AgendaHead t={t} />
                    <tbody>
                      {(ms.items ?? []).length === 0 ? (
                        <tr><td colSpan={8} className='px-6 py-6 text-center text-gray-400 text-sm'>{t('Tidak ada data.','No data.')}</td></tr>
                      ) : (ms.items ?? []).map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8 text-xs'>{idx + 1}</td>
                          <td className='px-2 py-1.5 w-28'>
                            {isApproved
                              ? <input type='date' value={toDateInput(item.date || '')}
                                  onChange={e => updItem(ms.id, item.id, 'date', e.target.value)}
                                  className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white' />
                              : <span className='text-xs text-gray-600 px-2'>{item.date || <span className='text-gray-300'>—</span>}</span>
                            }
                          </td>
                          <td className='px-3 py-1.5 text-gray-800 font-medium text-xs'>{item.module || <span className='text-gray-300'>—</span>}</td>
                          <td className='px-3 py-1.5 text-gray-600 text-xs w-36'>{item.type || <span className='text-gray-300'>—</span>}</td>
                          <td className='px-3 py-1.5 text-xs'>
                            {item.link
                              ? <a href={item.link} target='_blank' rel='noreferrer' className='text-red-600 hover:underline break-all'>{item.link}</a>
                              : <span className='text-gray-300'>—</span>}
                          </td>
                          <td className='px-3 py-1.5 text-gray-700 text-xs w-28'>{item.mentorName || <span className='text-gray-300'>—</span>}</td>
                          <td className='px-3 py-1.5 text-gray-600 text-xs w-28'>{item.mentorPosition || <span className='text-gray-300'>—</span>}</td>
                          <td className='px-3 py-1.5 text-center w-16'>
                            <input type='checkbox' checked={!!item.completed}
                              onChange={e => updItem(ms.id, item.id, 'completed', e.target.checked)}
                              disabled={!isApproved}
                              className='w-4 h-4 accent-red-600 disabled:cursor-not-allowed disabled:opacity-40' />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  // items grouped by section
                  (ms.sections ?? []).map((sec, secIdx) => {
                    const cls  = SEC_COLORS[secIdx % SEC_COLORS.length]
                    const rows = (ms.items ?? []).filter(i => i.category === sec.id)
                    return (
                      <table key={sec.id} className='w-full text-xs border-b border-gray-100 last:border-b-0'>
                        <AgendaHead t={t} />
                        <tbody>
                          <tr className={cls.bg}>
                            <td colSpan={8} className='px-3 py-2'>
                              <span className={`text-xs font-semibold ${cls.text}`}>{sec.label || '—'}</span>
                            </td>
                          </tr>
                          {rows.length === 0 && (
                            <tr><td colSpan={8} className='px-4 py-3 text-center text-gray-300 text-xs italic'>{t('Tidak ada baris.','No rows.')}</td></tr>
                          )}
                          {rows.map((item, idx) => (
                            <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                              <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8 text-xs'>{idx + 1}</td>
                              <td className='px-2 py-1.5 w-28'>
                                {isApproved
                                  ? <input type='date' value={toDateInput(item.date || '')}
                                      onChange={e => updItem(ms.id, item.id, 'date', e.target.value)}
                                      className='w-full px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white' />
                                  : <span className='text-xs text-gray-600 px-2'>{item.date || <span className='text-gray-300'>—</span>}</span>
                                }
                              </td>
                              <td className='px-3 py-1.5 text-gray-800 font-medium text-xs'>{item.module || <span className='text-gray-300'>—</span>}</td>
                              <td className='px-3 py-1.5 text-gray-600 text-xs w-36'>{item.type || <span className='text-gray-300'>—</span>}</td>
                              <td className='px-3 py-1.5 text-xs'>
                                {item.link
                                  ? <a href={item.link} target='_blank' rel='noreferrer' className='text-red-600 hover:underline break-all'>{item.link}</a>
                                  : <span className='text-gray-300'>—</span>}
                              </td>
                              <td className='px-3 py-1.5 text-gray-700 text-xs w-28'>{item.mentorName || <span className='text-gray-300'>—</span>}</td>
                              <td className='px-3 py-1.5 text-gray-600 text-xs w-28'>{item.mentorPosition || <span className='text-gray-300'>—</span>}</td>
                              <td className='px-3 py-1.5 text-center w-16'>
                                <input type='checkbox' checked={!!item.completed}
                                  onChange={e => updItem(ms.id, item.id, 'completed', e.target.checked)}
                                  disabled={!isApproved}
                                  className='w-4 h-4 accent-red-600 disabled:cursor-not-allowed disabled:opacity-40' />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}

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
