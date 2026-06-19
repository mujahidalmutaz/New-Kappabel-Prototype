'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'
import { useCourseBatchStore } from '@/store/courseBatchStore'

const METHODS      = ['Instructor Led Training (ILT)','Self-Paced','Blended Learning','Virtual ILT (Webinar)']
const STATUS_OPTS  = ['Open','In Progress','Completed','Cancelled','Full']

const EMPTY = { batch_name:'', course:'', method:'Instructor Led Training (ILT)', start_date:'', end_date:'', instructor:'', location:'', capacity:'30', status:'Open' }

export default function CourseBatchPage() {
  const t = useT()
  const { batches, addBatch, updateBatch, deleteBatch } = useCourseBatchStore()
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = batches.filter(d => d.batch_name.toLowerCase().includes(search.toLowerCase()) || d.course.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.batch_name || !form.course) return flash(t('Nama batch dan course wajib diisi.','Batch name and course are required.'), 'error')
    if (editing) {
      updateBatch(editing, { ...form, capacity: Number(form.capacity) })
      flash(t('Batch diperbarui.','Batch updated.')); setEditing(null)
    } else {
      addBatch({ ...form, capacity: Number(form.capacity) })
      flash(t('Batch ditambahkan.','Batch added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ batch_name:item.batch_name, course:item.course, method:item.method, start_date:item.start_date, end_date:item.end_date, instructor:item.instructor, location:item.location, capacity:String(item.capacity), status:item.status }) }
  const handleDelete = (id) => { deleteBatch(id); flash(t('Batch dihapus.','Batch deleted.')) }

  const statusColor = (s) => ({ Open:'bg-green-50 text-green-700', 'In Progress':'bg-blue-50 text-blue-700', Completed:'bg-gray-100 text-gray-600', Cancelled:'bg-red-50 text-red-700', Full:'bg-yellow-50 text-yellow-700' }[s])

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Course — Batch & Activities','Course — Batch & Activities')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Pengelolaan batch/sesi pelaksanaan course — jadwal, instruktur, lokasi, metode, dan peserta.','Manage course batches/sessions — schedule, instructor, location, method, and participants.')}</p>


    </div>
  )
}
