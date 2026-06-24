'use client'
import { useTalentStore } from '@/store/talentStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

function StatCard({ label, value, color, hint }) {
  const borderColor = {
    red:    'border-red-500',
    amber:  'border-amber-500',
    green:  'border-green-500',
    blue:   'border-blue-500',
    purple: 'border-purple-500',
    gray:   'border-gray-300',
  }[color] || 'border-red-500'
  return (
    <div className={`bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5 border-t-2 ${borderColor}`}>
      <div className='text-xs font-medium uppercase tracking-wide text-gray-400'>{label}</div>
      <div className='mt-2 text-3xl font-bold text-gray-900'>{value}</div>
      {hint && <div className='mt-1 text-xs text-gray-400'>{hint}</div>}
    </div>
  )
}

function RiskBadge({ term }) {
  const cls = {
    Short: 'bg-red-100 text-red-700',
    Mid:   'bg-amber-100 text-amber-700',
    Long:  'bg-green-100 text-green-700',
  }[term] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{term || '—'}</span>
}

export default function TalentReportPage() {
  const { keyPositions, vacancyRisks, talentBoxes, idpList, talentReviews, sdpList, databaseTalent, databaseSuccessor } = useTalentStore()

  const keyOnly = keyPositions.filter(k => k.isKeyPosition)

  const riskCounts = { Short: 0, Mid: 0, Long: 0 }
  vacancyRisks.forEach(v => { if (riskCounts[v.riskTerm] !== undefined) riskCounts[v.riskTerm]++ })

  // IDP completion rate
  const totalIdp = idpList.length
  const approvedIdp = idpList.filter(i => i.status === 'Approved').length
  const idpRate = totalIdp > 0 ? Math.round((approvedIdp / totalIdp) * 100) : 0

  // 9-box distribution
  const boxDistribution = {}
  talentBoxes.forEach(t => {
    const key = t.boxLabel || 'Other'
    boxDistribution[key] = (boxDistribution[key] || 0) + 1
  })

  // Successor readiness rate: % key positions that have at least one Short-ready successor
  const positionsWithShortSuccessor = keyOnly.filter(kp => {
    const review = talentReviews.find(r => r.keyPositionId === kp.id)
    if (!review) return false
    return (review.successors || []).some(s => s.sdpTerm === 'Short')
  }).length
  const successorReadinessRate = keyOnly.length > 0
    ? Math.round((positionsWithShortSuccessor / keyOnly.length) * 100)
    : 0

  return (
    <div>
      {/* Header */}
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-start gap-3'>
          <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-sm'
            style={{ background: BRAND }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Talent Management Report</h1>
            <p className='mt-1 text-sm text-gray-500'>Ringkasan dan dashboard status talent management organisasi</p>
          </div>
        </div>
        <button
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-white text-gray-600 rounded-xl shadow-sm ring-1 ring-gray-200 transition hover:bg-gray-50'>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export (Coming Soon)
        </button>
      </div>

      {/* Key Stats */}
      <div className='grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3 lg:grid-cols-5'>
        <StatCard label='Total Key Position' value={keyOnly.length} color='red' hint={`dari ${keyPositions.length} posisi`} />
        <StatCard label='Short Term Risk' value={riskCounts.Short} color='red' hint='0–1 tahun' />
        <StatCard label='Mid Term Risk' value={riskCounts.Mid} color='amber' hint='1–3 tahun' />
        <StatCard label='Long Term Risk' value={riskCounts.Long} color='green' hint='>3 tahun' />
        <StatCard label='IDP Completion' value={`${idpRate}%`} color='blue' hint={`${approvedIdp}/${totalIdp} approved`} />
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 mb-6'>
        {/* 9-Box Distribution */}
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5'>
          <h2 className='text-sm font-bold text-gray-800 mb-4'>Distribusi 9-Box</h2>
          {Object.keys(boxDistribution).length === 0 ? (
            <p className='text-sm text-gray-400'>Belum ada data 9-Box.</p>
          ) : (
            <div className='space-y-2'>
              {Object.entries(boxDistribution).map(([box, count]) => {
                const pct = talentBoxes.length > 0 ? Math.round((count / talentBoxes.length) * 100) : 0
                const color = box === 'Star' ? 'bg-green-500' : box.includes('High') ? 'bg-blue-500' : box === 'Underperformer' ? 'bg-red-500' : 'bg-amber-400'
                return (
                  <div key={box}>
                    <div className='flex items-center justify-between text-xs mb-1'>
                      <span className='text-gray-700 font-medium'>{box}</span>
                      <span className='text-gray-500'>{count} ({pct}%)</span>
                    </div>
                    <div className='h-2 bg-gray-100 rounded-full overflow-hidden'>
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Successor Readiness */}
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5'>
          <h2 className='text-sm font-bold text-gray-800 mb-4'>Successor Readiness</h2>
          <div className='flex items-center gap-4 mb-4'>
            <div className='relative w-24 h-24 flex-shrink-0'>
              <svg viewBox='0 0 36 36' className='w-24 h-24 -rotate-90'>
                <circle cx='18' cy='18' r='15.9' fill='none' stroke='#f3f4f6' strokeWidth='3'/>
                <circle cx='18' cy='18' r='15.9' fill='none' stroke='#dc2626' strokeWidth='3'
                  strokeDasharray={`${successorReadinessRate} ${100 - successorReadinessRate}`}
                  strokeLinecap='round'/>
              </svg>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-xl font-bold text-gray-800'>{successorReadinessRate}%</span>
              </div>
            </div>
            <div>
              <p className='text-sm font-semibold text-gray-700'>Posisi dengan Successor Siap Jangka Pendek</p>
              <p className='text-xs text-gray-400 mt-1'>{positionsWithShortSuccessor} dari {keyOnly.length} key position</p>
              {successorReadinessRate < 50 && (
                <p className='text-xs text-red-600 mt-2 font-medium'>Perhatian: Lebih dari setengah posisi kunci belum memiliki successor siap</p>
              )}
            </div>
          </div>
          <div className='grid grid-cols-3 gap-3 text-center'>
            {[
              { label: 'Total Talent DB', count: databaseTalent.length, cls: 'text-gray-700' },
              { label: 'Total Successor DB', count: databaseSuccessor.length, cls: 'text-gray-700' },
              { label: 'High Fitness', count: databaseSuccessor.filter(d => d.fitnessLevel === 'High').length, cls: 'text-green-700' },
            ].map(({ label, count, cls }) => (
              <div key={label} className='bg-gray-50 rounded-xl p-3'>
                <div className={`text-2xl font-bold ${cls}`}>{count}</div>
                <div className='text-xs text-gray-400 mt-0.5'>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Position Risk Summary Table */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-100'>
          <h2 className='text-sm font-bold text-gray-800'>Status Key Position & Risk</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr style={{ background: BRAND }}>
                {['No', 'Posisi', 'Incumbent', 'PC Level', 'Risk Term', 'Successor (Short Ready)', 'SDP Active', 'Status'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keyOnly.length === 0 && (
                <tr><td colSpan={8} className='px-4 py-10 text-center text-gray-400'>Belum ada Key Position.</td></tr>
              )}
              {keyOnly.map((kp, idx) => {
                const risk = vacancyRisks.find(v => v.keyPositionId === kp.id)
                const review = talentReviews.find(r => r.keyPositionId === kp.id)
                const shortSuccessors = (review?.successors || []).filter(s => s.sdpTerm === 'Short')
                const activeSdps = sdpList.filter(s => s.targetPosition === kp.positionName && s.status === 'Active')
                return (
                  <tr key={kp.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className='px-4 py-3 text-gray-500 text-xs'>{idx + 1}</td>
                    <td className='px-4 py-3 font-semibold text-gray-800'>{kp.positionName}</td>
                    <td className='px-4 py-3 text-gray-700'>{kp.employeeName}</td>
                    <td className='px-4 py-3 text-gray-700'>{kp.pcLevel}</td>
                    <td className='px-4 py-3'><RiskBadge term={risk?.riskTerm} /></td>
                    <td className='px-4 py-3'>
                      {shortSuccessors.length > 0 ? (
                        <div className='flex flex-wrap gap-1'>
                          {shortSuccessors.map((s, i) => (
                            <span key={i} className='px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-semibold'>
                              {s.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className='px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full font-semibold'>Belum ada</span>
                      )}
                    </td>
                    <td className='px-4 py-3'>
                      <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${activeSdps.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {activeSdps.length} SDP
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      {shortSuccessors.length > 0
                        ? <span className='px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700'>Siap</span>
                        : risk?.riskTerm === 'Short'
                          ? <span className='px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700'>Kritis</span>
                          : <span className='px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700'>Dalam Proses</span>
                      }
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
