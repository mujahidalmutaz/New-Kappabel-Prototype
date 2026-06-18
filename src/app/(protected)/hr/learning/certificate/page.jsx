'use client'
import { useState, useRef } from 'react'
import { useCertificateStore, THEMES } from '@/store/certificateStore'
import { useT } from '@/store/languageStore'

// ─── Variable reference ────────────────────────────────────────────────────────
const RTF_VARIABLES = [
  { var:'[[learner_name]]',       desc:'Nama lengkap peserta' },
  { var:'[[nik]]',                desc:'NIK / Employee ID' },
  { var:'[[position]]',           desc:'Jabatan peserta' },
  { var:'[[department]]',         desc:'Departemen peserta' },
  { var:'[[company_name]]',       desc:'Nama perusahaan' },
  { var:'[[course_name]]',        desc:'Nama course / pelatihan' },
  { var:'[[course_code]]',        desc:'Kode course' },
  { var:'[[training_hours]]',     desc:'Total jam pelatihan' },
  { var:'[[completion_date]]',    desc:'Tanggal selesai (dd MMMM yyyy)' },
  { var:'[[score]]',              desc:'Nilai akhir (angka)' },
  { var:'[[grade]]',              desc:'Predikat kelulusan (A/B/C)' },
  { var:'[[validity_date]]',      desc:'Tanggal kadaluarsa sertifikat' },
  { var:'[[certificate_number]]', desc:'Nomor sertifikat (auto-generated)' },
  { var:'[[approver_name]]',      desc:'Nama penandatangan' },
  { var:'[[approver_title]]',     desc:'Jabatan penandatangan' },
  { var:'[[issue_date]]',         desc:'Tanggal penerbitan' },
  { var:'[[period]]',             desc:'Periode pelatihan' },
]

const CERT_TYPES   = ['Penyelesaian (Completion)', 'Partisipasi (Participation)', 'Prestasi (Achievement)', 'Excellence Award']
const ORIENTATIONS = ['Landscape', 'Portrait']
const LOGO_POSITIONS = ['Kiri', 'Tengah', 'Kanan']

const EMPTY_TPL = {
  name: '',
  type: CERT_TYPES[0],
  orientation: 'Landscape',
  themeId: 'navy',
  headerTitle: 'CERTIFICATE OF COMPLETION',
  subTitle: 'Sertifikat ini diberikan kepada',
  bodyText: 'yang telah berhasil menyelesaikan pelatihan [[course_name]] selama [[training_hours]] jam dengan nilai [[score]] ([[grade]]).',
  footerText: 'Diterbitkan pada [[issue_date]] · Berlaku hingga [[validity_date]]',
  approverName: '',
  approverTitle: '',
  logoUrl: null,
  logoPosition: 'Kiri',
  showSeal: true,
  showCertNo: true,
  validityMonths: 0,
  notes: '',
  status: 'Draft',
  // Upload mode
  uploadMode: false,
  backgroundImageUrl: null,
  uploadFileName: null,
  overlays: [],   // [{id, var, x, y, fontSize, color, bold}]
}

