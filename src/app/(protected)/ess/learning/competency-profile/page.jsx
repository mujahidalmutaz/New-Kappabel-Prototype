'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const COMPETENCIES = [
  { category:'Core Competencies', items:[
    { name:'Integritas', current:4, target:4, level:'Proficient', desc:'Menjalankan tugas dengan jujur dan bertanggung jawab.' },
    { name:'Teamwork & Collaboration', current:3, target:4, level:'Developing', desc:'Bekerja sama untuk mencapai tujuan bersama.' },
    { name:'Customer Focus', current:4, target:5, level:'Proficient', desc:'Orientasi pada kepuasan pelanggan internal & eksternal.' },
    { name:'Continuous Learning', current:3, target:4, level:'Developing', desc:'Aktif mengembangkan diri dan pengetahuan.' },
  ]},
  { category:'Leadership Competencies', items:[
    { name:'Leading Others', current:2, target:4, level:'Basic', desc:'Membimbing dan menginspirasi anggota tim.' },
    { name:'Strategic Thinking', current:3, target:4, level:'Developing', desc:'Memahami konteks bisnis dan merencanakan ke depan.' },
    { name:'Change Management', current:2, target:3, level:'Basic', desc:'Mengelola dan mengadaptasi perubahan organisasi.' },
  ]},
  { category:'Technical Competencies', items:[
    { name:'Financial Analysis', current:5, target:5, level:'Expert', desc:'Menganalisis data keuangan dan menyusun laporan.' },
    { name:'Data Visualization', current:4, target:5, level:'Proficient', desc:'Menyajikan data secara visual dan mudah dipahami.' },
    { name:'ERP System (SAP)', current:3, target:4, level:'Developing', desc:'Menggunakan SAP untuk kebutuhan operasional keuangan.' },
  ]},
]

const LEVEL_COLORS = { Expert:'text-green-700 bg-green-50', Proficient:'text-blue-700 bg-blue-50', Developing:'text-yellow-700 bg-yellow-50', Basic:'text-red-700 bg-red-50' }

export default function CompetencyProfilePage() {
  const t = useT()
  const [expanded, setExpanded] = useState('Core Competencies')

  const avgScore = (items) => (items.reduce((a,i)=>a+i.current,0)/items.length).toFixed(1)
  const gapCount = (items) => items.filter(i=>i.current<i.target).length

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>My Competency Profile</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Profil kompetensi Anda berdasarkan penilaian terakhir dan gap terhadap target jabatan.','Your competency profile based on the latest assessment and gap against your target role.')}</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[
          [t('Total Kompetensi','Total Competencies'), COMPETENCIES.reduce((a,c)=>a+c.items.length,0), '📊', '#8B1A1A'],
          [t('Expert / Proficient','Expert / Proficient'), COMPETENCIES.flatMap(c=>c.items).filter(i=>i.level==='Expert'||i.level==='Proficient').length, '⭐', '#059669'],
          [t('Perlu Dikembangkan','Needs Development'), COMPETENCIES.flatMap(c=>c.items).filter(i=>i.current<i.target).length, '📈', '#d97706'],
          ['Avg Score', (COMPETENCIES.flatMap(c=>c.items).reduce((a,i)=>a+i.current,0)/COMPETENCIES.flatMap(c=>c.items).length).toFixed(1)+'/5', '🎯', '#7c3aed'],
        ].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{background:c+'22'}}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='space-y-4'>
        {COMPETENCIES.map(c=>(
          <div key={c.category} className='bg-white rounded-xl shadow-sm overflow-hidden'>
            <button className='w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition'
              onClick={()=>setExpanded(expanded===c.category?null:c.category)}>
              <div className='flex items-center gap-3'>
                <span className='font-bold text-gray-800'>{c.category}</span>
                <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>{c.items.length} {t('kompetensi','competencies')}</span>
                {gapCount(c.items) > 0 && (
                  <span className='text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full'>{gapCount(c.items)} gap</span>
                )}
              </div>
              <div className='flex items-center gap-4'>
                <span className='text-sm font-bold text-gray-600'>Avg: {avgScore(c.items)}/5</span>
                <span className='text-gray-400'>{expanded===c.category?'▲':'▼'}</span>
              </div>
            </button>

            {expanded === c.category && (
              <div className='border-t border-gray-100 divide-y divide-gray-50'>
                {c.items.map(item=>(
                  <div key={item.name} className='px-6 py-4'>
                    <div className='flex items-start justify-between mb-2'>
                      <div>
                        <div className='font-semibold text-gray-800'>{item.name}</div>
                        <div className='text-xs text-gray-400 mt-0.5'>{item.desc}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLORS[item.level]}`}>{item.level}</span>
                    </div>
                    <div className='flex items-center gap-4 mt-3'>
                      <div className='flex-1'>
                        <div className='flex justify-between text-xs mb-1'>
                          <span className='text-gray-500'>Current: <b className='text-gray-800'>{item.current}/5</b></span>
                          <span className='text-gray-500'>Target: <b className={item.current>=item.target?'text-green-600':'text-yellow-600'}>{item.target}/5</b></span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-3 relative'>
                          <div className='h-3 rounded-full bg-red-500' style={{width:`${item.current/5*100}%`}}></div>
                          <div className='absolute top-0 h-3 w-0.5 bg-yellow-400' style={{left:`${item.target/5*100}%`}}></div>
                        </div>
                      </div>
                      {item.current < item.target && (
                        <div className='flex items-center gap-1 text-xs text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg whitespace-nowrap'>
                          <span>⚠️</span><span>Gap {item.target-item.current} level</span>
                        </div>
                      )}
                      {item.current >= item.target && (
                        <div className='flex items-center gap-1 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg'>
                          <span>✅</span><span>{t('Tercapai','Achieved')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className='mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3'>
        <span className='text-2xl'>💡</span>
        <div>
          <p className='font-semibold text-blue-700'>{t('Rekomendasi Pengembangan','Development Recommendation')}</p>
          <p className='text-xs text-blue-600 mt-0.5'>{t('Berdasarkan gap kompetensi Anda, 3 course disarankan untuk menutup gap:','Based on your competency gaps, 3 courses are recommended to close them:')} <span className='font-semibold'>Leadership Fundamentals L1</span>, <span className='font-semibold'>Team Building Workshop</span>, {t('dan','and')} <span className='font-semibold'>SAP Financial Module</span>.</p>
        </div>
        <button className='ml-auto px-4 py-2 text-xs font-semibold text-white rounded-lg whitespace-nowrap hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>{t('Lihat Rekomendasi →','View Recommendations →')}</button>
      </div>
    </div>
  )
}
