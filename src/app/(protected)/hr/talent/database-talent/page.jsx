'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

const EMPTY_FORM = {
  employeeName: '', position: '', department: '', talentBoxLabel: '', year: new Date().getFullYear(),
}

export default function DatabaseTalentPage() {
  const { databaseTalent, addToTalentDatabase, removeFromTalentDatabase } = useTalentStore()
  const [filterYear, setFilterYear] = useState('all')
  const [filterDept, setFilterDept] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [delId, setDelId] = useState(null)
  const [msg, setMsg] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const years = [...new Set(databaseTalent.map(d => d.year))].sort((a, b) => b - a)
  const departments = [...new Set(databaseTalent.map(d => d.department).filter(Boolean))]

  const filtered = databaseTalent.filter(d => {
    if (filterYear !== 'all' && String(d.year) !== String(filterYear)) return false
    if (filterDept !== 'all' && d.department !== filterDept) return false
    return true
  })

  const handleAdd = () => {
    if (!form.employeeName.trim()) return flash('Nama karyawan wajib diisi.', 'error')
    addToTalentDatabase(form)
    flash('Karyawan berhasil ditambahkan ke Database Talent.')
    setShowModal(false)
  }

  const BOX_COLOR = {
    'Star':           'bg-green-100 text-green-700',
    'High Potential': 'bg-blue-100 text-blue-700',
    'High Performer': 'bg-blue-100 text-blue-700',
    'Core Player':    'bg-yellow-100 text-yellow-700',
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
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Database Talent Employee</h1>
            <p className='mt-1 text-sm text-gray-500'>Karyawan terdaftar dalam talent pool berdasarkan asesmen 9-Box</p>
          </div>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setShowModal(true) }}
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
          style={{ background: BRAND }}>
          + Tambah ke Database
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3'>
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 border-t-2 border-red-500'>
          <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Total Talent</div>
          <div className='mt-2 text-3xl font-bold text-gray-900'>{databaseTalent.length}</div>
        </div>
        {[...new Set(databaseTalent.map(d => d.talentBoxLabel).filter(Boolean))].slice(0, 2).map(box => (
          <div key={box} className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 border-t-2 border-blue-500'>
            <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>{box}</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>
              {databaseTalent.filter(d => d.talentBoxLabel === box).length}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-4 flex-wrap'>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className='px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
          <option value='all'>Semua Tahun</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          className='px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
          <option value='all'>Semua Departemen</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr style={{ background: BRAND }}>
                {['No', 'Nama', 'Posisi', 'Departemen', 'Talent Box', 'Tahun', 'Tanggal Masuk', 'Aksi'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} className='px-4 py-10 text-center text-gray-400'>Belum ada data talent.</td></tr>
              )}
              {filtered.map((d, idx) => (
                <tr key={d.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className='px-4 py-3 text-gray-500 text-xs'>{idx + 1}</td>
                  <td className='px-4 py-3 font-semibold text-gray-800'>{d.employeeName}</td>
                  <td className='px-4 py-3 text-gray-700'>{d.position || '—'}</td>
                  <td className='px-4 py-3 text-gray-700'>{d.department || '—'}</td>
                  <td className='px-4 py-3'>
                    {d.talentBoxLabel ? (
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${BOX_COLOR[d.talentBoxLabel] || 'bg-gray-100 text-gray-600'}`}>
                        {d.talentBoxLabel}
                      </span>
                    ) : '—'}
                  </td>
                  <td className='px-4 py-3 text-gray-700'>{d.year}</td>
                  <td className='px-4 py-3 text-gray-500 text-xs'>{d.addedAt}</td>
                  <td className='px-4 py-3'>
                    <button onClick={() => setDelId(d.id)}
                      className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition'>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>Tambah ke Database Talent</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Karyawan <span className='text-red-400'>*</span></label>
                <input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))}
                  placeholder='Nama karyawan…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Posisi</label>
                <input value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  placeholder='Posisi saat ini…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Departemen</label>
                <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  placeholder='Nama departemen…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Talent Box Label</label>
                <select value={form.talentBoxLabel} onChange={e => setForm(f => ({ ...f, talentBoxLabel: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  <option value=''>— Pilih Box —</option>
                  <option value='Star'>Star</option>
                  <option value='High Potential'>High Potential</option>
                  <option value='High Performer'>High Performer</option>
                  <option value='Core Player'>Core Player</option>
                  <option value='Latent Talent'>Latent Talent</option>
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Tahun</label>
                <input type='number' value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleAdd}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                Tambah ke Database
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
            <h3 className='text-base font-bold text-gray-800 mb-2'>Hapus dari Database?</h3>
            <p className='text-sm text-gray-500 mb-5'>Data ini akan dihapus dari database talent.</p>
            <div className='flex gap-3'>
              <button onClick={() => { removeFromTalentDatabase(delId); setDelId(null); flash('Data dihapus.') }}
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
