'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const COMMUNITIES = [
  { id:1, name:'Data Analytics Guild', category:'Technical', members:142, posts:38, pinned:['Excel Power Query Tips - Share yours!'], myRole:'Member', lastPost:'2 jam lalu', description:'Komunitas untuk sharing ilmu data analytics, BI tools, dan best practice pengolahan data.' },
  { id:2, name:'Leadership Circle', category:'Leadership', members:67, posts:22, pinned:['Buku rekomendasi bulan ini: "The Coaching Habit"'], myRole:'Moderator', lastPost:'1 hari lalu', description:'Ruang diskusi eksklusif bagi para pemimpin untuk berbagi insight dan strategi leadership.' },
  { id:3, name:'IT Security Corner', category:'Technical', members:95, posts:55, pinned:['Prosedur baru: laporan insiden keamanan'], myRole:'Member', lastPost:'5 jam lalu', description:'Forum khusus topik keamanan siber, update threat intelligence, dan sharing best practice.' },
  { id:4, name:'Onboarding Buddies', category:'Onboarding', members:30, posts:12, pinned:['Welcome Kit untuk karyawan baru'], myRole:'Contributor', lastPost:'3 hari lalu', description:'Komunitas pendampingan karyawan baru, sharing pengalaman onboarding dan tips kerja.' },
]

const MY_VIDEOS = [
  { id:1, title:'Tips Pivot Table Advanced', views:234, likes:18, uploaded:'2025-07-15', status:'Published', duration:'8:32' },
  { id:2, title:'Macro VBA untuk Otomasi Laporan', views:178, likes:14, uploaded:'2025-06-28', status:'Published', duration:'12:10' },
  { id:3, title:'Power BI Dashboard Tutorial', views:0, likes:0, uploaded:null, status:'Draft', duration:'—' },
]

const FEED = [
  { id:1, community:'Data Analytics Guild', author:'Dewi S.', time:'2 jam lalu', content:'Baru nemu cara bikin dynamic chart di Excel tanpa VBA! Check attachment ya 📊', likes:12, comments:5 },
  { id:2, community:'IT Security Corner', author:'Rizky P.', time:'5 jam lalu', content:'Reminder: update password semua akun sebelum akhir bulan sesuai kebijakan baru.', likes:8, comments:2 },
  { id:3, community:'Leadership Circle', author:'Ahmad F.', time:'1 hari lalu', content:'Resume dari workshop Servant Leadership kemarin — ada 3 poin utama yang perlu kita internalisasi…', likes:24, comments:10 },
]

const TABS = ['Komunitas Saya', 'Feed Terbaru', 'Publish Video']

