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
    if (!form.learner || !form.course) return flash('Nama learner dan course wajib diisi.', 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form}:d))
      flash('Data learner diperbarui.'); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,progress:0,score:null,completed:''}])
      flash('Learner ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ learner:item.learner, nik:item.nik, course:item.course, batch:item.batch, assignment:item.assignment, enrolled:item.enrolled, due:item.due, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('Learner dihapus dari course.') }

  const statusColor = (s) => ({ 'Not Started':'bg-gray-100 text-gray-500', 'In Progress':'bg-blue-50 text-blue-700', Completed:'bg-green-50 text-green-700', Overdue:'bg-red-50 text-red-700', Withdrawn:'bg-orange-50 text-orange-700' }[s])
  const assignColor = (a) => ({ Required:'bg-red-50 text-red-700', Voluntary:'bg-blue-50 text-blue-700', Recommendation:'bg-yellow-50 text-yellow-700' }[a])

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Course — Learners Management</h1>
      <p className='text-gray-500 text-sm mb-6'>Kelola peserta course — assignment, progress, completion, dan mass action.</p>

      <div className='grid grid-cols-5 gap-3 mb-6'>
        {[['Total Peserta', data.length, '👥', '#8B1A1A'],['Completed', data.filter(d=>d.status==='Completed').length, '✅', '#059669'],['In Progress', data.filter(d=>d.status==='In Progress').length, '🔵', '#2563eb'],['Overdue', data.filter(d=>d.status==='Overdue').length, '⚠️', '#dc2626'],['Not Started', data.filter(d=>d.status==='Not Started').length, '⭕', '#6b7280']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-9 h-9 rounded-lg flex items-center justify-center text-lg' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit Learner':'➕ Tambah Learner'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Learner','learner'],['NIK','nik'],['Course','course'],['Batch/Sesi','batch']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div className='grid grid-cols-2 gap-2'>
              {[['Tgl Enroll','enrolled'],['Due Date','due']].map(([l,k])=>(
                <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                  <input type='date' value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
              ))}
            </div>
            {[['Assignment Type','assignment',ASSIGN_TYPES],['Status','status',LEARN_STATUS]].map(([l,k,opts])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {opts.map(o=><option key={o}>{o}</option>)}</select></div>
            ))}
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{editing?t('Simpan','Save'):t('Tambah','Add')}</button>
              {editing && <button onClick={()=>{setEditing(null);setForm(EMPTY)}} className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <div className='flex flex-wrap gap-2 mb-4'>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari learner atau course...'
              className='flex-1 min-w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
              className='px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none'>
              <option value='All'>Semua Status</option>
              {LEARN_STATUS.map(s=><option key={s}>{s}</option>)}
            </select>
            <select value={filterAssign} onChange={e=>setFilterAssign(e.target.value)}
              className='px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none'>
              <option value='All'>Semua Tipe</option>
              {ASSIGN_TYPES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Learner','Course','Batch','Tipe','Progress','Score','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5'><div className='font-medium text-gray-700'>{d.learner}</div><div className='text-xs text-gray-400'>{d.nik}</div></td>
                  <td className='px-3 py-2.5 text-xs text-gray-500 max-w-28'><div className='line-clamp-2'>{d.course}</div></td>
                  <td className='px-3 py-2.5 text-xs text-gray-500'>{d.batch}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${assignColor(d.assignment)}`}>{d.assignment}</span></td>
                  <td className='px-3 py-2.5'>
                    <div className='flex items-center gap-2'>
                      <div className='w-16 bg-gray-200 rounded-full h-1.5'><div className='h-1.5 rounded-full bg-red-500' style={{ width:`${d.progress}%` }}></div></div>
                      <span className='text-xs text-gray-500'>{d.progress}%</span>
                    </div>
                  </td>
                  <td className='px-3 py-2.5 text-gray-500 text-center'>{d.score??'—'}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(d.status)}`}>{d.status}</span></td>
                  <td className='px-3 py-2.5'><div className='flex gap-1'>
                    <button onClick={()=>handleEdit(d)} className='px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                    <button onClick={()=>handleDelete(d.id)} className='px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
