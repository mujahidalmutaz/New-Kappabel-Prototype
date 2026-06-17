'use client'
import Link from 'next/link'
import { useT } from '@/store/languageStore'

const TEAM_SUMMARY = [
  { name:'Ahmad Fauzi', role:'Finance Analyst', mandatory:3, completed:2, overdue:0, progress:75 },
  { name:'Dewi Sari', role:'HR Specialist', mandatory:4, completed:4, overdue:0, progress:100 },
  { name:'Budi Rahayu', role:'Ops Coordinator', mandatory:3, completed:1, overdue:1, progress:40 },
  { name:'Siti Nurhaliza', role:'Marketing Exec', mandatory:3, completed:2, overdue:0, progress:65 },
  { name:'Rizky Pratama', role:'IT Engineer', mandatory:2, completed:0, overdue:2, progress:0 },
]

const PENDING_APPROVAL = [
  { id:1, employee:'Rizky Pratama', type:'External Training', course:'AWS Solutions Architect', submitted:'2025-07-10', cost:8500000 },
  { id:2, employee:'Budi Rahayu', type:'External Training', course:'K3 Expert Certification', submitted:'2025-07-12', cost:5000000 },
]

export default function TeamLearningDashboard() {
  const t = useT()
  const totalTeam = TEAM_SUMMARY.length
  const onTrack = TEAM_SUMMARY.filter(t=>t.overdue===0).length
  const overdue = TEAM_SUMMARY.filter(t=>t.overdue>0).length
  const avgProgress = Math.round(TEAM_SUMMARY.reduce((a,t)=>a+t.progress,0)/totalTeam)
  const completionRate = Math.round(TEAM_SUMMARY.filter(t=>t.progress===100).length/totalTeam*100)

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Team Learning Dashboard</h1>
      <p className='text-gray-500 text-sm mb-6'>Monitor progress learning seluruh anggota tim Anda secara real-time.</p>

      <div className='grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6'>
        {[['Total Tim', totalTeam, '👥', '#8B1A1A'],['On Track', onTrack, '✅', '#059669'],['Overdue', overdue, '⚠️', '#dc2626'],['Avg Progress', avgProgress+'%', '📈', '#7c3aed'],['Completion Rate', completionRate+'%', '🏆', '#d97706']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-9 h-9 rounded-lg flex items-center justify-center text-lg' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='font-bold text-gray-700'>👥 Team Learning Progress</h2>
            <Link href='/mss/learning/progress' className='text-xs text-red-600 font-semibold hover:underline'>Lihat Detail →</Link>
          </div>
          <div className='space-y-4'>
            {TEAM_SUMMARY.map(t=>(
              <div key={t.name} className='flex items-center gap-4'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0'>
                  {t.name.charAt(0)}
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-1'>
                    <div>
                      <span className='text-sm font-semibold text-gray-700'>{t.name}</span>
                      <span className='text-xs text-gray-400 ml-2'>{t.role}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      {t.overdue > 0 && <span className='text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold'>⚠️ {t.overdue} Overdue</span>}
                      <span className='text-xs font-semibold text-gray-600'>{t.completed}/{t.mandatory} Selesai</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='flex-1 bg-gray-200 rounded-full h-2'>
                      <div className={`h-2 rounded-full ${t.overdue>0?'bg-red-400':t.progress===100?'bg-green-500':'bg-red-500'}`} style={{ width:`${t.progress}%` }}></div>
                    </div>
                    <span className='text-xs font-semibold text-gray-600 w-10 text-right'>{t.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='space-y-4'>
          <div className='bg-white rounded-xl p-6 shadow-sm'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-bold text-gray-700'>⏳ Menunggu Approval</h2>
              <Link href='/mss/learning/approval' className='text-xs text-red-600 font-semibold hover:underline'>Lihat Semua →</Link>
            </div>
            <div className='space-y-3'>
              {PENDING_APPROVAL.map(a=>(
                <div key={a.id} className='bg-yellow-50 rounded-xl p-3 border border-yellow-200'>
                  <div className='font-semibold text-gray-700 text-sm'>{a.employee}</div>
                  <div className='text-xs text-gray-500 mt-0.5'>{a.course}</div>
                  <div className='text-xs text-gray-400 mt-0.5'>Rp {a.cost.toLocaleString('id-ID')} • {a.submitted}</div>
                  <div className='flex gap-2 mt-2'>
                    <button className='flex-1 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700'>Approve</button>
                    <button className='flex-1 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='bg-white rounded-xl p-6 shadow-sm'>
            <h2 className='font-bold text-gray-700 mb-4'>⚡ Quick Actions</h2>
            <div className='space-y-2'>
              {[['👥 Assign Training ke Tim','/mss/learning/assignment'],['📊 Mandatory Training Status','/mss/learning/mandatory'],['📈 Team Competency','/mss/learning/competency'],['📋 Team Report','/mss/learning/report']].map(([l,h])=>(
                <Link key={h} href={h} className='flex items-center gap-2 p-2.5 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-600 transition'>
                  <span>{l}</span><span className='ml-auto text-gray-300'>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
