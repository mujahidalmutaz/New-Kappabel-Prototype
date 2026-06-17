'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const COMM_TYPES  = ['Open','Closed','Invitation Only']
const STATUS_OPTS = ['Active','Inactive','Archived']

const INIT = [
  { id:1, name:'Data & Analytics Community', category:'Digital Literacy', type:'Open', facilitator:'Budi Santoso', member_count:87, post_count:234, status:'Active', created:'2024-01-15' },
  { id:2, name:'Leadership Development Group', category:'Leadership & Management', type:'Closed', facilitator:'Sari Dewi', member_count:45, post_count:156, status:'Active', created:'2024-02-01' },
  { id:3, name:'HR Innovation Network', category:'HR & People Management', type:'Open', facilitator:'Ahmad Fauzi', member_count:62, post_count:189, status:'Active', created:'2024-03-10' },
  { id:4, name:'K3 Safety Champions', category:'K3 & Safety', type:'Open', facilitator:'Tim K3', member_count:120, post_count:312, status:'Active', created:'2024-01-20' },
  { id:5, name:'Finance Discussion Forum', category:'Finance & Accounting', type:'Closed', facilitator:'Dewi Sari', member_count:38, post_count:95, status:'Active', created:'2024-04-05' },
]

const EMPTY = { name:'', category:'Leadership & Management', type:'Open', facilitator:'', description:'', status:'Active' }

export default function LearningCommunitiesPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name) return flash('Nama komunitas wajib diisi.', 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form}:d))
      flash('Komunitas diperbarui.'); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,member_count:0,post_count:0,created:new Date().toISOString().slice(0,10)}])
      flash('Komunitas ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, category:item.category, type:item.type, facilitator:item.facilitator, description:item.description||'', status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('Komunitas dihapus.') }

  const CATEGORIES = ['Leadership & Management','Technical Skills','Compliance & Regulasi','Soft Skills','K3 & Safety','Digital Literacy','HR & People Management','Finance & Accounting']

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Learning Communities</h1>
      <p className='text-gray-500 text-sm mb-6'>Kelola komunitas pembelajaran — forum diskusi, knowledge sharing, dan kolaborasi antar karyawan.</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Komunitas', data.length, '🌐', '#8B1A1A'],['Total Member', data.reduce((a,d)=>a+d.member_count,0), '👥', '#059669'],['Total Post', data.reduce((a,d)=>a+d.post_count,0), '💬', '#7c3aed'],['Active', data.filter(d=>d.status==='Active').length, '✅', '#d97706']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit Komunitas':'➕ Tambah Komunitas'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Komunitas','name'],['Facilitator/Moderator','facilitator']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            {[['Kategori Topik','category',CATEGORIES],['Tipe Komunitas','type',COMM_TYPES],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {opts.map(o=><option key={o}>{o}</option>)}</select></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Deskripsi</label>
              <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' /></div>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{editing?t('Simpan','Save'):t('Tambah','Add')}</button>
              {editing && <button onClick={()=>{setEditing(null);setForm(EMPTY)}} className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari komunitas...'
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Nama','Kategori','Tipe','Fasilitator','Member','Post','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5 font-medium text-gray-700'>{d.name}</td>
                  <td className='px-3 py-2.5 text-xs text-gray-500'>{d.category}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.type==='Open'?'bg-green-50 text-green-700':d.type==='Closed'?'bg-yellow-50 text-yellow-700':'bg-red-50 text-red-700'}`}>{d.type}</span></td>
                  <td className='px-3 py-2.5 text-xs text-gray-500'>{d.facilitator}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.member_count}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.post_count}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status==='Active'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{d.status}</span></td>
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
