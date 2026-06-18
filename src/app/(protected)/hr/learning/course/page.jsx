'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const COURSE_TYPES    = ['Instructor Led Training (ILT)','Self-Paced','Blended Learning']
const ENROLL_TYPES    = ['Open Enrollment','Required Assignment','Recommendation','By Invitation']
const CATEGORIES      = ['Leadership & Management','Technical Skills','Compliance & Regulasi','Soft Skills','K3 & Safety','Digital Literacy','HR & People Management','Finance & Accounting','Sales & Marketing']
const STATUS_OPTS     = ['Active','Inactive','Draft','Archived']

const INIT = [
  { id:1, title:'K3 & Keselamatan Kerja Dasar', category:'K3 & Safety', type:'Instructor Led Training (ILT)', duration_hours:8, instructor:'PT Training Excellence', enrollment:'Required Assignment', content_count:5, enrolled:120, status:'Active' },
  { id:2, title:'Leadership Fundamentals Level 1', category:'Leadership & Management', type:'Blended Learning', duration_hours:24, instructor:'Budi Santoso', enrollment:'Open Enrollment', content_count:12, enrolled:85, status:'Active' },
  { id:3, title:'Excel Advanced for HR', category:'Digital Literacy', type:'Self-Paced', duration_hours:6, instructor:'Sari Dewi', enrollment:'Open Enrollment', content_count:8, enrolled:210, status:'Active' },
  { id:4, title:'GCG & Compliance Certification', category:'Compliance & Regulasi', type:'Blended Learning', duration_hours:16, instructor:'Ahmad Fauzi', enrollment:'Required Assignment', content_count:10, enrolled:456, status:'Active' },
  { id:5, title:'Digital Marketing Fundamentals', category:'Sales & Marketing', type:'Self-Paced', duration_hours:12, instructor:'Online Platform', enrollment:'Open Enrollment', content_count:15, enrolled:67, status:'Draft' },
]

const EMPTY = { title:'', category:'Leadership & Management', type:'Instructor Led Training (ILT)', duration_hours:'8', instructor:'', enrollment:'Open Enrollment', description:'', status:'Active' }

export default function CoursePage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }

  const filtered = data.filter(d =>
    (filterType==='All' || d.type===filterType) &&
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = () => {
    if (!form.title) return flash(t('Judul course wajib diisi.','Course title is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,duration_hours:Number(form.duration_hours)}:d))
      flash(t('Course diperbarui.','Course updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,duration_hours:Number(form.duration_hours),content_count:0,enrolled:0}])
      flash(t('Course ditambahkan.','Course added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ title:item.title, category:item.category, type:item.type, duration_hours:String(item.duration_hours), instructor:item.instructor, enrollment:item.enrollment, description:item.description||'', status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Course dihapus.','Course deleted.')) }

  const typeColor = (t) => t==='Instructor Led Training (ILT)'?'bg-blue-50 text-blue-700':t==='Self-Paced'?'bg-green-50 text-green-700':'bg-red-50 text-red-700'
  const typeShort = (t) => t==='Instructor Led Training (ILT)'?'ILT':t==='Self-Paced'?'Self-Paced':'Blended'

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Course Management','Course Management')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Modul utama untuk membuat dan mengelola course/training di LMS.','Main module for creating and managing courses/training in the LMS.')}</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Course', data.length, '🎓', '#8B1A1A'],['Active', data.filter(d=>d.status==='Active').length, '✅', '#059669'],['Total Enrolled', data.reduce((a,d)=>a+(d.enrolled||0),0), '👥', '#7c3aed'],['Draft', data.filter(d=>d.status==='Draft').length, '📝', '#d97706']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?`✏️ ${t('Edit Course','Edit Course')}`:`➕ ${t('Tambah Course','Add Course')}`}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Judul Course</label>
              <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Instructor/Fasilitator</label>
              <input value={form.instructor} onChange={e=>setForm(f=>({...f,instructor:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Durasi (jam)</label>
              <input type='number' min='1' value={form.duration_hours} onChange={e=>setForm(f=>({...f,duration_hours:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            {[['Kategori','category',CATEGORIES],['Metode Pembelajaran','type',COURSE_TYPES],['Tipe Enrollment','enrollment',ENROLL_TYPES],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
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
          <div className='flex flex-wrap gap-2 mb-4'>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Cari course...','Search course...')}
              className='flex-1 min-w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            <div className='flex gap-1'>
              {['All','ILT','Self-Paced','Blended'].map(t=>(
                <button key={t} onClick={()=>setFilterType(t==='ILT'?'Instructor Led Training (ILT)':t==='Self-Paced'?'Self-Paced':t==='Blended'?'Blended Learning':'All')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${(t==='All'&&filterType==='All')||(t==='ILT'&&filterType.includes('ILT'))||(t==='Self-Paced'&&filterType==='Self-Paced')||(t==='Blended'&&filterType.includes('Blended'))?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Course','Kategori','Metode','Durasi','Instructor','Enrolled','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5 font-medium text-gray-700 max-w-40'><div className='line-clamp-2'>{d.title}</div></td>
                  <td className='px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap'>{d.category}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColor(d.type)}`}>{typeShort(d.type)}</span></td>
                  <td className='px-3 py-2.5 text-gray-500 whitespace-nowrap'>{d.duration_hours} {t('jam','hrs')}</td>
                  <td className='px-3 py-2.5 text-gray-500 text-xs'>{d.instructor}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.enrolled}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status==='Active'?'bg-green-50 text-green-700':d.status==='Draft'?'bg-yellow-50 text-yellow-700':d.status==='Archived'?'bg-gray-100 text-gray-500':'bg-red-50 text-red-700'}`}>{d.status}</span></td>
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
