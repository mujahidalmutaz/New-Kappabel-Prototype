'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { useAuthStore }              from '@/store/authStore'
import { useEmployeeStore }          from '@/store/employeeStore'
import { usePersonnelActionStore, PA_ACTION_ICON, PA_ACTION_COLOR, PA_STATUS_COLOR } from '@/store/personnelActionStore'
import { useT } from '@/store/languageStore'

const ACTIONS = [
  { key: 'Promote',                href: 'promote',                color: 'border-red-200 hover:border-red-400', bg: 'bg-red-50' },
  { key: 'Transfer',               href: 'transfer',               color: 'border-blue-200 hover:border-blue-400',     bg: 'bg-blue-50' },
  { key: 'Demote',                 href: 'demote',                 color: 'border-orange-200 hover:border-orange-400', bg: 'bg-orange-50' },
  { key: 'Transfer Across Company',href: 'transfer-across-company',color: 'border-indigo-200 hover:border-indigo-400', bg: 'bg-indigo-50' },
  { key: 'Terminate',              href: 'terminate',              color: 'border-red-200 hover:border-red-400',       bg: 'bg-red-50' },
  { key: 'Rehire',                 href: 'rehire',                 color: 'border-green-200 hover:border-green-400',   bg: 'bg-green-50' },
  { key: 'Change Employment Type', href: 'change-employment-type', color: 'border-cyan-200 hover:border-cyan-400',     bg: 'bg-cyan-50' },
  { key: 'Extend Contract',        href: 'extend-contract',        color: 'border-teal-200 hover:border-teal-400',     bg: 'bg-teal-50' },
]

export default function MSSPersonnelActionIndex() {
  const t = useT()
  const { currentUser }  = useAuthStore()
  const { employees }    = useEmployeeStore()
  const { pas }          = usePersonnelActionStore()

  const teamIds = useMemo(() => {
    if (currentUser?.role === 'superadmin') return employees.map(e => e.id)
    return employees.filter(e => e.managerId === currentUser?.id).map(e => e.id)
  }, [employees, currentUser])

  const teamPAs = useMemo(() =>
    pas.filter(p => teamIds.includes(p.employeeId)),
    [pas, teamIds]
  )

  const totalPending  = teamPAs.filter(p => p.status === 'Submitted').length
  const totalApproved = teamPAs.filter(p => p.status === 'Approved').length
  const totalRejected = teamPAs.filter(p => p.status === 'Rejected').length
  const totalApplied  = teamPAs.filter(p => p.status === 'Applied').length

  return (
    <div className='min-h-screen bg-gray-50'>

      {/* Header */}
      <div className='bg-gradient-to-r from-violet-700 to-red-600 text-white px-8 py-6'>
        <h1 className='text-2xl font-bold'>Personnel Action Approval</h1>
        <p className='text-violet-200 text-sm mt-0.5'>
          {t('Tinjau dan setujui Personnel Action tim Anda','Review and approve your team\'s Personnel Actions')}
        </p>
      </div>

      {/* Action Cards */}
      <div className='px-8 py-6'>
        <div className='grid grid-cols-4 gap-4'>
          {ACTIONS.map(a => {
            const pendingCount  = teamPAs.filter(p => p.action === a.key && p.status === 'Submitted').length
            const approvedCount = teamPAs.filter(p => p.action === a.key && p.status === 'Approved').length
            const totalCount    = teamPAs.filter(p => p.action === a.key).length
            return (
              <Link key={a.key} href={`/mss/personnel-action/${a.href}`}
                className={`bg-white rounded-2xl border-2 ${a.color} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex flex-col gap-3`}>
                <div className='flex items-start justify-between'>
                  <span className='text-3xl'>{PA_ACTION_ICON[a.key]}</span>
                  <div className='flex flex-col items-end gap-1'>
                    {pendingCount > 0 && (
                      <span className='text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full'>
                        {pendingCount} {t('pending','pending')}
                      </span>
                    )}
                    {approvedCount > 0 && (
                      <span className='text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full'>
                        {approvedCount} {t('disetujui','approved')}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${PA_ACTION_COLOR[a.key]}`}>{a.key}</span>
                </div>
                <p className='text-xl font-bold text-gray-900 mt-auto'>
                  {totalCount} <span className='text-sm font-normal text-gray-400'>PA</span>
                </p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Submitted */}
      <div className='px-8 pb-8'>
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
          <div className='px-5 py-4 border-b border-gray-50 flex items-center justify-between'>
            <p className='font-bold text-gray-900'>⏳ {t('PA Menunggu Persetujuan','PA Pending Approval')}</p>
            <p className='text-xs text-gray-400'>{totalPending} {t('item','items')}</p>
          </div>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50 border-b'>
                {['PA Number', t('Karyawan','Employee'), 'Action', 'Effective Date', 'Status', ''].map(h => (
                  <th key={h} className='text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-50'>
              {teamPAs.filter(p => p.status === 'Submitted').length === 0 ? (
                <tr>
                  <td colSpan={6} className='text-center py-10 text-gray-400 text-sm'>
                    {t('Tidak ada PA yang menunggu persetujuan Anda','No PA waiting for your approval')}
                  </td>
                </tr>
              ) : [...teamPAs]
                  .filter(p => p.status === 'Submitted')
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map(pa => {
                    const e   = employees.find(x => x.id === pa.employeeId)
                    const act = ACTIONS.find(x => x.key === pa.action)
                    return (
                      <tr key={pa.id} className='hover:bg-gray-50/50'>
                        <td className='px-4 py-3'>
                          <span className='font-mono text-xs font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded'>{pa.paNumber}</span>
                        </td>
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-2'>
                            <span>{e?.gender === 'Female' ? '👩' : '👨'}</span>
                            <span className='font-medium text-gray-800'>{e?.name || '—'}</span>
                          </div>
                        </td>
                        <td className='px-4 py-3'>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${PA_ACTION_COLOR[pa.action] || 'bg-gray-100 text-gray-600'}`}>
                            {PA_ACTION_ICON[pa.action]} {pa.action}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-xs text-gray-600'>{pa.effectiveDate || '—'}</td>
                        <td className='px-4 py-3'>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${PA_STATUS_COLOR[pa.status] || ''}`}>{pa.status}</span>
                        </td>
                        <td className='px-4 py-3 text-right'>
                          {act && (
                            <Link href={`/mss/personnel-action/${act.href}`}
                              className='text-xs px-3 py-1.5 text-violet-600 bg-violet-50 hover:bg-violet-100 rounded-lg font-semibold transition-colors'>
                              {t('Tinjau','Review')} →
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
