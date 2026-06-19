'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const COMM_TYPES  = ['Open','Closed','Invitation Only']
const STATUS_OPTS = ['Active','Inactive','Archived']

const INIT = [
  { id:1, name:'Data & Analytics Community', category:'Digital Literacy', type:'Open', facilitator:'Budi Santoso', member_count:87, post_count:234, status:'Active', created:'2024-01-15' },
  { id:2, name:'Leadership Development Group', category:'Leadership & Management', type:'Closed', facilitator:'Sari Dewi', member_count:45, post_count:156, status:'Active', created:'2024-02-01' },
  { id:3, name:'HR Innovation Network', category:'HR & People Management', type:'Open', facilitator:'Ahmad Fauzi', member_count:62, post_count:189, status:'Active', created:'2024-03-10' },
  { id:4, name:'K3 Safety Champions', category:'K3 & Safety', type:'Open', facilitator:'Tim K3', member_count:120, post_count:312, status:'Active', created:'2024-01-20' },
  { id:5, name:'Finance Discussion Forum', category:'Finance & Accounting', type:'Closed', facilitator:'Dewi Sari', member_count:38, post_count:95, status:'Active', created:'2024-04-05' },
]

const EMPTY = { name:'', category:'Leadership & Management', type:'Open', facilitator:'', description:'', status:'Active' }

export default function LearningCommunitiesPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name) return flash(t('Nama komunitas wajib diisi.','Community name is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form}:d))
      flash(t('Komunitas diperbarui.','Community updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,member_count:0,post_count:0,created:new Date().toISOString().slice(0,10)}])
      flash(t('Komunitas ditambahkan.','Community added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, category:item.category, type:item.type, facilitator:item.facilitator, description:item.description||'', status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Komunitas dihapus.','Community deleted.')) }

  const CATEGORIES = ['Leadership & Management','Technical Skills','Compliance & Regulasi','Soft Skills','K3 & Safety','Digital Literacy','HR & People Management','Finance & Accounting']

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Learning Communities','Master Learning Communities')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Kelola komunitas pembelajaran — forum diskusi, knowledge sharing, dan kolaborasi antar karyawan.','Manage learning communities — discussion forums, knowledge sharing, and employee collaboration.')}</p>


    </div>
  )
}
