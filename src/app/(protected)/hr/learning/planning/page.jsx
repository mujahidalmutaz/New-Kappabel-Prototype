'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const PLAN_TYPES  = ['Individual Development Plan','Team Learning Plan','Mandatory Training Program','Onboarding Program','Succession Development Plan']
const STATUS_OPTS = ['Draft','Published','In Progress','Completed','Archived']

const INIT = [
  { id:1, plan_name:'Mandatory K3 Annual Program 2025', type:'Mandatory Training Program', target:'All Employee', course_count:3, start_date:'2025-01-01', end_date:'2025-12-31', completion_rate:68, status:'In Progress' },
  { id:2, plan_name:'New Employee Onboarding 2025 Q3', type:'Onboarding Program', target:'New Hire Q3 2025', course_count:7, start_date:'2025-07-01', end_date:'2025-09-30', completion_rate:45, status:'In Progress' },
  { id:3, plan_name:'Manager Leadership Development 2025', type:'Team Learning Plan', target:'Manager Grade 6-9', course_count:5, start_date:'2025-04-01', end_date:'2025-12-31', completion_rate:30, status:'In Progress' },
  { id:4, plan_name:'GCG Compliance Recertification 2025', type:'Mandatory Training Program', target:'All Employee', course_count:2, start_date:'2025-09-01', end_date:'2025-10-31', completion_rate:0, status:'Draft' },
  { id:5, plan_name:'IT Digital Upskilling Program', type:'Team Learning Plan', target:'IT Division', course_count:8, start_date:'2025-06-01', end_date:'2025-12-31', completion_rate:22, status:'In Progress' },
]

const EMPTY = { plan_name:'', type:'Mandatory Training Program', target:'', course_count:'3', start_date:'', end_date:'', description:'', status:'Draft' }

export default function MasterLearningPlanningPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.plan_name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.plan_name) return flash(t('Nama program wajib diisi.','Programme name is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,course_count:Number(form.course_count)}:d))
      flash(t('Program diperbarui.','Programme updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,course_count:Number(form.course_count),completion_rate:0}])
      flash(t('Program ditambahkan.','Programme added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ plan_name:item.plan_name, type:item.type, target:item.target, course_count:String(item.course_count), start_date:item.start_date, end_date:item.end_date, description:item.description||'', status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Program dihapus.','Programme deleted.')) }

  const statusColor = (s) => ({ Draft:'bg-gray-100 text-gray-500', Published:'bg-blue-50 text-blue-700', 'In Progress':'bg-yellow-50 text-yellow-700', Completed:'bg-green-50 text-green-700', Archived:'bg-gray-100 text-gray-400' }[s])

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Learning Planning','Master Learning Planning')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Susun program dan rencana pembelajaran karyawan — IDP, mandatory training, onboarding, dan succession plan.','Build employee learning programmes and plans — IDP, mandatory training, onboarding, and succession planning.')}</p>


    </div>
  )
}
