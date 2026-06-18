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

const CERT_TYPES = ['Penyelesaian (Completion)', 'Partisipasi (Participation)', 'Prestasi (Achievement)', 'Excellence Award']
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
}

// ─── Certificate Live Preview ──────────────────────────────────────────────────
function CertPreview({ tpl, themes }) {
  const theme = themes.find(t => t.id === tpl.themeId) || themes[0]
  const isLandscape = tpl.orientation === 'Landscape'

  const previewStyle = {
    aspectRatio: isLandscape ? '1.414/1' : '1/1.414',
    background: theme.bg,
    border: `3px solid ${theme.border}`,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Georgia, serif',
  }

  const logoEl = tpl.logoUrl ? (
    <img src={tpl.logoUrl} alt='logo' style={{ height: 28, objectFit: 'contain' }} />
  ) : (
    <div style={{ width: 28, height: 28, borderRadius: 4, background: `${theme.primary}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🏢</div>
  )

  return (
    <div style={previewStyle}>
      {/* Decorative inner border */}
      <div style={{ position: 'absolute', inset: 5, border: `1px solid ${theme.border}44`, borderRadius: 5, pointerEvents: 'none', zIndex: 1 }} />

      {/* Header band */}
      <div style={{ background: `linear-gradient(135deg,${theme.primary},${theme.accent})`, padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        {tpl.logoPosition === 'Kiri' && logoEl}
        <div style={{ flex: 1, textAlign: tpl.logoPosition === 'Tengah' ? 'center' : tpl.logoPosition === 'Kiri' ? 'center' : 'left' }}>
          {tpl.logoPosition === 'Tengah' && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 3 }}>{logoEl}</div>}
          <div style={{ color: 'white', fontWeight: 700, fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{tpl.headerTitle || 'CERTIFICATE'}</div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 6, letterSpacing: '0.08em', marginTop: 2 }}>{tpl.type}</div>
        </div>
        {tpl.logoPosition === 'Kanan' && logoEl}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '8px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 6, color: `${theme.text}99`, marginBottom: 4, letterSpacing: '0.05em' }}>{tpl.subTitle}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.primary, fontStyle: 'italic', borderBottom: `1px solid ${theme.accent}55`, paddingBottom: 4, marginBottom: 6, width: '70%' }}>
          [[learner_name]]
        </div>
        <div style={{ fontSize: 6, color: `${theme.text}88`, maxWidth: '80%', lineHeight: 1.6 }}>
          {tpl.bodyText.length > 100 ? tpl.bodyText.slice(0, 100) + '…' : tpl.bodyText}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '6px 14px', borderTop: `1px solid ${theme.border}33`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div style={{ fontSize: 5, color: `${theme.text}66` }}>{tpl.footerText.slice(0, 50)}</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
          {tpl.showSeal && (
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${theme.accent}`, background: `${theme.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>🏆</div>
          )}
          {tpl.approverName && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 40, borderBottom: `0.5px solid ${theme.text}66`, marginBottom: 2 }} />
              <div style={{ fontSize: 5, color: `${theme.text}88`, fontWeight: 700 }}>{tpl.approverName}</div>
              <div style={{ fontSize: 4.5, color: `${theme.text}55` }}>{tpl.approverTitle}</div>
            </div>
          )}
        </div>
      </div>

      {/* Cert number badge */}
      {tpl.showCertNo && (
        <div style={{ position: 'absolute', top: 6, right: 12, fontSize: 4.5, color: `${theme.text}55`, fontFamily: 'monospace', zIndex: 2 }}>
          [[certificate_number]]
        </div>
      )}
    </div>
  )
}

// ─── Visual Editor Panel ────────────────────────────────────────────────────────
function TemplateEditor({ tpl, onSave, onCancel, themes }) {
  const [form, setForm] = useState({ ...tpl })
  const [editorTab, setEditorTab] = useState('identity')
  const [copiedVar, setCopiedVar] = useState(null)
  const logoRef = useRef()

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

  const theme = themes.find(t => t.id === form.themeId) || themes[0]

  const EDITOR_TABS = [
    ['identity', '📋 Identitas'],
    ['layout', '🎨 Tampilan'],
    ['content', '✏️ Konten'],
    ['signature', '✍️ Tanda Tangan'],
  ]

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-6 pb-6 px-4 overflow-y-auto'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-6xl'>

        {/* Editor header */}
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
            <button onClick={onCancel}
              className='px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700'>✕</button>
          </div>
        </div>

        <div className='flex' style={{ minHeight: 560 }}>

          {/* Left: property panels */}
          <div className='w-96 border-r border-gray-100 flex flex-col'>
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

              {/* ── Identitas ── */}
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
                          <span className='w-5 h-5 rounded-full shrink-0' style={{ background: `linear-gradient(135deg,${th.primary},${th.accent})` }} />
                          <span className='flex-1 text-left text-gray-700'>{th.label}</span>
                          <div className='flex gap-1'>
                            {[th.primary, th.accent, th.bg].map((c, i) => (
                              <span key={i} className='w-4 h-4 rounded border border-gray-200' style={{ background: c }} />
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
                    {[
                      ['showSeal', '🏆 Tampilkan seal/medali'],
                      ['showCertNo', '🔢 Tampilkan nomor sertifikat'],
                    ].map(([k, l]) => (
                      <label key={k} className='flex items-center gap-2.5 cursor-pointer select-none'>
                        <input type='checkbox' checked={form[k]} onChange={e => set(k, e.target.checked)}
                          className='w-4 h-4 accent-red-700' />
                        <span className='text-sm text-gray-600'>{l}</span>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* ── Konten ── */}
              {editorTab === 'content' && (
                <>
                  {/* Variable picker */}
                  <div className='bg-gray-50 rounded-xl p-3 border border-gray-200'>
                    <p className='text-xs font-bold text-gray-600 mb-2'>📌 Klik variabel untuk menyisipkan ke field aktif</p>
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
                    <p className='text-[10px] text-gray-400 mt-1'>Klik field teks dulu, lalu klik variabel</p>
                  </div>

                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Judul Header</label>
                    <input value={form.headerTitle} onChange={e => set('headerTitle', e.target.value)}
                      data-field='headerTitle'
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                      placeholder='CERTIFICATE OF COMPLETION' />
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Teks Sub-header</label>
                    <input value={form.subTitle} onChange={e => set('subTitle', e.target.value)}
                      data-field='subTitle'
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                      placeholder='Sertifikat ini diberikan kepada' />
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Teks Body (gunakan variabel [[...]])</label>
                    <textarea value={form.bodyText} onChange={e => set('bodyText', e.target.value)}
                      data-field='bodyText'
                      rows={5} className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none'
                      placeholder='yang telah berhasil menyelesaikan pelatihan [[course_name]]...' />
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Teks Footer</label>
                    <input value={form.footerText} onChange={e => set('footerText', e.target.value)}
                      data-field='footerText'
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                      placeholder='Diterbitkan pada [[issue_date]]' />
                  </div>
                </>
              )}

              {/* ── Tanda Tangan ── */}
              {editorTab === 'signature' && (
                <>
                  <div className='bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700'>
                    💡 Nama dan jabatan penandatangan akan tampil di bagian bawah sertifikat. Bisa diisi dengan nama jabatan atau variabel [[approver_name]].
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Nama Penandatangan</label>
                    <input value={form.approverName} onChange={e => set('approverName', e.target.value)}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                      placeholder='Contoh: [[approver_name]] atau Dr. Ahmad, M.B.A.' />
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-gray-600 mb-1.5'>Jabatan Penandatangan</label>
                    <input value={form.approverTitle} onChange={e => set('approverTitle', e.target.value)}
                      className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                      placeholder='Contoh: Chief Human Resources Officer' />
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
              <span className='text-xs text-gray-400'>Update otomatis saat Anda mengedit</span>
            </div>

            <div className='flex-1 flex items-center justify-center'>
              <div style={{ width: form.orientation === 'Landscape' ? '100%' : '65%' }}>
                <CertPreview tpl={form} themes={themes} />
                <p className='text-center text-xs text-gray-400 mt-2'>
                  {form.orientation} · {form.type} · Theme: {themes.find(t => t.id === form.themeId)?.label}
                </p>
              </div>
            </div>

            {/* Variable quick reference */}
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
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MasterCertificatePage() {
  const t = useT()
  const { templates, setTemplates } = useCertificateStore()

  const [tab, setTab]             = useState('templates')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTpl, setEditingTpl] = useState(null)
  const [copiedVar, setCopiedVar]   = useState(null)
  const [msg, setMsg]               = useState(null)

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  const handleNew    = ()      => { setEditingTpl({ ...EMPTY_TPL, id: null }); setEditorOpen(true) }
  const handleEdit   = (tpl)   => { setEditingTpl({ ...tpl }); setEditorOpen(true) }
  const handleDelete = (id)    => { setTemplates(p => p.filter(t => t.id !== id)); flash('Template dihapus.') }
  const handleDuplicate = (tpl) => {
    const copy = { ...tpl, id: Date.now(), name: `${tpl.name} (Salinan)`, status: 'Draft' }
    setTemplates(p => [copy, ...p])
    flash(`Template "${tpl.name}" berhasil diduplikasi.`)
  }

  const handleSave = (form) => {
    if (!form.name.trim()) { flash('Nama template wajib diisi.', 'error'); return }
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

  const copyVar = (v) => {
    navigator.clipboard?.writeText(v).catch(() => {})
    setCopiedVar(v); setTimeout(() => setCopiedVar(null), 1500)
  }

  const activeCount = templates.filter(t => t.status === 'Active').length

  return (
    <div>
      {editorOpen && editingTpl && (
        <TemplateEditor
          tpl={editingTpl}
          themes={THEMES}
          onSave={handleSave}
          onCancel={() => { setEditorOpen(false); setEditingTpl(null) }}
        />
      )}

      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Certificate Template</h1>
      <p className='text-gray-500 text-sm mb-6'>
        Buat dan kelola template sertifikat. Setiap template dapat dikustomisasi secara visual — logo, warna, konten, dan tanda tangan.
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
          ['Landscape', templates.filter(t => t.orientation === 'Landscape').length, '▭', '#7c3aed'],
        ].map(([l, v, i, c]) => (
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background: c + '22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className='flex gap-2 mb-6'>
        {[['templates', '📄 Template']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${tab === k ? 'text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            style={tab === k ? { background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' } : {}}>
            {l}
          </button>
        ))}
      </div>

      {/* ── TAB: Templates ─────────────────────────────────────────────────────── */}
      {tab === 'templates' && (
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
              <p className='text-sm text-gray-400 mb-5'>Buat template pertama Anda untuk mulai menerbitkan sertifikat.</p>
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
                    {/* Color bar */}
                    <div className='h-1.5' style={{ background: `linear-gradient(90deg,${theme.primary},${theme.accent})` }} />

                    {/* Preview */}
                    <div className='p-4 pb-3'>
                      <CertPreview tpl={tpl} themes={THEMES} />
                    </div>

                    {/* Info */}
                    <div className='px-4 pb-4'>
                      <div className='flex items-start justify-between mb-1'>
                        <h3 className='font-bold text-gray-800 text-sm leading-tight'>{tpl.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ml-2 ${tpl.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {tpl.status}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 mb-3'>
                        <span className='w-3 h-3 rounded-full' style={{ background: theme.primary }} />
                        <span className='text-xs text-gray-400'>{theme.label}</span>
                        <span className='text-gray-200'>·</span>
                        <span className='text-xs text-gray-400'>{tpl.orientation}</span>
                        <span className='text-gray-200'>·</span>
                        <span className='text-xs text-gray-400'>{tpl.type.split(' ')[0]}</span>
                      </div>
                      {tpl.notes && <p className='text-xs text-gray-400 mb-3 line-clamp-1'>📝 {tpl.notes}</p>}

                      <div className='flex gap-1.5'>
                        <button onClick={() => handleEdit(tpl)}
                          className='flex-1 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition'
                          style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDuplicate(tpl)}
                          className='px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition'>
                          ⧉
                        </button>
                        <button onClick={() => handleDelete(tpl.id)}
                          className='px-3 py-1.5 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100 transition'>
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Variable Reference ────────────────────────────────────────────── */}
      {tab === 'variables' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-bold text-gray-700'>{'{ }'} Daftar Variabel</h2>
              <span className='text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-semibold'>{RTF_VARIABLES.length} variabel</span>
            </div>
            <p className='text-xs text-gray-500 mb-5'>Klik baris untuk menyalin variabel ke clipboard.</p>
            <div className='space-y-1'>
              {RTF_VARIABLES.map((v, i) => (
                <button key={v.var} onClick={() => copyVar(v.var)}
                  className='w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left hover:bg-red-50 transition group border border-transparent hover:border-red-100'>
                  <span className='text-xs text-gray-400 w-5 text-right shrink-0'>{i + 1}</span>
                  <code className={`font-mono text-xs font-bold px-2 py-1 rounded w-52 shrink-0 transition ${copiedVar === v.var ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-red-700 group-hover:bg-red-100'}`}>
                    {copiedVar === v.var ? '✓ disalin!' : v.var}
                  </code>
                  <span className='text-sm text-gray-600'>{v.desc}</span>
                  <span className='ml-auto text-xs text-gray-300 group-hover:text-red-400 shrink-0'>klik salin</span>
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-4'>
            <div className='bg-white rounded-xl p-5 shadow-sm'>
              <h3 className='font-bold text-gray-700 mb-3 text-sm'>📄 Contoh Penggunaan</h3>
              <div className='bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-700 leading-relaxed border border-gray-200'>
                <div className='text-gray-400 mb-1'>// Contoh teks body:</div>
                <div>Diberikan kepada</div>
                <div className='text-red-700 font-bold'>[[learner_name]]</div>
                <br />
                <div>yang telah menyelesaikan</div>
                <div className='text-red-700 font-bold'>[[course_name]]</div>
                <div>([[training_hours]] jam)</div>
                <br />
                <div>Nilai: <span className='text-red-700'>[[score]]</span> · <span className='text-red-700'>[[grade]]</span></div>
                <div>Tanggal: <span className='text-red-700'>[[completion_date]]</span></div>
              </div>
            </div>
            <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-5'>
              <h3 className='font-bold text-yellow-700 mb-2 text-sm'>⚠️ Aturan Penulisan</h3>
              <ul className='text-xs text-yellow-700 space-y-1.5'>
                <li>• Gunakan kurung siku ganda: <code className='bg-yellow-100 px-1 rounded'>[[var]]</code></li>
                <li>• Penulisan harus <b>persis sama</b> termasuk huruf kecil</li>
                <li>• Jangan tambahkan spasi di dalam kurung</li>
                <li>• Variabel yang tidak cocok akan dikosongkan saat generate</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
