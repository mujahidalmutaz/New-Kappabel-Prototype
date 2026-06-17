'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const TEAM_DATA = [
  { name:'Ahmad Fauzi', dept:'Finance', mandatory_done:2, mandatory_total:3, voluntary_done:1, cpd_points:24, avg_score:87, last_activity:'2025-07-28' },
  { name:'Dewi Sari', dept:'HR', mandatory_done:4, mandatory_total:4, voluntary_done:3, cpd_points:48, avg_score:91, last_activity:'2025-07-30' },
  { name:'Budi Rahayu', dept:'Operations', mandatory_done:1, mandatory_total:3, voluntary_done:0, cpd_points:8, avg_score:75, last_activity:'2025-06-15' },
  { name:'Siti Nurhaliza', dept:'Marketing', mandatory_done:2, mandatory_total:3, voluntary_done:2, cpd_points:28, avg_score:82, last_activity:'2025-07-25' },
  { name:'Rizky Pratama', dept:'IT', mandatory_done:0, mandatory_total:2, voluntary_done:0, cpd_points:0, avg_score:0, last_activity:'-' },
]

const COURSE_SUMMARY = [
  { course:'K3 & Keselamatan Kerja Dasar', completion:60, avg_score:87, enrolled:5 },
  { course:'GCG & Compliance Certification', completion:20, avg_score:72, enrolled:5 },
  { course:'Leadership Fundamentals L1', completion:50, avg_score:85, enrolled:4 },
]

export default function TeamLearningReportPage() {
  const t = useT()
  const [period, setPeriod] = useState('2025')

  const totalCPD = TEAM_DATA.reduce((a,t)=>a+t.cpd_points,0)
  const avgScore = Math.round(TEAM_DATA.filter(t=>t.avg_score>0).reduce((a,t)=>a+t.avg_score,0)/TEAM_DATA.filter(t=>t.avg_score>0).length)
  const complianceRate = Math.round(TEAM_DATA.filter(t=>t.mandatory_done===t.mandatory_total&&t.mandatory_total>0).length/TEAM_DATA.length*100)

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Team Learning Report</h1>
      <p className='text-gray-500 text-sm mb-6'>Laporan komprehensif learning & development anggota tim Anda.</p>

      <div className='flex gap-3 mb-6'>
        {['2024','2025'].map(y=>(
          <button key={y} onClick={()=>setPeriod(y)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${period===y?'bg-red-600 text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{y}</button>
        ))}
        <button className='ml-auto px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90'
          style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>⬇️ Export Excel</button>
      </div>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Compliance Rate', complianceRate+'%', '📋', '#059669'],['Avg Score Tim', avgScore, '🎯', '#7c3aed'],['Total CPD Points', totalCPD+' pts', '⭐', '#d97706'],['Anggota Aktif', TEAM_DATA.filter(t=>t.last_activity>='2025-07-01').length, '✅', '#8B1A1A']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='font-bold text-gray-700 mb-4'>👥 Ringkasan per Anggota Tim</h2>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Nama','Mandatory','Voluntary','CPD Pts','Avg Score','Aktif Terakhir'].map(h=>(
                <th key={h} className='text-left px-3 py-2 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{TEAM_DATA.map(t=>(
                <tr key={t.name} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5 font-medium text-gray-700'>{t.name}</td>
                  <td className='px-3 py-2.5'>
                    <span className={`text-xs font-semibold ${t.mandatory_done===t.mandatory_total?'text-green-600':t.mandatory_done>0?'text-yellow-600':'text-red-600'}`}>
                      {t.mandatory_done}/{t.mandatory_total}
                    </span>
                  </td>
                  <td className='px-3 py-2.5 text-gray-500'>{t.voluntary_done}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{t.cpd_points} pts</td>
                  <td className='px-3 py-2.5'><span className={`font-semibold ${t.avg_score>=80?'text-green-600':t.avg_score>=70?'text-yellow-600':'text-red-600'}`}>{t.avg_score||'—'}</span></td>
                  <td className='px-3 py-2.5 text-xs text-gray-500'>{t.last_activity}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='font-bold text-gray-700 mb-4'>📚 Completion Rate per Course</h2>
          <div className='space-y-5'>
            {COURSE_SUMMARY.map(c=>(
              <div key={c.course}>
                <div className='flex items-center justify-between mb-1'>
                  <div className='text-sm font-medium text-gray-700 flex-1 mr-2 line-clamp-1'>{c.course}</div>
                  <div className='flex gap-3 text-xs text-gray-500'>
                    <span>👥 {c.enrolled}</span>
                    <span>⭐ {c.avg_score}</span>
                    <span className='font-bold text-gray-700'>{c.completion}%</span>
                  </div>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2.5'>
                  <div className={`h-2.5 rounded-full ${c.completion>=80?'bg-green-500':c.completion>=50?'bg-yellow-500':'bg-red-400'}`} style={{ width:`${c.completion}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-6 pt-4 border-t border-gray-100'>
            <h3 className='font-semibold text-gray-600 mb-3 text-sm'>📊 Distribusi CPD Points</h3>
            <div className='flex gap-3'>
              {[['0-10 pts', TEAM_DATA.filter(t=>t.cpd_points<=10).length],['11-30 pts', TEAM_DATA.filter(t=>t.cpd_points>10&&t.cpd_points<=30).length],['>30 pts', TEAM_DATA.filter(t=>t.cpd_points>30).length]].map(([l,v])=>(
                <div key={l} className='flex-1 text-center bg-gray-50 rounded-lg p-3'>
                  <div className='text-lg font-bold text-gray-700'>{v}</div>
                  <div className='text-xs text-gray-500'>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
