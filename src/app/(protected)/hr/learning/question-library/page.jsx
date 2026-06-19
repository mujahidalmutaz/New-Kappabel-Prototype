'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const Q_TYPES      = ['Multiple Choice','Essay','True/False','Rating Scale','Short Answer']
const DIFFICULTIES = ['Easy','Medium','Hard']
const CATEGORIES   = ['Leadership & Management','K3 & Safety','Compliance & Regulasi','Technical Skills','Soft Skills','HR & People Management','Finance & Accounting','Digital Literacy']
const STATUS_OPTS  = ['Active','Inactive','Draft']

const INIT = [
  { id:1, question:'Apa yang dimaksud dengan APD dalam lingkungan kerja?', type:'Multiple Choice', category:'K3 & Safety', difficulty:'Easy', options:4, status:'Active' },
  { id:2, question:'Jelaskan 5 prinsip GCG dalam tata kelola perusahaan!', type:'Essay', category:'Compliance & Regulasi', difficulty:'Medium', options:0, status:'Active' },
  { id:3, question:'Seorang pemimpin yang baik harus menjadi teladan bagi timnya.', type:'True/False', category:'Leadership & Management', difficulty:'Easy', options:2, status:'Active' },
  { id:4, question:'Sebutkan langkah-langkah dalam menangani keluhan pelanggan secara efektif!', type:'Essay', category:'Soft Skills', difficulty:'Medium', options:0, status:'Active' },
  { id:5, question:'Berapa batas maksimum jam lembur karyawan per minggu menurut UU Ketenagakerjaan?', type:'Multiple Choice', category:'HR & People Management', difficulty:'Hard', options:4, status:'Active' },
]

const EMPTY = { question:'', type:'Multiple Choice', category:'K3 & Safety', difficulty:'Medium', options:'4', answer:'', status:'Active' }

export default function QuestionLibraryPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterDiff,setFilterDiff] = useState('All')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }

  const filtered = data.filter(d =>
    (filterCat==='All' || d.category===filterCat) &&
    (filterDiff==='All' || d.difficulty===filterDiff) &&
    d.question.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = () => {
    if (!form.question) return flash(t('Pertanyaan wajib diisi.','Question is required.'), 'error')
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,options:Number(form.options)||0}:d))
      flash(t('Soal diperbarui.','Question updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,options:Number(form.options)||0}])
      flash(t('Soal ditambahkan.','Question added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ question:item.question, type:item.type, category:item.category, difficulty:item.difficulty, options:String(item.options), answer:item.answer||'', status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Soal dihapus.','Question deleted.')) }

  const diffColor = (d) => ({ Easy:'bg-green-50 text-green-700', Medium:'bg-yellow-50 text-yellow-700', Hard:'bg-red-50 text-red-700' }[d])

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Question Library','Master Question Library')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Bank soal terpusat — dapat digunakan untuk quiz, assessment, certification, dan survey.','Centralised question bank — usable for quizzes, assessments, certifications, and surveys.')}</p>


    </div>
  )
}
