'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const CPD_CATEGORIES = ['Formal Training','Certification','Self-Directed Learning','Mentoring/Coaching','Conference/Seminar','OJT/Project','External Course','Webinar']
const UNIT_TYPES     = ['Per Hour','Per Session','Per Completion','Per Day','Per Credit']
const STATUS_OPTS    = ['Active','Inactive']

const INIT = [
  { id:1, activity:'Classroom Training Internal', category:'Formal Training', points:1, unit:'Per Hour', max_points:40, description:'Training tatap muka yang diselenggarakan oleh L&D internal', status:'Active' },
  { id:2, activity:'Sertifikasi Profesi (BNSP/Internasional)', category:'Certification', points:10, unit:'Per Completion', max_points:30, description:'Mendapatkan sertifikat profesi resmi', status:'Active' },
  { id:3, activity:'E-Learning Course Selesai', category:'Self-Directed Learning', points:2, unit:'Per Completion', max_points:20, description:'Menyelesaikan course online mandiri', status:'Active' },
  { id:4, activity:'Menjadi Mentor/Coach', category:'Mentoring/Coaching', points:3, unit:'Per Session', max_points:15, description:'Kegiatan membimbing rekan kerja', status:'Active' },
  { id:5, activity:'Menghadiri Konferensi/Seminar', category:'Conference/Seminar', points:4, unit:'Per Day', max_points:20, description:'Menghadiri event pembelajaran eksternal', status:'Active' },
  { id:6, activity:'Webinar & Virtual Learning', category:'Webinar', points:1, unit:'Per Session', max_points:10, description:'Mengikuti webinar online', status:'Active' },
]

const EMPTY = { activity:'', category:'Formal Training', points:'1', unit:'Per Hour', max_points:'40', description:'', status:'Active' }

export default function MasterCPDPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.activity.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.activity) return flash('Nama aktivitas wajib diisi.', 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,points:Number(form.points),max_points:Number(form.max_points)}:d))
      flash('CPD rule diperbarui.'); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,points:Number(form.points),max_points:Number(form.max_points)}])
      flash('CPD rule ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ activity:item.activity, category:item.category, points:String(item.points), unit:item.unit, max_points:String(item.max_points), description:item.description, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('CPD rule dihapus.') }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master CPD / Learning Credit Points</h1>
      <p className='text-gray-500 text-sm mb-6'>Aturan poin CPD (Continuing Professional Development) untuk setiap jenis aktivitas learning.</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Aktivitas', data.length, '⭐', '#8B1A1A'],['Total Max Poin/Thn', data.reduce((a,d)=>a+d.max_points,0), '🏆', '#059669'],['Avg Poin per Unit', (data.reduce((a,d)=>a+d.points,0)/data.length).toFixed(1), '📈', '#7c3aed'],['Kategori Aktif', data.filter(d=>d.status==='Active').length, '✅', '#d97706']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit CPD Rule':'➕ Tambah CPD Rule'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Aktivitas</label>
              <input value={form.activity} onChange={e=>setForm(f=>({...f,activity:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            {[['Kategori','category',CPD_CATEGORIES],['Satuan','unit',UNIT_TYPES],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {opts.map(o=><option key={o}>{o}</option>)}</select></div>
            ))}
            {[['Poin per Satuan','points'],['Max Poin per Tahun','max_points']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input type='number' min='0' value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Deskripsi</label>
              <textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' /></div>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{editing?t('Simpan','Save'):t('Tambah','Add')}</button>
              {editing && <button onClick={()=>{setEditing(null);setForm(EMPTY)}} className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari aktivitas CPD...'
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Aktivitas','Kategori','Poin','Satuan','Max/Tahun','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5'><div className='font-medium text-gray-700'>{d.activity}</div><div className='text-xs text-gray-400 mt-0.5 line-clamp-1'>{d.description}</div></td>
                  <td className='px-3 py-2.5'><span className='text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold whitespace-nowrap'>{d.category}</span></td>
                  <td className='px-3 py-2.5 font-bold text-gray-700'>{d.points} pts</td>
                  <td className='px-3 py-2.5 text-gray-500 text-xs'>{d.unit}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.max_points} pts</td>
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
