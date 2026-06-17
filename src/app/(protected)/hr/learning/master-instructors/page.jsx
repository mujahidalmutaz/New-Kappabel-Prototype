'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const INSTRUCTOR_TYPES = ['Internal','External']
const EXPERTISE_AREAS  = ['Leadership & Management','Technical & Engineering','Sales & Marketing','HR & People','Finance & Accounting','K3 & Safety','IT & Digital','Compliance & Legal','Soft Skills']
const STATUS_OPTS      = ['Active','Inactive']

const INIT = [
  { id:1, name:'Budi Santoso', type:'Internal', expertise:'Leadership & Management', certification:'Certified Coach ICF', experience:12, phone:'081234567890', email:'budi.s@company.com', status:'Active' },
  { id:2, name:'Sari Dewi', type:'Internal', expertise:'HR & People', certification:'CHRP, SHRM-CP', experience:8, phone:'081298765432', email:'sari.d@company.com', status:'Active' },
  { id:3, name:'PT Training Excellence', type:'External', expertise:'K3 & Safety', certification:'K3 Umum, OHSAS', experience:15, phone:'021-5555-1234', email:'info@trainex.co.id', status:'Active' },
  { id:4, name:'Ahmad Fauzi', type:'Internal', expertise:'Finance & Accounting', certification:'CPA, CA', experience:10, phone:'082112345678', email:'ahmad.f@company.com', status:'Active' },
]

const EMPTY = { name:'', type:'Internal', expertise:'Leadership & Management', certification:'', experience:'', phone:'', email:'', status:'Active' }

export default function MasterInstructorsPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.expertise.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name || !form.email) return flash(t('Nama dan email wajib diisi.','Name and email are required.'), 'error')
    if (editing) {
      setData(prev => prev.map(d => d.id === editing ? { ...d, ...form } : d))
      flash(t('Instructor diperbarui.','Instructor updated.'))
      setEditing(null)
    } else {
      setData(prev => [...prev, { id: Date.now(), ...form }])
      flash(t('Instructor ditambahkan.','Instructor added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, type:item.type, expertise:item.expertise, certification:item.certification, experience:item.experience, phone:item.phone, email:item.email, status:item.status }) }
  const handleDelete = (id) => { setData(prev => prev.filter(d => d.id !== id)); flash(t('Instructor dihapus.','Instructor deleted.')) }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Instructors','Master Instructors')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Data trainer/instructor/fasilitator training internal maupun eksternal.','Data for internal and external trainers, instructors, and facilitators.')}</p>

      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[['Total Instructor', data.length, '👨‍🏫', '#8B1A1A'],['Internal', data.filter(d=>d.type==='Internal').length, '🏢', '#059669'],['External', data.filter(d=>d.type==='External').length, '🌐', '#7c3aed']].map(([l,v,i,c]) => (
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background: c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing ? t('✏️ Edit Instructor','✏️ Edit Instructor'):`➕ ${t('Tambah Instructor','Add Instructor')}`}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Lengkap','name'],['Sertifikasi','certification'],['Phone','phone'],['Email','email']].map(([l,k]) => (
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Pengalaman (tahun)</label>
              <input type='number' min='0' value={form.experience} onChange={e=>setForm(f=>({...f,experience:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            {[['Tipe','type',INSTRUCTOR_TYPES],['Area Keahlian','expertise',EXPERTISE_AREAS],['Status','status',STATUS_OPTS]].map(([l,k,opts]) => (
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Cari instructor...','Search instructor...')}
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Nama','Tipe','Keahlian','Sertifikasi','Exp','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5 font-medium text-gray-700'>{d.name}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.type==='Internal'?'bg-blue-50 text-blue-700':'bg-red-50 text-red-700'}`}>{d.type}</span></td>
                  <td className='px-3 py-2.5 text-gray-500 text-xs'>{d.expertise}</td>
                  <td className='px-3 py-2.5 text-gray-500 text-xs'>{d.certification}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.experience} {t('thn','yr')}</td>
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
