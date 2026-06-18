'use client'
import { useState, useRef, useCallback } from 'react'
import { useT } from '@/store/languageStore'

const CONTENT_TYPES = ['Video','PDF','SCORM','eBook','H5P','Page']
const STATUS_OPTS   = ['Active','Inactive','Draft']

const INIT = [
  { id:1, title:'Pengantar K3 & Keselamatan Kerja', type:'Video', size:'245 MB', duration:'45 menit', status:'Active', uploaded:'2024-01-10',
    videoSource:'url', videoUrl:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', videoFileName:'', videoFileSize:'', videoObjectUrl:'', allowFastForward: false },
  { id:2, title:'SOP Operasional Pabrik v2.1', type:'PDF', size:'12 MB', duration:'-', status:'Active', uploaded:'2024-02-14',
    videoSource:null, videoUrl:'', videoFileName:'', videoFileSize:'', videoObjectUrl:'', allowFastForward: true },
  { id:3, title:'Excel Advanced for HR', type:'SCORM', size:'180 MB', duration:'3 jam', status:'Active', uploaded:'2024-03-01',
    videoSource:null, videoUrl:'', videoFileName:'', videoFileSize:'', videoObjectUrl:'', allowFastForward: true },
  { id:4, title:'Panduan Compliance & GCG', type:'eBook', size:'8 MB', duration:'-', status:'Active', uploaded:'2024-03-15',
    videoSource:null, videoUrl:'', videoFileName:'', videoFileSize:'', videoObjectUrl:'', allowFastForward: true },
  { id:5, title:'Leadership Skill H5P Module', type:'H5P', size:'95 MB', duration:'2 jam', status:'Draft', uploaded:'2024-04-01',
    videoSource:null, videoUrl:'', videoFileName:'', videoFileSize:'', videoObjectUrl:'', allowFastForward: true },
]

const EMPTY = {
  title:'', type:'Video', description:'', duration:'', tags:'', status:'Active',
  videoSource: null, videoUrl: '', videoFileName: '', videoFileSize: '', videoObjectUrl: '',
  allowFastForward: true,
}

const fmtSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const getYouTubeId = (url) => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/)
  return m ? m[1] : null
}

const getVimeoId = (url) => {
  const m = url.match(/(?:vimeo\.com\/)(\d+)/)
  return m ? m[1] : null
}

function VideoPlayer({ item }) {
  const videoRef = useRef()
  const noFF     = !item.allowFastForward

  // Native event listeners — React synthetic events fire too late for reliable seek blocking
  const attachGuard = useCallback((el) => {
    if (!el || !noFF) return
    let maxTime   = 0
    let resetting = false

    const onTimeUpdate = () => {
      // only advance maxTime during normal playback, not while seeking
      if (!el.seeking) maxTime = Math.max(maxTime, el.currentTime)
    }
    const onSeeking = () => {
      if (resetting) { resetting = false; return }
      if (el.currentTime > maxTime + 0.5) {
        resetting = true
        el.currentTime = maxTime
      }
    }

    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('seeking',    onSeeking)
    el._ffCleanup = () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('seeking',    onSeeking)
    }
  }, [noFF])

  const videoCallbackRef = useCallback((el) => {
    // cleanup previous ref
    if (videoRef.current?._ffCleanup) videoRef.current._ffCleanup()
    videoRef.current = el
    attachGuard(el)
  }, [attachGuard])

  const noFFNotice = noFF && (
    <div className='flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold'>
      <span>⛔</span> Fast Forward dinonaktifkan — video harus ditonton penuh
    </div>
  )

  if (item.videoSource === 'url' && item.videoUrl) {
    const ytId = getYouTubeId(item.videoUrl)
    if (ytId) return (
      <div>
        {noFFNotice}
        {noFF && <p className='text-xs text-orange-300 px-3 py-1 bg-black'>Catatan: pembatasan FF tidak berlaku untuk embed YouTube/Vimeo.</p>}
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
          className='w-full' style={{ aspectRatio:'16/9', display:'block' }}
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        />
      </div>
    )
    const vimeoId = getVimeoId(item.videoUrl)
    if (vimeoId) return (
      <div>
        {noFFNotice}
        {noFF && <p className='text-xs text-orange-300 px-3 py-1 bg-black'>Catatan: pembatasan FF tidak berlaku untuk embed YouTube/Vimeo.</p>}
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
          className='w-full' style={{ aspectRatio:'16/9', display:'block' }}
          allow='autoplay; fullscreen; picture-in-picture'
          allowFullScreen
        />
      </div>
    )
    return (
      <div>
        {noFFNotice}
        <video ref={videoCallbackRef} src={item.videoUrl} controls autoPlay
          className='w-full rounded-lg' style={{ maxHeight:400, display:'block' }}>
          Browser tidak mendukung tag video.
        </video>
      </div>
    )
  }
  if (item.videoSource === 'upload' && item.videoObjectUrl) {
    return (
      <div>
        {noFFNotice}
        <video ref={videoCallbackRef} src={item.videoObjectUrl} controls autoPlay
          className='w-full rounded-lg' style={{ maxHeight:400, display:'block' }}>
          Browser tidak mendukung tag video.
        </video>
      </div>
    )
  }
  return <p className='text-gray-400 text-sm text-center py-10'>{t('Tidak ada sumber video.','No video source.')}</p>
}

