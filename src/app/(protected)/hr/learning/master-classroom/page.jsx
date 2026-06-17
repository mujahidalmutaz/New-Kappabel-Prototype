'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const ROOM_TYPES   = ['Physical','Virtual','Hybrid']
const STATUS_OPTS  = ['Available','In Use','Maintenance','Inactive']

const INIT = [
  { id:1, name:'Ruang Training A - Lantai 3', location:'Gedung Utama Lt.3', capacity:30, type:'Physical', facilities:'Projector, AC, Whiteboard, Sound System', status:'Available' },
  { id:2, name:'Ruang Training B - Lantai 3', location:'Gedung Utama Lt.3', capacity:20, type:'Physical', facilities:'TV LED, AC, Whiteboard', status:'Available' },
  { id:3, name:'Virtual Room - Zoom Enterprise', location:'Online', capacity:100, type:'Virtual', facilities:'Zoom Meeting, Recording, Breakout Room', status:'Available' },
  { id:4, name:'Hybrid Room - Auditorium', location:'Gedung Serbaguna', capacity:150, type:'Hybrid', facilities:'Stage, Projector, Livestream, Mic', status:'Available' },
  { id:5, name:'Lab Komputer IT', location:'Gedung IT Lt.2', capacity:25, type:'Physical', facilities:'Komputer, Projector, AC, Internet', status:'Maintenance' },
]

const EMPTY = { name:'', location:'', capacity:'', type:'Physical', facilities:'', status:'Available' }

export default function MasterClassroomPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name || !form.capacity) return flash('Nama dan kapasitas wajib diisi.', 'error')
    if (editing) {
      setData(prev => prev.map(d => d.id===editing ? {...d,...form} : d))
      flash('Classroom diperbarui.'); setEditing(null)
    } else {
      setData(prev => [...prev, { id:Date.now(), ...form }])
      flash('Classroom ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, location:item.location, capacity:item.capacity, type:item.type, facilities:item.facilities, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('Classroom dihapus.') }

  const statusColor = (s) => ({ Available:'bg-green-50 text-green-700', 'In Use':'bg-blue-50 text-blue-700', Maintenance:'bg-yellow-50 text-yellow-700', Inactive:'bg-gray-100 text-gray-500' }[s] || 'bg-gray-100 text-gray-500')

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Classroom</h1>
      <p className='text-gray-500 text-sm mb-6'>Data ruangan training fisik, virtual, maupun hybrid.</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Ruangan', data.length, '🏛️', '#8B1A1A'],['Physical', data.filter(d=>d.type==='Physical').length, '🏢', '#059669'],['Virtual', data.filter(d=>d.type==='Virtual').length, '💻', '#7c3aed'],['Available', data.filter(d=>d.status==='Available').length, '✅', '#d97706']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit Classroom':'➕ Tambah Classroom'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Ruangan','name'],['Lokasi','location'],['Fasilitas','facilities']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Kapasitas (orang)</label>
              <input type='number' min='1' value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            {[['Tipe','type',ROOM_TYPES],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari ruangan...'
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Nama Ruangan','Lokasi','Kapasitas','Tipe','Fasilitas','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5 font-medium text-gray-700'>{d.name}</td>
                  <td className='px-3 py-2.5 text-gray-500 text-xs'>{d.location}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.capacity} org</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.type==='Physical'?'bg-orange-50 text-orange-700':d.type==='Virtual'?'bg-blue-50 text-blue-700':'bg-red-50 text-red-700'}`}>{d.type}</span></td>
                  <td className='px-3 py-2.5 text-gray-500 text-xs max-w-32 truncate'>{d.facilities}</td>
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
