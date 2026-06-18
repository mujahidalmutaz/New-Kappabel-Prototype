'use client'
import { useState, useRef }           from 'react'
import { useStructureStore }           from '@/store/structureStore'
import { useCertificateStore, THEMES } from '@/store/certificateStore'
import { useT } from '@/store/languageStore'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTS = ['Active', 'Inactive']

// RTF variables — sama untuk semua company, hanya warna berubah
const RTF_VARIABLES = [
  { var:'[[learner_name]]',      desc:'Nama lengkap peserta' },
  { var:'[[nik]]',               desc:'NIK / Employee ID' },
  { var:'[[position]]',          desc:'Jabatan peserta' },
  { var:'[[department]]',        desc:'Departemen peserta' },
  { var:'[[company_name]]',      desc:'Nama perusahaan (auto dari profil)' },
  { var:'[[course_name]]',       desc:'Nama course / pelatihan' },
  { var:'[[course_code]]',       desc:'Kode course' },
  { var:'[[training_hours]]',    desc:'Total jam pelatihan' },
  { var:'[[completion_date]]',   desc:'Tanggal selesai (dd MMMM yyyy)' },
  { var:'[[score]]',             desc:'Nilai akhir (angka)' },
  { var:'[[grade]]',             desc:'Predikat kelulusan (A/B/C)' },
  { var:'[[validity_date]]',     desc:'Tanggal kadaluarsa sertifikat' },
  { var:'[[certificate_number]]',desc:'Nomor sertifikat (auto-generated)' },
  { var:'[[approver_name]]',     desc:'Nama penandatangan' },
  { var:'[[approver_title]]',    desc:'Jabatan penandatangan' },
  { var:'[[issue_date]]',        desc:'Tanggal penerbitan' },
  { var:'[[period]]',            desc:'Periode pelatihan (Semester/Kuartal)' },
]

const EMPTY_COURSE = { course:'', templateId:1, min_score:'70', attendance_req:'80', validity_months:'0', auto_generate:true, approver:'', status:'Active' }

