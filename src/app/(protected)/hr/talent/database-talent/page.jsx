'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'
import { exportCsv } from '@/utils/exportCsv'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

const EMPTY_FORM = {
  employeeName: '', position: '', department: '', talentBoxLabel: '', year: new Date().getFullYear(),
  readinessLevel: '', flightRisk: '', lastAssessmentDate: '', skills: '',
}

const READINESS_OPTS = ['Ready Now', '1-2 Year', '3-5 Year', 'Not Ready']
const FLIGHT_RISK_OPTS = ['Low', 'Medium', 'High']

const READINESS_COLOR = {
  'Ready Now': 'bg-green-100 text-green-700',
  '1-2 Year':  'bg-blue-100 text-blue-700',
  '3-5 Year':  'bg-yellow-100 text-yellow-700',
  'Not Ready': 'bg-gray-100 text-gray-500',
}
const FLIGHT_RISK_COLOR = {
  'Low':    'bg-green-100 text-green-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'High':   'bg-red-100 text-red-700',
}
const BOX_COLOR = {
  'Star':           'bg-green-100 text-green-700',
  'High Potential': 'bg-blue-100 text-blue-700',
  'High Performer': 'bg-blue-100 text-blue-700',
  'Core Player':    'bg-yellow-100 text-yellow-700',
}

