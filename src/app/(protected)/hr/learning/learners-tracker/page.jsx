'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const TRACK_STATUS = ['Not Started','In Progress','Completed','Overdue','Withdrawn']

const INIT = [
  { id:1, learner:'Ahmad Fauzi', nik:'EMP001', dept:'Finance', course:'GCG & Compliance Certification', assigned_by:'L&D Admin', assigned:'2025-07-01', due:'2025-09-30', completed:'', progress:25, score:null, status:'In Progress' },
  { id:2, learner:'Dewi Sari', nik:'EMP002', dept:'HR', course:'Leadership Fundamentals Level 1', assigned_by:'Manager', assigned:'2025-04-01', due:'2025-05-31', completed:'2025-05-28', progress:100, score:88, status:'Completed' },
  { id:3, learner:'Budi Rahayu', nik:'EMP003', dept:'Operations', course:'K3 & Keselamatan Kerja Dasar', assigned_by:'Cohort Rule', assigned:'2025-01-01', due:'2025-01-31', completed:'2025-01-15', progress:100, score:90, status:'Completed' },
  { id:4, learner:'Siti Nurhaliza', nik:'EMP004', dept:'Marketing', course:'Digital Marketing Fundamentals', assigned_by:'Recommendation', assigned:'2025-07-15', due:'2025-08-15', completed:'', progress:10, score:null, status:'In Progress' },
  { id:5, learner:'Rizky Pratama', nik:'EMP005', dept:'IT', course:'GCG & Compliance Certification', assigned_by:'Cohort Rule', assigned:'2025-06-01', due:'2025-06-30', completed:'', progress:0, score:null, status:'Overdue' },
  { id:6, learner:'Maya Indah', nik:'EMP006', dept:'Sales', course:'Sales Excellence Program', assigned_by:'Manager', assigned:'2025-05-01', due:'2025-06-30', completed:'', progress:0, score:null, status:'Overdue' },
  { id:7, learner:'Andi Saputra', nik:'EMP007', dept:'Procurement', course:'K3 & Keselamatan Kerja Dasar', assigned_by:'Cohort Rule', assigned:'2025-07-01', due:'2025-08-31', completed:'', progress:0, score:null, status:'Not Started' },
]

export default function LearnersTrackerPage() {
  const t = useT()
  const [data,      setData     ] = useState(INIT)
  const [search,    setSearch   ] = useState('')
  const [filterSt,  setFilterSt ] = useState('All')
  const [selected,  setSelected ] = useState([])
  const [msg,       setMsg      ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }

  const filtered = data.filter(d =>
    (filterSt==='All' || d.status===filterSt) &&
    (d.learner.toLowerCase().includes(search.toLowerCase()) || d.course.toLowerCase().includes(search.toLowerCase()) || d.dept.toLowerCase().includes(search.toLowerCase()))
  )

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id])
  const toggleAll = () => setSelected(prev => prev.length===filtered.length ? [] : filtered.map(d=>d.id))

  const handleMarkComplete = () => {
    if (!selected.length) return
    setData(prev => prev.map(d => selected.includes(d.id) ? { ...d, status:'Completed', progress:100, completed:new Date().toISOString().slice(0,10) } : d))
    flash(t(`${selected.length} learner ditandai Completed.`,`${selected.length} learner(s) marked Completed.`))
    setSelected([])
  }

  const handleSendReminder = () => {
    if (!selected.length) return
    flash(t(`Reminder terkirim ke ${selected.length} learner.`,`Reminder sent to ${selected.length} learner(s).`))
    setSelected([])
  }

  const statusColor = (s) => ({ 'Not Started':'bg-gray-100 text-gray-500', 'In Progress':'bg-blue-50 text-blue-700', Completed:'bg-green-50 text-green-700', Overdue:'bg-red-50 text-red-700', Withdrawn:'bg-orange-50 text-orange-700' }[s])

  const stats = { total:data.length, completed:data.filter(d=>d.status==='Completed').length, overdue:data.filter(d=>d.status==='Overdue').length, inprogress:data.filter(d=>d.status==='In Progress').length }
  const completionRate = Math.round((stats.completed / stats.total) * 100)

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Learners Tracker','Learners Tracker')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Monitoring assignment dan progress learning seluruh learner — bulk action, reminder, dan completion tracking.','Monitor learning assignments and progress for all learners — bulk actions, reminders, and completion tracking.')}</p>

      {msg && <div className={`text-xs px-4 py-3 rounded-lg mb-4 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}

      <div className='grid grid-cols-5 gap-3 mb-6'>
        {[['Total Assigned', stats.total, '📋', '#8B1A1A'],['Completed', stats.completed, '✅', '#059669'],['In Progress', stats.inprogress, '🔵', '#2563eb'],['Overdue', stats.overdue, '⚠️', '#dc2626'],['Completion Rate', completionRate+'%', '📈', '#7c3aed']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-9 h-9 rounded-lg flex items-center justify-center text-lg' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <div className='flex flex-wrap gap-3 mb-4 items-center'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Cari learner, course, atau departemen...','Search learner, course, or department...')}
            className='flex-1 min-w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
          <div className='flex gap-1 flex-wrap'>
            {['All',...TRACK_STATUS].map(s=>(
              <button key={s} onClick={()=>setFilterSt(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterSt===s?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <div className='flex items-center gap-3 mb-4 px-4 py-3 bg-red-50 rounded-lg'>
            <span className='text-sm font-semibold text-red-700'>{selected.length} dipilih</span>
            <button onClick={handleMarkComplete} className='px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700'>{t('Mark Completed','Mark Completed')}</button>
            <button onClick={handleSendReminder} className='px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700'>{t('Kirim Reminder','Send Reminder')}</button>
            <button onClick={()=>setSelected([])} className='px-3 py-1.5 bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-300'>{t('Batal','Cancel')}</button>
          </div>
        )}

        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='bg-gray-50'>
              <th className='px-3 py-2.5 w-8'><input type='checkbox' checked={selected.length===filtered.length&&filtered.length>0} onChange={toggleAll} /></th>
              {['Learner','Dept','Course','Assigned By','Due Date','Progress','Score','Status'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}
            </tr></thead>
            <tbody>{filtered.map(d=>(
              <tr key={d.id} className={`border-t border-gray-100 hover:bg-gray-50 ${selected.includes(d.id)?'bg-red-50':''}`}>
                <td className='px-3 py-2.5'><input type='checkbox' checked={selected.includes(d.id)} onChange={()=>toggleSelect(d.id)} /></td>
                <td className='px-3 py-2.5'><div className='font-medium text-gray-700'>{d.learner}</div><div className='text-xs text-gray-400'>{d.nik}</div></td>
                <td className='px-3 py-2.5 text-xs text-gray-500'>{d.dept}</td>
                <td className='px-3 py-2.5 text-xs text-gray-500 max-w-28'><div className='line-clamp-2'>{d.course}</div></td>
                <td className='px-3 py-2.5 text-xs text-gray-500'>{d.assigned_by}</td>
                <td className='px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap'>{d.due}</td>
                <td className='px-3 py-2.5'>
                  <div className='flex items-center gap-2'>
                    <div className='w-14 bg-gray-200 rounded-full h-1.5'><div className={`h-1.5 rounded-full ${d.status==='Completed'?'bg-green-500':'bg-red-500'}`} style={{ width:`${d.progress}%` }}></div></div>
                    <span className='text-xs text-gray-500'>{d.progress}%</span>
                  </div>
                </td>
                <td className='px-3 py-2.5 text-gray-500 text-center'>{d.score??'—'}</td>
                <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(d.status)}`}>{d.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
