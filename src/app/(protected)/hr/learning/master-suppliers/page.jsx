'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const VENDOR_TYPES = ['Training Provider','Consultant','E-Learning Platform','Certification Body','University/Academia']
const STATUS_OPTS  = ['Active','Inactive','Blacklisted']

const INIT = [
  { id:1, name:'PT Training Excellence Indonesia', type:'Training Provider', contact:'Budi Rahayu', email:'budi@trainex.co.id', phone:'021-5555-1234', specialization:'K3, Leadership, Compliance', contract_end:'2025-12-31', status:'Active' },
  { id:2, name:'Coursera for Business', type:'E-Learning Platform', contact:'CS Team', email:'business@coursera.org', phone:'-', specialization:'Digital Skills, Technology, Management', contract_end:'2025-06-30', status:'Active' },
  { id:3, name:'PPM Manajemen', type:'Consultant', contact:'Dewi Sari', email:'dewi@ppm.ac.id', phone:'021-3456789', specialization:'Leadership, Project Management, HR', contract_end:'2024-12-31', status:'Active' },
  { id:4, name:'BNSP / Badan Nasional', type:'Certification Body', contact:'Admin BNSP', email:'info@bnsp.go.id', phone:'021-123456', specialization:'Sertifikasi Profesi Nasional', contract_end:'-', status:'Active' },
]

const EMPTY = { name:'', type:'Training Provider', contact:'', email:'', phone:'', specialization:'', contract_end:'', status:'Active' }

export default function MasterSuppliersPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name || !form.email) return flash('Nama dan email wajib diisi.', 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form}:d))
      flash('Supplier diperbarui.'); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form}])
      flash('Supplier ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, type:item.type, contact:item.contact, email:item.email, phone:item.phone, specialization:item.specialization, contract_end:item.contract_end, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('Supplier dihapus.') }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Training Suppliers</h1>
      <p className='text-gray-500 text-sm mb-6'>Data vendor/provider training eksternal, konsultan, dan platform e-learning.</p>

      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[['Total Supplier', data.length, '🤝', '#8B1A1A'],['Active', data.filter(d=>d.status==='Active').length, '✅', '#059669'],['Kontrak Aktif', data.filter(d=>d.contract_end&&d.contract_end>new Date().toISOString().slice(0,10)).length, '📄', '#7c3aed']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit Supplier':'➕ Tambah Supplier'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Perusahaan/Vendor','name'],['Contact Person','contact'],['Email','email'],['Phone','phone'],['Spesialisasi','specialization']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Akhir Kontrak</label>
              <input type='date' value={form.contract_end} onChange={e=>setForm(f=>({...f,contract_end:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            {[['Tipe Vendor','type',VENDOR_TYPES],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
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
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari supplier...'
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Nama','Tipe','Contact','Spesialisasi','Akhir Kontrak','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5 font-medium text-gray-700'>{d.name}</td>
                  <td className='px-3 py-2.5'><span className='text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold'>{d.type}</span></td>
                  <td className='px-3 py-2.5 text-gray-500 text-xs'>{d.contact}</td>
                  <td className='px-3 py-2.5 text-gray-500 text-xs max-w-28 truncate'>{d.specialization}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.contract_end}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status==='Active'?'bg-green-50 text-green-700':d.status==='Blacklisted'?'bg-red-50 text-red-700':'bg-gray-100 text-gray-500'}`}>{d.status}</span></td>
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
