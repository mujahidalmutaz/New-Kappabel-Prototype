'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const INIT = [
  { id:1, name:'Training Reaction Survey (Kirkpatrick L1)', type:'Evaluation', category:'Post-Training', questions:10, target:'All Courses', status:'Active', desc:'Mengukur kepuasan dan reaksi peserta segera setelah pelatihan selesai.' },
  { id:2, name:'Learning Effectiveness Questionnaire (Kirkpatrick L2)', type:'Evaluation', category:'Post-Training', questions:15, target:'ILT Courses', status:'Active', desc:'Mengukur peningkatan pengetahuan/keterampilan sebelum dan setelah pelatihan.' },
  { id:3, name:'Behavior On-the-Job Evaluation (Kirkpatrick L3)', type:'Evaluation', category:'30-Day Follow Up', questions:12, target:'Leadership & Compliance', status:'Active', desc:'Mengukur penerapan hasil pelatihan di lingkungan kerja nyata oleh atasan.' },
  { id:4, name:'Pre-Course Knowledge Check', type:'Assessment', category:'Pre-Training', questions:20, target:'Technical Courses', status:'Active', desc:'Menguji pemahaman awal peserta sebelum mengikuti pelatihan.' },
  { id:5, name:'Training Needs Analysis (TNA)', type:'Survey', category:'Annual', questions:25, target:'All Employees', status:'Active', desc:'Identifikasi kebutuhan training tahunan dari semua departemen.' },
  { id:6, name:'IDP Goal-Setting Questionnaire', type:'Survey', category:'IDP', questions:8, target:'All Employees', status:'Active', desc:'Panduan pertanyaan penyusunan Individual Development Plan.' },
  { id:7, name:'Exit Learning Survey', type:'Survey', category:'Post-Training', questions:6, target:'All Courses', status:'Draft', desc:'Survei singkat saat karyawan keluar dari program learning.' },
]

const TYPES = ['Semua','Assessment','Evaluation','Survey']
const TYPE_COLORS = { Assessment:'bg-blue-50 text-blue-700', Evaluation:'bg-red-50 text-red-700', Survey:'bg-orange-50 text-orange-700' }

