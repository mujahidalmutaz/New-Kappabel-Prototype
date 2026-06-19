'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const ROOM_TYPES   = ['Physical','Virtual','Hybrid']
const STATUS_OPTS  = ['Available','In Use','Maintenance','Inactive']

const INIT = [
  { id:1, name:'Ruang Training A - Lantai 3', location:'Gedung Utama Lt.3', capacity:30, type:'Physical', facilities:'Projector, AC, Whiteboard, Sound System', status:'Available' },
  { id:2, name:'Ruang Training B - Lantai 3', location:'Gedung Utama Lt.3', capacity:20, type:'Physical', facilities:'TV LED, AC, Whiteboard', status:'Available' },
  { id:3, name:'Virtual Room - Zoom Enterprise', location:'Online', capacity:100, type:'Virtual', facilities:'Zoom Meeting, Recording, Breakout Room', status:'Available' },
  { id:4, name:'Hybrid Room - Auditorium', location:'Gedung Serbaguna', capacity:150, type:'Hybrid', facilities:'Stage, Projector, Livestream, Mic', status:'Available' },
  { id:5, name:'Lab Komputer IT', location:'Gedung IT Lt.2', capacity:25, type:'Physical', facilities:'Komputer, Projector, AC, Internet', status:'Maintenance' },
]

const EMPTY = { name:'', location:'', capacity:'', type:'Physical', facilities:'', status:'Available' }

export default function MasterClassroomPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name || !form.capacity) return flash(t('Nama dan kapasitas wajib diisi.','Name and capacity are required.'), 'error')
    if (editing) {
      setData(prev => prev.map(d => d.id===editing ? {...d,...form} : d))
      flash(t('Classroom diperbarui.','Classroom updated.')); setEditing(null)
    } else {
      setData(prev => [...prev, { id:Date.now(), ...form }])
      flash(t('Classroom ditambahkan.','Classroom added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, location:item.location, capacity:item.capacity, type:item.type, facilities:item.facilities, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Classroom dihapus.','Classroom deleted.')) }

  const statusColor = (s) => ({ Available:'bg-green-50 text-green-700', 'In Use':'bg-blue-50 text-blue-700', Maintenance:'bg-yellow-50 text-yellow-700', Inactive:'bg-gray-100 text-gray-500' }[s] || 'bg-gray-100 text-gray-500')

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Classroom','Master Classroom')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Data ruangan training fisik, virtual, maupun hybrid.','Data for physical, virtual, and hybrid training rooms.')}</p>


    </div>
  )
}
