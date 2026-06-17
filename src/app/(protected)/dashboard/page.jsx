'use client'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useLeaveStore } from '@/store/leaveStore'
import { useEmployeeStore } from '@/store/employeeStore'
import { useHolidayStore } from '@/store/holidayStore'
import { usePersonnelActionStore } from '@/store/personnelActionStore'
import { workingDays } from '@/utils/dateUtils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useT } from '@/store/languageStore'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS  = { Approved:'#10b981', Pending:'#f59e0b', Rejected:'#ef4444' }

function StatCard({ label, value, color, href }) {
  const borders = {
    blue:'#3b82f6', green:'#10b981', orange:'#f59e0b',
    purple:'#8b5cf6', red:'#ef4444', teal:'#14b8a6', violet:'#7c3aed',
  }
  const card = (
    <div className='bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition' style={{ borderLeft: `4px solid ${borders[color]}` }}>
      <div className='text-2xl font-bold text-gray-800'>{value}</div>
      <div className='text-xs text-gray-500 mt-1'>{label}</div>
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}

function QuickAction({ icon, label, href, color }) {
  return (
    <Link href={href}
      className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 ${color} bg-white hover:shadow-md hover:-translate-y-0.5 transition-all text-center`}>
      <span className='text-2xl'>{icon}</span>
      <span className='text-xs font-semibold text-gray-700 leading-tight'>{label}</span>
    </Link>
  )
}

export default function DashboardPage() {
  const t = useT()
  const { currentUser }  = useAuthStore()
  const { leaves }       = useLeaveStore()
  const { employees }    = useEmployeeStore()
  const { holidays }     = useHolidayStore()
  const { pas }          = usePersonnelActionStore?.() ?? { pas: [] }

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

  // New hires this month
  const newHiresThisMonth = employees.filter(e => {
    if (!e.joinDate) return false
    const d = new Date(e.joinDate)
    return d.getFullYear() === year && d.getMonth() === month
  })

  // Contract expiry warnings: contracts expiring within 30 days
  const in30 = new Date(now); in30.setDate(in30.getDate() + 30)
  const expiringContracts = employees.filter(e => {
    if (e.employmentType !== 'Contract' || !e.contractEndDate) return false
    const end = new Date(e.contractEndDate)
    return end >= now && end <= in30
  }).sort((a, b) => new Date(a.contractEndDate) - new Date(b.contractEndDate))

  // PA stats
  const paPending = pas?.filter(p => p.status === 'Submitted').length ?? 0
  const paApplied = pas?.filter(p => p.status === 'Applied').length ?? 0

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

  const r = currentUser?.role
  const canHR = r === 'hr' || r === 'superadmin'

  // Days until contract end
  const daysUntil = (dateStr) => {
    const diff = new Date(dateStr) - now
    return Math.ceil(diff / 86400000)
  }

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
      <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6'>
        <StatCard label={t('Karyawan Aktif','Active Employees')}    value={totalEmp}  color='blue'   href='/hr/employee' />
        <StatCard label={t('Cuti Pending','Pending Leaves')}        value={pending}   color='orange' />
        <StatCard label={t('Cuti Disetujui','Approved Leaves')}     value={approved}  color='green'  />
        <StatCard label={t('Cuti Ditolak','Rejected Leaves')}       value={rejected}  color='red'    />
        <StatCard label={t('Hari Kerja Bulan Ini','Working Days')}  value={wdays}     color='purple' />
        <StatCard label={t('Libur Bulan Ini','Holidays')}           value={holThisMonth.length} color='teal' />
        <StatCard label={t('PA Pending','PA Pending')}              value={paPending} color='violet' href='/hr/employee/personnel-action' />
        <StatCard label={t('Karyawan Baru','New Hires')}            value={newHiresThisMonth.length} color='green' />
      </div>

      {/* Quick Actions — HR only */}
      {canHR && (
        <div className='mb-6'>
          <h2 className='text-sm font-bold text-gray-700 mb-3'>⚡ {t('Aksi Cepat', 'Quick Actions')}</h2>
          <div className='grid grid-cols-4 md:grid-cols-8 gap-3'>
            <QuickAction icon='➕' label={t('Tambah Karyawan','Add Employee')}    href='/hr/employee'                                color='border-blue-200 hover:border-blue-400' />
            <QuickAction icon='⬆️' label='Promote'                               href='/hr/employee/personnel-action/promote'       color='border-red-200 hover:border-red-400' />
            <QuickAction icon='↔️' label='Transfer'                               href='/hr/employee/personnel-action/transfer'      color='border-blue-200 hover:border-blue-400' />
            <QuickAction icon='🚪' label='Terminate'                              href='/hr/employee/personnel-action/terminate'     color='border-red-200 hover:border-red-400' />
            <QuickAction icon='📅' label={t('Perpanjang Kontrak','Extend Contract')} href='/hr/employee/personnel-action/extend-contract' color='border-teal-200 hover:border-teal-400' />
            <QuickAction icon='📋' label={t('Kalender Libur','Holiday Calendar')} href='/hr/absence/holiday-calendar'               color='border-indigo-200 hover:border-indigo-400' />
            <QuickAction icon='📊' label='Org Chart'                              href='/hr/org-chart'                              color='border-green-200 hover:border-green-400' />
            <QuickAction icon='🔄' label='Personnel Action'                       href='/hr/employee/personnel-action'              color='border-violet-200 hover:border-violet-400' />
          </div>
        </div>
      )}

      {/* Contract Expiry Warnings */}
      {canHR && expiringContracts.length > 0 && (
        <div className='mb-6 bg-amber-50 border border-amber-200 rounded-xl p-5'>
          <h2 className='text-sm font-bold text-amber-800 mb-3'>
            ⚠️ {t('Kontrak Segera Berakhir', 'Contracts Expiring Soon')} ({expiringContracts.length})
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2'>
            {expiringContracts.slice(0, 6).map(e => {
              const days = daysUntil(e.contractEndDate)
              return (
                <Link key={e.id} href={`/hr/employee?id=${e.id}`}
                  className='flex items-center gap-3 bg-white border border-amber-100 rounded-lg px-3 py-2.5 hover:border-amber-300 transition'>
                  <span className='text-lg'>{e.gender === 'Female' ? '👩' : '👨'}</span>
                  <div className='flex-1 min-w-0'>
                    <div className='text-xs font-semibold text-gray-800 truncate'>{e.name}</div>
                    <div className='text-xs text-gray-500'>{e.contractEndDate}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${days <= 7 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {days}d
                  </span>
                </Link>
              )
            })}
          </div>
          {expiringContracts.length > 6 && (
            <p className='text-xs text-amber-600 mt-2'>
              +{expiringContracts.length - 6} {t('lainnya', 'more')} · <Link href='/hr/employee' className='underline'>{t('Lihat semua', 'View all')}</Link>
            </p>
          )}
        </div>
      )}

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
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

      {/* New Hires This Month */}
      {newHiresThisMonth.length > 0 && (
        <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>
            🎉 {t('Karyawan Baru Bulan Ini', 'New Hires This Month')} ({newHiresThisMonth.length})
          </h2>
          <div className='flex flex-wrap gap-3'>
            {newHiresThisMonth.map(e => (
              <Link key={e.id} href={`/hr/employee?id=${e.id}`}
                className='flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2 hover:border-green-300 transition'>
                <span>{e.gender === 'Female' ? '👩' : '👨'}</span>
                <div>
                  <div className='text-xs font-semibold text-gray-800'>{e.name}</div>
                  <div className='text-xs text-gray-500'>{e.joinDate}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
