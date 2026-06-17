'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const LEADERBOARD = [
  { rank:1, name:'Dewi Sari', dept:'HR', points:1250, badges:12, completed:18, streak:45, avatar:'DS', change:0 },
  { rank:2, name:'Ahmad Fauzi', dept:'Finance', points:1180, badges:10, completed:16, streak:30, avatar:'AF', change:1 },
  { rank:3, name:'Siti Nurhaliza', dept:'Marketing', points:1050, badges:9, completed:14, streak:22, avatar:'SN', change:-1 },
  { rank:4, name:'Rizky Pratama', dept:'IT', points:980, badges:8, completed:13, streak:18, avatar:'RP', change:2 },
  { rank:5, name:'Budi Rahayu', dept:'Operations', points:870, badges:7, completed:11, streak:14, avatar:'BR', change:0 },
  { rank:6, name:'Maya Indira', dept:'Legal', points:820, badges:6, completed:10, streak:10, avatar:'MI', change:1 },
  { rank:7, name:'Eko Wahyudi', dept:'Finance', points:760, badges:5, completed:9, streak:8, avatar:'EW', change:-2 },
  { rank:8, name:'Fitri Handayani', dept:'HR', points:700, badges:5, completed:8, streak:6, avatar:'FH', change:3 },
  { rank:9, name:'Joko Susilo', dept:'IT', points:640, badges:4, completed:7, streak:5, avatar:'JS', change:0 },
  { rank:10, name:'Yuni Astuti', dept:'Marketing', points:590, badges:4, completed:6, streak:4, avatar:'YA', change:-1 },
]

const MY_RANK = { rank:23, name:'Anda', dept:'Finance', points:420, badges:3, completed:5, streak:7, avatar:'MY' }

const BADGES_SHOWCASE = [
  { name:'🔥 On Fire', desc:'7-hari streak', earned:true },
  { name:'🏆 First Cert', desc:'Sertifikasi pertama', earned:true },
  { name:'📚 Bookworm', desc:'10 course selesai', earned:false },
  { name:'⭐ Top Scorer', desc:'Score 100 di assessment', earned:false },
]

export default function LeaderboardPage() {
  const t = useT()
  const [period, setPeriod] = useState('Bulan Ini')
  const [scope, setScope] = useState('Semua Departemen')

  const rankColor = (r) => r===1?'text-yellow-500':r===2?'text-gray-400':r===3?'text-amber-600':'text-gray-400'
  const rankBg   = (r) => r===1?'bg-yellow-50 border-yellow-200':r===2?'bg-gray-50 border-gray-200':r===3?'bg-amber-50 border-amber-200':'bg-white border-gray-100'
  const changeIcon = (c) => c>0?'↑':c<0?'↓':'—'
  const changeColor = (c) => c>0?'text-green-600':c<0?'text-red-500':'text-gray-300'

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Leaderboard Learning</h1>
      <p className='text-gray-500 text-sm mb-6'>Lihat posisi Anda dan berikan semangat belajar untuk terus naik peringkat!</p>

      {/* My Position */}
      <div className='p-5 rounded-xl text-white mb-6' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl'>{MY_RANK.avatar}</div>
            <div>
              <div className='text-xs text-white/70 mb-0.5'>Posisi Anda</div>
              <div className='text-3xl font-bold'>#{MY_RANK.rank}</div>
              <div className='text-sm text-white/80'>{MY_RANK.name} · {MY_RANK.dept}</div>
            </div>
          </div>
          <div className='grid grid-cols-3 gap-6 text-center'>
            {[[MY_RANK.points+' pts','🏅 Poin'],[MY_RANK.badges,'🏆 Badge'],[MY_RANK.streak+' hari','🔥 Streak']].map(([v,l])=>(
              <div key={l}>
                <div className='text-xl font-bold'>{v}</div>
                <div className='text-xs text-white/70'>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='flex gap-3 mb-6 flex-wrap'>
        {['Bulan Ini','Kuartal Ini','Tahun Ini'].map(p=>(
          <button key={p} onClick={()=>setPeriod(p)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${period===p?'text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            style={period===p?{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}:{}}>
            {p}
          </button>
        ))}
        <select value={scope} onChange={e=>setScope(e.target.value)}
          className='ml-auto px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none bg-white'>
          {['Semua Departemen','Finance','HR','IT','Marketing','Operations'].map(d=><option key={d}>{d}</option>)}
        </select>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <div className='space-y-2'>
            {LEADERBOARD.map(u => (
              <div key={u.rank} className={`flex items-center gap-4 rounded-xl p-4 border transition hover:shadow-md ${rankBg(u.rank)}`}>
                <div className={`w-8 text-center font-bold text-lg ${rankColor(u.rank)}`}>
                  {u.rank<=3 ? ['🥇','🥈','🥉'][u.rank-1] : `#${u.rank}`}
                </div>
                <div className='w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
                  {u.avatar}
                </div>
                <div className='flex-1'>
                  <div className='font-semibold text-gray-800 text-sm'>{u.name}</div>
                  <div className='text-xs text-gray-400'>{u.dept}</div>
                </div>
                <div className='flex gap-5 text-center text-xs'>
                  <div><div className='font-bold text-gray-800'>{u.points}</div><div className='text-gray-400'>Poin</div></div>
                  <div><div className='font-bold text-gray-800'>{u.badges}</div><div className='text-gray-400'>Badge</div></div>
                  <div><div className='font-bold text-gray-800'>{u.completed}</div><div className='text-gray-400'>Selesai</div></div>
                  <div><div className='font-bold text-gray-800'>{u.streak}d</div><div className='text-gray-400'>Streak</div></div>
                </div>
                <div className={`text-xs font-bold w-8 text-center ${changeColor(u.change)}`}>
                  {changeIcon(u.change)}{u.change!==0?Math.abs(u.change):''}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='space-y-4'>
          <div className='bg-white rounded-xl p-5 shadow-sm'>
            <h3 className='font-bold text-gray-700 mb-4'>🏆 Badge Showcase</h3>
            <div className='grid grid-cols-2 gap-3'>
              {BADGES_SHOWCASE.map(b=>(
                <div key={b.name} className={`rounded-lg p-3 text-center border ${b.earned?'border-red-200 bg-red-50':'border-gray-100 opacity-40'}`}>
                  <div className='text-2xl mb-1'>{b.name.split(' ')[0]}</div>
                  <div className='text-xs font-semibold text-gray-700'>{b.name.split(' ').slice(1).join(' ')}</div>
                  <div className='text-xs text-gray-400'>{b.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white rounded-xl p-5 shadow-sm'>
            <h3 className='font-bold text-gray-700 mb-3'>📈 Progress ke Rank Berikutnya</h3>
            <div className='text-center mb-3'>
              <span className='text-3xl font-bold text-gray-800'>#23</span>
              <span className='text-gray-400 text-sm mx-2'>→</span>
              <span className='text-2xl font-bold text-red-700'>#22</span>
            </div>
            <div className='text-xs text-gray-500 mb-2 text-center'>Butuh <span className='font-bold text-red-700'>80 poin</span> lagi</div>
            <div className='w-full bg-gray-200 rounded-full h-3'>
              <div className='h-3 rounded-full bg-gradient-to-r from-red-500 to-indigo-500' style={{width:'84%'}}></div>
            </div>
            <div className='flex justify-between text-xs text-gray-400 mt-1'>
              <span>420 pts</span><span>500 pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
