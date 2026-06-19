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
    if (!form.rule_name) return flash(t('Nama rule wajib diisi.','Rule name is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,points:Number(form.points)}:d))
      flash(t('Gamification rule diperbarui.','Gamification rule updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,points:Number(form.points)}])
      flash(t('Gamification rule ditambahkan.','Gamification rule added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ rule_name:item.rule_name, trigger:item.trigger, points:String(item.points), badge:item.badge, reward_type:item.reward_type, description:item.description, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Rule dihapus.','Rule deleted.')) }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Gamification Rules','Master Gamification Rules')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Pengaturan sistem gamification — poin, badge, level, dan reward untuk meningkatkan engagement learner.','Configure the gamification system — points, badges, levels, and rewards to boost learner engagement.')}</p>


    </div>
  )
}
