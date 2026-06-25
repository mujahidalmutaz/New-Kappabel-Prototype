'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const PLAN_TYPES  = ['Individual Development Plan','Team Learning Plan','Mandatory Training Program','Onboarding Program','Succession Development Plan']
const STATUS_OPTS = ['Draft','Published','In Progress','Completed','Archived']

const INIT = [
  { id:1, plan_name:'Mandatory K3 Annual Program 2025', type:'Mandatory Training Program', target:'All Employee', course_count:3, start_date:'2025-01-01', end_date:'2025-12-31', budget:50000000, completion_rate:68, status:'In Progress', pic:'Safety Team' },
  { id:2, plan_name:'New Employee Onboarding 2025 Q3', type:'Onboarding Program', target:'New Hire Q3 2025', course_count:7, start_date:'2025-07-01', end_date:'2025-09-30', budget:25000000, completion_rate:45, status:'In Progress', pic:'HR Talent' },
  { id:3, plan_name:'Manager Leadership Development 2025', type:'Team Learning Plan', target:'Manager Grade 6-9', course_count:5, start_date:'2025-04-01', end_date:'2025-12-31', budget:120000000, completion_rate:30, status:'In Progress', pic:'HR Learning' },
  { id:4, plan_name:'GCG Compliance Recertification 2025', type:'Mandatory Training Program', target:'All Employee', course_count:2, start_date:'2025-09-01', end_date:'2025-10-31', budget:80000000, completion_rate:0, status:'Draft', pic:'Compliance' },
  { id:5, plan_name:'IT Digital Upskilling Program', type:'Team Learning Plan', target:'IT Division', course_count:8, start_date:'2025-06-01', end_date:'2025-12-31', budget:75000000, completion_rate:22, status:'In Progress', pic:'HR Learning' },
]

const EMPTY = { plan_name:'', type:'Mandatory Training Program', target:'', course_count:'3', start_date:'', end_date:'', budget:'', description:'', pic:'', status:'Draft' }

