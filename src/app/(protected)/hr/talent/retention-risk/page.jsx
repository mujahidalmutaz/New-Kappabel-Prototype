'use client'
import { useState } from 'react'
import Link from 'next/link'
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
    yellow: 'bg-yellow-100 text-yellow-700',
    amber: 'bg-amber-100 text-amber-700',
  }[tone] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{children}</span>
}

const RISK_TONE = { High: 'red', Medium: 'amber', Low: 'green' }
const RISK_FACTORS_LIST = [
  { key: 'retirement', label: '🏖 Gap to Retirement < 1 tahun', factor: 'Gap to Retirement', value: '< 1 tahun', weight: 40, contribution: 40 },
  { key: 'contract', label: '📋 Kontrak habis < 6 bulan', factor: 'Kontrak Habis', value: '< 6 bulan', weight: 30, contribution: 30 },
  { key: 'tenure', label: '⏳ Tenure > 10 tahun tanpa promosi', factor: 'Tenure Tanpa Promosi', value: '> 10 tahun', weight: 20, contribution: 20 },
  { key: 'career', label: '🚪 Career plan: pindah/resign', factor: 'Career Plan Pindah/Resign', value: 'Pindah/resign', weight: 25, contribution: 25 },
]

const RISK_FACTOR_TAGS = {
  'Gap to Retirement': { label: '🏖 Near Retirement', tone: 'red' },
  'Kontrak Habis': { label: '⚠️ Kontrak Habis', tone: 'amber' },
  'Tenure Tanpa Promosi': { label: '⏳ Long Tenure', tone: 'yellow' },
  'Career Plan Pindah/Resign': { label: '🚪 Risk Resign', tone: 'red' },
}

const FLAG_EMPTY = { employeeName: '', position: '', department: '', action: '', selectedFactors: [] }

