'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const INIT = [
  { id:1, name:'Certified Public Accountant (CPA)', category:'Certification', level:'Expert', validity:'3 tahun', issuedBy:'ICAI Indonesia', relatedJob:['Finance Analyst','Finance Manager'], status:'Active', desc:'Sertifikasi akuntansi internasional.' },
  { id:2, name:'Power BI Data Analyst', category:'Technical Skill', level:'Proficient', validity:'2 tahun', issuedBy:'Microsoft', relatedJob:['Data Analyst','IT Analyst'], status:'Active', desc:'Kemampuan analisis data menggunakan Power BI.' },
  { id:3, name:'K3 Ahli Muda', category:'Safety Certification', level:'Basic', validity:'3 tahun', issuedBy:'BNSP', relatedJob:['Operations','K3 Officer'], status:'Active', desc:'Sertifikasi Keselamatan dan Kesehatan Kerja.' },
  { id:4, name:'SHRM Certified Professional (SHRM-CP)', category:'Certification', level:'Proficient', validity:'3 tahun', issuedBy:'SHRM', relatedJob:['HR Specialist','HR Manager'], status:'Active', desc:'Sertifikasi profesional HR internasional.' },
  { id:5, name:'AWS Solutions Architect Associate', category:'Cloud Certification', level:'Proficient', validity:'3 tahun', issuedBy:'Amazon Web Services', relatedJob:['IT Engineer','Cloud Architect'], status:'Active', desc:'Desain arsitektur cloud AWS.' },
  { id:6, name:'Leadership Assessment Level 2', category:'Leadership Skill', level:'Developing', validity:'Permanent', issuedBy:'Internal', relatedJob:['Supervisor','Manager'], status:'Active', desc:'Kompetensi kepemimpinan tingkat menengah.' },
  { id:7, name:'Brevet Pajak A & B', category:'Tax Certification', level:'Proficient', validity:'Permanent', issuedBy:'IAI Indonesia', relatedJob:['Tax Specialist','Finance'], status:'Active', desc:'Sertifikasi pajak level A dan B.' },
]

const CATEGORIES = ['Semua','Certification','Technical Skill','Safety Certification','Cloud Certification','Leadership Skill','Tax Certification']
const LEVELS = ['Novice','Basic','Developing','Proficient','Expert']
const LEVEL_COLOR = { Expert:'bg-green-50 text-green-700', Proficient:'bg-blue-50 text-blue-700', Developing:'bg-yellow-50 text-yellow-700', Basic:'bg-orange-50 text-orange-700', Novice:'bg-red-50 text-red-700' }

export default function SkillQualificationPage() {
  const t = useT()
  const [data, setData] = useState(INIT)
  const [filterCat, setFilterCat] = useState('Semua')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name:'', category:'Certification', level:'Proficient', validity:'', issuedBy:'', relatedJob:[], desc:'' })
  const [msg, setMsg] = useState(null)

  const flash = (text) => { setMsg(text); setTimeout(()=>setMsg(null), 3000) }

  const openAdd = () => { setForm({ name:'', category:'Certification', level:'Proficient', validity:'', issuedBy:'', relatedJob:[], desc:'' }); setEditItem(null); setShowForm(true) }
  const openEdit = (item) => { setForm({...item}); setEditItem(item.id); setShowForm(true) }

  const handleSave = () => {
    if (!form.name || !form.issuedBy) return flash(t('Nama dan penerbit wajib diisi.','Name and issuer are required.'))
    if (editItem) {
      setData(prev=>prev.map(d=>d.id===editItem?{...form,id:editItem,status:'Active'}:d))
      flash(t('Item berhasil diperbarui.','Item updated.'))
    } else {
      setData(prev=>[...prev,{...form,id:Date.now(),status:'Active'}])
      flash(t('Item berhasil ditambahkan.','Item added.'))
    }
    setShowForm(false)
  }

  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Item berhasil dihapus.','Item deleted.')) }

  const filtered = data.filter(d=>
    (filterCat==='Semua'||d.category===filterCat) &&
    (d.name.toLowerCase().includes(search.toLowerCase())||d.desc.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Skill & Qualification','Master Skill & Qualification')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Kelola daftar keterampilan, sertifikasi, dan kualifikasi yang diakui perusahaan dalam LMS.','Manage the list of skills, certifications, and qualifications recognised by the company in the LMS.')}</p>

      {msg && <div className='text-xs px-4 py-3 rounded-lg mb-4 bg-green-50 text-green-600'>{msg}</div>}

      <div className='flex items-center gap-3 mb-4 flex-wrap'>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Cari nama skill/sertifikasi...','Search skill/certification name...')}
          className='flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
        <button onClick={openAdd}
          className='px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          + {t('Tambah Item','Add Item')}
        </button>
      </div>

      <div className='flex gap-2 mb-4 flex-wrap'>
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${filterCat===c?'text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            style={filterCat===c?{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}:{}}>
            {c} {c!=='Semua'?`(${data.filter(d=>d.category===c).length})`:`(${data.length})`}
          </button>
        ))}
      </div>

      {showForm && (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-red-200 mb-6'>
          <h3 className='font-bold text-gray-700 mb-4'>{editItem ? `✏️ ${t('Edit Skill / Qualification','Edit Skill / Qualification')}` : `➕ ${t('Tambah Skill / Qualification','Add Skill / Qualification')}`}</h3>
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Nama <span className='text-red-500'>*</span></label>
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            {[['Kategori','category',['Certification','Technical Skill','Safety Certification','Cloud Certification','Leadership Skill','Tax Certification','Soft Skill','Domain Knowledge']],
              ['Level','level',LEVELS],
            ].map(([l,k,opts])=>(
              <div key={k}>
                <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{l}</label>
                <select value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
                  className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            {[['Diterbitkan Oleh','issuedBy','text','BNSP / Microsoft / Internal'],['Masa Berlaku','validity','text','2 tahun / Permanent']].map(([l,k,t,ph])=>(
              <div key={k}>
                <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
                  placeholder={ph} className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
            ))}
            <div className='col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Deskripsi</label>
              <input value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
          </div>
          <div className='flex gap-3'>
            <button onClick={handleSave} className='px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>{editItem ? t('Simpan','Save') : t('Tambah','Add')}</button>
            <button onClick={()=>setShowForm(false)} className='px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>{t('Batal','Cancel')}</button>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        {filtered.map(item=>(
          <div key={item.id} className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-red-200 transition'>
            <div className='flex items-start justify-between mb-2'>
              <div>
                <div className='font-bold text-gray-800'>{item.name}</div>
                <div className='flex items-center gap-2 mt-1'>
                  <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>{item.category}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${LEVEL_COLOR[item.level]}`}>{item.level}</span>
                </div>
              </div>
              <div className='flex gap-1'>
                <button onClick={()=>openEdit(item)} className='px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100'>Edit</button>
                <button onClick={()=>handleDelete(item.id)} className='px-2.5 py-1 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
              </div>
            </div>
            <p className='text-xs text-gray-500 mb-2'>{item.desc}</p>
            <div className='flex gap-4 text-xs text-gray-400'>
              <span>🏛️ {item.issuedBy}</span>
              <span>⏱️ {item.validity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
