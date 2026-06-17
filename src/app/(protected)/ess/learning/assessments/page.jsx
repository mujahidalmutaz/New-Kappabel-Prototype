'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const PENDING = [
  { id:1, title:'Post-Test Leadership Fundamentals L1', course:'Leadership Fundamentals Level 1', type:'Post-Test', duration:45, questions:30, passing:75, due:'2025-05-31', status:'Available' },
  { id:2, title:'Quiz GCG Compliance - Module 1', course:'GCG & Compliance Certification', type:'Quiz', duration:20, questions:15, passing:70, due:'2025-08-31', status:'Available' },
]

const COMPLETED = [
  { id:3, title:'Pre-Test K3 Dasar', course:'K3 & Keselamatan Kerja Dasar', type:'Pre-Test', completed:'2025-01-10', score:85, passed:true },
  { id:4, title:'Post-Test K3 Dasar', course:'K3 & Keselamatan Kerja Dasar', type:'Post-Test', completed:'2025-01-15', score:90, passed:true },
]

const EVAL = [
  { id:5, title:'Feedback Training K3', course:'K3 & Keselamatan Kerja Dasar', type:'Training Feedback', completed:'2025-01-15', filled:true },
]

export default function AssessmentsPage() {
  const t = useT()
  const [tab, setTab] = useState('pending')

  const typeColor = (t) => ({ 'Pre-Test':'bg-blue-50 text-blue-700', 'Post-Test':'bg-green-50 text-green-700', Quiz:'bg-red-50 text-red-700', 'Training Feedback':'bg-yellow-50 text-yellow-700', Assignment:'bg-orange-50 text-orange-700' }[t]||'bg-gray-100 text-gray-500')

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Assessments & Evaluation</h1>
      <p className='text-gray-500 text-sm mb-6'>Quiz, pre-test, post-test, dan evaluasi training Anda.</p>

      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[['Harus Dikerjakan', PENDING.length, '📝', '#dc2626'],['Selesai', COMPLETED.length, '✅', '#059669'],['Avg Score', Math.round(COMPLETED.reduce((a,c)=>a+c.score,0)/COMPLETED.length), '🎯', '#7c3aed']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='flex gap-2 mb-4'>
        {[['pending','📝 Belum Dikerjakan'],['completed','✅ Riwayat Assessment'],['evaluation','📊 Evaluasi Training']].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${tab===k?'bg-red-600 text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>{l}</button>
        ))}
      </div>

      {tab==='pending' && (
        <div className='space-y-4'>
          {PENDING.map(a=>(
            <div key={a.id} className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-red-200 transition'>
              <div className='flex items-start justify-between mb-3'>
                <div>
                  <div className='font-semibold text-gray-800'>{a.title}</div>
                  <div className='text-sm text-gray-500 mt-0.5'>{a.course}</div>
                  <div className='flex items-center gap-2 mt-2'>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColor(a.type)}`}>{a.type}</span>
                    <span className='text-xs text-gray-400'>⏱️ {a.duration} menit</span>
                    <span className='text-xs text-gray-400'>📋 {a.questions} soal</span>
                    <span className='text-xs text-gray-400'>🎯 Pass: {a.passing}%</span>
                  </div>
                </div>
                <div className='text-right'>
                  <span className='text-xs text-red-500 font-semibold'>Due: {a.due}</span>
                </div>
              </div>
              <button className='px-5 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>🚀 Mulai Assessment</button>
            </div>
          ))}
          {PENDING.length===0 && <div className='bg-white rounded-xl p-12 text-center text-gray-400 shadow-sm'>Tidak ada assessment yang perlu dikerjakan. ✅</div>}
        </div>
      )}

      {tab==='completed' && (
        <div className='space-y-4'>
          {COMPLETED.map(a=>(
            <div key={a.id} className='bg-white rounded-xl p-5 shadow-sm flex items-center justify-between'>
              <div>
                <div className='font-semibold text-gray-700'>{a.title}</div>
                <div className='flex items-center gap-2 mt-1'>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColor(a.type)}`}>{a.type}</span>
                  <span className='text-xs text-gray-400'>{a.completed}</span>
                </div>
              </div>
              <div className='text-right'>
                <div className={`text-xl font-bold ${a.score>=75?'text-green-600':'text-red-600'}`}>{a.score}</div>
                <div className={`text-xs font-semibold ${a.passed?'text-green-600':'text-red-600'}`}>{a.passed?'✅ LULUS':'❌ TIDAK LULUS'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='evaluation' && (
        <div className='space-y-4'>
          {EVAL.map(e=>(
            <div key={e.id} className='bg-white rounded-xl p-5 shadow-sm flex items-center justify-between'>
              <div>
                <div className='font-semibold text-gray-700'>{e.title}</div>
                <div className='text-sm text-gray-500 mt-0.5'>{e.course}</div>
              </div>
              {e.filled
                ? <span className='text-xs px-3 py-1 bg-green-50 text-green-700 rounded-full font-semibold'>✅ Sudah Diisi</span>
                : <button className='px-4 py-2 text-white text-xs font-semibold rounded-lg' style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>Isi Evaluasi</button>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
