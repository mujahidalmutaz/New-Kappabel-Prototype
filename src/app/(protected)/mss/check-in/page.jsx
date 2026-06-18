'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'
import { useAuthStore } from '@/store/authStore'
import { useHayStore } from '@/store/hayStore'

const FIELDS = [
  { key: 'topic',      label: '1. T — Topic',                labelEN: '1. T — Topic' },
  { key: 'goal',       label: '2. G — Goal',                 labelEN: '2. G — Goal' },
  { key: 'reality',    label: '3. R — Reality',              labelEN: '3. R — Reality' },
  { key: 'options',    label: '4. O — Options/Alternatives', labelEN: '4. O — Options/Alternatives' },
  { key: 'wayForward', label: '5. W — Way Forward',          labelEN: '5. W — Way Forward' },
]

export default function MssCheckInPage() {
  const t = useT()
  const { currentUser } = useAuthStore()
  const { sessions, replyHay, getByManager } = useHayStore()

  const [selectedId, setSelectedId] = useState(null)
  const [reply, setReply] = useState('')
  const [msg, setMsg] = useState(null)
  const [filter, setFilter] = useState('All')

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  const teamSessions = getByManager(currentUser?.id || 2)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))

  const filtered = filter === 'All' ? teamSessions
    : teamSessions.filter(h => h.status === filter)

  const selected = teamSessions.find(h => h.id === selectedId)

  const handleReply = () => {
    if (!reply.trim()) return flash(t('Balasan tidak boleh kosong.', 'Reply cannot be empty.'), 'error')
    replyHay(selectedId, reply)
    flash(t('Balasan berhasil dikirim.', 'Reply sent successfully.'))
    setReply('')
    setSelectedId(null)
  }

  const statusColor = (s) => s === 'Replied'
    ? 'bg-green-50 text-green-700'
    : 'bg-yellow-50 text-yellow-700'

  const pending = teamSessions.filter(h => h.status === 'Submitted').length

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>
        {t('Team Check-In — HAY Sessions', 'Team Check-In — HAY Sessions')}
      </h1>
      <p className='text-gray-500 text-sm mb-6'>
        {t(
          'Review dan balas form HAY (How Are You?) dari anggota tim Anda.',
          'Review and reply to HAY (How Are You?) forms from your team members.'
        )}
      </p>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[
          [t('Total Sesi', 'Total Sessions'), teamSessions.length, '💬', '#8B1A1A'],
          [t('Perlu Dibalas', 'Needs Reply'), pending, '⏳', '#d97706'],
          [t('Sudah Dibalas', 'Replied'), teamSessions.filter(h => h.status === 'Replied').length, '✅', '#059669'],
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

      {pending > 0 && (
        <div className='bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 text-sm text-yellow-700'>
          ⚠️ {pending} {t('sesi HAY menunggu balasan Anda.', 'HAY session(s) are waiting for your reply.')}
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
        {/* LEFT: list */}
        <div className='lg:col-span-2 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100'>
          <div className='px-4 py-3 border-b border-gray-100 flex gap-2'>
            {['All', 'Submitted', 'Replied'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${filter === f ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                style={filter === f ? { background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' } : {}}>
                {f === 'All' ? t('Semua', 'All') : f === 'Submitted' ? t('Perlu Dibalas', 'Needs Reply') : t('Dibalas', 'Replied')}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-gray-400 gap-2'>
              <span className='text-4xl'>💬</span>
              <p className='text-xs'>{t('Tidak ada sesi.', 'No sessions.')}</p>
            </div>
          ) : (
            <div className='divide-y divide-gray-100'>
              {filtered.map(h => (
                <button key={h.id} onClick={() => { setSelectedId(h.id); setReply('') }}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition text-left ${selectedId === h.id ? 'bg-red-50/40' : ''}`}>
                  <div className='w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 mt-0.5'
                    style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                    {h.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-xs font-semibold text-gray-800'>{h.employeeName}</p>
                    <p className='text-xs text-gray-500 line-clamp-1 mt-0.5'>{h.topic}</p>
                    <p className='text-xs text-gray-400 mt-0.5'>{h.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${statusColor(h.status)}`}>
                    {h.status === 'Replied' ? t('Dibalas', 'Replied') : t('Perlu Dibalas', 'Reply')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: detail */}
        <div className='lg:col-span-3'>
          {!selected ? (
            <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 flex flex-col items-center justify-center py-20 text-gray-400'>
              <span className='text-5xl mb-3'>💬</span>
              <p className='text-sm'>{t('Pilih sesi HAY untuk melihat detail.', 'Select a HAY session to view details.')}</p>
            </div>
          ) : (
            <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6'>
              <div className='flex items-start justify-between mb-5'>
                <div>
                  <h2 className='font-bold text-gray-800'>{selected.employeeName}</h2>
                  <p className='text-xs text-gray-400 mt-0.5'>{selected.date}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(selected.status)}`}>
                  {selected.status === 'Replied' ? t('Sudah Dibalas', 'Replied') : t('Menunggu Balasan', 'Awaiting Reply')}
                </span>
              </div>

              <div className='space-y-3 mb-5'>
                {FIELDS.map(f => (
                  <div key={f.key} className='bg-gray-50 rounded-xl p-3.5'>
                    <p className='text-xs font-bold text-gray-400 mb-1'>{t(f.label, f.labelEN)}</p>
                    <p className='text-sm text-gray-700'>{selected[f.key] || '—'}</p>
                  </div>
                ))}
              </div>

              {selected.status === 'Replied' ? (
                <div className='bg-green-50 border border-green-100 rounded-xl p-4'>
                  <p className='text-xs font-bold text-green-700 mb-1'>
                    ✅ {t('Balasan Anda', 'Your Reply')}
                  </p>
                  <p className='text-sm text-green-800'>{selected.managerReply}</p>
                  {selected.repliedAt && (
                    <p className='text-xs text-green-500 mt-1'>
                      {new Date(selected.repliedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>
                    💬 {t('Tulis Balasan', 'Write Reply')}
                  </label>
                  <textarea
                    rows={4}
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder={t('Tulis balasan, feedback, atau arahan untuk karyawan...', 'Write your reply, feedback, or guidance for the employee...')}
                    className='w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-red-400 resize-none transition mb-3'
                  />
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
    </div>
  )
}
