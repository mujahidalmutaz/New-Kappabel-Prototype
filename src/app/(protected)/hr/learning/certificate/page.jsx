'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useCertificateStore, THEMES } from '@/store/certificateStore'
import { useT } from '@/store/languageStore'

// ─── Variables ────────────────────────────────────────────────────────────────
const RTF_VARIABLES = [
  { var:'[[learner_name]]',       desc:'Nama lengkap peserta' },
  { var:'[[nik]]',                desc:'NIK / Employee ID' },
  { var:'[[position]]',           desc:'Jabatan peserta' },
  { var:'[[department]]',         desc:'Departemen' },
  { var:'[[company_name]]',       desc:'Nama perusahaan' },
  { var:'[[course_name]]',        desc:'Nama course' },
  { var:'[[course_code]]',        desc:'Kode course' },
  { var:'[[training_hours]]',     desc:'Total jam pelatihan' },
  { var:'[[completion_date]]',    desc:'Tanggal selesai' },
  { var:'[[score]]',              desc:'Nilai akhir' },
  { var:'[[grade]]',              desc:'Predikat (A/B/C)' },
  { var:'[[validity_date]]',      desc:'Tanggal kadaluarsa' },
  { var:'[[certificate_number]]', desc:'Nomor sertifikat' },
  { var:'[[approver_name]]',      desc:'Nama penandatangan' },
  { var:'[[approver_title]]',     desc:'Jabatan penandatangan' },
  { var:'[[issue_date]]',         desc:'Tanggal penerbitan' },
  { var:'[[period]]',             desc:'Periode pelatihan' },
]

const CERT_TYPES   = ['Penyelesaian (Completion)', 'Partisipasi (Participation)', 'Prestasi (Achievement)', 'Excellence Award']
const ORIENTATIONS = ['Landscape', 'Portrait']
const FONTS        = ['Georgia, serif', 'Arial, sans-serif', 'Times New Roman, serif', '"Courier New", monospace', 'Verdana, sans-serif']
const FONT_LABELS  = ['Georgia', 'Arial', 'Times New Roman', 'Courier New', 'Verdana']

const EMPTY_TPL = {
  name: '', type: CERT_TYPES[0], orientation: 'Landscape',
  backgroundImageUrl: null, uploadFileName: null,
  elements: [], showCertNo: false,
  validityMonths: 0, notes: '', status: 'Draft',
}

