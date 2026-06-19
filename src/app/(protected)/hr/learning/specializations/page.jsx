'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const STATUS_OPTS = ['Active','Inactive','Draft']

const INIT = [
  { id:1, name:'Leadership Mastery Track', category:'Leadership & Management', course_count:5, duration_weeks:12, target_role:'Manager & Above', enrolled:85, completion_rate:72, status:'Active' },
  { id:2, name:'HR Professional Development', category:'HR & People Management', course_count:7, duration_weeks:16, target_role:'HR Team', enrolled:35, completion_rate:60, status:'Active' },
  { id:3, name:'Finance & Accounting Excellence', category:'Finance & Accounting', course_count:6, duration_weeks:14, target_role:'Finance Team', enrolled:28, completion_rate:55, status:'Active' },
  { id:4, name:'Digital Transformation Journey', category:'Digital Literacy', course_count:8, duration_weeks:20, target_role:'All Employee', enrolled:120, completion_rate:40, status:'Active' },
  { id:5, name:'K3 & Safety Professional', category:'K3 & Safety', course_count:4, duration_weeks:8, target_role:'Operational Staff', enrolled:200, completion_rate:88, status:'Active' },
]

const EMPTY = { name:'', category:'Leadership & Management', course_count:'4', duration_weeks:'8', target_role:'', description:'', status:'Active' }

export default function SpecializationsPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name) return flash(t('Nama specialization wajib diisi.','Specialization name is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,course_count:Number(form.course_count),duration_weeks:Number(form.duration_weeks)}:d))
      flash(t('Specialization diperbarui.','Specialization updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,course_count:Number(form.course_count),duration_weeks:Number(form.duration_weeks),enrolled:0,completion_rate:0}])
      flash(t('Specialization ditambahkan.','Specialization added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, category:item.category, course_count:String(item.course_count), duration_weeks:String(item.duration_weeks), target_role:item.target_role, description:item.description||'', status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Specialization dihapus.','Specialization deleted.')) }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Specializations','Specializations')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Jalur spesialisasi pembelajaran — kumpulan course yang disusun menjadi satu jalur keahlian terstruktur.','Learning specialisation paths — a collection of courses structured into a single skill track.')}</p>


      {msg && <div className={`fixed bottom-6 right-6 text-xs px-4 py-3 rounded-xl shadow-lg ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
    </div>
  )
}
