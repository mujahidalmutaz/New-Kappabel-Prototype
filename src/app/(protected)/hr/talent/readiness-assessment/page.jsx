'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'

const readinessCls = { High: 'bg-green-100 text-green-700 border-green-200', Medium: 'bg-yellow-100 text-yellow-700 border-yellow-200', Low: 'bg-red-100 text-red-700 border-red-200' }
const fitnessCls = { Short: 'bg-red-100 text-red-700', Mid: 'bg-yellow-100 text-yellow-700', Long: 'bg-green-100 text-green-700' }

const calcReadiness = (skills, leadership, experience) => {
  if (!skills?.length) return { score: 0, level: 'Low', fitness: 'Long' }
  const avgGap = skills.reduce((s, sk) => s + (sk.actual - sk.required), 0) / skills.length
  const skillScore = Math.max(0, Math.min(100, 50 + avgGap * 10))
  const leaderScore = (leadership / 10) * 25
  const expScore = (experience / 10) * 25
  const total = Math.round(skillScore + leaderScore + expScore)
  const level = total >= 75 ? 'High' : total >= 50 ? 'Medium' : 'Low'
  const fitness = total >= 75 ? 'Short' : total >= 50 ? 'Mid' : 'Long'
  return { score: total, level, fitness }
}

export default function ReadinessAssessment() {
  const { keyPositions = [] } = useTalentStore()
  const keyPos = keyPositions.filter(p => p.isKeyPosition)

  const [assessments, setAssessments] = useState([
    { id: 1, employeeId: 'EMP-004', employeeName: 'Dewi Anggraini', targetPositionId: 1, targetPositionName: 'General Manager Operations', assessedBy: 'HR Director', assessedAt: '2025-01-10', skills: [{ id: 'sk1', name: 'Strategic Thinking', required: 4, actual: 3 }, { id: 'sk2', name: 'People Management', required: 5, actual: 4 }, { id: 'sk3', name: 'Financial Acumen', required: 3, actual: 2 }], leadership: 7, experience: 8, notes: 'Kandidat potensial, perlu development di Financial Acumen' },
    { id: 2, employeeId: 'EMP-005', employeeName: 'Rendi Pratama', targetPositionId: 2, targetPositionName: 'Head of Finance', assessedBy: 'HR Manager', assessedAt: '2025-01-15', skills: [{ id: 'sk4', name: 'Financial Reporting', required: 5, actual: 5 }, { id: 'sk5', name: 'Risk Management', required: 4, actual: 3 }], leadership: 6, experience: 7, notes: 'Strong finance background' },
  ])

  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState({ employeeName: '', targetPositionId: '', assessedBy: '' })
  const [newSkill, setNewSkill] = useState({ name: '', required: 4, actual: 0 })

  const [editLeadership, setEditLeadership] = useState(5)
  const [editExperience, setEditExperience] = useState(5)

  function openDetail(a) {
    setSelected(a)
    setEditLeadership(a.leadership || 5)
    setEditExperience(a.experience || 5)
  }

  function handleCreate() {
    if (!newDraft.employeeName) return
    const pos = keyPos.find(p => p.id === Number(newDraft.targetPositionId))
    const rec = { id: Date.now(), ...newDraft, targetPositionId: Number(newDraft.targetPositionId), targetPositionName: pos?.positionName || '—', assessedAt: new Date().toISOString().slice(0, 10), skills: [], leadership: 5, experience: 5, notes: '' }
    setAssessments(prev => [...prev, rec])
    setShowNew(false)
    setNewDraft({ employeeName: '', targetPositionId: '', assessedBy: '' })
  }

  function handleAddSkill() {
    if (!selected || !newSkill.name) return
    const updated = { ...selected, skills: [...selected.skills, { id: `sk_${Date.now()}`, ...newSkill }] }
    setAssessments(prev => prev.map(a => a.id === selected.id ? updated : a))
    setSelected(updated)
    setNewSkill({ name: '', required: 4, actual: 0 })
  }

  function handleSave() {
    if (!selected) return
    const updated = { ...selected, leadership: editLeadership, experience: editExperience }
    setAssessments(prev => prev.map(a => a.id === selected.id ? updated : a))
    setSelected(updated)
  }

  function handleDeleteSkill(skillId) {
    if (!selected) return
    const updated = { ...selected, skills: selected.skills.filter(s => s.id !== skillId) }
    setAssessments(prev => prev.map(a => a.id === selected.id ? updated : a))
    setSelected(updated)
  }

  const selResult = selected ? calcReadiness(selected.skills, editLeadership, editExperience) : null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Succession Readiness Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">Penilaian kesiapan calon successor untuk mengisi target posisi</p>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Buat Assessment
        </button>
      </div>

      <div className={selected ? 'grid grid-cols-2 gap-4' : ''}>
        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['No','Calon Successor','Target Posisi','Assessor','Tanggal','Readiness','Fitness','Aksi'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Belum ada assessment</td></tr>
              ) : assessments.map((a, i) => {
                const r = calcReadiness(a.skills, a.leadership, a.experience)
                return (
                  <tr key={a.id} onClick={() => openDetail(a)} className={`border-b border-gray-50 cursor-pointer hover:bg-red-50 ${selected?.id === a.id ? 'bg-red-50' : ''}`}>
                    <td className="px-3 py-2.5 text-gray-400">{i+1}</td>
                    <td className="px-3 py-2.5 font-medium text-gray-800">{a.employeeName}</td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">{a.targetPositionName}</td>
                    <td className="px-3 py-2.5 text-gray-500">{a.assessedBy}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs">{a.assessedAt}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${readinessCls[r.level]}`}>{r.level} ({r.score})</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fitnessCls[r.fitness]}`}>{r.fitness}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button onClick={e => { e.stopPropagation(); openDetail(a) }} className="text-red-600 text-xs hover:text-red-800">Detail</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && selResult && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-start justify-between">
              <div>
                <div className="font-bold text-gray-900">{selected.employeeName}</div>
                <div className="text-xs text-gray-500">→ {selected.targetPositionName}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${readinessCls[selResult.level]}`}>{selResult.level} ({selResult.score}/100)</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${fitnessCls[selResult.fitness]}`}>{selResult.fitness} Term</span>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 ml-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {/* Score Gauge */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1"><span>Overall Readiness Score</span><span className="font-bold">{selResult.score}/100</span></div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full ${selResult.score >= 75 ? 'bg-green-500' : selResult.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${selResult.score}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Low</span><span>Medium (50)</span><span>High (75)</span></div>
              </div>

              {/* Skills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Skills Assessment</span>
                </div>
                <table className="w-full text-xs mb-2">
                  <thead className="bg-gray-50"><tr>
                    {['Skill','Required','Current','Gap'].map(h => <th key={h} className="px-2 py-1.5 text-left text-gray-500 font-medium">{h}</th>)}
                    <th className="px-2 py-1.5 w-8"></th>
                  </tr></thead>
                  <tbody>
                    {selected.skills.length === 0 ? (
                      <tr><td colSpan={5} className="px-2 py-4 text-center text-gray-400">Belum ada skill</td></tr>
                    ) : selected.skills.map(sk => {
                      const g = sk.actual - sk.required
                      return (
                        <tr key={sk.id} className="border-b border-gray-50">
                          <td className="px-2 py-1.5 font-medium text-gray-800">{sk.name}</td>
                          <td className="px-2 py-1.5 text-center font-bold">{sk.required}</td>
                          <td className="px-2 py-1.5 text-center font-bold">{sk.actual}</td>
                          <td className="px-2 py-1.5 text-center">
                            <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${g >= 0 ? 'text-green-600' : 'text-red-600'}`}>{g > 0 ? `+${g}` : g}</span>
                          </td>
                          <td className="px-2 py-1.5">
                            <button onClick={() => handleDeleteSkill(sk.id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {/* Add skill */}
                <div className="flex gap-1 items-center">
                  <input value={newSkill.name} onChange={e => setNewSkill(d => ({ ...d, name: e.target.value }))} placeholder="Nama skill..." className="border border-gray-200 rounded px-2 py-1 text-xs flex-1" />
                  <input type="number" min={1} max={5} value={newSkill.required} onChange={e => setNewSkill(d => ({ ...d, required: Number(e.target.value) }))} className="border border-gray-200 rounded px-2 py-1 text-xs w-14" placeholder="Req" />
                  <input type="number" min={0} max={5} value={newSkill.actual} onChange={e => setNewSkill(d => ({ ...d, actual: Number(e.target.value) }))} className="border border-gray-200 rounded px-2 py-1 text-xs w-14" placeholder="Act" />
                  <button onClick={handleAddSkill} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs hover:bg-gray-200">+</button>
                </div>
              </div>

              {/* Leadership & Experience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Leadership Score (0–10)</label>
                  <input type="number" min={0} max={10} value={editLeadership} onChange={e => setEditLeadership(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Experience Score (0–10)</label>
                  <input type="number" min={0} max={10} value={editExperience} onChange={e => setEditExperience(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Catatan Assessor</label>
                <textarea value={selected.notes} onChange={e => setSelected(s => ({ ...s, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-16 resize-none" />
              </div>

              <button onClick={handleSave} className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700">Simpan Assessment</button>
            </div>
          </div>
        )}
      </div>

      {/* New Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Buat Readiness Assessment</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Nama Calon Successor</label>
                <input value={newDraft.employeeName} onChange={e => setNewDraft(d => ({ ...d, employeeName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Target Posisi (Key Position)</label>
                <select value={newDraft.targetPositionId} onChange={e => setNewDraft(d => ({ ...d, targetPositionId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">— Pilih Posisi —</option>
                  {keyPos.map(p => <option key={p.id} value={p.id}>{p.positionName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Assessor</label>
                <input value={newDraft.assessedBy} onChange={e => setNewDraft(d => ({ ...d, assessedBy: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNew(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm">Batal</button>
              <button onClick={handleCreate} disabled={!newDraft.employeeName} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">Buat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
