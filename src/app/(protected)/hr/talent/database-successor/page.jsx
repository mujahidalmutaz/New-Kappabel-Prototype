'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

function FitnessBadge({ level }) {
  const cls = {
    High:   'bg-green-100 text-green-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low:    'bg-red-100 text-red-700',
  }[level] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{level}</span>
}

function SdpTermBadge({ term }) {
  const cls = {
    Short: 'bg-red-100 text-red-700',
    Mid:   'bg-amber-100 text-amber-700',
    Long:  'bg-green-100 text-green-700',
  }[term] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{term}</span>
}

const EMPTY_FORM = {
  employeeName: '', targetPositionName: '', fitnessLevel: 'Medium', sdpTerm: 'Mid',
  currentPosition: '', department: '', skillsGap: '', expectedReadinessDate: '', willingness: 'High',
}

export default function DatabaseSuccessorPage() {
  const { databaseSuccessor, addToSuccessorDatabase, removeFromSuccessorDatabase, updateSuccessorDatabase } = useTalentStore()
  const [filterPosition, setFilterPosition] = useState('all')
  const [filterFitness, setFilterFitness] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [delId, setDelId] = useState(null)
  const [msg, setMsg] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const positions = [...new Set(databaseSuccessor.map(d => d.targetPositionName).filter(Boolean))]

  const filtered = databaseSuccessor.filter(d => {
    if (filterPosition !== 'all' && d.targetPositionName !== filterPosition) return false
    if (filterFitness !== 'all' && d.fitnessLevel !== filterFitness) return false
    return true
  })

  const openNew = () => {
    setEditId(null); setForm(EMPTY_FORM); setShowModal(true)
  }

  const openEdit = (d) => {
    setEditId(d.id)
    setForm({ employeeName: d.employeeName, targetPositionName: d.targetPositionName, fitnessLevel: d.fitnessLevel, sdpTerm: d.sdpTerm,
      currentPosition: d.currentPosition || '', department: d.department || '', skillsGap: d.skillsGap || '',
      expectedReadinessDate: d.expectedReadinessDate || '', willingness: d.willingness || 'High' })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.employeeName.trim() || !form.targetPositionName.trim()) {
      return flash('Nama karyawan dan target posisi wajib diisi.', 'error')
    }
    if (editId) {
      updateSuccessorDatabase(editId, form)
      flash('Data successor diperbarui.')
    } else {
      addToSuccessorDatabase(form)
      flash('Successor berhasil ditambahkan ke database.')
    }
    setShowModal(false)
  }

  return (
    <div>
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold
          ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {msg.text}
        </div>
      )}

      {/* Header */}
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-start gap-3'>
          <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-sm'
            style={{ background: BRAND }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
              <polyline points="17 11 19 13 23 9"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Database Successor Employee</h1>
            <p className='mt-1 text-sm text-gray-500'>Daftar kandidat penerus yang telah disiapkan untuk Key Position</p>
          </div>
        </div>
        <button onClick={openNew}
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
          style={{ background: BRAND }}>
          + Tambah Successor
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[
          { label: 'Total Successor', count: databaseSuccessor.length, color: 'border-red-500' },
          { label: 'High Fitness',    count: databaseSuccessor.filter(d => d.fitnessLevel === 'High').length, color: 'border-green-500' },
          { label: 'Short Ready',     count: databaseSuccessor.filter(d => d.sdpTerm === 'Short').length, color: 'border-amber-500' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 border-t-2 ${color}`}>
            <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>{label}</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{count}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-4 flex-wrap'>
        <select value={filterPosition} onChange={e => setFilterPosition(e.target.value)}
          className='px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
          <option value='all'>Semua Posisi</option>
          {positions.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterFitness} onChange={e => setFilterFitness(e.target.value)}
          className='px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
          <option value='all'>Semua Fitness</option>
          <option value='High'>High</option>
          <option value='Medium'>Medium</option>
          <option value='Low'>Low</option>
        </select>
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr style={{ background: BRAND }}>
                {['No', 'Nama', 'Target Posisi', 'Fitness Level', 'SDP Term', 'Tanggal Masuk', 'Aksi'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className='px-4 py-10 text-center text-gray-400'>Belum ada data successor.</td></tr>
              )}
              {filtered.map((d, idx) => (
                <tr key={d.id} className={`align-middle ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{idx + 1}</td>
                  <td className='px-4 py-3 font-semibold text-gray-800 whitespace-nowrap'>{d.employeeName}</td>
                  <td className='px-4 py-3 text-gray-700 text-sm max-w-[180px] truncate' title={d.targetPositionName}>{d.targetPositionName}</td>
                  <td className='px-4 py-3 whitespace-nowrap'><FitnessBadge level={d.fitnessLevel} /></td>
                  <td className='px-4 py-3 whitespace-nowrap'><SdpTermBadge term={d.sdpTerm} /></td>
                  <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{d.addedAt}</td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2 whitespace-nowrap'>
                      <button onClick={() => openEdit(d)}
                        className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                        Edit
                      </button>
                      <button onClick={() => setDelId(d.id)}
                        className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition'>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>{editId ? 'Edit Successor' : 'Tambah Successor'}</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Karyawan <span className='text-red-400'>*</span></label>
                <input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))}
                  placeholder='Nama karyawan…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Target Posisi <span className='text-red-400'>*</span></label>
                <input value={form.targetPositionName} onChange={e => setForm(f => ({ ...f, targetPositionName: e.target.value }))}
                  placeholder='Posisi yang dituju…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Posisi Saat Ini</label>
                  <input value={form.currentPosition} onChange={e => setForm(f => ({ ...f, currentPosition: e.target.value }))}
                    placeholder='Jabatan saat ini…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Departemen</label>
                  <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                    placeholder='Departemen…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Skills Gap</label>
                <textarea value={form.skillsGap} onChange={e => setForm(f => ({ ...f, skillsGap: e.target.value }))}
                  rows={2} placeholder='Kompetensi yang masih perlu dikembangkan…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Expected Readiness Date</label>
                  <input type='date' value={form.expectedReadinessDate} onChange={e => setForm(f => ({ ...f, expectedReadinessDate: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Willingness</label>
                  <select value={form.willingness} onChange={e => setForm(f => ({ ...f, willingness: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                    <option value='High'>High</option>
                    <option value='Medium'>Medium</option>
                    <option value='Low'>Low</option>
                  </select>
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Fitness Level</label>
                  <select value={form.fitnessLevel} onChange={e => setForm(f => ({ ...f, fitnessLevel: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                    <option value='High'>High</option>
                    <option value='Medium'>Medium</option>
                    <option value='Low'>Low</option>
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>SDP Term</label>
                  <select value={form.sdpTerm} onChange={e => setForm(f => ({ ...f, sdpTerm: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                    <option value='Short'>Short</option>
                    <option value='Mid'>Mid</option>
                    <option value='Long'>Long</option>
                  </select>
                </div>
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSave}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                {editId ? 'Simpan Perubahan' : 'Tambah Successor'}
              </button>
              <button onClick={() => setShowModal(false)}
                className='flex-1 py-2.5 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delId && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50' onClick={() => setDelId(null)}>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-80' onClick={e => e.stopPropagation()}>
            <h3 className='text-base font-bold text-gray-800 mb-2'>Hapus Successor?</h3>
            <p className='text-sm text-gray-500 mb-5'>Data ini akan dihapus dari database successor.</p>
            <div className='flex gap-3'>
              <button onClick={() => { const id = delId; setDelId(null); removeFromSuccessorDatabase(id); flash('Data dihapus.') }}
                className='flex-1 py-2 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition'>
                Hapus
              </button>
              <button onClick={() => setDelId(null)}
                className='flex-1 py-2 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
