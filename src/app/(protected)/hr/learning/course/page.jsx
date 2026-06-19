'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const COURSE_TYPES    = ['Instructor Led Training (ILT)','Self-Paced','Blended Learning']
const ENROLL_TYPES    = ['Open Enrollment','Required Assignment','Recommendation','By Invitation']
const CATEGORIES      = ['Leadership & Management','Technical Skills','Compliance & Regulasi','Soft Skills','K3 & Safety','Digital Literacy','HR & People Management','Finance & Accounting','Sales & Marketing']
const STATUS_OPTS     = ['Active','Inactive','Draft','Archived']

const INIT = [
  { id:1, title:'K3 & Keselamatan Kerja Dasar', category:'K3 & Safety', type:'Instructor Led Training (ILT)', duration_hours:8, instructor:'PT Training Excellence', enrollment:'Required Assignment', content_count:5, enrolled:120, status:'Active' },
  { id:2, title:'Leadership Fundamentals Level 1', category:'Leadership & Management', type:'Blended Learning', duration_hours:24, instructor:'Budi Santoso', enrollment:'Open Enrollment', content_count:12, enrolled:85, status:'Active' },
  { id:3, title:'Excel Advanced for HR', category:'Digital Literacy', type:'Self-Paced', duration_hours:6, instructor:'Sari Dewi', enrollment:'Open Enrollment', content_count:8, enrolled:210, status:'Active' },
  { id:4, title:'GCG & Compliance Certification', category:'Compliance & Regulasi', type:'Blended Learning', duration_hours:16, instructor:'Ahmad Fauzi', enrollment:'Required Assignment', content_count:10, enrolled:456, status:'Active' },
  { id:5, title:'Digital Marketing Fundamentals', category:'Sales & Marketing', type:'Self-Paced', duration_hours:12, instructor:'Online Platform', enrollment:'Open Enrollment', content_count:15, enrolled:67, status:'Draft' },
]

const EMPTY = { title:'', category:'Leadership & Management', type:'Instructor Led Training (ILT)', duration_hours:'8', instructor:'', enrollment:'Open Enrollment', description:'', status:'Active' }

export default function CoursePage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }

  const filtered = data.filter(d =>
    (filterType==='All' || d.type===filterType) &&
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = () => {
    if (!form.title) return flash(t('Judul course wajib diisi.','Course title is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,duration_hours:Number(form.duration_hours)}:d))
      flash(t('Course diperbarui.','Course updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,duration_hours:Number(form.duration_hours),content_count:0,enrolled:0}])
      flash(t('Course ditambahkan.','Course added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ title:item.title, category:item.category, type:item.type, duration_hours:String(item.duration_hours), instructor:item.instructor, enrollment:item.enrollment, description:item.description||'', status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Course dihapus.','Course deleted.')) }

  const typeColor = (t) => t==='Instructor Led Training (ILT)'?'bg-blue-50 text-blue-700':t==='Self-Paced'?'bg-green-50 text-green-700':'bg-red-50 text-red-700'
  const typeShort = (t) => t==='Instructor Led Training (ILT)'?'ILT':t==='Self-Paced'?'Self-Paced':'Blended'

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Course Management','Course Management')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Modul utama untuk membuat dan mengelola course/training di LMS.','Main module for creating and managing courses/training in the LMS.')}</p>


    </div>
  )
}
