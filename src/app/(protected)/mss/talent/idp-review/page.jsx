'use client'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useTalentStore } from '@/store/talentStore'
import { useEmployeeStore } from '@/store/employeeStore'

const statusBadge = (s) => ({
  Draft: 'bg-gray-100 text-gray-600',
  Submitted: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
}[s] || 'bg-gray-100 text-gray-600')

const condBadge = (gap) => {
  if (gap < 0) return { label: '🔴 Butuh Dev', cls: 'bg-red-50 text-red-700' }
  if (gap === 0) return { label: '🟢 Sesuai', cls: 'bg-green-50 text-green-700' }
  return { label: '🔵 Di Atas Target', cls: 'bg-blue-50 text-blue-700' }
}

export default function IDPReview() {
  const { user } = useAuthStore()
  const { idpList, updateIdp, approveIdp } = useTalentStore()
  const [selectedIdp, setSelectedIdp] = useState(null)
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterYear, setFilterYear] = useState('All')

  const submittedIdps = idpList.filter(i => i.status !== 'Draft')

  const filtered = submittedIdps.filter(i =>
    (filterStatus === 'All' || i.status === filterStatus) &&
    (filterYear === 'All' || String(i.year) === filterYear)
  )

  const years = [...new Set(idpList.map(i => String(i.year)))].sort().reverse()

  function handleApprove(idpId) {
    if (typeof approveIdp === 'function') {
      approveIdp(idpId, user?.name || 'Manager')
    } else {
      const idp = idpList.find(i => i.id === idpId)
      if (idp) updateIdp(idpId, { ...idp, status: 'Approved', managerApproval: user?.name || 'Manager', approvedAt: new Date().toISOString() })
    }
    setSelectedIdp(prev => prev ? { ...prev, status: 'Approved', managerApproval: user?.name || 'Manager' } : null)
  }

  function handleRevise(idpId) {
    const idp = idpList.find(i => i.id === idpId)
    if (idp) updateIdp(idpId, { ...idp, status: 'Draft' })
    setSelectedIdp(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">IDP Review — Tim Saya</h1>
        <p className="text-sm text-gray-500 mt-1">Tinjau dan setujui Individual Development Plan anggota tim</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Menunggu Review', val: submittedIdps.filter(i => i.status === 'Submitted').length, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Sudah Disetujui', val: submittedIdps.filter(i => i.status === 'Approved').length, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Total Submitted', val: submittedIdps.length, color: 'bg-blue-50 border-blue-200 text-blue-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="text-2xl font-bold">{s.val}</div>
            <div className="text-sm font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="All">Semua Status</option>
          <option value="Submitted">Menunggu Review</option>
          <option value="Approved">Sudah Disetujui</option>
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="All">Semua Tahun</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['No','Nama Karyawan','Tahun','Jumlah Item','Status','Aksi'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Tidak ada IDP yang perlu direview</td></tr>
            ) : filtered.map((idp, idx) => (
              <tr key={idp.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{idp.employeeName}</td>
                <td className="px-4 py-3 text-gray-600">{idp.year}</td>
                <td className="px-4 py-3 text-gray-600">{idp.items?.length || 0} item</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(idp.status)}`}>{idp.status}</span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setSelectedIdp(idp)}
                    className="text-red-600 text-xs font-medium hover:text-red-800">
                    Lihat Detail →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Panel */}
      {selectedIdp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-3xl h-full overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">IDP Review — {selectedIdp.employeeName}</h2>
                <p className="text-sm text-gray-500">Tahun {selectedIdp.year}</p>
              </div>
              <button onClick={() => setSelectedIdp(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(selectedIdp.status)}`}>{selectedIdp.status}</span>
                {selectedIdp.managerApproval && (
                  <span className="text-sm text-gray-500">Disetujui oleh <span className="font-medium text-gray-700">{selectedIdp.managerApproval}</span></span>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Jenis','Nama Kompetensi','Target','Aktual','Gap','Kondisi','Tujuan','Course','OJT','Timeline','Status IDP'].map(h => (
                        <th key={h} className="px-2 py-2 text-left font-medium text-gray-500 border border-gray-100 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedIdp.items || []).length === 0 ? (
                      <tr><td colSpan={11} className="px-3 py-6 text-center text-gray-400">Tidak ada item IDP</td></tr>
                    ) : (selectedIdp.items || []).map(item => {
                      const g = item.actual - item.target
                      const c = condBadge(g)
                      return (
                        <tr key={item.id} className="border-b border-gray-50">
                          <td className="px-2 py-2 border border-gray-100"><span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{item.competencyType?.split(' ')[0]}</span></td>
                          <td className="px-2 py-2 border border-gray-100 font-medium text-gray-800">{item.competencyName}</td>
                          <td className="px-2 py-2 border border-gray-100 text-center font-bold">{item.target}</td>
                          <td className="px-2 py-2 border border-gray-100 text-center font-bold">{item.actual}</td>
                          <td className="px-2 py-2 border border-gray-100 text-center font-bold">{g > 0 ? `+${g}` : g}</td>
                          <td className="px-2 py-2 border border-gray-100"><span className={`px-1.5 py-0.5 rounded ${c.cls}`}>{c.label}</span></td>
                          <td className="px-2 py-2 border border-gray-100 text-gray-600 max-w-xs">{item.specificGoal || '—'}</td>
                          <td className="px-2 py-2 border border-gray-100 text-gray-600 max-w-xs">{item.courseRecommendation || '—'}</td>
                          <td className="px-2 py-2 border border-gray-100 text-gray-600">{item.ojt || '—'}</td>
                          <td className="px-2 py-2 border border-gray-100 text-gray-600 whitespace-nowrap">{item.timeline || '—'}</td>
                          <td className="px-2 py-2 border border-gray-100">
                            <span className={`px-1.5 py-0.5 rounded ${
                              item.idpStatus === 'Completed' ? 'bg-green-50 text-green-700' :
                              item.idpStatus === 'In Progress' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-600'
                            }`}>{item.idpStatus}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {selectedIdp.status === 'Submitted' && (
                <div className="flex gap-3 mt-6">
                  <button onClick={() => handleRevise(selectedIdp.id)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-50 transition">
                    Kembalikan untuk Revisi
                  </button>
                  <button onClick={() => handleApprove(selectedIdp.id)}
                    className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-green-700 transition">
                    Setujui IDP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
