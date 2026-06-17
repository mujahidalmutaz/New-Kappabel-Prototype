'use client'
import { useState, useEffect }  from 'react'
import { useAuthStore }          from '@/store/authStore'
import { useLeaveStore }         from '@/store/leaveStore'
import { useEmployeeStore }      from '@/store/employeeStore'
import { daysBetween }           from '@/utils/dateUtils'
import WorkflowMonitor           from '@/components/WorkflowMonitor'
import { useT } from '@/store/languageStore'

// Resolve supervisor chain
function getDirectSupervisorId(userId, employees) {
  return employees.find(e => e.id === userId)?.managerId ?? null
}
function getIndirectSupervisorId(userId, employees) {
  const directId = getDirectSupervisorId(userId, employees)
  return directId ? getDirectSupervisorId(directId, employees) : null
}

function canActOnStep(step, leave, currentUser, employees) {
  if (step.status !== 'Pending') return false
  const uid  = currentUser?.id
  const role = currentUser?.role
  if (step.delegatedTo && step.delegatedTo === uid) return true
  const rId  = leave.userId   // approval chain based on the employee, not who submitted
  switch (step.type) {
    case 'supervisor':        return getDirectSupervisorId(rId, employees)   === uid
    case 'indirect_sup':      return getIndirectSupervisorId(rId, employees) === uid
    case 'supervisor_pc53':
    case 'indirect_sup_pc53': return role === 'manager' || role === 'superadmin'
    case 'role':              return role === 'hr'       || role === 'superadmin'
    case 'userlist':
    case 'employee':          return role === 'hr'       || role === 'superadmin'
    default:                  return role === 'superadmin'
  }
}

const BADGE = (s) => ({
  Approved:  'bg-green-100 text-green-700',
  Pending:   'bg-yellow-100 text-yellow-700',
  Rejected:  'bg-red-100 text-red-700',
  Withdrawn: 'bg-gray-100 text-gray-500',
}[s] || 'bg-gray-100 text-gray-500')

