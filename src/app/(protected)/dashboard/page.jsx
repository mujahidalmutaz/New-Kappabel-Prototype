'use client'
import { useAuthStore } from '@/store/authStore'
import { useLeaveStore } from '@/store/leaveStore'
import { useEmployeeStore } from '@/store/employeeStore'
import { useHolidayStore } from '@/store/holidayStore'
import { workingDays } from '@/utils/dateUtils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useT } from '@/store/languageStore'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS  = { Approved:'#10b981', Pending:'#f59e0b', Rejected:'#ef4444' }

function StatCard({ label, value, color }) {
  const borders = {
    blue:'#3b82f6', green:'#10b981', orange:'#f59e0b',
    purple:'#8b5cf6', red:'#ef4444', teal:'#14b8a6',
  }
  return (
    <div className='bg-white rounded-xl p-5 shadow-sm' style={{ borderLeft: `4px solid ${borders[color]}` }}>
      <div className='text-2xl font-bold text-gray-800'>{value}</div>
      <div className='text-xs text-gray-500 mt-1'>{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const t = useT()
  const { currentUser }  = useAuthStore()
  const { leaves }       = useLeaveStore()
  const { employees }    = useEmployeeStore()
  const { holidays }     = useHolidayStore()

  const now      = new Date()
  const year     = now.getFullYear()
  const month    = now.getMonth()

  const totalEmp  = employees.filter(e => e.status === 'Active').length
  const pending   = leaves.filter(l => l.status === 'Pending').length
  const approved  = leaves.filter(l => l.status === 'Approved').length
  const rejected  = leaves.filter(l => l.status === 'Rejected').length
  const wdays     = workingDays(year, month, holidays, 'ID')
  const holThisMonth = holidays.filter(h =>
    h.country === 'ID' && new Date(h.date).getMonth() === month && new Date(h.date).getFullYear() === year
  )

  // Bar chart data
  const barData = MONTHS.map((m, i) => ({
    month: m,
    total: leaves.filter(l => new Date(l.start).getMonth() === i).length,
  }))

  // Pie chart data
  const pieData = [
    { name: 'Approved', value: approved },
    { name: 'Pending',  value: pending  },
    { name: 'Rejected', value: rejected },
  ].filter(d => d.value > 0)

  const recentLeaves = [...leaves].reverse().slice(0, 5)

  const badgeStyle = (status) => ({
    Approved: 'bg-green-100 text-green-700',
    Pending:  'bg-yellow-100 text-yellow-700',
    Rejected: 'bg-red-100 text-red-700',
  }[status] || '')

  return (
    <div>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>
          {t('Selamat datang','Welcome')}, {currentUser?.name}!
        </h1>
        <p className='text-gray-500 text-sm mt-1'>
          {t('Berikut ringkasan aktivitas perusahaan hari ini.','Here is a summary of today\'s company activities.')}
        </p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6'>
        <StatCard label={t('Karyawan Aktif','Active Employees')}    value={totalEmp}  color='blue'   />
        <StatCard label={t('Cuti Pending','Pending Leaves')}      value={pending}   color='orange' />
        <StatCard label={t('Cuti Disetujui','Approved Leaves')}    value={approved}  color='green'  />
        <StatCard label={t('Cuti Ditolak','Rejected Leaves')}      value={rejected}  color='red'    />
        <StatCard label={t('Hari Kerja Bulan Ini','Working Days This Month')} value={wdays}  color='purple' />
        <StatCard label={t('Libur Bulan Ini','Holidays This Month')}   value={holThisMonth.length} color='teal' />
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>

        {/* Bar Chart */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>
            {t('📈 Pengajuan Cuti per Bulan','📈 Leave Requests per Month')} ({year})
          </h2>
          <ResponsiveContainer width='100%' height={180}>
            <BarChart data={barData}>
              <XAxis dataKey='month' tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey='total' fill='#8b5cf6' radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>
            {t('🥧 Status Cuti Keseluruhan','🥧 Overall Leave Status')}
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width='100%' height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx='50%' cy='45%'
                  innerRadius={52} outerRadius={76}
                  dataKey='value'
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Legend verticalAlign='bottom' height={36}
                  formatter={(value, entry) => (
                    <span style={{ color: '#374151', fontSize: 12 }}>
                      {value}: <strong>{entry.payload.value}</strong>
                    </span>
                  )}
                />
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className='flex items-center justify-center h-40 text-gray-400 text-sm'>
              {t('Belum ada data cuti','No leave data yet')}
            </div>
          )}
        </div>
      </div>

      {/* Recent Leaves */}
      <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('📋 Pengajuan Cuti Terbaru','📋 Recent Leave Requests')}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                <th className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{t('Karyawan','Employee')}</th>
                <th className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{t('Jenis','Type')}</th>
                <th className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{t('Tanggal','Date')}</th>
                <th className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLeaves.map(l => (
                <tr key={l.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-2.5 font-medium text-gray-700'>{l.name}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{l.type}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{l.start} → {l.end}</td>
                  <td className='px-4 py-2.5'>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeStyle(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentLeaves.length === 0 && (
                <tr>
                  <td colSpan={4} className='px-4 py-8 text-center text-gray-400 text-sm'>
                    {t('Belum ada pengajuan cuti.','No leave requests yet.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Holidays This Month */}
      {holThisMonth.length > 0 && (
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>
            {t('🎌 Hari Libur','🎌 Holidays')} {MONTHS[month]} {year}
          </h2>
          <div className='flex flex-wrap gap-3'>
            {holThisMonth.map(h => (
              <div key={h.id} className='bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5'>
                <div className='text-xs font-bold text-blue-700'>{h.date}</div>
                <div className='text-sm text-gray-700'>{h.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}