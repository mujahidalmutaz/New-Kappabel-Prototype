'use client'
import { useState } from 'react'
import { useTalentStore } from '@/store/talentStore'

const BRAND = 'linear-gradient(135deg,#8B1A1A,#D7252B)'

function StatusBadge({ status }) {
  const cls = {
    Draft:     'bg-gray-100 text-gray-600',
    Submitted: 'bg-blue-100 text-blue-700',
    Approved:  'bg-green-100 text-green-700',
  }[status] || 'bg-gray-100 text-gray-500'
  return <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${cls}`}>{status}</span>
}

function ConditionBadge({ gap }) {
  if (gap === null || gap === undefined || gap === '') return null
  const g = parseFloat(gap)
  if (g < 0) return <span className='text-red-600 font-semibold text-xs'>Butuh Dev</span>
  if (g === 0) return <span className='text-green-600 font-semibold text-xs'>Sesuai</span>
  return <span className='text-green-600 font-semibold text-xs'>Di Atas Target</span>
}

const EMPTY_IDP = { employeeName: '', year: new Date().getFullYear() }
const EMPTY_ITEM = {
  competencyType: '', competencyName: '', target: '', actual: '', specificGoal: '',
  courseRecommendation: '', lmsLink: '', ojt: '', timeline: '', idpStatus: 'Planned',
}

export default function IDPPage() {
  const { idpList, addIdp, updateIdp, approveIdp } = useTalentStore()
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [newForm, setNewForm] = useState(EMPTY_IDP)
  const [itemForm, setItemForm] = useState(EMPTY_ITEM)
  const [editItemId, setEditItemId] = useState(null)
  const [currentIdpId, setCurrentIdpId] = useState(null)
  const [msg, setMsg] = useState(null)

  const flash = (text, type = 'success') => {
    setMsg({ text, type }); setTimeout(() => setMsg(null), 3000)
  }

  const years = [...new Set([...idpList.map(i => i.year), new Date().getFullYear()])].sort((a, b) => b - a)

  const filtered = idpList.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false
    if (filterYear !== 'all' && String(i.year) !== String(filterYear)) return false
    return true
  })

  const handleCreateIdp = () => {
    if (!newForm.employeeName.trim()) return flash('Nama karyawan wajib diisi.', 'error')
    addIdp({ employeeName: newForm.employeeName, year: Number(newForm.year) })
    flash('IDP berhasil dibuat.')
    setShowNewModal(false)
  }

  const openAddItem = (idpId) => {
    setCurrentIdpId(idpId)
    setEditItemId(null)
    setItemForm(EMPTY_ITEM)
    setShowItemModal(true)
  }

  const openEditItem = (idpId, item) => {
    setCurrentIdpId(idpId)
    setEditItemId(item.id)
    setItemForm({ ...item })
    setShowItemModal(true)
  }

  const handleSaveItem = () => {
    if (!itemForm.competencyName.trim()) return flash('Nama kompetensi wajib diisi.', 'error')
    const idp = idpList.find(i => i.id === currentIdpId)
    if (!idp) return
    const gap = itemForm.target && itemForm.actual ? parseFloat(itemForm.actual) - parseFloat(itemForm.target) : null
    const newItem = { ...itemForm, id: editItemId || `item-${Date.now()}`, gap, target: parseFloat(itemForm.target), actual: parseFloat(itemForm.actual) }
    const newItems = editItemId
      ? idp.items.map(it => it.id === editItemId ? newItem : it)
      : [...idp.items, newItem]
    updateIdp(currentIdpId, { items: newItems })
    flash(editItemId ? 'Item IDP diperbarui.' : 'Item IDP ditambahkan.')
    setShowItemModal(false)
  }

  const deleteItem = (idpId, itemId) => {
    const idp = idpList.find(i => i.id === idpId)
    if (!idp) return
    updateIdp(idpId, { items: idp.items.filter(it => it.id !== itemId) })
    flash('Item dihapus.')
  }

  const submitToManager = (idpId) => {
    updateIdp(idpId, { status: 'Submitted' })
    flash('IDP berhasil disubmit ke manager.')
  }

  const handleApprove = (idpId) => {
    approveIdp(idpId, 'Manager')
    flash('IDP berhasil diapprove.')
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
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>IDP Management</h1>
            <p className='mt-1 text-sm text-gray-500'>Individual Development Plan — kelola rencana pengembangan karyawan</p>
          </div>
        </div>
        <button onClick={() => { setNewForm(EMPTY_IDP); setShowNewModal(true) }}
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition hover:opacity-90'
          style={{ background: BRAND }}>
          + Buat IDP
        </button>
      </div>

      {/* Filters */}
      <div className='flex gap-2 mb-4 flex-wrap'>
        {['all', 'Draft', 'Submitted', 'Approved'].map(f => (
          <button key={f} onClick={() => setFilterStatus(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition
              ${filterStatus === f ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}>
            {f === 'all' ? 'Semua Status' : f}
          </button>
        ))}
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className='px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
          <option value='all'>Semua Tahun</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* IDP List */}
      <div className='space-y-3'>
        {filtered.length === 0 && (
          <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 px-6 py-12 text-center text-gray-400'>
            Belum ada IDP. Klik "Buat IDP" untuk memulai.
          </div>
        )}
        {filtered.map((idp) => (
          <div key={idp.id} className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
            {/* Row header */}
            <div className='flex items-center justify-between px-5 py-4'>
              <div className='flex items-center gap-3'>
                <div>
                  <div className='font-semibold text-gray-800'>{idp.employeeName}</div>
                  <div className='text-xs text-gray-400 mt-0.5'>Tahun {idp.year} · {idp.items.length} item kompetensi</div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <StatusBadge status={idp.status} />
                {idp.managerApproval && (
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full
                    ${idp.managerApproval === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {idp.managerApproval}
                  </span>
                )}
                {idp.status === 'Draft' && (
                  <button onClick={() => submitToManager(idp.id)}
                    className='px-2.5 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition'>
                    Submit ke Manager
                  </button>
                )}
                {idp.status === 'Submitted' && (
                  <button onClick={() => handleApprove(idp.id)}
                    className='px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition'>
                    Approve
                  </button>
                )}
                <button onClick={() => setExpanded(expanded === idp.id ? null : idp.id)}
                  className='px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition'>
                  {expanded === idp.id ? 'Tutup' : 'Detail'}
                </button>
              </div>
            </div>

            {/* Expanded IDP items */}
            {expanded === idp.id && (
              <div className='border-t border-gray-100'>
                <div className='flex items-center justify-between px-5 py-3 bg-gray-50/60'>
                  <span className='text-xs font-bold text-gray-600'>Item Kompetensi IDP</span>
                  <button onClick={() => openAddItem(idp.id)}
                    className='px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition'>
                    + Tambah Item
                  </button>
                </div>
                {idp.items.length === 0 ? (
                  <div className='px-5 py-6 text-center text-gray-400 text-sm'>Belum ada item IDP.</div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full text-xs'>
                      <thead>
                        <tr className='bg-gray-50'>
                          {['No', 'Tipe', 'Nama Kompetensi', 'Target', 'Aktual', 'Gap', 'Kondisi', 'Specific Goal', 'Rekomendasi Kursus', 'OJT', 'Timeline', 'Status', ''].map((h, i) => (
                            <th key={i} className='text-left px-3 py-2 text-gray-500 font-semibold whitespace-nowrap'>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {idp.items.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                            <td className='px-3 py-2 text-gray-400'>{idx + 1}</td>
                            <td className='px-3 py-2'>{item.competencyType || '—'}</td>
                            <td className='px-3 py-2 font-semibold text-gray-800'>{item.competencyName}</td>
                            <td className='px-3 py-2'>{item.target}</td>
                            <td className='px-3 py-2'>{item.actual}</td>
                            <td className='px-3 py-2'>{item.gap !== null && item.gap !== undefined ? item.gap.toFixed(1) : '—'}</td>
                            <td className='px-3 py-2'><ConditionBadge gap={item.gap} /></td>
                            <td className='px-3 py-2 max-w-[150px]'><span className='line-clamp-2'>{item.specificGoal || '—'}</span></td>
                            <td className='px-3 py-2 max-w-[150px]'><span className='line-clamp-2'>{item.courseRecommendation || '—'}</span></td>
                            <td className='px-3 py-2 max-w-[120px]'><span className='line-clamp-1'>{item.ojt || '—'}</span></td>
                            <td className='px-3 py-2 whitespace-nowrap'>{item.timeline || '—'}</td>
                            <td className='px-3 py-2'>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                                ${item.idpStatus === 'Completed' ? 'bg-green-100 text-green-700' : item.idpStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                {item.idpStatus}
                              </span>
                            </td>
                            <td className='px-3 py-2'>
                              <div className='flex gap-1'>
                                <button onClick={() => openEditItem(idp.id, item)} className='text-red-500 hover:text-red-700 font-bold text-xs'>Edit</button>
                                <button onClick={() => deleteItem(idp.id, item.id)} className='text-gray-400 hover:text-red-500 font-bold text-xs ml-1'>✕</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {idp.approvedAt && (
                  <div className='px-5 py-3 border-t border-gray-100 text-xs text-gray-400'>
                    Diapprove oleh <strong>{idp.approvedBy}</strong> pada {new Date(idp.approvedAt).toLocaleDateString('id-ID')}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New IDP Modal */}
      {showNewModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowNewModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-sm' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>Buat IDP Baru</h2>
              <button onClick={() => setShowNewModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Karyawan <span className='text-red-400'>*</span></label>
                <input value={newForm.employeeName} onChange={e => setNewForm(f => ({ ...f, employeeName: e.target.value }))}
                  placeholder='Nama karyawan…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Tahun</label>
                <input type='number' value={newForm.year} onChange={e => setNewForm(f => ({ ...f, year: e.target.value }))}
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleCreateIdp}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                Buat IDP
              </button>
              <button onClick={() => setShowNewModal(false)}
                className='flex-1 py-2.5 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition'>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4' onClick={() => setShowItemModal(false)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto' onClick={e => e.stopPropagation()}>
            <div className='px-6 py-4 border-b border-gray-100 flex items-center justify-between'>
              <h2 className='text-base font-bold text-gray-800'>{editItemId ? 'Edit Item IDP' : 'Tambah Item IDP'}</h2>
              <button onClick={() => setShowItemModal(false)} className='text-gray-400 hover:text-gray-600 text-xl font-bold'>×</button>
            </div>
            <div className='px-6 py-5 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Tipe Kompetensi</label>
                  <input value={itemForm.competencyType} onChange={e => setItemForm(f => ({ ...f, competencyType: e.target.value }))}
                    placeholder='Leadership, Technical…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Kompetensi <span className='text-red-400'>*</span></label>
                  <input value={itemForm.competencyName} onChange={e => setItemForm(f => ({ ...f, competencyName: e.target.value }))}
                    placeholder='Nama kompetensi…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Target</label>
                  <input type='number' step='0.1' value={itemForm.target} onChange={e => setItemForm(f => ({ ...f, target: e.target.value }))}
                    placeholder='Contoh: 4' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Aktual</label>
                  <input type='number' step='0.1' value={itemForm.actual} onChange={e => setItemForm(f => ({ ...f, actual: e.target.value }))}
                    placeholder='Contoh: 3.5' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
              </div>
              {itemForm.target && itemForm.actual && (
                <div className='text-xs text-gray-500'>
                  Gap: <strong>{(parseFloat(itemForm.actual) - parseFloat(itemForm.target)).toFixed(1)}</strong> —{' '}
                  <ConditionBadge gap={parseFloat(itemForm.actual) - parseFloat(itemForm.target)} />
                </div>
              )}
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Specific Goal</label>
                <textarea value={itemForm.specificGoal} onChange={e => setItemForm(f => ({ ...f, specificGoal: e.target.value }))}
                  rows={2} placeholder='Tujuan spesifik yang ingin dicapai…'
                  className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 resize-none' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Rekomendasi Kursus</label>
                <input value={itemForm.courseRecommendation} onChange={e => setItemForm(f => ({ ...f, courseRecommendation: e.target.value }))}
                  placeholder='Nama kursus yang direkomendasikan…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>LMS Link</label>
                <input value={itemForm.lmsLink} onChange={e => setItemForm(f => ({ ...f, lmsLink: e.target.value }))}
                  placeholder='https://lms.example.com/…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>OJT / On the Job Training</label>
                <input value={itemForm.ojt} onChange={e => setItemForm(f => ({ ...f, ojt: e.target.value }))}
                  placeholder='Deskripsi OJT…' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Timeline</label>
                  <input value={itemForm.timeline} onChange={e => setItemForm(f => ({ ...f, timeline: e.target.value }))}
                    placeholder='Contoh: Q2 2024' className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>Status IDP Item</label>
                  <select value={itemForm.idpStatus} onChange={e => setItemForm(f => ({ ...f, idpStatus: e.target.value }))}
                    className='w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 bg-white'>
                    <option value='Planned'>Planned</option>
                    <option value='In Progress'>In Progress</option>
                    <option value='Completed'>Completed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className='px-6 pb-5 flex gap-3'>
              <button onClick={handleSaveItem}
                className='flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition hover:opacity-90'
                style={{ background: BRAND }}>
                {editItemId ? 'Simpan Perubahan' : 'Tambah Item'}
              </button>
              <button onClick={() => setShowItemModal(false)}
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
