'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'
// BOX_LABELS grid: row 0=High Comp, row 2=Low Comp; col 0=Low Perf, col 2=High Perf
// Maps adjustedBox label to { boxRow (1-3), boxCol (1-3) } in talentBoxes format
function boxLabelToPosition(label) {
  const grid = [
    ['Rough Diamond','High Potential','Star'],         // row 3 (High comp), cols 1,2,3
    ['Potential Gem','Core Employee','High Performer'], // row 2 (Mid comp)
    ['Underperformer','Consistent','Solid Performer'],  // row 1 (Low comp)
  ]
  for (let ri = 0; ri < grid.length; ri++) {
    for (let ci = 0; ci < grid[ri].length; ci++) {
      if (grid[ri][ci] === label) {
        return { boxRow: 3 - ri, boxCol: ci + 1 }
      }
    }
  }
  return null
}

const BOX_LABELS = [
  ['Rough Diamond','High Potential','Star'],
  ['Potential Gem','Core Employee','High Performer'],
  ['Underperformer','Consistent','Solid Performer'],
]

const BOX_COLORS = {
  'Star': 'bg-green-100 border-green-400 text-green-800',
  'High Potential': 'bg-blue-100 border-blue-400 text-blue-800',
  'High Performer': 'bg-blue-100 border-blue-400 text-blue-800',
  'Core Employee': 'bg-yellow-100 border-yellow-400 text-yellow-800',
  'Rough Diamond': 'bg-purple-100 border-purple-400 text-purple-800',
  'Potential Gem': 'bg-indigo-100 border-indigo-400 text-indigo-800',
  'Solid Performer': 'bg-teal-100 border-teal-400 text-teal-800',
  'Consistent': 'bg-gray-100 border-gray-400 text-gray-700',
  'Underperformer': 'bg-red-100 border-red-400 text-red-800',
}

const statusCls = { Scheduled: 'bg-gray-100 text-gray-600', 'In Progress': 'bg-yellow-100 text-yellow-700', Completed: 'bg-green-100 text-green-700' }

const ALL_BOX_OPTIONS = BOX_LABELS.flat()

