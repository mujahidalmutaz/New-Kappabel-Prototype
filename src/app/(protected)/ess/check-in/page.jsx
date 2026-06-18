'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'
import { useAuthStore } from '@/store/authStore'
import { useHayStore } from '@/store/hayStore'
import { useVipStore } from '@/store/vipStore'

/* ── HAY fields ─────────────────────────────────────────────────────────── */
const EMPTY_HAY = { topic: '', goal: '', reality: '', options: '', wayForward: '' }
const HAY_FIELDS = [
  { key: 'topic',      label: '1. T — Topic',                labelEN: '1. T — Topic',                hint: 'Apa fokus bahasan yang disepakati dalam sesi HAY ini?',                   hintEN: 'What is the focus of discussion in this HAY session?' },
  { key: 'goal',       label: '2. G — Goal',                 labelEN: '2. G — Goal',                 hint: 'Apa tujuan yang ingin dicapai dari sesi HAY ini?',                        hintEN: 'What is the objective to be achieved in this HAY session?' },
  { key: 'reality',    label: '3. R — Reality',              labelEN: '3. R — Reality',              hint: 'Apa situasi yang dialami/dipikirkan/dirasakan saat ini?',                  hintEN: 'What is the thought/feeling in the current situation?' },
  { key: 'options',    label: '4. O — Options/Alternatives', labelEN: '4. O — Options/Alternatives', hint: 'Apa alternatif solusi yang dapat dilakukan?',                             hintEN: 'What are the solution alternatives to achieve the desired objective?' },
  { key: 'wayForward', label: '5. W — Way Forward',          labelEN: '5. W — Way Forward',          hint: 'Apa rencana tindakan yang akan diambil?',                                hintEN: 'What is the action plan to achieve the desired objective?' },
]

/* ── VIP helpers ────────────────────────────────────────────────────────── */
const EMPTY_VIP_TOPIC = () => ({ id: Date.now() + Math.random(), title: '', description: '', goalPlan: '', weight: '', status: 'In Progress', checkInNotes: '' })
const VIP_STATUSES = ['Not Started', 'In Progress', 'Completed']

/* ── Status helpers ─────────────────────────────────────────────────────── */
const hayStatusColor = (s) =>
  s === 'Replied' ? 'bg-green-50 text-green-700'
  : s === 'Manager-Created' ? 'bg-blue-50 text-blue-700'
  : 'bg-yellow-50 text-yellow-700'

const hayStatusLabel = (s, t) =>
  s === 'Replied' ? t('Dibalas', 'Replied')
  : s === 'Manager-Created' ? t('Dari Atasan', 'From Manager')
  : t('Menunggu', 'Pending')

