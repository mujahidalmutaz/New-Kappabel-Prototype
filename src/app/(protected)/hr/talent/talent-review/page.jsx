'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

function SdpTermBadge({ term }) {
  const cls = {
    Short: 'bg-red-100 text-red-700',
    Mid:   'bg-amber-100 text-amber-700',
    Long:  'bg-green-100 text-green-700',
  }[term] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{term}</span>
}

function FitnessBadge({ level }) {
  const cls = {
    High:   'bg-green-100 text-green-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low:    'bg-red-100 text-red-700',
  }[level] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{level}</span>
}

function DecisionBadge({ decision }) {
  const cls = {
    'Internal':          'bg-blue-100 text-blue-700',
    'External Hiring':   'bg-orange-100 text-orange-700',
    'Both':              'bg-purple-100 text-purple-700',
  }[decision] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{decision}</span>
}

const fitnessToSdp = { High: 'Short', Medium: 'Mid', Low: 'Long' }

const EMPTY_FORM = {
  keyPositionId: '', meetingDate: '', attendees: '', decision: 'Internal', notes: '',
}

const EMPTY_SUCCESSOR = { employeeId: '', name: '', fitnessLevel: 'Medium', schedule: '' }

export default function TalentReviewPage() {
  const { keyPositions, talentReviews, addTalentReview, updateTalentReview, deleteTalentReview,
    sdpList, addSdp, vacancyRisks, readinessAssessments = [] } = useTalentStore()
  const [showModal, setShowModal] = useState(false)
  const [sdpConfirm, setSdpConfirm] = useState(null) // { successorName, positionName, keyPositionId, sdpTerm }
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [successors, setSuccessors] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [msg, setMsg] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const handleCreateSdp = () => {
    if (!sdpConfirm) return
    const vr = vacancyRisks.find(v => v.keyPositionId === sdpConfirm.keyPositionId)
    addSdp({
      employeeName: sdpConfirm.successorName,
      targetPosition: sdpConfirm.positionName,
      vacancyRisk: vr?.riskTerm || 'Mid',
      successorReadiness: sdpConfirm.sdpTerm,
      careerPlan: '',
      programs: [],
      status: 'Active',
    })
    flash(`✓ SDP berhasil dibuat untuk ${sdpConfirm.successorName}`)
    setSdpConfirm(null)
  }

  const keyOnly = keyPositions.filter(k => k.isKeyPosition)

  const openNew = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setSuccessors([])
    setShowModal(true)
  }

  const openEdit = (rev) => {
    setEditId(rev.id)
    setForm({
      keyPositionId: rev.keyPositionId,
      meetingDate: rev.meetingDate,
      attendees: rev.attendees,
      decision: rev.decision,
      notes: rev.notes,
    })
    setSuccessors(rev.successors || [])
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.keyPositionId || !form.meetingDate) return flash('Key position dan tanggal meeting wajib diisi.', 'error')
    const kp = keyPositions.find(k => k.id === Number(form.keyPositionId))
    const mappedSuccessors = successors.map(s => ({ ...s, sdpTerm: fitnessToSdp[s.fitnessLevel] || 'Long' }))
    const hasShort = mappedSuccessors.some(s => s.sdpTerm === 'Short')
    const autoDecision = !hasShort && mappedSuccessors.length > 0 ? 'External Hiring' : form.decision
    const payload = {
      ...form,
      keyPositionId: Number(form.keyPositionId),
      positionName: kp?.positionName || '',
      successors: mappedSuccessors,
      decision: autoDecision,
    }
    if (editId) {
      updateTalentReview(editId, payload)
      flash('Talent review berhasil diperbarui.')
    } else {
      addTalentReview(payload)
      flash('Talent review meeting berhasil dibuat.')
    }
    setShowModal(false)
  }

  const addSuccessor = () => setSuccessors(s => [...s, { ...EMPTY_SUCCESSOR, id: Date.now() }])
  const updateSuccessor = (idx, patch) => setSuccessors(s => s.map((item, i) => i === idx ? { ...item, ...patch } : item))
  const removeSuccessor = (idx) => setSuccessors(s => s.filter((_, i) => i !== idx))

  return (
    <div>
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold
          ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {msg.text}
        </div>
      )}

      {/* Header */}
      <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-start gap-3'>
          <div className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-sm'
            style={{ background: BRAND }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Talent Review Meeting</h1>
            <p className='mt-1 text-sm text-gray-500'>Kelola sesi review talent dan asesmen penerus untuk key position</p>
          </div>
        </div>
        <button onClick={openNew}
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
          style={{ background: BRAND }}>
          + Buat Review Meeting
        </button>
      </div>

      {/* List */}
      <div className='space-y-3'>
        {talentReviews.length === 0 && (
          <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 px-6 py-12 text-center text-gray-400'>
            Belum ada review meeting. Klik "Buat Review Meeting" untuk memulai.
          </div>
        )}
        {talentReviews.map((rev) => (
          <div key={rev.id} className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
            <div className='flex items-center justify-between px-5 py-4'>
              <div>
                <div className='font-semibold text-gray-800'>{rev.positionName}</div>
                <div className='text-xs text-gray-400 mt-0.5'>
                  {rev.meetingDate} · {rev.attendees} · {rev.successors?.length || 0} successor
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <DecisionBadge decision={rev.decision} />
                <button onClick={() => setExpanded(expanded === rev.id ? null : rev.id)}
                  className='px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition'>
                  {expanded === rev.id ? 'Tutup' : 'Detail'}
                </button>
                <button onClick={() => openEdit(rev)}
                  className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                  Edit
                </button>
                <button onClick={() => { deleteTalentReview(rev.id); flash('Review dihapus.') }}
                  className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition'>
                  Hapus
                </button>
              </div>
            </div>

            {expanded === rev.id && (
              <div className='border-t border-gray-100'>
                {rev.notes && (
                  <div className='px-5 py-3 bg-amber-50/60 text-xs text-amber-800'>
                    <strong>Catatan:</strong> {rev.notes}
                  </div>
                )}
                <div className='overflow-x-auto'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr className='bg-gray-50'>
                        {['No', 'Nama Successor', 'Fitness Level', 'SDP Term', 'Schedule', 'SDP'].map((h, i) => (
                          <th key={i} className='text-left px-4 py-2 text-gray-500 font-semibold'>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(!rev.successors || rev.successors.length === 0) ? (
                        <tr><td colSpan={6} className='px-4 py-6 text-center text-gray-400'>Belum ada successor.</td></tr>
                      ) : rev.successors.map((s, idx) => {
                        const hasSdp = sdpList.some(sp => sp.employeeName === s.name)
                        return (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                            <td className='px-4 py-2 text-gray-400'>{idx + 1}</td>
                            <td className='px-4 py-2 font-semibold text-gray-800'>{s.name}</td>
                            <td className='px-4 py-2'><FitnessBadge level={s.fitnessLevel} /></td>
                            <td className='px-4 py-2'><SdpTermBadge term={s.sdpTerm} /></td>
                            <td className='px-4 py-2 text-gray-600'>{s.schedule}</td>
                            <td className='px-4 py-2'>
                              {hasSdp ? (
                                <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full'>
                                  ✓ SDP Ada
                                </span>
                              ) : (
                                <button
                                  onClick={() => setSdpConfirm({ successorName: s.name, positionName: rev.positionName, keyPositionId: rev.keyPositionId, sdpTerm: s.sdpTerm })}
                                  className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                                  Buat SDP
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SDP Confirm Dialog */}
      {sdpConfirm && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50' onClick={() => setSdpConfirm(null)}>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-80' onClick={e => e.stopPropagation()}>
            <h3 className='text-base font-bold text-gray-800 mb-2'>Buat Succession Development Plan</h3>
            <p className='text-sm text-gray-600 mb-5'>
              Buat Succession Development Plan untuk <strong>{sdpConfirm.successorName}</strong>?
            </p>
            <div className='flex gap-3'>
              <button onClick={handleCreateSdp}
                className='flex-1 py-2 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition'
                style={{ background: BRAND }}>
                Buat SDP
              </button>
              <button onClick={() => setSdpConfirm(null)}
                className='flex-1 py-2 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>{editId ? 'Edit Review Meeting' : 'Buat Review Meeting'}</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Key Position <span className='text-red-400'>*</span></label>
                <select value={form.keyPositionId} onChange={e => setForm(f => ({ ...f, keyPositionId: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  <option value=''>— Pilih Key Position —</option>
                  {keyOnly.map(kp => <option key={kp.id} value={kp.id}>{kp.positionName}</option>)}
                </select>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Tanggal Meeting <span className='text-red-400'>*</span></label>
                  <input type='date' value={form.meetingDate} onChange={e => setForm(f => ({ ...f, meetingDate: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Keputusan</label>
                  <select value={form.decision} onChange={e => setForm(f => ({ ...f, decision: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                    <option value='Internal'>Internal</option>
                    <option value='External Hiring'>External Hiring</option>
                    <option value='Both'>Both</option>
                  </select>
                </div>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Peserta Meeting</label>
                <input value={form.attendees} onChange={e => setForm(f => ({ ...f, attendees: e.target.value }))}
                  placeholder='Corporate Organization Development, HR Director, Division Head…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Catatan</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder='Catatan keputusan meeting…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>

              {/* Successors */}
              <div className='border-t border-gray-100 pt-4'>
                <div className='flex items-center justify-between mb-3'>
                  <span className='text-xs font-bold text-gray-700'>Daftar Successor</span>
                  <button onClick={addSuccessor}
                    className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                    + Tambah Successor
                  </button>
                </div>
                <div className='space-y-3'>
                  {successors.map((s, idx) => (
                    <div key={idx} className='bg-gray-50 rounded-xl p-3 space-y-2'>
                      <div className='flex items-start justify-between gap-2'>
                        <input value={s.name} onChange={e => {
                          const name = e.target.value
                          const ra = readinessAssessments.find(r => r.employeeName === name)
                          if (ra) {
                            const fl = ra.fitnessLevel || ra.overallReadiness || s.fitnessLevel
                            updateSuccessor(idx, { name, fitnessLevel: fl, _raDate: ra.assessedAt || ra.date || '' })
                          } else {
                            updateSuccessor(idx, { name, _raDate: undefined })
                          }
                        }}
                          placeholder='Nama successor…'
                          className='flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                        <button onClick={() => removeSuccessor(idx)} className='text-red-400 hover:text-red-600 text-sm font-bold'>×</button>
                      </div>
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <label className='block text-xs text-gray-500 mb-1'>Fitness Level</label>
                          <select value={s.fitnessLevel} onChange={e => updateSuccessor(idx, { fitnessLevel: e.target.value })}
                            className='w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                            <option value='High'>High</option>
                            <option value='Medium'>Medium</option>
                            <option value='Low'>Low</option>
                          </select>
                          {s._raDate && (
                            <span className='mt-1 inline-block text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded'>
                              dari Readiness Assessment {s._raDate}
                            </span>
                          )}
                        </div>
                        <div>
                          <label className='block text-xs text-gray-500 mb-1'>Schedule</label>
                          <input value={s.schedule} onChange={e => updateSuccessor(idx, { schedule: e.target.value })}
                            placeholder='Q2 2024 / 2025…'
                            className='w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                        </div>
                      </div>
                      <div className='text-xs text-gray-500'>
                        SDP Term (auto): <SdpTermBadge term={fitnessToSdp[s.fitnessLevel] || 'Long'} />
                        <span className='ml-2 text-gray-400'>High→Short, Medium→Mid, Low→Long</span>
                      </div>
                    </div>
                  ))}
                  {successors.length === 0 && (
                    <p className='text-xs text-gray-400 text-center py-3'>Belum ada successor. Klik "+ Tambah Successor".</p>
                  )}
                  {successors.length > 0 && !successors.some(s => fitnessToSdp[s.fitnessLevel] === 'Short') && (
                    <div className='bg-orange-50 rounded-xl px-3 py-2 text-xs text-orange-700'>
                      Tidak ada successor siap jangka pendek — disarankan keputusan: <strong>External Hiring</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSave}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                {editId ? 'Simpan Perubahan' : 'Buat Review Meeting'}
              </button>
              <button onClick={() => setShowModal(false)}
                className='flex-1 py-2.5 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
