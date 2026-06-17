'use client'
import { useState, useEffect } from 'react'
import { useAuthStore }        from '@/store/authStore'
import { useLeaveStore }       from '@/store/leaveStore'
import { useEmployeeStore }    from '@/store/employeeStore'
import { daysBetween }         from '@/utils/dateUtils'
import { canActOnStep, LEAVE_STATUS_BADGE } from '@/utils/leaveUtils'
import WorkflowMonitor         from '@/components/WorkflowMonitor'
import { useT }                from '@/store/languageStore'

export default function ApproveLeavePage() {
  const t = useT()
  const { currentUser }                     = useAuthStore()
  const { leaves, approveStep, rejectStep } = useLeaveStore()
  const { employees }                       = useEmployeeStore()

  const [selectedLeaveId, setSelectedLeaveId] = useState(null)
  const [noteMap,  setNoteMap ] = useState({})
  const [rejectId, setRejectId] = useState(null)

  const actionable = leaves.filter(l => {
    const pendingStep = (l.steps || []).find(s => s.status === 'Pending')
    return pendingStep && canActOnStep(pendingStep, l, currentUser, employees)
  })

  const acted = leaves.filter(l =>
    (l.steps || []).some(s => s.approverId === currentUser?.id) &&
    !actionable.find(a => a.id === l.id)
  )

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
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Approve Leave', 'Approve Leave')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Review dan setujui pengajuan cuti sesuai level approval Anda.', 'Review and approve leave requests at your approval level.')}</p>

      {/* Pending approval */}
      <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('⏳ Menunggu Persetujuan', '⏳ Pending Approval')} ({actionable.length})</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {[t('Karyawan','Employee'), t('Jenis','Type'), t('Mulai','Start'), t('Selesai','End'), t('Hari','Days'), t('Keterangan','Note'), t('Step','Step'), t('Aksi','Action')].map((h,i) => (
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
                          {t('Step', 'Step')} {pendingStep.level} · {pendingStep.label}
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-2.5' onClick={e => e.stopPropagation()}>
                      {isRejecting ? (
                        <div className='flex items-center gap-2'>
                          <input
                            value={noteMap[l.id] || ''}
                            onChange={e => setNoteMap(m => ({ ...m, [l.id]: e.target.value }))}
                            placeholder={t('Alasan penolakan…', 'Rejection reason…')}
                            className='px-2 py-1 border border-gray-200 rounded text-xs outline-none focus:border-red-400 w-36'
                          />
                          <button onClick={() => handleReject(l)}
                            className='px-2.5 py-1 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600'>
                            {t('Tolak', 'Reject')}
                          </button>
                          <button onClick={() => setRejectId(null)}
                            className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200'>
                            {t('Batal', 'Cancel')}
                          </button>
                        </div>
                      ) : (
                        <div className='flex gap-2'>
                          <button onClick={() => handleApprove(l)}
                            className='px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition'>
                            ✓ {t('Approve', 'Approve')}
                          </button>
                          <button onClick={() => { setRejectId(l.id); setNoteMap(m => ({ ...m, [l.id]: '' })) }}
                            className='px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition'>
                            ✗ {t('Reject', 'Reject')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={8} className='px-4 py-8 text-center text-gray-400 text-sm'>{t('Tidak ada pengajuan pending.', 'No pending approvals.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision history */}
      <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('📋 Riwayat Keputusan', '📋 Decision History')} ({acted.length})</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {[t('Karyawan','Employee'), t('Jenis','Type'), t('Tanggal','Date'), t('Hari','Days'), t('Status Keseluruhan','Overall Status')].map((h,i) => (
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
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LEAVE_STATUS_BADGE[l.status] || 'bg-gray-100 text-gray-500'}`}>
                      {l.status}
                    </span>
                    {l.status === 'Pending' && (
                      <span className='ml-2 text-xs text-amber-600 font-medium'>
                        {t('⏳ Menunggu approver berikutnya', '⏳ Waiting for next approver')}
                      </span>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={5} className='px-4 py-8 text-center text-gray-400 text-sm'>{t('Belum ada riwayat.', 'No history yet.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLeave && (
        <WorkflowMonitor
          leaves={[selectedLeave]}
          title={t('Workflow Monitor', 'Workflow Monitor')}
          expandedId={selectedLeaveId}
        />
      )}
    </div>
  )
}
