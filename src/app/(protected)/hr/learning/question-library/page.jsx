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

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Soal', data.length, '📋', '#8B1A1A'],['Easy', data.filter(d=>d.difficulty==='Easy').length, '🟢', '#059669'],['Medium', data.filter(d=>d.difficulty==='Medium').length, '🟡', '#d97706'],['Hard', data.filter(d=>d.difficulty==='Hard').length, '🔴', '#dc2626']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?t('✏️ Edit Soal','✏️ Edit Question'):`➕ ${t('Tambah Soal','Add Question')}`}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Pertanyaan</label>
              <textarea rows={3} value={form.question} onChange={e=>setForm(f=>({...f,question:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' /></div>
            {[['Tipe Soal','type',Q_TYPES],['Kategori','category',CATEGORIES],['Tingkat Kesulitan','difficulty',DIFFICULTIES],['Status','status',STATUS_OPTS]].map(([l,k,opts])=>(
              <div key={k}><label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <select value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {opts.map(o=><option key={o}>{o}</option>)}</select></div>
            ))}
            {form.type==='Multiple Choice' && (
              <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Jumlah Opsi Jawaban</label>
                <input type='number' min='2' max='6' value={form.options} onChange={e=>setForm(f=>({...f,options:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            )}
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{editing?t('Simpan','Save'):t('Tambah','Add')}</button>
              {editing && <button onClick={()=>{setEditing(null);setForm(EMPTY)}} className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <div className='flex flex-wrap gap-2 mb-4'>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Cari soal...','Search question...')}
              className='flex-1 min-w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}
              className='px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-400'>
              <option value='All'>Semua Kategori</option>
              {CATEGORIES.map(c=><option key={c}>{c}</option>)}
            </select>
            <div className='flex gap-1'>
              {['All',...DIFFICULTIES].map(d=>(
                <button key={d} onClick={()=>setFilterDiff(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterDiff===d?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{d}</button>
              ))}
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Pertanyaan','Tipe','Kategori','Tingkat','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5 font-medium text-gray-700 max-w-56'><div className='line-clamp-2'>{d.question}</div></td>
                  <td className='px-3 py-2.5'><span className='text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold whitespace-nowrap'>{d.type}</span></td>
                  <td className='px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap'>{d.category}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${diffColor(d.difficulty)}`}>{d.difficulty}</span></td>
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
