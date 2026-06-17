'use client'
import { useState }          from 'react'
import { useStructureStore } from '@/store/structureStore'
import { useT } from '@/store/languageStore'

const BLANK = { divisionId:'', code:'', companyCode:'', name:'', legalEntity:'PT', country:'Indonesia', status:'Active' }

const COUNTRIES = [
  'Indonesia',
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Brazil', 'Brunei', 'Cambodia', 'Canada', 'Chile', 'China',
  'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Egypt', 'Finland', 'France',
  'Germany', 'Ghana', 'Greece', 'Hong Kong', 'Hungary', 'India', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kenya', 'Kuwait', 'Laos',
  'Lebanon', 'Libya', 'Luxembourg', 'Malaysia', 'Mexico', 'Morocco', 'Myanmar',
  'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palestine',
  'Papua New Guinea', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea',
  'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand',
  'Timor-Leste', 'Tunisia', 'Turkey', 'Ukraine', 'United Arab Emirates',
  'United Kingdom', 'United States', 'Venezuela', 'Vietnam', 'Yemen',
]

export default function CompanyPage() {
  const t = useT()
  const { divisions, companies, addCompany, updateCompany, deleteCompany } = useStructureStore()
  const [form,    setForm   ] = useState(BLANK)
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleSave = () => {
    if (!form.divisionId || !form.code || !form.name) return flash(t('Division, kode, dan nama wajib diisi.','Division, code, and name are required.'),'error')
    if (form.companyCode && form.companyCode.length > 3) return flash(t('Company Code maksimal 3 karakter.','Company Code maximum 3 characters.'),'error')
    if (editing) {
      updateCompany(editing, {...form, divisionId:+form.divisionId})
      setEditing(null); flash(t('Company diperbarui.','Company updated.'))
    } else {
      addCompany({...form, divisionId:+form.divisionId})
      flash(t('Company ditambahkan.','Company added.'))
    }
    setForm(BLANK)
  }

  const handleEdit = (x) => {
    setEditing(x.id)
    setForm({ divisionId:x.divisionId, code:x.code, companyCode:x.companyCode||'', name:x.name, legalEntity:x.legalEntity, country:x.country, status:x.status })
  }

  const divName = (id) => divisions.find(d=>d.id===id)?.name || '-'

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Company</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Entitas legal perusahaan di bawah Division.','Legal entity of the company under Division.')}</p>

      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-xs text-gray-400 mb-6'>
        <span className='px-2.5 py-1'>Enterprise</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Division</span>
        <span>→</span>
        <span className='bg-red-600 text-white font-semibold px-2.5 py-1 rounded-full'>Company</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Business Unit</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Department</span>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit':`➕ ${t('Tambah','Add')}`} Company</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Division</label>
              <select value={form.divisionId} onChange={e=>setForm(f=>({...f,divisionId:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>-- Pilih Division --</option>
                {divisions.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {[[t('Kode','Code'),'code'],[t('Nama Company','Company Name'),'name']].map(([lbl,key])=>(
              <div key={key}>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>{lbl}</label>
                <input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
            ))}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Negara','Country')}</label>
              <select value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {COUNTRIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>
                Company Code
                <span className='ml-1 font-normal text-gray-400'>{t('(maks. 3 karakter)','(max. 3 characters)')}</span>
              </label>
              <div className='relative'>
                <input
                  value={form.companyCode}
                  onChange={e => setForm(f => ({ ...f, companyCode: e.target.value.toUpperCase().slice(0, 3) }))}
                  maxLength={3}
                  placeholder='mis. JKT'
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 pr-10 font-mono tracking-widest uppercase'
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold ${form.companyCode.length === 3 ? 'text-red-500' : 'text-gray-300'}`}>
                  {form.companyCode.length}/3
                </span>
              </div>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Legal Entity</label>
              <select value={form.legalEntity} onChange={e=>setForm(f=>({...f,legalEntity:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {['PT','CV','Yayasan','Koperasi','PMA'].map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
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
                {editing?t('Simpan','Save'):t('Tambah','Add')}
              </button>
              {editing && <button onClick={()=>{setEditing(null);setForm(BLANK)}}
                className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{t('🏠 Daftar Company','🏠 Company List')}</h2>
          <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='bg-gray-50'>
              {[t('Kode','Code'),'Co. Code',t('Nama Company','Company Name'),'Division','Legal',t('Negara','Country'),'Status',t('Aksi','Action')].map((h,i)=>(
                <th key={i} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {companies.length ? companies.map(x=>(
                <tr key={x.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-2.5 font-mono text-xs text-gray-500'>{x.code}</td>
                  <td className='px-4 py-2.5'>
                    {x.companyCode
                      ? <span className='font-mono font-bold text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded tracking-widest'>{x.companyCode}</span>
                      : <span className='text-gray-300 text-xs'>—</span>}
                  </td>
                  <td className='px-4 py-2.5 font-medium text-gray-700'>{x.name}</td>
                  <td className='px-4 py-2.5 text-xs text-gray-500'>{divName(x.divisionId)}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{x.legalEntity}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{x.country}</td>
                  <td className='px-4 py-2.5'>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${x.status==='Active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{x.status}</span>
                  </td>
                  <td className='px-4 py-2.5'>
                    <div className='flex gap-2'>
                      <button onClick={()=>handleEdit(x)} className='px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                      <button onClick={()=>deleteCompany(x.id)} className='px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className='px-4 py-8 text-center text-gray-400 text-sm'>{t('Belum ada company.','No companies yet.')}</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  )
}
