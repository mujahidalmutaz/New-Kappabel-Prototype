'use client'
import { useTalentStore } from '@/store/talentStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

// Flow urutan ideal: Identify → Assess → Classify → Review → Plan → Develop → Monitor
const STAGE_STEPS = [
  { key: 'key',        label: 'Key Position',      path: '/hr/talent/key-position',        phase: 'Identify' },
  { key: 'ninebox',    label: '9-Box Matrix',       path: '/hr/talent/nine-box',             phase: 'Assess' },
  { key: 'calibration',label: 'Kalibrasi',          path: '/hr/talent/calibration',          phase: 'Assess' },
  { key: 'review',     label: 'Talent Review',      path: '/hr/talent/talent-review',        phase: 'Review' },
  { key: 'database',   label: 'Database Talent',    path: '/hr/talent/database-talent',      phase: 'Plan' },
  { key: 'successor',  label: 'Database Successor', path: '/hr/talent/database-successor',   phase: 'Plan' },
  { key: 'idp',        label: 'IDP',                path: '/hr/talent/idp',                  phase: 'Develop' },
  { key: 'sdp',        label: 'SDP',                path: '/hr/talent/sdp',                  phase: 'Develop' },
  { key: 'career',     label: 'Career Path',        path: '/hr/talent/career-path',          phase: 'Develop' },
  { key: 'vacancy',    label: 'Vacancy Risk',        path: '/hr/talent/vacancy-risk',         phase: 'Monitor' },
  { key: 'retention',  label: 'Retention Risk',     path: '/hr/talent/retention-risk',       phase: 'Monitor' },
]

const PHASE_COLOR = {
  Identify: 'bg-purple-500',
  Assess:   'bg-blue-500',
  Review:   'bg-cyan-500',
  Plan:     'bg-orange-500',
  Develop:  'bg-green-500',
  Monitor:  'bg-red-500',
}

