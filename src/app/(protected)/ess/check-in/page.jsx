'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'
import { useAuthStore } from '@/store/authStore'
import { useHayStore } from '@/store/hayStore'

const EMPTY = { topic: '', goal: '', reality: '', options: '', wayForward: '' }

const FIELDS = [
  {
    key: 'topic',
    label: '1. T — Topic',
    labelEN: '1. T — Topic',
    hint: 'Apa fokus bahasan yang disepakati dalam sesi HAY ini?',
    hintEN: 'What is the focus of discussion in this HAY session?',
  },
  {
    key: 'goal',
    label: '2. G — Goal',
    labelEN: '2. G — Goal',
    hint: 'Apa tujuan yang ingin dicapai dari sesi HAY ini?',
    hintEN: 'What is the objective to be achieved in this HAY session?',
  },
  {
    key: 'reality',
    label: '3. R — Reality',
    labelEN: '3. R — Reality',
    hint: 'Apa situasi yang dialami/dipikirkan/dirasakan saat ini?',
    hintEN: 'What is the thought/feeling in the current situation?',
  },
  {
    key: 'options',
    label: '4. O — Options/Alternatives',
    labelEN: '4. O — Options/Alternatives',
    hint: 'Apa alternatif solusi yang dapat dilakukan untuk mencapai hasil yang diinginkan?',
    hintEN: 'What are the solution alternatives to achieve the desired objective?',
  },
  {
    key: 'wayForward',
    label: '5. W — Way Forward',
    labelEN: '5. W — Way Forward',
    hint: 'Apa rencana tindakan/langkah yang akan diambil untuk mencapai hasil yang diinginkan?',
    hintEN: 'What is the action plan to achieve the desired objective?',
  },
]

