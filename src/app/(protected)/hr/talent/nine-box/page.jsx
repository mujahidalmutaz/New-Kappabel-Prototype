'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'
import { useEmployeeStore } from '@/store/employeeStore'
import { useEvaluationStore } from '@/store/evaluationStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

// 9-box matrix config: [row][col] → row 3=High, 1=Low (Y=competency), col 3=High, 1=Low (X=performance)
const BOX_CONFIG = {
  '3-3': { label: 'Star',             color: 'bg-green-500',  text: 'text-white',     border: 'border-green-600' },
  '3-2': { label: 'High Potential',   color: 'bg-blue-400',   text: 'text-white',     border: 'border-blue-500' },
  '3-1': { label: 'Latent Talent',    color: 'bg-teal-400',   text: 'text-white',     border: 'border-teal-500' },
  '2-3': { label: 'High Performer',   color: 'bg-blue-500',   text: 'text-white',     border: 'border-blue-600' },
  '2-2': { label: 'Core Player',      color: 'bg-yellow-400', text: 'text-gray-800',  border: 'border-yellow-500' },
  '2-1': { label: 'Solid Contributor',color: 'bg-amber-300',  text: 'text-gray-800',  border: 'border-amber-400' },
  '1-3': { label: 'Inconsistent',     color: 'bg-orange-400', text: 'text-white',     border: 'border-orange-500' },
  '1-2': { label: 'Under Achiever',   color: 'bg-red-400',    text: 'text-white',     border: 'border-red-500' },
  '1-1': { label: 'Underperformer',   color: 'bg-red-600',    text: 'text-white',     border: 'border-red-700' },
}

const PERF_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High' }
const COMP_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High' }

function calcBox(perf, comp) {
  const col = perf <= 2.5 ? 1 : perf <= 3.5 ? 2 : 3
  const row = comp <= 2.5 ? 1 : comp <= 3.5 ? 2 : 3
  return { col, row }
}

const EMPTY_FORM = { employeeName: '', performanceScore: '', competencyScore: '', notes: '', year: new Date().getFullYear() }

