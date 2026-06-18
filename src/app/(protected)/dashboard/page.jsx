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
import { PageHeader, StatCard, SectionCard, DataTable, Tr, Td, StatusBadge, EmptyState } from '@/components/ui'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const COLORS  = { Approved:'#10b981', Pending:'#f59e0b', Rejected:'#ef4444' }

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

  return (
    <div>
      {/* Header */}
      <PageHeader
        icon='👋'
        title={`${t('Selamat datang','Welcome')}, ${currentUser?.name}!`}
        subtitle={t('Berikut ringkasan aktivitas perusahaan hari ini.','Here is a summary of today\'s company activities.')}
      />

      {/* Stats */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6'>
        <StatCard icon='👥' label={t('Karyawan Aktif','Active Employees')}    value={totalEmp}  tone='brand'  href='/hr/employee' />
        <StatCard icon='⏳' label={t('Cuti Pending','Pending Leaves')}        value={pending}   tone='orange' />
        <StatCard icon='✅' label={t('Cuti Disetujui','Approved Leaves')}     value={approved}  tone='green'  />
        <StatCard icon='⛔' label={t('Cuti Ditolak','Rejected Leaves')}       value={rejected}  tone='red'    />
        <StatCard icon='📆' label={t('Hari Kerja Bulan Ini','Working Days This Month')} value={wdays}  tone='purple' />
        <StatCard icon='🎌' label={t('Libur Bulan Ini','Holidays This Month')}   value={holThisMonth.length} tone='teal' />
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>

        {/* Bar Chart */}
        <SectionCard icon='📈' title={`${t('Pengajuan Cuti per Bulan','Leave Requests per Month')} (${year})`}>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={barData}>
              <XAxis dataKey='month' tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(139,26,26,0.05)' }} />
              <Bar dataKey='total' fill='#8B1A1A' radius={[6,6,0,0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Pie Chart */}
        <SectionCard icon='🥧' title={t('Status Cuti Keseluruhan','Overall Leave Status')}>
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
        </SectionCard>
      </div>

      {/* Recent Leaves */}
      <SectionCard icon='📋' title={t('Pengajuan Cuti Terbaru','Recent Leave Requests')} className='mb-6' bodyClass='p-0'>
        {recentLeaves.length > 0 ? (
          <DataTable columns={[
            { label: t('Karyawan','Employee') },
            { label: t('Jenis','Type') },
            { label: t('Tanggal','Date') },
            { label: 'Status' },
          ]}>
            {recentLeaves.map(l => (
              <Tr key={l.id}>
                <Td className='font-medium text-gray-800'>{l.name}</Td>
                <Td className='text-gray-600'>{l.type}</Td>
                <Td className='text-gray-600'>{l.start} → {l.end}</Td>
                <Td><StatusBadge status={l.status} /></Td>
              </Tr>
            ))}
          </DataTable>
        ) : (
          <div className='p-5'>
            <EmptyState icon='🗓️' title={t('Belum ada pengajuan cuti.','No leave requests yet.')} />
          </div>
        )}
      </SectionCard>

      {/* Holidays This Month */}
      {holThisMonth.length > 0 && (
        <SectionCard icon='🎌' title={`${t('Hari Libur','Holidays')} ${MONTHS[month]} ${year}`}>
          <div className='flex flex-wrap gap-3'>
            {holThisMonth.map(h => (
              <div key={h.id} className='rounded-xl bg-blue-50 px-4 py-2.5 ring-1 ring-blue-100'>
                <div className='text-xs font-bold text-blue-700'>{h.date}</div>
                <div className='text-sm text-gray-700'>{h.name}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}