'use client'
import { useState, useMemo } from 'react'
import { useTalentStore } from '@/store/talentStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

const BOX_COLOR = {
  'Star':              'bg-yellow-100 text-yellow-800 border-yellow-300',
  'High Potential':    'bg-purple-100 text-purple-800 border-purple-300',
  'High Performer':    'bg-blue-100 text-blue-800 border-blue-300',
  'Core Player':       'bg-green-100 text-green-800 border-green-300',
  'Latent Talent':     'bg-teal-100 text-teal-800 border-teal-300',
  'Solid Contributor': 'bg-cyan-100 text-cyan-800 border-cyan-300',
  'Inconsistent':      'bg-orange-100 text-orange-800 border-orange-300',
  'Under Achiever':    'bg-red-100 text-red-800 border-red-300',
  'Underperformer':    'bg-gray-100 text-gray-700 border-gray-300',
  'Developing':        'bg-indigo-100 text-indigo-800 border-indigo-300',
}

const READINESS_COLOR = {
  'Ready Now': 'bg-green-100 text-green-700',
  '1-2 Year':  'bg-blue-100 text-blue-700',
  '3-5 Year':  'bg-yellow-100 text-yellow-700',
  'Not Ready': 'bg-gray-100 text-gray-600',
  'High':      'bg-green-100 text-green-700',
  'Medium':    'bg-yellow-100 text-yellow-700',
  'Low':       'bg-red-100 text-red-700',
}

const FLIGHT_COLOR = {
  'Low':    'bg-green-100 text-green-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'High':   'bg-red-100 text-red-700',
}

const RISK_COLOR = {
  'High':   'bg-red-100 text-red-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'Low':    'bg-green-100 text-green-700',
}

function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      {children}
    </span>
  )
}

function Section({ title, icon, children, empty }) {
  return (
    <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5'>
      <div className='flex items-center gap-2 mb-4'>
        <span className='text-base'>{icon}</span>
        <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>{title}</p>
      </div>
      {empty ? (
        <p className='text-sm text-gray-400 italic'>{empty}</p>
      ) : children}
    </div>
  )
}

