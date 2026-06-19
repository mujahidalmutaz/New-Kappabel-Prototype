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


    </div>
  )
}