// ─── Canvas Editor ─────────────────────────────────────────────────────────────
function CanvasEditor({ tpl, onSave, onCancel }) {
  const [form,       setForm      ] = useState({ ...tpl, elements: tpl.elements ? [...tpl.elements] : [] })
  const [selectedId, setSelectedId] = useState(null)
  const [dragging,   setDragging  ] = useState(null)   // {id, offsetX, offsetY}
  const [editingId,  setEditingId ] = useState(null)   // inline text edit
  const [tab,        setTab       ] = useState('elements') // left panel tab
  const [msg,        setMsg       ] = useState(null)
  const canvasRef = useRef()
  const bgRef     = useRef()

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const flash = (t, type='error') => { setMsg({t, type}); setTimeout(() => setMsg(null), 3000) }

  const selected = form.elements.find(e => e.id === selectedId)

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onElemMouseDown = (e, id) => {
    if (editingId === id) return
    e.preventDefault(); e.stopPropagation()
    setSelectedId(id)
    const rect = canvasRef.current.getBoundingClientRect()
    const el   = form.elements.find(x => x.id === id)
    setDragging({ id, offsetX: e.clientX - (el.x / 100 * rect.width), offsetY: e.clientY - (el.y / 100 * rect.height) })
  }

  const onCanvasMouseMove = useCallback((e) => {
    if (!dragging) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.max(0, Math.min(98, ((e.clientX - dragging.offsetX) / rect.width)  * 100))
    const y = Math.max(0, Math.min(98, ((e.clientY - dragging.offsetY) / rect.height) * 100))
    setForm(p => ({ ...p, elements: p.elements.map(el => el.id === dragging.id ? { ...el, x, y } : el) }))
  }, [dragging])

  const onCanvasMouseUp = useCallback(() => setDragging(null), [])

  useEffect(() => {
    window.addEventListener('mousemove', onCanvasMouseMove)
    window.addEventListener('mouseup',   onCanvasMouseUp)
    return () => {
      window.removeEventListener('mousemove', onCanvasMouseMove)
      window.removeEventListener('mouseup',   onCanvasMouseUp)
    }
  }, [onCanvasMouseMove, onCanvasMouseUp])

  // ── Elements ───────────────────────────────────────────────────────────────
  const addText = () => {
    const el = { id: Date.now(), type: 'text', content: 'Teks baru', x: 10, y: 10, fontSize: 14, color: '#1f2937', bold: false, italic: false, align: 'left', fontFamily: FONTS[0] }
    setForm(p => ({ ...p, elements: [...p.elements, el] }))
    setSelectedId(el.id); setTab('props')
  }

  const addVar = (v) => {
    const el = { id: Date.now(), type: 'variable', content: v, x: 20, y: 20, fontSize: 14, color: '#8B1A1A', bold: true, italic: false, align: 'center', fontFamily: FONTS[0] }
    setForm(p => ({ ...p, elements: [...p.elements, el] }))
    setSelectedId(el.id); setTab('props')
  }

  const updateEl = (id, k, v) => {
    setForm(p => ({ ...p, elements: p.elements.map(el => el.id === id ? { ...el, [k]: v } : el) }))
  }

  const deleteEl = (id) => {
    setForm(p => ({ ...p, elements: p.elements.filter(el => el.id !== id) }))
    if (selectedId === id) setSelectedId(null)
  }

  const duplicateEl = (id) => {
    const el = form.elements.find(e => e.id === id)
    if (!el) return
    const copy = { ...el, id: Date.now(), x: el.x + 2, y: el.y + 2 }
    setForm(p => ({ ...p, elements: [...p.elements, copy] }))
    setSelectedId(copy.id)
  }

  const bringFront = (id) => {
    setForm(p => {
      const rest = p.elements.filter(e => e.id !== id)
      const el   = p.elements.find(e => e.id === id)
      return { ...p, elements: [...rest, el] }
    })
  }

  const sendBack = (id) => {
    setForm(p => {
      const rest = p.elements.filter(e => e.id !== id)
      const el   = p.elements.find(e => e.id === id)
      return { ...p, elements: [el, ...rest] }
    })
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleBgUpload = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setForm(p => ({ ...p, backgroundImageUrl: e.target.result, uploadFileName: file.name }))
    reader.readAsDataURL(file)
  }

  const handleSave = (status) => {
    if (!form.name.trim())            { flash('Nama template wajib diisi.'); return }
    if (!form.backgroundImageUrl)     { flash('Harap upload file desain sertifikat.'); return }
    onSave({ ...form, status })
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className='fixed inset-0 z-50 bg-gray-900 flex flex-col' style={{ fontFamily: 'system-ui, sans-serif' }}>

      {/* Top bar */}
      <div className='flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shrink-0'>
        <div className='flex items-center gap-3'>
          <button onClick={onCancel} className='text-gray-400 hover:text-gray-600 transition'>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <div className='flex items-center gap-2'>
              <input value={form.name} onChange={e => setF('name', e.target.value)}
                placeholder='Nama Template…'
                className='text-sm font-bold text-gray-800 bg-transparent outline-none border-b border-transparent focus:border-red-300 transition w-64' />
              {form.uploadFileName && (
                <span className='text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full'>📤 {form.uploadFileName}</span>
              )}
            </div>
            <p className='text-[10px] text-gray-400'>{form.elements.length} elemen · {form.orientation}</p>
          </div>
        </div>

        {msg && (
          <div className={`text-xs px-3 py-1.5 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{msg.t}</div>
        )}

        <div className='flex gap-2'>
          <button onClick={() => handleSave('Draft')}
            className='px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition'>
            Simpan Draft
          </button>
          <button onClick={() => handleSave('Active')}
            className='px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition'
            style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
            ✅ Aktifkan
          </button>
        </div>
      </div>

      <div className='flex flex-1 overflow-hidden'>

        {/* ── Left panel ─────────────────────────────────────────────────────── */}
        <div className='w-72 bg-white border-r border-gray-200 flex flex-col shrink-0'>

          {/* Panel tabs */}
          <div className='flex border-b border-gray-100'>
            {[['elements','🧩 Elemen'],['vars','{ } Variabel'],['props','⚙️ Properti'],['settings','🗂️ Info']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex-1 py-2.5 text-[10px] font-bold whitespace-nowrap transition border-b-2 ${tab===k?'border-red-600 text-red-700 bg-red-50':'border-transparent text-gray-400 hover:text-gray-600'}`}>
                {l}
              </button>
            ))}
          </div>

          <div className='flex-1 overflow-y-auto p-4 space-y-3'>

            {/* ── Elements tab ── */}
            {tab === 'elements' && (
              <>
                <div className='grid grid-cols-2 gap-2'>
                  <button onClick={addText}
                    className='flex flex-col items-center justify-center gap-1.5 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition text-gray-500 hover:text-red-600'>
                    <span className='text-xl'>T</span>
                    <span className='text-[10px] font-semibold'>Teks Bebas</span>
                  </button>
                  <button onClick={() => setTab('vars')}
                    className='flex flex-col items-center justify-center gap-1.5 py-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition text-gray-500 hover:text-purple-600'>
                    <span className='text-xl'>{'{ }'}</span>
                    <span className='text-[10px] font-semibold'>Variabel</span>
                  </button>
                </div>

                {/* Upload background */}
                <div>
                  <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2'>Background</p>
                  <div className='border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition'
                    style={{ borderColor: form.backgroundImageUrl ? '#D7252B' : '#d1d5db' }}
                    onClick={() => bgRef.current?.click()}>
                    <input ref={bgRef} type='file' accept='image/*' className='hidden' onChange={e => handleBgUpload(e.target.files[0])} />
                    {form.backgroundImageUrl ? (
                      <div className='flex flex-col items-center gap-1'>
                        <img src={form.backgroundImageUrl} alt='bg' className='max-h-16 object-contain rounded' />
                        <span className='text-[10px] text-red-500'>Klik untuk ganti</span>
                      </div>
                    ) : (
                      <div>
                        <div className='text-2xl mb-1'>📤</div>
                        <p className='text-xs font-semibold text-gray-500'>Upload Background</p>
                        <p className='text-[10px] text-gray-400'>PNG, JPG</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Layer list */}
                {form.elements.length > 0 && (
                  <div>
                    <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2'>Layer ({form.elements.length})</p>
                    <div className='space-y-1'>
                      {[...form.elements].reverse().map(el => (
                        <button key={el.id} onClick={() => { setSelectedId(el.id); setTab('props') }}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition ${selectedId===el.id?'bg-red-50 border border-red-200':'hover:bg-gray-50 border border-transparent'}`}>
                          <span className='text-base shrink-0'>{el.type==='variable'?'{ }':'T'}</span>
                          <span className='flex-1 truncate text-left text-gray-700'>{el.content}</span>
                          <button onClick={e=>{e.stopPropagation(); deleteEl(el.id)}} className='text-gray-300 hover:text-red-500 transition shrink-0'>✕</button>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Variables tab ── */}
            {tab === 'vars' && (
              <>
                <p className='text-xs text-gray-500'>Klik variabel untuk menambahkannya ke canvas.</p>
                <div className='space-y-1'>
                  {RTF_VARIABLES.map(v => (
                    <button key={v.var} onClick={() => addVar(v.var)}
                      className='w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 transition text-left'>
                      <code className='text-[10px] font-mono text-red-700 bg-red-50 px-1.5 py-0.5 rounded flex-1'>{v.var}</code>
                      <span className='text-[10px] text-gray-400 shrink-0 max-w-[80px] truncate'>{v.desc}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── Properties tab ── */}
            {tab === 'props' && (
              <>
                {!selected ? (
                  <div className='text-center py-8 text-gray-400 text-xs'>
                    <div className='text-3xl mb-2'>👆</div>
                    Klik elemen di canvas untuk mengedit propertinya
                  </div>
                ) : (
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-bold text-gray-600'>
                        {selected.type === 'variable' ? '{ } Variabel' : 'T Teks'}
                      </span>
                      <div className='flex gap-1'>
                        <button onClick={() => bringFront(selected.id)} title='Bring to front' className='text-[10px] text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded'>↑</button>
                        <button onClick={() => sendBack(selected.id)} title='Send to back' className='text-[10px] text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded'>↓</button>
                        <button onClick={() => duplicateEl(selected.id)} className='text-[10px] text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded'>⧉</button>
                        <button onClick={() => deleteEl(selected.id)} className='text-[10px] text-red-400 hover:text-red-600 bg-red-50 px-2 py-1 rounded'>🗑</button>
                      </div>
                    </div>

                    {selected.type === 'text' && (
                      <div>
                        <label className='block text-[10px] font-bold text-gray-500 mb-1'>Isi Teks</label>
                        <textarea value={selected.content} rows={3}
                          onChange={e => updateEl(selected.id, 'content', e.target.value)}
                          className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-300 resize-none' />
                      </div>
                    )}

                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <label className='block text-[10px] font-bold text-gray-500 mb-1'>X (%)</label>
                        <input type='number' min='0' max='98' value={Math.round(selected.x)}
                          onChange={e => updateEl(selected.id, 'x', Number(e.target.value))}
                          className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-300' />
                      </div>
                      <div>
                        <label className='block text-[10px] font-bold text-gray-500 mb-1'>Y (%)</label>
                        <input type='number' min='0' max='98' value={Math.round(selected.y)}
                          onChange={e => updateEl(selected.id, 'y', Number(e.target.value))}
                          className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-300' />
                      </div>
                    </div>

                    <div>
                      <label className='block text-[10px] font-bold text-gray-500 mb-1'>Font</label>
                      <select value={selected.fontFamily} onChange={e => updateEl(selected.id, 'fontFamily', e.target.value)}
                        className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-300'>
                        {FONTS.map((f, i) => <option key={f} value={f}>{FONT_LABELS[i]}</option>)}
                      </select>
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <label className='block text-[10px] font-bold text-gray-500 mb-1'>Ukuran</label>
                        <input type='number' min='6' max='72' value={selected.fontSize}
                          onChange={e => updateEl(selected.id, 'fontSize', Number(e.target.value))}
                          className='w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-300' />
                      </div>
                      <div>
                        <label className='block text-[10px] font-bold text-gray-500 mb-1'>Warna</label>
                        <input type='color' value={selected.color} onChange={e => updateEl(selected.id, 'color', e.target.value)}
                          className='w-full h-[34px] px-1 py-1 border border-gray-200 rounded-lg cursor-pointer' />
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      {[['bold','B','font-bold'],['italic','I','italic']].map(([k,l,cls]) => (
                        <button key={k} onClick={() => updateEl(selected.id, k, !selected[k])}
                          className={`flex-1 py-2 text-xs rounded-lg border transition ${cls} ${selected[k]?'border-red-400 bg-red-50 text-red-700':'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          {l}
                        </button>
                      ))}
                      {['left','center','right'].map(a => (
                        <button key={a} onClick={() => updateEl(selected.id, 'align', a)}
                          className={`flex-1 py-2 text-xs rounded-lg border transition ${selected.align===a?'border-red-400 bg-red-50 text-red-700':'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                          {a==='left'?'⬅':a==='center'?'⬛':'➡'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Settings tab ── */}
            {tab === 'settings' && (
              <>
                <div>
                  <label className='block text-[10px] font-bold text-gray-500 mb-1'>Nama Template *</label>
                  <input value={form.name} onChange={e => setF('name', e.target.value)}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                    placeholder='Nama template' />
                </div>
                <div>
                  <label className='block text-[10px] font-bold text-gray-500 mb-1'>Tipe Sertifikat</label>
                  <select value={form.type} onChange={e => setF('type', e.target.value)}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                    {CERT_TYPES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-[10px] font-bold text-gray-500 mb-1'>Orientasi</label>
                  <div className='flex gap-2'>
                    {ORIENTATIONS.map(o => (
                      <button key={o} onClick={() => setF('orientation', o)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${form.orientation===o?'border-red-400 bg-red-50 text-red-700':'border-gray-200 text-gray-600'}`}>
                        {o==='Landscape'?'▭':'▯'} {o}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className='block text-[10px] font-bold text-gray-500 mb-1'>Masa Berlaku (bulan, 0 = selamanya)</label>
                  <input type='number' min='0' value={form.validityMonths} onChange={e => setF('validityMonths', Number(e.target.value))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-[10px] font-bold text-gray-500 mb-1'>Catatan Internal</label>
                  <textarea value={form.notes} onChange={e => setF('notes', e.target.value)} rows={3} resize='none'
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Canvas area ────────────────────────────────────────────────────── */}
        <div className='flex-1 flex items-center justify-center p-8 overflow-auto bg-gray-800'
          onClick={() => { setSelectedId(null); setEditingId(null) }}>

          {!form.backgroundImageUrl ? (
            <div className='flex flex-col items-center gap-4 text-gray-400 cursor-pointer'
              onClick={e => { e.stopPropagation(); bgRef.current?.click() }}>
              <div className='w-24 h-24 rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center text-4xl'>📤</div>
              <p className='text-sm font-semibold'>Upload background sertifikat</p>
              <p className='text-xs'>PNG, JPG · atau klik "Background" di panel kiri</p>
            </div>
          ) : (
            <div
              ref={canvasRef}
              className='relative select-none shadow-2xl'
              style={{
                aspectRatio: form.orientation === 'Landscape' ? '1.414/1' : '1/1.414',
                maxWidth:    form.orientation === 'Landscape' ? '900px' : '550px',
                maxHeight:   form.orientation === 'Landscape' ? '636px' : '777px',
                width: '100%',
                cursor: dragging ? 'grabbing' : 'default',
              }}
              onClick={e => { e.stopPropagation(); setSelectedId(null); setEditingId(null) }}>

              {/* Background image */}
              <img src={form.backgroundImageUrl} alt='template'
                className='w-full h-full object-cover rounded'
                draggable={false} />

              {/* Elements */}
              {form.elements.map(el => (
                <div key={el.id}
                  onMouseDown={e => onElemMouseDown(e, el.id)}
                  onDoubleClick={e => { e.stopPropagation(); if (el.type === 'text') setEditingId(el.id) }}
                  style={{
                    position:  'absolute',
                    left:      `${el.x}%`,
                    top:       `${el.y}%`,
                    fontSize:  el.fontSize,
                    color:     el.color,
                    fontWeight:  el.bold   ? 700 : 400,
                    fontStyle:   el.italic ? 'italic' : 'normal',
                    textAlign:   el.align || 'left',
                    fontFamily:  el.fontFamily || 'Georgia, serif',
                    cursor:      dragging?.id === el.id ? 'grabbing' : 'grab',
                    userSelect:  'none',
                    whiteSpace:  'nowrap',
                    outline:     selectedId === el.id ? '1.5px dashed #D7252B' : '1.5px dashed transparent',
                    outlineOffset: '3px',
                    padding:     '2px 4px',
                    borderRadius: 2,
                    background:  selectedId === el.id ? 'rgba(215,37,43,0.06)' : 'transparent',
                    transform:   'translate(0,0)',
                    zIndex:      selectedId === el.id ? 10 : 1,
                  }}>
                  {editingId === el.id ? (
                    <input
                      autoFocus
                      value={el.content}
                      onChange={e => updateEl(el.id, 'content', e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setEditingId(null) }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize:   el.fontSize,
                        color:      el.color,
                        fontWeight: el.bold   ? 700 : 400,
                        fontStyle:  el.italic ? 'italic' : 'normal',
                        fontFamily: el.fontFamily,
                        background: 'rgba(255,255,255,0.9)',
                        border:     '1px solid #D7252B',
                        outline:    'none',
                        borderRadius: 2,
                        padding:    '1px 4px',
                        minWidth:   80,
                      }}
                    />
                  ) : el.content}

                  {/* Drag handle hint */}
                  {selectedId === el.id && (
                    <span style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)', fontSize:9, color:'#D7252B', background:'white', padding:'1px 4px', borderRadius:3, border:'1px solid #fca5a5', whiteSpace:'nowrap', pointerEvents:'none' }}>
                      ✥ drag · {el.type==='text'?'dbl-click edit':''}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right mini panel ───────────────────────────────────────────────── */}
        <div className='w-14 bg-gray-900 flex flex-col items-center py-4 gap-3 shrink-0'>
          {[
            { icon:'T', label:'Teks', action: addText },
            { icon:'{ }', label:'Var', action: () => setTab('vars') },
            { icon:'📤', label:'BG', action: () => bgRef.current?.click() },
          ].map(item => (
            <button key={item.icon} onClick={item.action} title={item.label}
              className='w-10 h-10 rounded-xl bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white text-xs font-bold transition'>
              {item.icon}
            </button>
          ))}
          {selectedId && (
            <button onClick={() => deleteEl(selectedId)} title='Hapus elemen terpilih'
              className='w-10 h-10 rounded-xl bg-red-900 hover:bg-red-700 flex items-center justify-center text-white text-xs transition'>
              🗑
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── Card preview ─────────────────────────────────────────────────────────────
function TplCard({ tpl, onEdit, onDuplicate, onDelete }) {
  return (
    <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition'>
      <div className='h-1.5' style={{ background: 'linear-gradient(90deg,#8B1A1A,#D7252B)' }} />
      <div className='p-4 pb-3'>
        {tpl.backgroundImageUrl ? (
          <div className='rounded-lg overflow-hidden border border-gray-100' style={{ aspectRatio: tpl.orientation==='Landscape'?'1.414/1':'1/1.414' }}>
            <img src={tpl.backgroundImageUrl} alt='preview' className='w-full h-full object-cover' />
          </div>
        ) : (
          <div className='rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-2xl'
            style={{ aspectRatio:'1.414/1' }}>📜</div>
        )}
      </div>
      <div className='px-4 pb-4'>
        <div className='flex items-start justify-between mb-2'>
          <h3 className='font-bold text-gray-800 text-sm leading-tight'>{tpl.name}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2 ${tpl.status==='Active'?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>
            {tpl.status}
          </span>
        </div>
        <div className='flex items-center gap-2 mb-3 flex-wrap'>
          <span className='text-xs text-gray-400'>📤 {tpl.uploadFileName || 'Uploaded'}</span>
          <span className='text-gray-200'>·</span>
          <span className='text-xs text-gray-400'>{tpl.orientation}</span>
          <span className='text-gray-200'>·</span>
          <span className='text-xs text-gray-400'>{(tpl.elements||[]).length} elemen</span>
        </div>
        <div className='flex gap-1.5'>
          <button onClick={() => onEdit(tpl)}
            className='flex-1 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition'
            style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
            ✏️ Edit
          </button>
          <button onClick={() => onDuplicate(tpl)} className='px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition'>⧉</button>
          <button onClick={() => onDelete(tpl.id)} className='px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition'>🗑</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MasterCertificatePage() {
  const { templates, setTemplates } = useCertificateStore()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTpl, setEditingTpl] = useState(null)
  const [msg,        setMsg       ] = useState(null)

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleNew       = ()    => { setEditingTpl({...EMPTY_TPL, id:null}); setEditorOpen(true) }
  const handleEdit      = (tpl) => { setEditingTpl({...tpl}); setEditorOpen(true) }
  const handleDelete    = (id)  => { setTemplates(p=>p.filter(t=>t.id!==id)); flash('Template dihapus.') }
  const handleDuplicate = (tpl) => {
    const copy = {...tpl, id:Date.now(), name:`${tpl.name} (Salinan)`, status:'Draft'}
    setTemplates(p=>[copy,...p]); flash(`"${tpl.name}" berhasil diduplikasi.`)
  }
  const handleSave = (form) => {
    if (form.id) {
      setTemplates(p=>p.map(t=>t.id===form.id?form:t)); flash(`"${form.name}" diperbarui.`)
    } else {
      setTemplates(p=>[{...form, id:Date.now()},...p]); flash(`"${form.name}" berhasil dibuat.`)
    }
    setEditorOpen(false); setEditingTpl(null)
  }

  const activeCount = templates.filter(t=>t.status==='Active').length

  if (editorOpen && editingTpl) {
    return <CanvasEditor tpl={editingTpl} onSave={handleSave} onCancel={()=>{setEditorOpen(false);setEditingTpl(null)}} />
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Certificate Template</h1>
      <p className='text-gray-500 text-sm mb-6'>
        Upload desain sertifikat, lalu tambahkan teks dan variabel dinamis langsung di atas gambar.
      </p>

      {msg && (
        <div className={`text-xs px-4 py-3 rounded-lg mb-4 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>
      )}

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[
          ['Total Template', templates.length,          '📄','#8B1A1A'],
          ['Active',         activeCount,               '✅','#059669'],
          ['Draft',          templates.length-activeCount,'📝','#d97706'],
          ['Elemen Total',   templates.reduce((s,t)=>s+(t.elements||[]).length,0),'🔖','#7c3aed'],
        ].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{background:c+'22'}}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='flex justify-between items-center mb-4'>
        <p className='text-sm text-gray-500'>{templates.length} template</p>
        <button onClick={handleNew}
          className='px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 flex items-center gap-2 transition'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          + Buat Template Baru
        </button>
      </div>

      {templates.length === 0 ? (
        <div className='bg-white rounded-2xl p-16 text-center shadow-sm'>
          <div className='text-5xl mb-4'>📜</div>
          <h3 className='font-bold text-gray-700 mb-1'>Belum ada template</h3>
          <p className='text-sm text-gray-400 mb-5'>Upload desain sertifikat dan tambahkan variabel dinamis di atasnya.</p>
          <button onClick={handleNew} className='px-6 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90'
            style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
            + Buat Template Baru
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5'>
          {templates.map(tpl=>(
            <TplCard key={tpl.id} tpl={tpl}
              onEdit={handleEdit} onDuplicate={handleDuplicate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