export default function NineBoxPage() {
  const { talentBoxes, addTalentBox, updateTalentBox, deleteTalentBox } = useTalentStore()
  const { employees } = useEmployeeStore()
  const { evaluations } = useEvaluationStore()
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear())
  const [showModal, setShowModal] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selected, setSelected] = useState(null)
  const [msg, setMsg] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const filtered = talentBoxes.filter(t => t.year === yearFilter)

  const getBoxKey = (row, col) => `${row}-${col}`

  const getEmployeesInBox = (row, col) =>
    filtered.filter(t => t.boxRow === row && t.boxCol === col)

  const handleSave = () => {
    if (!form.employeeName || !form.performanceScore || !form.competencyScore) {
      return flash('Nama karyawan, skor performa, dan kompetensi wajib diisi.', 'error')
    }
    const perf = parseFloat(form.performanceScore)
    const comp = parseFloat(form.competencyScore)
    const { col, row } = calcBox(perf, comp)
    const boxKey = getBoxKey(row, col)
    const boxLabel = BOX_CONFIG[boxKey]?.label || 'Core Player'
    const payload = { ...form, performanceScore: perf, competencyScore: comp, boxRow: row, boxCol: col, boxLabel }
    if (editId) {
      updateTalentBox(editId, payload)
      flash('Data talent berhasil diperbarui.')
    } else {
      addTalentBox(payload)
      flash('Karyawan berhasil ditambahkan ke matriks.')
    }
    setShowModal(false)
  }

  const openEdit = (t) => {
    setEditId(t.id)
    setForm({ employeeName: t.employeeName, employeeId: t.employeeId, performanceScore: t.performanceScore, competencyScore: t.competencyScore, notes: t.notes, year: t.year })
    setShowModal(true)
  }

  const years = [...new Set([...talentBoxes.map(t => t.year), new Date().getFullYear()])].sort((a, b) => b - a)

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
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>9-Box Talent Matrix</h1>
            <p className='mt-1 text-sm text-gray-500'>Pemetaan talent berdasarkan performa dan kompetensi</p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <select value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))}
            className='px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setShowImport(true)}
            className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl shadow-sm transition hover:bg-gray-50'>
            ↓ Import dari Evaluasi
          </button>
          <button onClick={() => { setEditId(null); setForm({ ...EMPTY_FORM, year: yearFilter }); setShowModal(true) }}
            className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
            style={{ background: BRAND }}>
            + Tambah Karyawan
          </button>
        </div>
      </div>

      {/* 9-box grid */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6 mb-6'>
        <div className='flex gap-4'>
          {/* Y-axis label */}
          <div className='flex items-center justify-center w-8'>
            <span className='text-xs font-bold text-gray-500 uppercase tracking-wider' style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              Kompetensi (Y)
            </span>
          </div>
          <div className='flex-1'>
            {/* Column labels */}
            <div className='grid grid-cols-3 gap-2 mb-1 pl-10'>
              <div className='text-center text-xs font-semibold text-gray-400'>Low Performance</div>
              <div className='text-center text-xs font-semibold text-gray-400'>Medium Performance</div>
              <div className='text-center text-xs font-semibold text-gray-400'>High Performance</div>
            </div>
            {/* Grid rows (3 to 1, top=High) */}
            {[3, 2, 1].map(row => (
              <div key={row} className='flex gap-2 mb-2'>
                <div className='w-10 flex items-center justify-center text-xs font-semibold text-gray-400 text-right flex-shrink-0'>
                  {COMP_LABELS[row]}
                </div>
                <div className='grid grid-cols-3 gap-2 flex-1'>
                  {[1, 2, 3].map(col => {
                    const key = getBoxKey(row, col)
                    const cfg = BOX_CONFIG[key] || {}
                    const emps = getEmployeesInBox(row, col)
                    return (
                      <div key={col} className={`rounded-xl p-3 min-h-[100px] ${cfg.color} border-2 ${cfg.border}`}>
                        <div className={`text-xs font-bold mb-2 ${cfg.text}`}>{cfg.label}</div>
                        <div className='flex flex-wrap gap-1'>
                          {emps.map(emp => (
                            <button key={emp.id} onClick={() => setSelected(emp)}
                              className='px-2 py-0.5 text-xs bg-white/80 text-gray-800 rounded-full font-semibold hover:bg-white transition shadow-sm'>
                              {emp.employeeName.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {/* X-axis label */}
            <div className='text-center text-xs font-bold text-gray-500 uppercase tracking-wider mt-2'>Performa (X)</div>
          </div>
        </div>
      </div>

      {/* Employee list */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-100'>
          <h2 className='text-sm font-bold text-gray-800'>Daftar Talent {yearFilter}</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr style={{ background: BRAND }}>
                {['No', 'Nama', 'Skor Performa', 'Skor Kompetensi', 'Box', 'Catatan', 'Aksi'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className='px-4 py-10 text-center text-gray-400'>Belum ada data untuk tahun {yearFilter}.</td></tr>
              )}
              {filtered.map((t, idx) => {
                const key = getBoxKey(t.boxRow, t.boxCol)
                const cfg = BOX_CONFIG[key] || {}
                return (
                  <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className='px-4 py-3 text-gray-500 text-xs'>{idx + 1}</td>
                    <td className='px-4 py-3 font-semibold text-gray-800'>{t.employeeName}</td>
                    <td className='px-4 py-3 text-gray-700'>{t.performanceScore}</td>
                    <td className='px-4 py-3 text-gray-700'>{t.competencyScore}</td>
                    <td className='px-4 py-3'>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full text-white ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-gray-500 text-xs max-w-xs'>
                      <span className='line-clamp-1'>{t.notes || '—'}</span>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex gap-2'>
                        <button onClick={() => openEdit(t)}
                          className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>Edit</button>
                        <button onClick={() => { deleteTalentBox(t.id); flash('Data dihapus.') }}
                          className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition'>Hapus</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee profile popup */}
      {selected && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50' onClick={() => setSelected(null)}>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-80' onClick={e => e.stopPropagation()}>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-base font-bold text-gray-800'>{selected.employeeName}</h3>
              <button onClick={() => setSelected(null)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            {(() => {
              const key = getBoxKey(selected.boxRow, selected.boxCol)
              const cfg = BOX_CONFIG[key] || {}
              return (
                <div className='space-y-3'>
                  <div className={`px-3 py-2 rounded-xl text-center font-bold text-sm ${cfg.color} ${cfg.text}`}>{cfg.label}</div>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='bg-gray-50 rounded-xl p-3 text-center'>
                      <div className='text-xs text-gray-400'>Performa</div>
                      <div className='text-2xl font-bold text-gray-800 mt-1'>{selected.performanceScore}</div>
                    </div>
                    <div className='bg-gray-50 rounded-xl p-3 text-center'>
                      <div className='text-xs text-gray-400'>Kompetensi</div>
                      <div className='text-2xl font-bold text-gray-800 mt-1'>{selected.competencyScore}</div>
                    </div>
                  </div>
                  <div className='text-xs text-gray-500'><strong>Tahun:</strong> {selected.year}</div>
                  {selected.notes && <div className='text-xs text-gray-500'><strong>Catatan:</strong> {selected.notes}</div>}
                  <div className='flex gap-2 pt-2'>
                    <button onClick={() => { openEdit(selected); setSelected(null) }}
                      className='flex-1 py-2 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>Edit</button>
                    <button onClick={() => setSelected(null)}
                      className='flex-1 py-2 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition'>Tutup</button>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>{editId ? 'Edit Talent' : 'Tambah Karyawan ke Matrix'}</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Karyawan <span className='text-red-400'>*</span></label>
                <select
                  value={employees.find(e => e.name === form.employeeName)?.id || ''}
                  onChange={e => {
                    const emp = employees.find(x => x.id === Number(e.target.value))
                    if (emp) setForm(f => ({ ...f, employeeName: emp.name, employeeId: emp.id }))
                  }}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  <option value=''>— Pilih Karyawan —</option>
                  {employees.filter(e => e.status === 'Active').map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.nik || ''})</option>
                  ))}
                </select>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Skor Performa (1-5) <span className='text-red-400'>*</span></label>
                  <input type='number' min='1' max='5' step='0.1' value={form.performanceScore}
                    onChange={e => setForm(f => ({ ...f, performanceScore: e.target.value }))}
                    placeholder='Contoh: 4.5' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Skor Kompetensi (1-5) <span className='text-red-400'>*</span></label>
                  <input type='number' min='1' max='5' step='0.1' value={form.competencyScore}
                    onChange={e => setForm(f => ({ ...f, competencyScore: e.target.value }))}
                    placeholder='Contoh: 3.8' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
              </div>
              {form.performanceScore && form.competencyScore && (() => {
                const { col, row } = calcBox(parseFloat(form.performanceScore), parseFloat(form.competencyScore))
                const key = getBoxKey(row, col)
                const cfg = BOX_CONFIG[key] || {}
                return (
                  <div className={`px-3 py-2 rounded-xl text-center font-semibold text-sm ${cfg.color} ${cfg.text}`}>
                    Box: {cfg.label}
                  </div>
                )
              })()}
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Tahun</label>
                <input type='number' value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Catatan</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder='Catatan evaluasi…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSave}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                {editId ? 'Simpan Perubahan' : 'Tambahkan'}
              </button>
              <button onClick={() => setShowModal(false)}
                className='flex-1 py-2.5 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