export default function LearningCommunityPage() {
  const t = useT()
  const [tab, setTab] = useState('Komunitas Saya')
  const [videoTitle, setVideoTitle] = useState('')
  const [videoDesc, setVideoDesc] = useState('')
  const [msg, setMsg] = useState(null)
  const [liked, setLiked] = useState({})

  const flash = (text) => { setMsg(text); setTimeout(()=>setMsg(null), 3000) }

  const handlePublish = () => {
    if (!videoTitle.trim()) return flash('Judul video wajib diisi.')
    flash('Video berhasil dikirim untuk review moderator!')
    setVideoTitle('')
    setVideoDesc('')
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Learning Community</h1>
      <p className='text-gray-500 text-sm mb-6'>Bergabung, diskusi, dan bagikan pengetahuan bersama rekan-rekan Anda.</p>

      {msg && <div className='text-xs px-4 py-3 rounded-lg mb-4 bg-green-50 text-green-600'>{msg}</div>}

      <div className='flex gap-2 mb-6'>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab===t?'text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            style={tab===t?{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}:{}}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Komunitas Saya' && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          {COMMUNITIES.map(c => (
            <div key={c.id} className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-red-200 transition'>
              <div className='flex items-start justify-between mb-2'>
                <div>
                  <div className='font-bold text-gray-800'>{c.name}</div>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold'>{c.category}</span>
                    <span className='text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold'>{c.myRole}</span>
                  </div>
                </div>
                <div className='text-right text-xs text-gray-400'>
                  <div>👥 {c.members} members</div>
                  <div>💬 {c.posts} posts</div>
                </div>
              </div>
              <p className='text-xs text-gray-500 mb-3'>{c.description}</p>
              {c.pinned.map(p => (
                <div key={p} className='text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg mb-2 flex items-center gap-1.5'>
                  <span>📌</span><span className='line-clamp-1'>{p}</span>
                </div>
              ))}
              <div className='flex items-center justify-between mt-2'>
                <span className='text-xs text-gray-400'>Terakhir aktif: {c.lastPost}</span>
                <button className='px-3 py-1.5 text-xs font-semibold rounded-lg text-white' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>Buka Forum →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Feed Terbaru' && (
        <div className='max-w-2xl space-y-4'>
          {FEED.map(f => (
            <div key={f.id} className='bg-white rounded-xl p-5 shadow-sm border border-gray-100'>
              <div className='flex items-center gap-2 mb-2'>
                <div className='w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold text-red-700'>{f.author[0]}</div>
                <div>
                  <div className='text-sm font-semibold text-gray-700'>{f.author}</div>
                  <div className='flex items-center gap-1.5 text-xs text-gray-400'>
                    <span>📌 {f.community}</span>
                    <span>·</span>
                    <span>{f.time}</span>
                  </div>
                </div>
              </div>
              <p className='text-sm text-gray-700 mb-3'>{f.content}</p>
              <div className='flex gap-4 text-xs text-gray-500'>
                <button onClick={() => setLiked(p=>({...p,[f.id]:!p[f.id]}))}
                  className={`flex items-center gap-1 transition ${liked[f.id]?'text-red-600 font-semibold':''}`}>
                  👍 {f.likes + (liked[f.id]?1:0)}
                </button>
                <button className='flex items-center gap-1'>💬 {f.comments}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Publish Video' && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white rounded-xl p-6 shadow-sm'>
            <h2 className='font-bold text-gray-700 mb-4'>📤 Upload Video Sharing Session</h2>
            <div className='space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Judul Video <span className='text-red-500'>*</span></label>
                <input value={videoTitle} onChange={e=>setVideoTitle(e.target.value)}
                  className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' placeholder='Contoh: Tips Membuat Dashboard dengan Excel' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Deskripsi</label>
                <textarea value={videoDesc} onChange={e=>setVideoDesc(e.target.value)} rows={3}
                  className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' placeholder='Jelaskan isi video Anda...' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1.5'>File Video</label>
                <div className='border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-red-300 transition cursor-pointer'>
                  <div className='text-3xl mb-2'>🎬</div>
                  <p className='text-sm text-gray-500'>Klik atau drag & drop file video</p>
                  <p className='text-xs text-gray-400 mt-1'>MP4, MOV, AVI • Max 500 MB</p>
                </div>
              </div>
              <button onClick={handlePublish}
                className='w-full py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
                📤 Submit Video
              </button>
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-sm'>
            <h2 className='font-bold text-gray-700 mb-4'>🎬 Video Saya</h2>
            <div className='space-y-3'>
              {MY_VIDEOS.map(v => (
                <div key={v.id} className='border border-gray-200 rounded-lg p-4 hover:border-red-200 transition'>
                  <div className='flex items-start justify-between mb-1'>
                    <div className='font-semibold text-gray-700 text-sm'>{v.title}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${v.status==='Published'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{v.status}</span>
                  </div>
                  <div className='flex gap-4 text-xs text-gray-500 mt-1'>
                    <span>⏱️ {v.duration}</span>
                    {v.status==='Published' && <>
                      <span>👁️ {v.views} views</span>
                      <span>👍 {v.likes}</span>
                      <span>📅 {v.uploaded}</span>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
