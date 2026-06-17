'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const ASSESS_TYPES = ['Pre-Test','Post-Test','Quiz','Assignment','Certification Exam','Knowledge Check']
const STATUS_OPTS  = ['Active','Inactive','Draft']

const INIT = [
  { id:1, title:'Pre-Test K3 Dasar', type:'Pre-Test', questions:20, passing_score:70, duration:30, randomize:true, status:'Active', course:'K3 & Keselamatan Kerja' },
  { id:2, title:'Post-Test Leadership Level 1', type:'Post-Test', questions:30, passing_score:75, duration:45, randomize:true, status:'Active', course:'Leadership Fundamentals' },
  { id:3, title:'Quiz Excel Advanced', type:'Quiz', questions:15, passing_score:60, duration:20, randomize:false, status:'Active', course:'Excel Advanced for HR' },
  { id:4, title:'Assignment OJT Report', type:'Assignment', questions:5, passing_score:70, duration:0, randomize:false, status:'Active', course:'On-the-Job Training Program' },
  { id:5, title:'Certification Exam Compliance GCG', type:'Certification Exam', questions:50, passing_score:80, duration:90, randomize:true, status:'Draft', course:'GCG Compliance Certification' },
]

const EMPTY = { title:'', type:'Pre-Test', questions:'20', passing_score:'70', duration:'30', randomize:false, course:'', status:'Active' }

export default function MasterAssessmentPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.title) return flash('Judul assessment wajib diisi.', 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,questions:Number(form.questions),passing_score:Number(form.passing_score),duration:Number(form.duration)}:d))
      flash('Assessment diperbarui.'); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,questions:Number(form.questions),passing_score:Number(form.passing_score),duration:Number(form.duration)}])
      flash('Assessment ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ title:item.title, type:item.type, questions:String(item.questions), passing_score:String(item.passing_score), duration:String(item.duration), randomize:item.randomize, course:item.course, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('Assessment dihapus.') }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Assessment</h1>
      <p className='text-gray-500 text-sm mb-6'>Kelola Pre-Test, Post-Test, Quiz, Assignment, dan Certification Exam.</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Assessment', data.length, '📝', '#8B1A1A'],['Active', data.filter(d=>d.status==='Active').length, '✅', '#059669'],['Draft', data.filter(d=>d.status==='Draft').length, '📄', '#d97706'],['Avg Passing Score', Math.round(data.reduce((a,d)=>a+d.passing_score,0)/data.length)+'%', '🎯', '#7c3aed']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit Assessment':'➕ Tambah Assessment'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Judul Assessment','title'],['Nama Course/Program','course']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Tipe Assessment</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {ASSESS_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            {[['Jumlah Soal','questions'],['Passing Score (%)','passing_score'],['Durasi (menit, 0=unlimited)','duration']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input type='number' min='0' value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer'>
              <input type='checkbox' checked={form.randomize} onChange={e=>setForm(f=>({...f,randomize:e.target.checked}))} />
              Random urutan soal & jawaban
            </label>
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

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari assessment...'
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Judul','Tipe','Soal','Pass Score','Durasi','Random','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5'><div className='font-medium text-gray-700'>{d.title}</div><div className='text-xs text-gray-400'>{d.course}</div></td>
                  <td className='px-3 py-2.5'><span className='text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold whitespace-nowrap'>{d.type}</span></td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.questions}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.passing_score}%</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.duration?d.duration+' mnt':'∞'}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.randomize?'✅':'—'}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status==='Active'?'bg-green-50 text-green-700':d.status==='Draft'?'bg-yellow-50 text-yellow-700':'bg-gray-100 text-gray-500'}`}>{d.status}</span></td>
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