export default function MasterContentPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [filter,  setFilter ] = useState('All')
  const [msg,     setMsg    ] = useState(null)
  const [preview, setPreview] = useState(null)   // item being previewed
  const [dragOver, setDragOver] = useState(false)
  const fileRef  = useRef()
  const titleRef = useRef()

  const flash = (text, type='success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3500)
  }

  const filtered = data.filter(d =>
    (filter === 'All' || d.type === filter) &&
    (d.title.toLowerCase().includes(search.toLowerCase()))
  )

  const handleFile = (file) => {
    if (!file) return
    const isVideo = file.type.startsWith('video/') ||
      /\.(mp4|webm|ogg|mov|avi|mkv|m4v|flv|wmv)$/i.test(file.name)
    if (!isVideo) return flash(t('File harus berformat video (mp4, webm, mov, dll).','File must be a video format (mp4, webm, mov, etc).'), 'error')
    const objectUrl = URL.createObjectURL(file)
    setForm(f => ({ ...f, videoSource:'upload', videoFileName: file.name, videoFileSize: fmtSize(file.size), videoObjectUrl: objectUrl, videoUrl:'' }))
  }

  const handleSave = () => {
    if (!form.title.trim()) {
      flash(t('Judul content wajib diisi.','Content title is required.'), 'error')
      titleRef.current?.scrollIntoView({ behavior:'smooth', block:'center' })
      titleRef.current?.focus()
      return
    }
    if (form.type === 'Video' && form.videoSource === 'url' && form.videoUrl && !form.videoUrl.startsWith('http')) {
      return flash(t('URL video tidak valid. Gunakan format http:// atau https://','Invalid video URL. Use http:// or https:// format.'), 'error')
    }
    const entry = {
      ...form,
      size: form.videoFileSize || '-',
    }
    if (editing) {
      setData(prev => prev.map(d => d.id === editing ? { ...d, ...entry } : d))
      flash(t('Content diperbarui.','Content updated.'))
      setEditing(null)
    } else {
      setData(prev => [...prev, { id: Date.now(), ...entry, uploaded: new Date().toISOString().slice(0,10) }])
      flash(t('Content ditambahkan.','Content added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => {
    setEditing(item.id)
    setForm({
      title: item.title, type: item.type, description: item.description || '',
      duration: item.duration, tags: item.tags || '', status: item.status,
      videoSource: item.videoSource || null,
      videoUrl: item.videoUrl || '',
      videoFileName: item.videoFileName || '',
      videoFileSize: item.videoFileSize || '',
      videoObjectUrl: item.videoObjectUrl || '',
      allowFastForward: item.allowFastForward ?? true,
    })
  }

  const handleDelete = (id) => { setData(prev => prev.filter(d => d.id !== id)); flash(t('Content dihapus.','Content deleted.')) }

  const stats = { total: data.length, active: data.filter(d=>d.status==='Active').length, draft: data.filter(d=>d.status==='Draft').length }

  const hasVideo = (item) => item.type === 'Video' && item.videoSource

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Content','Master Content')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Repository materi pembelajaran — Video, PDF, SCORM, eBook, H5P, Page.','Learning content repository — Video, PDF, SCORM, eBook, H5P, Page.')}</p>

      {/* Stats */}
      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[['Total Content', stats.total, '📦', '#8B1A1A'],['Active', stats.active, '✅', '#059669'],['Draft', stats.draft, '📝', '#d97706']].map(([l,v,i,c]) => (
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background: c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* ── Form ── */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?`✏️ ${t('Edit Content','Edit Content')}`:`➕ ${t('Tambah Content','Add Content')}`}</h2>
          <div className='flex flex-col gap-3'>
            {/* Tipe */}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Tipe Content</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value,videoSource:null,videoUrl:'',videoFileName:'',videoFileSize:'',videoObjectUrl:''}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {CONTENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Judul */}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>
                Judul Content <span className='text-red-400'>*</span>
              </label>
              <input
                ref={titleRef}
                type='text'
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder='Masukkan judul content...'
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-red-400 ${
                  !form.title.trim() && msg?.type === 'error'
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200'
                }`}
              />
            </div>
            {/* Durasi, Tags */}
            {[['Durasi (mis: 45 menit)','duration'],['Tags (pisah koma)','tags']].map(([l,k]) => (
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input type='text' value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}

            {/* ── Video source section ── */}
            {form.type === 'Video' && (
              <div className='border border-gray-200 rounded-xl p-3 flex flex-col gap-3'>
                <p className='text-xs font-bold text-gray-600'>Sumber Video</p>

                {/* Tab selector */}
                <div className='flex gap-1'>
                  {[['upload','⬆️ Upload File'],['url','🔗 URL Video']].map(([v,l]) => (
                    <button key={v} type='button'
                      onClick={() => setForm(f => ({ ...f, videoSource: v, videoUrl:'', videoFileName:'', videoFileSize:'', videoObjectUrl:'' }))}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${form.videoSource===v?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {l}
                    </button>
                  ))}
                </div>

                {/* Upload panel */}
                {form.videoSource === 'upload' && (
                  <div>
                    {form.videoFileName ? (
                      <div className='flex items-center gap-2 p-2 bg-red-50 rounded-lg'>
                        <span className='text-lg'>🎬</span>
                        <div className='flex-1 min-w-0'>
                          <p className='text-xs font-semibold text-gray-700 truncate'>{form.videoFileName}</p>
                          <p className='text-xs text-gray-400'>{form.videoFileSize}</p>
                        </div>
                        <button type='button' onClick={() => setForm(f=>({...f,videoFileName:'',videoFileSize:'',videoObjectUrl:''}))}
                          className='text-red-400 hover:text-red-600 text-xs font-bold px-1'>✕</button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${dragOver?'border-red-400 bg-red-50':'border-gray-200 hover:border-red-300 hover:bg-gray-50'}`}>
                        <p className='text-2xl mb-1'>🎬</p>
                        <p className='text-xs font-semibold text-gray-600'>Klik atau drag video ke sini</p>
                        <p className='text-xs text-gray-400 mt-0.5'>MP4, WebM, OGG — maks 2 GB</p>
                      </div>
                    )}
                    <input ref={fileRef} type='file' accept='video/*' className='hidden'
                      onChange={e => handleFile(e.target.files[0])} />
                  </div>
                )}

                {/* URL panel */}
                {form.videoSource === 'url' && (
                  <div>
                    <input
                      type='url'
                      value={form.videoUrl}
                      onChange={e => setForm(f=>({...f,videoUrl:e.target.value}))}
                      placeholder='https://youtube.com/watch?v=... atau URL video langsung'
                      className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                    <p className='text-xs text-gray-400 mt-1'>Mendukung YouTube, Vimeo, dan URL MP4 langsung.</p>
                    {form.videoUrl && (
                      <p className='text-xs mt-1 font-semibold text-red-600'>
                        {getYouTubeId(form.videoUrl) ? '▶ YouTube terdeteksi' : getVimeoId(form.videoUrl) ? '▶ Vimeo terdeteksi' : '▶ URL video langsung'}
                      </p>
                    )}
                  </div>
                )}

                {/* Fast-forward toggle */}
                <div className='flex items-center justify-between pt-1 border-t border-gray-100'>
                  <div>
                    <p className='text-xs font-semibold text-gray-700'>Izinkan Fast Forward</p>
                    <p className='text-xs text-gray-400 mt-0.5'>
                      {form.allowFastForward ? 'Learner bebas skip/seek video' : 'Learner wajib tonton penuh, tidak bisa skip'}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={() => setForm(f => ({ ...f, allowFastForward: !f.allowFastForward }))}
                    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${form.allowFastForward ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.allowFastForward ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}

            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Deskripsi</label>
              <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' /></div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
              </select></div>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{editing?t('Simpan','Save'):t('Tambah','Add')}</button>
              {editing && <button onClick={()=>{setEditing(null);setForm(EMPTY)}}
                className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <div className='flex flex-wrap gap-3 mb-4'>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Cari content...','Search content...')}
              className='flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            <div className='flex gap-1 flex-wrap'>
              {['All',...CONTENT_TYPES].map(t => (
                <button key={t} onClick={()=>setFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filter===t?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Judul','Tipe','Durasi','Tgl Upload','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.length ? filtered.map(d => (
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5'>
                    <p className='font-medium text-gray-700'>{d.title}</p>
                    {hasVideo(d) && (
                      <div className='flex items-center gap-1.5 mt-0.5 flex-wrap'>
                        <p className='text-xs text-red-500'>
                          {d.videoSource==='url'
                            ? (getYouTubeId(d.videoUrl) ? '▶ YouTube' : getVimeoId(d.videoUrl) ? '▶ Vimeo' : '▶ URL Video')
                            : `▶ ${d.videoFileName}`}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${d.allowFastForward ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                          {d.allowFastForward ? 'FF: On' : 'FF: Off'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className='px-3 py-2.5'><span className='text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold'>{d.type}</span></td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.duration}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.uploaded}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status==='Active'?'bg-green-50 text-green-700':d.status==='Draft'?'bg-yellow-50 text-yellow-700':'bg-gray-100 text-gray-500'}`}>{d.status}</span></td>
                  <td className='px-3 py-2.5'>
                    <div className='flex gap-1'>
                      {hasVideo(d) && (
                        <button onClick={() => setPreview(d)}
                          className='px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>▶ Play</button>
                      )}
                      <button onClick={()=>handleEdit(d)} className='px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                      <button onClick={()=>handleDelete(d.id)} className='px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={6} className='px-3 py-8 text-center text-gray-400'>{t('Tidak ada data.','No data found.')}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Fixed toast ── */}
      {msg && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold pointer-events-none transition-all
          ${msg.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          <span>{msg.type === 'error' ? '⚠️' : '✅'}</span>
          {msg.text}
        </div>
      )}

      {/* ── Preview Modal ── */}
      {preview && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4' style={{ background:'rgba(0,0,0,0.7)' }}
          onClick={() => setPreview(null)}>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden' onClick={e => e.stopPropagation()}>
            <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
              <div>
                <div className='flex items-center gap-2'>
                  <h3 className='font-bold text-gray-800 text-sm'>{preview.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${preview.allowFastForward ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {preview.allowFastForward ? '⏩ FF On' : '⛔ FF Off'}
                  </span>
                </div>
                <p className='text-xs text-gray-400 mt-0.5'>
                  {preview.videoSource==='upload' ? `File: ${preview.videoFileName}` : `URL: ${preview.videoUrl}`}
                </p>
              </div>
              <button onClick={() => setPreview(null)}
                className='w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-sm transition'>✕</button>
            </div>
            <div className='p-4 bg-black'>
              <VideoPlayer item={preview} />
            </div>
            {preview.description && (
              <div className='px-5 py-3 bg-gray-50 border-t border-gray-100'>
                <p className='text-xs text-gray-600'>{preview.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
