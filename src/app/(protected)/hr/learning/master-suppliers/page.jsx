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
    if (!form.name || !form.email) return flash(t('Nama dan email wajib diisi.','Name and email are required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form}:d))
      flash(t('Supplier diperbarui.','Supplier updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form}])
      flash(t('Supplier ditambahkan.','Supplier added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, type:item.type, contact:item.contact, email:item.email, phone:item.phone, specialization:item.specialization, contract_end:item.contract_end, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Supplier dihapus.','Supplier deleted.')) }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Training Suppliers','Master Training Suppliers')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Data vendor/provider training eksternal, konsultan, dan platform e-learning.','Data for external training vendors, consultants, and e-learning platforms.')}</p>


    </div>
  )
}