export default function CalibrationSession() {
  const { talentBoxes = [], calibrationSessions = [] } = useTalentStore()
  const [sessions, setSessions] = useState(calibrationSessions.length ? calibrationSessions : [
    { id: 1, sessionName: 'Kalibrasi Q1 2025', year: 2025, facilitator: 'HR Director', participants: [{employeeId:'1',employeeName:'Budi Santoso',role:'COD'},{employeeId:'2',employeeName:'Siti Rahma',role:'HR Manager'}], status: 'Scheduled', scheduledDate: '2025-03-15', completedDate: null, adjustments: [], notes: '' },
    { id: 2, sessionName: 'Kalibrasi Tahunan 2024', year: 2024, facilitator: 'HR Manager', participants: [{employeeId:'3',employeeName:'Ahmad Fauzi',role:'HR'}], status: 'Completed', scheduledDate: '2024-12-10', completedDate: '2024-12-10', adjustments: [], notes: 'Selesai tanpa perubahan signifikan' },
  ])

  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [newDraft, setNewDraft] = useState({ sessionName: '', year: new Date().getFullYear(), facilitator: '', scheduledDate: '', notes: '' })
  const [newParticipant, setNewParticipant] = useState({ employeeName: '', role: 'HR' })
  const [finalizeMsg, setFinalizeMsg] = useState(null)

  const talentBoxMap = {}
  talentBoxes.forEach(b => { if (!talentBoxMap[b.employeeId] || b.year > talentBoxMap[b.employeeId].year) talentBoxMap[b.employeeId] = b })

  const allEmployees = [
    { employeeId: 'EMP-001', employeeName: 'Budi Santoso', boxLabel: 'Star' },
    { employeeId: 'EMP-002', employeeName: 'Siti Rahma', boxLabel: 'High Potential' },
    { employeeId: 'EMP-003', employeeName: 'Ahmad Fauzi', boxLabel: 'Core Employee' },
    { employeeId: 'EMP-004', employeeName: 'Dewi Anggraini', boxLabel: 'Solid Performer' },
    { employeeId: 'EMP-005', employeeName: 'Rendi Pratama', boxLabel: 'Potential Gem' },
  ]

  function handleCreate() {
    if (!newDraft.sessionName) return
    const s = { id: Date.now(), ...newDraft, participants: [], status: 'Scheduled', completedDate: null, adjustments: [] }
    setSessions(prev => [...prev, s])
    setShowNew(false)
    setNewDraft({ sessionName: '', year: new Date().getFullYear(), facilitator: '', scheduledDate: '', notes: '' })
  }

  function handleAddParticipant() {
    if (!newParticipant.employeeName || !selected) return
    const updated = { ...selected, participants: [...selected.participants, { ...newParticipant, employeeId: `p_${Date.now()}` }] }
    setSessions(prev => prev.map(s => s.id === selected.id ? updated : s))
    setSelected(updated)
    setNewParticipant({ employeeName: '', role: 'HR' })
  }

  function handleAdjustBox(empId, newBox, reason) {
    if (!selected) return
    const existing = selected.adjustments.find(a => a.employeeId === empId)
    const newAdj = existing
      ? selected.adjustments.map(a => a.employeeId === empId ? { ...a, adjustedBox: newBox, reason } : a)
      : [...selected.adjustments, { employeeId: empId, employeeName: allEmployees.find(e => e.employeeId === empId)?.employeeName || empId, originalBox: allEmployees.find(e => e.employeeId === empId)?.boxLabel || '—', adjustedBox: newBox, reason }]
    const updated = { ...selected, adjustments: newAdj }
    setSessions(prev => prev.map(s => s.id === selected.id ? updated : s))
    setSelected(updated)
  }

  function handleFinalize() {
    if (!selected) return
    const updated = { ...selected, status: 'Completed', completedDate: new Date().toISOString().slice(0, 10) }
    setSessions(prev => prev.map(s => s.id === selected.id ? updated : s))
    setSelected(updated)

    // Sync adjustments to talentBoxes (GAP 3)
    const year = selected.year || new Date().getFullYear()
    const adjCount = selected.adjustments.length
    if (adjCount > 0) {
      useTalentStore.setState(s => {
        let talentBoxes = [...s.talentBoxes]
        for (const adj of selected.adjustments) {
          const pos = boxLabelToPosition(adj.adjustedBox)
          if (!pos) continue
          const idx = talentBoxes.findIndex(t =>
            (t.employeeId === adj.employeeId || t.employeeName === adj.employeeName) && t.year === year
          )
          if (idx >= 0) {
            talentBoxes[idx] = { ...talentBoxes[idx], boxLabel: adj.adjustedBox, boxRow: pos.boxRow, boxCol: pos.boxCol }
          } else {
            talentBoxes.push({
              id: Date.now() + Math.random(),
              employeeId: adj.employeeId,
              employeeName: adj.employeeName,
              year,
              performanceScore: 0,
              competencyScore: 0,
              boxRow: pos.boxRow,
              boxCol: pos.boxCol,
              boxLabel: adj.adjustedBox,
              notes: `Dari kalibrasi: ${selected.sessionName}`,
            })
          }
        }
        return { talentBoxes }
      })
      setFinalizeMsg(`✓ Kalibrasi selesai — ${adjCount} penyesuaian telah disimpan ke 9-Box Matrix`)
      setTimeout(() => setFinalizeMsg(null), 5000)
    }
  }

  const getAdjusted = (empId) => selected?.adjustments.find(a => a.employeeId === empId)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {finalizeMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold bg-green-600 text-white">
          {finalizeMsg}
        </div>
      )}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calibration Session</h1>
          <p className="text-sm text-gray-500 mt-1">Kalibrasi 9-Box Matrix secara kolektif oleh HR & Manager</p>
        </div>
        <button onClick={() => setShowNew(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Buat Sesi
        </button>
      </div>

      {/* Sessions Table */}
      {!selected && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['No','Nama Sesi','Tahun','Fasilitator','Peserta','Jadwal','Status','Aksi'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400">Belum ada sesi kalibrasi</td></tr>
              ) : sessions.map((s, i) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i+1}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{s.sessionName}</td>
                  <td className="px-4 py-3 text-gray-600">{s.year}</td>
                  <td className="px-4 py-3 text-gray-600">{s.facilitator}</td>
                  <td className="px-4 py-3 text-gray-600">{s.participants.length} orang</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.scheduledDate}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCls[s.status] || 'bg-gray-100 text-gray-600'}`}>{s.status}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(s)} className="text-red-600 text-xs font-medium hover:text-red-800">Buka →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail View */}
      {selected && (
        <div>
          <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Kembali ke Daftar
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.sessionName}</h2>
                <div className="text-sm text-gray-500 mt-0.5">Fasilitator: {selected.facilitator} · Jadwal: {selected.scheduledDate}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusCls[selected.status]}`}>{selected.status}</span>
                {selected.status !== 'Completed' && (
                  <button onClick={handleFinalize} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700">Finalisasi</button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {selected.participants.map((p, i) => (
                <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">{p.employeeName} <span className="text-gray-400">({p.role})</span></span>
              ))}
              <div className="flex gap-1">
                <input value={newParticipant.employeeName} onChange={e => setNewParticipant(d => ({ ...d, employeeName: e.target.value }))}
                  placeholder="Tambah peserta..." className="border border-gray-200 rounded-l-lg px-2 py-1 text-xs w-32" />
                <input value={newParticipant.role} onChange={e => setNewParticipant(d => ({ ...d, role: e.target.value }))}
                  placeholder="Role" className="border border-gray-200 px-2 py-1 text-xs w-20" />
                <button onClick={handleAddParticipant} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-r-lg text-xs hover:bg-gray-200">+</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* 9-Box Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">9-Box Matrix (Current)</h3>
              <div className="text-xs text-gray-400 mb-2">Y: Kompetensi (High→Low) · X: Performance (Low→High)</div>
              <div className="grid grid-cols-3 gap-1.5">
                {BOX_LABELS.map((row, ri) => row.map((cell, ci) => {
                  const emps = allEmployees.filter(e => {
                    const adj = selected.adjustments.find(a => a.employeeId === e.employeeId)
                    return (adj ? adj.adjustedBox : e.boxLabel) === cell
                  })
                  return (
                    <div key={`${ri}-${ci}`} className={`p-2 rounded-lg border min-h-14 ${BOX_COLORS[cell] || 'bg-gray-50 border-gray-200'}`}>
                      <div className="text-xs font-semibold mb-1 leading-tight">{cell}</div>
                      {emps.map(e => (
                        <span key={e.employeeId} className="block text-xs bg-white/70 rounded px-1 py-0.5 mb-0.5 truncate">{e.employeeName.split(' ')[0]}</span>
                      ))}
                    </div>
                  )
                }))}
              </div>
            </div>

            {/* Adjustment Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Adjustment Per Karyawan</h3>
              <div className="space-y-2">
                {allEmployees.map(emp => {
                  const adj = getAdjusted(emp.employeeId)
                  return (
                    <div key={emp.employeeId} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                      <div className="text-xs font-medium text-gray-800 w-28 truncate">{emp.employeeName}</div>
                      <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ${BOX_COLORS[emp.boxLabel] || 'bg-gray-100'}`}>{emp.boxLabel}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                      <select value={adj?.adjustedBox || emp.boxLabel}
                        onChange={e => handleAdjustBox(emp.employeeId, e.target.value, adj?.reason || '')}
                        className="border border-gray-200 rounded px-1 py-0.5 text-xs flex-1 min-w-0">
                        {ALL_BOX_OPTIONS.map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  )
                })}
              </div>
              {selected.adjustments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-600 mb-2">Perubahan: {selected.adjustments.length}</div>
                  {selected.adjustments.map((a, i) => (
                    <div key={i} className="text-xs text-gray-500 flex gap-1 mb-1">
                      <span className="font-medium text-gray-700">{a.employeeName}:</span>
                      <span>{a.originalBox}</span>
                      <span>→</span>
                      <span className="text-red-600 font-medium">{a.adjustedBox}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Buat Sesi Kalibrasi</h2>
            <div className="space-y-3">
              {[
                { label: 'Nama Sesi', key: 'sessionName' },
                { label: 'Fasilitator', key: 'facilitator' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
                  <input value={newDraft[f.key]} onChange={e => setNewDraft(d => ({ ...d, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Tahun</label>
                  <input type="number" value={newDraft.year} onChange={e => setNewDraft(d => ({ ...d, year: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Tanggal</label>
                  <input type="date" value={newDraft.scheduledDate} onChange={e => setNewDraft(d => ({ ...d, scheduledDate: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Catatan</label>
                <textarea value={newDraft.notes} onChange={e => setNewDraft(d => ({ ...d, notes: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm h-16 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowNew(false)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm">Batal</button>
              <button onClick={handleCreate} disabled={!newDraft.sessionName} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">Buat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
