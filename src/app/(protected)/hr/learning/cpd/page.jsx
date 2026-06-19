'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const CPD_CATEGORIES = ['Formal Training','Certification','Self-Directed Learning','Mentoring/Coaching','Conference/Seminar','OJT/Project','External Course','Webinar']
const UNIT_TYPES     = ['Per Hour','Per Session','Per Completion','Per Day','Per Credit']
const STATUS_OPTS    = ['Active','Inactive']

const INIT = [
  { id:1, activity:'Classroom Training Internal', category:'Formal Training', points:1, unit:'Per Hour', max_points:40, description:'Training tatap muka yang diselenggarakan oleh L&D internal', status:'Active' },
  { id:2, activity:'Sertifikasi Profesi (BNSP/Internasional)', category:'Certification', points:10, unit:'Per Completion', max_points:30, description:'Mendapatkan sertifikat profesi resmi', status:'Active' },
  { id:3, activity:'E-Learning Course Selesai', category:'Self-Directed Learning', points:2, unit:'Per Completion', max_points:20, description:'Menyelesaikan course online mandiri', status:'Active' },
  { id:4, activity:'Menjadi Mentor/Coach', category:'Mentoring/Coaching', points:3, unit:'Per Session', max_points:15, description:'Kegiatan membimbing rekan kerja', status:'Active' },
  { id:5, activity:'Menghadiri Konferensi/Seminar', category:'Conference/Seminar', points:4, unit:'Per Day', max_points:20, description:'Menghadiri event pembelajaran eksternal', status:'Active' },
  { id:6, activity:'Webinar & Virtual Learning', category:'Webinar', points:1, unit:'Per Session', max_points:10, description:'Mengikuti webinar online', status:'Active' },
]

const EMPTY = { activity:'', category:'Formal Training', points:'1', unit:'Per Hour', max_points:'40', description:'', status:'Active' }

export default function MasterCPDPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.activity.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.activity) return flash(t('Nama aktivitas wajib diisi.','Activity name is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,points:Number(form.points),max_points:Number(form.max_points)}:d))
      flash(t('CPD rule diperbarui.','CPD rule updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,points:Number(form.points),max_points:Number(form.max_points)}])
      flash(t('CPD rule ditambahkan.','CPD rule added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ activity:item.activity, category:item.category, points:String(item.points), unit:item.unit, max_points:String(item.max_points), description:item.description, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('CPD rule dihapus.','CPD rule deleted.')) }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master CPD / Learning Credit Points','Master CPD / Learning Credit Points')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Aturan poin CPD (Continuing Professional Development) untuk setiap jenis aktivitas learning.','CPD (Continuing Professional Development) point rules for each type of learning activity.')}</p>


    </div>
  )
}
