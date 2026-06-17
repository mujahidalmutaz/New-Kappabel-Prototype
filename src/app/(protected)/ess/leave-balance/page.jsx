'use client'
import { useAuthStore }  from '@/store/authStore'
import { useLeaveStore } from '@/store/leaveStore'
import { daysBetween }   from '@/utils/dateUtils'
import { useT } from '@/store/languageStore'

export default function LeaveBalancePage() {
  const t = useT()
  const { currentUser }           = useAuthStore()
  const { leaves, leaveTypes }    = useLeaveStore()

  const myLeaves = leaves.filter(l => l.userId === currentUser?.id)

  const used = (typeName) =>
    myLeaves
      .filter(l => l.type === typeName && l.status === 'Approved')
      .reduce((sum, l) => sum + daysBetween(l.start, l.end), 0)

  const badge = (s) => ({
    Approved: 'bg-green-100 text-green-700',
    Pending:  'bg-yellow-100 text-yellow-700',
    Rejected: 'bg-red-100 text-red-700',
  }[s] || '')

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Leave Balance</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Saldo dan riwayat cuti kamu tahun ini.','Your leave balance and history for this year.')}</p>

      {/* Balance cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        {leaveTypes.filter(t => t.active).map(lt => {
          const u    = used(lt.name)
          const sisa = lt.maxDays - u
          const pct  = Math.min(100, Math.round((u / lt.maxDays) * 100))
          return (
            <div key={lt.id} className='bg-white rounded-xl p-5 shadow-sm'>
              <div className='text-xs font-semibold text-gray-500 mb-1'>{lt.name}</div>
              <div className='flex items-end gap-1 mb-2'>
                <span className='text-3xl font-bold text-gray-800'>{sisa}</span>
                <span className='text-sm text-gray-400 mb-1'>/ {lt.maxDays} {t('hari','days')}</span>
              </div>
              <div className='h-2 bg-gray-100 rounded-full'>
                <div
                  className='h-2 rounded-full transition-all'
                  style={{
                    width: `${pct}%`,
                    background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>
              <div className='flex justify-between text-xs text-gray-400 mt-1'>
                <span>{t('Terpakai:','Used:')} {u}</span>
                <span>{t('Sisa:','Remaining:')} {sisa}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* History */}
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>📄 Riwayat Cuti</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {['Jenis','Mulai','Selesai','Hari','Keterangan','Status'].map(h => (
                  <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myLeaves.length ? myLeaves.map(l => (
                <tr key={l.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-2.5 font-medium text-gray-700'>{l.type}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{l.start}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{l.end}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{daysBetween(l.start, l.end)}</td>
                  <td className='px-4 py-2.5 text-gray-500'>{l.note || '-'}</td>
                  <td className='px-4 py-2.5'>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className='px-4 py-8 text-center text-gray-400 text-sm'>
                    Belum ada riwayat cuti.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
