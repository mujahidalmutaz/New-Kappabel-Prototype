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
    teal: 'bg-teal-100 text-teal-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  }[tone] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{children}</span>
}

const stepStatusStyle = {
  Completed: 'border-green-400 bg-green-50',
  'In Progress': 'border-yellow-400 bg-yellow-50',
  Planned: 'border-gray-300 bg-white',
}

const STEP_EMPTY = { targetPosition: '', targetPCLevel: '', direction: 'vertical', estimatedYears: '', requirements: '', status: 'Planned', prerequisiteSkills: '', sponsor: '' }
const PATH_EMPTY = { employeeName: '', currentPosition: '', currentPCLevel: '' }

export default function CareerPathPage() {
  const { careerPaths, addCareerPath, deleteCareerPath, addCareerStep, updateCareerStep, deleteCareerStep } = useTalentStore()
  const { employees } = useEmployeeStore()
  const { positions } = useStructureStore()

  const [filterDir, setFilterDir] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(PATH_EMPTY)
  const [selectedPath, setSelectedPath] = useState(null)
  const [stepForm, setStepForm] = useState(STEP_EMPTY)
  const [showStepForm, setShowStepForm] = useState(false)
  const [msg, setMsg] = useState(null)
  const [delId, setDelId] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  // Sync selectedPath with store updates
  const getSelected = () => selectedPath ? careerPaths.find(c => c.id === selectedPath.id) || null : null
  const liveSelected = getSelected()

  const allPaths = careerPaths
  const filtered = filterDir === 'all' ? allPaths : allPaths.filter(cp =>
    cp.steps.some(s => s.direction === filterDir)
  )

  const totalPlans = allPaths.length
  const totalVertical = allPaths.reduce((acc, cp) => acc + cp.steps.filter(s => s.direction === 'vertical').length, 0)
  const totalLateral = allPaths.reduce((acc, cp) => acc + cp.steps.filter(s => s.direction === 'lateral').length, 0)
  const totalCompleted = allPaths.reduce((acc, cp) => acc + cp.steps.filter(s => s.status === 'Completed').length, 0)

  const handleSavePath = () => {
    if (!form.employeeName.trim() || !form.currentPosition.trim()) return flash('Nama dan posisi wajib diisi.', 'error')
    addCareerPath({ ...form, currentPCLevel: Number(form.currentPCLevel) })
    setShowModal(false)
    setForm(PATH_EMPTY)
    flash('Career path berhasil dibuat.')
  }

  const handleAddStep = () => {
    if (!liveSelected) return
    if (!stepForm.targetPosition.trim()) return flash('Target posisi wajib diisi.', 'error')
    addCareerStep(liveSelected.id, { ...stepForm, targetPCLevel: Number(stepForm.targetPCLevel), estimatedYears: Number(stepForm.estimatedYears) })
    setStepForm(STEP_EMPTY)
    setShowStepForm(false)
    flash('Step berhasil ditambahkan.')
  }

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
          <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm' style={{ background: BRAND }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Career Path Management</h1>
            <p className='mt-1 text-sm text-gray-500'>Visualisasi dan perencanaan jalur karir karyawan</p>
          </div>
        </div>
        <button onClick={() => { setForm(PATH_EMPTY); setShowModal(true) }}
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
          style={{ background: BRAND }}>
          + Buat Career Path
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6'>
        {[
          { label: 'Total Career Plans', value: totalPlans, color: 'text-red-600' },
          { label: 'Vertical Moves', value: totalVertical, color: 'text-blue-600' },
          { label: 'Lateral Moves', value: totalLateral, color: 'text-teal-600' },
          { label: 'Completed Steps', value: totalCompleted, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className='bg-white rounded-xl shadow-sm ring-1 ring-gray-100 px-4 py-4'>
            <p className='text-xs text-gray-500 font-medium'>{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className='flex gap-2 mb-4'>
        {[['all', 'Semua'], ['vertical', 'Vertical'], ['lateral', 'Lateral']].map(([val, label]) => (
          <button key={val} onClick={() => setFilterDir(val)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition
              ${filterDir === val ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr style={{ background: BRAND }}>
                {['No', 'Nama Karyawan', 'Posisi Saat Ini', 'PC Level', 'Jumlah Step', 'Progress', 'Aksi'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className='px-4 py-10 text-center text-gray-400'>Belum ada data.</td></tr>
              )}
              {filtered.map((cp, idx) => {
                const done = cp.steps.filter(s => s.status === 'Completed').length
                const total = cp.steps.length
                const pct = total === 0 ? 0 : Math.round((done / total) * 100)
                return (
                  <tr key={cp.id} className={`align-middle cursor-pointer hover:bg-red-50/30 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    onClick={() => setSelectedPath(cp)}>
                    <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{idx + 1}</td>
                    <td className='px-4 py-3 font-semibold text-gray-800 whitespace-nowrap'>{cp.employeeName}</td>
                    <td className='px-4 py-3 text-gray-700 text-sm max-w-[180px] truncate' title={cp.currentPosition}>{cp.currentPosition}</td>
                    <td className='px-4 py-3 text-gray-700 text-xs whitespace-nowrap text-center'>{cp.currentPCLevel}</td>
                    <td className='px-4 py-3 text-gray-700 text-xs whitespace-nowrap'>{total} step</td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <div className='w-20 bg-gray-100 rounded-full h-2 flex-shrink-0'>
                          <div className='bg-green-500 h-2 rounded-full transition-all' style={{ width: `${pct}%` }} />
                        </div>
                        <span className='text-xs text-gray-500 whitespace-nowrap'>{done}/{total}</span>
                      </div>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap' onClick={e => e.stopPropagation()}>
                      <button onClick={() => setDelId(cp.id)}
                        className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition'>
                        Hapus
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Panel */}
      {liveSelected && (
        <div className='fixed inset-0 bg-black/30 z-40' onClick={() => setSelectedPath(null)}>
          <div className='absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden'
            onClick={e => e.stopPropagation()}>
            {/* Panel Header */}
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0' style={{ background: BRAND }}>
              <div>
                <h2 className='text-base font-bold text-white'>{liveSelected.employeeName}</h2>
                <p className='text-xs text-red-100 mt-0.5'>{liveSelected.currentPosition} · PC {liveSelected.currentPCLevel}</p>
              </div>
              <button onClick={() => setSelectedPath(null)} className='text-white/70 hover:text-white text-2xl font-bold leading-none'>×</button>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-6'>
              {/* Career Path Visualization */}
              <div>
                <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-3'>Jalur Karir</p>
                <div className='flex items-start gap-0 overflow-x-auto pb-3'>
                  {/* Current position box */}
                  <div className='flex-shrink-0 flex flex-col items-center'>
                    <div className='w-36 border-2 border-red-400 bg-red-50 rounded-xl p-3 text-center'>
                      <p className='text-xs font-bold text-red-700'>Posisi Saat Ini</p>
                      <p className='text-xs text-gray-700 mt-1 font-semibold leading-tight'>{liveSelected.currentPosition}</p>
                      <p className='text-xs text-red-500 mt-1'>PC {liveSelected.currentPCLevel}</p>
                    </div>
                  </div>
                  {liveSelected.steps.map((step, si) => (
                    <div key={step.id} className='flex items-start flex-shrink-0'>
                      {/* Arrow */}
                      <div className='flex items-center self-center mt-0 px-1'>
                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                          <path d="M0 8 H18 M14 2 L22 8 L14 14" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      {/* Step box */}
                      <div className={`w-36 border-2 rounded-xl p-3 ${stepStatusStyle[step.status] || 'border-gray-300 bg-white'}`}>
                        <div className='flex items-center justify-between mb-1'>
                          <Badge tone={step.direction === 'vertical' ? 'blue' : 'teal'}>
                            {step.direction === 'vertical' ? 'Vertical' : 'Lateral'}
                          </Badge>
                          <button onClick={() => deleteCareerStep(liveSelected.id, step.id)}
                            className='text-gray-300 hover:text-red-400 text-base leading-none font-bold ml-1'>×</button>
                        </div>
                        <p className='text-xs font-semibold text-gray-800 leading-tight mt-1'>{step.targetPosition}</p>
                        <p className='text-xs text-gray-500 mt-0.5'>PC {step.targetPCLevel}</p>
                        <p className='text-xs text-gray-400 mt-0.5'>{step.estimatedYears} thn</p>
                        <div className='mt-1.5'>
                          <Badge tone={step.status === 'Completed' ? 'green' : step.status === 'In Progress' ? 'yellow' : 'gray'}>
                            {step.status}
                          </Badge>
                        </div>
                        {step.requirements && (
                          <p className='text-xs text-gray-400 mt-1 leading-tight line-clamp-2'>{step.requirements}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Step Form */}
              {!showStepForm ? (
                <button onClick={() => setShowStepForm(true)}
                  className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                  style={{ background: BRAND }}>
                  + Tambah Step
                </button>
              ) : (
                <div className='bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200'>
                  <p className='text-xs font-bold text-gray-700'>Tambah Step Baru</p>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='col-span-2'>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>Target Posisi <span className='text-red-400'>*</span></label>
                      <input value={stepForm.targetPosition} onChange={e => setStepForm(f => ({ ...f, targetPosition: e.target.value }))}
                        placeholder='Nama posisi target…'
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>PC Level Target</label>
                      <input type='number' value={stepForm.targetPCLevel} onChange={e => setStepForm(f => ({ ...f, targetPCLevel: e.target.value }))}
                        placeholder='Contoh: 62'
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>Estimasi (tahun)</label>
                      <input type='number' step='0.5' value={stepForm.estimatedYears} onChange={e => setStepForm(f => ({ ...f, estimatedYears: e.target.value }))}
                        placeholder='1.5'
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>Arah</label>
                      <select value={stepForm.direction} onChange={e => setStepForm(f => ({ ...f, direction: e.target.value }))}
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                        <option value='vertical'>Vertical</option>
                        <option value='lateral'>Lateral</option>
                      </select>
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
                      <select value={stepForm.status} onChange={e => setStepForm(f => ({ ...f, status: e.target.value }))}
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                        <option value='Planned'>Planned</option>
                        <option value='In Progress'>In Progress</option>
                        <option value='Completed'>Completed</option>
                      </select>
                    </div>
                    <div className='col-span-2'>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>Requirements</label>
                      <textarea value={stepForm.requirements} onChange={e => setStepForm(f => ({ ...f, requirements: e.target.value }))}
                        rows={2} placeholder='Persyaratan untuk mencapai posisi ini…'
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>Prerequisite Skills</label>
                      <input value={stepForm.prerequisiteSkills} onChange={e => setStepForm(f => ({ ...f, prerequisiteSkills: e.target.value }))}
                        placeholder='Skill yang wajib dimiliki sebelum step ini…'
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                    </div>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>Sponsor</label>
                      <input value={stepForm.sponsor} onChange={e => setStepForm(f => ({ ...f, sponsor: e.target.value }))}
                        placeholder='Nama manager / mentor yang mensupport…'
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button onClick={handleAddStep}
                      className='px-4 py-2 text-sm font-semibold text-white rounded-lg transition hover:opacity-90'
                      style={{ background: BRAND }}>
                      Simpan
                    </button>
                    <button onClick={() => { setShowStepForm(false); setStepForm(STEP_EMPTY) }}
                      className='px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition'>
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Steps List Summary */}
              {liveSelected.steps.length > 0 && (
                <div>
                  <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>Ringkasan Steps</p>
                  <div className='space-y-2'>
                    {liveSelected.steps.map((step, si) => (
                      <div key={step.id} className='flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100'>
                        <span className='text-xs text-gray-400 w-5'>{si + 1}</span>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-semibold text-gray-800 truncate'>{step.targetPosition}</p>
                          <p className='text-xs text-gray-400'>PC {step.targetPCLevel} · {step.estimatedYears} thn</p>
                        </div>
                        <Badge tone={step.direction === 'vertical' ? 'blue' : 'teal'}>
                          {step.direction === 'vertical' ? 'V' : 'L'}
                        </Badge>
                        <Badge tone={step.status === 'Completed' ? 'green' : step.status === 'In Progress' ? 'yellow' : 'gray'}>
                          {step.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Path */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>Buat Career Path</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Karyawan <span className='text-red-400'>*</span></label>
                <select
                  value={employees.find(e => e.name === form.employeeName)?.id || ''}
                  onChange={e => {
                    const emp = employees.find(x => x.id === Number(e.target.value))
                    if (emp) {
                      const pos = positions?.find(p => p.id === emp.positionId)
                      setForm(f => ({
                        ...f,
                        employeeName: emp.name,
                        employeeId: emp.id,
                        currentPosition: pos?.name || f.currentPosition,
                        currentPCLevel: emp.gradeId || f.currentPCLevel,
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
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Posisi Saat Ini <span className='text-red-400'>*</span></label>
                <input value={form.currentPosition} onChange={e => setForm(f => ({ ...f, currentPosition: e.target.value }))}
                  placeholder='Posisi karyawan saat ini…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>PC Level Saat Ini</label>
                <input type='number' value={form.currentPCLevel} onChange={e => setForm(f => ({ ...f, currentPCLevel: e.target.value }))}
                  placeholder='Contoh: 60'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSavePath}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                Buat Career Path
              </button>
              <button onClick={() => setShowModal(false)}
                className='flex-1 py-2.5 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {delId && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50' onClick={() => setDelId(null)}>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-80' onClick={e => e.stopPropagation()}>
            <h3 className='text-base font-bold text-gray-800 mb-2'>Hapus Career Path?</h3>
            <p className='text-sm text-gray-500 mb-5'>Data ini akan dihapus permanen beserta semua stepnya.</p>
            <div className='flex gap-3'>
              <button onClick={() => { const id = delId; setDelId(null); deleteCareerPath(id); if (selectedPath?.id === id) setSelectedPath(null); flash('Career path berhasil dihapus.') }}
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
