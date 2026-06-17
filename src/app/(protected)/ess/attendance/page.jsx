'use client'
import { useAuthStore }       from '@/store/authStore'
import { useAttendanceStore } from '@/store/attendanceStore'
import { useT }               from '@/store/languageStore'
import { ATTENDANCE_STATUS_STYLE } from '@/utils/attendanceUtils'

export default function AttendancePage() {
  const t = useT()
  const { currentUser } = useAuthStore()
  const { records }     = useAttendanceStore()

  const mine = records
    .filter(r => r.userId === currentUser?.id)
    .sort((a, b) => b.date.localeCompare(a.date))

  const summary = {
    Present: mine.filter(r => r.status === 'Present').length,
    Late:    mine.filter(r => r.status === 'Late').length,
    Absent:  mine.filter(r => r.status === 'Absent').length,
    Leave:   mine.filter(r => r.status === 'Leave').length,
  }

  const statusLabel = {
    Present: t('Hadir', 'Present'),
    Late:    t('Terlambat', 'Late'),
    Absent:  t('Absen', 'Absent'),
    Leave:   t('Cuti', 'Leave'),
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('My Attendance', 'My Attendance')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Rekap kehadiran kamu 14 hari terakhir.', 'Your attendance summary for the last 14 days.')}</p>

      {/* Summary */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {Object.entries(summary).map(([status, count]) => (
          <div key={status} className='bg-white rounded-xl p-5 shadow-sm text-center'>
            <div className='text-3xl font-bold text-gray-800'>{count}</div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-2 inline-block ${ATTENDANCE_STATUS_STYLE[status]}`}>
              {statusLabel[status]}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('📅 Rincian Kehadiran', '📅 Attendance Detail')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {[t('Tanggal', 'Date'), t('Check In', 'Check In'), t('Check Out', 'Check Out'), 'Status'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mine.length ? mine.map(r => (
                <tr key={r.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-2.5 text-gray-700'>{r.date}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{r.checkIn || '—'}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{r.checkOut || '—'}</td>
                  <td className='px-4 py-2.5'>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ATTENDANCE_STATUS_STYLE[r.status] || ''}`}>
                      {statusLabel[r.status] ?? r.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className='px-4 py-8 text-center text-gray-400 text-sm'>
                    {t('Belum ada data kehadiran.', 'No attendance records yet.')}
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
