'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'
import { useAuthStore } from '@/store/authStore'
import { useHayStore } from '@/store/hayStore'
import { useVipStore } from '@/store/vipStore'
import { useEmployeeStore } from '@/store/employeeStore'

const EMPTY_HAY = { topic: '', goal: '', reality: '', options: '', wayForward: '' }
const HAY_FIELDS = [
  { key: 'topic',      label: '1. T — Topic',                labelEN: '1. T — Topic' },
  { key: 'goal',       label: '2. G — Goal',                 labelEN: '2. G — Goal' },
  { key: 'reality',    label: '3. R — Reality',              labelEN: '3. R — Reality' },
  { key: 'options',    label: '4. O — Options/Alternatives', labelEN: '4. O — Options/Alternatives' },
  { key: 'wayForward', label: '5. W — Way Forward',          labelEN: '5. W — Way Forward' },
]

const HAY_FIELD_HINTS = {
  topic:      { id: 'Apa fokus bahasan yang disepakati?',                       en: 'What is the agreed focus of discussion?' },
  goal:       { id: 'Apa tujuan yang ingin dicapai?',                           en: 'What is the objective to be achieved?' },
  reality:    { id: 'Apa situasi yang dialami saat ini?',                       en: 'What is the current situation?' },
  options:    { id: 'Apa alternatif solusi yang dapat dilakukan?',              en: 'What are the solution alternatives?' },
  wayForward: { id: 'Apa rencana tindakan yang akan diambil?',                  en: 'What is the action plan?' },
}

const EMPTY_VIP_TOPIC = () => ({ id: Date.now() + Math.random(), title: '', description: '', goalPlan: '', weight: '', status: 'In Progress', checkInNotes: '' })
const VIP_STATUSES = ['Not Started', 'In Progress', 'Completed']

const hayStatusColor = (s) =>
  s === 'Replied' ? 'bg-green-50 text-green-700'
  : s === 'Manager-Created' ? 'bg-blue-50 text-blue-700'
  : 'bg-yellow-50 text-yellow-700'

const vipStatusColor = (s) =>
  s === 'Completed' ? 'bg-green-50 text-green-700'
  : s === 'Not Started' ? 'bg-gray-100 text-gray-500'
  : 'bg-blue-50 text-blue-700'