export default function DatabaseTalentPage() {
  const { databaseTalent, addToTalentDatabase, removeFromTalentDatabase, updateTalentDatabase } = useTalentStore()
  const [filterYear, setFilterYear] = useState('all')
  const [filterDept, setFilterDept] = useState('all')
  const [filterReadiness, setFilterReadiness] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [delId, setDelId] = useState(null)
  const [msg, setMsg] = useState(null)
  const [selected, setSelected] = useState(new Set())

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const years = [...new Set(databaseTalent.map(d => d.year))].sort((a, b) => b - a)
  const departments = [...new Set(databaseTalent.map(d => d.department).filter(Boolean))]

  const filtered = databaseTalent.filter(d => {
    if (filterYear !== 'all' && String(d.year) !== String(filterYear)) return false
    if (filterDept !== 'all' && d.department !== filterDept) return false
    if (filterReadiness !== 'all' && d.readinessLevel !== filterReadiness) return false
    if (search && !d.employeeName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const openNew = () => { setEditId(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (d) => {
    setEditId(d.id)
    setForm({ employeeName: d.employeeName, position: d.position || '', department: d.department || '',
      talentBoxLabel: d.talentBoxLabel || '', year: d.year, readinessLevel: d.readinessLevel || '',
      flightRisk: d.flightRisk || '', lastAssessmentDate: d.lastAssessmentDate || '', skills: d.skills || '' })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.employeeName.trim()) return flash('Nama karyawan wajib diisi.', 'error')
    if (editId) {
      if (updateTalentDatabase) updateTalentDatabase(editId, form)
      flash('Data talent berhasil diperbarui.')
    } else {
      addToTalentDatabase(form)
      flash('Karyawan berhasil ditambahkan ke Database Talent.')
    }
    setShowModal(false)
  }

  const toggleSelect = (id) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const toggleAll = () => {
    setSelected(s => s.size === filtered.length ? new Set() : new Set(filtered.map(d => d.id)))
  }
  const bulkDelete = () => {
    selected.forEach(id => removeFromTalentDatabase(id))
    setSelected(new Set())
    flash(`${selected.size} data dihapus.`)
  }

  const handleExport = () => {
    const headers = ['No','Nama','Posisi','Departemen','Talent Box','Readiness','Flight Risk','Last Assessment','Skills','Tahun']
    const rows = filtered.map((d, i) => [
      i+1, d.employeeName, d.position||'', d.department||'', d.talentBoxLabel||'',
      d.readinessLevel||'', d.flightRisk||'', d.lastAssessmentDate||'', d.skills||'', d.year
    ])
    exportCsv('database-talent', headers, rows)
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
          <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm' style={{ background: BRAND }}>
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
        <div className='flex gap-2 flex-wrap'>
          <button onClick={handleExport}
            className='flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition'>
            ↓ CSV
          </button>
          <button onClick={openNew}
            className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
            style={{ background: BRAND }}>
            + Tambah ke Database
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4'>
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 border-t-2 border-red-500'>
          <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Total Talent</div>
          <div className='mt-2 text-3xl font-bold text-gray-900'>{databaseTalent.length}</div>
        </div>
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 border-t-2 border-green-500'>
          <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Ready Now</div>
          <div className='mt-2 text-3xl font-bold text-green-600'>{databaseTalent.filter(d => d.readinessLevel === 'Ready Now').length}</div>
        </div>
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 border-t-2 border-red-500'>
          <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>Flight Risk High</div>
          <div className='mt-2 text-3xl font-bold text-red-600'>{databaseTalent.filter(d => d.flightRisk === 'High').length}</div>
        </div>
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 border-t-2 border-blue-500'>
          <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>In Pool</div>
          <div className='mt-2 text-3xl font-bold text-blue-600'>{databaseTalent.filter(d => d.inTalentPool).length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-4 flex-wrap items-center'>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Cari nama…'
          className='px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white w-40' />
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
        <select value={filterReadiness} onChange={e => setFilterReadiness(e.target.value)}
          className='px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
          <option value='all'>Semua Readiness</option>
          {READINESS_OPTS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {selected.size > 0 && (
          <button onClick={bulkDelete}
            className='px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition'>
            Hapus {selected.size} terpilih
          </button>
        )}
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr style={{ background: BRAND }}>
                <th className='px-4 py-3'>
                  <input type='checkbox' checked={filtered.length > 0 && selected.size === filtered.length}
                    onChange={toggleAll} className='rounded' />
                </th>
                {['No','Nama','Posisi','Dept','Talent Box','Readiness','Flight Risk','Last Assessment','Skills','Tahun','Aksi'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={12} className='px-4 py-10 text-center text-gray-400'>Belum ada data talent.</td></tr>
              )}
              {filtered.map((d, idx) => (
                <tr key={d.id} className={`align-middle ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${selected.has(d.id) ? 'ring-1 ring-inset ring-red-200 bg-red-50/20' : ''}`}>
                  <td className='px-4 py-3'>
                    <input type='checkbox' checked={selected.has(d.id)} onChange={() => toggleSelect(d.id)} className='rounded' />
                  </td>
                  <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{idx + 1}</td>
                  <td className='px-4 py-3 font-semibold text-gray-800 whitespace-nowrap'>{d.employeeName}</td>
                  <td className='px-4 py-3 text-gray-600 text-xs max-w-[140px] truncate' title={d.position}>{d.position || '—'}</td>
                  <td className='px-4 py-3 text-gray-600 text-xs whitespace-nowrap'>{d.department || '—'}</td>
                  <td className='px-4 py-3'>
                    {d.talentBoxLabel ? (
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${BOX_COLOR[d.talentBoxLabel] || 'bg-gray-100 text-gray-600'}`}>
                        {d.talentBoxLabel}
                      </span>
                    ) : <span className='text-gray-400'>—</span>}
                  </td>
                  <td className='px-4 py-3'>
                    {d.readinessLevel ? (
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${READINESS_COLOR[d.readinessLevel] || 'bg-gray-100 text-gray-500'}`}>
                        {d.readinessLevel}
                      </span>
                    ) : <span className='text-gray-400'>—</span>}
                  </td>
                  <td className='px-4 py-3'>
                    {d.flightRisk ? (
                      <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${FLIGHT_RISK_COLOR[d.flightRisk] || 'bg-gray-100 text-gray-500'}`}>
                        {d.flightRisk}
                      </span>
                    ) : <span className='text-gray-400'>—</span>}
                  </td>
                  <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{d.lastAssessmentDate || '—'}</td>
                  <td className='px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate' title={d.skills}>{d.skills || '—'}</td>
                  <td className='px-4 py-3 text-gray-700 text-xs whitespace-nowrap'>{d.year}</td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-1.5 whitespace-nowrap'>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>{editId ? 'Edit Data Talent' : 'Tambah ke Database Talent'}</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='col-span-2'>
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
                    placeholder='Departemen…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Talent Box Label</label>
                  <select value={form.talentBoxLabel} onChange={e => setForm(f => ({ ...f, talentBoxLabel: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                    <option value=''>— Pilih Box —</option>
                    {['Star','High Potential','High Performer','Core Player','Latent Talent'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Tahun</label>
                  <input type='number' value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Readiness Level</label>
                  <select value={form.readinessLevel} onChange={e => setForm(f => ({ ...f, readinessLevel: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                    <option value=''>— Pilih —</option>
                    {READINESS_OPTS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Flight Risk</label>
                  <select value={form.flightRisk} onChange={e => setForm(f => ({ ...f, flightRisk: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                    <option value=''>— Pilih —</option>
                    {FLIGHT_RISK_OPTS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Last Assessment Date</label>
                  <input type='date' value={form.lastAssessmentDate} onChange={e => setForm(f => ({ ...f, lastAssessmentDate: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div className='col-span-2'>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Skills (pisahkan dengan koma)</label>
                  <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                    placeholder='Leadership, Communication, Data Analysis…'
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSave}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                {editId ? 'Simpan Perubahan' : 'Tambah ke Database'}
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
