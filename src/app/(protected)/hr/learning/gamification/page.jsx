'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const TRIGGER_TYPES = ['Course Completion','Assessment Pass (>= Min Score)','Attendance 100%','First Login','Learning Streak 7 Days','Learning Streak 30 Days','Certificate Earned','CPD Points Milestone','Community Contribution','Specialization Completed']
const REWARD_TYPES  = ['Points Only','Badge + Points','Level Up','Leaderboard Bonus','Special Achievement']
const STATUS_OPTS   = ['Active','Inactive']

const INIT = [
  { id:1, rule_name:'Course Completion Reward', trigger:'Course Completion', points:50, badge:'🎓 Course Champion', reward_type:'Badge + Points', description:'Diberikan saat learner berhasil menyelesaikan 1 course', status:'Active' },
  { id:2, rule_name:'Assessment Excellence', trigger:'Assessment Pass (>= Min Score)', points:100, badge:'⭐ Top Scorer', reward_type:'Badge + Points', description:'Diberikan saat nilai assessment >= 90%', status:'Active' },
  { id:3, rule_name:'Perfect Attendance', trigger:'Attendance 100%', points:75, badge:'🏆 Perfect Attendance', reward_type:'Badge + Points', description:'Diberikan untuk kehadiran 100% di seluruh sesi training', status:'Active' },
  { id:4, rule_name:'Learning Streak Weekly', trigger:'Learning Streak 7 Days', points:30, badge:'🔥 7-Day Streak', reward_type:'Badge + Points', description:'Belajar selama 7 hari berturut-turut', status:'Active' },
  { id:5, rule_name:'CPD Milestone 50 Points', trigger:'CPD Points Milestone', points:200, badge:'💡 Learning Pioneer', reward_type:'Special Achievement', description:'Mencapai 50 CPD Points dalam satu tahun', status:'Active' },
]

const EMPTY = { rule_name:'', trigger:'Course Completion', points:'50', badge:'', reward_type:'Badge + Points', description:'', status:'Active' }

export default function MasterGamificationPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.rule_name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.rule_name) return flash('Nama rule wajib diisi.', 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,points:Number(form.points)}:d))
      flash('Gamification rule diperbarui.'); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,points:Number(form.points)}])
      flash('Gamification rule ditambahkan.')
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ rule_name:item.rule_name, trigger:item.trigger, points:String(item.points), badge:item.badge, reward_type:item.reward_type, description:item.description, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash('Rule dihapus.') }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Master Gamification Rules</h1>
      <p className='text-gray-500 text-sm mb-6'>Pengaturan sistem gamification — poin, badge, level, dan reward untuk meningkatkan engagement learner.</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Rules', data.length, '🎮', '#8B1A1A'],['Active Rules', data.filter(d=>d.status==='Active').length, '✅', '#059669'],['Total Poin Max', data.reduce((a,d)=>a+d.points,0), '⭐', '#d97706'],['Badge Tersedia', data.filter(d=>d.badge).length, '🏆', '#7c3aed']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit Rule':'➕ Tambah Rule'}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[['Nama Rule','rule_name'],['Badge (emoji + nama)','badge']].map(([l,k])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Poin yang Diberikan</label>
              <input type='number' min='0' value={form.points} onChange={e=>setForm(f=>({...f,points:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            {[['Trigger / Kondisi','trigger',TRIGGER_TYPES],['Tipe Reward','reward_type',REWARD_TYPES],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {opts.map(o=><option key={o}>{o}</option>)}</select></div>
            ))}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Deskripsi</label>
              <textarea rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' /></div>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{editing?t('Simpan','Save'):t('Tambah','Add')}</button>
              {editing && <button onClick={()=>{setEditing(null);setForm(EMPTY)}} className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='Cari gamification rule...'
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Rule','Trigger','Badge','Poin','Tipe Reward','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5'><div className='font-medium text-gray-700'>{d.rule_name}</div><div className='text-xs text-gray-400 mt-0.5 line-clamp-1'>{d.description}</div></td>
                  <td className='px-3 py-2.5 text-xs text-gray-500 max-w-32'><div className='line-clamp-2'>{d.trigger}</div></td>
                  <td className='px-3 py-2.5 text-sm'>{d.badge}</td>
                  <td className='px-3 py-2.5 font-bold text-gray-700'>{d.points} pts</td>
                  <td className='px-3 py-2.5'><span className='text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-semibold'>{d.reward_type}</span></td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status==='Active'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{d.status}</span></td>
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
