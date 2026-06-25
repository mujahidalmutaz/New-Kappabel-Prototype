'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'
import { useEmployeeStore } from '@/store/employeeStore'
import { useStructureStore } from '@/store/structureStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

function Badge({ children, tone }) {
  const cls = {
    green: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-500',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
  }[tone] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{children}</span>
}

const EMPTY = {
  positionName: '', employeeName: '', pcLevel: '', q1: false, q2: false, q3: false,
  criticalityScore: '', businessImpact: '', estimatedVacancyDate: '', requiredSuccessors: '',
  department: '', incumbentExitDate: '', knowledgeTransferPlan: '', interimCoverage: '',
}

export default function KeyPositionPage() {
  const { keyPositions, addKeyPosition, updateKeyPosition, deleteKeyPosition } = useTalentStore()
  const { employees } = useEmployeeStore()
  const { positions } = useStructureStore()
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [delId, setDelId] = useState(null)
  const [msg, setMsg] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const openNew = () => {
    setEditId(null); setForm(EMPTY); setShowModal(true)
  }

  const openEdit = (kp) => {
    setEditId(kp.id)
    setForm({
      positionName: kp.positionName,
      employeeName: kp.employeeName,
      pcLevel: kp.pcLevel,
      q1: kp.q1,
      q2: kp.q2,
      q3: kp.q3,
      criticalityScore: kp.criticalityScore || '',
      businessImpact: kp.businessImpact || '',
      estimatedVacancyDate: kp.estimatedVacancyDate || '',
      requiredSuccessors: kp.requiredSuccessors || '',
      department: kp.department || '',
      incumbentExitDate: kp.incumbentExitDate || '',
      knowledgeTransferPlan: kp.knowledgeTransferPlan || '',
      interimCoverage: kp.interimCoverage || '',
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.positionName.trim() || !form.employeeName.trim()) {
      return flash('Nama posisi dan karyawan wajib diisi.', 'error')
    }
    if (editId) {
      updateKeyPosition(editId, { ...form, pcLevel: Number(form.pcLevel) })
      flash('Key position berhasil diperbarui.')
    } else {
      addKeyPosition({ ...form, pcLevel: Number(form.pcLevel) })
      flash('Key position berhasil ditambahkan.')
    }
    setShowModal(false)
  }

  const filtered = filter === 'all' ? keyPositions
    : keyPositions.filter(k => k.status === filter)

  const assessedBy = (pcLevel) => Number(pcLevel) >= 64 ? 'Corporate Organization Development' : 'HR PT'
  const isKey = (f) => f.q1 || f.q2 || f.q3

  return (
    <div>
      {/* Toast */}
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold
          ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {msg.type === 'error' ? '⚠' : '✓'} {msg.text}
        </div>
      )}

      {/* Header */}
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-start gap-3'>
          <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-sm'
            style={{ background: BRAND }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Key Position Assessment</h1>
            <p className='mt-1 text-sm text-gray-500'>Identifikasi dan kelola posisi kunci berdasarkan asesmen PC Level</p>
          </div>
        </div>
        <button onClick={openNew}
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
          style={{ background: BRAND }}>
          + Tambah Posisi
        </button>
      </div>

      {/* Filter */}
      <div className='flex gap-2 mb-4'>
        {['all', 'Key Position', 'General'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition
              ${filter === f ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}>
            {f === 'all' ? 'Semua' : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr style={{ background: BRAND }}>
                {['No', 'Nama Posisi', 'PC Level', 'Incumbent', 'Dinilai Oleh', 'Criticality', 'Est. Vacancy', 'Succ. Req.', 'Status', 'Aksi'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className='px-4 py-10 text-center text-gray-400'>Belum ada data.</td></tr>
              )}
              {filtered.map((kp, idx) => (
                <tr key={kp.id} className={`align-middle ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{idx + 1}</td>
                  <td className='px-4 py-3 max-w-[200px]'>
                    <div className='font-semibold text-gray-800 truncate' title={kp.positionName}>{kp.positionName}</div>
                    {kp.businessImpact && <div className='text-xs text-gray-400 mt-0.5 truncate' title={kp.businessImpact}>{kp.businessImpact}</div>}
                  </td>
                  <td className='px-4 py-3 text-gray-700 text-xs whitespace-nowrap'>{kp.pcLevel}</td>
                  <td className='px-4 py-3 text-gray-700 text-sm whitespace-nowrap'>{kp.employeeName}</td>
                  <td className='px-4 py-3'>
                    <Badge tone={kp.assessedBy === 'Corporate Organization Development' ? 'blue' : 'gray'}>
                      <span className='whitespace-nowrap'>{kp.assessedBy === 'Corporate Organization Development' ? 'COD' : 'HR PT'}</span>
                    </Badge>
                  </td>
                  <td className='px-4 py-3'>
                    {kp.criticalityScore ? (
                      <div className='flex gap-0.5 items-center'>
                        {[1,2,3,4,5].map(n => (
                          <div key={n} className={`w-2.5 h-2.5 rounded-sm flex-shrink-0 ${n <= kp.criticalityScore ? 'bg-red-500' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                    ) : <span className='text-gray-400'>—</span>}
                  </td>
                  <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{kp.estimatedVacancyDate || '—'}</td>
                  <td className='px-4 py-3 text-center text-gray-700 text-xs whitespace-nowrap'>{kp.requiredSuccessors ?? '—'}</td>
                  <td className='px-4 py-3'>
                    <Badge tone={kp.isKeyPosition ? 'green' : 'gray'}><span className='whitespace-nowrap'>{kp.status}</span></Badge>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2 whitespace-nowrap'>
                      <button onClick={() => openEdit(kp)}
                        className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                        Edit
                      </button>
                      <button onClick={() => setDelId(kp.id)}
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

      {/* Modal Add/Edit */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>{editId ? 'Edit Key Position' : 'Tambah Key Position'}</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Posisi <span className='text-red-400'>*</span></label>
                <select
                  value={positions?.find(p => p.name === form.positionName)?.id || ''}
                  onChange={e => {
                    const pos = positions?.find(p => p.id === Number(e.target.value))
                    if (pos) {
                      setForm(f => ({
                        ...f,
                        positionName: pos.name,
                        positionId: pos.id,
                        pcLevel: f.pcLevel || pos.gradeId || '',
                      }))
                    } else {
                      setForm(f => ({ ...f, positionName: '', positionId: null }))
                    }
                  }}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  <option value=''>— Pilih Posisi —</option>
                  {positions?.filter(p => p.status === 'Active').sort((a, b) => a.name.localeCompare(b.name)).map(p => (
                    <option key={p.id} value={p.id}>{p.name} {p.gradeId ? `(PC ${p.gradeId})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Incumbent <span className='text-red-400'>*</span></label>
                <select
                  value={employees.filter(e => e.status === 'Active').find(e => e.name === form.employeeName)?.id || ''}
                  onChange={e => {
                    const emp = employees.find(x => x.id === Number(e.target.value))
                    if (emp) {
                      const pos = positions?.find(p => p.id === emp.positionId)
                      setForm(f => ({
                        ...f,
                        employeeName: emp.name,
                        employeeId: emp.id,
                        positionName: f.positionName || pos?.name || '',
                        pcLevel: f.pcLevel || pos?.gradeId || '',
                      }))
                    }
                  }}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  <option value=''>— Pilih Karyawan —</option>
                  {employees.filter(e => e.status === 'Active').map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.nik || ''})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>PC Level <span className='text-red-400'>*</span></label>
                <input type='number' value={form.pcLevel} onChange={e => setForm(f => ({ ...f, pcLevel: e.target.value }))}
                  placeholder='Contoh: 65'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                {form.pcLevel && (
                  <p className='text-xs text-gray-400 mt-1'>
                    Dinilai oleh: <strong>{assessedBy(form.pcLevel)}</strong>
                    {Number(form.pcLevel) >= 64 ? ' (PC ≥ 64 → Corporate Organization Development)' : ' (PC 53-63 → HR PT)'}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Departemen / Divisi</label>
                <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  placeholder='Contoh: Finance, Operations…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Criticality Score (1-5)</label>
                  <div className='flex gap-2 pt-1'>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type='button' onClick={() => setForm(f => ({ ...f, criticalityScore: n }))}
                        className={`w-8 h-8 rounded-lg text-xs font-bold border transition
                          ${form.criticalityScore >= n ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-400 border-gray-200 hover:border-red-300'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Required Successors</label>
                  <input type='number' min='0' value={form.requiredSuccessors}
                    onChange={e => setForm(f => ({ ...f, requiredSuccessors: Number(e.target.value) }))}
                    placeholder='Jumlah suksesor…'
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div className='col-span-2'>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Business Impact</label>
                  <input value={form.businessImpact} onChange={e => setForm(f => ({ ...f, businessImpact: e.target.value }))}
                    placeholder='Dampak bisnis jika posisi kosong…'
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Estimated Vacancy Date</label>
                  <input type='date' value={form.estimatedVacancyDate} onChange={e => setForm(f => ({ ...f, estimatedVacancyDate: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Incumbent Exit Date</label>
                  <input type='date' value={form.incumbentExitDate} onChange={e => setForm(f => ({ ...f, incumbentExitDate: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div className='col-span-2'>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Interim / Backup Coverage</label>
                  <input value={form.interimCoverage} onChange={e => setForm(f => ({ ...f, interimCoverage: e.target.value }))}
                    placeholder='Nama PIC interim jika posisi kosong…'
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div className='col-span-2'>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Knowledge Transfer Plan</label>
                  <textarea value={form.knowledgeTransferPlan} onChange={e => setForm(f => ({ ...f, knowledgeTransferPlan: e.target.value }))}
                    rows={2} placeholder='Rencana transfer knowledge dari incumbent…'
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
                </div>
              </div>

              <div className='bg-red-50/60 rounded-xl p-4 space-y-3'>
                <p className='text-xs font-bold text-gray-700 mb-2'>Kriteria Key Position (jawab Ya/Tidak)</p>
                {[
                  { key: 'q1', label: 'Apakah posisi memiliki dampak dan kontribusi besar terhadap bisnis dan operasional perusahaan?' },
                  { key: 'q2', label: 'Apakah posisi tersebut merupakan posisi kepemimpinan yang memiliki tugas mengelola SDM secara struktural?' },
                  { key: 'q3', label: 'Apakah kekosongan pada posisi tersebut akan berdampak pada resiko tinggi secara strategis dan/atau operasional bagi perusahaan?' },
                ].map(({ key, label }) => (
                  <div key={key} className='flex items-start gap-3'>
                    <div className='flex gap-2 flex-shrink-0 pt-0.5'>
                      <button type='button' onClick={() => setForm(f => ({ ...f, [key]: true }))}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition
                          ${form[key] === true ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}>
                        Ya
                      </button>
                      <button type='button' onClick={() => setForm(f => ({ ...f, [key]: false }))}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition
                          ${form[key] === false ? 'bg-gray-500 text-white border-gray-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                        Tidak
                      </button>
                    </div>
                    <p className='text-xs text-gray-600 leading-relaxed'>{label}</p>
                  </div>
                ))}

                <div className='pt-2 border-t border-red-100'>
                  <p className='text-xs text-gray-500'>Hasil asesmen:</p>
                  <div className='mt-1'>
                    {isKey(form)
                      ? <Badge tone='green'>Key Position</Badge>
                      : <Badge tone='gray'>General</Badge>
                    }
                  </div>
                  {isKey(form) && (
                    <p className='text-xs text-green-700 mt-1'>Minimal 1 pertanyaan dijawab Ya → Key Position</p>
                  )}
                </div>
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSave}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                {editId ? 'Simpan Perubahan' : 'Tambah Posisi'}
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
            <h3 className='text-base font-bold text-gray-800 mb-2'>Hapus Key Position?</h3>
            <p className='text-sm text-gray-500 mb-5'>Data ini akan dihapus permanen.</p>
            <div className='flex gap-3'>
              <button onClick={() => { deleteKeyPosition(delId); setDelId(null); flash('Data berhasil dihapus.') }}
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
