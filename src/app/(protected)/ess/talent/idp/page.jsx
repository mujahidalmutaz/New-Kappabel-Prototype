'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useTalentStore } from '@/store/talentStore'

const COMPETENCY_TYPES = ['Soft Competency', 'Core Competency', 'Technical Competency', 'Strategic Competency']
const IDP_STATUS_LIST = ['Not Started', 'In Progress', 'Completed']

const conditionBadge = (gap) => {
  if (gap < 0) return { label: '🔴 Butuh Dev', cls: 'bg-red-50 text-red-700' }
  if (gap === 0) return { label: '🟢 Sesuai', cls: 'bg-green-50 text-green-700' }
  return { label: '🟢 Di Atas Target', cls: 'bg-blue-50 text-blue-700' }
}

const statusBadge = (s) => ({
  Draft: 'bg-gray-100 text-gray-600',
  Submitted: 'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
}[s] || 'bg-gray-100 text-gray-600')

export default function MyIDP() {
  const { user } = useAuthStore()
  const { idpList, addIdp, updateIdp } = useTalentStore()

  const myIdp = idpList.filter(i => i.employeeId === (user?.id || '1'))
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [showNewModal, setShowNewModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [showItemModal, setShowItemModal] = useState(false)

  const currentIdp = myIdp.find(i => String(i.year) === selectedYear)

  const [newItemDraft, setNewItemDraft] = useState({
    competencyType: 'Soft Competency', competencyName: '', target: 4, actual: 0,
    specificGoal: '', courseRecommendation: '', lmsLink: '', ojt: '', timeline: '', idpStatus: 'Not Started'
  })

  const gap = newItemDraft.actual - newItemDraft.target
  const cond = conditionBadge(gap)

  function handleCreateIdp() {
    addIdp({
      employeeId: user?.id || '1',
      employeeName: user?.name || 'Employee',
      year: Number(selectedYear),
      status: 'Draft',
      items: [],
      managerApproval: null,
    })
    setShowNewModal(false)
  }

  function handleAddItem() {
    if (!currentIdp) return
    const item = { ...newItemDraft, id: `item_${Date.now()}`, gap: newItemDraft.actual - newItemDraft.target, condition: cond.label }
    const updated = { ...currentIdp, items: [...(currentIdp.items || []), item] }
    updateIdp(currentIdp.id, updated)
    setShowItemModal(false)
    setNewItemDraft({ competencyType: 'Soft Competency', competencyName: '', target: 4, actual: 0, specificGoal: '', courseRecommendation: '', lmsLink: '', ojt: '', timeline: '', idpStatus: 'Not Started' })
  }

  function handleSubmit() {
    if (!currentIdp) return
    updateIdp(currentIdp.id, { ...currentIdp, status: 'Submitted' })
  }

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - 2 + i))

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My IDP</h1>
          <p className="text-sm text-gray-500 mt-1">Individual Development Plan — rencana pengembangan kompetensi kamu</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {!currentIdp && (
            <button onClick={() => setShowNewModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Buat IDP {selectedYear}
            </button>
          )}
        </div>
      </div>

      {!currentIdp ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <svg className="mx-auto mb-3 text-gray-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <p className="text-gray-400 mb-3">Belum ada IDP untuk tahun {selectedYear}</p>
          <button onClick={() => setShowNewModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition">
            Buat IDP Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* IDP Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800">IDP {currentIdp.year}</div>
              <div className="text-sm text-gray-500">{currentIdp.items?.length || 0} item kompetensi</div>
            </div>
            <div className="flex items-center gap-3">
              {currentIdp.managerApproval && (
                <div className="text-sm text-gray-500">
                  Disetujui oleh <span className="font-medium text-gray-700">{currentIdp.managerApproval}</span>
                </div>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadge(currentIdp.status)}`}>
                {currentIdp.status}
              </span>
              {currentIdp.status === 'Draft' && (
                <>
                  <button onClick={() => setShowItemModal(true)}
                    className="border border-red-600 text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 transition">
                    + Tambah Item
                  </button>
                  <button onClick={handleSubmit}
                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition">
                    Submit ke Manager
                  </button>
                </>
              )}
            </div>
          </div>

          {/* IDP Items Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Jenis Kompetensi','Nama Kompetensi','Target','Aktual','Gap','Kondisi','Tujuan Spesifik','Rekomendasi Course','OJT','Timeline','Status'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(currentIdp.items || []).length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-8 text-center text-gray-400 text-sm">Belum ada item IDP</td></tr>
                ) : (currentIdp.items || []).map(item => {
                  const g = item.actual - item.target
                  const c = conditionBadge(g)
                  return (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.competencyType}</span></td>
                      <td className="px-3 py-2 font-medium text-gray-800">{item.competencyName}</td>
                      <td className="px-3 py-2 text-center font-bold text-gray-700">{item.target}</td>
                      <td className="px-3 py-2 text-center font-bold text-gray-700">{item.actual}</td>
                      <td className="px-3 py-2 text-center font-bold">{g > 0 ? `+${g}` : g}</td>
                      <td className="px-3 py-2"><span className={`text-xs px-2 py-0.5 rounded-full ${c.cls}`}>{c.label}</span></td>
                      <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{item.specificGoal || '—'}</td>
                      <td className="px-3 py-2 text-gray-600 max-w-xs">
                        {item.lmsLink
                          ? <a href={item.lmsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-xs">{item.courseRecommendation || item.lmsLink}</a>
                          : item.courseRecommendation
                            ? <span>{item.courseRecommendation} <Link href="/ess/learning/catalog" className="text-xs text-red-600 hover:underline whitespace-nowrap">Cari di Katalog →</Link></span>
                            : '—'
                        }
                      </td>
                      <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{item.ojt || '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600">{item.timeline || '—'}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.idpStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                          item.idpStatus === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                        }`}>{item.idpStatus}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New IDP Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Buat IDP Baru</h2>
            <p className="text-sm text-gray-500 mb-4">Membuat Individual Development Plan untuk tahun <span className="font-semibold text-gray-700">{selectedYear}</span>.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleCreateIdp} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Buat IDP</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tambah Item IDP</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Jenis Kompetensi</label>
                <select value={newItemDraft.competencyType}
                  onChange={e => setNewItemDraft(d => ({ ...d, competencyType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {COMPETENCY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Nama Kompetensi</label>
                <input value={newItemDraft.competencyName}
                  onChange={e => setNewItemDraft(d => ({ ...d, competencyName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Target (1–5)</label>
                <input type="number" min={1} max={5} value={newItemDraft.target}
                  onChange={e => setNewItemDraft(d => ({ ...d, target: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Aktual (1–5)</label>
                <input type="number" min={0} max={5} value={newItemDraft.actual}
                  onChange={e => setNewItemDraft(d => ({ ...d, actual: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="col-span-2 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500">Gap:</span>
                <span className="font-bold text-gray-800">{gap > 0 ? `+${gap}` : gap}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${cond.cls}`}>{cond.label}</span>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Tujuan Spesifik</label>
                <textarea value={newItemDraft.specificGoal}
                  onChange={e => setNewItemDraft(d => ({ ...d, specificGoal: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-16 resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Rekomendasi Course</label>
                <input value={newItemDraft.courseRecommendation}
                  onChange={e => setNewItemDraft(d => ({ ...d, courseRecommendation: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                {newItemDraft.courseRecommendation && (
                  <p className="text-xs text-gray-400 mt-1">
                    <Link href="/ess/learning/catalog" className="text-red-600 hover:underline">Temukan di Learning Catalog →</Link>
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Link LMS / Course</label>
                <input value={newItemDraft.lmsLink}
                  onChange={e => setNewItemDraft(d => ({ ...d, lmsLink: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">OJT (On-the-Job Training)</label>
                <input value={newItemDraft.ojt}
                  onChange={e => setNewItemDraft(d => ({ ...d, ojt: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Timeline</label>
                <input value={newItemDraft.timeline}
                  onChange={e => setNewItemDraft(d => ({ ...d, timeline: e.target.value }))}
                  placeholder="e.g. 30 Nov 2026"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Status IDP</label>
                <select value={newItemDraft.idpStatus}
                  onChange={e => setNewItemDraft(d => ({ ...d, idpStatus: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {IDP_STATUS_LIST.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => setShowItemModal(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={handleAddItem} disabled={!newItemDraft.competencyName}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Tambah</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