// ─── Certificate Mini-Preview ──────────────────────────────────────────────────
function CertPreview({ theme, company }) {
  const t = THEMES.find(t=>t.id===theme) || THEMES[0]
  return (
    <div className='relative rounded-lg overflow-hidden select-none'
      style={{ border:`2px solid ${t.border}`, background:t.bg, width:'100%', aspectRatio:'1.414/1', padding:'10px' }}>
      {/* outer double border decorative */}
      <div className='absolute inset-2 rounded pointer-events-none' style={{ border:`1px solid ${t.border}44` }}></div>

      {/* header band */}
      <div className='relative z-10 rounded-t' style={{ background:`linear-gradient(135deg,${t.primary},${t.accent})`, padding:'6px 10px', marginBottom:'6px' }}>
        <div className='text-white text-center' style={{ fontSize:'8px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>SERTIFIKAT PENYELESAIAN</div>
      </div>

      {/* body */}
      <div className='relative z-10 text-center' style={{ padding:'0 8px' }}>
        <div style={{ fontSize:'6px', color: t.text+'99', marginBottom:'3px' }}>Diberikan kepada</div>
        <div style={{ fontSize:'10px', fontWeight:700, color:t.primary, borderBottom:`1px solid ${t.accent}44`, paddingBottom:'3px', marginBottom:'3px', fontStyle:'italic' }}>
          {'{{learner_name}}'}
        </div>
        <div style={{ fontSize:'5.5px', color:t.text+'88', marginBottom:'4px' }}>
          Telah berhasil menyelesaikan <span style={{fontWeight:700,color:t.text}}>{'{{course_name}}'}</span>
        </div>

        {/* score + date row */}
        <div className='flex justify-between items-end' style={{ marginBottom:'4px' }}>
          <div style={{ fontSize:'5px', color:t.text+'77' }}>
            <div>Nilai: <b style={{color:t.primary}}>{'{{score}}'}</b></div>
            <div>Jam: <b>{'{{training_hours}}'}</b></div>
          </div>
          {/* seal circle */}
          <div className='flex items-center justify-center rounded-full' style={{ width:'28px', height:'28px', border:`2px solid ${t.accent}`, background:`${t.accent}15` }}>
            <span style={{ fontSize:'10px' }}>🏆</span>
          </div>
          <div style={{ fontSize:'5px', color:t.text+'77', textAlign:'right' }}>
            <div>{'{{completion_date}}'}</div>
            <div>{'{{certificate_number}}'}</div>
          </div>
        </div>

        {/* approver line */}
        <div className='flex justify-end' style={{ borderTop:`1px solid ${t.border}33`, paddingTop:'3px' }}>
          <div style={{ fontSize:'5px', color:t.text+'88', textAlign:'center' }}>
            <div style={{ width:'50px', borderBottom:`0.5px solid ${t.text}66`, marginBottom:'1px' }}></div>
            <div>{'{{approver_name}}'}</div>
            <div style={{ color:t.text+'66' }}>{'{{approver_title}}'}</div>
          </div>
        </div>
      </div>

      {/* company label */}
      <div className='absolute bottom-1 left-0 right-0 text-center' style={{ fontSize:'4.5px', color:t.text+'55' }}>
        {company}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MasterCertificatePage() {
  const t = useT()
  const { companies: storeCompanies } = useStructureStore()
  // Hanya tampilkan company Active sebagai pilihan
  const activeCompanies = storeCompanies.filter(c => c.status === 'Active')

  // Helper: dapatkan nama tampilan company dari id
  const companyName = (id) => storeCompanies.find(c => c.id === id)?.name ?? '(Company dihapus)'

  const {
    templates,      setTemplates,
    courseSettings: courses, setCourseSettings: setCourses,
    updateTemplateRtf,
  } = useCertificateStore()

  const [tab, setTab] = useState('course')

  // Course settings state
  const [courseForm,    setCourseForm   ] = useState(EMPTY_COURSE)
  const [editingCourse, setEditingCourse] = useState(null)
  const [courseSearch,  setCourseSearch ] = useState('')

  // RTF template state — companyId adalah id dari structureStore.companies
  const [editingTpl, setEditingTpl] = useState(null)
  const [tplForm,    setTplForm   ] = useState({ companyId: activeCompanies[0]?.id ?? '', themeId:'navy', notes:'' })
  const [showAddTpl, setShowAddTpl] = useState(false)
  const [previewTpl, setPreviewTpl] = useState(null)
  const [dragOver,   setDragOver  ] = useState(null)
  const [copiedVar,  setCopiedVar ] = useState(null)
  const fileRefs = useRef({})

  const [msg, setMsg] = useState(null)
  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }

  // ── Course CRUD ──
  const handleCourseSave = () => {
    if (!courseForm.course) return flash(t('Nama course wajib diisi.','Course name is required.'), 'error')
    const parsed = { ...courseForm, min_score:Number(courseForm.min_score), attendance_req:Number(courseForm.attendance_req), validity_months:Number(courseForm.validity_months), templateId:Number(courseForm.templateId) }
    if (editingCourse) {
      setCourses(p=>p.map(d=>d.id===editingCourse?{...d,...parsed}:d))
      flash(t('Pengaturan diperbarui.','Settings updated.')); setEditingCourse(null)
    } else {
      setCourses(p=>[...p,{id:Date.now(),...parsed}])
      flash(t('Sertifikat course ditambahkan.','Course certificate added.'))
    }
    setCourseForm(EMPTY_COURSE)
  }
  const handleCourseEdit = (item) => {
    setEditingCourse(item.id)
    setCourseForm({ course:item.course, templateId:item.templateId, min_score:String(item.min_score), attendance_req:String(item.attendance_req), validity_months:String(item.validity_months), auto_generate:item.auto_generate, approver:item.approver, status:item.status })
  }
  const handleCourseDelete = (id) => { setCourses(p=>p.filter(d=>d.id!==id)); flash(t('Dihapus.','Deleted.')) }

  // ── Template CRUD ──
  const handleTplFileSelect = (tplId, file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.rtf')) return flash(t('Hanya file .rtf yang diperbolehkan.','Only .rtf files are allowed.'), 'error')
    // Read RTF text content for variable substitution at download time
    const reader = new FileReader()
    reader.onload = (e) => updateTemplateRtf(tplId, e.target.result)
    reader.readAsText(file, 'windows-1252')
    setTemplates(p=>p.map(t=>t.id===tplId?{...t, fileName:file.name, uploadedAt:new Date().toISOString().slice(0,10), status:'Active'}:t))
    flash(`File "${file.name}" berhasil diupload.`)
  }

  const handleTplThemeChange = (tplId, themeId) => {
    setTemplates(p=>p.map(t=>t.id===tplId?{...t,themeId}:t))
  }

  const handleAddTemplate = () => {
    const cid = Number(tplForm.companyId)
    if (!cid) return flash(t('Pilih company terlebih dahulu.','Please select a company first.'), 'error')
    if (templates.find(t => t.companyId === cid)) return flash(t('Company ini sudah memiliki template.','This company already has a template.'), 'error')
    setTemplates(p => [...p, { id:Date.now(), ...tplForm, companyId:cid, fileName:null, uploadedAt:null, status:'Draft' }])
    flash(t('Template baru ditambahkan. Upload file .rtf untuk mengaktifkan.','New template added. Upload an .rtf file to activate.'))
    setShowAddTpl(false)
    setTplForm({ companyId: activeCompanies[0]?.id ?? '', themeId:'navy', notes:'' })
  }

  const handleDeleteTpl = (id) => { setTemplates(p=>p.filter(t=>t.id!==id)); flash(t('Template dihapus.','Template deleted.')) }

  const downloadRtfTemplate = () => {
    // Draw decorative header banner via Canvas
    const BW = 794, BH = 130
    const cv = document.createElement('canvas')
    cv.width = BW; cv.height = BH
    const cx = cv.getContext('2d')

    cx.fillStyle = '#8B1A1A'
    cx.fillRect(0, 0, BW, BH)

    cx.strokeStyle = '#c9a227'
    cx.lineWidth = 3
    cx.strokeRect(5, 5, BW - 10, BH - 10)
    cx.lineWidth = 1
    cx.strokeRect(11, 11, BW - 22, BH - 22)

    cx.strokeStyle = 'rgba(201,162,39,0.35)'
    cx.lineWidth = 1
    cx.beginPath(); cx.moveTo(14, 38); cx.lineTo(BW - 14, 38); cx.stroke()
    cx.beginPath(); cx.moveTo(14, 94); cx.lineTo(BW - 14, 94); cx.stroke()

    cx.fillStyle = '#c9a227'
    const diamond = (x, y, r) => {
      cx.beginPath()
      cx.moveTo(x, y - r); cx.lineTo(x + r * 0.7, y)
      cx.lineTo(x, y + r); cx.lineTo(x - r * 0.7, y)
      cx.closePath(); cx.fill()
    }
    diamond(BW / 2, 11, 4); diamond(BW / 2, BH - 11, 4)
    diamond(11, BH / 2, 4); diamond(BW - 11, BH / 2, 4)

    cx.fillStyle = 'rgba(201,162,39,0.45)'
    for (let x = 20; x < BW / 2 - 68; x += 10) cx.fillRect(x, BH / 2 - 0.5, 6, 1)
    for (let x = BW / 2 + 68; x < BW - 20; x += 10) cx.fillRect(x, BH / 2 - 0.5, 6, 1)

    cx.textAlign = 'center'; cx.textBaseline = 'middle'
    cx.fillStyle = '#f5e17a'
    cx.font = 'bold 26px Georgia, serif'
    cx.fillText('CERTIFICATE', BW / 2, BH / 2 - 9)
    cx.fillStyle = '#c9a227'
    cx.font = '11px Arial, sans-serif'
    cx.fillText('OF  COMPLETION', BW / 2, BH / 2 + 14)

    // PNG base64 → hex
    const b64 = cv.toDataURL('image/png').split(',')[1]
    const bin = atob(b64)
    let hexStr = ''
    for (let i = 0; i < bin.length; i++) {
      hexStr += bin.charCodeAt(i).toString(16).padStart(2, '0')
      if ((i + 1) % 39 === 0) hexStr += '\r\n'
    }

    // RTF picture dimensions
    const hmm = px => Math.round(px / 96 * 2540)  // pixels → hundredths-of-mm
    const goalW = 8306  // twips (text area = 11906 - 1800*2)
    const goalH = Math.round(BH / BW * goalW)

    // \blipupi96 ends with a non-hex sequence, preventing the hex regex
    // from falsely anchoring on the preceding numeric control-word value.
    const imgRtf = `{\\pict\\pngblip\\picw${hmm(BW)}\\pich${hmm(BH)}\\picwgoal${goalW}\\pichgoal${goalH}\\blipupi96\r\n${hexStr}}`

    const rtf = [
      '{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat',
      '{\\fonttbl{\\f0\\froman\\fprq2\\fcharset0 Times New Roman;}{\\f1\\fswiss\\fprq2\\fcharset0 Arial;}{\\f2\\froman\\fprq2\\fcharset0 Georgia;}}',
      '{\\colortbl ;\\red15\\green52\\blue96;\\red80\\green80\\blue80;\\red130\\green130\\blue130;}',
      '\\paperw11906\\paperh16838\\margl1800\\margr1800\\margt1440\\margb1440',
      '',
      `\\pard\\qc\\sb0\\sa0 ${imgRtf}\\par`,
      '',
      '\\pard\\qc\\sb200{\\f1\\fs40\\b\\cf1 [[company_name]]}\\par',
      '\\pard\\qc\\sb20{\\f1\\fs13\\cf3 No. Sertifikat: [[certificate_number]]}\\par',
      '',
      '\\pard\\qc\\sb360{\\f1\\fs14\\cf2 Sertifikat ini diberikan kepada}\\par',
      '\\pard\\qc\\sb80{\\f2\\fs44\\b\\i [[learner_name]]}\\par',
      '\\pard\\qc\\sb40{\\f1\\fs12\\cf3 NIK: [[nik]]  |  Jabatan: [[position]]  |  Departemen: [[department]]}\\par',
      '',
      '\\pard\\qc\\sb280{\\f1\\fs14\\cf2 yang telah berhasil menyelesaikan pelatihan}\\par',
      '\\pard\\qc\\sb80{\\f1\\fs28\\b [[course_name]]}\\par',
      '\\pard\\qc\\sb20{\\f1\\fs13\\cf3 ([[course_code]])}\\par',
      '',
      '\\pard\\qc\\sb200{\\f1\\fs12\\cf2 Tanggal Selesai: [[completion_date]]  |  Nilai: [[score]] ([[grade]])  |  Jam Pelatihan: [[training_hours]] jam}\\par',
      '\\pard\\qc\\sb20{\\f1\\fs12\\cf3 Periode: [[period]]  |  Masa Berlaku: [[validity_date]]}\\par',
      '',
      '\\pard\\qc\\sb400{\\f1\\fs12\\cf3 Diterbitkan: [[issue_date]]}\\par',
      '',
      '\\pard\\qc\\sb280{\\f1\\fs12\\cf2 ___________________________}\\par',
      '\\pard\\qc\\sb20{\\f1\\fs13\\b [[approver_name]]}\\par',
      '\\pard\\qc\\sb20{\\f1\\fs12\\cf2 [[approver_title]]}\\par',
      '}',
    ].join('\r\n')

    const blob = new Blob([rtf], { type: 'application/rtf' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'certificate_template.rtf'
    document.body.appendChild(a); a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    flash('Template .rtf A4 portrait dengan background image berhasil didownload. Edit variabel [[...]] sesuai kebutuhan.')
  }

  const copyVar = (v) => {
    navigator.clipboard?.writeText(v).catch(()=>{})
    setCopiedVar(v)
    setTimeout(()=>setCopiedVar(null), 1500)
  }

  const filteredCourses = courses.filter(d=>d.course.toLowerCase().includes(courseSearch.toLowerCase()))
  const activeTemplates = templates.filter(t=>t.status==='Active')

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Certificate for Course','Master Certificate for Course')}</h1>
      <p className='text-gray-500 text-sm mb-6'>
        {t('Kelola pengaturan sertifikat per course dan template RTF per perusahaan — variabel sama, hanya color theme yang berbeda.','Manage certificate settings per course and RTF template per company — same variables, only color theme differs.')}
      </p>

      {msg && (
        <div className={`text-xs px-4 py-3 rounded-lg mb-4 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>
          {msg.text}
        </div>
      )}

      {/* Summary */}
      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[
          ['Total Course', courses.length, '🏆', '#8B1A1A'],
          ['Template Aktif', activeTemplates.length, '📄', '#059669'],
          ['Perusahaan', templates.length, '🏢', '#7c3aed'],
          ['Auto Generate', courses.filter(d=>d.auto_generate).length, '⚡', '#d97706'],
        ].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className='flex gap-2 mb-6'>
        {[['course','⚙️ Pengaturan Course'],['templates','📄 Template RTF per Perusahaan'],['variables','{ } Referensi Variabel']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${tab===k?'text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            style={tab===k?{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}:{}}>
            {l}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Course Settings ─────────────────────────────────────────────── */}
      {tab === 'course' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='bg-white rounded-xl p-6 shadow-sm'>
            <h2 className='text-sm font-bold text-gray-700 mb-4'>{editingCourse?`✏️ ${t('Edit','Edit')}`:`➕ ${t('Tambah','Add')}`} {t('Pengaturan Sertifikat','Certificate Settings')}</h2>
            <div className='flex flex-col gap-3'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Course</label>
                <input value={courseForm.course} onChange={e=>setCourseForm(f=>({...f,course:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Template RTF</label>
                <select value={courseForm.templateId} onChange={e=>setCourseForm(f=>({...f,templateId:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {templates.map(t=>(
                    <option key={t.id} value={t.id}>
                      {companyName(t.companyId)} — {THEMES.find(th=>th.id===t.themeId)?.label} {t.status==='Draft'?'(Draft)':''}
                    </option>
                  ))}
                </select>
              </div>
              {[['Min Score Kelulusan (%)','min_score'],['Min Kehadiran (%)','attendance_req'],['Validity Period (bln, 0=selamanya)','validity_months']].map(([l,k])=>(
                <div key={k}>
                  <label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                  <input type='number' min='0' max='100' value={courseForm[k]} onChange={e=>setCourseForm(f=>({...f,[k]:e.target.value}))}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
              ))}
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Approver / Penandatangan</label>
                <input value={courseForm.approver} onChange={e=>setCourseForm(f=>({...f,approver:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
              <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none'>
                <input type='checkbox' checked={courseForm.auto_generate} onChange={e=>setCourseForm(f=>({...f,auto_generate:e.target.checked}))} />
                Auto-generate setelah syarat terpenuhi
              </label>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
                <select value={courseForm.status} onChange={e=>setCourseForm(f=>({...f,status:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div className='flex gap-2 pt-1'>
                <button onClick={handleCourseSave}
                  className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                  style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                  {editingCourse?t('Simpan','Save'):t('Tambah','Add')}
                </button>
                {editingCourse && (
                  <button onClick={()=>{setEditingCourse(null);setCourseForm(EMPTY_COURSE)}}
                    className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200'>
                    {t('Batal','Cancel')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
            <input value={courseSearch} onChange={e=>setCourseSearch(e.target.value)} placeholder={t('Cari course...','Search course...')}
              className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='bg-gray-50'>
                    {['Course','Template','Min Score','Kehadiran','Validity','Auto','Approver','Status','Aksi'].map(h=>(
                      <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap'>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCourses.map(d=>{
                    const tpl = templates.find(t=>t.id===d.templateId)
                    const theme = tpl ? THEMES.find(th=>th.id===tpl.themeId) : null
                    return (
                      <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                        <td className='px-3 py-2.5 font-medium text-gray-700 max-w-36'><div className='line-clamp-2'>{d.course}</div></td>
                        <td className='px-3 py-2.5'>
                          {tpl ? (
                            <div className='flex items-center gap-1.5'>
                              <span className='w-3 h-3 rounded-full shrink-0' style={{ background: theme?.primary }}></span>
                              <span className='text-xs text-gray-600 line-clamp-1'>{companyName(tpl.companyId)}</span>
                            </div>
                          ) : <span className='text-xs text-gray-400'>—</span>}
                        </td>
                        <td className='px-3 py-2.5 text-gray-500'>{d.min_score}%</td>
                        <td className='px-3 py-2.5 text-gray-500'>{d.attendance_req}%</td>
                        <td className='px-3 py-2.5 text-gray-500 whitespace-nowrap'>{d.validity_months?d.validity_months+' bln':'Selamanya'}</td>
                        <td className='px-3 py-2.5'>{d.auto_generate?'✅':'—'}</td>
                        <td className='px-3 py-2.5 text-gray-500 text-xs'>{d.approver}</td>
                        <td className='px-3 py-2.5'>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status==='Active'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{d.status}</span>
                        </td>
                        <td className='px-3 py-2.5'>
                          <div className='flex gap-1'>
                            <button onClick={()=>handleCourseEdit(d)} className='px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                            <button onClick={()=>handleCourseDelete(d.id)} className='px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: RTF Templates ──────────────────────────────────────────────── */}
      {tab === 'templates' && (
        <div>
          {/* Info banner */}
          <div className='bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3 items-start'>
            <span className='text-xl shrink-0'>ℹ️</span>
            <div>
              <p className='font-semibold text-blue-700 text-sm'>Satu template RTF per perusahaan — variabel sama, warna berbeda</p>
              <p className='text-xs text-blue-600 mt-0.5'>
                Setiap file <code className='bg-blue-100 px-1 rounded'>.rtf</code> menggunakan variabel yang identik (lihat tab Referensi Variabel).
                Perbedaan antar perusahaan hanya pada <b>color theme</b> yang Anda pilih di bawah — primary color, accent, dan background.
                Untuk mengganti warna di file RTF, cukup pilih tema lain lalu download ulang contoh panduan warna.
              </p>
            </div>
          </div>

          <div className='flex justify-between items-center mb-4'>
            <h2 className='font-bold text-gray-700'>📄 Template RTF per Perusahaan</h2>
            <div className='flex gap-2'>
              <button onClick={downloadRtfTemplate}
                className='px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200 flex items-center gap-1.5'>
                ⬇️ Download Template .rtf
              </button>
              <button onClick={()=>setShowAddTpl(!showAddTpl)}
                className='px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                {t('+ Tambah Perusahaan','+ Add Company')}
              </button>
            </div>
          </div>

          {showAddTpl && (
            <div className='bg-white rounded-xl p-5 shadow-sm border border-red-200 mb-6'>
              <h3 className='font-semibold text-gray-700 mb-4 text-sm'>{t('Tambah Template untuk Perusahaan Baru','Add Template for New Company')}</h3>
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Perusahaan</label>
                  <select value={tplForm.companyId} onChange={e=>setTplForm(p=>({...p,companyId:Number(e.target.value)}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                    <option value=''>-- Pilih Perusahaan --</option>
                    {activeCompanies
                      .filter(c => !templates.find(t => t.companyId === c.id))
                      .map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Catatan</label>
                  <input value={tplForm.notes} onChange={e=>setTplForm(p=>({...p,notes:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' placeholder={t('Opsional','Optional')} />
                </div>
                <div className='col-span-2'>
                  <label className='block text-xs font-semibold text-gray-600 mb-2'>Color Theme</label>
                  <div className='flex flex-wrap gap-2'>
                    {THEMES.map(th=>(
                      <button key={th.id} onClick={()=>setTplForm(p=>({...p,themeId:th.id}))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition ${tplForm.themeId===th.id?'border-red-400 bg-red-50 text-red-700':'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                        <span className='w-3 h-3 rounded-full' style={{ background:th.primary }}></span>
                        {th.label}
                        {tplForm.themeId===th.id && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className='flex gap-3'>
                <button onClick={handleAddTemplate} className='px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90' style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{t('Tambah','Add')}</button>
                <button onClick={()=>setShowAddTpl(false)} className='px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>{t('Batal','Cancel')}</button>
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {templates.map(tpl=>{
              const theme = THEMES.find(th=>th.id===tpl.themeId) || THEMES[0]
              const isExpanded = editingTpl === tpl.id
              return (
                <div key={tpl.id} className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
                  {/* Card header bar */}
                  <div className='h-2' style={{ background:`linear-gradient(90deg,${theme.primary},${theme.accent})` }}></div>

                  <div className='p-5'>
                    <div className='flex items-start justify-between mb-4'>
                      <div>
                        <div className='font-bold text-gray-800'>{companyName(tpl.companyId)}</div>
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='w-3 h-3 rounded-full' style={{ background:theme.primary }}></span>
                          <span className='text-xs text-gray-500'>{theme.label}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${tpl.status==='Active'?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>{tpl.status}</span>
                        </div>
                      </div>
                      <div className='flex gap-1.5'>
                        <button onClick={()=>setPreviewTpl(previewTpl===tpl.id?null:tpl.id)}
                          className='px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100'>
                          {previewTpl===tpl.id?t('Tutup','Close'):t('Preview','Preview')}
                        </button>
                        <button onClick={()=>setEditingTpl(isExpanded?null:tpl.id)}
                          className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg ${isExpanded?'bg-gray-100 text-gray-600':'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                          {isExpanded?t('Tutup','Close'):'Edit'}
                        </button>
                        <button onClick={()=>handleDeleteTpl(tpl.id)}
                          className='px-2.5 py-1.5 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100'>
                          {t('Hapus','Delete')}
                        </button>
                      </div>
                    </div>

                    {/* Preview area */}
                    {previewTpl===tpl.id && (
                      <div className='mb-4'>
                        <CertPreview theme={tpl.themeId} company={companyName(tpl.companyId)} />
                        <p className='text-xs text-gray-400 text-center mt-2'>Preview mini — representasi color theme pada layout sertifikat</p>
                      </div>
                    )}

                    {/* File upload zone */}
                    <div
                      className={`rounded-xl border-2 border-dashed p-5 text-center transition cursor-pointer mb-3 ${dragOver===tpl.id?'border-red-400 bg-red-50':'border-gray-200 hover:border-red-300 hover:bg-gray-50'}`}
                      onDragOver={e=>{ e.preventDefault(); setDragOver(tpl.id) }}
                      onDragLeave={()=>setDragOver(null)}
                      onDrop={e=>{ e.preventDefault(); setDragOver(null); const f=e.dataTransfer.files[0]; if(f) handleTplFileSelect(tpl.id,f) }}
                      onClick={()=>fileRefs.current[tpl.id]?.click()}>
                      <input
                        ref={el=>fileRefs.current[tpl.id]=el}
                        type='file' accept='.rtf' className='hidden'
                        onChange={e=>handleTplFileSelect(tpl.id,e.target.files[0])} />
                      {tpl.fileName ? (
                        <div>
                          <div className='text-2xl mb-1'>📄</div>
                          <div className='font-semibold text-gray-700 text-sm'>{tpl.fileName}</div>
                          <div className='text-xs text-gray-400 mt-0.5'>Diupload: {tpl.uploadedAt} · Klik untuk ganti</div>
                        </div>
                      ) : (
                        <div>
                          <div className='text-3xl mb-2'>📂</div>
                          <p className='text-sm font-semibold text-gray-500'>Drag & drop atau klik untuk upload</p>
                          <p className='text-xs text-gray-400 mt-1'>Hanya file <span className='font-bold text-red-600'>.rtf</span> yang diterima</p>
                        </div>
                      )}
                    </div>

                    {/* Edit panel: theme selector */}
                    {isExpanded && (
                      <div className='border-t border-gray-100 pt-4'>
                        <div className='text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide'>Pilih Color Theme</div>
                        <div className='grid grid-cols-2 gap-2 mb-3'>
                          {THEMES.map(th=>(
                            <button key={th.id} onClick={()=>handleTplThemeChange(tpl.id, th.id)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-semibold transition ${tpl.themeId===th.id?'border-red-400 bg-red-50':'border-gray-200 hover:border-gray-300'}`}>
                              <span className='w-4 h-4 rounded-full shrink-0' style={{ background:`linear-gradient(135deg,${th.primary},${th.accent})` }}></span>
                              <span className='flex-1 text-left text-gray-700'>{th.label}</span>
                              {tpl.themeId===th.id && <span className='text-red-600'>✓</span>}
                            </button>
                          ))}
                        </div>
                        {/* color swatches display */}
                        <div className='bg-gray-50 rounded-lg p-3 text-xs text-gray-500'>
                          <div className='font-semibold text-gray-600 mb-2'>Warna yang akan digunakan di .rtf:</div>
                          <div className='flex gap-3'>
                            {[['Primary',theme.primary],['Accent',theme.accent],['Background',theme.bg]].map(([l,c])=>(
                              <div key={l} className='flex items-center gap-1.5'>
                                <span className='w-5 h-5 rounded border border-gray-200' style={{ background:c }}></span>
                                <span>{l}: <code className='font-mono text-gray-700'>{c}</code></span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {tpl.notes && <p className='text-xs text-gray-400 mt-2'>📝 {tpl.notes}</p>}
                      </div>
                    )}

                    {/* Footer: file info + download guide */}
                    {!isExpanded && (
                      <div className='flex items-center justify-between'>
                        <div className='text-xs text-gray-400'>{tpl.notes || t('Tidak ada catatan','No notes')}</div>
                        <button className='text-xs font-semibold text-gray-500 hover:text-red-600 flex items-center gap-1'>
                          ⬇️ Panduan Warna
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: Variable Reference ─────────────────────────────────────────── */}
      {tab === 'variables' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-xl p-6 shadow-sm'>
              <div className='flex items-center justify-between mb-2'>
                <h2 className='font-bold text-gray-700'>{'{ }'} Daftar Variabel Template RTF</h2>
                <span className='text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-semibold'>{RTF_VARIABLES.length} variabel</span>
              </div>
              <p className='text-xs text-gray-500 mb-5'>
                Variabel ini digunakan di <b>semua</b> file .rtf, tidak tergantung perusahaan maupun color theme.
                Klik baris untuk menyalin variabel ke clipboard.
              </p>
              <div className='space-y-1'>
                {RTF_VARIABLES.map((v,i)=>(
                  <button key={v.var} onClick={()=>copyVar(v.var)}
                    className='w-full flex items-center gap-4 px-4 py-3 rounded-lg text-left hover:bg-red-50 transition group border border-transparent hover:border-red-100'>
                    <span className='text-xs text-gray-400 w-5 text-right shrink-0'>{i+1}</span>
                    <code className={`font-mono text-xs font-bold px-2 py-1 rounded w-56 shrink-0 transition ${copiedVar===v.var?'bg-green-100 text-green-700':'bg-gray-100 text-red-700 group-hover:bg-red-100'}`}>
                      {copiedVar===v.var?'✓ disalin!':v.var}
                    </code>
                    <span className='text-sm text-gray-600'>{v.desc}</span>
                    <span className='ml-auto text-xs text-gray-300 group-hover:text-red-400 shrink-0'>klik salin</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='bg-white rounded-xl p-5 shadow-sm'>
              <h3 className='font-bold text-gray-700 mb-3 text-sm'>📄 Contoh Penggunaan di .rtf</h3>
              <div className='bg-gray-50 rounded-lg p-4 font-mono text-xs text-gray-700 leading-relaxed border border-gray-200'>
                <div className='text-gray-400 mb-1'>{'// Contoh teks di dalam file .rtf:'}</div>
                <div>Diberikan kepada</div>
                <div className='text-red-700 font-bold'>{'{{learner_name}}'}</div>
                <br/>
                <div>NIK: <span className='text-red-700'>{'{{nik}}'}</span></div>
                <div>Jabatan: <span className='text-red-700'>{'{{position}}'}</span></div>
                <br/>
                <div>Telah berhasil menyelesaikan</div>
                <div className='text-red-700 font-bold'>{'{{course_name}}'}</div>
                <div>({`{{training_hours}}`} jam pelatihan)</div>
                <br/>
                <div>Nilai: <span className='text-red-700'>{'{{score}}'}</span></div>
                <div>Tanggal: <span className='text-red-700'>{'{{completion_date}}'}</span></div>
                <br/>
                <div>No. Sertifikat: <span className='text-red-700'>{'{{certificate_number}}'}</span></div>
                <br/>
                <div>Ttd,</div>
                <div className='text-red-700'>{'{{approver_name}}'}</div>
                <div className='text-red-700'>{'{{approver_title}}'}</div>
              </div>
            </div>

            <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-5'>
              <h3 className='font-bold text-yellow-700 mb-2 text-sm'>⚠️ Aturan Penulisan Variabel</h3>
              <ul className='text-xs text-yellow-700 space-y-1.5'>
                <li>• Gunakan kurung kurawal ganda: <code className='bg-yellow-100 px-1 rounded'>{'{{var}}'}</code></li>
                <li>• Penulisan harus <b>persis sama</b> termasuk huruf kecil dan underscore</li>
                <li>• Jangan tambahkan spasi di dalam kurung</li>
                <li>• Warna teks variabel di .rtf bisa diubah bebas (tidak mempengaruhi nilai)</li>
                <li>• Variabel yang tidak cocok akan dibiarkan kosong saat generate</li>
              </ul>
            </div>

            <div className='bg-white rounded-xl p-5 shadow-sm'>
              <h3 className='font-bold text-gray-700 mb-3 text-sm'>🎨 Perbedaan Antar Template</h3>
              <p className='text-xs text-gray-500 mb-3'>Yang <b>berbeda</b> di setiap file .rtf perusahaan:</p>
              <div className='space-y-2'>
                {[['Warna header/border','Sesuai color theme'],['Logo perusahaan','Insert manual di .rtf'],['Nama perusahaan','Via {{company_name}}'],['Warna teks judul','Sesuai color theme']].map(([a,b])=>(
                  <div key={a} className='flex items-start gap-2 text-xs'>
                    <span className='text-green-500 shrink-0 mt-0.5'>✓</span>
                    <span className='text-gray-700'><b>{a}</b> — <span className='text-gray-500'>{b}</span></span>
                  </div>
                ))}
              </div>
              <div className='mt-3 pt-3 border-t border-gray-100'>
                <p className='text-xs text-gray-500 mb-2'>Yang <b>sama</b> di semua template:</p>
                <div className='space-y-1'>
                  {['Semua variabel ([[...]])','Layout / susunan konten','Ukuran halaman sesuai RTF','Font family'].map(i=>(
                    <div key={i} className='flex items-center gap-2 text-xs text-gray-500'>
                      <span className='text-blue-400'>≡</span><span>{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
