'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'
import { useCourseBatchStore } from '@/store/courseBatchStore'

const METHODS      = ['Instructor Led Training (ILT)','Self-Paced','Blended Learning','Virtual ILT (Webinar)']
const STATUS_OPTS  = ['Open','In Progress','Completed','Cancelled','Full']

const EMPTY = { batch_name:'', course:'', method:'Instructor Led Training (ILT)', start_date:'', end_date:'', instructor:'', location:'', capacity:'30', status:'Open' }

export default function CourseBatchPage() {
  const t = useT()
  const { batches, addBatch, updateBatch, deleteBatch } = useCourseBatchStore()
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = batches.filter(d => d.batch_name.toLowerCase().includes(search.toLowerCase()) || d.course.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.batch_name || !form.course) return flash('Nama batch dan course wajib diisi.', 'error')
    if (editing) {
      updateBatch(editing, { ...form, capacity: Number(form.capacity) })
      flash('Batch diperbarui.'); setEditing(null)
    } else {
      addBatch({ ...form, capacity: Number(form.capacity) })
      flash('Batch ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ batch_name:item.batch_name, course:item.course, method:item.method, start_date:item.start_date, end_date:item.end_date, instructor:item.instructor, location:item.location, capacity:String(item.capacity), status:item.status }) }
  const handleDelete = (id) => { deleteBatch(id); flash('Batch dihapus.') }

  const statusColor = (s) => ({ Open:'bg-green-50 text-green-700', 'In Progress':'bg-blue-50 text-blue-700', Completed:'bg-gray-100 text-gray-600', Cancelled:'bg-red-50 text-red-700', Full:'bg-yellow-50 text-yellow-700' }[s])

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Course — Batch & Activities</h1>
      <p className='text-gray-500 text-sm mb-6'>Pengelolaan batch/sesi pelaksanaan course — jadwal, instruktur, lokasi, metode, dan peserta.</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Batch', batches.length, '📦', '#8B1A1A'],['Open', batches.filter(d=>d.status==='Open').length, '🟢', '#059669'],['In Progress', batches.filter(d=>d.status==='In Progress').length, '🔵', '#2563eb'],['Completed', batches.filter(d=>d.status==='Completed').length, '✅', '#6b7280']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit Batch':'➕ Tambah Batch'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Batch','batch_name'],['Nama Course','course'],['Instructor','instructor'],['Lokasi/Platform','location']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div className='grid grid-cols-2 gap-2'>
              {[['Tanggal Mulai','start_date'],['Tanggal Selesai','end_date']].map(([l,k])=>(
                <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                  <input type='date' value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
              ))}
            </div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Kapasitas Peserta</label>
              <input type='number' min='1' value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            {[['Metode','method',METHODS],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {opts.map(o=><option key={o}>{o}</option>)}</select></div>
            ))}
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{editing?t('Simpan','Save'):t('Tambah','Add')}</button>
              {editing && <button onClick={()=>{setEditing(null);setForm(EMPTY)}} className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari batch...'
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Batch','Course','Metode','Tanggal','Instructor','Peserta','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5'><div className='font-medium text-gray-700 text-xs'>{d.batch_name}</div></td>
                  <td className='px-3 py-2.5 text-xs text-gray-500 max-w-28'><div className='line-clamp-2'>{d.course}</div></td>
                  <td className='px-3 py-2.5'><span className='text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold whitespace-nowrap'>{d.method.includes('ILT')?'ILT':d.method.includes('Self')?'Self-Paced':d.method.includes('Virtual')?'VILT':'Blended'}</span></td>
                  <td className='px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap'>{d.start_date}</td>
                  <td className='px-3 py-2.5 text-xs text-gray-500'>{d.instructor}</td>
                  <td className='px-3 py-2.5 text-xs text-gray-500'>{d.enrolled}/{d.capacity}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(d.status)}`}>{d.status}</span></td>
                  <td className='px-3 py-2.5'><div className='flex gap-1'>
                    <button onClick={()=>handleEdit(d)} className='px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                    <button onClick={()=>handleDelete(d.id)} className='px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
