'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const STATUS_OPTS = ['Active','Inactive','Draft']

const INIT = [
  { id:1, name:'Leadership Mastery Track', category:'Leadership & Management', course_count:5, duration_weeks:12, target_role:'Manager & Above', enrolled:85, completion_rate:72, status:'Active' },
  { id:2, name:'HR Professional Development', category:'HR & People Management', course_count:7, duration_weeks:16, target_role:'HR Team', enrolled:35, completion_rate:60, status:'Active' },
  { id:3, name:'Finance & Accounting Excellence', category:'Finance & Accounting', course_count:6, duration_weeks:14, target_role:'Finance Team', enrolled:28, completion_rate:55, status:'Active' },
  { id:4, name:'Digital Transformation Journey', category:'Digital Literacy', course_count:8, duration_weeks:20, target_role:'All Employee', enrolled:120, completion_rate:40, status:'Active' },
  { id:5, name:'K3 & Safety Professional', category:'K3 & Safety', course_count:4, duration_weeks:8, target_role:'Operational Staff', enrolled:200, completion_rate:88, status:'Active' },
]

const EMPTY = { name:'', category:'Leadership & Management', course_count:'4', duration_weeks:'8', target_role:'', description:'', status:'Active' }

export default function SpecializationsPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name) return flash('Nama specialization wajib diisi.', 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,course_count:Number(form.course_count),duration_weeks:Number(form.duration_weeks)}:d))
      flash('Specialization diperbarui.'); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,course_count:Number(form.course_count),duration_weeks:Number(form.duration_weeks),enrolled:0,completion_rate:0}])
      flash('Specialization ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, category:item.category, course_count:String(item.course_count), duration_weeks:String(item.duration_weeks), target_role:item.target_role, description:item.description||'', status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('Specialization dihapus.') }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Specializations</h1>
      <p className='text-gray-500 text-sm mb-6'>Jalur spesialisasi pembelajaran — kumpulan course yang disusun menjadi satu jalur keahlian terstruktur.</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Specialization', data.length, '🛤️', '#8B1A1A'],['Total Enrolled', data.reduce((a,d)=>a+d.enrolled,0), '👥', '#059669'],['Avg Completion', Math.round(data.reduce((a,d)=>a+d.completion_rate,0)/data.length)+'%', '📈', '#7c3aed'],['Active', data.filter(d=>d.status==='Active').length, '✅', '#d97706']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit Specialization':'➕ Tambah Specialization'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Specialization','name'],['Target Role/Audience','target_role']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div className='grid grid-cols-2 gap-2'>
              {[['Jumlah Course','course_count'],['Durasi (minggu)','duration_weeks']].map(([l,k])=>(
                <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                  <input type='number' min='1' value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
              ))}
            </div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Deskripsi</label>
              <textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' /></div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}</select></div>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{editing?t('Simpan','Save'):t('Tambah','Add')}</button>
              {editing && <button onClick={()=>{setEditing(null);setForm(EMPTY)}} className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 content-start'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari specialization...'
            className='md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
          {filtered.map(d=>(
            <div key={d.id} className='bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition'>
              <div className='flex items-start justify-between mb-3'>
                <div className='flex-1'>
                  <div className='font-semibold text-gray-800 mb-0.5'>{d.name}</div>
                  <div className='text-xs text-gray-500'>{d.category}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status==='Active'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{d.status}</span>
              </div>
              <div className='grid grid-cols-3 gap-2 text-center mb-3'>
                {[['Course',d.course_count,'📚'],['Minggu',d.duration_weeks,'⏱️'],['Peserta',d.enrolled,'👥']].map(([l,v,i])=>(
                  <div key={l} className='bg-gray-50 rounded-lg p-2'>
                    <div className='text-xs text-gray-400'>{i} {l}</div>
                    <div className='font-bold text-gray-700'>{v}</div>
                  </div>
                ))}
              </div>
              <div className='mb-3'>
                <div className='flex justify-between text-xs text-gray-500 mb-1'><span>Completion Rate</span><span>{d.completion_rate}%</span></div>
                <div className='w-full bg-gray-200 rounded-full h-2'><div className='h-2 rounded-full bg-red-500' style={{ width:`${d.completion_rate}%` }}></div></div>
              </div>
              <div className='text-xs text-gray-500 mb-3'>Target: {d.target_role}</div>
              <div className='flex gap-2'>
                <button onClick={()=>handleEdit(d)} className='flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                <button onClick={()=>handleDelete(d.id)} className='px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {msg && <div className={`fixed bottom-6 right-6 text-xs px-4 py-3 rounded-xl shadow-lg ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
    </div>
  )
}