export default function MasterLearningPlanningPage() {
  const t = useT()
  const [data,     setData   ] = useState(INIT)
  const [form,     setForm   ] = useState(EMPTY)
  const [editing,  setEditing ] = useState(null)
  const [search,   setSearch  ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')
  const [msg,      setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }

  const filtered = data.filter(d =>
    (filterStatus==='All' || d.status===filterStatus) &&
    d.plan_name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = () => {
    if (!form.plan_name) return flash(t('Nama program wajib diisi.','Programme name is required.'), 'error')
    if (!form.start_date || !form.end_date) return flash(t('Tanggal mulai dan selesai wajib diisi.','Start and end dates are required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,course_count:Number(form.course_count),budget:Number(form.budget)||0}:d))
      flash(t('Program diperbarui.','Programme updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,course_count:Number(form.course_count),budget:Number(form.budget)||0,completion_rate:0}])
      flash(t('Program ditambahkan.','Programme added.'))
    }
    setForm(EMPTY); setShowForm(false)
  }

  const handleEdit = (item) => {
    setEditing(item.id)
    setForm({ plan_name:item.plan_name, type:item.type, target:item.target, course_count:String(item.course_count), start_date:item.start_date, end_date:item.end_date, budget:String(item.budget||''), description:item.description||'', pic:item.pic||'', status:item.status })
    setShowForm(true)
  }

  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Program dihapus.','Programme deleted.')) }

  const statusColor = (s) => ({ Draft:'bg-gray-100 text-gray-500', Published:'bg-blue-50 text-blue-700', 'In Progress':'bg-yellow-50 text-yellow-700', Completed:'bg-green-50 text-green-700', Archived:'bg-gray-100 text-gray-400' }[s])

  const totalBudget = data.reduce((a,d)=>a+(d.budget||0),0)
  const totalPrograms = data.length
  const activePrograms = data.filter(d=>d.status==='In Progress').length
  const avgCompletion = data.length ? Math.round(data.reduce((a,d)=>a+d.completion_rate,0)/data.length) : 0

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Learning Planning','Master Learning Planning')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Susun program dan rencana pembelajaran karyawan — IDP, mandatory training, onboarding, dan succession plan.','Build employee learning programmes — IDP, mandatory training, onboarding, and succession planning.')}</p>

      {msg && <div className={`text-xs px-4 py-3 rounded-lg mb-4 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[
          [t('Total Program','Total Programs'), totalPrograms, 'text-gray-800'],
          [t('Berjalan','Running'), activePrograms, 'text-yellow-700'],
          [t('Avg Completion','Avg Completion'), avgCompletion+'%', 'text-blue-700'],
          [t('Total Budget','Total Budget'), 'Rp '+Math.round(totalBudget/1000000)+'jt', 'text-red-700'],
        ].map(([l,v,cls])=>(
          <div key={l} className='bg-white rounded-xl px-4 py-3 shadow-sm'>
            <div className='text-xs text-gray-500'>{l}</div>
            <div className={`text-lg font-bold mt-0.5 ${cls}`}>{v}</div>
          </div>
        ))}
      </div>

      <div className='flex justify-between items-center mb-4 gap-3 flex-wrap'>
        <div className='flex gap-2 flex-wrap'>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            className='px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 w-56'
            placeholder={t('Cari program...','Search programme...')} />
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            className='px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 bg-white'>
            <option value='All'>{t('Semua Status','All Status')}</option>
            {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={()=>{setShowForm(true);setEditing(null);setForm(EMPTY)}}
          className='px-5 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          {t('+ Tambah Program','+ Add Programme')}
        </button>
      </div>

      {showForm && (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-red-200 mb-6'>
          <h3 className='font-bold text-gray-700 mb-4'>{editing?t('Edit Program','Edit Programme'):t('Tambah Program Baru','Add New Programme')}</h3>
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Nama Program','Programme Name')} <span className='text-red-500'>*</span></label>
              <input value={form.plan_name} onChange={e=>setForm(f=>({...f,plan_name:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tipe Program','Programme Type')}</label>
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {PLAN_TYPES.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Target Peserta','Target Participants')}</label>
              <input value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' placeholder={t('Contoh: All Employee, Manager Grade 6-9','E.g. All Employee, Manager Grade 6-9')} />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tanggal Mulai','Start Date')} <span className='text-red-500'>*</span></label>
              <input type='date' value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tanggal Selesai','End Date')} <span className='text-red-500'>*</span></label>
              <input type='date' value={form.end_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Jumlah Course','Number of Courses')}</label>
              <input type='number' value={form.course_count} onChange={e=>setForm(f=>({...f,course_count:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Budget (Rp)','Budget (Rp)')}</label>
              <input type='number' value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' placeholder='0' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('PIC / Penanggung Jawab','PIC / Owner')}</label>
              <input value={form.pic} onChange={e=>setForm(f=>({...f,pic:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className='col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Deskripsi Program','Programme Description')}</label>
              <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' />
            </div>
          </div>
          <div className='flex gap-3'>
            <button onClick={handleSave} className='px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>{editing?t('Simpan Perubahan','Save Changes'):t('Tambahkan','Add')}</button>
            <button onClick={()=>{setShowForm(false);setEditing(null);setForm(EMPTY)}} className='px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>{t('Batal','Cancel')}</button>
          </div>
        </div>
      )}

      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='bg-gray-50 border-b border-gray-100'>
              {[t('Nama Program','Programme Name'),t('Tipe','Type'),t('Target','Target'),t('Periode','Period'),t('Course','Courses'),'Budget','Completion','PIC','Status',''].map(h=>(
                <th key={h} className='text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap'>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(d=>(
              <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                <td className='px-4 py-3 font-medium text-gray-800 max-w-56'><div className='line-clamp-2'>{d.plan_name}</div></td>
                <td className='px-4 py-3 text-xs text-gray-500'>{d.type}</td>
                <td className='px-4 py-3 text-xs text-gray-500'>{d.target}</td>
                <td className='px-4 py-3 text-xs text-gray-500 whitespace-nowrap'>{d.start_date}<br/><span className='text-gray-400'>s/d {d.end_date}</span></td>
                <td className='px-4 py-3 text-center text-xs font-semibold text-gray-700'>{d.course_count}</td>
                <td className='px-4 py-3 text-xs text-gray-500 whitespace-nowrap'>{d.budget?'Rp '+Math.round(d.budget/1000000)+'jt':'—'}</td>
                <td className='px-4 py-3'>
                  <div className='flex items-center gap-2'>
                    <div className='flex-1 bg-gray-200 rounded-full h-2 min-w-12'>
                      <div className='h-2 rounded-full bg-red-500' style={{width:`${d.completion_rate}%`}}></div>
                    </div>
                    <span className='text-xs font-semibold text-gray-700 whitespace-nowrap'>{d.completion_rate}%</span>
                  </div>
                </td>
                <td className='px-4 py-3 text-xs text-gray-500'>{d.pic||'—'}</td>
                <td className='px-4 py-3'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${statusColor(d.status)}`}>{d.status}</span></td>
                <td className='px-4 py-3'>
                  <div className='flex gap-2'>
                    <button onClick={()=>handleEdit(d)} className='text-xs text-blue-600 hover:underline'>{t('Edit','Edit')}</button>
                    <button onClick={()=>handleDelete(d.id)} className='text-xs text-red-400 hover:underline'>{t('Hapus','Delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length===0 && <div className='py-10 text-center text-gray-400 text-sm'>{t('Tidak ada program ditemukan.','No programmes found.')}</div>}
      </div>
    </div>
  )
}
