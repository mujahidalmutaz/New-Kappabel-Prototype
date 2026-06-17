'use client'
import { useState }           from 'react'
import { useAttendanceStore }  from '@/store/attendanceStore'
import { useEmployeeStore }    from '@/store/employeeStore'
import { useT }                from '@/store/languageStore'
import { ATTENDANCE_STATUS_STYLE } from '@/utils/attendanceUtils'

export default function TeamAttendancePage() {
  const t = useT()
  const { records }   = useAttendanceStore()
  const { employees } = useEmployeeStore()

  const dates = [...new Set(records.map(r => r.date))].sort((a, b) => b.localeCompare(a))
  const [selDate, setSelDate] = useState(dates[0] || '')

  const dayRecords = records.filter(r => r.date === selDate)
  const activeEmps = employees.filter(e => e.status === 'Active')

  const summary = (status) => dayRecords.filter(r => r.status === status).length

  const statusLabel = {
    Present: t('Hadir', 'Present'),
    Late:    t('Terlambat', 'Late'),
    Absent:  t('Absen', 'Absent'),
    Leave:   t('Cuti', 'Leave'),
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Team Attendance', 'Team Attendance')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Monitor kehadiran tim per hari.', 'Monitor your team attendance by day.')}</p>

      {/* Date picker */}
      <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
        <div className='text-xs font-semibold text-gray-500 mb-3'>{t('Pilih Tanggal', 'Select Date')}</div>
        <div className='flex flex-wrap gap-2'>
          {dates.length ? dates.map(d => (
            <button key={d} onClick={() => setSelDate(d)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                selDate === d ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {d}
            </button>
          )) : (
            <p className='text-xs text-gray-400'>{t('Belum ada data.', 'No data available.')}</p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {['Present', 'Late', 'Absent', 'Leave'].map(s => (
          <div key={s} className='bg-white rounded-xl p-5 shadow-sm text-center'>
            <div className='text-3xl font-bold text-gray-800'>{summary(s)}</div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-2 inline-block ${ATTENDANCE_STATUS_STYLE[s]}`}>
              {statusLabel[s]}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>
          👥 {t('Detail Kehadiran', 'Attendance Detail')} — {selDate || '—'}
        </h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {[t('Nama', 'Name'), t('Check In', 'Check In'), t('Check Out', 'Check Out'), 'Status'].map(h => (
                  <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeEmps.length ? activeEmps.map(emp => {
                const rec = dayRecords.find(r => r.userId === emp.id)
                return (
                  <tr key={emp.id} className='border-t border-gray-100 hover:bg-gray-50'>
                    <td className='px-4 py-2.5 font-medium text-gray-700'>{emp.name}</td>
                    <td className='px-4 py-2.5 text-gray-600'>{rec?.checkIn  || '—'}</td>
                    <td className='px-4 py-2.5 text-gray-600'>{rec?.checkOut || '—'}</td>
                    <td className='px-4 py-2.5'>
                      {rec ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ATTENDANCE_STATUS_STYLE[rec.status] || ''}`}>
                          {statusLabel[rec.status] ?? rec.status}
                        </span>
                      ) : (
                        <span className='text-xs text-gray-400'>{t('Tidak ada data', 'No data')}</span>
                      )}
                    </td>
                  </tr>
                )
              }) : (
                <tr><td colSpan={4} className='px-4 py-8 text-center text-gray-400 text-sm'>{t('Tidak ada karyawan aktif.', 'No active employees.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