const vipStatusColor = (s) =>
  s === 'Completed' ? 'bg-green-50 text-green-700'
  : s === 'Not Started' ? 'bg-gray-100 text-gray-500'
  : 'bg-blue-50 text-blue-700'

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function EssCheckInPage() {
  const t = useT()
  const { currentUser } = useAuthStore()
  const hayStore = useHayStore()
  const vipStore = useVipStore()

  /* view machine: 'list' | 'type-select' | 'new-hay' | 'new-vip' | 'detail-hay' | 'detail-vip' */
  const [view, setView] = useState('list')

  /* HAY form state */
  const [hayForm, setHayForm] = useState(EMPTY_HAY)
  const [selectedHayId, setSelectedHayId] = useState(null)

  /* VIP form state */
  const [vipName, setVipName] = useState('')
  const [vipTopics, setVipTopics] = useState([EMPTY_VIP_TOPIC()])
  const [selectedVipId, setSelectedVipId] = useState(null)

  const [msg, setMsg] = useState(null)
  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3500) }

  const uid = currentUser?.id || 1

  /* merged history */
  const hayItems = hayStore.getByEmployee(uid).map(h => ({ ...h, _type: 'hay' }))
  const vipItems = vipStore.getByEmployee(uid).map(v => ({ ...v, _type: 'vip' }))
  const allItems = [...hayItems, ...vipItems].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  const selectedHay = hayItems.find(h => h.id === selectedHayId)
  const selectedVip = vipItems.find(v => v.id === selectedVipId)

  /* ── HAY submit ─────────────────────────────────────────────────────── */
  const handleHaySubmit = () => {
    const missing = HAY_FIELDS.find(f => !hayForm[f.key]?.trim())
    if (missing) return flash(t('Semua field wajib diisi.', 'All fields are required.'), 'error')
    hayStore.submitHay({
      employeeId: uid,
      employeeName: currentUser?.name || 'Budi Santoso',
      managerId: currentUser?.managerId || 2,
      managerName: currentUser?.managerName || 'Ahmad Fauzi',
      date: new Date().toISOString().slice(0, 10),
      ...hayForm,
    })
    flash(t('Form HAY berhasil dikirim ke atasan.', 'HAY form successfully sent to your manager.'))
    setHayForm(EMPTY_HAY)
    setView('list')
  }

  /* ── VIP submit ─────────────────────────────────────────────────────── */
  const handleVipSubmit = () => {
    if (!vipName.trim()) return flash(t('Nama sesi wajib diisi.', 'Session name is required.'), 'error')
    if (vipTopics.some(tp => !tp.title.trim())) return flash(t('Judul setiap topik wajib diisi.', 'Each topic title is required.'), 'error')
    vipStore.submitVip({
      employeeId: uid,
      employeeName: currentUser?.name || 'Budi Santoso',
      managerId: currentUser?.managerId || 2,
      managerName: currentUser?.managerName || 'Ahmad Fauzi',
      name: vipName,
      date: new Date().toISOString().slice(0, 10),
      topics: vipTopics.map((tp, i) => ({ ...tp, id: i + 1 })),
    })
    flash(t('Sesi VIP berhasil disimpan.', 'VIP session saved successfully.'))
    setVipName('')
    setVipTopics([EMPTY_VIP_TOPIC()])
    setView('list')
  }

  /* ── VIP topic helpers ──────────────────────────────────────────────── */
  const addTopic = () => setVipTopics(p => [...p, EMPTY_VIP_TOPIC()])
  const removeTopic = (id) => setVipTopics(p => p.filter(tp => tp.id !== id))
  const updateTopic = (id, key, val) => setVipTopics(p => p.map(tp => tp.id === id ? { ...tp, [key]: val } : tp))

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div>

      {/* PAGE HEADER */}
      <div className='flex items-start justify-between mb-1'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            {t('Check-In Performance', 'Performance Check-In')}
          </h1>
          <p className='text-gray-500 text-sm mt-1'>
            {t(
              'Sesi one-on-one dengan atasan. Pilih template HAY (coaching) atau VIP (performance goals).',
              'One-on-one session with your manager. Choose HAY (coaching) or VIP (performance goals) template.'
            )}
          </p>
        </div>
        {view === 'list' && (
          <button
            onClick={() => setView('type-select')}
            className='px-4 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shrink-0'
            style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
            + {t('New Check-In', 'New Check-In')}
          </button>
        )}
      </div>

      {/* STATS */}
      <div className='grid grid-cols-4 gap-4 my-6'>
        {[
          [t('Total Sesi', 'Total Sessions'),    allItems.length,                                             '💬', '#8B1A1A'],
          [t('Sesi HAY', 'HAY Sessions'),        hayItems.length,                                             '🤝', '#7c3aed'],
          [t('Sesi VIP', 'VIP Sessions'),        vipItems.length,                                             '🎯', '#d97706'],
          [t('Menunggu Balasan', 'Pending HAY'), hayItems.filter(h => h.status === 'Submitted').length,       '⏳', '#dc2626'],
        ].map(([l, v, i, c]) => (
          <div key={l} className='bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-100 flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl flex items-center justify-center text-xl' style={{ background: c + '22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      {msg && (
        <div className={`text-sm px-4 py-3 rounded-xl mb-4 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
          {msg.text}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VIEW: TYPE SELECT */}
      {view === 'type-select' && (
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-5'>
            <button onClick={() => setView('list')} className='text-sm text-gray-400 hover:text-gray-600'>← {t('Kembali', 'Back')}</button>
            <h2 className='font-bold text-gray-700'>{t('Pilih Template Check-In', 'Choose Check-In Template')}</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            {/* HAY Card */}
            <button
              onClick={() => setView('new-hay')}
              className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 text-left hover:shadow-md hover:ring-red-200 transition group'>
              <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4' style={{ background: '#8B1A1A22' }}>🤝</div>
              <h3 className='font-bold text-gray-800 mb-1'>HAY — How Are You?</h3>
              <p className='text-xs text-gray-500 mb-3'>{t('Framework T-G-R-O-W untuk sesi coaching & refleksi diri bersama atasan.', 'T-G-R-O-W framework for coaching & self-reflection sessions with your manager.')}</p>
              <div className='flex flex-wrap gap-1.5'>
                {['Topic','Goal','Reality','Options','Way Forward'].map(l => (
                  <span key={l} className='text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full'>{l}</span>
                ))}
              </div>
              <div className='mt-4 text-xs font-semibold text-red-700 group-hover:underline'>
                {t('Pilih template ini →', 'Choose this template →')}
              </div>
            </button>

            {/* VIP Card */}
            <button
              onClick={() => setView('new-vip')}
              className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 text-left hover:shadow-md hover:ring-orange-200 transition group'>
              <div className='w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4' style={{ background: '#d9740622' }}>🎯</div>
              <h3 className='font-bold text-gray-800 mb-1'>VIP — Valuing Improvement & Progress</h3>
              <p className='text-xs text-gray-500 mb-3'>{t('Diskusi progress performance goals dengan atasan. Tambahkan topik sesuai goal plan Anda.', 'Discuss performance goal progress with your manager. Add topics matching your goal plan.')}</p>
              <div className='flex flex-wrap gap-1.5'>
                {['Goal Topics','Weight','Status','Check-In Notes'].map(l => (
                  <span key={l} className='text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full'>{l}</span>
                ))}
              </div>
              <div className='mt-4 text-xs font-semibold text-orange-700 group-hover:underline'>
                {t('Pilih template ini →', 'Choose this template →')}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VIEW: NEW HAY FORM */}
      {view === 'new-hay' && (
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='font-bold text-gray-800 text-lg'>HAY Form — How Are You?</h2>
              <p className='text-xs text-gray-400 mt-0.5'>T-G-R-O-W Framework</p>
            </div>
            <button onClick={() => setView('type-select')} className='text-sm text-gray-400 hover:text-gray-600'>
              ✕ {t('Batal', 'Cancel')}
            </button>
          </div>

          <div className='bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700'>
            💡 {t('Form ini akan dikirim ke atasan langsung Anda untuk direview dan dibalas.', 'This form will be sent to your direct manager for review and reply.')}
          </div>

          <div className='space-y-5'>
            {HAY_FIELDS.map(f => (
              <div key={f.key}>
                <label className='block text-sm font-bold text-gray-700 mb-0.5'>{t(f.label, f.labelEN)}</label>
                <p className='text-xs text-gray-400 mb-2'>{t(f.hint, f.hintEN)}</p>
                <textarea rows={3} value={hayForm[f.key]}
                  onChange={e => setHayForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={t(f.hint, f.hintEN)}
                  className='w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 resize-none transition' />
              </div>
            ))}
          </div>

          <div className='flex gap-3 mt-6'>
            <button onClick={handleHaySubmit}
              className='px-6 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition'
              style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
              {t('Kirim ke Atasan', 'Send to Manager')}
            </button>
            <button onClick={() => setView('type-select')}
              className='px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition'>
              {t('Batal', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VIEW: NEW VIP FORM */}
      {view === 'new-vip' && (
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-6'>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h2 className='font-bold text-gray-800 text-lg'>{t('Form VIP — Valuing Improvement & Progress', 'VIP Form — Valuing Improvement & Progress')}</h2>
              <p className='text-xs text-gray-400 mt-0.5'>{t('Performance Goal Discussion', 'Performance Goal Discussion')}</p>
            </div>
            <button onClick={() => setView('type-select')} className='text-sm text-gray-400 hover:text-gray-600'>
              ✕ {t('Batal', 'Cancel')}
            </button>
          </div>

          <div className='bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 text-sm text-orange-700'>
            💡 {t('Isi nama sesi dan tambahkan topik sesuai performance goals Anda. Atasan dapat melihat sesi ini.', 'Fill in the session name and add topics matching your performance goals. Your manager can view this session.')}
          </div>

          {/* Session name */}
          <div className='mb-6'>
            <label className='block text-sm font-bold text-gray-700 mb-1.5'>
              {t('Nama Sesi', 'Session Name')} <span className='text-red-500'>*</span>
            </label>
            <input
              value={vipName}
              onChange={e => setVipName(e.target.value)}
              placeholder={t('cth. OKR Q3 2025', 'e.g. OKR Q3 2025')}
              className='w-full max-w-sm px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 transition'
            />
          </div>

          {/* Topics */}
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <h3 className='font-bold text-gray-700 text-sm'>{t('Performance Goal Discussion Topics', 'Performance Goal Discussion Topics')}</h3>
              <span className='text-xs text-gray-400'>{vipTopics.length} {t('topik', 'topic(s)')}</span>
            </div>

            {vipTopics.map((tp, idx) => (
              <div key={tp.id} className='rounded-xl border border-gray-200 overflow-hidden'>
                <div className='flex items-center justify-between px-4 py-2.5 bg-orange-50 border-b border-orange-100'>
                  <span className='text-xs font-bold text-orange-700'>
                    {tp.title || `${t('Topik', 'Topic')} #${idx + 1}`}
                  </span>
                  {vipTopics.length > 1 && (
                    <button onClick={() => removeTopic(tp.id)} className='text-xs text-gray-400 hover:text-red-500 transition'>
                      ✕ {t('Hapus', 'Remove')}
                    </button>
                  )}
                </div>
                <div className='p-4 space-y-3'>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Judul Topik / Goal', 'Topic Title / Goal')} *</label>
                    <input value={tp.title} onChange={e => updateTopic(tp.id, 'title', e.target.value)}
                      placeholder={t('Nama goal atau topik diskusi', 'Goal name or discussion topic')}
                      className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 transition' />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Deskripsi Goal', 'Goal Description')}</label>
                    <textarea rows={2} value={tp.description} onChange={e => updateTopic(tp.id, 'description', e.target.value)}
                      placeholder={t('Detail target dan konteks goal ini', 'Goal details and context')}
                      className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 resize-none transition' />
                  </div>
                  <div className='grid grid-cols-3 gap-3'>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Goal Plan', 'Goal Plan')}</label>
                      <input value={tp.goalPlan} onChange={e => updateTopic(tp.id, 'goalPlan', e.target.value)}
                        placeholder='Goal Plan 2025'
                        className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 transition' />
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Bobot (%)', 'Weight (%)')}</label>
                      <input type='number' min={0} max={100} value={tp.weight} onChange={e => updateTopic(tp.id, 'weight', e.target.value)}
                        placeholder='0'
                        className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 transition' />
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
                      <select value={tp.status} onChange={e => updateTopic(tp.id, 'status', e.target.value)}
                        className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 transition bg-white'>
                        {VIP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-gray-600 mb-1'>
                      📝 {t('Notes pada Check-In ini', 'Notes for this Check-In')}
                    </label>
                    <textarea rows={2} value={tp.checkInNotes} onChange={e => updateTopic(tp.id, 'checkInNotes', e.target.value)}
                      placeholder={t('Update progress, hambatan, atau rencana ke depan...', 'Progress update, blockers, or next steps...')}
                      className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-400 resize-none transition' />
                  </div>
                </div>
              </div>
            ))}

            <button onClick={addTopic}
              className='w-full py-2.5 border-2 border-dashed border-orange-200 rounded-xl text-sm text-orange-500 font-semibold hover:border-orange-400 hover:text-orange-600 transition'>
              + {t('Tambah Topik', 'Add Topic')}
            </button>
          </div>

          <div className='flex gap-3 mt-6'>
            <button onClick={handleVipSubmit}
              className='px-6 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition'
              style={{ background: 'linear-gradient(135deg,#d97706,#f59e0b)' }}>
              {t('Simpan Sesi VIP', 'Save VIP Session')}
            </button>
            <button onClick={() => setView('type-select')}
              className='px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition'>
              {t('Batal', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VIEW: DETAIL HAY */}
      {view === 'detail-hay' && selectedHay && (
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold'>HAY</span>
                <h2 className='font-bold text-gray-800'>{t('Detail Sesi HAY', 'HAY Session Detail')}</h2>
              </div>
              <p className='text-xs text-gray-400 mt-0.5'>{selectedHay.date} · {t('Atasan', 'Manager')}: {selectedHay.managerName}</p>
            </div>
            <div className='flex items-center gap-3'>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${hayStatusColor(selectedHay.status)}`}>
                {selectedHay.status === 'Replied' ? t('Sudah Dibalas', 'Replied')
                  : selectedHay.status === 'Manager-Created' ? t('Dari Atasan', 'From Manager')
                  : t('Menunggu Balasan', 'Awaiting Reply')}
              </span>
              <button onClick={() => setView('list')} className='text-sm text-gray-400 hover:text-gray-600'>
                ← {t('Kembali', 'Back')}
              </button>
            </div>
          </div>

          <div className='space-y-4'>
            {HAY_FIELDS.map(f => (
              <div key={f.key} className='bg-gray-50 rounded-xl p-4'>
                <p className='text-xs font-bold text-gray-500 mb-1'>{t(f.label, f.labelEN)}</p>
                <p className='text-sm text-gray-700'>{selectedHay[f.key] || '—'}</p>
              </div>
            ))}
          </div>

          {selectedHay.managerReply && (
            <div className='mt-5 bg-green-50 border border-green-100 rounded-xl p-4'>
              <p className='text-xs font-bold text-green-700 mb-1'>
                💬 {t('Balasan Atasan', 'Manager Reply')} — {selectedHay.managerName}
              </p>
              <p className='text-sm text-green-800'>{selectedHay.managerReply}</p>
              {selectedHay.repliedAt && (
                <p className='text-xs text-green-500 mt-1'>
                  {new Date(selectedHay.repliedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VIEW: DETAIL VIP */}
      {view === 'detail-vip' && selectedVip && (
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-6'>
          <div className='flex items-center justify-between mb-5'>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold'>VIP</span>
                <h2 className='font-bold text-gray-800'>{selectedVip.name}</h2>
              </div>
              <p className='text-xs text-gray-400 mt-0.5'>{selectedVip.date} · {t('Atasan', 'Manager')}: {selectedVip.managerName}</p>
            </div>
            <button onClick={() => setView('list')} className='text-sm text-gray-400 hover:text-gray-600'>
              ← {t('Kembali', 'Back')}
            </button>
          </div>

          <h3 className='text-sm font-bold text-gray-600 mb-3'>{t('Performance Goal Discussion Topics', 'Performance Goal Discussion Topics')}</h3>
          <div className='space-y-4'>
            {selectedVip.topics.map((tp, idx) => (
              <div key={tp.id} className='border border-gray-200 rounded-xl overflow-hidden'>
                <div className='px-4 py-2.5 bg-orange-50 border-b border-orange-100'>
                  <p className='text-sm font-bold text-orange-600'>{tp.title}</p>
                  <p className='text-xs text-gray-400 mt-0.5'>
                    {t('Notes added in this check-in', 'Notes added in this check-in')}: {tp.checkInNotes ? 1 : 0}
                  </p>
                </div>
                <div className='p-4 space-y-3'>
                  {tp.description && (
                    <p className='text-sm text-gray-600'>{tp.description}</p>
                  )}
                  <div className='flex flex-wrap gap-4 text-xs'>
                    {tp.goalPlan && (
                      <div><span className='text-gray-400'>{t('Goal Plan', 'Goal Plan')}: </span><span className='font-semibold text-gray-700'>{tp.goalPlan}</span></div>
                    )}
                    {tp.weight !== '' && tp.weight !== undefined && (
                      <div><span className='text-gray-400'>{t('Bobot', 'Weight')}: </span><span className='font-semibold text-gray-700'>{tp.weight}%</span></div>
                    )}
                    <div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${vipStatusColor(tp.status)}`}>
                        {tp.status}
                      </span>
                    </div>
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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* VIEW: LIST */}
      {view === 'list' && (
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100'>
          <div className='px-6 py-4 border-b border-gray-100'>
            <h2 className='font-bold text-gray-700 text-sm'>{t('Riwayat Check-In', 'Check-In History')}</h2>
          </div>
          {allItems.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-gray-400 gap-2'>
              <span className='text-5xl'>💬</span>
              <p className='text-sm'>{t('Belum ada sesi check-in. Mulai check-in pertama Anda!', 'No check-in sessions yet. Start your first check-in!')}</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-100'>
              {allItems.map(item => (
                <button
                  key={`${item._type}-${item.id}`}
                  onClick={() => {
                    if (item._type === 'hay') { setSelectedHayId(item.id); setView('detail-hay') }
                    else { setSelectedVipId(item.id); setView('detail-vip') }
                  }}
                  className='w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left'>
                  <div className='w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0'
                    style={{ background: item._type === 'vip' ? '#d9740622' : (item.status === 'Replied' ? '#05966922' : '#dc262622') }}>
                    {item._type === 'vip' ? '🎯' : item.status === 'Replied' ? '✅' : '⏳'}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-gray-800 line-clamp-1'>
                      {item._type === 'vip' ? item.name : item.topic}
                    </p>
                    <p className='text-xs text-gray-400 mt-0.5'>
                      {item.date} · {t('Atasan', 'Manager')}: {item.managerName}
                    </p>
                  </div>
                  <div className='flex items-center gap-2 shrink-0'>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item._type === 'vip' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {item._type === 'vip' ? 'VIP' : 'HAY'}
                    </span>
                    {item._type === 'hay' && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${hayStatusColor(item.status)}`}>
                        {hayStatusLabel(item.status, t)}
                      </span>
                    )}
                    <span className='text-gray-300'>›</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  )
}
