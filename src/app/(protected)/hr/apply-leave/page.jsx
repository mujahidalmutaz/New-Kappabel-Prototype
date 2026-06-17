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

const badge = (s) => ({
  Approved: 'bg-green-100 text-green-700',
  Pending:  'bg-yellow-100 text-yellow-700',
  Rejected: 'bg-red-100 text-red-700',
}[s] || 'bg-gray-100 text-gray-600')

export default function ApplyLeaveHRPage() {
  const t = useT()
  const { currentUser }                        = useAuthStore()
  const { leaves, leaveTypes, submitLeave }    = useLeaveStore()
  const { getLevelsForPage }                   = useWorkflowStore()
  const { employees }                          = useEmployeeStore()
  const { positions, departments, companies }  = useStructureStore()

  const [form,           setForm          ] = useState({ empId: '', type: '', start: '', end: '', note: '' })
  const [search,         setSearch        ] = useState('')
  const [filterDept,     setFilterDept    ] = useState('')
  const [filterCo,       setFilterCo      ] = useState('')
  const [msg,            setMsg           ] = useState(null)
  const [selectedLeaveId, setSelectedLeaveId] = useState(() =>
    [...leaves].sort((a, b) => b.id - a.id)[0]?.id ?? null
  )

  const activeTypes = leaveTypes.filter(lt => lt.active)

  const filteredEmps = useMemo(() => employees.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.nik.toLowerCase().includes(search.toLowerCase())
    const matchDept   = !filterDept || e.departmentId === +filterDept
    const matchCo     = !filterCo   || e.companyId    === +filterCo
    return matchSearch && matchDept && matchCo
  }), [employees, search, filterDept, filterCo])

  const selectedEmp = employees.find(e => e.id === +form.empId)

  const leaveUsed = (empId, typeName) =>
    leaves.filter(l => l.userId === empId && l.type === typeName && l.status === 'Approved')
      .reduce((sum, l) => sum + daysBetween(l.start, l.end), 0)

  const handleSubmit = () => {
    if (!form.empId || !form.type || !form.start || !form.end) {
      setMsg({ type: 'error', text: t('Karyawan, jenis cuti, dan tanggal wajib diisi.','Employee, leave type, and dates are required.') }); return
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
    submitLeave({
      userId:          +form.empId,
      name:            selectedEmp?.name ?? '',
      submittedBy:     currentUser.id,
      submittedByName: currentUser.name,
      workflowName:    'Apply Leave (HR)',
      ...form,
    }, getLevelsForPage('Apply Leave (HR)'))
    setForm({ empId: '', type: '', start: '', end: '', note: '' })
    setMsg({ type: 'success', text: `Cuti berhasil diajukan untuk ${selectedEmp?.name}.` })
    setTimeout(() => setMsg(null), 3000)
    setTimeout(() => {
      const latest = useLeaveStore.getState().leaves.slice().sort((a, b) => b.id - a.id)[0]
      if (latest) setSelectedLeaveId(latest.id)
    }, 50)
  }

  const posName  = (id) => positions.find(p => p.id === +id)?.name   || '—'
  const deptName = (id) => departments.find(d => d.id === +id)?.name  || '—'
  const coName   = (id) => companies.find(c => c.id === +id)?.name    || '—'

  const allLeaves = [...leaves].sort((a, b) => b.id - a.id)

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Apply Leave — HR</h1>
      <p className='text-gray-500 text-sm mb-6'>Ajukan cuti atas nama seluruh karyawan.</p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>

        {/* Employee picker */}
        <div className='bg-white rounded-xl p-5 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-3'>👤 Pilih Karyawan</h2>

          {/* Filters */}
          <div className='space-y-2 mb-3'>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder='Cari nama / NIK…'
              className='w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-400' />
            <select value={filterCo} onChange={e => setFilterCo(e.target.value)}
              className='w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-400'>
              <option value=''>Semua Perusahaan</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className='w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-400'>
              <option value=''>Semua Departemen</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div className='text-xs text-gray-400 mb-2'>{filteredEmps.length} karyawan</div>

          <div className='space-y-1.5 max-h-80 overflow-y-auto pr-1'>
            {filteredEmps.map(e => (
              <button key={e.id} onClick={() => setForm(f => ({ ...f, empId: String(e.id) }))}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition ${
                  form.empId === String(e.id)
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                <div className='w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0 overflow-hidden'>
                  {e.photo ? <img src={e.photo} className='w-full h-full object-cover' /> : (e.gender === 'Female' ? '👩' : '👨')}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='text-xs font-semibold text-gray-800 truncate'>{e.name}</div>
                  <div className='text-xs text-gray-400 truncate'>{e.nik} · {deptName(e.departmentId)}</div>
                </div>
              </button>
            ))}
          </div>
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
            <div className='flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4'>
              <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0'>
                {selectedEmp.photo ? <img src={selectedEmp.photo} className='w-full h-full object-cover' /> : (selectedEmp.gender === 'Female' ? '👩' : '👨')}
              </div>
              <div className='flex-1'>
                <div className='text-sm font-bold text-blue-800'>{selectedEmp.name}</div>
                <div className='text-xs text-blue-500'>{selectedEmp.nik} · {posName(selectedEmp.positionId)}</div>
                <div className='text-xs text-blue-400'>{deptName(selectedEmp.departmentId)} · {coName(selectedEmp.companyId)}</div>
              </div>
              {form.type && (
                <div className='ml-auto text-right flex-shrink-0'>
                  <div className='text-xs text-gray-500'>Sisa saldo</div>
                  <div className='text-xl font-bold text-blue-700'>
                    {(leaveTypes.find(t => t.name === form.type)?.maxDays ?? 0) - leaveUsed(+form.empId, form.type)} hari
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leave balance for selected employee */}
          {selectedEmp && (
            <div className='grid grid-cols-3 gap-2 mb-4'>
              {activeTypes.map(lt => {
                const used = leaveUsed(+form.empId, lt.name)
                const sisa = lt.maxDays - used
                return (
                  <div key={lt.id} className='border border-gray-100 rounded-lg px-3 py-2 text-center'>
                    <div className='text-xs text-gray-500 truncate'>{lt.name}</div>
                    <div className='text-lg font-bold text-gray-700'>{sisa}
                      <span className='text-xs font-normal text-gray-400'>/{lt.maxDays}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className='grid grid-cols-2 gap-4'>
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
            <p className='text-xs text-blue-600 font-semibold mt-2'>
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

      {/* History — all employees */}
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>
          📄 Semua Riwayat Cuti
          <span className='ml-2 text-xs font-normal text-gray-400'>({allLeaves.length} pengajuan)</span>
        </h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {['Karyawan','Departemen','Jenis','Mulai','Selesai','Hari','Keterangan','Status'].map(h => (
                  <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allLeaves.length ? allLeaves.map(l => {
                const emp      = employees.find(e => e.id === l.userId)
                const isSelected = selectedLeaveId === l.id
                return (
                  <tr key={l.id}
                    onClick={() => setSelectedLeaveId(l.id)}
                    className={`border-t border-gray-100 cursor-pointer transition ${isSelected ? 'bg-red-50 border-l-2 border-l-red-400' : 'hover:bg-gray-50'}`}>
                    <td className='px-4 py-2.5 font-medium'>{l.name}</td>
                    <td className='px-4 py-2.5 text-gray-500 text-xs'>{emp ? deptName(emp.departmentId) : '—'}</td>
                    <td className='px-4 py-2.5'>{l.type}</td>
                    <td className='px-4 py-2.5'>{l.start}</td>
                    <td className='px-4 py-2.5'>{l.end}</td>
                    <td className='px-4 py-2.5'>{daysBetween(l.start, l.end)}</td>
                    <td className='px-4 py-2.5 text-gray-500'>{l.note || '—'}</td>
                    <td className='px-4 py-2.5'>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge(l.status)}`}>{l.status}</span>
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={8} className='px-4 py-8 text-center text-gray-400 text-sm'>Belum ada pengajuan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow Monitor — hanya tampilkan 1 baris yang dipilih */}
      {selectedLeaveId && (
        <div className='mt-6'>
          <WorkflowMonitor
            leaves={allLeaves.filter(l => l.id === selectedLeaveId)}
            title='Workflow Monitor'
            expandedId={selectedLeaveId}
          />
        </div>
      )}
    </div>
  )
}
