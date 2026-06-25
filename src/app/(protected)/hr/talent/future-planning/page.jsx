'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'
import { useAuthStore } from '@/store/authStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

function Badge({ children, tone }) {
  const cls = {
    green: 'bg-green-100 text-green-700',
    gray: 'bg-gray-100 text-gray-500',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    yellow: 'bg-yellow-100 text-yellow-700',
  }[tone] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{children}</span>
}

const READINESS_TONE = { High: 'green', Medium: 'yellow', Low: 'red' }

const PLAN_EMPTY = { positionName: '', planYear: new Date().getFullYear() + 1, createdBy: '', notes: '' }
const SUCC_EMPTY = { employeeName: '', readiness: 'Medium', targetDate: '' }

export default function FuturePlanningPage() {
  const { currentUser: user } = useAuthStore()
  const { futurePlanning, addFuturePlan, deleteFuturePlan, addSuccessor, removeSuccessor } = useTalentStore()

  const COD_ROLES = ['COD', 'cod', 'superadmin', 'talent', 'od_manager', 'Talent Management', 'talent_management']
  const isCOD = COD_ROLES.includes(user?.role) || COD_ROLES.includes(user?.position) || user?.roles?.includes('COD') || user?.isCOD

  if (!isCOD) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-64">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-lg font-bold text-gray-800">Akses Terbatas</h2>
        <p className="text-sm text-gray-500 mt-1">Halaman ini hanya dapat diakses oleh Corporate Organization Development</p>
      </div>
    )
  }

  const [filterYear, setFilterYear] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(PLAN_EMPTY)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [succForm, setSuccForm] = useState(SUCC_EMPTY)
  const [showSuccForm, setShowSuccForm] = useState(false)
  const [msg, setMsg] = useState(null)
  const [delId, setDelId] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const getLive = () => selectedPlan ? futurePlanning.find(p => p.id === selectedPlan.id) || null : null
  const livePlan = getLive()

  const years = [...new Set(futurePlanning.map(p => p.planYear))].sort()
  const filtered = filterYear === 'all' ? futurePlanning : futurePlanning.filter(p => String(p.planYear) === filterYear)

  const totalPlans = futurePlanning.length
  const withSuccessors = futurePlanning.filter(p => p.successors.length > 0).length
  const shortReady = futurePlanning.reduce((acc, p) => acc + p.successors.filter(s => s.readiness === 'High').length, 0)

  const handleSave = () => {
    if (!form.positionName.trim()) return flash('Nama posisi wajib diisi.', 'error')
    addFuturePlan({ ...form, planYear: Number(form.planYear) })
    setShowModal(false)
    setForm(PLAN_EMPTY)
    flash('Future plan berhasil dibuat.')
  }

  const handleAddSuccessor = () => {
    if (!livePlan) return
    if (!succForm.employeeName.trim()) return flash('Nama calon wajib diisi.', 'error')
    addSuccessor(livePlan.id, { ...succForm })
    setSuccForm(SUCC_EMPTY)
    setShowSuccForm(false)
    flash('Calon suksesor berhasil ditambahkan.')
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

      {/* Confidential Banner */}
      <div className='mb-5 flex items-center gap-3 bg-red-600 text-white px-5 py-3.5 rounded-xl shadow-sm'>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className='flex-shrink-0'>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <p className='text-sm font-semibold'>Data ini bersifat <strong>RAHASIA</strong>. Hanya untuk Corporate Organization Development.</p>
      </div>

      {/* Header */}
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-start gap-3'>
          <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm' style={{ background: BRAND }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Future Position Planning</h1>
            <p className='mt-1 text-sm text-gray-500'>⚠️ Confidential — Hanya dapat diakses oleh Corporate Organization Development</p>
          </div>
        </div>
        <button onClick={() => { setForm(PLAN_EMPTY); setShowModal(true) }}
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
          style={{ background: BRAND }}>
          + Buat Future Plan
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[
          { label: 'Total Future Plans', value: totalPlans, color: 'text-red-600' },
          { label: 'Posisi dengan Calon', value: withSuccessors, color: 'text-blue-600' },
          { label: 'Short Ready (High)', value: shortReady, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className='bg-white rounded-xl shadow-sm ring-1 ring-gray-100 px-4 py-4'>
            <p className='text-xs text-gray-500 font-medium'>{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Year */}
      <div className='flex gap-2 mb-4 flex-wrap'>
        {[['all', 'Semua Tahun'], ...years.map(y => [String(y), String(y)])].map(([val, label]) => (
          <button key={val} onClick={() => setFilterYear(val)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition
              ${filterYear === val ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}>
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
                {['No', 'Posisi Target', 'Tahun Plan', 'Dibuat Oleh', 'Jumlah Calon', 'Catatan', 'Aksi'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className='px-4 py-10 text-center text-gray-400'>Belum ada data.</td></tr>
              )}
              {filtered.map((plan, idx) => (
                <tr key={plan.id} className={`cursor-pointer hover:bg-red-50/30 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  onClick={() => setSelectedPlan(plan)}>
                  <td className='px-4 py-3 text-gray-500 text-xs'>{idx + 1}</td>
                  <td className='px-4 py-3 font-semibold text-gray-800'>{plan.positionName}</td>
                  <td className='px-4 py-3'>
                    <span className='px-2.5 py-0.5 text-xs font-bold bg-red-50 text-red-700 rounded-full'>{plan.planYear}</span>
                  </td>
                  <td className='px-4 py-3 text-gray-700'>{plan.createdBy}</td>
                  <td className='px-4 py-3'>
                    <span className='font-semibold text-gray-800'>{plan.successors.length}</span>
                    <span className='text-gray-400 text-xs ml-1'>calon</span>
                  </td>
                  <td className='px-4 py-3 text-gray-500 text-xs max-w-xs truncate'>{plan.notes || '—'}</td>
                  <td className='px-4 py-3' onClick={e => e.stopPropagation()}>
                    <button onClick={() => setDelId(plan.id)}
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

      {/* Right Panel */}
      {livePlan && (
        <div className='fixed inset-0 bg-black/30 z-40' onClick={() => setSelectedPlan(null)}>
          <div className='absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden'
            onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex-shrink-0' style={{ background: BRAND }}>
              <div className='flex items-start justify-between'>
                <div>
                  <h2 className='text-base font-bold text-white'>{livePlan.positionName}</h2>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold'>Tahun {livePlan.planYear}</span>
                    <span className='text-xs text-red-100'>Dibuat oleh: {livePlan.createdBy}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedPlan(null)} className='text-white/70 hover:text-white text-2xl font-bold leading-none ml-4'>×</button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-5'>
              {/* Notes */}
              {livePlan.notes && (
                <div className='bg-amber-50 border border-amber-200 rounded-xl p-4'>
                  <p className='text-xs font-bold text-amber-700 mb-1'>Catatan</p>
                  <p className='text-sm text-amber-800'>{livePlan.notes}</p>
                </div>
              )}

              {/* Successors */}
              <div>
                <div className='flex items-center justify-between mb-3'>
                  <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Calon Suksesor ({livePlan.successors.length})</p>
                  {!showSuccForm && (
                    <button onClick={() => setShowSuccForm(true)}
                      className='px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition hover:opacity-90'
                      style={{ background: BRAND }}>
                      + Tambah Calon
                    </button>
                  )}
                </div>

                {showSuccForm && (
                  <div className='bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200 mb-3'>
                    <p className='text-xs font-bold text-gray-700'>Tambah Calon Suksesor</p>
                    <div>
                      <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Karyawan <span className='text-red-400'>*</span></label>
                      <input value={succForm.employeeName} onChange={e => setSuccForm(f => ({ ...f, employeeName: e.target.value }))}
                        placeholder='Nama calon suksesor…'
                        className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Readiness</label>
                        <select value={succForm.readiness} onChange={e => setSuccForm(f => ({ ...f, readiness: e.target.value }))}
                          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                          <option value='High'>High</option>
                          <option value='Medium'>Medium</option>
                          <option value='Low'>Low</option>
                        </select>
                      </div>
                      <div>
                        <label className='block text-xs font-semibold text-gray-600 mb-1'>Target Date</label>
                        <input type='date' value={succForm.targetDate} onChange={e => setSuccForm(f => ({ ...f, targetDate: e.target.value }))}
                          className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button onClick={handleAddSuccessor}
                        className='px-4 py-2 text-sm font-semibold text-white rounded-lg transition hover:opacity-90'
                        style={{ background: BRAND }}>
                        Simpan
                      </button>
                      <button onClick={() => { setShowSuccForm(false); setSuccForm(SUCC_EMPTY) }}
                        className='px-4 py-2 text-sm font-semibold bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition'>
                        Batal
                      </button>
                    </div>
                  </div>
                )}

                {livePlan.successors.length === 0 ? (
                  <div className='text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl'>
                    Belum ada calon suksesor.
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b border-gray-100'>
                          <th className='text-left py-2 px-3 text-xs font-semibold text-gray-500'>Nama</th>
                          <th className='text-left py-2 px-3 text-xs font-semibold text-gray-500'>Readiness</th>
                          <th className='text-left py-2 px-3 text-xs font-semibold text-gray-500'>Target Date</th>
                          <th className='py-2 px-3'></th>
                        </tr>
                      </thead>
                      <tbody>
                        {livePlan.successors.map(sc => (
                          <tr key={sc.employeeId} className='border-b border-gray-50 hover:bg-gray-50'>
                            <td className='py-2.5 px-3 font-semibold text-gray-800'>{sc.employeeName}</td>
                            <td className='py-2.5 px-3'>
                              <Badge tone={READINESS_TONE[sc.readiness]}>{sc.readiness}</Badge>
                            </td>
                            <td className='py-2.5 px-3 text-gray-500 text-xs'>{sc.targetDate || '—'}</td>
                            <td className='py-2.5 px-3'>
                              <button onClick={() => removeSuccessor(livePlan.id, sc.employeeId)}
                                className='text-xs text-red-400 hover:text-red-600 font-semibold'>Hapus</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Confidential marker */}
              <div className='flex items-center gap-2 text-xs text-red-400 bg-red-50 px-3 py-2 rounded-lg'>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Data ini bersifat RAHASIA — hanya untuk Corporate Organization Development
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create Plan */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>Buat Future Plan</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Posisi Target <span className='text-red-400'>*</span></label>
                <input value={form.positionName} onChange={e => setForm(f => ({ ...f, positionName: e.target.value }))}
                  placeholder='Contoh: General Manager Operations…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Tahun Plan</label>
                  <input type='number' value={form.planYear} onChange={e => setForm(f => ({ ...f, planYear: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Dibuat Oleh</label>
                  <input value={form.createdBy} onChange={e => setForm(f => ({ ...f, createdBy: e.target.value }))}
                    placeholder='Nama pembuat…'
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Catatan</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder='Catatan atau konteks untuk plan ini…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>
              <div className='flex items-center gap-2 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg'>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Data akan ditandai sebagai RAHASIA secara otomatis.
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSave}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                Buat Future Plan
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
            <h3 className='text-base font-bold text-gray-800 mb-2'>Hapus Future Plan?</h3>
            <p className='text-sm text-gray-500 mb-5'>Data ini akan dihapus permanen beserta semua calon suksesornya.</p>
            <div className='flex gap-3'>
              <button onClick={() => { deleteFuturePlan(delId); setDelId(null); if (selectedPlan?.id === delId) setSelectedPlan(null); flash('Future plan berhasil dihapus.') }}
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
