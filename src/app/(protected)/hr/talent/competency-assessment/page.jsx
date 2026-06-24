'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'

const COMP_TYPES = ['Soft Competency', 'Core Competency', 'Technical Competency', 'Strategic Competency']
const DEPTS = ['Human Resources', 'Finance', 'Operations', 'IT', 'Marketing', 'Legal', 'Supply Chain']

const ratingBadge = (gap) =>
  gap < 0 ? { label: '🔴 Needs Dev', cls: 'bg-red-50 text-red-700 border-red-200' }
  : gap === 0 ? { label: '🟡 Meet', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
  : { label: '🟢 Exceed', cls: 'bg-green-50 text-green-700 border-green-200' }

const statusCls = (s) => s === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'

const calcScore = (items) => {
  if (!items?.length) return 0
  const avg = items.reduce((s, i) => s + (i.actual || 0), 0) / items.length
  const max = items.reduce((s, i) => s + (i.target || 5), 0) / items.length
  return Math.round((avg / max) * 100)
}

const boxFromScore = (score) =>
  score >= 71 ? 'High' : score >= 41 ? 'Medium' : 'Low'

export default function CompetencyAssessment() {
  const { competencyAssessments = [], addCompetencyAssessment, updateCompetencyAssessment, deleteCompetencyAssessment } = useTalentStore()

  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)

  const [draft, setDraft] = useState({ employeeName: '', position: '', department: DEPTS[0], year: new Date().getFullYear(), assessedBy: '' })
  const [itemDraft, setItemDraft] = useState({ competencyType: COMP_TYPES[0], competencyName: '', target: 4, actual: 0 })

  const filtered = competencyAssessments.filter(a =>
    (filterStatus === 'All' || a.status === filterStatus) &&
    (filterDept === 'All' || a.department === filterDept)
  )

  const totalAssessed = competencyAssessments.filter(a => a.status === 'Completed').length
  const avgScore = competencyAssessments.length
    ? Math.round(competencyAssessments.reduce((s, a) => s + calcScore(a.items), 0) / competencyAssessments.length)
    : 0
  const needDev = competencyAssessments.filter(a => calcScore(a.items) < 50).length

  function handleCreate() {
    if (!draft.employeeName) return
    const id = typeof addCompetencyAssessment === 'function'
      ? addCompetencyAssessment({ ...draft, status: 'Draft', items: [], assessedAt: new Date().toISOString().slice(0, 10) })
      : null
    if (!id && typeof useTalentStore.getState !== 'undefined') {
      useTalentStore.setState(s => ({
        competencyAssessments: [...(s.competencyAssessments || []), {
          id: Date.now(), ...draft, status: 'Draft', items: [], assessedAt: new Date().toISOString().slice(0, 10)
        }]
      }))
    }
    setShowNew(false)
    setDraft({ employeeName: '', position: '', department: DEPTS[0], year: new Date().getFullYear(), assessedBy: '' })
  }

  function handleAddItem() {
    if (!selected || !itemDraft.competencyName) return
    const gap = itemDraft.actual - itemDraft.target
    const newItem = { id: `ci_${Date.now()}`, ...itemDraft, gap, rating: ratingBadge(gap).label }
    const updated = { ...selected, items: [...(selected.items || []), newItem] }
    updateCompetencyAssessment?.(selected.id, updated)
    useTalentStore.setState(s => ({
      competencyAssessments: s.competencyAssessments.map(a => a.id === selected.id ? updated : a)
    }))
    setSelected(updated)
    setShowAddItem(false)
    setItemDraft({ competencyType: COMP_TYPES[0], competencyName: '', target: 4, actual: 0 })
  }

  function handleFinalize() {
    if (!selected) return
    const updated = { ...selected, status: 'Completed' }
    useTalentStore.setState(s => ({
      competencyAssessments: s.competencyAssessments.map(a => a.id === selected.id ? updated : a)
    }))
    setSelected(updated)
  }

  const selScore = selected ? calcScore(selected.items) : 0
  const selBox = boxFromScore(selScore)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Competency Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">Penilaian kompetensi karyawan — input utama 9-Box Talent Matrix</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Buat Assessment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Completed', val: totalAssessed, color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { label: 'Avg Score', val: `${avgScore}`, color: 'bg-green-50 border-green-100 text-green-700' },
          { label: 'Perlu Pengembangan', val: needDev, color: 'bg-red-50 border-red-100 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="text-3xl font-bold">{s.val}</div>
            <div className="text-sm font-medium mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="All">Semua Status</option>
          <option value="Draft">Draft</option>
          <option value="Completed">Completed</option>
        </select>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="All">Semua Departemen</option>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      <div className={`${selected ? 'grid grid-cols-2 gap-4' : ''}`}>
        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['No','Nama Karyawan','Posisi','Dept','Assessor','Tanggal','Score','Status','Aksi'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-gray-400">Belum ada assessment</td></tr>
              ) : filtered.map((a, i) => {
                const score = calcScore(a.items)
                return (
                  <tr key={a.id} onClick={() => setSelected(a)}
                    className={`border-b border-gray-50 cursor-pointer hover:bg-red-50 transition ${selected?.id === a.id ? 'bg-red-50' : ''}`}>
                    <td className="px-3 py-2.5 text-gray-400">{i+1}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800">{a.employeeName}</td>
                    <td className="px-3 py-2.5 text-gray-600">{a.position}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{a.department}</td>
                    <td className="px-3 py-2.5 text-gray-500">{a.assessedBy}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">{a.assessedAt}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-gray-100 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${score >= 71 ? 'bg-green-500' : score >= 41 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width:`${score}%`}}/>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCls(a.status)}`}>{a.status}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={e => { e.stopPropagation(); setSelected(a) }} className="text-red-600 text-xs hover:text-red-800">Detail</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-start justify-between bg-gray-50">
              <div>
                <div className="font-bold text-gray-900">{selected.employeeName}</div>
                <div className="text-sm text-gray-500">{selected.position} · {selected.department}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  selBox === 'High' ? 'bg-green-50 text-green-700 border-green-200' :
                  selBox === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>9-Box: {selBox} ({selScore})</div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Score bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Overall Score</span><span className="font-bold text-gray-800">{selScore}/100</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full transition-all ${selScore >= 71 ? 'bg-green-500' : selScore >= 41 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width:`${selScore}%`}}/>
                </div>
              </div>

              {/* Items table */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Item Kompetensi ({selected.items?.length || 0})</span>
                {selected.status === 'Draft' && (
                  <button onClick={() => setShowAddItem(true)} className="text-xs text-red-600 font-medium border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50">+ Tambah</button>
                )}
              </div>

              {(selected.items || []).length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-6 border border-dashed border-gray-200 rounded-lg">Belum ada item kompetensi</div>
              ) : (
                <table className="w-full text-xs mb-4">
                  <thead className="bg-gray-50">
                    <tr>{['Jenis','Nama','Target','Aktual','Gap','Rating'].map(h => <th key={h} className="px-2 py-1.5 text-left text-gray-500 font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {selected.items.map(item => {
                      const g = (item.actual || 0) - (item.target || 5)
                      const rb = ratingBadge(g)
                      return (
                        <tr key={item.id} className="border-b border-gray-50">
                          <td className="px-2 py-1.5 text-gray-500">{item.competencyType?.split(' ')[0]}</td>
                          <td className="px-2 py-1.5 font-medium text-gray-800">{item.competencyName}</td>
                          <td className="px-2 py-1.5 text-center font-bold">{item.target}</td>
                          <td className="px-2 py-1.5 text-center font-bold">{item.actual}</td>
                          <td className="px-2 py-1.5 text-center font-bold">{g > 0 ? `+${g}` : g}</td>
                          <td className="px-2 py-1.5"><span className={`px-1.5 py-0.5 rounded border text-xs ${rb.cls}`}>{rb.label}</span></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {selected.status === 'Draft' && (
                <button onClick={handleFinalize}
                  className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                  ✓ Finalisasi Assessment
                </button>
              )}
              {selected.status === 'Completed' && (
                <div className="text-center text-sm text-green-600 font-medium bg-green-50 py-2 rounded-lg border border-green-200">
                  ✓ Assessment Completed
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Assessment Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Buat Assessment Baru</h2>
            <div className="space-y-3">
              {[
                { label: 'Nama Karyawan', key: 'employeeName', type: 'text' },
                { label: 'Posisi', key: 'position', type: 'text' },
                { label: 'Assessor', key: 'assessedBy', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                  <input type={f.type} value={draft[f.key]}
                    onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Departemen</label>
                <select value={draft.department} onChange={e => setDraft(d => ({ ...d, department: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tahun</label>
                <input type="number" value={draft.year} onChange={e => setDraft(d => ({ ...d, year: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNew(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Batal</button>
              <button onClick={handleCreate} disabled={!draft.employeeName} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">Buat</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tambah Item Kompetensi</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Jenis Kompetensi</label>
                <select value={itemDraft.competencyType} onChange={e => setItemDraft(d => ({ ...d, competencyType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  {COMP_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nama Kompetensi</label>
                <input value={itemDraft.competencyName} onChange={e => setItemDraft(d => ({ ...d, competencyName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Target (1–5)</label>
                  <input type="number" min={1} max={5} value={itemDraft.target}
                    onChange={e => setItemDraft(d => ({ ...d, target: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Aktual (0–5)</label>
                  <input type="number" min={0} max={5} value={itemDraft.actual}
                    onChange={e => setItemDraft(d => ({ ...d, actual: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${ratingBadge(itemDraft.actual - itemDraft.target).cls}`}>
                <span className="text-xs">Gap: <strong>{itemDraft.actual - itemDraft.target > 0 ? '+' : ''}{itemDraft.actual - itemDraft.target}</strong></span>
                <span className="text-xs ml-2">{ratingBadge(itemDraft.actual - itemDraft.target).label}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAddItem(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Batal</button>
              <button onClick={handleAddItem} disabled={!itemDraft.competencyName} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">Tambah</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
