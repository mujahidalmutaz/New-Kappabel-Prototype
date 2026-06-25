'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

function RiskBadge({ term }) {
  const cls = {
    Short: 'bg-red-100 text-red-700',
    Mid:   'bg-amber-100 text-amber-700',
    Long:  'bg-green-100 text-green-700',
  }[term] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{term}</span>
}

function HealthBadge({ status }) {
  const cls = {
    Good: 'bg-green-100 text-green-700',
    Fair: 'bg-amber-100 text-amber-700',
    Poor: 'bg-red-100 text-red-700',
  }[status] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{status}</span>
}

const EMPTY_FORM = { gapToRetirement: '', endOfContract: '', careerPlan: '', healthStatus: 'Good', notes: '',
  businessImpactSeverity: 'Medium', mitigationActions: '', knowledgeTransferStatus: 'Not Started' }

export default function VacancyRiskPage() {
  const { keyPositions, vacancyRisks, addVacancyRisk, updateVacancyRisk } = useTalentStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedKP, setSelectedKP] = useState(null)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [msg, setMsg] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const keyOnly = keyPositions.filter(k => k.isKeyPosition)

  const getExisting = (kpId) => vacancyRisks.find(v => v.keyPositionId === kpId)

  const openAssess = (kp) => {
    setSelectedKP(kp)
    const existing = getExisting(kp.id)
    if (existing) {
      setEditId(existing.id)
      setForm({
        gapToRetirement: existing.gapToRetirement,
        endOfContract: existing.endOfContract,
        careerPlan: existing.careerPlan,
        healthStatus: existing.healthStatus,
        notes: existing.notes,
        businessImpactSeverity: existing.businessImpactSeverity || 'Medium',
        mitigationActions: existing.mitigationActions || '',
        knowledgeTransferStatus: existing.knowledgeTransferStatus || 'Not Started',
      })
    } else {
      setEditId(null)
      setForm(EMPTY_FORM)
    }
    setShowModal(true)
  }

  const calcRisk = (gap) => {
    const g = parseFloat(gap) || 0
    return g <= 1 ? 'Short' : g <= 3 ? 'Mid' : 'Long'
  }

  const handleSave = () => {
    if (!form.gapToRetirement) return flash('Gap to retirement wajib diisi.', 'error')
    const payload = {
      keyPositionId: selectedKP.id,
      positionName: selectedKP.positionName,
      employeeId: selectedKP.employeeId,
      employeeName: selectedKP.employeeName,
      ...form,
      gapToRetirement: parseFloat(form.gapToRetirement),
    }
    if (editId) {
      updateVacancyRisk(editId, payload)
      flash('Risk assessment berhasil diperbarui.')
    } else {
      addVacancyRisk(payload)
      flash('Risk assessment berhasil disimpan.')
    }
    setShowModal(false)
  }

  // Stats
  const riskCounts = { Short: 0, Mid: 0, Long: 0 }
  vacancyRisks.forEach(v => { if (riskCounts[v.riskTerm] !== undefined) riskCounts[v.riskTerm]++ })

  return (
    <div>
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold
          ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {msg.text}
        </div>
      )}

      {/* Header */}
      <div className='mb-6 flex items-start gap-3'>
        <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-sm'
          style={{ background: BRAND }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Vacancy Risk Assessment</h1>
          <p className='mt-1 text-sm text-gray-500'>Asesmen risiko kekosongan untuk setiap Key Position</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[
          { label: 'Short Term Risk', count: riskCounts.Short, color: 'red', sub: '0–1 tahun' },
          { label: 'Mid Term Risk',   count: riskCounts.Mid,   color: 'amber', sub: '1–3 tahun' },
          { label: 'Long Term Risk',  count: riskCounts.Long,  color: 'green', sub: '>3 tahun' },
        ].map(({ label, count, color, sub }) => (
          <div key={label} className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 border-t-2
            ${color === 'red' ? 'border-red-500' : color === 'amber' ? 'border-amber-500' : 'border-green-500'}`}>
            <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>{label}</div>
            <div className='mt-2 text-3xl font-bold text-gray-900'>{count}</div>
            <div className='mt-1 text-xs text-gray-400'>{sub}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr style={{ background: BRAND }}>
                {['No', 'Posisi', 'Incumbent', 'Gap Pensiun (thn)', 'Akhir Kontrak', 'Rencana Karir', 'Kesehatan', 'Risk Term', 'Aksi'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keyOnly.length === 0 && (
                <tr><td colSpan={9} className='px-4 py-10 text-center text-gray-400'>Belum ada Key Position. Tambahkan di menu Key Position Assessment.</td></tr>
              )}
              {keyOnly.map((kp, idx) => {
                const risk = getExisting(kp.id)
                return (
                  <tr key={kp.id} className={`align-middle ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{idx + 1}</td>
                    <td className='px-4 py-3 font-semibold text-gray-800 max-w-[180px] truncate' title={kp.positionName}>{kp.positionName}</td>
                    <td className='px-4 py-3 text-gray-700 whitespace-nowrap'>{kp.employeeName}</td>
                    <td className='px-4 py-3 text-gray-700 text-xs whitespace-nowrap'>{risk ? risk.gapToRetirement : '—'}</td>
                    <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{risk ? risk.endOfContract : '—'}</td>
                    <td className='px-4 py-3 text-gray-600 text-xs max-w-[160px]'>
                      <span className='line-clamp-1' title={risk?.careerPlan}>{risk ? risk.careerPlan : '—'}</span>
                    </td>
                    <td className='px-4 py-3'>
                      {risk ? <HealthBadge status={risk.healthStatus} /> : <span className='text-gray-300'>—</span>}
                    </td>
                    <td className='px-4 py-3'>
                      {risk ? <RiskBadge term={risk.riskTerm} /> : <span className='text-gray-300'>—</span>}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <button onClick={() => openAssess(kp)}
                        className='px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                        {risk ? 'Edit Asesmen' : 'Asesmen'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedKP && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100'>
              <h2 className='text-base font-bold text-gray-800'>Vacancy Risk Assessment</h2>
              <p className='text-xs text-gray-500 mt-0.5'>{selectedKP.positionName} — {selectedKP.employeeName}</p>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Gap to Retirement (tahun) <span className='text-red-400'>*</span></label>
                <input type='number' step='0.1' value={form.gapToRetirement}
                  onChange={e => setForm(f => ({ ...f, gapToRetirement: e.target.value }))}
                  placeholder='Contoh: 1.5'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                {form.gapToRetirement && (
                  <p className='text-xs mt-1'>
                    Risk Term: <RiskBadge term={calcRisk(form.gapToRetirement)} />
                    <span className='ml-2 text-gray-400'>(≤1thn=Short, 1-3thn=Mid, &gt;3thn=Long)</span>
                  </p>
                )}
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Akhir Kontrak</label>
                <input type='date' value={form.endOfContract}
                  onChange={e => setForm(f => ({ ...f, endOfContract: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Rencana Karir</label>
                <textarea value={form.careerPlan}
                  onChange={e => setForm(f => ({ ...f, careerPlan: e.target.value }))}
                  rows={2} placeholder='Rencana karir incumbent…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Status Kesehatan</label>
                <select value={form.healthStatus} onChange={e => setForm(f => ({ ...f, healthStatus: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  <option value='Good'>Good</option>
                  <option value='Fair'>Fair</option>
                  <option value='Poor'>Poor</option>
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Tingkat Dampak Bisnis</label>
                <select value={form.businessImpactSeverity} onChange={e => setForm(f => ({ ...f, businessImpactSeverity: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  <option value='Critical'>Critical</option>
                  <option value='High'>High</option>
                  <option value='Medium'>Medium</option>
                  <option value='Low'>Low</option>
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Status Knowledge Transfer</label>
                <select value={form.knowledgeTransferStatus} onChange={e => setForm(f => ({ ...f, knowledgeTransferStatus: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  <option value='Not Started'>Not Started</option>
                  <option value='In Progress'>In Progress</option>
                  <option value='Completed'>Completed</option>
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Mitigation Actions</label>
                <textarea value={form.mitigationActions}
                  onChange={e => setForm(f => ({ ...f, mitigationActions: e.target.value }))}
                  rows={2} placeholder='Langkah mitigasi yang telah atau akan diambil…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Catatan</label>
                <textarea value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder='Catatan tambahan…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSave}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                Simpan Asesmen
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