function RiskScoreBar({ score }) {
  const pct = Math.min(100, Math.max(0, score))
  const color = pct >= 70 ? 'bg-red-500' : pct >= 40 ? 'bg-amber-400' : 'bg-green-500'
  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between'>
        <span className='text-xs text-gray-500'>Risk Score</span>
        <span className='text-lg font-bold text-gray-800'>{score}<span className='text-xs text-gray-400'>/100</span></span>
      </div>
      <div className='w-full bg-gray-100 rounded-full h-3'>
        <div className={`${color} h-3 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <div className='flex justify-between text-xs text-gray-400'>
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  )
}

export default function RetentionRiskPage() {
  const { retentionRisks, addRetentionRisk, deleteRetentionRisk, resolveRetentionRisk, updateRetentionRisk } = useTalentStore()
  const { employees } = useEmployeeStore()
  const { positions, departments } = useStructureStore()

  const [filterLevel, setFilterLevel] = useState('all')
  const [filterResolved, setFilterResolved] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [flagForm, setFlagForm] = useState(FLAG_EMPTY)
  const [selectedRisk, setSelectedRisk] = useState(null)
  const [actionText, setActionText] = useState('')
  const [msg, setMsg] = useState(null)
  const [delId, setDelId] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const getLive = () => selectedRisk ? retentionRisks.find(r => r.id === selectedRisk.id) || null : null
  const liveRisk = getLive()

  const highCount = retentionRisks.filter(r => r.riskLevel === 'High').length
  const medCount = retentionRisks.filter(r => r.riskLevel === 'Medium').length
  const lowCount = retentionRisks.filter(r => r.riskLevel === 'Low').length
  const resolvedCount = retentionRisks.filter(r => r.resolved).length

  const filtered = retentionRisks.filter(r => {
    if (filterLevel !== 'all' && r.riskLevel !== filterLevel) return false
    if (filterResolved === 'yes' && !r.resolved) return false
    if (filterResolved === 'no' && r.resolved) return false
    return true
  })

  const handleSaveFlag = () => {
    if (!flagForm.employeeName.trim()) return flash('Nama karyawan wajib diisi.', 'error')
    const factors = flagForm.selectedFactors.map(key => {
      const f = RISK_FACTORS_LIST.find(rf => rf.key === key)
      return { factor: f.factor, value: f.value, weight: f.weight, contribution: f.contribution }
    })
    const riskScore = Math.min(100, factors.reduce((acc, f) => acc + f.contribution, 0))
    const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low'
    addRetentionRisk({ ...flagForm, factors, riskScore, riskLevel })
    setShowModal(false)
    setFlagForm(FLAG_EMPTY)
    flash('Flag risiko berhasil ditambahkan.')
  }

  const handleResolve = () => {
    if (!liveRisk) return
    resolveRetentionRisk(liveRisk.id, 'HR Manager', actionText || liveRisk.action)
    flash('Risiko berhasil ditandai sebagai resolved.')
  }

  const toggleFactor = (key) => {
    setFlagForm(f => ({
      ...f,
      selectedFactors: f.selectedFactors.includes(key)
        ? f.selectedFactors.filter(k => k !== key)
        : [...f.selectedFactors, key],
    }))
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
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Retention Risk</h1>
            <p className='mt-1 text-sm text-gray-500'>Identifikasi karyawan berisiko resign berdasarkan faktor otomatis</p>
          </div>
        </div>
        <button onClick={() => { setFlagForm(FLAG_EMPTY); setShowModal(true) }}
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
          style={{ background: BRAND }}>
          + Tambah Flag Manual
        </button>
      </div>

      {/* Alert Banner */}
      <div className='mb-5 flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 px-5 py-3.5 rounded-xl'>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className='flex-shrink-0 mt-0.5'>
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className='text-sm'>Sistem secara otomatis menghitung risk score berdasarkan usia, tenure, salary band, dan kontrak.</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5'>
        <div className='bg-red-50 border border-red-200 rounded-xl px-4 py-4'>
          <p className='text-xs text-red-500 font-medium'>High Risk</p>
          <p className='text-3xl font-bold text-red-600 mt-1'>{highCount}</p>
        </div>
        <div className='bg-amber-50 border border-amber-200 rounded-xl px-4 py-4'>
          <p className='text-xs text-amber-600 font-medium'>Medium Risk</p>
          <p className='text-3xl font-bold text-amber-600 mt-1'>{medCount}</p>
        </div>
        <div className='bg-green-50 border border-green-200 rounded-xl px-4 py-4'>
          <p className='text-xs text-green-600 font-medium'>Low Risk</p>
          <p className='text-3xl font-bold text-green-600 mt-1'>{lowCount}</p>
        </div>
        <div className='bg-blue-50 border border-blue-200 rounded-xl px-4 py-4'>
          <p className='text-xs text-blue-600 font-medium'>Sudah Ditangani</p>
          <p className='text-3xl font-bold text-blue-600 mt-1'>{resolvedCount}</p>
        </div>
      </div>

      {/* Risk Factor Legend */}
      <div className='mb-5 bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4'>
        <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-3'>Faktor Risiko & Poin</p>
        <div className='grid grid-cols-2 gap-2'>
          {RISK_FACTORS_LIST.map(f => (
            <div key={f.key} className='flex items-center gap-2 text-xs text-gray-600'>
              <span className='w-8 text-right font-bold text-red-600'>+{f.contribution}</span>
              <span className='text-gray-400'>pts</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-2 mb-4'>
        <div className='flex gap-1.5'>
          {[['all', 'Semua Level'], ['High', 'High'], ['Medium', 'Medium'], ['Low', 'Low']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterLevel(val)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition
                ${filterLevel === val ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className='flex gap-1.5 ml-2'>
          {[['all', 'Semua'], ['no', 'Belum Resolved'], ['yes', 'Resolved']].map(([val, label]) => (
            <button key={val} onClick={() => setFilterResolved(val)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition
                ${filterResolved === val ? 'bg-gray-700 text-white border-gray-700' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr style={{ background: BRAND }}>
                {['No', 'Nama', 'Posisi', 'Dept', 'Risk Score', 'Risk Level', 'Faktor Risiko', 'Action Taken', 'Resolved', 'Aksi'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className='px-4 py-10 text-center text-gray-400'>Belum ada data.</td></tr>
              )}
              {filtered.map((r, idx) => (
                <tr key={r.id} className={`cursor-pointer hover:bg-red-50/30 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                  onClick={() => setSelectedRisk(r)}>
                  <td className='px-4 py-3 text-gray-500 text-xs'>{idx + 1}</td>
                  <td className='px-4 py-3 font-semibold text-gray-800 whitespace-nowrap'>{r.employeeName}</td>
                  <td className='px-4 py-3 text-gray-600 text-xs whitespace-nowrap'>{r.position}</td>
                  <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{r.department}</td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-1.5'>
                      <div className='w-12 bg-gray-100 rounded-full h-1.5'>
                        <div className={`h-1.5 rounded-full ${r.riskScore >= 70 ? 'bg-red-500' : r.riskScore >= 40 ? 'bg-amber-400' : 'bg-green-500'}`}
                          style={{ width: `${r.riskScore}%` }} />
                      </div>
                      <span className='text-xs font-bold text-gray-700'>{r.riskScore}</span>
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <Badge tone={RISK_TONE[r.riskLevel]}>{r.riskLevel}</Badge>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex flex-wrap gap-1'>
                      {r.factors.map((f, fi) => {
                        const tag = RISK_FACTOR_TAGS[f.factor]
                        return tag ? (
                          <span key={fi} className={`px-1.5 py-0.5 text-xs font-medium rounded-md
                            ${tag.tone === 'red' ? 'bg-red-50 text-red-600' : tag.tone === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            {tag.label}
                          </span>
                        ) : null
                      })}
                    </div>
                  </td>
                  <td className='px-4 py-3 text-gray-500 text-xs max-w-xs'>
                    <span className='line-clamp-2'>{r.action || '—'}</span>
                  </td>
                  <td className='px-4 py-3 text-center'>
                    {r.resolved
                      ? <span className='text-green-500 text-base'>✓</span>
                      : <span className='text-gray-300 text-base'>✗</span>
                    }
                  </td>
                  <td className='px-4 py-3' onClick={e => e.stopPropagation()}>
                    <button onClick={() => setDelId(r.id)}
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
      {liveRisk && (
        <div className='fixed inset-0 bg-black/30 z-40' onClick={() => setSelectedRisk(null)}>
          <div className='absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden'
            onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex-shrink-0' style={{ background: BRAND }}>
              <div className='flex items-start justify-between'>
                <div>
                  <h2 className='text-base font-bold text-white'>{liveRisk.employeeName}</h2>
                  <p className='text-xs text-red-100 mt-0.5'>{liveRisk.position} · {liveRisk.department}</p>
                </div>
                <button onClick={() => setSelectedRisk(null)} className='text-white/70 hover:text-white text-2xl font-bold leading-none ml-4'>×</button>
              </div>
            </div>

            <div className='flex-1 overflow-y-auto p-6 space-y-5'>
              {/* Risk Score Gauge */}
              <div className='bg-white border border-gray-100 rounded-xl p-4 shadow-sm'>
                <div className='flex items-center justify-between mb-4'>
                  <RiskScoreBar score={liveRisk.riskScore} />
                  <div className='ml-6 flex-shrink-0'>
                    <Badge tone={RISK_TONE[liveRisk.riskLevel]}>{liveRisk.riskLevel} Risk</Badge>
                  </div>
                </div>
              </div>

              {/* Factor Breakdown */}
              <div>
                <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>Breakdown Faktor Risiko</p>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b border-gray-100'>
                        <th className='text-left py-2 px-3 text-xs font-semibold text-gray-500'>Faktor</th>
                        <th className='text-left py-2 px-3 text-xs font-semibold text-gray-500'>Nilai</th>
                        <th className='text-left py-2 px-3 text-xs font-semibold text-gray-500'>Bobot</th>
                        <th className='text-left py-2 px-3 text-xs font-semibold text-gray-500'>Kontribusi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveRisk.factors.map((f, fi) => (
                        <tr key={fi} className='border-b border-gray-50'>
                          <td className='py-2.5 px-3 font-medium text-gray-700'>{f.factor}</td>
                          <td className='py-2.5 px-3 text-gray-500 text-xs'>{f.value}</td>
                          <td className='py-2.5 px-3 text-gray-500 text-xs'>{f.weight}%</td>
                          <td className='py-2.5 px-3'>
                            <span className='font-bold text-red-600'>+{f.contribution}</span>
                          </td>
                        </tr>
                      ))}
                      <tr className='bg-gray-50'>
                        <td colSpan={3} className='py-2 px-3 text-xs font-bold text-gray-600'>Total Score</td>
                        <td className='py-2 px-3 font-bold text-gray-800'>{liveRisk.riskScore}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Plan */}
              <div>
                <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-2'>Action Plan</p>
                <textarea
                  value={actionText || liveRisk.action || ''}
                  onChange={e => setActionText(e.target.value)}
                  rows={3}
                  placeholder='Tulis rencana tindakan untuk mengurangi risiko ini…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none'
                />
                {liveRisk.actionBy && (
                  <p className='text-xs text-gray-400 mt-1'>Action oleh: <strong>{liveRisk.actionBy}</strong></p>
                )}
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Tindak Lanjut Cepat</div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/hr/employee/personnel-action?employee=${encodeURIComponent(liveRisk.employeeName)}&action=Salary Change`}
                      className="text-xs border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 flex items-center gap-1">
                      💰 Salary Review
                    </Link>
                    <Link href={`/hr/employee/personnel-action?employee=${encodeURIComponent(liveRisk.employeeName)}&action=Data Change`}
                      className="text-xs border border-green-200 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 flex items-center gap-1">
                      📋 Perpanjang Kontrak
                    </Link>
                    <Link href={`/hr/talent/career-path`}
                      className="text-xs border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-50 flex items-center gap-1">
                      🗺️ Career Discussion
                    </Link>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className='space-y-2'>
                {liveRisk.resolved ? (
                  <div className='flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-semibold'>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Risiko sudah ditangani
                  </div>
                ) : (
                  <button onClick={handleResolve}
                    className='w-full py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                    style={{ background: BRAND }}>
                    Tandai Resolved
                  </button>
                )}
                <button onClick={() => {
                  if (actionText) updateRetentionRisk(liveRisk.id, { action: actionText })
                  flash('Action plan disimpan.')
                }}
                  className='w-full py-2.5 text-sm font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition'>
                  Simpan Action Plan
                </button>
              </div>

              {/* Flag Info */}
              <div className='text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 space-y-0.5'>
                <p>Diflag pada: <strong>{liveRisk.flaggedAt}</strong></p>
                {liveRisk.actionBy && <p>Ditangani oleh: <strong>{liveRisk.actionBy}</strong></p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Flag */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>Tambah Flag Manual</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div className='grid grid-cols-2 gap-3'>
                <div className='col-span-2'>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Karyawan <span className='text-red-400'>*</span></label>
                  <select
                    value={employees.find(e => e.name === flagForm.employeeName)?.id || ''}
                    onChange={e => {
                      const emp = employees.find(x => x.id === Number(e.target.value))
                      if (emp) {
                        const pos = positions?.find(p => p.id === emp.positionId)
                        const dept = departments?.find(d => d.id === emp.departmentId)
                        setFlagForm(f => ({
                          ...f,
                          employeeName: emp.name,
                          employeeId: emp.id,
                          position: pos?.name || f.position,
                          department: dept?.name || f.department,
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
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Posisi</label>
                  <input value={flagForm.position} onChange={e => setFlagForm(f => ({ ...f, position: e.target.value }))}
                    placeholder='Jabatan…'
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Departemen</label>
                  <input value={flagForm.department} onChange={e => setFlagForm(f => ({ ...f, department: e.target.value }))}
                    placeholder='Departemen…'
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-2'>Faktor Risiko <span className='text-gray-400'>(pilih yang berlaku)</span></label>
                <div className='space-y-2'>
                  {RISK_FACTORS_LIST.map(f => (
                    <label key={f.key} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition
                      ${flagForm.selectedFactors.includes(f.key) ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-red-200'}`}>
                      <input type='checkbox' checked={flagForm.selectedFactors.includes(f.key)} onChange={() => toggleFactor(f.key)}
                        className='mt-0.5 accent-red-600' />
                      <div className='flex-1'>
                        <span className='text-sm text-gray-700'>{f.label}</span>
                        <span className='ml-2 text-xs font-bold text-red-500'>+{f.contribution} pts</span>
                      </div>
                    </label>
                  ))}
                </div>
                {flagForm.selectedFactors.length > 0 && (
                  <div className='mt-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg'>
                    Estimasi Risk Score: <strong className='text-red-600'>
                      {Math.min(100, flagForm.selectedFactors.reduce((acc, key) => {
                        const f = RISK_FACTORS_LIST.find(rf => rf.key === key)
                        return acc + (f ? f.contribution : 0)
                      }, 0))}
                    </strong> / 100
                  </div>
                )}
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Action / Catatan</label>
                <textarea value={flagForm.action} onChange={e => setFlagForm(f => ({ ...f, action: e.target.value }))}
                  rows={3} placeholder='Rencana tindakan atau catatan awal…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSaveFlag}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                Tambah Flag
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
            <h3 className='text-base font-bold text-gray-800 mb-2'>Hapus Retention Risk Flag?</h3>
            <p className='text-sm text-gray-500 mb-5'>Data ini akan dihapus permanen.</p>
            <div className='flex gap-3'>
              <button onClick={() => { deleteRetentionRisk(delId); setDelId(null); if (selectedRisk?.id === delId) setSelectedRisk(null); flash('Flag berhasil dihapus.') }}
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
