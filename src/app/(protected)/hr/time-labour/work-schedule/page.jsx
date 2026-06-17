'use client'
import { useState }      from 'react'
import { useShiftStore } from '@/store/shiftStore'
import { useT } from '@/store/languageStore'

export default function WorkSchedulePage() {
  const t = useT()
  const { schedules, patterns, addSchedule, deleteSchedule } = useShiftStore()
  const [form, setForm] = useState({ name:'', patternId:'', effectiveDate:'' })
  const [msg,  setMsg ] = useState(null)

  const flash = (text,type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleSave = () => {
    if (!form.name || !form.patternId || !form.effectiveDate) return flash('Semua field wajib diisi.','error')
    addSchedule({ ...form, patternId: +form.patternId })
    setForm({ name:'', patternId:'', effectiveDate:'' })
    flash('Work schedule ditambahkan.')
  }

  const patternName = (id) => patterns.find(p=>p.id===id)?.name || '-'

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Work Schedule</h1>
      <p className='text-gray-500 text-sm mb-6'>Buat jadwal kerja berdasarkan shift pattern.</p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>➕ Buat Schedule</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Schedule</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Shift Pattern</label>
              <select value={form.patternId} onChange={e=>setForm(f=>({...f,patternId:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>-- Pilih Pattern --</option>
                {patterns.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Tanggal Efektif</label>
              <input type='date' value={form.effectiveDate} onChange={e=>setForm(f=>({...f,effectiveDate:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <button onClick={handleSave} className='py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90'
              style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
              Tambah
            </button>
          </div>
        </div>

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>📋 Daftar Work Schedule</h2>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {['Nama','Pattern','Efektif Mulai','Aksi'].map(h=>(
                  <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {schedules.length ? schedules.map(s=>(
                <tr key={s.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-2.5 font-medium text-gray-700'>{s.name}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{patternName(s.patternId)}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{s.effectiveDate}</td>
                  <td className='px-4 py-2.5'>
                    <button onClick={()=>deleteSchedule(s.id)} className='px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className='px-4 py-8 text-center text-gray-400 text-sm'>Belum ada schedule.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
