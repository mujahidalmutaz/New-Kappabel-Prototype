'use client'
import { useState }         from 'react'
import { useAuthStore }     from '@/store/authStore'
import { useLeaveStore }    from '@/store/leaveStore'
import { useWorkflowStore } from '@/store/workflowStore'
import { daysBetween }      from '@/utils/dateUtils'
import { calcLeaveUsed, LEAVE_STATUS_BADGE, validateLeaveForm } from '@/utils/leaveUtils'
import WorkflowMonitor      from '@/components/WorkflowMonitor'
import { useT }             from '@/store/languageStore'

export default function ApplyLeavePage() {
  const t = useT()
  const { currentUser }                                   = useAuthStore()
  const { leaves, leaveTypes, submitLeave, withdrawLeave } = useLeaveStore()
  const { getLevelsForPage }                              = useWorkflowStore()

  const [form, setForm]           = useState({ type: '', start: '', end: '', note: '' })
  const [msg,  setMsg]            = useState(null)
  const [withdrawTarget, setWithdrawTarget] = useState(null) // leave being withdrawn

  const myLeaves   = leaves.filter(l => l.userId === currentUser?.id)
  const activeTypes = leaveTypes.filter(lt => lt.active)

  const [selectedLeaveId, setSelectedLeaveId] = useState(() => myLeaves[0]?.id ?? null)

  const handleSubmit = () => {
    const err = validateLeaveForm(
      { type: form.type, start: form.start, end: form.end, empId: currentUser?.id },
      leaves, leaveTypes, t
    )
    if (err) { setMsg({ type: 'error', text: err }); return }
    submitLeave(
      { userId: currentUser.id, name: currentUser.name, workflowName: 'Apply Leave', ...form },
      getLevelsForPage('Apply Leave')
    )
    setForm({ type: '', start: '', end: '', note: '' })
    setMsg({ type: 'success', text: t('Pengajuan cuti berhasil dikirim!', 'Leave request submitted successfully!') })
    setTimeout(() => setMsg(null), 3000)
    setTimeout(() => {
      const latest = useLeaveStore.getState().leaves.filter(l => l.userId === currentUser.id).at(-1)
      if (latest) setSelectedLeaveId(latest.id)
    }, 50)
  }

  const canWithdraw = (l) => {
    if (l.status !== 'Pending') return false
    return !(l.steps || []).some(s => s.status === 'Approved' || s.status === 'Rejected')
  }

  const confirmWithdraw = () => {
    if (!withdrawTarget) return
    withdrawLeave(withdrawTarget.id)
    setWithdrawTarget(null)
    setMsg({ type: 'success', text: t('Pengajuan cuti berhasil di-withdraw.', 'Leave request withdrawn successfully.') })
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Apply Leave', 'Apply Leave')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Ajukan cuti dan lihat riwayat pengajuanmu.', 'Submit leave and view your submission history.')}</p>

      {/* Withdraw confirmation inline banner */}
      {withdrawTarget && (
        <div className='mb-4 bg-orange-50 border border-orange-200 rounded-xl px-5 py-3.5 flex items-center gap-4'>
          <span className='text-orange-600 text-sm font-medium flex-1'>
            {t(
              `Withdraw pengajuan cuti "${withdrawTarget.type}" (${withdrawTarget.start} — ${withdrawTarget.end})?`,
              `Withdraw "${withdrawTarget.type}" leave request (${withdrawTarget.start} — ${withdrawTarget.end})?`
            )}
          </span>
          <button onClick={confirmWithdraw}
            className='px-4 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition'>
            {t('Ya, Withdraw', 'Yes, Withdraw')}
          </button>
          <button onClick={() => setWithdrawTarget(null)}
            className='px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200 transition'>
            {t('Batal', 'Cancel')}
          </button>
        </div>
      )}

      {/* Balance cards */}
      <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('📊 Saldo Cuti', '📊 Leave Balance')}</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {activeTypes.map(lt => {
            const { approved, pending } = calcLeaveUsed(leaves, currentUser?.id, lt.name)
            const reserved = approved + pending
            const sisa = lt.maxDays - reserved
            const pct  = Math.round((reserved / lt.maxDays) * 100)
            return (
              <div key={lt.id} className='border border-gray-100 rounded-lg p-4'>
                <div className='text-xs font-semibold text-gray-500 mb-1'>{lt.name}</div>
                <div className='text-2xl font-bold text-gray-800'>{sisa}
                  <span className='text-sm font-normal text-gray-400'> / {lt.maxDays}</span>
                </div>
                <div className='h-1.5 bg-gray-100 rounded-full mt-2'>
                  <div className='h-1.5 rounded-full' style={{
                    width: `${pct}%`,
                    background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981'
                  }} />
                </div>
                <div className='text-xs text-gray-400 mt-1'>{t('Terpakai', 'Used')}: {approved} {t('hari', 'days')}</div>
                {pending > 0 && (
                  <div className='text-xs text-amber-500 mt-0.5'>{t('Pending', 'Pending')}: {pending} {t('hari', 'days')}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Form */}
      <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('📝 Ajukan Cuti', '📝 Submit Leave')}</h2>
        {msg && (
          <div className={`text-sm px-4 py-2.5 rounded-lg mb-4 ${msg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
            {msg.text}
          </div>
        )}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Jenis Cuti', 'Leave Type')}</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
              <option value=''>{t('-- Pilih Jenis Cuti --', '-- Select Leave Type --')}</option>
              {activeTypes.map(lt => {
                const { approved, pending } = calcLeaveUsed(leaves, currentUser?.id, lt.name)
                const sisa = lt.maxDays - approved - pending
                return (
                  <option key={lt.id} value={lt.name}>
                    {lt.name} ({t('sisa', 'remaining')}: {sisa} {t('hari', 'days')})
                  </option>
                )
              })}
            </select>
          </div>
          <div>
            <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Keterangan', 'Note')}</label>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
              placeholder={t('Opsional', 'Optional')} />
          </div>
          <div>
            <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tanggal Mulai', 'Start Date')}</label>
            <input type='date' value={form.start} onChange={e => setForm(f => ({ ...f, start: e.target.value }))}
              className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
          </div>
          <div>
            <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tanggal Selesai', 'End Date')}</label>
            <input type='date' value={form.end} onChange={e => setForm(f => ({ ...f, end: e.target.value }))}
              className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
          </div>
        </div>
        {form.start && form.end && form.end >= form.start && (
          <p className='text-xs text-red-600 font-semibold mt-2'>
            {t('Durasi', 'Duration')}: {daysBetween(form.start, form.end)} {t('hari kerja', 'working days')}
          </p>
        )}
        <button onClick={handleSubmit}
          className='mt-4 px-6 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
          style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
          {t('Ajukan Cuti', 'Submit Leave')}
        </button>
      </div>

      {/* History */}
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('📄 Riwayat Pengajuan', '📄 Submission History')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {[t('Jenis','Type'), t('Mulai','Start'), t('Selesai','End'), t('Hari','Days'), t('Keterangan','Note'), 'Status', ''].map((h,i) => (
                  <th key={i} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myLeaves.length ? myLeaves.map(l => (
                <tr key={l.id}
                  onClick={() => setSelectedLeaveId(l.id)}
                  className={`border-t border-gray-100 cursor-pointer transition ${
                    selectedLeaveId === l.id ? 'bg-red-50 border-l-2 border-l-red-400' : 'hover:bg-gray-50'
                  }`}>
                  <td className='px-4 py-2.5'>{l.type}</td>
                  <td className='px-4 py-2.5'>{l.start}</td>
                  <td className='px-4 py-2.5'>{l.end}</td>
                  <td className='px-4 py-2.5'>{daysBetween(l.start, l.end)}</td>
                  <td className='px-4 py-2.5 text-gray-500'>{l.note || '-'}</td>
                  <td className='px-4 py-2.5'>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${LEAVE_STATUS_BADGE[l.status] || ''}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className='px-4 py-2.5'>
                    {canWithdraw(l) && (
                      <button
                        onClick={e => { e.stopPropagation(); setWithdrawTarget(l) }}
                        className='text-xs font-semibold text-orange-500 hover:text-orange-700 border border-orange-200 hover:border-orange-400 px-2.5 py-1 rounded-lg hover:bg-orange-50 transition'>
                        ↩ {t('Withdraw', 'Withdraw')}
                      </button>
                    )}
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className='px-4 py-8 text-center text-gray-400 text-sm'>{t('Belum ada pengajuan.', 'No submissions yet.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLeaveId && (() => {
        const selected = myLeaves.find(l => l.id === selectedLeaveId)
        return selected ? (
          <div className='mt-6'>
            <WorkflowMonitor leaves={[selected]} title={t('Workflow Monitor', 'Workflow Monitor')} expandedId={selectedLeaveId} />
          </div>
        ) : null
      })()}
    </div>
  )
}
