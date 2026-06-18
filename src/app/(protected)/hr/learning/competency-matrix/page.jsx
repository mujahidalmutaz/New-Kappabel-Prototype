'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const POSITIONS = ['Staff Keuangan','Senior Analis Keuangan','Finance Manager','Manajer Umum']
const COMPETENCIES = [
  { category:'Core', items:['Integritas & Etika','Teamwork & Kolaborasi','Customer Focus','Continuous Learning','Communication'] },
  { category:'Leadership', items:['People Management','Strategic Thinking','Decision Making','Change Leadership','Coaching & Mentoring'] },
  { category:'Technical', items:['Financial Analysis','Accounting Standards','Tax & Compliance','Budgeting & Forecasting','ERP System (SAP)'] },
]

const MATRIX = {
  'Integritas & Etika':        { 'Staff Keuangan':3,'Senior Analis Keuangan':4,'Finance Manager':5,'Manajer Umum':5 },
  'Teamwork & Kolaborasi':     { 'Staff Keuangan':3,'Senior Analis Keuangan':3,'Finance Manager':4,'Manajer Umum':4 },
  'Customer Focus':            { 'Staff Keuangan':2,'Senior Analis Keuangan':3,'Finance Manager':4,'Manajer Umum':4 },
  'Continuous Learning':       { 'Staff Keuangan':3,'Senior Analis Keuangan':3,'Finance Manager':4,'Manajer Umum':4 },
  'Communication':             { 'Staff Keuangan':2,'Senior Analis Keuangan':3,'Finance Manager':4,'Manajer Umum':5 },
  'People Management':         { 'Staff Keuangan':1,'Senior Analis Keuangan':2,'Finance Manager':4,'Manajer Umum':5 },
  'Strategic Thinking':        { 'Staff Keuangan':1,'Senior Analis Keuangan':2,'Finance Manager':4,'Manajer Umum':5 },
  'Decision Making':           { 'Staff Keuangan':2,'Senior Analis Keuangan':3,'Finance Manager':4,'Manajer Umum':5 },
  'Change Leadership':         { 'Staff Keuangan':1,'Senior Analis Keuangan':2,'Finance Manager':3,'Manajer Umum':5 },
  'Coaching & Mentoring':      { 'Staff Keuangan':1,'Senior Analis Keuangan':2,'Finance Manager':3,'Manajer Umum':4 },
  'Financial Analysis':        { 'Staff Keuangan':3,'Senior Analis Keuangan':4,'Finance Manager':5,'Manajer Umum':4 },
  'Accounting Standards':      { 'Staff Keuangan':3,'Senior Analis Keuangan':4,'Finance Manager':5,'Manajer Umum':3 },
  'Tax & Compliance':          { 'Staff Keuangan':2,'Senior Analis Keuangan':3,'Finance Manager':4,'Manajer Umum':3 },
  'Budgeting & Forecasting':   { 'Staff Keuangan':2,'Senior Analis Keuangan':4,'Finance Manager':5,'Manajer Umum':4 },
  'ERP System (SAP)':          { 'Staff Keuangan':2,'Senior Analis Keuangan':3,'Finance Manager':4,'Manajer Umum':3 },
}

const LEVEL_LABEL = { 1:'Novice', 2:'Basic', 3:'Developing', 4:'Proficient', 5:'Expert' }
const LEVEL_BG = { 1:'bg-red-50 text-red-600', 2:'bg-orange-50 text-orange-600', 3:'bg-yellow-50 text-yellow-700', 4:'bg-blue-50 text-blue-700', 5:'bg-green-50 text-green-700' }

export default function CompetencyMatrixPage() {
  const t = useT()
  const [filterCategory, setFilterCategory] = useState('Semua')
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState(null)

  const flash = (text) => { setMsg(text); setTimeout(()=>setMsg(null), 3000) }

  const allItems = filterCategory==='Semua' ? COMPETENCIES.flatMap(c=>c.items) : COMPETENCIES.find(c=>c.category===filterCategory)?.items||[]

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Competency & Skill Matrix','Master Competency & Skill Matrix')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Matriks target level kompetensi per jabatan — digunakan sebagai acuan penilaian dan pengembangan karyawan.','Target competency level matrix per job position — used as a reference for employee assessment and development.')}</p>

      {msg && <div className='text-xs px-4 py-3 rounded-lg mb-4 bg-green-50 text-green-600'>{msg}</div>}

      <div className='flex items-center gap-3 mb-6 flex-wrap'>
        <div className='flex gap-2'>
          {['Semua', ...COMPETENCIES.map(c=>c.category)].map(cat=>(
            <button key={cat} onClick={()=>setFilterCategory(cat)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${filterCategory===cat?'text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              style={filterCategory===cat?{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}:{}}>
              {cat}
            </button>
          ))}
        </div>
        <div className='flex gap-2 ml-auto flex-wrap'>
          {Object.entries(LEVEL_BG).map(([k,c])=>(
            <span key={k} className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c}`}>{k} = {LEVEL_LABEL[k]}</span>
          ))}
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          className='px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          {t('+ Tambah Kompetensi','+ Add Competency')}
        </button>
      </div>

      <div className='bg-white rounded-xl shadow-sm overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='bg-gray-50'>
              <th className='text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap w-48'>Kompetensi</th>
              <th className='text-left px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap w-24'>Kategori</th>
              {POSITIONS.map(p=>(
                <th key={p} className='text-center px-3 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap'>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPETENCIES.map(cat=>(
              filterCategory!=='Semua' && filterCategory!==cat.category ? null :
              <>
                {filterCategory==='Semua' && (
                  <tr key={`cat-${cat.category}`} className='bg-gray-50/80'>
                    <td colSpan={POSITIONS.length+2} className='px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide'>
                      {cat.category} Competencies
                    </td>
                  </tr>
                )}
                {cat.items.map(item=>(
                  <tr key={item} className='border-t border-gray-100 hover:bg-gray-50'>
                    <td className='px-4 py-3 font-medium text-gray-700'>{item}</td>
                    <td className='px-3 py-3 text-xs text-gray-400'>{cat.category}</td>
                    {POSITIONS.map(p=>{
                      const level = MATRIX[item]?.[p] || 0
                      return (
                        <td key={p} className='px-3 py-3 text-center'>
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-bold ${LEVEL_BG[level]||'bg-gray-100 text-gray-400'}`}>
                            {level} <span className='font-normal hidden sm:inline'>— {LEVEL_LABEL[level]||'N/A'}</span>
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className='mt-4 flex gap-3 flex-wrap'>
        <button onClick={()=>flash(t('Matrix berhasil diekspor ke Excel.','Matrix exported to Excel.'))} className='px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          ⬇️ Export Excel
        </button>
        <button onClick={()=>flash(t('Matrix berhasil diekspor ke PDF.','Matrix exported to PDF.'))} className='px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200'>
          📄 Export PDF
        </button>
      </div>
    </div>
  )
}