export default function ApproveLeavePage() {
  const t = useT()
  const { currentUser }              = useAuthStore()
  const { leaves, approveStep, rejectStep } = useLeaveStore()
  const { employees }                = useEmployeeStore()

  const [selectedLeaveId, setSelectedLeaveId] = useState(null)
  const [noteMap,  setNoteMap  ] = useState({})   // { [leaveId]: note }
  const [rejectId, setRejectId ] = useState(null) // leaveId being rejected (show note input)

  // Leaves where current user can act on the current pending step
  const actionable = leaves.filter(l => {
    const pendingStep = (l.steps || []).find(s => s.status === 'Pending')
    return pendingStep && canActOnStep(pendingStep, l, currentUser, employees)
  })

  // Leaves where current user has already acted on any step
  const acted = leaves.filter(l =>
    (l.steps || []).some(s => s.approverId === currentUser?.id) &&
    !actionable.find(a => a.id === l.id)
  )

  // Auto-select first actionable, or first acted
  useEffect(() => {
    const first = actionable[0] ?? acted[0]
    if (first && !selectedLeaveId) setSelectedLeaveId(first.id)
  }, [leaves])

  const handleApprove = (l) => {
    const step = (l.steps || []).find(s => s.status === 'Pending')
    if (!step) return
    approveStep(l.id, step.level, currentUser.id, currentUser.name, noteMap[l.id] || '')
    setNoteMap(m => ({ ...m, [l.id]: '' }))
  }

  const handleReject = (l) => {
    const step = (l.steps || []).find(s => s.status === 'Pending')
    if (!step) return
    rejectStep(l.id, step.level, currentUser.id, currentUser.name, noteMap[l.id] || '')
    setNoteMap(m => ({ ...m, [l.id]: '' }))
    setRejectId(null)
  }

  const selectedLeave = [...actionable, ...acted].find(l => l.id === selectedLeaveId) ?? null

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Approve Leave</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Review dan setujui pengajuan cuti sesuai level approval Anda.','Review and approve leave requests at your approval level.')}</p>

      {/* ── Menunggu Persetujuan ── */}
      <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('⏳ Menunggu Persetujuan','⏳ Pending Approval')} ({actionable.length})</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {[t('Karyawan','Employee'),t('Jenis','Type'),t('Mulai','Start'),t('Selesai','End'),t('Hari','Days'),t('Keterangan','Note'),'Step',t('Aksi','Action')].map((h,i) => (
                  <th key={i} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actionable.length ? actionable.map(l => {
                const pendingStep = (l.steps || []).find(s => s.status === 'Pending')
                const isRejecting = rejectId === l.id
                return (
                  <tr key={l.id}
                    onClick={() => setSelectedLeaveId(l.id)}
                    className={`border-t border-gray-100 cursor-pointer transition ${selectedLeaveId === l.id ? 'bg-red-50 border-l-2 border-l-red-400' : 'hover:bg-gray-50'}`}>
                    <td className='px-4 py-2.5 font-medium'>{l.name}</td>
                    <td className='px-4 py-2.5'>{l.type}</td>
                    <td className='px-4 py-2.5'>{l.start}</td>
                    <td className='px-4 py-2.5'>{l.end}</td>
                    <td className='px-4 py-2.5'>{daysBetween(l.start, l.end)}</td>
                    <td className='px-4 py-2.5 text-gray-500'>{l.note || '—'}</td>
                    <td className='px-4 py-2.5'>
                      {pendingStep && (
                        <span className='text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full'>
                          Step {pendingStep.level} · {pendingStep.label}
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-2.5' onClick={e => e.stopPropagation()}>
                      {isRejecting ? (
                        <div className='flex items-center gap-2'>
                          <input
                            value={noteMap[l.id] || ''}
                            onChange={e => setNoteMap(m => ({ ...m, [l.id]: e.target.value }))}
                            placeholder={t('Alasan penolakan…','Rejection reason…')}
                            className='px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:border-red-400 w-36'
                          />
                          <button onClick={() => handleReject(l)}
                            className='px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600'>
                            Tolak
                          </button>
                          <button onClick={() => setRejectId(null)}
                            className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200'>
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div className='flex gap-2'>
                          <button onClick={() => handleApprove(l)}
                            className='px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition'>
                            ✓ Approve
                          </button>
                          <button onClick={() => { setRejectId(l.id); setNoteMap(m => ({ ...m, [l.id]: '' })) }}
                            className='px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition'>
                            ✗ Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={8} className='px-4 py-8 text-center text-gray-400 text-sm'>Tidak ada pengajuan pending.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Riwayat Keputusan ── */}
      <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('📋 Riwayat Keputusan','📋 Decision History')} ({acted.length})</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {[t('Karyawan','Employee'),t('Jenis','Type'),t('Tanggal','Date'),t('Hari','Days'),t('Status Keseluruhan','Overall Status')].map((h,i) => (
                  <th key={i} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {acted.length ? acted.map(l => (
                <tr key={l.id}
                  onClick={() => setSelectedLeaveId(l.id)}
                  className={`border-t border-gray-100 cursor-pointer transition ${selectedLeaveId === l.id ? 'bg-red-50 border-l-2 border-l-red-400' : 'hover:bg-gray-50'}`}>
                  <td className='px-4 py-2.5 font-medium'>{l.name}</td>
                  <td className='px-4 py-2.5'>{l.type}</td>
                  <td className='px-4 py-2.5'>{l.start} → {l.end}</td>
                  <td className='px-4 py-2.5'>{daysBetween(l.start, l.end)}</td>
                  <td className='px-4 py-2.5'>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE(l.status)}`}>
                      {l.status}
                    </span>
                    {l.status === 'Pending' && (
                      <span className='ml-2 text-xs text-amber-600 font-medium'>
                        {t('⏳ Menunggu approver berikutnya','⏳ Waiting for next approver')}
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className='px-4 py-8 text-center text-gray-400 text-sm'>Belum ada riwayat.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Workflow Monitor ── */}
      {selectedLeave && (
        <WorkflowMonitor
          leaves={[selectedLeave]}
          title='Workflow Monitor'
          expandedId={selectedLeaveId}
        />
      )}
    </div>
  )
}