export default function QuestionnairesPage() {
  const t = useT()
  const [data, setData] = useState(INIT)
  const [filterType, setFilterType] = useState('Semua')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [expandId, setExpandId] = useState(null)
  const [form, setForm] = useState({ name:'', type:'Survey', category:'Post-Training', questions:10, target:'', desc:'' })
  const [msg, setMsg] = useState(null)

  const flash = (text) => { setMsg(text); setTimeout(()=>setMsg(null), 3000) }

  const openAdd = () => { setForm({ name:'', type:'Survey', category:'Post-Training', questions:10, target:'', desc:'' }); setEditId(null); setShowForm(true) }
  const openEdit = (item) => { setForm({...item}); setEditId(item.id); setShowForm(true) }

  const handleSave = () => {
    if (!form.name || !form.target) return flash('Nama dan target wajib diisi.')
    if (editId) {
      setData(prev=>prev.map(d=>d.id===editId?{...form,id:editId,status:d.status}:d))
      flash('Template berhasil diperbarui.')
    } else {
      setData(prev=>[...prev,{...form,id:Date.now(),status:'Draft'}])
      flash('Template kuesioner berhasil ditambahkan.')
    }
    setShowForm(false)
  }

  const toggleStatus = (id) => {
    setData(prev=>prev.map(d=>d.id===id?{...d,status:d.status==='Active'?'Inactive':'Active'}:d))
    flash('Status berhasil diubah.')
  }

  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('Template berhasil dihapus.') }

  const filtered = data.filter(d=>filterType==='Semua'||d.type===filterType)

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Questionnaire Templates</h1>
      <p className='text-gray-500 text-sm mb-6'>Kelola template kuesioner untuk evaluasi, penilaian, dan survei dalam sistem LMS.</p>

      {msg && <div className='text-xs px-4 py-3 rounded-lg mb-4 bg-green-50 text-green-600'>{msg}</div>}

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Template', data.length,'📋','#8B1A1A'],
          ['Active', data.filter(d=>d.status==='Active').length,'✅','#059669'],
          ['Draft', data.filter(d=>d.status==='Draft').length,'📝','#d97706'],
          ['Avg Questions', Math.round(data.reduce((a,d)=>a+d.questions,0)/data.length),'❓','#7c3aed']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{background:c+'22'}}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='flex gap-3 mb-4 items-center flex-wrap'>
        <div className='flex gap-2'>
          {TYPES.map(t=>(
            <button key={t} onClick={()=>setFilterType(t)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${filterType===t?'text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              style={filterType===t?{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}:{}}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={openAdd}
          className='ml-auto px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          + Tambah Template
        </button>
      </div>

      {showForm && (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-red-200 mb-6'>
          <h3 className='font-bold text-gray-700 mb-4'>{editId?'Edit':'Tambah'} Template Kuesioner</h3>
          <div className='grid grid-cols-2 gap-4 mb-4'>
            <div className='col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Nama Template <span className='text-red-500'>*</span></label>
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            {[['Tipe','type',['Assessment','Evaluation','Survey']],
              ['Kategori','category',['Pre-Training','Post-Training','30-Day Follow Up','Annual','IDP','360-Degree']],
            ].map(([l,k,opts])=>(
              <div key={k}>
                <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{l}</label>
                <select value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
                  className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Jumlah Pertanyaan</label>
              <input type='number' value={form.questions} onChange={e=>setForm(p=>({...p,questions:Number(e.target.value)}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Target Pengguna <span className='text-red-500'>*</span></label>
              <input value={form.target} onChange={e=>setForm(p=>({...p,target:e.target.value}))}
                placeholder='All Courses / ILT / dll' className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div className='col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Deskripsi</label>
              <textarea value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} rows={2}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' />
            </div>
          </div>
          <div className='flex gap-3'>
            <button onClick={handleSave} className='px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>Simpan</button>
            <button onClick={()=>setShowForm(false)} className='px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>{t('Batal','Cancel')}</button>
          </div>
        </div>
      )}

      <div className='space-y-3'>
        {filtered.map(item=>(
          <div key={item.id} className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
            <div className='flex items-center gap-4 px-5 py-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='font-bold text-gray-800'>{item.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_COLORS[item.type]}`}>{item.type}</span>
                  <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>{item.category}</span>
                </div>
                <div className='text-xs text-gray-400 mt-0.5'>{item.questions} pertanyaan · Target: {item.target}</div>
              </div>
              <div className='flex items-center gap-2'>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.status==='Active'?'bg-green-50 text-green-700':item.status==='Draft'?'bg-yellow-50 text-yellow-700':'bg-gray-100 text-gray-500'}`}>{item.status}</span>
                <button onClick={()=>setExpandId(expandId===item.id?null:item.id)} className='px-2.5 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200'>
                  {expandId===item.id?'Tutup':'Detail'}
                </button>
                <button onClick={()=>openEdit(item)} className='px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100'>Edit</button>
                <button onClick={()=>toggleStatus(item.id)} className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${item.status==='Active'?'text-orange-600 bg-orange-50 hover:bg-orange-100':'text-green-600 bg-green-50 hover:bg-green-100'}`}>
                  {item.status==='Active'?'Nonaktifkan':'Aktifkan'}
                </button>
                <button onClick={()=>handleDelete(item.id)} className='px-2.5 py-1 text-xs font-semibold text-red-500 bg-red-50 rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
              </div>
            </div>
            {expandId===item.id && (
              <div className='border-t border-gray-100 px-5 py-4 bg-gray-50/50'>
                <p className='text-sm text-gray-600 mb-3'>{item.desc}</p>
                <div className='flex gap-3'>
                  <button className='px-4 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
                    🔍 Preview Kuesioner
                  </button>
                  <button className='px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100'>
                    📋 Kelola Pertanyaan
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
