'use client'
import { useState }              from 'react'
import { useAuthStore }           from '@/store/authStore'
import { useOnboardingStore }     from '@/store/onboardingStore'
import { useEmployeeStore }       from '@/store/employeeStore'
import { useMasterOnboardingStore } from '@/store/masterOnboardingStore'
import { useStructureStore }      from '@/store/structureStore'
import { useT }                   from '@/store/languageStore'
import { BRAND_GRADIENT }         from '@/components/ui'

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

const TYPE_LOV = [
  'Manual Task','Video','Document (Attachment)','Report',
  'Application Task','External URL','Electronic Signature',
  'Questionnaire','Configurable Form','Learning Course',
]

function toDateInput(val) {
  if (!val) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
  const d = new Date(val)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

function migrateOnboarding(ob) {
  if (!ob) return ob
  if ((ob.mainSections ?? []).length > 0) return ob
  const sections = []
  if ((ob.generalItems ?? []).length > 0 || (ob.generalSections ?? []).length > 0) {
    sections.push({ id: 'ms_general', type: 'Onboarding General', sections: ob.generalSections ?? [], items: ob.generalItems ?? [] })
  }
  if ((ob.technicalItems ?? []).length > 0 || (ob.technicalSections ?? []).length > 0) {
    sections.push({ id: 'ms_teknis', type: 'Onboarding Teknis', sections: ob.technicalSections ?? [], items: ob.technicalItems ?? [] })
  }
  if ((ob.reviewItems ?? []).length > 0) {
    sections.push({ id: 'ms_review', type: 'Periodic Review', sections: [], items: ob.reviewItems ?? [] })
  }
  return { ...ob, mainSections: sections }
}

function AgendaHead({ t }) {
  return (
    <thead>
      <tr style={{ background: BRAND_GRADIENT }}>
        {['NO', t('AGENDA','AGENDA'), 'Type', 'Link',
          t('Nama Mentor','Mentor Name'), t('Posisi Mentor','Mentor Position'), t('Completed','Completed')].map((h, i) => (
          <th key={i} className='text-left px-3 py-2 text-white font-semibold whitespace-nowrap text-xs'
            style={{ minWidth: i===1?200 : i===2?160 : i===3?200 : i===0?40 : 100 }}>{h}</th>
        ))}
      </tr>
    </thead>
  )
}

// ── Inline cell helpers ───────────────────────────────────────────────────────
function IC({ value, onChange, placeholder = '' }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white w-full' />
  )
}
function SC({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className='px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-red-400 bg-white w-full min-w-[140px]'>
      <option value=''>—</option>
      {TYPE_LOV.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function MssOnboardingPage() {
  const t               = useT()
  const { currentUser } = useAuthStore()
  const { onboardings, updateOnboarding } = useOnboardingStore()
  const { employees }   = useEmployeeStore()
  const { templates }   = useMasterOnboardingStore()
  const { positions }   = useStructureStore()

  const [selectedId, setSelectedId] = useState(null)
  const [form,       setForm       ] = useState(null)
  const [msg,        setMsg        ] = useState(null)
  const [tplTeknis,  setTplTeknis  ] = useState('')

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3500)
  }

  // subordinates: employees whose managerId === currentUser.id
  const myEmpIds = employees.filter(e => e.managerId === currentUser?.id).map(e => e.id)
  const subOnboardings = onboardings.filter(o => myEmpIds.includes(o.employeeId)).map(migrateOnboarding)

  const openDetail = (ob) => {
    setSelectedId(ob.id)
    setForm(JSON.parse(JSON.stringify(ob)))
    setTplTeknis('')
  }

  const closeDetail = () => { setSelectedId(null); setForm(null) }

  // update a teknis item field
  const updTeknis = (msId, itemId, key, val) =>
    setForm(f => ({
      ...f,
      mainSections: f.mainSections.map(ms =>
        ms.id === msId
          ? { ...ms, items: ms.items.map(i => i.id === itemId ? { ...i, [key]: val } : i) }
          : ms
      ),
    }))

  const addTeknis = (msId) =>
    setForm(f => ({
      ...f,
      mainSections: f.mainSections.map(ms =>
        ms.id === msId
          ? { ...ms, items: [...ms.items, { id: Math.random(), module: '', type: '', link: '', mentorName: '', mentorPosition: '', completed: false }] }
          : ms
      ),
    }))

  const removeTeknis = (msId, itemId) =>
    setForm(f => ({
      ...f,
      mainSections: f.mainSections.map(ms =>
        ms.id === msId
          ? { ...ms, items: ms.items.filter(i => i.id !== itemId) }
          : ms
      ),
    }))

  // Apply teknis template: append or replace existing teknis section
  const applyTeknisTpl = () => {
    if (!tplTeknis || !form) return
    const tpl = templates.find(t => t.id === Number(tplTeknis))
    if (!tpl) return

    const ms = (tpl.mainSections ?? []).find(s => s.type === 'Onboarding Teknis')
    let newItems = []
    let newSecs  = []

    if (ms) {
      newItems = ms.items.map(i => ({ ...i, id: Math.random(), completed: false, date: '' }))
      newSecs  = ms.sections.map(s => ({ ...s }))
    } else if ((tpl.technicalItems ?? []).length > 0) {
      newItems = (tpl.technicalItems ?? []).map(i => ({ ...i, id: Math.random(), completed: false, date: '' }))
    }

    const existing = (form.mainSections ?? []).find(s => s.type === 'Onboarding Teknis')
    if (existing) {
      setForm(f => ({
        ...f,
        mainSections: f.mainSections.map(s =>
          s.type === 'Onboarding Teknis'
            ? { ...s, sections: newSecs, items: newItems }
            : s
        ),
      }))
    } else {
      setForm(f => ({
        ...f,
        mainSections: [...f.mainSections, {
          id: `ms_teknis_${Date.now()}`,
          type: 'Onboarding Teknis',
          sections: newSecs,
          items: newItems,
        }],
      }))
    }
    setTplTeknis('')
    flash('Template teknis diterapkan.')
  }

  const handleSave = () => {
    if (!form) return
    updateOnboarding(form.id, { mainSections: form.mainSections })
    flash('Perubahan disimpan.')
  }

  const handleSubmitReview = () => {
    if (!form) return
    updateOnboarding(form.id, { mainSections: form.mainSections, teknisByManager: true })
    flash('Materi teknis telah disubmit.')
    closeDetail()
  }

  // ── Template options for teknis ──────────────────────────────────────────────
  const teknisTpls = templates.filter(tpl =>
    (tpl.mainSections ?? []).some(ms => ms.type === 'Onboarding Teknis') ||
    (tpl.technicalItems ?? []).length > 0
  )

  // ── List view ────────────────────────────────────────────────────────────────
  if (!selectedId || !form) {
    return (
      <div className='pb-10'>
        <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Onboarding Tim Saya','My Team Onboarding')}</h1>
        <p className='text-gray-500 text-sm mb-6'>
          {t('Daftar onboarding bawahan Anda. Anda dapat menambah/mengedit materi teknis.','Your subordinates\' onboarding. You can add/edit technical material.')}
        </p>

        {subOnboardings.length === 0 ? (
          <div className='bg-white rounded-xl shadow-sm px-8 py-16 text-center text-gray-400 text-sm'>
            {t('Tidak ada data onboarding bawahan.','No subordinate onboarding records found.')}
          </div>
        ) : (
          <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr style={{ background: BRAND_GRADIENT }}>
                  {['Karyawan','Department','Status Kerja','Workflow Status','Teknis','Aksi'].map((h, i) => (
                    <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subOnboardings.map((ob, idx) => {
                  const hasTeknis = (ob.mainSections ?? []).some(ms => ms.type === 'Onboarding Teknis' && (ms.items ?? []).length > 0)
                  return (
                    <tr key={ob.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className='px-4 py-3 font-semibold text-gray-800 text-xs'>{ob.employeeName}</td>
                      <td className='px-4 py-3 text-gray-600 text-xs'>{ob.department || '—'}</td>
                      <td className='px-4 py-3 text-gray-600 text-xs'>{ob.employmentStatus || '—'}</td>
                      <td className='px-4 py-3'>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_CLS[ob.workflowStatus] ?? 'bg-gray-100 text-gray-600'}`}>
                          {ob.workflowStatus}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        {hasTeknis
                          ? <span className='text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full'>✓ Ada</span>
                          : <span className='text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-full'>Belum ada</span>
                        }
                      </td>
                      <td className='px-4 py-3'>
                        <button onClick={() => openDetail(ob)}
                          className='px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                          ✏️ Detail
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  // ── Detail view ──────────────────────────────────────────────────────────────
  const mainSections = form.mainSections ?? []

  return (
    <div className='pb-10'>
      <div className='flex items-center gap-3 mb-1'>
        <button onClick={closeDetail} className='text-xs text-gray-400 hover:text-red-600 transition'>← Kembali</button>
        <h1 className='text-2xl font-bold text-gray-800'>{form.employeeName}</h1>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_CLS[form.workflowStatus] ?? 'bg-gray-100 text-gray-600'}`}>
          {form.workflowStatus}
        </span>
      </div>
      <p className='text-gray-500 text-sm mb-5'>
        {t('Anda dapat menambah/mengedit Onboarding Teknis bawahan Anda.','You can add/edit Technical Induction Material for your subordinate.')}
      </p>

      {msg && (
        <div className={`mb-4 rounded-lg px-4 py-2.5 text-sm border ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Template picker for teknis */}
      <div className='bg-white rounded-xl shadow-sm px-5 py-4 mb-5 border border-blue-100'>
        <div className='text-xs font-bold text-blue-700 mb-2'>Terapkan Template Teknis</div>
        <div className='flex gap-3 items-center'>
          <select value={tplTeknis} onChange={e => setTplTeknis(e.target.value)}
            className='flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
            <option value=''>— Pilih Template Teknis…</option>
            {teknisTpls.map(tpl => (
              <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
            ))}
          </select>
          <button onClick={applyTeknisTpl} disabled={!tplTeknis}
            className='px-4 py-2 text-xs font-bold text-white rounded-lg disabled:opacity-40 transition'
            style={{ background: BRAND_GRADIENT }}>
            Terapkan
          </button>
        </div>
        <p className='text-xs text-gray-400 mt-2'>Menerapkan template akan mengganti Materi Teknis yang sudah ada pada record ini.</p>
      </div>

      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        {/* Header */}
        <div style={{ background: BRAND_GRADIENT }} className='px-6 py-4'>
          <h2 className='text-sm font-bold text-white mb-3'>FORMULIR ONBOARDING — {form.employeeName.toUpperCase()}</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2'>
            {[
              ['Department', form.department || '—'],
              ['Status Karyawan', form.employmentStatus],
              ['Supervisor', `${form.supervisorName || '—'} / ${form.supervisorPosition || '—'}`],
            ].map(([label, val]) => (
              <div key={label} className='flex items-center gap-2'>
                <span className='text-xs text-red-200 w-32 flex-shrink-0'>{label} :</span>
                <span className='text-xs text-white font-semibold'>{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {mainSections.map((ms) => {
          const isTeknis = ms.type === 'Onboarding Teknis'
          const isGeneral = ms.type === 'Onboarding General'
          return (
            <div key={ms.id} className='px-6 pt-5 pb-2'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                  <div className='w-1 h-5 rounded-full' style={{ background: BRAND_GRADIENT }} />
                  <h3 className='text-sm font-bold text-gray-800'>{ms.type}</h3>
                  {isGeneral && <span className='text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full'>Read-only</span>}
                </div>
                {isTeknis && (
                  <button onClick={() => addTeknis(ms.id)}
                    className='px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition'>
                    + Tambah Baris
                  </button>
                )}
              </div>
              <div className='overflow-x-auto rounded-lg border border-gray-200'>
                {(ms.sections ?? []).length === 0 ? (
                  // flat items
                  <table className='w-full text-xs'>
                    <AgendaHead t={t} />
                    <tbody>
                      {(ms.items ?? []).length === 0 ? (
                        <tr><td colSpan={7} className='px-6 py-6 text-center text-gray-400 text-sm'>Tidak ada data.</td></tr>
                      ) : (ms.items ?? []).map((item, idx) => (
                        <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8'>{idx + 1}</td>
                          <td className='px-2 py-1.5'>
                            {isTeknis
                              ? <IC value={item.module || ''} onChange={v => updTeknis(ms.id, item.id, 'module', v)} placeholder='Nama modul…' />
                              : <span className='text-xs text-gray-800'>{item.module || '—'}</span>}
                          </td>
                          <td className='px-2 py-1.5 w-40'>
                            {isTeknis
                              ? <SC value={item.type || ''} onChange={v => updTeknis(ms.id, item.id, 'type', v)} />
                              : <span className='text-xs text-gray-600'>{item.type || '—'}</span>}
                          </td>
                          <td className='px-2 py-1.5'>
                            {isTeknis
                              ? <IC value={item.link || ''} onChange={v => updTeknis(ms.id, item.id, 'link', v)} placeholder='https://…' />
                              : <span className='text-xs text-gray-400'>{item.link || '—'}</span>}
                          </td>
                          <td className='px-2 py-1.5 w-28'>
                            {isTeknis
                              ? <IC value={item.mentorName || ''} onChange={v => updTeknis(ms.id, item.id, 'mentorName', v)} placeholder='Mentor…' />
                              : <span className='text-xs text-gray-700'>{item.mentorName || '—'}</span>}
                          </td>
                          <td className='px-2 py-1.5 w-28'>
                            {isTeknis
                              ? <IC value={item.mentorPosition || ''} onChange={v => updTeknis(ms.id, item.id, 'mentorPosition', v)} placeholder='Posisi…' />
                              : <span className='text-xs text-gray-600'>{item.mentorPosition || '—'}</span>}
                          </td>
                          <td className='px-2 py-1.5 text-center w-16'>
                            {isTeknis ? (
                              <button onClick={() => removeTeknis(ms.id, item.id)}
                                className='text-red-400 hover:text-red-600 text-lg leading-none'>×</button>
                            ) : (
                              <input type='checkbox' checked={!!item.completed} disabled
                                className='w-4 h-4 accent-red-600 disabled:cursor-not-allowed disabled:opacity-40' />
                            )}
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
                            <td colSpan={7} className='px-3 py-2'>
                              <span className={`text-xs font-semibold ${cls.text}`}>{sec.label || '—'}</span>
                            </td>
                          </tr>
                          {rows.length === 0 && (
                            <tr><td colSpan={7} className='px-4 py-3 text-center text-gray-300 text-xs italic'>Tidak ada baris.</td></tr>
                          )}
                          {rows.map((item, idx) => (
                            <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                              <td className='px-3 py-1.5 text-center text-gray-500 font-medium w-8'>{idx + 1}</td>
                              <td className='px-2 py-1.5'>
                                {isTeknis
                                  ? <IC value={item.module || ''} onChange={v => updTeknis(ms.id, item.id, 'module', v)} />
                                  : <span className='text-xs text-gray-800'>{item.module || '—'}</span>}
                              </td>
                              <td className='px-2 py-1.5 w-40'>
                                {isTeknis
                                  ? <SC value={item.type || ''} onChange={v => updTeknis(ms.id, item.id, 'type', v)} />
                                  : <span className='text-xs text-gray-600'>{item.type || '—'}</span>}
                              </td>
                              <td className='px-2 py-1.5'>
                                {isTeknis
                                  ? <IC value={item.link || ''} onChange={v => updTeknis(ms.id, item.id, 'link', v)} />
                                  : <span className='text-xs text-gray-400'>{item.link || '—'}</span>}
                              </td>
                              <td className='px-2 py-1.5 w-28'>
                                {isTeknis
                                  ? <IC value={item.mentorName || ''} onChange={v => updTeknis(ms.id, item.id, 'mentorName', v)} />
                                  : <span className='text-xs text-gray-700'>{item.mentorName || '—'}</span>}
                              </td>
                              <td className='px-2 py-1.5 w-28'>
                                {isTeknis
                                  ? <IC value={item.mentorPosition || ''} onChange={v => updTeknis(ms.id, item.id, 'mentorPosition', v)} />
                                  : <span className='text-xs text-gray-600'>{item.mentorPosition || '—'}</span>}
                              </td>
                              <td className='px-2 py-1.5 text-center w-16'>
                                {isTeknis ? (
                                  <button onClick={() => removeTeknis(ms.id, item.id)}
                                    className='text-red-400 hover:text-red-600 text-lg leading-none'>×</button>
                                ) : (
                                  <input type='checkbox' checked={!!item.completed} disabled
                                    className='w-4 h-4 accent-red-600 disabled:cursor-not-allowed' />
                                )}
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

        {/* Actions */}
        <div className='px-6 py-5 flex gap-3 border-t border-gray-100 mt-3'>
          <button onClick={handleSave}
            className='px-5 py-2.5 text-sm font-bold text-white rounded-xl transition'
            style={{ background: BRAND_GRADIENT }}>
            💾 Simpan
          </button>
          <button onClick={handleSubmitReview}
            className='px-5 py-2.5 text-sm font-bold rounded-xl border-2 border-red-700 text-red-700 hover:bg-red-50 transition'>
            ✅ Selesai Review Teknis
          </button>
          <button onClick={closeDetail}
            className='px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition'>
            Kembali
          </button>
        </div>
      </div>
    </div>
  )
}