export default function EssCheckInPage() {
  const t = useT()
  const { currentUser } = useAuthStore()
  const { sessions, submitHay, getByEmployee } = useHayStore()

  const [view, setView] = useState('list') // 'list' | 'new' | 'detail'
  const [form, setForm] = useState(EMPTY)
  const [selectedId, setSelectedId] = useState(null)
  const [msg, setMsg] = useState(null)

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  const myHistory = getByEmployee(currentUser?.id || 1)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  const selected = myHistory.find(h => h.id === selectedId)

  const handleSubmit = () => {
    const missing = FIELDS.find(f => !form[f.key]?.trim())
    if (missing) return flash(t('Semua field wajib diisi.', 'All fields are required.'), 'error')

    submitHay({
      employeeId: currentUser?.id || 1,
      employeeName: currentUser?.name || 'Budi Santoso',
      managerId: currentUser?.managerId || 2,
      managerName: currentUser?.managerName || 'Ahmad Fauzi',
      date: new Date().toISOString().slice(0, 10),
      ...form,
    })
    flash(t('Form HAY berhasil dikirim ke atasan.', 'HAY form successfully sent to your manager.'))
    setForm(EMPTY)
    setView('list')
  }

  const statusColor = (s) =>
    s === 'Replied' ? 'bg-green-50 text-green-700'
    : s === 'Manager-Created' ? 'bg-blue-50 text-blue-700'
    : 'bg-yellow-50 text-yellow-700'

  const statusLabel = (s) =>
    s === 'Replied' ? t('Dibalas', 'Replied')
    : s === 'Manager-Created' ? t('Dari Atasan', 'From Manager')
    : t('Menunggu', 'Pending')

  return (
    <div>
      <div className='flex items-start justify-between mb-1'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            {t('Check-In — HAY (How Are You?)', 'Check-In — HAY (How Are You?)')}
          </h1>
          <p className='text-gray-500 text-sm mt-1'>
            {t(
              'Sesi one-on-one dengan atasan menggunakan framework T-G-R-O-W untuk refleksi dan pengembangan diri.',
              'One-on-one session with your manager using the T-G-R-O-W framework for reflection and personal development.'
            )}
          </p>
        </div>
        {view !== 'new' && (
          <button
            onClick={() => { setView('new'); setSelectedId(null) }}
            className='px-4 py-2 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shrink-0'
            style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
            + {t('Isi Form HAY', 'Fill HAY Form')}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4 my-6'>
        {[
          [t('Total Sesi', 'Total Sessions'), myHistory.length, '💬', '#8B1A1A'],
          [t('Menunggu Balasan', 'Awaiting Reply'), myHistory.filter(h => h.status === 'Submitted').length, '⏳', '#d97706'],
          [t('Sudah Dibalas', 'Replied'), myHistory.filter(h => h.status === 'Replied').length, '✅', '#059669'],
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

      {/* NEW FORM */}
      {view === 'new' && (
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='font-bold text-gray-800 text-lg'>
              {t('Form HAY — How Are You?', 'HAY Form — How Are You?')}
            </h2>
            <button onClick={() => setView('list')} className='text-sm text-gray-400 hover:text-gray-600'>
              ✕ {t('Batal', 'Cancel')}
            </button>
          </div>

          <div className='bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-sm text-blue-700'>
            💡 {t(
              'Form ini akan dikirim ke atasan langsung Anda untuk direview dan dibalas. Isi dengan jujur dan reflektif.',
              'This form will be sent to your direct manager for review and reply. Fill it honestly and reflectively.'
            )}
          </div>

          <div className='space-y-5'>
            {FIELDS.map(f => (
              <div key={f.key}>
                <label className='block text-sm font-bold text-gray-700 mb-0.5'>
                  {t(f.label, f.labelEN)}
                </label>
                <p className='text-xs text-gray-400 mb-2'>{t(f.hint, f.hintEN)}</p>
                <textarea
                  rows={3}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={t(f.hint, f.hintEN)}
                  className='w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 resize-none transition'
                />
              </div>
            ))}
          </div>

          <div className='flex gap-3 mt-6'>
            <button
              onClick={handleSubmit}
              className='px-6 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition'
              style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
              {t('Kirim ke Atasan', 'Send to Manager')}
            </button>
            <button
              onClick={() => setView('list')}
              className='px-6 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition'>
              {t('Batal', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* DETAIL VIEW */}
      {view === 'detail' && selected && (
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-6'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h2 className='font-bold text-gray-800'>{t('Detail Sesi HAY', 'HAY Session Detail')}</h2>
              <p className='text-xs text-gray-400 mt-0.5'>{selected.date} · {t('Atasan', 'Manager')}: {selected.managerName}</p>
            </div>
            <div className='flex items-center gap-3'>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(selected.status)}`}>
                {selected.status === 'Replied' ? t('Sudah Dibalas', 'Replied')
                  : selected.status === 'Manager-Created' ? t('Dari Atasan', 'From Manager')
                  : t('Menunggu Balasan', 'Awaiting Reply')}
              </span>
              <button onClick={() => setView('list')} className='text-sm text-gray-400 hover:text-gray-600'>
                ← {t('Kembali', 'Back')}
              </button>
            </div>
          </div>

          <div className='space-y-4'>
            {FIELDS.map(f => (
              <div key={f.key} className='bg-gray-50 rounded-xl p-4'>
                <p className='text-xs font-bold text-gray-500 mb-1'>{t(f.label, f.labelEN)}</p>
                <p className='text-sm text-gray-700'>{selected[f.key] || '—'}</p>
              </div>
            ))}
          </div>

          {selected.managerReply && (
            <div className='mt-5 bg-green-50 border border-green-100 rounded-xl p-4'>
              <p className='text-xs font-bold text-green-700 mb-1'>
                💬 {t('Balasan Atasan', 'Manager Reply')} — {selected.managerName}
              </p>
              <p className='text-sm text-green-800'>{selected.managerReply}</p>
              {selected.repliedAt && (
                <p className='text-xs text-green-500 mt-1'>
                  {new Date(selected.repliedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* LIST */}
      {view === 'list' && (
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100'>
          <div className='px-6 py-4 border-b border-gray-100'>
            <h2 className='font-bold text-gray-700 text-sm'>{t('Riwayat Sesi HAY', 'HAY Session History')}</h2>
          </div>
          {myHistory.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-gray-400 gap-2'>
              <span className='text-5xl'>💬</span>
              <p className='text-sm'>{t('Belum ada sesi HAY. Mulai check-in pertama Anda!', 'No HAY sessions yet. Start your first check-in!')}</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-100'>
              {myHistory.map(h => (
                <button
                  key={h.id}
                  onClick={() => { setSelectedId(h.id); setView('detail') }}
                  className='w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition text-left'>
                  <div className='w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0'
                    style={{ background: h.status === 'Replied' ? '#05966922' : '#d9740622' }}>
                    {h.status === 'Replied' ? '✅' : '⏳'}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-gray-800 line-clamp-1'>{h.topic}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>
                      {h.date} · {t('Atasan', 'Manager')}: {h.managerName}
                    </p>
                  </div>
                  <div className='flex items-center gap-3 shrink-0'>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(h.status)}`}>
                      {statusLabel(h.status)}
                    </span>
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
