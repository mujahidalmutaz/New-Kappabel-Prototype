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

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Template', data.length, '📧', '#8B1A1A'],['Email', data.filter(d=>d.channel==='Email').length, '✉️', '#2563eb'],['Push Notif', data.filter(d=>d.channel==='Push Notification').length, '📲', '#7c3aed'],['Active', data.filter(d=>d.status==='Active').length, '✅', '#059669']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?t('✏️ Edit Template','✏️ Edit Template'):`➕ ${t('Tambah Template','Add Template')}`}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Template</label>
              <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Subject / Judul</label>
              <input value={form.subject} onChange={e=>setForm(f=>({...f,subject:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            {[['Channel','channel',CHANNELS],['Trigger Event','trigger',TRIGGERS],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {opts.map(o=><option key={o}>{o}</option>)}</select></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Preview Isi Pesan</label>
              <textarea rows={4} value={form.body_preview} onChange={e=>setForm(f=>({...f,body_preview:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' /></div>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{editing?t('Simpan','Save'):t('Tambah','Add')}</button>
              {editing && <button onClick={()=>{setEditing(null);setForm(EMPTY)}} className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Cari template...','Search template...')}
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='flex flex-col gap-3'>
            {filtered.map(d=>(
              <div key={d.id} className='border border-gray-200 rounded-xl p-4 hover:border-red-300 transition'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${channelColor(d.channel)}`}>{d.channel}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status==='Active'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{d.status}</span>
                    </div>
                    <div className='font-semibold text-gray-700 text-sm'>{d.name}</div>
                    <div className='text-xs text-gray-500 mt-1'>Trigger: {d.trigger}</div>
                    <div className='text-xs font-medium text-gray-600 mt-1 truncate'>{d.subject}</div>
                    <div className='text-xs text-gray-400 mt-1 line-clamp-2'>{d.body_preview}</div>
                  </div>
                  <div className='flex flex-col gap-1'>
                    <button onClick={()=>handleEdit(d)} className='px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                    <button onClick={()=>handleDelete(d.id)} className='px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
