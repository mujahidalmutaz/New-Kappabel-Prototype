'use client'
import { useState }      from 'react'
import { useLeaveStore } from '@/store/leaveStore'
import { useT } from '@/store/languageStore'

export default function LeaveWorkflowPage() {
  const t = useT()
  const { leaveTypes } = useLeaveStore()
  const [types, setTypes] = useState(leaveTypes.map(t=>({...t})))
  const [msg,   setMsg  ] = useState(null)

  const flash = (text,type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const update = (id, key, val) =>
    setTypes(ts => ts.map(t => t.id===id ? {...t, [key]: val} : t))

  const handleSave = () => {
    flash('Pengaturan workflow disimpan.')
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Leave Workflow</h1>
      <p className='text-gray-500 text-sm mb-6'>Konfigurasi jenis cuti, kuota, dan alur persetujuan.</p>

      {msg && (
        <div className={`text-sm px-4 py-2.5 rounded-lg mb-4 inline-block ${msg.type==='error'?'bg-red-50 text-red-600 border border-red-200':'bg-green-50 text-green-600 border border-green-200'}`}>
          {msg.text}
        </div>
      )}

      <div className='bg-white rounded-xl p-6 shadow-sm mb-6'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>📅 Jenis Cuti & Kuota</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {['Nama Cuti','Maks. Hari','Aktif'].map(h=>(
                  <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {types.map(t=>(
                <tr key={t.id} className='border-t border-gray-100'>
                  <td className='px-4 py-3 font-medium text-gray-700'>{t.name}</td>
                  <td className='px-4 py-3'>
                    <input type='number' value={t.maxDays} min={1} max={365}
                      onChange={e=>update(t.id,'maxDays',+e.target.value)}
                      className='w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                  </td>
                  <td className='px-4 py-3'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input type='checkbox' checked={t.active} onChange={e=>update(t.id,'active',e.target.checked)}
                        className='w-4 h-4 accent-red-600' />
                      <span className={`text-xs font-semibold ${t.active?'text-green-600':'text-gray-400'}`}>
                        {t.active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={handleSave}
          className='mt-4 px-6 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          💾 Simpan Perubahan
        </button>
      </div>

      {/* Approval flow info */}
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>🔀 Alur Persetujuan</h2>
        <div className='flex flex-wrap items-center gap-3 text-sm'>
          {[
            { step:'1', label:'Karyawan mengajukan', icon:'👤' },
            { step:'→', label:null },
            { step:'2', label:'Manager mereview', icon:'👥' },
            { step:'→', label:null },
            { step:'3', label:'HR memvalidasi', icon:'🗂️' },
            { step:'→', label:null },
            { step:'✓', label:'Selesai', icon:'✅' },
          ].map((s,i)=>(
            s.label === null
              ? <span key={i} className='text-gray-300 text-lg'>→</span>
              : (
                <div key={i} className='flex flex-col items-center bg-red-50 border border-red-100 rounded-xl px-5 py-4 min-w-[110px]'>
                  <span className='text-2xl mb-1'>{s.icon}</span>
                  <span className='text-xs font-bold text-red-700 mb-0.5'>Step {s.step}</span>
                  <span className='text-xs text-gray-500 text-center'>{s.label}</span>
                </div>
              )
          ))}
        </div>
      </div>
    </div>
  )
}
