'use client'
import { useState, useMemo } from 'react'
import { useAuthStore }      from '@/store/authStore'
import { useLeaveStore }     from '@/store/leaveStore'
import { useWorkflowStore }  from '@/store/workflowStore'
import { useEmployeeStore }  from '@/store/employeeStore'
import { useStructureStore } from '@/store/structureStore'
import { daysBetween }       from '@/utils/dateUtils'
import WorkflowMonitor       from '@/components/WorkflowMonitor'
import { useT } from '@/store/languageStore'

function getAllSubIds(managerId, childMap) {
  const direct = childMap[managerId] || []
  return [...direct, ...direct.flatMap(id => getAllSubIds(id, childMap))]
}

const badge = (s) => ({
  Approved: 'bg-green-100 text-green-700',
  Pending:  'bg-yellow-100 text-yellow-700',
  Rejected: 'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600')

export default function ApplyLeaveTeamPage() {
  const t = useT()
  const { currentUser }                        = useAuthStore()
  const { leaves, leaveTypes, submitLeave }    = useLeaveStore()
  const { getLevelsForPage }                   = useWorkflowStore()
  const { employees }                          = useEmployeeStore()
  const { positions, departments }             = useStructureStore()

  const [includeIndirect, setIncludeIndirect] = useState(false)
  const [form, setForm] = useState({ empId: '', type: '', start: '', end: '', note: '' })
  const [msg,  setMsg ] = useState(null)

  const activeTypes = leaveTypes.filter(t => t.active)

  // Build childMap
  const childMap = useMemo(() => {
    const map = {}
    employees.forEach(e => {
      if (e.managerId) map[e.managerId] = [...(map[e.managerId] || []), e.id]
    })
    return map
  }, [employees])

  // My subordinates
  const myId         = currentUser?.id
  const directIds    = childMap[myId] || []
  const allSubIds    = getAllSubIds(myId, childMap)
  const subIds       = includeIndirect ? allSubIds : directIds
  const subordinates = employees.filter(e => subIds.includes(e.id))

  const selectedEmp  = employees.find(e => e.id === +form.empId)

  const leaveUsed = (empId, typeName) =>
    leaves.filter(l => l.userId === empId && l.type === typeName && l.status === 'Approved')
      .reduce((sum, l) => sum + daysBetween(l.start, l.end), 0)

  const handleSubmit = () => {
    if (!form.empId || !form.type || !form.start || !form.end) {
      setMsg({ type: 'error', text: 'Karyawan, jenis cuti, dan tanggal wajib diisi.' }); return
    }
    if (form.end < form.start) {
      setMsg({ type: 'error', text: 'Tanggal selesai tidak boleh sebelum tanggal mulai.' }); return
    }
    const lt   = leaveTypes.find(t => t.name === form.type)
    const used = leaveUsed(+form.empId, form.type)
    const req  = daysBetween(form.start, form.end)
    if (lt && used + req > lt.maxDays) {
      setMsg({ type: 'error', text: `Saldo ${form.type} tidak cukup! Sisa: ${lt.maxDays - used} hari.` }); return
    }
    submitLeave({ userId: +form.empId, name: selectedEmp?.name ?? '', workflowName: 'Apply Leave (My Team)', ...form }, getLevelsForPage('Apply Leave (My Team)'))
    setForm({ empId: '', type: '', start: '', end: '', note: '' })
    setMsg({ type: 'success', text: `Cuti berhasil diajukan untuk ${selectedEmp?.name}.` })
    setTimeout(() => setMsg(null), 3000)
  }

  // History: leaves of my subordinates
  const subLeaves = leaves
    .filter(l => subIds.includes(l.userId))
    .sort((a, b) => b.id - a.id)

  const posName  = (id) => positions.find(p => p.id === +id)?.name  || '—'
  const deptName = (id) => departments.find(d => d.id === +id)?.name || '—'

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Apply Leave — My Team</h1>
      <p className='text-gray-500 text-sm mb-6'>Ajukan cuti atas nama anggota tim Anda.</p>

      {/* Scope toggle */}
      <div className='bg-white rounded-xl p-4 shadow-sm mb-6 flex items-center gap-4'>
        <span className='text-sm font-semibold text-gray-700'>Tampilkan subordinate:</span>
        <div className='flex gap-2'>
          {[false, true].map(v => (
            <button key={String(v)} onClick={() => { setIncludeIndirect(v); setForm(f => ({ ...f, empId: '' })) }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition ${
                includeIndirect === v
                  ? 'border-red-400 bg-red-50 text-red-700'
                  : 'border-gray-200 text-gray-500 hover:border-red-200'
              }`}>
              {v ? '🌲 Direct + Indirect' : '👥 Direct Only'}
            </button>
          ))}
        </div>
        <span className='text-xs text-gray-400 ml-2'>
          {subordinates.length} karyawan · {directIds.length} direct
          {includeIndirect && ` · ${allSubIds.length - directIds.length} indirect`}
        </span>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>

        {/* Subordinate list */}
        <div className='bg-white rounded-xl p-5 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-3'>👥 Daftar Subordinate</h2>
          {subordinates.length === 0 ? (
            <p className='text-xs text-gray-400'>Tidak ada subordinate.</p>
          ) : (
            <div className='space-y-2 max-h-80 overflow-y-auto pr-1'>
              {subordinates.map(e => {
                const isDirect = directIds.includes(e.id)
                return (
                  <button key={e.id} onClick={() => setForm(f => ({ ...f, empId: String(e.id) }))}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition ${
                      form.empId === String(e.id)
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0 overflow-hidden'>
                      {e.photo ? <img src={e.photo} className='w-full h-full object-cover' /> : (e.gender === 'Female' ? '👩' : '👨')}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='text-xs font-semibold text-gray-800 truncate'>{e.name}</div>
                      <div className='text-xs text-gray-400 truncate'>{posName(e.positionId)}</div>
                    </div>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${isDirect ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {isDirect ? 'Direct' : 'Indirect'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Form */}
        <div className='lg:col-span-2 bg-white rounded-xl p-5 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>📝 Ajukan Cuti</h2>

          {msg && (
            <div className={`text-sm px-4 py-2.5 rounded-lg mb-4 ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
              {msg.text}
            </div>
          )}

          {/* Selected employee summary */}
          {selectedEmp && (
            <div className='flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl mb-4'>
              <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0'>
                {selectedEmp.photo ? <img src={selectedEmp.photo} className='w-full h-full object-cover' /> : (selectedEmp.gender === 'Female' ? '👩' : '👨')}
              </div>
              <div>
                <div className='text-sm font-bold text-red-800'>{selectedEmp.name}</div>
                <div className='text-xs text-red-500'>{posName(selectedEmp.positionId)} · {deptName(selectedEmp.departmentId)}</div>
              </div>
              {form.type && (
                <div className='ml-auto text-right'>
                  <div className='text-xs text-gray-500'>Sisa saldo</div>
                  <div className='text-lg font-bold text-red-700'>
                    {(leaveTypes.find(t => t.name === form.type)?.maxDays ?? 0) - leaveUsed(+form.empId, form.type)} hari
                  </div>
                </div>
              )}
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
            <div className='col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Karyawan</label>
              <select value={form.empId} onChange={e => setForm(f => ({ ...f, empId: e.target.value }))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>— Pilih Karyawan —</option>
                {subordinates.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({directIds.includes(e.id) ? 'Direct' : 'Indirect'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Jenis Cuti</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>— Pilih Jenis —</option>
                {activeTypes.map(t => {
                  const sisa = form.empId ? (t.maxDays - leaveUsed(+form.empId, t.name)) : t.maxDays
                  return <option key={t.id} value={t.name}>{t.name} (sisa: {sisa} hari)</option>
                })}
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Keterangan</label>
              <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder={t('Opsional','Optional')}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Tanggal Mulai</label>
              <input type='date' value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Tanggal Selesai</label>
              <input type='date' value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
          </div>

          {form.start && form.end && form.end >= form.start && (
            <p className='text-xs text-red-600 font-semibold mt-2'>
              Durasi: {daysBetween(form.start, form.end)} hari kerja
            </p>
          )}

          <button onClick={handleSubmit}
            className='mt-4 px-6 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
            style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
            Ajukan Cuti
          </button>
        </div>
      </div>

      {/* History */}
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>
          📄 Riwayat Cuti Tim
          <span className='ml-2 text-xs font-normal text-gray-400'>({subLeaves.length} pengajuan)</span>
        </h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {['Karyawan','Jenis','Mulai','Selesai','Hari','Keterangan','Status'].map(h => (
                  <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subLeaves.length ? subLeaves.map(l => (
                <tr key={l.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-2.5 font-medium'>{l.name}</td>
                  <td className='px-4 py-2.5'>{l.type}</td>
                  <td className='px-4 py-2.5'>{l.start}</td>
                  <td className='px-4 py-2.5'>{l.end}</td>
                  <td className='px-4 py-2.5'>{daysBetween(l.start, l.end)}</td>
                  <td className='px-4 py-2.5 text-gray-500'>{l.note || '—'}</td>
                  <td className='px-4 py-2.5'>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge(l.status)}`}>{l.status}</span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className='px-4 py-8 text-center text-gray-400 text-sm'>Belum ada pengajuan dari tim.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow Monitor */}
      {subLeaves.length > 0 && (
        <div className='mt-6'>
          <WorkflowMonitor leaves={subLeaves} title='Workflow Monitor — Tim Saya' />
        </div>
      )}
    </div>
  )
}
