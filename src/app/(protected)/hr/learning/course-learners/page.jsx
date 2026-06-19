'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const ASSIGN_TYPES  = ['Required','Voluntary','Recommendation']
const LEARN_STATUS  = ['Not Started','In Progress','Completed','Overdue','Withdrawn']

const INIT = [
  { id:1, learner:'Ahmad Fauzi', nik:'EMP001', course:'K3 & Keselamatan Kerja Dasar', batch:'Batch 2 - Mar 2025', assignment:'Required', enrolled:'2025-02-15', due:'2025-03-31', completed:'2025-03-10', progress:100, score:85, status:'Completed' },
  { id:2, learner:'Dewi Sari', nik:'EMP002', course:'Leadership Fundamentals Level 1', batch:'Batch 1 - Q2 2025', assignment:'Recommendation', enrolled:'2025-04-01', due:'2025-05-31', completed:'', progress:65, score:null, status:'In Progress' },
  { id:3, learner:'Budi Rahayu', nik:'EMP003', course:'K3 & Keselamatan Kerja Dasar', batch:'Batch 1 - Jan 2025', assignment:'Required', enrolled:'2025-01-05', due:'2025-01-31', completed:'2025-01-15', progress:100, score:92, status:'Completed' },
  { id:4, learner:'Siti Nurhaliza', nik:'EMP004', course:'Excel Advanced for HR', batch:'Batch 1 - Juli 2025', assignment:'Voluntary', enrolled:'2025-07-01', due:'2025-07-31', completed:'', progress:30, score:null, status:'In Progress' },
  { id:5, learner:'Rizky Pratama', nik:'EMP005', course:'GCG & Compliance Certification', batch:'Batch 1 - Agt 2025', assignment:'Required', enrolled:'2025-08-01', due:'2025-08-31', completed:'', progress:0, score:null, status:'Not Started' },
  { id:6, learner:'Maya Indah', nik:'EMP006', course:'Leadership Fundamentals Level 1', batch:'Batch 1 - Q2 2025', assignment:'Required', enrolled:'2025-03-20', due:'2025-04-30', completed:'', progress:45, score:null, status:'Overdue' },
]

const EMPTY = { learner:'', nik:'', course:'', batch:'', assignment:'Required', enrolled:'', due:'', status:'Not Started' }

export default function CourseLearnersPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterAssign, setFilterAssign] = useState('All')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }

  const filtered = data.filter(d =>
    (filterStatus==='All' || d.status===filterStatus) &&
    (filterAssign==='All' || d.assignment===filterAssign) &&
    (d.learner.toLowerCase().includes(search.toLowerCase()) || d.course.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSave = () => {
    if (!form.learner || !form.course) return flash(t('Nama learner dan course wajib diisi.','Learner name and course are required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form}:d))
      flash(t('Data learner diperbarui.','Learner data updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,progress:0,score:null,completed:''}])
      flash(t('Learner ditambahkan.','Learner added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ learner:item.learner, nik:item.nik, course:item.course, batch:item.batch, assignment:item.assignment, enrolled:item.enrolled, due:item.due, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Learner dihapus dari course.','Learner removed from course.')) }

  const statusColor = (s) => ({ 'Not Started':'bg-gray-100 text-gray-500', 'In Progress':'bg-blue-50 text-blue-700', Completed:'bg-green-50 text-green-700', Overdue:'bg-red-50 text-red-700', Withdrawn:'bg-orange-50 text-orange-700' }[s])
  const assignColor = (a) => ({ Required:'bg-red-50 text-red-700', Voluntary:'bg-blue-50 text-blue-700', Recommendation:'bg-yellow-50 text-yellow-700' }[a])

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Course — Learners Management','Course — Learners Management')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Kelola peserta course — assignment, progress, completion, dan mass action.','Manage course participants — assignment, progress, completion, and mass actions.')}</p>


    </div>
  )
}
