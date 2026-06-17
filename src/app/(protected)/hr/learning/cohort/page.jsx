'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const TARGET_TYPES  = ['Division','Position','Grade','Region/Location','Custom Group','All Employee','New Hire']
const ASSIGN_TYPES  = ['Mandatory','Optional','Recommendation']
const STATUS_OPTS   = ['Active','Inactive','Archived']

const INIT = [
  { id:1, name:'Cohort K3 Mandatory - All Employee', target_type:'All Employee', target_value:'Semua Karyawan', member_count:850, assignment:'Mandatory', linked_course:'K3 & Keselamatan Kerja Dasar', status:'Active' },
  { id:2, name:'Cohort New Hire Onboarding 2025', target_type:'New Hire', target_value:'Karyawan Baru Join 2025', member_count:42, assignment:'Mandatory', linked_course:'New Employee Orientation Program', status:'Active' },
  { id:3, name:'Cohort Leadership - Manager & Above', target_type:'Grade', target_value:'Grade 6, 7, 8, 9', member_count:120, assignment:'Mandatory', linked_course:'Leadership Fundamentals Level 1', status:'Active' },
  { id:4, name:'Cohort HR Team Development', target_type:'Division', target_value:'Human Resources Division', member_count:35, assignment:'Mandatory', linked_course:'HR Advanced Training Program', status:'Active' },
  { id:5, name:'Cohort IT Digital Upskilling', target_type:'Division', target_value:'IT & Digital Division', member_count:65, assignment:'Optional', linked_course:'Digital Literacy Program', status:'Active' },
]

const EMPTY = { name:'', target_type:'Division', target_value:'', member_count:'0', assignment:'Mandatory', linked_course:'', status:'Active' }

export default function MasterCohortPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name) return flash('Nama cohort wajib diisi.', 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,member_count:Number(form.member_count)}:d))
      flash('Cohort diperbarui.'); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,member_count:Number(form.member_count)}])
      flash('Cohort ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, target_type:item.target_type, target_value:item.target_value, member_count:String(item.member_count), assignment:item.assignment, linked_course:item.linked_course, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('Cohort dihapus.') }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Cohort</h1>
      <p className='text-gray-500 text-sm mb-6'>Pengelompokan learner berdasarkan divisi, jabatan, grade, lokasi, atau kriteria tertentu untuk assignment training massal.</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Cohort', data.length, '👥', '#8B1A1A'],['Total Member', data.reduce((a,d)=>a+d.member_count,0), '👤', '#059669'],['Mandatory', data.filter(d=>d.assignment==='Mandatory').length, '📌', '#dc2626'],['Active', data.filter(d=>d.status==='Active').length, '✅', '#7c3aed']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit Cohort':'➕ Tambah Cohort'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Cohort','name'],['Target / Nilai Kriteria','target_value'],['Course yang Ditautkan','linked_course']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Jumlah Member</label>
              <input type='number' min='0' value={form.member_count} onChange={e=>setForm(f=>({...f,member_count:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            {[['Tipe Target','target_type',TARGET_TYPES],['Tipe Assignment','assignment',ASSIGN_TYPES],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari cohort...'
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Nama Cohort','Target Tipe','Target','Member','Course','Assignment','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5 font-medium text-gray-700 max-w-36'><div className='line-clamp-2 text-xs'>{d.name}</div></td>
                  <td className='px-3 py-2.5'><span className='text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold whitespace-nowrap'>{d.target_type}</span></td>
                  <td className='px-3 py-2.5 text-xs text-gray-500'>{d.target_value}</td>
                  <td className='px-3 py-2.5 font-bold text-gray-700'>{d.member_count.toLocaleString()}</td>
                  <td className='px-3 py-2.5 text-xs text-gray-500 max-w-28'><div className='line-clamp-2'>{d.linked_course}</div></td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.assignment==='Mandatory'?'bg-red-50 text-red-700':d.assignment==='Optional'?'bg-blue-50 text-blue-700':'bg-yellow-50 text-yellow-700'}`}>{d.assignment}</span></td>
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
