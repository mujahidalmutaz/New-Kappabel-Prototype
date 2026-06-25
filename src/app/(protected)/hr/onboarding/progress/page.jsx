'use client'
import { useState }            from 'react'
import { useRouter }           from 'next/navigation'
import { useOnboardingStore }  from '@/store/onboardingStore'
import { useT }                from '@/store/languageStore'
import { exportCsv }           from '@/utils/exportCsv'
import { PageHeader, SectionCard, StatCard } from '@/components/ui'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

function pct(done, total) {
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

function pctColor(p) {
  if (p >= 80) return 'bg-green-500'
  if (p >= 50) return 'bg-amber-400'
  return 'bg-red-500'
}

function pctTextColor(p) {
  if (p >= 80) return 'text-green-700'
  if (p >= 50) return 'text-amber-600'
  return 'text-red-600'
}

function ProgressBar({ value, className = '' }) {
  return (
    <div className={`w-full h-2 bg-gray-100 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${pctColor(value)}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function StatusBadge({ status }) {
  const cls = {
    Draft:       'bg-gray-100 text-gray-500',
    Preparation: 'bg-blue-100 text-blue-700',
    Active:      'bg-amber-100 text-amber-700',
    Pending:     'bg-yellow-100 text-yellow-700',
    Approved:    'bg-green-100 text-green-700',
    Rejected:    'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

export default function OnboardingProgressPage() {
  const t      = useT()
  const router = useRouter()
  const { onboardings } = useOnboardingStore()

  const [search,   setSearch  ] = useState('')
  const [filterWf, setFilterWf] = useState('All')

  const data = onboardings.map(o => {
    const gen  = o.generalItems   || []
    const tech = o.technicalItems || []
    const all  = [...gen, ...tech]
    const done = all.filter(i => i.completed).length
    const total = all.length
    const genDone  = gen.filter(i => i.completed).length
    const techDone = tech.filter(i => i.completed).length
    return {
      ...o,
      all, done, total,
      genDone,  genTotal: gen.length,
      techDone, techTotal: tech.length,
      overall: pct(done, total),
    }
  })

  const statuses = ['All', ...Array.from(new Set(data.map(d => d.workflowStatus)))]

  const filtered = data.filter(d => {
    const q = search.trim().toLowerCase()
    const matchQ = !q ||
      d.employeeName?.toLowerCase().includes(q) ||
      d.department?.toLowerCase().includes(q) ||
      d.employeeNIK?.toLowerCase().includes(q)
    const matchWf = filterWf === 'All' || d.workflowStatus === filterWf
    return matchQ && matchWf
  })

  const avg    = data.length ? Math.round(data.reduce((s, d) => s + d.overall, 0) / data.length) : 0
  const done100 = data.filter(d => d.overall === 100).length
  const active  = data.filter(d => d.workflowStatus === 'Active' || d.workflowStatus === 'Approved').length

  const handleExport = () => {
    exportCsv('onboarding-progress', [
      'Employee', 'NIK', 'Department', 'Status', 'General Done', 'General Total',
      'Technical Done', 'Technical Total', 'Overall %',
    ], filtered.map(d => [
      d.employeeName, d.employeeNIK || '', d.department || '',
      d.workflowStatus, d.genDone, d.genTotal,
      d.techDone, d.techTotal, d.overall,
    ]))
  }

  return (
    <div>
      <PageHeader
        icon='📊'
        title={t('Onboarding Progress', 'Onboarding Progress')}
        subtitle={t('Pantau penyelesaian tugas onboarding per karyawan.', 'Track onboarding task completion per employee.')}
      />

      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <StatCard label={t('Total Onboarding', 'Total Onboarding')} value={data.length}  icon='📋' tone='brand' />
        <StatCard label={t('Aktif / Selesai', 'Active / Done')}     value={active}        icon='✅' tone='green' />
        <StatCard label={t('Selesai 100%', 'Completed 100%')}        value={done100}       icon='🏆' tone='green' />
        <StatCard label={t('Rata-rata Progress', 'Avg Progress')}    value={`${avg}%`}     icon='📈' tone='brand' />
      </div>

      <SectionCard
        title={t('Progress per Karyawan', 'Progress per Employee')}
        icon='📊'
        actions={
          <div className='flex items-center gap-2'>
            <select
              value={filterWf}
              onChange={e => setFilterWf(e.target.value)}
              className='text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-red-300 bg-white'>
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('Cari karyawan…', 'Search employee…')}
              className='text-xs border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-red-300 w-44'
            />
            <button
              onClick={handleExport}
              className='flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition'
              style={{ background: BRAND }}>
              ↓ {t('Export CSV', 'Export CSV')}
            </button>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <div className='py-16 text-center text-gray-400 text-sm'>
            {t('Tidak ada data onboarding.', 'No onboarding records found.')}
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3'>
            {filtered.map(d => (
              <div
                key={d.id}
                onClick={() => router.push('/hr/onboarding/tracker')}
                className='bg-white rounded-2xl ring-1 ring-gray-100 shadow-sm hover:shadow-md hover:ring-red-200 transition cursor-pointer p-5 flex flex-col gap-4'>

                {/* Header */}
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0'
                      style={{ background: BRAND }}>
                      {(d.employeeName || '?').trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className='text-sm font-bold text-gray-800 leading-tight'>{d.employeeName}</p>
                      <p className='text-xs text-gray-400 mt-0.5'>{d.department || '—'}</p>
                    </div>
                  </div>
                  <StatusBadge status={d.workflowStatus} />
                </div>

                {/* Overall */}
                <div>
                  <div className='flex items-center justify-between mb-1.5'>
                    <span className='text-xs text-gray-500 font-medium'>{t('Overall Progress', 'Overall Progress')}</span>
                    <span className={`text-sm font-bold ${pctTextColor(d.overall)}`}>{d.overall}%</span>
                  </div>
                  <ProgressBar value={d.overall} />
                </div>

                {/* Breakdown */}
                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-blue-50 rounded-xl p-3'>
                    <p className='text-[10px] font-semibold text-blue-600 mb-1'>{t('General', 'General')}</p>
                    <p className='text-base font-bold text-blue-800 leading-none'>
                      {d.genDone}<span className='text-xs font-medium text-blue-400'>/{d.genTotal}</span>
                    </p>
                    <ProgressBar value={pct(d.genDone, d.genTotal)} className='mt-1.5' />
                  </div>
                  <div className='bg-amber-50 rounded-xl p-3'>
                    <p className='text-[10px] font-semibold text-amber-600 mb-1'>{t('Technical', 'Technical')}</p>
                    <p className='text-base font-bold text-amber-800 leading-none'>
                      {d.techDone}<span className='text-xs font-medium text-amber-400'>/{d.techTotal}</span>
                    </p>
                    <ProgressBar value={pct(d.techDone, d.techTotal)} className='mt-1.5' />
                  </div>
                </div>

                {/* Task count */}
                <div className='flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3'>
                  <span>{d.done} / {d.total} {t('tugas selesai', 'tasks completed')}</span>
                  <span className='text-red-500 font-medium'>→ {t('Lihat Detail', 'View Detail')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
