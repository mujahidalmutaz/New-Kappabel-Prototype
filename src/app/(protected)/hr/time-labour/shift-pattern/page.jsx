'use client'
import { useState }      from 'react'
import { useShiftStore } from '@/store/shiftStore'
import { useT } from '@/store/languageStore'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

export default function ShiftPatternPage() {
  const t = useT()
  const { shifts, patterns, addPattern, deletePattern } = useShiftStore()
  const [name,    setName   ] = useState('')
  const [entries, setEntries] = useState({})
  const [msg,     setMsg    ] = useState(null)

  const flash = (text,type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleSave = () => {
    if (!name.trim()) return flash('Nama pattern wajib diisi.', 'error')
    const entryArr = DAYS.filter(d=>entries[d]).map(d=>({ day:d, shiftId:+entries[d] }))
    if (!entryArr.length) return flash('Pilih minimal 1 shift.', 'error')
    addPattern({ name, entries: entryArr })
    setName(''); setEntries({})
    flash('Pattern ditambahkan.')
  }

  const shiftName = (id) => shifts.find(s=>s.id===id)?.name || '-'

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Shift Pattern</h1>
      <p className='text-gray-500 text-sm mb-6'>Buat pola shift mingguan untuk karyawan.</p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>➕ Buat Pattern</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Pattern</label>
              <input value={name} onChange={e=>setName(e.target.value)}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            {DAYS.map(d=>(
              <div key={d} className='flex items-center gap-3'>
                <span className='text-xs font-semibold text-gray-600 w-24'>{d}</span>
                <select value={entries[d]||''} onChange={e=>setEntries(en=>({...en,[d]:e.target.value}))}
                  className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-400'>
                  <option value=''>— Off —</option>
                  {shifts.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            ))}
            <button onClick={handleSave} className='mt-2 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90'
              style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
              Simpan Pattern
            </button>
          </div>
        </div>

        {/* List */}
        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>📋 Daftar Pattern</h2>
          {patterns.length ? patterns.map(p=>(
            <div key={p.id} className='border border-gray-100 rounded-xl p-4 mb-4 last:mb-0'>
              <div className='flex justify-between items-center mb-3'>
                <span className='font-semibold text-gray-800'>{p.name}</span>
                <button onClick={()=>deletePattern(p.id)} className='px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
              </div>
              <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
                {p.entries.map((e,i)=>(
                  <div key={i} className='bg-red-50 rounded-lg px-3 py-2 text-center'>
                    <div className='text-xs text-gray-500'>{e.day.slice(0,3)}</div>
                    <div className='text-xs font-semibold text-red-700'>{shiftName(e.shiftId)}</div>
                  </div>
                ))}
              </div>
            </div>
          )) : <p className='text-sm text-gray-400'>Belum ada pattern.</p>}
        </div>
      </div>
    </div>
  )
}