// ─── Built-from-scratch Certificate Preview ───────────────────────────────────
function CertPreview({ tpl, themes }) {
  const theme = themes.find(t => t.id === tpl.themeId) || themes[0]
  const isLandscape = tpl.orientation === 'Landscape'

  if (tpl.uploadMode && tpl.backgroundImageUrl) {
    return (
      <div style={{
        aspectRatio: isLandscape ? '1.414/1' : '1/1.414',
        position: 'relative', width: '100%', overflow: 'hidden',
        borderRadius: 8, border: '1px solid #e5e7eb',
      }}>
        <img src={tpl.backgroundImageUrl} alt='template'
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {/* Overlay badges */}
        {(tpl.overlays || []).map(ov => (
          <div key={ov.id} style={{
            position: 'absolute',
            left: `${ov.x}%`, top: `${ov.y}%`,
            transform: 'translate(-50%,-50%)',
            fontSize: (ov.fontSize || 8) * 0.6,
            color: ov.color || '#8B1A1A',
            fontWeight: ov.bold ? 700 : 400,
            background: 'rgba(255,255,255,0.7)',
            padding: '1px 3px', borderRadius: 2,
            whiteSpace: 'nowrap', pointerEvents: 'none',
          }}>{ov.var}</div>
        ))}
        {tpl.showCertNo && (
          <div style={{ position:'absolute', top:4, right:8, fontSize:5, color:'rgba(0,0,0,0.4)', fontFamily:'monospace' }}>
            [[certificate_number]]
          </div>
        )}
      </div>
    )
  }

  const logoEl = tpl.logoUrl ? (
    <img src={tpl.logoUrl} alt='logo' style={{ height: 28, objectFit: 'contain' }} />
  ) : (
    <div style={{ width:28, height:28, borderRadius:4, background:`${theme.primary}33`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>🏢</div>
  )

  return (
    <div style={{
      aspectRatio: isLandscape ? '1.414/1' : '1/1.414',
      background: theme.bg, border: `3px solid ${theme.border}`,
      borderRadius: 8, overflow: 'hidden', position: 'relative',
      width: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'Georgia, serif',
    }}>
      <div style={{ position:'absolute', inset:5, border:`1px solid ${theme.border}44`, borderRadius:5, pointerEvents:'none', zIndex:1 }} />
      <div style={{ background:`linear-gradient(135deg,${theme.primary},${theme.accent})`, padding:'8px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        {tpl.logoPosition === 'Kiri' && logoEl}
        <div style={{ flex:1, textAlign: tpl.logoPosition==='Tengah'?'center': tpl.logoPosition==='Kiri'?'center':'left' }}>
          {tpl.logoPosition === 'Tengah' && <div style={{ display:'flex', justifyContent:'center', marginBottom:3 }}>{logoEl}</div>}
          <div style={{ color:'white', fontWeight:700, fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase' }}>{tpl.headerTitle||'CERTIFICATE'}</div>
          <div style={{ color:'rgba(255,255,255,0.7)', fontSize:6, letterSpacing:'0.08em', marginTop:2 }}>{tpl.type}</div>
        </div>
        {tpl.logoPosition === 'Kanan' && logoEl}
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'8px 16px', textAlign:'center' }}>
        <div style={{ fontSize:6, color:`${theme.text}99`, marginBottom:4, letterSpacing:'0.05em' }}>{tpl.subTitle}</div>
        <div style={{ fontSize:13, fontWeight:700, color:theme.primary, fontStyle:'italic', borderBottom:`1px solid ${theme.accent}55`, paddingBottom:4, marginBottom:6, width:'70%' }}>[[learner_name]]</div>
        <div style={{ fontSize:6, color:`${theme.text}88`, maxWidth:'80%', lineHeight:1.6 }}>{tpl.bodyText.length>100?tpl.bodyText.slice(0,100)+'…':tpl.bodyText}</div>
      </div>
      <div style={{ padding:'6px 14px', borderTop:`1px solid ${theme.border}33`, display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexShrink:0 }}>
        <div style={{ fontSize:5, color:`${theme.text}66` }}>{tpl.footerText.slice(0,50)}</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
          {tpl.showSeal && (
            <div style={{ width:22, height:22, borderRadius:'50%', border:`1.5px solid ${theme.accent}`, background:`${theme.accent}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9 }}>🏆</div>
          )}
          {tpl.approverName && (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:40, borderBottom:`0.5px solid ${theme.text}66`, marginBottom:2 }} />
              <div style={{ fontSize:5, color:`${theme.text}88`, fontWeight:700 }}>{tpl.approverName}</div>
              <div style={{ fontSize:4.5, color:`${theme.text}55` }}>{tpl.approverTitle}</div>
            </div>
          )}
        </div>
      </div>
      {tpl.showCertNo && (
        <div style={{ position:'absolute', top:6, right:12, fontSize:4.5, color:`${theme.text}55`, fontFamily:'monospace', zIndex:2 }}>[[certificate_number]]</div>
      )}
    </div>
  )
}

// ─── Overlay item (for upload mode) ───────────────────────────────────────────
function OverlayRow({ ov, onChange, onRemove }) {
  return (
    <div className='flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200'>
      <span className='font-mono text-[10px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded flex-1 min-w-0 truncate'>{ov.var}</span>
      <div className='flex items-center gap-1 shrink-0'>
        <label className='text-[10px] text-gray-400'>X%</label>
        <input type='number' min='0' max='100' value={ov.x}
          onChange={e => onChange({ ...ov, x: Number(e.target.value) })}
          className='w-12 px-1.5 py-1 border border-gray-200 rounded text-xs outline-none focus:border-red-300' />
        <label className='text-[10px] text-gray-400'>Y%</label>
        <input type='number' min='0' max='100' value={ov.y}
          onChange={e => onChange({ ...ov, y: Number(e.target.value) })}
          className='w-12 px-1.5 py-1 border border-gray-200 rounded text-xs outline-none focus:border-red-300' />
        <input type='number' min='6' max='36' value={ov.fontSize || 12}
          onChange={e => onChange({ ...ov, fontSize: Number(e.target.value) })}
          title='Font size'
          className='w-12 px-1.5 py-1 border border-gray-200 rounded text-xs outline-none focus:border-red-300' />
        <input type='color' value={ov.color || '#8B1A1A'}
          onChange={e => onChange({ ...ov, color: e.target.value })}
          className='w-7 h-7 rounded border border-gray-200 cursor-pointer p-0.5' />
        <button onClick={onRemove} className='text-red-400 hover:text-red-600 text-sm px-1'>✕</button>
      </div>
    </div>
  )
}

// ─── Visual Editor Panel ───────────────────────────────────────────────────────
function TemplateEditor({ tpl, onSave, onCancel, themes }) {
  const [form, setForm]         = useState({ ...tpl })
  const [editorTab, setEditorTab] = useState(tpl.uploadMode ? 'upload' : 'identity')
  const [copiedVar, setCopiedVar] = useState(null)
  const logoRef   = useRef()
  const bgRef     = useRef()

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const insertVar = (v, field) => {
    set(field, (form[field] || '') + v)
    setCopiedVar(v); setTimeout(() => setCopiedVar(null), 1000)
  }

  const handleLogoUpload = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => set('logoUrl', e.target.result)
    reader.readAsDataURL(file)
  }

  const handleBgUpload = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => setForm(p => ({ ...p, backgroundImageUrl: e.target.result, uploadMode: true, uploadFileName: file.name }))
    reader.readAsDataURL(file)
  }

  const addOverlay = (varStr) => {
    const ov = { id: Date.now(), var: varStr, x: 50, y: 50, fontSize: 14, color: '#1f2937', bold: false }
    setForm(p => ({ ...p, overlays: [...(p.overlays || []), ov] }))
  }

  const updateOverlay = (updated) => {
    setForm(p => ({ ...p, overlays: p.overlays.map(o => o.id === updated.id ? updated : o) }))
  }

  const removeOverlay = (id) => {
    setForm(p => ({ ...p, overlays: p.overlays.filter(o => o.id !== id) }))
  }

  const theme = themes.find(t => t.id === form.themeId) || themes[0]

  const EDITOR_TABS = form.uploadMode
    ? [['upload','📤 Upload'], ['overlays','🔖 Variabel'], ['signature','✍️ Tanda Tangan'], ['identity','📋 Identitas']]
    : [['identity','📋 Identitas'], ['layout','🎨 Tampilan'], ['content','✏️ Konten'], ['signature','✍️ Tanda Tangan']]

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-6 pb-6 px-4 overflow-y-auto'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-6xl'>

        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <div>
            <h2 className='text-base font-bold text-gray-800'>✏️ {form.id ? 'Edit' : 'Buat'} Template Sertifikat</h2>
            <p className='text-xs text-gray-400 mt-0.5'>{form.name || 'Nama belum diisi'}</p>
          </div>
          <div className='flex gap-2'>
            <button onClick={() => onSave({ ...form, status: 'Draft' })}
              className='px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>
              Simpan Draft
            </button>
            <button onClick={() => onSave({ ...form, status: 'Active' })}
              className='px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90'
              style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
              ✅ Aktifkan Template
            </button>
            <button onClick={onCancel} className='px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700'>✕</button>
          </div>
        </div>

        <div className='flex' style={{ minHeight: 560 }}>

          {/* Left: panels */}
          <div className='w-[420px] border-r border-gray-100 flex flex-col'>
            {/* Mode toggle */}
            {!form.id && (
              <div className='px-5 pt-4 pb-3 border-b border-gray-100'>
                <div className='flex gap-2'>
                  <button onClick={() => { setForm(p => ({ ...p, uploadMode: false, backgroundImageUrl: null, uploadFileName: null })); setEditorTab('identity') }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${!form.uploadMode ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    ✨ Buat dari Awal
                  </button>
                  <button onClick={() => { setForm(p => ({ ...p, uploadMode: true })); setEditorTab('upload') }}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 ${form.uploadMode ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    📤 Upload Template
                  </button>
                </div>
              </div>
            )}

            {/* Sub-tabs */}
            <div className='flex border-b border-gray-100 overflow-x-auto'>
              {EDITOR_TABS.map(([k, l]) => (
                <button key={k} onClick={() => setEditorTab(k)}
                  className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition border-b-2 ${editorTab === k ? 'border-red-600 text-red-700 bg-red-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {l}
                </button>
              ))}
            </div>

            <div className='flex-1 overflow-y-auto p-5 space-y-4'>

              {/* ── Upload ── */}
              {editorTab === 'upload' && (
                <>
                  <div className='bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700'>
                    💡 Upload file desain sertifikat Anda (PNG, JPG, PDF screenshot). Sistem akan menjadikannya background, lalu Anda bisa menambahkan variabel di atasnya di tab <b>Variabel</b>.
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Nama Template *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                      placeholder='Contoh: Sertifikat K3 2025' />
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-2'>Upload File Desain</label>
                    <div className='border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer'
                      style={{ borderColor: form.backgroundImageUrl ? '#D7252B' : '#d1d5db' }}
                      onClick={() => bgRef.current?.click()}>
                      <input ref={bgRef} type='file' accept='image/*' className='hidden'
                        onChange={e => handleBgUpload(e.target.files[0])} />
                      {form.backgroundImageUrl ? (
                        <div className='flex flex-col items-center gap-2'>
                          <img src={form.backgroundImageUrl} alt='preview'
                            className='max-h-32 object-contain rounded-lg border border-gray-200' />
                          <span className='text-xs text-gray-500 font-medium'>{form.uploadFileName}</span>
                          <span className='text-xs text-red-500 hover:text-red-700'>Klik untuk ganti file</span>
                        </div>
                      ) : (
                        <div>
                          <div className='text-4xl mb-2'>📤</div>
                          <p className='text-sm font-semibold text-gray-600 mb-1'>Klik untuk upload</p>
                          <p className='text-xs text-gray-400'>PNG, JPG · Maks 10 MB</p>
                          <p className='text-xs text-gray-400 mt-1'>Gunakan desain sertifikat yang sudah ada</p>
                        </div>
                      )}
                    </div>
                    {form.backgroundImageUrl && (
                      <button onClick={() => setForm(p => ({ ...p, backgroundImageUrl: null, uploadFileName: null }))}
                        className='mt-1.5 text-xs text-red-500 hover:text-red-700'>
                        Hapus file
                      </button>
                    )}
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Tipe Sertifikat</label>
                    <select value={form.type} onChange={e => set('type', e.target.value)}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                      {CERT_TYPES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Orientasi</label>
                    <div className='flex gap-2'>
                      {ORIENTATIONS.map(o => (
                        <button key={o} onClick={() => set('orientation', o)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${form.orientation === o ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {o === 'Landscape' ? '▭' : '▯'} {o}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Masa Berlaku Default (bulan, 0 = selamanya)</label>
                    <input type='number' min='0' value={form.validityMonths}
                      onChange={e => set('validityMonths', Number(e.target.value))}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                  </div>

                  {form.backgroundImageUrl && (
                    <button onClick={() => setEditorTab('overlays')}
                      className='w-full py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90'
                      style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                      Lanjut → Tambah Variabel →
                    </button>
                  )}
                </>
              )}

              {/* ── Overlays / Variables (upload mode) ── */}
              {editorTab === 'overlays' && (
                <>
                  <div className='bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700'>
                    💡 Pilih variabel, lalu atur posisi X/Y (dalam %) di atas template. X=50 Y=50 = tengah halaman.
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-2'>Tambah Variabel ke Template</label>
                    <div className='flex flex-wrap gap-1.5'>
                      {RTF_VARIABLES.map(v => (
                        <button key={v.var} onClick={() => addOverlay(v.var)} title={v.desc}
                          className='text-[10px] font-mono px-1.5 py-0.5 rounded border border-gray-200 bg-white text-red-700 hover:bg-red-50 transition'>
                          {v.var}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(form.overlays || []).length === 0 ? (
                    <div className='text-center py-6 text-gray-400 text-xs border-2 border-dashed border-gray-200 rounded-xl'>
                      Belum ada variabel. Klik variabel di atas untuk menambahkan.
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <div className='text-xs font-bold text-gray-600 mb-1'>Posisi Variabel (X%, Y%, ukuran, warna)</div>
                      {(form.overlays || []).map(ov => (
                        <OverlayRow key={ov.id} ov={ov}
                          onChange={updateOverlay}
                          onRemove={() => removeOverlay(ov.id)} />
                      ))}
                    </div>
                  )}

                  <div className='space-y-2 pt-2 border-t border-gray-100'>
                    <label className='block text-xs font-bold text-gray-600'>Elemen Tambahan</label>
                    {[['showSeal', '🏆 Tampilkan seal/medali'], ['showCertNo', '🔢 Tampilkan nomor sertifikat']].map(([k, l]) => (
                      <label key={k} className='flex items-center gap-2.5 cursor-pointer select-none'>
                        <input type='checkbox' checked={form[k]} onChange={e => set(k, e.target.checked)} className='w-4 h-4 accent-red-700' />
                        <span className='text-sm text-gray-600'>{l}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* ── Identitas (scratch mode) ── */}
              {editorTab === 'identity' && (
                <>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Nama Template *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                      placeholder='Contoh: Sertifikat Kelulusan Standard' />
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Tipe Sertifikat</label>
                    <select value={form.type} onChange={e => set('type', e.target.value)}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                      {CERT_TYPES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Orientasi Halaman</label>
                    <div className='flex gap-2'>
                      {ORIENTATIONS.map(o => (
                        <button key={o} onClick={() => set('orientation', o)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${form.orientation === o ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {o === 'Landscape' ? '▭' : '▯'} {o}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Masa Berlaku Default (bulan, 0 = selamanya)</label>
                    <input type='number' min='0' value={form.validityMonths} onChange={e => set('validityMonths', Number(e.target.value))}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Catatan Internal</label>
                    <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none'
                      placeholder='Catatan untuk tim HR (tidak tampil di sertifikat)' />
                  </div>
                </>
              )}

              {/* ── Tampilan ── */}
              {editorTab === 'layout' && (
                <>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-2'>Color Theme</label>
                    <div className='space-y-1.5'>
                      {themes.map(th => (
                        <button key={th.id} onClick={() => set('themeId', th.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-xs font-semibold transition ${form.themeId === th.id ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <span className='w-5 h-5 rounded-full shrink-0' style={{ background:`linear-gradient(135deg,${th.primary},${th.accent})` }} />
                          <span className='flex-1 text-left text-gray-700'>{th.label}</span>
                          <div className='flex gap-1'>
                            {[th.primary, th.accent, th.bg].map((c, i) => (
                              <span key={i} className='w-4 h-4 rounded border border-gray-200' style={{ background:c }} />
                            ))}
                          </div>
                          {form.themeId === th.id && <span className='text-red-600'>✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-2'>Logo</label>
                    <div className='border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-red-300 cursor-pointer transition'
                      onClick={() => logoRef.current?.click()}>
                      <input ref={logoRef} type='file' accept='image/*' className='hidden' onChange={e => handleLogoUpload(e.target.files[0])} />
                      {form.logoUrl ? (
                        <div className='flex flex-col items-center gap-2'>
                          <img src={form.logoUrl} alt='logo' className='h-10 object-contain' />
                          <span className='text-xs text-gray-400'>Klik untuk ganti</span>
                        </div>
                      ) : (
                        <div>
                          <div className='text-2xl mb-1'>🖼️</div>
                          <p className='text-xs text-gray-500'>Upload logo (PNG/JPG/SVG)</p>
                        </div>
                      )}
                    </div>
                    {form.logoUrl && (
                      <button onClick={() => set('logoUrl', null)} className='mt-1 text-xs text-red-500 hover:text-red-700'>Hapus logo</button>
                    )}
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Posisi Logo</label>
                    <div className='flex gap-2'>
                      {LOGO_POSITIONS.map(p => (
                        <button key={p} onClick={() => set('logoPosition', p)}
                          className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition ${form.logoPosition === p ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <label className='block text-xs font-bold text-gray-600 mb-1'>Elemen Tambahan</label>
                    {[['showSeal','🏆 Tampilkan seal/medali'],['showCertNo','🔢 Tampilkan nomor sertifikat']].map(([k,l]) => (
                      <label key={k} className='flex items-center gap-2.5 cursor-pointer select-none'>
                        <input type='checkbox' checked={form[k]} onChange={e => set(k, e.target.checked)} className='w-4 h-4 accent-red-700' />
                        <span className='text-sm text-gray-600'>{l}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* ── Konten ── */}
              {editorTab === 'content' && (
                <>
                  <div className='bg-gray-50 rounded-xl p-3 border border-gray-200'>
                    <p className='text-xs font-bold text-gray-600 mb-2'>📌 Klik field teks dulu, lalu klik variabel</p>
                    <div className='flex flex-wrap gap-1'>
                      {RTF_VARIABLES.slice(0, 10).map(v => (
                        <button key={v.var} onClick={() => {
                          const active = document.activeElement
                          const field = active?.dataset?.field
                          if (field) insertVar(v.var, field)
                        }}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition ${copiedVar === v.var ? 'bg-green-100 border-green-300 text-green-700' : 'bg-white border-gray-200 text-red-700 hover:bg-red-50'}`}>
                          {v.var}
                        </button>
                      ))}
                    </div>
                  </div>
                  {[
                    ['headerTitle','Judul Header','CERTIFICATE OF COMPLETION'],
                    ['subTitle','Teks Sub-header','Sertifikat ini diberikan kepada'],
                    ['footerText','Teks Footer','Diterbitkan pada [[issue_date]]'],
                  ].map(([k, label, ph]) => (
                    <div key={k}>
                      <label className='block text-xs font-bold text-gray-600 mb-1.5'>{label}</label>
                      <input value={form[k]} onChange={e => set(k, e.target.value)} data-field={k}
                        className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                        placeholder={ph} />
                    </div>
                  ))}
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Teks Body</label>
                    <textarea value={form.bodyText} onChange={e => set('bodyText', e.target.value)} data-field='bodyText'
                      rows={5} className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none'
                      placeholder='yang telah berhasil menyelesaikan pelatihan [[course_name]]...' />
                  </div>
                </>
              )}

              {/* ── Tanda Tangan ── */}
              {editorTab === 'signature' && (
                <>
                  <div className='bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700'>
                    💡 Nama dan jabatan penandatangan akan tampil di bagian bawah sertifikat.
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Nama Penandatangan</label>
                    <input value={form.approverName} onChange={e => set('approverName', e.target.value)}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                      placeholder='[[approver_name]] atau Dr. Ahmad, M.B.A.' />
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Jabatan Penandatangan</label>
                    <input value={form.approverTitle} onChange={e => set('approverTitle', e.target.value)}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                      placeholder='Chief Human Resources Officer' />
                  </div>
                  <div className='bg-gray-50 rounded-xl p-3 border border-gray-100'>
                    <p className='text-xs font-bold text-gray-600 mb-2'>Preview Blok Tanda Tangan</p>
                    <div className='text-center'>
                      <div className='w-32 border-b border-gray-400 mx-auto mb-1' />
                      <p className='text-sm font-bold text-gray-700'>{form.approverName || '(nama penandatangan)'}</p>
                      <p className='text-xs text-gray-400'>{form.approverTitle || '(jabatan)'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right: live preview */}
          <div className='flex-1 bg-gray-50 p-6 flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-bold text-gray-600'>👁️ Live Preview</h3>
              <span className='text-xs text-gray-400'>
                {form.uploadMode ? (form.backgroundImageUrl ? 'Template terupload · overlay variabel aktif' : 'Belum ada file terupload') : 'Update otomatis saat Anda mengedit'}
              </span>
            </div>

            <div className='flex-1 flex items-center justify-center'>
              <div style={{ width: form.orientation === 'Landscape' ? '100%' : '65%' }}>
                {form.uploadMode && !form.backgroundImageUrl ? (
                  <div className='aspect-[1.414/1] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-3 cursor-pointer'
                    onClick={() => { setEditorTab('upload'); bgRef.current?.click() }}>
                    <div className='text-5xl'>📤</div>
                    <p className='text-sm font-semibold'>Upload file template terlebih dahulu</p>
                    <p className='text-xs'>Klik di sini atau buka tab Upload</p>
                  </div>
                ) : (
                  <CertPreview tpl={form} themes={themes} />
                )}
                {(form.backgroundImageUrl || !form.uploadMode) && (
                  <p className='text-center text-xs text-gray-400 mt-2'>
                    {form.uploadMode
                      ? `${form.uploadFileName} · ${form.orientation} · ${(form.overlays||[]).length} variabel`
                      : `${form.orientation} · ${form.type} · Theme: ${themes.find(t => t.id === form.themeId)?.label}`}
                  </p>
                )}
              </div>
            </div>

            {/* Variable reference */}
            {!form.uploadMode && (
              <div className='bg-white rounded-xl p-4 border border-gray-200'>
                <p className='text-xs font-bold text-gray-600 mb-2'>Semua Variabel Tersedia</p>
                <div className='flex flex-wrap gap-1.5'>
                  {RTF_VARIABLES.map(v => (
                    <span key={v.var} title={v.desc}
                      className='text-[10px] font-mono bg-gray-50 border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded cursor-default'>
                      {v.var}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MasterCertificatePage() {
  const { templates, setTemplates } = useCertificateStore()

  const [editorOpen,  setEditorOpen ] = useState(false)
  const [editingTpl,  setEditingTpl ] = useState(null)
  const [msg,         setMsg        ] = useState(null)

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  const handleNew       = ()      => { setEditingTpl({ ...EMPTY_TPL, id: null }); setEditorOpen(true) }
  const handleEdit      = (tpl)   => { setEditingTpl({ ...tpl }); setEditorOpen(true) }
  const handleDelete    = (id)    => { setTemplates(p => p.filter(t => t.id !== id)); flash('Template dihapus.') }
  const handleDuplicate = (tpl)   => {
    const copy = { ...tpl, id: Date.now(), name: `${tpl.name} (Salinan)`, status: 'Draft' }
    setTemplates(p => [copy, ...p])
    flash(`Template "${tpl.name}" berhasil diduplikasi.`)
  }

  const handleSave = (form) => {
    if (!form.name.trim()) { flash('Nama template wajib diisi.', 'error'); return }
    if (form.uploadMode && !form.backgroundImageUrl) { flash('Harap upload file desain sertifikat.', 'error'); return }
    if (form.id) {
      setTemplates(p => p.map(t => t.id === form.id ? form : t))
      flash(`Template "${form.name}" diperbarui.`)
    } else {
      setTemplates(p => [{ ...form, id: Date.now() }, ...p])
      flash(`Template "${form.name}" berhasil dibuat.`)
    }
    setEditorOpen(false)
    setEditingTpl(null)
  }

  const activeCount = templates.filter(t => t.status === 'Active').length

  return (
    <div>
      {editorOpen && editingTpl && (
        <TemplateEditor tpl={editingTpl} themes={THEMES} onSave={handleSave}
          onCancel={() => { setEditorOpen(false); setEditingTpl(null) }} />
      )}

      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Certificate Template</h1>
      <p className='text-gray-500 text-sm mb-6'>
        Buat template dari desain yang ada atau dari awal. Upload desain sertifikat Anda dan tambahkan variabel dinamis di atasnya.
      </p>

      {msg && (
        <div className={`text-xs px-4 py-3 rounded-lg mb-4 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Summary */}
      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[
          ['Total Template', templates.length, '📄', '#8B1A1A'],
          ['Active', activeCount, '✅', '#059669'],
          ['Draft', templates.length - activeCount, '📝', '#d97706'],
          ['Upload', templates.filter(t => t.uploadMode).length, '📤', '#7c3aed'],
        ].map(([l, v, i, c]) => (
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background: c + '22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      {/* Template list */}
      <div>
        <div className='flex justify-between items-center mb-4'>
          <p className='text-sm text-gray-500'>{templates.length} template tersedia</p>
          <button onClick={handleNew}
            className='px-5 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition flex items-center gap-2'
            style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
            <span className='text-base leading-none'>+</span> Buat Template Baru
          </button>
        </div>

        {templates.length === 0 ? (
          <div className='bg-white rounded-2xl p-16 text-center shadow-sm'>
            <div className='text-5xl mb-4'>📜</div>
            <h3 className='font-bold text-gray-700 mb-1'>Belum ada template</h3>
            <p className='text-sm text-gray-400 mb-5'>Buat template pertama Anda — dari awal atau upload desain yang sudah ada.</p>
            <button onClick={handleNew} className='px-6 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90'
              style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
              + Buat Template Baru
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5'>
            {templates.map(tpl => {
              const theme = THEMES.find(th => th.id === tpl.themeId) || THEMES[0]
              return (
                <div key={tpl.id} className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition'>
                  <div className='h-1.5' style={{ background: tpl.uploadMode ? 'linear-gradient(90deg,#7c3aed,#a78bfa)' : `linear-gradient(90deg,${theme.primary},${theme.accent})` }} />
                  <div className='p-4 pb-3'>
                    <CertPreview tpl={tpl} themes={THEMES} />
                  </div>
                  <div className='px-4 pb-4'>
                    <div className='flex items-start justify-between mb-1'>
                      <h3 className='font-bold text-gray-800 text-sm leading-tight'>{tpl.name}</h3>
                      <div className='flex gap-1 shrink-0 ml-2'>
                        {tpl.uploadMode && (
                          <span className='text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-700'>Upload</span>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tpl.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {tpl.status}
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-2 mb-3 flex-wrap'>
                      {tpl.uploadMode ? (
                        <>
                          <span className='text-xs text-gray-400'>📤 {tpl.uploadFileName || 'Uploaded'}</span>
                          <span className='text-gray-200'>·</span>
                          <span className='text-xs text-gray-400'>{(tpl.overlays||[]).length} variabel</span>
                        </>
                      ) : (
                        <>
                          <span className='w-3 h-3 rounded-full' style={{ background: theme.primary }} />
                          <span className='text-xs text-gray-400'>{theme.label}</span>
                          <span className='text-gray-200'>·</span>
                          <span className='text-xs text-gray-400'>{tpl.orientation}</span>
                        </>
                      )}
                    </div>
                    {tpl.notes && <p className='text-xs text-gray-400 mb-3 line-clamp-1'>📝 {tpl.notes}</p>}
                    <div className='flex gap-1.5'>
                      <button onClick={() => handleEdit(tpl)}
                        className='flex-1 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition'
                        style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDuplicate(tpl)}
                        className='px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition'>⧉</button>
                      <button onClick={() => handleDelete(tpl.id)}
                        className='px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition'>🗑</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