export default function TalentProfilePage() {
  const {
    databaseTalent, talentBoxes, idpList, sdpList,
    careerPaths, databaseSuccessor, retentionRisks,
    keyPositions, vacancyRisks,
  } = useTalentStore()

  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  // Collect all unique employees from talent-related stores
  const allEmployees = useMemo(() => {
    const map = new Map()
    const add = (id, name, extra = {}) => {
      if (!id) return
      if (!map.has(id)) map.set(id, { employeeId: id, employeeName: name, ...extra })
    }
    databaseTalent.forEach(d => add(d.employeeId, d.employeeName, { position: d.position, department: d.department }))
    talentBoxes.forEach(t => add(t.employeeId, t.employeeName))
    idpList.forEach(i => add(i.employeeId, i.employeeName))
    sdpList.forEach(s => add(s.employeeId, s.employeeName))
    careerPaths.forEach(c => add(c.employeeId, c.employeeName, { position: c.currentPosition }))
    databaseSuccessor.forEach(s => add(s.employeeId, s.employeeName))
    retentionRisks.forEach(r => add(r.employeeId, r.employeeName, { position: r.position, department: r.department }))
    keyPositions.forEach(k => add(k.employeeId, k.employeeName, { position: k.positionName }))
    return Array.from(map.values()).sort((a, b) => a.employeeName.localeCompare(b.employeeName))
  }, [databaseTalent, talentBoxes, idpList, sdpList, careerPaths, databaseSuccessor, retentionRisks, keyPositions])

  const filtered = useMemo(() =>
    allEmployees.filter(e =>
      e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      (e.position || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase())
    ), [allEmployees, search])

  const selected = selectedId ? allEmployees.find(e => e.employeeId === selectedId) : null

  // Profile data aggregation
  const profile = useMemo(() => {
    if (!selected) return null
    const id = selected.employeeId

    const talent    = databaseTalent.find(d => d.employeeId === id)
    const boxes     = talentBoxes.filter(t => t.employeeId === id).sort((a, b) => b.year - a.year)
    const latestBox = boxes[0] || null
    const idps      = idpList.filter(i => i.employeeId === id)
    const latestIdp = idps.sort((a, b) => b.year - a.year)[0] || null
    const sdp       = sdpList.find(s => s.employeeId === id) || null
    const careerPath = careerPaths.find(c => c.employeeId === id) || null
    const successorFor = databaseSuccessor.filter(s => s.employeeId === id)
    const retention = retentionRisks.find(r => r.employeeId === id) || null
    const keyPos    = keyPositions.find(k => k.employeeId === id) || null
    const vacancy   = keyPos ? vacancyRisks.find(v => v.keyPositionId === keyPos.id) || null : null

    return { talent, latestBox, boxes, latestIdp, idps, sdp, careerPath, successorFor, retention, keyPos, vacancy }
  }, [selected, databaseTalent, talentBoxes, idpList, sdpList, careerPaths, databaseSuccessor, retentionRisks, keyPositions, vacancyRisks])

  const idpProgress = profile?.latestIdp
    ? Math.round((profile.latestIdp.items || []).reduce((sum, i) => sum + (i.progressPercent || 0), 0) / Math.max(1, (profile.latestIdp.items || []).length))
    : 0

  return (
    <div className='flex gap-6 h-full' style={{ minHeight: 'calc(100vh - 120px)' }}>

      {/* Left: Employee List */}
      <div className='w-72 flex-shrink-0 flex flex-col'>
        <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 flex flex-col flex-1'>
          {/* Header */}
          <div className='p-4 border-b border-gray-100'>
            <div className='flex items-center gap-2 mb-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-xl text-white' style={{ background: BRAND }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <h2 className='text-sm font-bold text-gray-900'>Talent Profile</h2>
                <p className='text-[10px] text-gray-400'>{allEmployees.length} karyawan terdaftar</p>
              </div>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Cari nama, posisi, departemen…'
              className='w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-red-400 focus:bg-white transition'
            />
          </div>

          {/* Employee list */}
          <div className='flex-1 overflow-y-auto divide-y divide-gray-50'>
            {filtered.length === 0 && (
              <p className='text-xs text-gray-400 text-center py-8'>Tidak ada karyawan ditemukan</p>
            )}
            {filtered.map(emp => {
              const box = talentBoxes.find(t => t.employeeId === emp.employeeId)
              const risk = retentionRisks.find(r => r.employeeId === emp.employeeId)
              const isActive = selectedId === emp.employeeId
              return (
                <button
                  key={emp.employeeId}
                  onClick={() => setSelectedId(emp.employeeId)}
                  className={`w-full text-left px-4 py-3 transition hover:bg-red-50 ${isActive ? 'bg-red-50 border-l-2 border-red-500' : ''}`}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div className='min-w-0'>
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-red-700' : 'text-gray-800'}`}>{emp.employeeName}</p>
                      <p className='text-[10px] text-gray-400 truncate mt-0.5'>{emp.position || emp.department || emp.employeeId}</p>
                    </div>
                    <div className='flex flex-col items-end gap-1 flex-shrink-0'>
                      {box && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${BOX_COLOR[box.boxLabel] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {box.boxLabel}
                        </span>
                      )}
                      {risk && !risk.resolved && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${RISK_COLOR[risk.riskLevel] || 'bg-gray-100 text-gray-600'}`}>
                          {risk.riskLevel} Risk
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right: Profile Detail */}
      <div className='flex-1 min-w-0'>
        {!selected ? (
          <div className='flex flex-col items-center justify-center h-full text-center py-24'>
            <div className='w-16 h-16 rounded-2xl flex items-center justify-center mb-4' style={{ background: 'linear-gradient(135deg,#fde8e8,#fff0f0)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D7252B" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <p className='text-sm font-semibold text-gray-500'>Pilih karyawan untuk melihat profil talent</p>
            <p className='text-xs text-gray-400 mt-1'>Gunakan kolom kiri untuk mencari dan memilih karyawan</p>
          </div>
        ) : (
          <div className='space-y-4'>

            {/* Hero Card */}
            <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
              <div className='h-2' style={{ background: BRAND }} />
              <div className='p-6'>
                <div className='flex items-start gap-5'>
                  {/* Avatar */}
                  <div className='w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-sm'
                    style={{ background: BRAND }}>
                    {selected.employeeName.charAt(0)}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h2 className='text-xl font-bold text-gray-900'>{selected.employeeName}</h2>
                    <p className='text-sm text-gray-500 mt-0.5'>{selected.position || profile?.talent?.position || profile?.careerPath?.currentPosition || '—'}</p>
                    <p className='text-xs text-gray-400'>{selected.department || profile?.talent?.department || '—'}</p>
                    <div className='flex flex-wrap gap-2 mt-3'>
                      {profile?.latestBox && (
                        <Badge className={BOX_COLOR[profile.latestBox.boxLabel] || 'bg-gray-100 text-gray-600 border-gray-200'}>
                          9-Box: {profile.latestBox.boxLabel}
                        </Badge>
                      )}
                      {profile?.talent?.readinessLevel && (
                        <Badge className={`border-transparent ${READINESS_COLOR[profile.talent.readinessLevel] || 'bg-gray-100 text-gray-600'}`}>
                          Readiness: {profile.talent.readinessLevel}
                        </Badge>
                      )}
                      {profile?.talent?.flightRisk && (
                        <Badge className={`border-transparent ${FLIGHT_COLOR[profile.talent.flightRisk] || 'bg-gray-100 text-gray-600'}`}>
                          Flight Risk: {profile.talent.flightRisk}
                        </Badge>
                      )}
                      {profile?.keyPos?.isKeyPosition && (
                        <Badge className='bg-red-100 text-red-700 border-red-300'>Key Position Holder</Badge>
                      )}
                      {profile?.talent?.inTalentPool && (
                        <Badge className='bg-purple-100 text-purple-700 border-purple-300'>Talent Pool</Badge>
                      )}
                    </div>
                  </div>
                  {/* Quick stats */}
                  <div className='flex-shrink-0 text-right space-y-1'>
                    {profile?.careerPath && (
                      <p className='text-xs text-gray-400'>PC Level: <span className='font-bold text-gray-700'>{profile.careerPath.currentPCLevel}</span></p>
                    )}
                    {profile?.talent?.lastAssessmentDate && (
                      <p className='text-xs text-gray-400'>Last Assessment: <span className='font-semibold text-gray-600'>{profile.talent.lastAssessmentDate}</span></p>
                    )}
                    {profile?.latestBox && (
                      <p className='text-xs text-gray-400'>Perf Score: <span className='font-bold text-gray-700'>{profile.latestBox.performanceScore}</span> · Comp: <span className='font-bold text-gray-700'>{profile.latestBox.competencyScore}</span></p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2 col */}
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>

              {/* 9-Box History */}
              <Section title='9-Box Matrix' icon='📊'
                empty={!profile?.latestBox ? 'Belum ada data 9-Box' : undefined}>
                {profile?.latestBox && (
                  <div className='space-y-2'>
                    {profile.boxes.map(b => (
                      <div key={b.id} className='flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50'>
                        <div>
                          <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${BOX_COLOR[b.boxLabel] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>{b.boxLabel}</span>
                          {b.notes && <p className='text-xs text-gray-500 mt-1'>{b.notes}</p>}
                        </div>
                        <div className='text-right flex-shrink-0'>
                          <p className='text-xs text-gray-400'>Tahun {b.year}</p>
                          <p className='text-xs text-gray-500'>P:{b.performanceScore} · C:{b.competencyScore}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Retention Risk */}
              <Section title='Retention Risk' icon='⚠️'
                empty={!profile?.retention ? 'Tidak ada retention risk tercatat' : undefined}>
                {profile?.retention && (
                  <div>
                    <div className='flex items-center gap-3 mb-3'>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${RISK_COLOR[profile.retention.riskLevel] || 'bg-gray-100 text-gray-600'}`}>
                        {profile.retention.riskLevel} Risk — Skor {profile.retention.riskScore}
                      </span>
                      {profile.retention.resolved && (
                        <span className='text-xs text-green-600 font-semibold'>✓ Resolved</span>
                      )}
                    </div>
                    <div className='space-y-1.5 mb-3'>
                      {(profile.retention.factors || []).map((f, i) => (
                        <div key={i} className='flex items-center gap-2 text-xs'>
                          <div className='w-2 h-2 rounded-full bg-red-400 flex-shrink-0' />
                          <span className='text-gray-600 font-medium'>{f.factor}</span>
                          <span className='text-gray-400'>— {f.value}</span>
                        </div>
                      ))}
                    </div>
                    {profile.retention.action && (
                      <div className='bg-blue-50 rounded-xl px-3 py-2'>
                        <p className='text-xs text-blue-700'>{profile.retention.action}</p>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              {/* IDP */}
              <Section title='Individual Development Plan (IDP)' icon='📋'
                empty={!profile?.latestIdp ? 'Belum ada IDP' : undefined}>
                {profile?.latestIdp && (
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                        profile.latestIdp.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-300'
                        : profile.latestIdp.status === 'Submitted' ? 'bg-blue-100 text-blue-700 border-blue-300'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>{profile.latestIdp.status} · {profile.latestIdp.year}</span>
                      <div className='flex items-center gap-2'>
                        <div className='w-20 bg-gray-100 rounded-full h-1.5'>
                          <div className='h-1.5 rounded-full bg-red-500' style={{ width: `${idpProgress}%` }} />
                        </div>
                        <span className='text-xs font-bold text-gray-700'>{idpProgress}%</span>
                      </div>
                    </div>
                    <div className='space-y-2'>
                      {(profile.latestIdp.items || []).slice(0, 4).map((item, i) => (
                        <div key={i} className='flex items-center gap-3 p-2 rounded-lg bg-gray-50'>
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs font-semibold text-gray-700 truncate'>{item.competencyName}</p>
                            <p className='text-[10px] text-gray-400'>{item.competencyType}</p>
                          </div>
                          <div className='flex-shrink-0 text-right'>
                            <div className='w-16 bg-gray-200 rounded-full h-1.5'>
                              <div className='h-1.5 rounded-full bg-red-400' style={{ width: `${item.progressPercent || 0}%` }} />
                            </div>
                            <p className='text-[10px] text-gray-400 mt-0.5'>{item.progressPercent || 0}%</p>
                          </div>
                        </div>
                      ))}
                      {(profile.latestIdp.items || []).length > 4 && (
                        <p className='text-xs text-gray-400 text-center'>+{profile.latestIdp.items.length - 4} item lainnya</p>
                      )}
                    </div>
                  </div>
                )}
              </Section>

              {/* Career Path */}
              <Section title='Career Path' icon='🛤️'
                empty={!profile?.careerPath ? 'Belum ada career path' : undefined}>
                {profile?.careerPath && (
                  <div>
                    <div className='flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-xl'>
                      <div className='w-2 h-2 rounded-full bg-green-500' />
                      <span className='text-xs font-semibold text-gray-700'>{profile.careerPath.currentPosition}</span>
                      <span className='text-xs text-gray-400'>PC {profile.careerPath.currentPCLevel}</span>
                    </div>
                    <div className='space-y-2'>
                      {profile.careerPath.steps.map((step, i) => (
                        <div key={step.id} className='flex items-start gap-3'>
                          <div className='flex flex-col items-center'>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${step.status === 'Completed' ? 'bg-green-500' : step.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-300'}`}>{i+1}</div>
                            {i < profile.careerPath.steps.length - 1 && <div className='w-px h-3 bg-gray-200 mt-1' />}
                          </div>
                          <div className='flex-1 pb-2'>
                            <div className='flex items-center gap-2'>
                              <p className='text-xs font-semibold text-gray-700'>{step.targetPosition}</p>
                              <span className='text-[9px] text-gray-400'>PC {step.targetPCLevel}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${step.direction === 'vertical' ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600'}`}>
                                {step.direction === 'vertical' ? '↑' : '→'} {step.direction}
                              </span>
                            </div>
                            <p className='text-[10px] text-gray-400 mt-0.5'>Est. {step.estimatedYears} tahun · {step.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              {/* SDP */}
              <Section title='Succession Development Plan (SDP)' icon='🎯'
                empty={!profile?.sdp ? 'Tidak ada SDP aktif' : undefined}>
                {profile?.sdp && (
                  <div>
                    <div className='flex items-center justify-between mb-3'>
                      <div>
                        <p className='text-xs font-bold text-gray-700'>Target: {profile.sdp.targetPosition}</p>
                        <p className='text-[10px] text-gray-400 mt-0.5'>Readiness: {profile.sdp.successorReadiness} · Vacancy Risk: {profile.sdp.vacancyRisk}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${profile.sdp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {profile.sdp.status}
                      </span>
                    </div>
                    <div className='space-y-2'>
                      {(profile.sdp.programs || []).map((prog, i) => (
                        <div key={i} className='flex items-center gap-3 p-2 rounded-lg bg-gray-50'>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            prog.type === 'Mentoring' ? 'bg-purple-100 text-purple-700'
                            : prog.type === 'Course' ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                          }`}>{prog.type}</span>
                          <div className='flex-1 min-w-0'>
                            <p className='text-xs text-gray-700 truncate'>{prog.name}</p>
                            <p className='text-[10px] text-gray-400'>{prog.timeline}</p>
                          </div>
                          <span className={`text-[10px] font-semibold flex-shrink-0 ${
                            prog.status === 'Completed' ? 'text-green-600'
                            : prog.status === 'In Progress' ? 'text-blue-600'
                            : 'text-gray-400'
                          }`}>{prog.status}</span>
                        </div>
                      ))}
                    </div>
                    {profile.sdp.careerPlan && (
                      <div className='mt-3 bg-blue-50 rounded-xl px-3 py-2'>
                        <p className='text-xs text-blue-700'>{profile.sdp.careerPlan}</p>
                      </div>
                    )}
                  </div>
                )}
              </Section>

              {/* Successor For */}
              <Section title='Successor Untuk Posisi' icon='🏆'
                empty={!profile?.successorFor?.length ? 'Tidak terdaftar sebagai successor' : undefined}>
                {!!profile?.successorFor?.length && (
                  <div className='space-y-2'>
                    {profile.successorFor.map(s => (
                      <div key={s.id} className='flex items-center gap-3 p-3 rounded-xl bg-gray-50'>
                        <div className='flex-1'>
                          <p className='text-xs font-semibold text-gray-700'>{s.targetPositionName}</p>
                          <p className='text-[10px] text-gray-400 mt-0.5'>Ditambahkan: {s.addedAt}</p>
                        </div>
                        <div className='flex flex-col items-end gap-1'>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${READINESS_COLOR[s.fitnessLevel] || 'bg-gray-100 text-gray-600'}`}>
                            {s.fitnessLevel} Fitness
                          </span>
                          <span className='text-[10px] text-gray-400'>SDP: {s.sdpTerm}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Key Position */}
              {profile?.keyPos && (
                <Section title='Key Position' icon='🔑'>
                  <div className='space-y-3'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <p className='text-sm font-bold text-gray-800'>{profile.keyPos.positionName}</p>
                        <p className='text-xs text-gray-400'>PC Level {profile.keyPos.pcLevel} · Dinilai oleh {profile.keyPos.assessedBy}</p>
                      </div>
                      <Badge className={profile.keyPos.isKeyPosition ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-100 text-gray-600 border-gray-200'}>
                        {profile.keyPos.status}
                      </Badge>
                    </div>
                    {/* Criticality */}
                    <div>
                      <p className='text-xs text-gray-500 mb-1'>Criticality Score</p>
                      <div className='flex gap-1'>
                        {[1,2,3,4,5].map(n => (
                          <div key={n} className={`w-5 h-5 rounded ${n <= profile.keyPos.criticalityScore ? 'bg-red-500' : 'bg-gray-200'}`} />
                        ))}
                        <span className='ml-1 text-xs font-bold text-gray-700'>{profile.keyPos.criticalityScore}/5</span>
                      </div>
                    </div>
                    {profile.keyPos.businessImpact && (
                      <div className='bg-orange-50 rounded-xl px-3 py-2'>
                        <p className='text-xs text-orange-700'>{profile.keyPos.businessImpact}</p>
                      </div>
                    )}
                    {profile?.vacancy && (
                      <div className='flex items-center gap-2 mt-1'>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          profile.vacancy.riskTerm === 'Short' ? 'bg-red-100 text-red-700'
                          : profile.vacancy.riskTerm === 'Mid' ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                        }`}>Vacancy Risk: {profile.vacancy.riskTerm}</span>
                        <span className='text-xs text-gray-400'>Gap pensiun: {profile.vacancy.gapToRetirement} thn</span>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Skills */}
              {profile?.talent?.skills && (
                <Section title='Skills & Kompetensi' icon='🎓'>
                  <div className='flex flex-wrap gap-2'>
                    {profile.talent.skills.split(',').map((s, i) => (
                      <span key={i} className='text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100'>
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
