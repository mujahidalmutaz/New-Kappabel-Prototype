'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const ASSESS_TYPES = ['Pre-Test','Post-Test','Quiz','Assignment','Certification Exam','Knowledge Check']
const STATUS_OPTS  = ['Active','Inactive','Draft']

const INIT = [
  { id:1, title:'Pre-Test K3 Dasar', type:'Pre-Test', questions:20, passing_score:70, duration:30, randomize:true, status:'Active', course:'K3 & Keselamatan Kerja' },
  { id:2, title:'Post-Test Leadership Level 1', type:'Post-Test', questions:30, passing_score:75, duration:45, randomize:true, status:'Active', course:'Leadership Fundamentals' },
  { id:3, title:'Quiz Excel Advanced', type:'Quiz', questions:15, passing_score:60, duration:20, randomize:false, status:'Active', course:'Excel Advanced for HR' },
  { id:4, title:'Assignment OJT Report', type:'Assignment', questions:5, passing_score:70, duration:0, randomize:false, status:'Active', course:'On-the-Job Training Program' },
  { id:5, title:'Certification Exam Compliance GCG', type:'Certification Exam', questions:50, passing_score:80, duration:90, randomize:true, status:'Draft', course:'GCG Compliance Certification' },
]

const EMPTY = { title:'', type:'Pre-Test', questions:'20', passing_score:'70', duration:'30', randomize:false, course:'', status:'Active' }

export default function MasterAssessmentPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.title.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.title) return flash(t('Judul assessment wajib diisi.','Assessment title is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,questions:Number(form.questions),passing_score:Number(form.passing_score),duration:Number(form.duration)}:d))
      flash(t('Assessment diperbarui.','Assessment updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,questions:Number(form.questions),passing_score:Number(form.passing_score),duration:Number(form.duration)}])
      flash(t('Assessment ditambahkan.','Assessment added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ title:item.title, type:item.type, questions:String(item.questions), passing_score:String(item.passing_score), duration:String(item.duration), randomize:item.randomize, course:item.course, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Assessment dihapus.','Assessment deleted.')) }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Assessment','Master Assessment')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Kelola Pre-Test, Post-Test, Quiz, Assignment, dan Certification Exam.','Manage Pre-Tests, Post-Tests, Quizzes, Assignments, and Certification Exams.')}</p>


    </div>
  )
}