function StatCard({ label, value, sub, color = 'text-red-600', border = 'border-red-500' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 border-t-2 ${border}`}>
      <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>{label}</div>
      <div className={`mt-2 text-3xl font-bold ${color}`}>{value}</div>
      {sub && <div className='text-xs text-gray-400 mt-1'>{sub}</div>}
    </div>
  )
}

export default function TalentDashboardPage() {
  const {
    keyPositions = [], vacancyRisks = [], talentBoxes = [],
    idpList = [], sdpList = [], databaseTalent = [],
    databaseSuccessor = [], retentionRisks = [],
  } = useTalentStore()

  const totalKeyPos = keyPositions.filter(k => k.isKeyPosition).length
  const highPotential = talentBoxes.filter(t => ['Star','High Potential'].includes(t.boxLabel)).length
  const idpApproved = idpList.filter(i => i.status === 'Approved').length
  const idpTotal = idpList.length
  const idpRate = idpTotal ? Math.round(idpApproved / idpTotal * 100) : 0
  const readyNow = databaseTalent.filter(d => d.readinessLevel === 'Ready Now').length
  const flightHigh = retentionRisks.filter(r => r.riskLevel === 'High' && !r.resolved).length
  const vacancyShort = vacancyRisks.filter(v => v.riskTerm === 'Short').length

  const totalSuccessors = databaseSuccessor.length
  const coveredPositions = [...new Set(databaseSuccessor.map(s => s.targetPositionId))].length
  const successorCoverage = totalKeyPos ? Math.round(coveredPositions / totalKeyPos * 100) : 0

  const boxDistribution = ['Star','High Potential','High Performer','Core Player','Latent Talent',
    'Solid Contributor','Inconsistent','Under Achiever','Underperformer']
    .map(label => ({ label, count: talentBoxes.filter(t => t.boxLabel === label).length }))
    .filter(b => b.count > 0)

  return (
    <div>
      {/* Header */}
      <div className='mb-6 flex items-start gap-3'>
        <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm' style={{ background: BRAND }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Talent Management Dashboard</h1>
          <p className='mt-1 text-sm text-gray-500'>Ringkasan seluruh aktivitas talent management</p>
        </div>
      </div>

      {/* Lifecycle flow bar */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>Talent Lifecycle Flow</p>
          <div className='flex items-center gap-3'>
            {Object.entries(PHASE_COLOR).map(([phase, color]) => (
              <div key={phase} className='flex items-center gap-1'>
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className='text-[10px] text-gray-500 font-medium'>{phase}</span>
              </div>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-0 overflow-x-auto pb-2'>
          {STAGE_STEPS.map((step, i) => (
            <div key={step.key} className='flex items-center flex-shrink-0'>
              <a href={step.path}
                className='flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition group'>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm group-hover:shadow-md transition ${PHASE_COLOR[step.phase]}`}>
                  {i + 1}
                </div>
                <span className='text-[10px] font-semibold text-gray-600 group-hover:text-gray-900 whitespace-nowrap'>{step.label}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${PHASE_COLOR[step.phase]}`}>{step.phase}</span>
              </a>
              {i < STAGE_STEPS.length - 1 && (
                <svg className='text-gray-300 flex-shrink-0 mx-0.5' width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4'>
        <StatCard label='Key Positions' value={totalKeyPos} sub={`dari ${keyPositions.length} posisi dinilai`} />
        <StatCard label='Successor Coverage' value={`${successorCoverage}%`} sub={`${coveredPositions}/${totalKeyPos} posisi terlindungi`} color='text-blue-600' border='border-blue-500' />
        <StatCard label='IDP Approved' value={`${idpRate}%`} sub={`${idpApproved} dari ${idpTotal} IDP`} color='text-green-600' border='border-green-500' />
        <StatCard label='Ready Now' value={readyNow} sub='talent siap promosi sekarang' color='text-green-600' border='border-green-500' />
      </div>
      <div className='grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4'>
        <StatCard label='High Potential' value={highPotential} sub='Star + High Potential' color='text-blue-600' border='border-blue-500' />
        <StatCard label='Vacancy Risk (Short)' value={vacancyShort} sub='perlu segera ditangani' color='text-red-600' border='border-red-500' />
        <StatCard label='Flight Risk High' value={flightHigh} sub='karyawan berisiko resign' color='text-orange-600' border='border-orange-500' />
        <StatCard label='Total Database Talent' value={databaseTalent.length} sub='dalam talent pool' color='text-purple-600' border='border-purple-500' />
      </div>

      {/* Two columns: 9-Box distribution + Action items */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {/* 9-Box Distribution */}
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5'>
          <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-4'>Distribusi 9-Box</p>
          {boxDistribution.length === 0 ? (
            <p className='text-sm text-gray-400'>Belum ada data 9-Box.</p>
          ) : (
            <div className='space-y-2'>
              {boxDistribution.map(b => (
                <div key={b.label} className='flex items-center gap-3'>
                  <span className='w-32 text-xs text-gray-600 font-medium'>{b.label}</span>
                  <div className='flex-1 bg-gray-100 rounded-full h-2'>
                    <div className='h-2 rounded-full' style={{ background: BRAND, width: `${Math.max(10, (b.count / talentBoxes.length) * 100)}%` }} />
                  </div>
                  <span className='text-xs font-bold text-gray-700 w-4 text-right'>{b.count}</span>
                </div>
              ))}
              {talentBoxes.length === 0 && <p className='text-sm text-gray-400'>Belum ada data 9-Box.</p>}
            </div>
          )}
        </div>

        {/* Action items / Alerts */}
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5'>
          <p className='text-xs font-bold text-gray-500 uppercase tracking-wider mb-4'>Perlu Perhatian</p>
          <div className='space-y-2.5'>
            {vacancyShort > 0 && (
              <a href='/hr/talent/vacancy-risk' className='flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition'>
                <div className='w-2 h-2 rounded-full bg-red-500 flex-shrink-0' />
                <span className='text-xs text-red-700 font-medium'>{vacancyShort} posisi dengan vacancy risk jangka pendek</span>
              </a>
            )}
            {flightHigh > 0 && (
              <a href='/hr/talent/retention-risk' className='flex items-center gap-3 p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition'>
                <div className='w-2 h-2 rounded-full bg-orange-500 flex-shrink-0' />
                <span className='text-xs text-orange-700 font-medium'>{flightHigh} karyawan dengan flight risk tinggi belum diselesaikan</span>
              </a>
            )}
            {idpList.filter(i => i.status === 'Submitted').length > 0 && (
              <a href='/hr/talent/idp' className='flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition'>
                <div className='w-2 h-2 rounded-full bg-blue-500 flex-shrink-0' />
                <span className='text-xs text-blue-700 font-medium'>{idpList.filter(i => i.status === 'Submitted').length} IDP menunggu persetujuan manager</span>
              </a>
            )}
            {successorCoverage < 80 && totalKeyPos > 0 && (
              <a href='/hr/talent/database-successor' className='flex items-center gap-3 p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition'>
                <div className='w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0' />
                <span className='text-xs text-yellow-700 font-medium'>Successor coverage hanya {successorCoverage}% — perlu ditingkatkan</span>
              </a>
            )}
            {vacancyShort === 0 && flightHigh === 0 && idpList.filter(i=>i.status==='Submitted').length === 0 && successorCoverage >= 80 && (
              <div className='flex items-center gap-3 p-3 bg-green-50 rounded-xl'>
                <div className='w-2 h-2 rounded-full bg-green-500 flex-shrink-0' />
                <span className='text-xs text-green-700 font-medium'>Tidak ada item mendesak saat ini.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
