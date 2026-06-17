'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const PLAN_TYPES  = ['Individual Development Plan','Team Learning Plan','Mandatory Training Program','Onboarding Program','Succession Development Plan']
const STATUS_OPTS = ['Draft','Published','In Progress','Completed','Archived']

const INIT = [
  { id:1, plan_name:'Mandatory K3 Annual Program 2025', type:'Mandatory Training Program', target:'All Employee', course_count:3, start_date:'2025-01-01', end_date:'2025-12-31', completion_rate:68, status:'In Progress' },
  { id:2, plan_name:'New Employee Onboarding 2025 Q3', type:'Onboarding Program', target:'New Hire Q3 2025', course_count:7, start_date:'2025-07-01', end_date:'2025-09-30', completion_rate:45, status:'In Progress' },
  { id:3, plan_name:'Manager Leadership Development 2025', type:'Team Learning Plan', target:'Manager Grade 6-9', course_count:5, start_date:'2025-04-01', end_date:'2025-12-31', completion_rate:30, status:'In Progress' },
  { id:4, plan_name:'GCG Compliance Recertification 2025', type:'Mandatory Training Program', target:'All Employee', course_count:2, start_date:'2025-09-01', end_date:'2025-10-31', completion_rate:0, status:'Draft' },
  { id:5, plan_name:'IT Digital Upskilling Program', type:'Team Learning Plan', target:'IT Division', course_count:8, start_date:'2025-06-01', end_date:'2025-12-31', completion_rate:22, status:'In Progress' },
]

const EMPTY = { plan_name:'', type:'Mandatory Training Program', target:'', course_count:'3', start_date:'', end_date:'', description:'', status:'Draft' }

export default function MasterLearningPlanningPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.plan_name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.plan_name) return flash(t('Nama program wajib diisi.','Programme name is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,course_count:Number(form.course_count)}:d))
      flash(t('Program diperbarui.','Programme updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,course_count:Number(form.course_count),completion_rate:0}])
      flash(t('Program ditambahkan.','Programme added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ plan_name:item.plan_name, type:item.type, target:item.target, course_count:String(item.course_count), start_date:item.start_date, end_date:item.end_date, description:item.description||'', status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Program dihapus.','Programme deleted.')) }

  const statusColor = (s) => ({ Draft:'bg-gray-100 text-gray-500', Published:'bg-blue-50 text-blue-700', 'In Progress':'bg-yellow-50 text-yellow-700', Completed:'bg-green-50 text-green-700', Archived:'bg-gray-100 text-gray-400' }[s])

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Learning Planning','Master Learning Planning')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Susun program dan rencana pembelajaran karyawan — IDP, mandatory training, onboarding, dan succession plan.','Build employee learning programmes and plans — IDP, mandatory training, onboarding, and succession planning.')}</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Program', data.length, '📋', '#8B1A1A'],['In Progress', data.filter(d=>d.status==='In Progress').length, '🔵', '#2563eb'],['Avg Completion', Math.round(data.reduce((a,d)=>a+d.completion_rate,0)/data.length)+'%', '📈', '#059669'],['Draft', data.filter(d=>d.status==='Draft').length, '📝', '#d97706']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?t('✏️ Edit Program','✏️ Edit Programme'):`➕ ${t('Tambah Program','Add Programme')}`}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Program','plan_name'],['Target Peserta','target']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Jumlah Course/Modul</label>
              <input type='number' min='1' value={form.course_count} onChange={e=>setForm(f=>({...f,course_count:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            <div className='grid grid-cols-2 gap-2'>
              {[['Tanggal Mulai','start_date'],['Tanggal Selesai','end_date']].map(([l,k])=>(
                <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                  <input type='date' value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
              ))}
            </div>
            {[['Tipe Program','type',PLAN_TYPES],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {opts.map(o=><option key={o}>{o}</option>)}</select></div>
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Cari program...','Search programme...')}
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='flex flex-col gap-4'>
            {filtered.map(d=>(
              <div key={d.id} className='border border-gray-200 rounded-xl p-4 hover:border-red-300 transition'>
                <div className='flex items-start justify-between mb-2'>
                  <div>
                    <div className='font-semibold text-gray-800 text-sm'>{d.plan_name}</div>
                    <div className='flex items-center gap-2 mt-1'>
                      <span className='text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full'>{d.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(d.status)}`}>{d.status}</span>
                    </div>
                  </div>
                  <div className='flex gap-1'>
                    <button onClick={()=>handleEdit(d)} className='px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                    <button onClick={()=>handleDelete(d.id)} className='px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                  </div>
                </div>
                <div className='flex items-center gap-4 text-xs text-gray-500 mb-2'>
                  <span>👥 {d.target}</span>
                  <span>📚 {d.course_count} course</span>
                  <span>📅 {d.start_date} s/d {d.end_date}</span>
                </div>
                <div>
                  <div className='flex justify-between text-xs text-gray-500 mb-1'><span>Completion Rate</span><span className='font-semibold'>{d.completion_rate}%</span></div>
                  <div className='w-full bg-gray-200 rounded-full h-2'><div className='h-2 rounded-full bg-red-500' style={{ width:`${d.completion_rate}%` }}></div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
