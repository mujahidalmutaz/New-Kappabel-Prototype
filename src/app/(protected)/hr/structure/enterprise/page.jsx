'use client'
import { useState }           from 'react'
import { useStructureStore }  from '@/store/structureStore'
import { useT } from '@/store/languageStore'

const BLANK = { code:'', name:'', country:'Indonesia', industry:'', status:'Active' }

export default function EnterprisePage() {
  const t = useT()
  const { enterprises, addEnterprise, updateEnterprise, deleteEnterprise } = useStructureStore()
  const [form,    setForm   ] = useState(BLANK)
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleSave = () => {
    if (!form.code || !form.name) return flash(t('Kode dan nama wajib diisi.','Code and name are required.'),'error')
    if (editing) { updateEnterprise(editing, form); setEditing(null); flash(t('Enterprise diperbarui.','Enterprise updated.')) }
    else         { addEnterprise(form);              flash(t('Enterprise ditambahkan.','Enterprise added.')) }
    setForm(BLANK)
  }

  const handleEdit = (x) => { setEditing(x.id); setForm({ code:x.code, name:x.name, country:x.country, industry:x.industry, status:x.status }) }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Enterprise</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Level tertinggi struktur organisasi perusahaan.','Highest level of the organizational structure.')}</p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing ? '✏️ Edit' : `➕ ${t('Tambah','Add')}`} Enterprise</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[[t('Kode','Code'),'text','code'],[t('Nama Enterprise','Enterprise Name'),'text','name'],[t('Negara','Country'),'text','country'],[t('Industri','Industry'),'text','industry']].map(([lbl,type,key])=>(
              <div key={key}>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>{lbl}</label>
                <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
            ))}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90'
                style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
                {editing ? t('Simpan','Save') : t('Tambah','Add')}
              </button>
              {editing && <button onClick={()=>{setEditing(null);setForm(BLANK)}} className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('🌐 Daftar Enterprise','🌐 Enterprise List')}</h2>
          <table className='w-full text-sm'>
            <thead><tr className='bg-gray-50'>
              {[t('Kode','Code'),t('Nama','Name'),t('Negara','Country'),t('Industri','Industry'),'Status',t('Aksi','Action')].map((h,i)=>(
                <th key={i} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {enterprises.map(x=>(
                <tr key={x.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-2.5 font-mono text-xs text-gray-500'>{x.code}</td>
                  <td className='px-4 py-2.5 font-medium text-gray-700'>{x.name}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{x.country}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{x.industry||'-'}</td>
                  <td className='px-4 py-2.5'>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${x.status==='Active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{x.status}</span>
                  </td>
                  <td className='px-4 py-2.5'>
                    <div className='flex gap-2'>
                      <button onClick={()=>handleEdit(x)} className='px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                      <button onClick={()=>deleteEnterprise(x.id)} className='px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
