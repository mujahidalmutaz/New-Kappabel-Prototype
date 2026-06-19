'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const CHANNELS   = ['Email','Push Notification','In-App','SMS']
const TRIGGERS   = ['Training Assignment','Training Reminder (3 Days Before)','Training Reminder (1 Day Before)','Training Overdue','Course Completion','Certificate Available','Assessment Due','Approval Request','Approval Approved','Approval Rejected','CPD Milestone']
const STATUS_OPTS = ['Active','Inactive']

const INIT = [
  { id:1, name:'Training Assignment Notification', channel:'Email', trigger:'Training Assignment', subject:'[Training] Anda Ditugaskan ke Training: {{course_name}}', body_preview:'Halo {{learner_name}}, Anda telah ditugaskan untuk mengikuti training {{course_name}}...', status:'Active' },
  { id:2, name:'Training Reminder H-3', channel:'Email', trigger:'Training Reminder (3 Days Before)', subject:'[Reminder] Training {{course_name}} dimulai 3 hari lagi', body_preview:'Halo {{learner_name}}, Ingatkan bahwa training {{course_name}} akan dimulai pada {{training_date}}...', status:'Active' },
  { id:3, name:'Course Completion Certificate', channel:'Email', trigger:'Course Completion', subject:'🎓 Selamat! Sertifikat {{course_name}} Anda Telah Tersedia', body_preview:'Selamat {{learner_name}}! Anda telah menyelesaikan {{course_name}}. Sertifikat Anda dapat diunduh di...', status:'Active' },
  { id:4, name:'Training Overdue Alert', channel:'Push Notification', trigger:'Training Overdue', subject:'⚠️ Training Overdue: {{course_name}}', body_preview:'Training {{course_name}} telah melewati batas waktu. Segera selesaikan sebelum terkena konsekuensi...', status:'Active' },
  { id:5, name:'Approval Training Request', channel:'Email', trigger:'Approval Request', subject:'[Approval Diperlukan] Permintaan Training oleh {{employee_name}}', body_preview:'Halo {{approver_name}}, {{employee_name}} mengajukan permintaan training {{course_name}}. Mohon review...', status:'Active' },
]

const EMPTY = { name:'', channel:'Email', trigger:'Training Assignment', subject:'', body_preview:'', status:'Active' }

export default function NotificationTemplatePage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.name || !form.subject) return flash(t('Nama template dan subject wajib diisi.','Template name and subject are required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form}:d))
      flash(t('Template diperbarui.','Template updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form}])
      flash(t('Template ditambahkan.','Template added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ name:item.name, channel:item.channel, trigger:item.trigger, subject:item.subject, body_preview:item.body_preview, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Template dihapus.','Template deleted.')) }

  const channelColor = (c) => ({ Email:'bg-blue-50 text-blue-700', 'Push Notification':'bg-red-50 text-red-700', 'In-App':'bg-green-50 text-green-700', SMS:'bg-orange-50 text-orange-700' }[c])

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Notification Template','Master Notification Template')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Template notifikasi LMS standar untuk email, push notification, in-app, dan SMS.','Standard LMS notification templates for email, push notifications, in-app, and SMS.')}</p>
      <p className='text-xs text-gray-400 mb-6'>Variabel yang tersedia: {'{{learner_name}}'}, {'{{course_name}}'}, {'{{training_date}}'}, {'{{due_date}}'}, {'{{approver_name}}'}, {'{{employee_name}}'}</p>


    </div>
  )
}
