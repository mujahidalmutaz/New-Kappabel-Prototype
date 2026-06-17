'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const EVAL_TYPES  = ['Training Feedback (Level 1)','Learning Assessment (Level 2)','Behavior Evaluation (Level 3)','Business Impact (Level 4)','Engagement Survey','NPS Training','Vendor Survey']
const STATUS_OPTS = ['Active','Inactive','Draft']

const INIT = [
  { id:1, title:'Feedback Training Harian', type:'Training Feedback (Level 1)', questions:10, anonymous:true, status:'Active' },
  { id:2, title:'Evaluasi Efektivitas Program Leadership', type:'Learning Assessment (Level 2)', questions:15, anonymous:false, status:'Active' },
  { id:3, title:'Perubahan Perilaku Pasca Training K3', type:'Behavior Evaluation (Level 3)', questions:20, anonymous:false, status:'Active' },
  { id:4, title:'Survey Kepuasan Peserta Training', type:'Engagement Survey', questions:12, anonymous:true, status:'Active' },
  { id:5, title:'Penilaian Vendor Training', type:'Vendor Survey', questions:8, anonymous:true, status:'Active' },
]

const EMPTY = { title:'', type:'Training Feedback (Level 1)', questions:'10', anonymous:true, description:'', status:'Active' }

export default function MasterEvaluationPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.title) return flash('Judul evaluasi wajib diisi.', 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,questions:Number(form.questions)}:d))
      flash('Evaluasi diperbarui.'); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,questions:Number(form.questions)}])
      flash('Evaluasi ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ title:item.title, type:item.type, questions:String(item.questions), anonymous:item.anonymous, description:item.description||'', status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('Evaluasi dihapus.') }

  const typeColor = (t) => t.includes('Level 1')?'bg-blue-50 text-blue-700':t.includes('Level 2')?'bg-green-50 text-green-700':t.includes('Level 3')?'bg-yellow-50 text-yellow-700':t.includes('Level 4')?'bg-red-50 text-red-700':'bg-red-50 text-red-700'

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Evaluation</h1>
      <p className='text-gray-500 text-sm mb-6'>Template evaluasi & survey training berbasis Kirkpatrick Level 1–4, engagement survey, dan vendor survey.</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Template', data.length, '📊', '#8B1A1A'],['Feedback (L1)', data.filter(d=>d.type.includes('Level 1')).length, '💬', '#059669'],['Behavior (L3)', data.filter(d=>d.type.includes('Level 3')).length, '🔄', '#7c3aed'],['Anonymous', data.filter(d=>d.anonymous).length, '🔒', '#d97706']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit Evaluasi':'➕ Tambah Evaluasi'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Judul Evaluasi</label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Tipe Evaluasi</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {EVAL_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Jumlah Pertanyaan</label>
              <input type='number' min='1' value={form.questions} onChange={e=>setForm(f=>({...f,questions:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Deskripsi</label>
              <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' /></div>
            <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer'>
              <input type='checkbox' checked={form.anonymous} onChange={e=>setForm(f=>({...f,anonymous:e.target.checked}))} />
              Anonymous (identitas peserta disembunyikan)
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari evaluasi...'
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Judul','Tipe Evaluasi','Pertanyaan','Anonymous','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5 font-medium text-gray-700'>{d.title}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColor(d.type)}`}>{d.type}</span></td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.questions} soal</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.anonymous?'✅':'—'}</td>
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
