'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useTalentStore } from '@/store/talentStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

function ReadinessBadge({ term }) {
  const cls = {
    Short: 'bg-red-100 text-red-700',
    Mid:   'bg-amber-100 text-amber-700',
    Long:  'bg-green-100 text-green-700',
  }[term] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{term}</span>
}

function StatusBadge({ status }) {
  const cls = {
    Active:    'bg-green-100 text-green-700',
    Completed: 'bg-blue-100 text-blue-700',
    Inactive:  'bg-gray-100 text-gray-500',
  }[status] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{status}</span>
}

const EMPTY_SDP = { employeeName: '', targetPosition: '', vacancyRisk: 'Mid', successorReadiness: 'Mid', careerPlan: '' }
const EMPTY_PROG = { type: 'Course', name: '', timeline: '', status: 'Planned' }

export default function SDPPage() {
  const { sdpList, addSdp, updateSdp, deleteSdp } = useTalentStore()
  const [showModal, setShowModal] = useState(false)
  const [showProgModal, setShowProgModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(EMPTY_SDP)
  const [currentSdpId, setCurrentSdpId] = useState(null)
  const [progForm, setProgForm] = useState(EMPTY_PROG)
  const [editProgIdx, setEditProgIdx] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [msg, setMsg] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const openNew = () => {
    setEditId(null); setForm(EMPTY_SDP); setShowModal(true)
  }

  const openEdit = (sdp) => {
    setEditId(sdp.id)
    setForm({
      employeeName: sdp.employeeName,
      targetPosition: sdp.targetPosition,
      vacancyRisk: sdp.vacancyRisk,
      successorReadiness: sdp.successorReadiness,
      careerPlan: sdp.careerPlan,
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.employeeName.trim() || !form.targetPosition.trim()) {
      return flash('Nama karyawan dan target posisi wajib diisi.', 'error')
    }
    if (editId) {
      updateSdp(editId, form)
      flash('SDP berhasil diperbarui.')
    } else {
      addSdp(form)
      flash('SDP berhasil dibuat.')
    }
    setShowModal(false)
  }

  const openAddProg = (sdpId) => {
    setCurrentSdpId(sdpId)
    setEditProgIdx(null)
    setProgForm(EMPTY_PROG)
    setShowProgModal(true)
  }

  const openEditProg = (sdpId, idx, prog) => {
    setCurrentSdpId(sdpId)
    setEditProgIdx(idx)
    setProgForm({ ...prog })
    setShowProgModal(true)
  }

  const handleSaveProg = () => {
    if (!progForm.name.trim()) return flash('Nama program wajib diisi.', 'error')
    const sdp = sdpList.find(s => s.id === currentSdpId)
    if (!sdp) return
    let progs = [...(sdp.programs || [])]
    if (editProgIdx !== null) {
      progs[editProgIdx] = progForm
    } else {
      progs.push(progForm)
    }
    updateSdp(currentSdpId, { programs: progs })
    flash('Program berhasil disimpan.')
    setShowProgModal(false)
  }

  const deleteProg = (sdpId, idx) => {
    const sdp = sdpList.find(s => s.id === sdpId)
    if (!sdp) return
    const progs = sdp.programs.filter((_, i) => i !== idx)
    updateSdp(sdpId, { programs: progs })
    flash('Program dihapus.')
  }

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
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>Succession Development Planning</h1>
            <p className='mt-1 text-sm text-gray-500'>Program pengembangan untuk karyawan yang menjadi kandidat penerus posisi kunci</p>
          </div>
        </div>
        <button onClick={openNew}
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
          style={{ background: BRAND }}>
          + Buat SDP
        </button>
      </div>

      {/* Table */}
      <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden mb-4'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr style={{ background: BRAND }}>
                {['No', 'Karyawan (Successor)', 'Target Posisi', 'Vacancy Risk', 'Readiness', 'Program', 'Status', 'Aksi'].map((h, i) => (
                  <th key={i} className='text-left px-4 py-3 text-white font-semibold text-xs whitespace-nowrap'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sdpList.length === 0 && (
                <tr><td colSpan={8} className='px-4 py-10 text-center text-gray-400'>Belum ada SDP.</td></tr>
              )}
              {sdpList.map((sdp, idx) => (
                <tr key={sdp.id} className={`align-middle ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className='px-4 py-3 text-gray-500 text-xs whitespace-nowrap'>{idx + 1}</td>
                  <td className='px-4 py-3 font-semibold text-gray-800 whitespace-nowrap'>{sdp.employeeName}</td>
                  <td className='px-4 py-3 text-gray-700 text-sm max-w-[180px] truncate' title={sdp.targetPosition}>{sdp.targetPosition}</td>
                  <td className='px-4 py-3 whitespace-nowrap'><ReadinessBadge term={sdp.vacancyRisk} /></td>
                  <td className='px-4 py-3 whitespace-nowrap'><ReadinessBadge term={sdp.successorReadiness} /></td>
                  <td className='px-4 py-3 whitespace-nowrap'>
                    <span className='text-gray-700 text-xs'>{(sdp.programs || []).length} program</span>
                  </td>
                  <td className='px-4 py-3 whitespace-nowrap'><StatusBadge status={sdp.status} /></td>
                  <td className='px-4 py-3'>
                    <div className='flex gap-2 whitespace-nowrap'>
                      <button onClick={() => setExpanded(expanded === sdp.id ? null : sdp.id)}
                        className='px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition'>
                        {expanded === sdp.id ? 'Tutup' : 'Detail'}
                      </button>
                      <button onClick={() => openEdit(sdp)}
                        className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                        Edit
                      </button>
                      <button onClick={() => { deleteSdp(sdp.id); flash('SDP dihapus.') }}
                        className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition'>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail/Program panel */}
      {expanded !== null && (() => {
        const sdp = sdpList.find(s => s.id === expanded)
        if (!sdp) return null
        return (
          <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
            <div className='px-5 py-4 border-b border-gray-100 flex items-center justify-between'>
              <div>
                <div className='font-semibold text-gray-800'>{sdp.employeeName} → {sdp.targetPosition}</div>
                {sdp.careerPlan && <div className='text-xs text-gray-400 mt-0.5'>{sdp.careerPlan}</div>}
              </div>
              <div className='flex items-center gap-2'>
                {sdp.status !== 'Completed' && (
                  <button onClick={() => { updateSdp(sdp.id, { status: 'Completed' }); flash('SDP ditandai selesai.') }}
                    className='px-2.5 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition'>
                    Tandai Selesai
                  </button>
                )}
                <button onClick={() => openAddProg(sdp.id)}
                  className='px-2.5 py-1.5 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                  + Tambah Program
                </button>
              </div>
            </div>
            {(sdp.status === 'Completed' || sdp.successorReadiness === 'Short') && (
              <div className='mx-5 my-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3'>
                <div className='text-sm font-bold text-green-800 mb-2'>Successor Siap — Tindak Lanjuti</div>
                <div className='flex flex-wrap gap-2'>
                  <Link href={`/hr/employee/personnel-action?action=Promotion&employee=${encodeURIComponent(sdp.employeeName)}`}
                    className='text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition font-semibold'>
                    Buat Promosi
                  </Link>
                  <Link href={`/hr/employee/personnel-action?action=Transfer&employee=${encodeURIComponent(sdp.employeeName)}`}
                    className='text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-semibold'>
                    Buat Transfer
                  </Link>
                </div>
              </div>
            )}
            <div className='overflow-x-auto'>
              <table className='w-full text-xs'>
                <thead>
                  <tr className='bg-gray-50'>
                    {['No', 'Tipe Program', 'Nama Program', 'Timeline', 'Status', 'Aksi'].map((h, i) => (
                      <th key={i} className='text-left px-4 py-2 text-gray-500 font-semibold'>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(sdp.programs || []).length === 0 ? (
                    <tr><td colSpan={6} className='px-4 py-6 text-center text-gray-400'>Belum ada program SDP.</td></tr>
                  ) : (sdp.programs || []).map((prog, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                      <td className='px-4 py-2 text-gray-400'>{idx + 1}</td>
                      <td className='px-4 py-2'>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                          ${prog.type === 'Mentoring' ? 'bg-purple-100 text-purple-700' : prog.type === 'Project' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {prog.type}
                        </span>
                      </td>
                      <td className='px-4 py-2 font-semibold text-gray-800'>{prog.name}</td>
                      <td className='px-4 py-2 text-gray-600'>{prog.timeline}</td>
                      <td className='px-4 py-2'>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                          ${prog.status === 'Completed' ? 'bg-green-100 text-green-700' : prog.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                          {prog.status}
                        </span>
                      </td>
                      <td className='px-4 py-2'>
                        <div className='flex gap-2'>
                          <button onClick={() => openEditProg(sdp.id, idx, prog)} className='text-red-500 hover:text-red-700 text-xs font-semibold'>Edit</button>
                          <button onClick={() => deleteProg(sdp.id, idx)} className='text-gray-400 hover:text-red-500 text-xs font-bold'>✕</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {/* SDP Modal */}
      {showModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>{editId ? 'Edit SDP' : 'Buat SDP Baru'}</h2>
              <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Karyawan (Successor) <span className='text-red-400'>*</span></label>
                <input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))}
                  placeholder='Nama karyawan…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Target Posisi <span className='text-red-400'>*</span></label>
                <input value={form.targetPosition} onChange={e => setForm(f => ({ ...f, targetPosition: e.target.value }))}
                  placeholder='Posisi yang dituju…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Vacancy Risk</label>
                  <select value={form.vacancyRisk} onChange={e => setForm(f => ({ ...f, vacancyRisk: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                    <option value='Short'>Short</option>
                    <option value='Mid'>Mid</option>
                    <option value='Long'>Long</option>
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Successor Readiness</label>
                  <select value={form.successorReadiness} onChange={e => setForm(f => ({ ...f, successorReadiness: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                    <option value='Short'>Short</option>
                    <option value='Mid'>Mid</option>
                    <option value='Long'>Long</option>
                  </select>
                </div>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Rencana Karir</label>
                <textarea value={form.careerPlan} onChange={e => setForm(f => ({ ...f, careerPlan: e.target.value }))}
                  rows={2} placeholder='Target karir karyawan…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSave}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                {editId ? 'Simpan Perubahan' : 'Buat SDP'}
              </button>
              <button onClick={() => setShowModal(false)}
                className='flex-1 py-2.5 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Modal */}
      {showProgModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowProgModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>{editProgIdx !== null ? 'Edit Program' : 'Tambah Program SDP'}</h2>
              <button onClick={() => setShowProgModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Tipe Program</label>
                <select value={progForm.type} onChange={e => setProgForm(f => ({ ...f, type: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  <option value='Course'>Course</option>
                  <option value='Mentoring'>Mentoring</option>
                  <option value='Project'>Project</option>
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Program <span className='text-red-400'>*</span></label>
                <input value={progForm.name} onChange={e => setProgForm(f => ({ ...f, name: e.target.value }))}
                  placeholder='Nama program…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Timeline</label>
                <input value={progForm.timeline} onChange={e => setProgForm(f => ({ ...f, timeline: e.target.value }))}
                  placeholder='Q2 2024 / 2025…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
                <select value={progForm.status} onChange={e => setProgForm(f => ({ ...f, status: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                  <option value='Planned'>Planned</option>
                  <option value='In Progress'>In Progress</option>
                  <option value='Completed'>Completed</option>
                </select>
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSaveProg}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                {editProgIdx !== null ? 'Simpan Perubahan' : 'Tambah Program'}
              </button>
              <button onClick={() => setShowProgModal(false)}
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
