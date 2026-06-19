'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const TARGET_TYPES  = ['Division','Position','Grade','Region/Location','Custom Group','All Employee','New Hire']
const ASSIGN_TYPES  = ['Mandatory','Optional','Recommendation']
const STATUS_OPTS   = ['Active','Inactive','Archived']

const INIT = [
  { id:1, name:'Cohort K3 Mandatory - All Employee', target_type:'All Employee', target_value:'Semua Karyawan', member_count:850, assignment:'Mandatory', linked_course:'K3 & Keselamatan Kerja Dasar', status:'Active' },
  { id:2, name:'Cohort New Hire Onboarding 2025', target_type:'New Hire', target_value:'Karyawan Baru Join 2025', member_count:42, assignment:'Mandatory', linked_course:'New Employee Orientation Program', status:'Active' },
  { id:3, name:'Cohort Leadership - Manager & Above', target_type:'Grade', target_value:'Grade 6, 7, 8, 9', member_count:120, assignment:'Mandatory', linked_course:'Leadership Fundamentals Level 1', status:'Active' },
  { id:4, name:'Cohort HR Team Development', target_type:'Division', target_value:'Human Resources Division', member_count:35, assignment:'Mandatory', linked_course:'HR Advanced Training Program', status:'Active' },
  { id:5, name:'Cohort IT Digital Upskilling', target_type:'Division', target_value:'IT & Digital Division', member_count:65, assignment:'Optional', linked_course:'Digital Literacy Program', status:'Active' },
]

const EMPTY = { name:'', target_type:'Division', target_value:'', member_count:'0', assignment:'Mandatory', linked_course:'', status:'Active' }

export default function MasterCohortPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name) return flash(t('Nama cohort wajib diisi.','Cohort name is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,member_count:Number(form.member_count)}:d))
      flash(t('Cohort diperbarui.','Cohort updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,member_count:Number(form.member_count)}])
      flash(t('Cohort ditambahkan.','Cohort added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, target_type:item.target_type, target_value:item.target_value, member_count:String(item.member_count), assignment:item.assignment, linked_course:item.linked_course, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Cohort dihapus.','Cohort deleted.')) }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Cohort','Master Cohort')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Pengelompokan learner berdasarkan divisi, jabatan, grade, lokasi, atau kriteria tertentu untuk assignment training massal.','Group learners by division, position, grade, location, or specific criteria for mass training assignment.')}</p>


    </div>
  )
}