export default function MssCheckInPage() {
  const t = useT()
  const { currentUser } = useAuthStore()
  const { employees } = useEmployeeStore()
  const { replyHay, getByManager: getHayByManager, submitHayByManager } = useHayStore()
  const { getByManager: getVipByManager } = useVipStore()

  const mid = currentUser?.id || 2

  /* ── tab: 'hay' | 'vip' ──────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState('hay')

  /* ── HAY state ───────────────────────────────────────────────────── */
  const [hayView, setHayView] = useState('list') // 'list' | 'create'
  const [selectedHayId, setSelectedHayId] = useState(null)
  const [hayReply, setHayReply] = useState('')
  const [hayFilter, setHayFilter] = useState('All')
  const [hayForm, setHayForm] = useState(EMPTY_HAY)
  const [selectedEmployee, setSelectedEmployee] = useState('')

  /* ── VIP state ───────────────────────────────────────────────────── */
  const [selectedVipId, setSelectedVipId] = useState(null)

  const [msg, setMsg] = useState(null)
  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3500) }

  const myTeam = employees.filter(e => e.managerId === mid && e.endDate === '')

  const teamHay = getHayByManager(mid).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
  const teamVip = getVipByManager(mid).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  const filteredHay = hayFilter === 'All' ? teamHay : teamHay.filter(h => h.status === hayFilter)
  const selectedHay = teamHay.find(h => h.id === selectedHayId)
  const selectedVip = teamVip.find(v => v.id === selectedVipId)

  const pending = teamHay.filter(h => h.status === 'Submitted').length

  /* ── HAY reply ───────────────────────────────────────────────────── */
  const handleReply = () => {
    if (!hayReply.trim()) return flash(t('Balasan tidak boleh kosong.', 'Reply cannot be empty.'), 'error')
    replyHay(selectedHayId, hayReply)
    flash(t('Balasan berhasil dikirim.', 'Reply sent successfully.'))
    setHayReply('')
    setSelectedHayId(null)
  }

  /* ── HAY create for employee ─────────────────────────────────────── */
  const handleCreate = () => {
    if (!selectedEmployee) return flash(t('Pilih karyawan terlebih dahulu.', 'Please select an employee.'), 'error')
    const missing = HAY_FIELDS.find(f => !hayForm[f.key]?.trim())
    if (missing) return flash(t('Semua field wajib diisi.', 'All fields are required.'), 'error')
    const emp = myTeam.find(e => String(e.id) === selectedEmployee)
    submitHayByManager({
      employeeId: emp.id,
      employeeName: emp.name,
      managerId: mid,
      managerName: currentUser?.name || 'Ahmad Fauzi',
      date: new Date().toISOString().slice(0, 10),
      ...hayForm,
    })
    flash(t('Sesi HAY berhasil dibuat.', 'HAY session successfully created.'))
    setHayForm(EMPTY_HAY)
    setSelectedEmployee('')
    setHayView('list')
  }

  /* ─────────────────────────────────────────────────────────────────── */
  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>
        {t('Team Check-In', 'Team Check-In')}
      </h1>
      <p className='text-gray-500 text-sm mb-5'>
        {t(
          'Kelola sesi HAY (coaching) dan VIP (performance goals) dari anggota tim Anda.',
          'Manage HAY (coaching) and VIP (performance goals) sessions from your team members.'
        )}
      </p>

      {/* TABS */}
      <div className='flex gap-2 mb-6'>
        {[
          ['hay', '🤝 HAY Sessions'],
          ['vip', '🎯 VIP Sessions'],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === key ? 'text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            style={activeTab === key ? { background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' } : {}}>
            {label}
          </button>
        ))}
      </div>

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-xl mb-4 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {msg.text}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* HAY TAB */}
      {activeTab === 'hay' && (
        <>
          {/* Stats */}
          <div className='grid grid-cols-3 gap-4 mb-5'>
            {[
              [t('Total Sesi HAY', 'Total HAY Sessions'), teamHay.length, '💬', '#8B1A1A'],
              [t('Perlu Dibalas', 'Needs Reply'), pending, '⏳', '#d97706'],
              [t('Sudah Dibalas', 'Replied'), teamHay.filter(h => h.status === 'Replied').length, '✅', '#059669'],
            ].map(([l, v, i, c]) => (
              <div key={l} className='bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-100 flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl flex items-center justify-center text-xl' style={{ background: c + '22' }}>{i}</div>
                <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
              </div>
            ))}
          </div>

          {pending > 0 && hayView === 'list' && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 text-sm text-yellow-700'>
              ⚠️ {pending} {t('sesi HAY menunggu balasan Anda.', 'HAY session(s) are waiting for your reply.')}
            </div>
          )}

          {/* Create HAY form */}
          {hayView === 'create' && (
            <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-5'>
              <div className='flex items-center justify-between mb-5'>
                <h2 className='font-bold text-gray-800'>{t('Buat Sesi HAY untuk Karyawan', 'Create HAY Session for Employee')}</h2>
                <button onClick={() => setHayView('list')} className='text-sm text-gray-400 hover:text-gray-600'>✕ {t('Batal', 'Cancel')}</button>
              </div>

              <div className='bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5 text-sm text-blue-700'>
                💡 {t('Dokumentasikan sesi coaching dengan karyawan menggunakan framework T-G-R-O-W.', 'Document a coaching session with an employee using the T-G-R-O-W framework.')}
              </div>

              <div className='mb-5'>
                <label className='block text-sm font-bold text-gray-700 mb-1.5'>👤 {t('Pilih Karyawan', 'Select Employee')}</label>
                <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                  className='w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 transition bg-white'>
                  <option value=''>{t('— Pilih karyawan —', '— Select employee —')}</option>
                  {myTeam.map(e => <option key={e.id} value={String(e.id)}>{e.name} — {e.position}</option>)}
                </select>
              </div>

              <div className='space-y-4'>
                {HAY_FIELDS.map(f => (
                  <div key={f.key}>
                    <label className='block text-sm font-bold text-gray-700 mb-0.5'>{t(f.label, f.labelEN)}</label>
                    <p className='text-xs text-gray-400 mb-1'>{t(HAY_FIELD_HINTS[f.key].id, HAY_FIELD_HINTS[f.key].en)}</p>
                    <textarea rows={2} value={hayForm[f.key]}
                      onChange={e => setHayForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className='w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 resize-none transition' />
                  </div>
                ))}
              </div>

              <div className='flex gap-3 mt-5'>
                <button onClick={handleCreate}
                  className='px-6 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition'
                  style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                  {t('Simpan Sesi HAY', 'Save HAY Session')}
                </button>
                <button onClick={() => setHayView('list')}
                  className='px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition'>
                  {t('Batal', 'Cancel')}
                </button>
              </div>
            </div>
          )}

          {/* HAY list + detail */}
          {hayView === 'list' && (
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
              {/* Left: list */}
              <div className='lg:col-span-2 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100'>
                <div className='px-4 py-3 border-b border-gray-100 flex gap-2 flex-wrap items-center justify-between'>
                  <div className='flex gap-1.5 flex-wrap'>
                    {['All', 'Submitted', 'Replied', 'Manager-Created'].map(f => (
                      <button key={f} onClick={() => setHayFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${hayFilter === f ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        style={hayFilter === f ? { background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' } : {}}>
                        {f === 'All' ? t('Semua', 'All')
                          : f === 'Submitted' ? t('Pending', 'Pending')
                          : f === 'Replied' ? t('Dibalas', 'Replied')
                          : t('Oleh Atasan', 'By Mgr')}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setHayView('create')}
                    className='px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition'
                    style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                    + {t('Buat', 'Create')}
                  </button>
                </div>

                {filteredHay.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-12 text-gray-400 gap-2'>
                    <span className='text-4xl'>💬</span>
                    <p className='text-xs'>{t('Tidak ada sesi.', 'No sessions.')}</p>
                  </div>
                ) : (
                  <div className='divide-y divide-gray-100'>
                    {filteredHay.map(h => (
                      <button key={h.id} onClick={() => { setSelectedHayId(h.id); setHayReply('') }}
                        className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left ${selectedHayId === h.id ? 'bg-red-50/40' : ''}`}>
                        <div className='w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5'
                          style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                          {h.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs font-semibold text-gray-800'>{h.employeeName}</p>
                          <p className='text-xs text-gray-500 line-clamp-1 mt-0.5'>{h.topic}</p>
                          <p className='text-xs text-gray-400 mt-0.5'>{h.date}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${hayStatusColor(h.status)}`}>
                          {h.status === 'Replied' ? t('Dibalas', 'Replied')
                            : h.status === 'Manager-Created' ? t('By Mgr', 'By Mgr')
                            : t('Pending', 'Pending')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: detail */}
              <div className='lg:col-span-3'>
                {!selectedHay ? (
                  <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 flex flex-col items-center justify-center py-20 text-gray-400'>
                    <span className='text-5xl mb-3'>💬</span>
                    <p className='text-sm'>{t('Pilih sesi HAY untuk melihat detail.', 'Select a HAY session to view details.')}</p>
                  </div>
                ) : (
                  <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6'>
                    <div className='flex items-start justify-between mb-5'>
                      <div>
                        <h2 className='font-bold text-gray-800'>{selectedHay.employeeName}</h2>
                        <p className='text-xs text-gray-400 mt-0.5'>{selectedHay.date}</p>
                        {selectedHay.createdBy === 'manager' && (
                          <p className='text-xs text-blue-500 mt-0.5'>📝 {t('Dibuat oleh atasan', 'Created by manager')}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${hayStatusColor(selectedHay.status)}`}>
                        {selectedHay.status === 'Replied' ? t('Sudah Dibalas', 'Replied')
                          : selectedHay.status === 'Manager-Created' ? t('Dibuat Atasan', 'By Manager')
                          : t('Menunggu Balasan', 'Awaiting Reply')}
                      </span>
                    </div>

                    <div className='space-y-3 mb-5'>
                      {HAY_FIELDS.map(f => (
                        <div key={f.key} className='bg-gray-50 rounded-xl p-3.5'>
                          <p className='text-xs font-bold text-gray-400 mb-1'>{t(f.label, f.labelEN)}</p>
                          <p className='text-sm text-gray-700'>{selectedHay[f.key] || '—'}</p>
                        </div>
                      ))}
                    </div>

                    {selectedHay.status === 'Replied' ? (
                      <div className='bg-green-50 border border-green-100 rounded-xl p-4'>
                        <p className='text-xs font-bold text-green-700 mb-1'>✅ {t('Balasan Anda', 'Your Reply')}</p>
                        <p className='text-sm text-green-800'>{selectedHay.managerReply}</p>
                        {selectedHay.repliedAt && (
                          <p className='text-xs text-green-500 mt-1'>
                            {new Date(selectedHay.repliedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        )}
                      </div>
                    ) : selectedHay.status === 'Manager-Created' ? (
                      <div className='bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700'>
                        ℹ️ {t('Sesi ini dibuat oleh Anda. Karyawan dapat melihatnya di halaman Check-In mereka.', 'This session was created by you. The employee can view it on their Check-In page.')}
                      </div>
                    ) : (
                      <div>
                        <label className='block text-xs font-semibold text-gray-600 mb-1.5'>
                          💬 {t('Tulis Balasan', 'Write Reply')}
                        </label>
                        <textarea rows={4} value={hayReply} onChange={e => setHayReply(e.target.value)}
                          placeholder={t('Tulis balasan, feedback, atau arahan...', 'Write your reply, feedback, or guidance...')}
                          className='w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 resize-none transition mb-3' />
                        <button onClick={handleReply}
                          className='px-5 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition'
                          style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                          {t('Kirim Balasan', 'Send Reply')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* VIP TAB */}
      {activeTab === 'vip' && (
        <>
          {/* Stats */}
          <div className='grid grid-cols-2 gap-4 mb-5'>
            {[
              [t('Total Sesi VIP', 'Total VIP Sessions'), teamVip.length, '🎯', '#d97706'],
              [t('Karyawan dengan VIP', 'Employees with VIP'), new Set(teamVip.map(v => v.employeeId)).size, '👥', '#059669'],
            ].map(([l, v, i, c]) => (
              <div key={l} className='bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-100 flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl flex items-center justify-center text-xl' style={{ background: c + '22' }}>{i}</div>
                <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
              </div>
            ))}
          </div>

          <div className='bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 text-sm text-blue-700'>
            ℹ️ {t('Sesi VIP dibuat oleh karyawan. Anda dapat melihat isinya sebagai referensi coaching.', 'VIP sessions are created by employees. You can view them as coaching reference.')}
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
            {/* Left: list */}
            <div className='lg:col-span-2 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <p className='text-xs font-semibold text-gray-500'>{teamVip.length} {t('sesi dari tim Anda', 'sessions from your team')}</p>
              </div>
              {teamVip.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-12 text-gray-400 gap-2'>
                  <span className='text-4xl'>🎯</span>
                  <p className='text-xs'>{t('Belum ada sesi VIP dari tim.', 'No VIP sessions from your team yet.')}</p>
                </div>
              ) : (
                <div className='divide-y divide-gray-100'>
                  {teamVip.map(v => (
                    <button key={v.id} onClick={() => setSelectedVipId(v.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left ${selectedVipId === v.id ? 'bg-orange-50/40' : ''}`}>
                      <div className='w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5'
                        style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
                        {v.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-semibold text-gray-800'>{v.employeeName}</p>
                        <p className='text-xs text-orange-600 font-medium mt-0.5'>{v.name}</p>
                        <p className='text-xs text-gray-400 mt-0.5'>{v.date} · {v.topics.length} {t('topik', 'topic(s)')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: detail */}
            <div className='lg:col-span-3'>
              {!selectedVip ? (
                <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 flex flex-col items-center justify-center py-20 text-gray-400'>
                  <span className='text-5xl mb-3'>🎯</span>
                  <p className='text-sm'>{t('Pilih sesi VIP untuk melihat detail.', 'Select a VIP session to view details.')}</p>
                </div>
              ) : (
                <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6'>
                  <div className='flex items-start justify-between mb-5'>
                    <div>
                      <div className='flex items-center gap-2 mb-0.5'>
                        <span className='text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold'>VIP</span>
                        <h2 className='font-bold text-gray-800'>{selectedVip.name}</h2>
                      </div>
                      <p className='text-xs text-gray-400'>{selectedVip.employeeName} · {selectedVip.date}</p>
                    </div>
                    <span className='text-xs text-gray-400'>{selectedVip.topics.length} {t('topik', 'topic(s)')}</span>
                  </div>

                  <h3 className='text-sm font-bold text-gray-600 mb-3'>{t('Performance Goal Discussion Topics', 'Performance Goal Discussion Topics')}</h3>
                  <div className='space-y-4'>
                    {selectedVip.topics.map(tp => (
                      <div key={tp.id} className='border border-gray-200 rounded-xl overflow-hidden'>
                        <div className='px-4 py-2.5 bg-orange-50 border-b border-orange-100 flex items-center justify-between'>
                          <p className='text-sm font-bold text-orange-600'>{tp.title}</p>
                          <span className='text-xs text-gray-400'>
                            {t('Notes added in this check-in', 'Notes added in this check-in')}: {tp.checkInNotes ? 1 : 0}
                          </span>
                        </div>
                        <div className='p-4 space-y-3'>
                          {tp.description && <p className='text-sm text-gray-600'>{tp.description}</p>}
                          <div className='flex flex-wrap gap-4 text-xs'>
                            {tp.goalPlan && (
                              <div><span className='text-gray-400'>{t('Goal Plan', 'Goal Plan')}: </span><span className='font-semibold text-gray-700'>{tp.goalPlan}</span></div>
                            )}
                            {(tp.weight !== '' && tp.weight !== undefined) && (
                              <div><span className='text-gray-400'>{t('Bobot', 'Weight')}: </span><span className='font-semibold text-gray-700'>{tp.weight}%</span></div>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${vipStatusColor(tp.status)}`}>{tp.status}</span>
                          </div>
                          {tp.checkInNotes && (
                            <div className='bg-blue-50 rounded-lg p-3'>
                              <p className='text-xs font-bold text-blue-600 mb-1'>📝 {t('Notes Check-In', 'Check-In Notes')}</p>
                              <p className='text-sm text-blue-800'>{tp.checkInNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

    </div>
  )
}
