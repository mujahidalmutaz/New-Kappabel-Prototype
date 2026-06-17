'use client'
import { useState }           from 'react'
import { useAttendanceStore }  from '@/store/attendanceStore'
import { useEmployeeStore }    from '@/store/employeeStore'
import { useT } from '@/store/languageStore'

const STATUS_STYLE = {
  Present: 'bg-green-100 text-green-700',
  Late:    'bg-yellow-100 text-yellow-700',
  Absent:  'bg-red-100 text-red-700',
  Leave:   'bg-blue-100 text-blue-700',
}

export default function TeamAttendancePage() {
  const t = useT()
  const { records }   = useAttendanceStore()
  const { employees } = useEmployeeStore()

  const dates = [...new Set(records.map(r => r.date))].sort((a,b) => b.localeCompare(a))
  const [selDate, setSelDate] = useState(dates[0] || '')

  const dayRecords = records.filter(r => r.date === selDate)

  const summary = (status) => dayRecords.filter(r => r.status === status).length

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Team Attendance</h1>
      <p className='text-gray-500 text-sm mb-6'>Monitor kehadiran tim per hari.</p>

      {/* Date picker */}
      <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
        <div className='flex flex-wrap gap-2'>
          {dates.map(d => (
            <button
              key={d}
              onClick={() => setSelDate(d)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                selDate === d ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {['Present','Late','Absent','Leave'].map(s => (
          <div key={s} className='bg-white rounded-xl p-5 shadow-sm text-center'>
            <div className='text-3xl font-bold text-gray-800'>{summary(s)}</div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-2 inline-block ${STATUS_STYLE[s]}`}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>👥 Detail Kehadiran — {selDate}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {['Nama','Check In','Check Out','Status'].map(h => (
                  <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.filter(e => e.status === 'Active').map(emp => {
                const rec = dayRecords.find(r => r.userId === emp.id)
                return (
                  <tr key={emp.id} className='border-t border-gray-100 hover:bg-gray-50'>
                    <td className='px-4 py-2.5 font-medium text-gray-700'>{emp.name}</td>
                    <td className='px-4 py-2.5 text-gray-600'>{rec?.checkIn  || '-'}</td>
                    <td className='px-4 py-2.5 text-gray-600'>{rec?.checkOut || '-'}</td>
                    <td className='px-4 py-2.5'>
                      {rec ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[rec.status]}`}>
                          {rec.status}
                        </span>
                      ) : (
                        <span className='text-xs text-gray-400'>No data</span>
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
