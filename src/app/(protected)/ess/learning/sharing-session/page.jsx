'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const SESSIONS = [
  { id:1, title:'Excel Macro VBA untuk Otomasi Laporan', presenter:'Ahmad Fauzi', dept:'Finance', date:'2025-08-20', time:'14:00-15:30', format:'Hybrid', registered:45, capacity:60, status:'Upcoming', tags:['Excel','Automation','VBA'] },
  { id:2, title:'Tips & Tricks Power BI Dashboard', presenter:'Dewi Sari', dept:'HR', date:'2025-08-10', time:'10:00-11:00', format:'Virtual', registered:38, capacity:50, status:'Upcoming', tags:['Power BI','Dashboard','Analytics'] },
  { id:3, title:'Leadership Lessons from the Field', presenter:'Rizky Pratama', dept:'IT', date:'2025-07-28', time:'13:00-14:30', format:'Offline', registered:25, capacity:30, status:'Completed', tags:['Leadership','Soft Skills'], recording:'https://drive.internal/video123' },
  { id:4, title:'Strategi Negotiasi dalam Procurement', presenter:'Budi Rahayu', dept:'Procurement', date:'2025-07-15', time:'09:00-10:00', format:'Virtual', registered:52, capacity:60, status:'Completed', tags:['Negotiation','Procurement'], recording:'https://drive.internal/video456' },
]

const MY_PROPOSALS = [
  { id:1, title:'Introduction to Python for Non-Programmers', date:'2025-08-25', status:'Approved' },
  { id:2, title:'Mindfulness di Tempat Kerja', date:null, status:'Draft' },
]

export default function SharingSessionPage() {
  const t = useT()
  const [tab, setTab] = useState('Semua Sesi')
  const [registered, setRegistered] = useState({ 1: false, 2: true })
  const [showPropose, setShowPropose] = useState(false)
  const [proposal, setProposal] = useState({ title:'', desc:'', date:'', format:'Virtual' })
  const [msg, setMsg] = useState(null)

  const flash = (text) => { setMsg(text); setTimeout(()=>setMsg(null), 3000) }

  const handlePropose = () => {
    if (!proposal.title) return flash('Judul sesi wajib diisi.')
    flash('Proposal sesi sharing berhasil dikirim!')
    setShowPropose(false)
    setProposal({ title:'', desc:'', date:'', format:'Virtual' })
  }

  const upcoming = SESSIONS.filter(s=>s.status==='Upcoming')
  const completed = SESSIONS.filter(s=>s.status==='Completed')

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Employee Sharing Session</h1>
      <p className='text-gray-500 text-sm mb-6'>Berbagi pengetahuan dan pengalaman dengan sesama rekan — daftar sesi atau usulkan topik baru.</p>

      {msg && <div className='text-xs px-4 py-3 rounded-lg mb-4 bg-green-50 text-green-600'>{msg}</div>}

      <div className='flex gap-2 mb-6 flex-wrap'>
        {['Semua Sesi', 'Akan Datang', 'Selesai', 'Proposal Saya'].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab===t?'text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            style={tab===t?{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}:{}}>
            {t}
          </button>
        ))}
        <button onClick={()=>setShowPropose(true)}
          className='ml-auto px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          + Usulkan Topik
        </button>
      </div>

      {showPropose && (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-red-200 mb-6'>
          <h3 className='font-bold text-gray-700 mb-4'>Usulkan Topik Sharing Session</h3>
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Judul Sesi <span className='text-red-500'>*</span></label>
              <input value={proposal.title} onChange={e=>setProposal(p=>({...p,title:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' placeholder='Topik yang ingin Anda bagikan' />
            </div>
            <div className='col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Deskripsi Singkat</label>
              <textarea value={proposal.desc} onChange={e=>setProposal(p=>({...p,desc:e.target.value}))} rows={3}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Tanggal yang Diinginkan</label>
              <input type='date' value={proposal.date} onChange={e=>setProposal(p=>({...p,date:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Format</label>
              <select value={proposal.format} onChange={e=>setProposal(p=>({...p,format:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {['Virtual','Offline','Hybrid'].map(f=><option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className='flex gap-3'>
            <button onClick={handlePropose} className='px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>Kirim Proposal</button>
            <button onClick={()=>setShowPropose(false)} className='px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>{t('Batal','Cancel')}</button>
          </div>
        </div>
      )}

      {tab === 'Proposal Saya' ? (
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='font-bold text-gray-700 mb-4'>📋 Proposal Sesi Saya</h2>
          <div className='space-y-3'>
            {MY_PROPOSALS.map(p=>(
              <div key={p.id} className='border border-gray-200 rounded-lg p-4 flex items-center justify-between'>
                <div>
                  <div className='font-semibold text-gray-700'>{p.title}</div>
                  <div className='text-xs text-gray-400 mt-0.5'>{p.date || 'Tanggal belum ditentukan'}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.status==='Approved'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
          {(tab==='Semua Sesi'?SESSIONS:tab==='Akan Datang'?upcoming:completed).map(s=>(
            <div key={s.id} className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-red-100 transition'>
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <h3 className='font-bold text-gray-800'>{s.title}</h3>
                  <div className='flex items-center gap-3 mt-1 text-sm text-gray-500'>
                    <span>👤 {s.presenter}</span>
                    <span>🏢 {s.dept}</span>
                  </div>
                </div>
                <div className='text-right'>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.status==='Upcoming'?'bg-blue-50 text-blue-700':'bg-gray-100 text-gray-500'}`}>{s.status}</span>
                  <div className='text-xs text-gray-400 mt-1'>{s.format}</div>
                </div>
              </div>
              <div className='flex gap-4 text-xs text-gray-500 mb-3'>
                <span>📅 {s.date}</span>
                <span>🕐 {s.time}</span>
                <span>👥 {s.registered}/{s.capacity} peserta</span>
              </div>
              <div className='flex flex-wrap gap-1 mb-3'>
                {s.tags.map(t=><span key={t} className='text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full'>{t}</span>)}
              </div>
              <div className='flex gap-3'>
                {s.status==='Upcoming' && (
                  <button onClick={()=>setRegistered(p=>({...p,[s.id]:!p[s.id]}))}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${registered[s.id]?'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100':'text-white hover:opacity-90'}`}
                    style={!registered[s.id]?{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}:{}}>
                    {registered[s.id]?'Batal Daftar':'Daftar Sekarang'}
                  </button>
                )}
                {s.recording && (
                  <button className='px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100'>🎬 Tonton Recording</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
