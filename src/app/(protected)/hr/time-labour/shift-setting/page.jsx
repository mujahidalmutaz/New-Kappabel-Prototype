'use client'
import { useState }      from 'react'
import { useShiftStore } from '@/store/shiftStore'
import { useT } from '@/store/languageStore'

export default function ShiftSettingPage() {
  const t = useT()
  const { shifts, addShift, updateShift, deleteShift } = useShiftStore()
  const [form,    setForm   ] = useState({ name:'', startTime:'', endTime:'', breakMinutes:60 })
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }

  const handleSave = () => {
    if (!form.name || !form.startTime || !form.endTime) return flash('Semua field wajib diisi.', 'error')
    if (editing) {
      updateShift(editing, form); setEditing(null); flash('Shift diperbarui.')
    } else {
      addShift(form); flash('Shift ditambahkan.')
    }
    setForm({ name:'', startTime:'', endTime:'', breakMinutes:60 })
  }

  const handleEdit = (s) => { setEditing(s.id); setForm({ name:s.name, startTime:s.startTime, endTime:s.endTime, breakMinutes:s.breakMinutes }) }

  const workHours = (s, e, brk) => {
    const [sh,sm] = s.split(':').map(Number)
    let   [eh,em] = e.split(':').map(Number)
    if (eh < sh) eh += 24
    const mins = (eh*60+em) - (sh*60+sm) - brk
    return `${Math.floor(mins/60)}j ${mins%60}m`
  }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Shift Setting</h1>
      <p className='text-gray-500 text-sm mb-6'>Kelola definisi shift kerja.</p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing ? '✏️ Edit Shift' : '➕ Tambah Shift'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Shift','text','name'],['Jam Masuk','time','startTime'],['Jam Keluar','time','endTime']].map(([lbl,type,key])=>(
              <div key={key}>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>{lbl}</label>
                <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
            ))}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Istirahat (menit)</label>
              <input type='number' value={form.breakMinutes} onChange={e=>setForm(f=>({...f,breakMinutes:+e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90'
                style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
                {editing ? t('Simpan','Save') : t('Tambah','Add')}
              </button>
              {editing && <button onClick={()=>{setEditing(null);setForm({name:'',startTime:'',endTime:'',breakMinutes:60})}}
                className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        {/* List */}
        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>📋 Daftar Shift</h2>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {['Nama','Jam Masuk','Jam Keluar','Istirahat','Jam Kerja','Aksi'].map(h=>(
                  <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map(s=>(
                <tr key={s.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-2.5 font-medium text-gray-700'>{s.name}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{s.startTime}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{s.endTime}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{s.breakMinutes} menit</td>
                  <td className='px-4 py-2.5 text-gray-600'>{workHours(s.startTime, s.endTime, s.breakMinutes)}</td>
                  <td className='px-4 py-2.5'>
                    <div className='flex gap-2'>
                      <button onClick={()=>handleEdit(s)} className='px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                      <button onClick={()=>deleteShift(s.id)} className='px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
