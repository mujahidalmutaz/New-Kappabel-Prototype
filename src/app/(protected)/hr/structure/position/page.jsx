'use client'
import { useState, useMemo }  from 'react'
import { useStructureStore, PC_CATEGORY_COLOR } from '@/store/structureStore'
import { useT } from '@/store/languageStore'

const BLANK = { departmentId:'', jobFamilyId:'', gradeId:'', code:'', name:'', status:'Active' }

const fmt = (n) => n ? `Rp ${new Intl.NumberFormat('id-ID').format(n)}` : '-'

export default function PositionPage() {
  const t = useT()
  const {
    departments, jobFamilies, grades, positions,
    addPosition, updatePosition, deletePosition,
  } = useStructureStore()

  const [form,    setForm   ] = useState(BLANK)
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)
  const [filterDept, setFilterDept] = useState('')

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleSave = () => {
    if (!form.departmentId || !form.gradeId || !form.code || !form.name)
      return flash(t('Department, grade, kode, dan nama wajib diisi.','Department, grade, code, and name are required.'),'error')
    const data = {
      ...form,
      departmentId: +form.departmentId,
      jobFamilyId:  form.jobFamilyId ? +form.jobFamilyId : null,
      gradeId:      +form.gradeId,
    }
    if (editing) { updatePosition(editing, data); setEditing(null); flash(t('Position diperbarui.','Position updated.')) }
    else         { addPosition(data); flash(t('Position ditambahkan.','Position added.')) }
    setForm(BLANK)
  }

  const handleEdit = (x) => {
    setEditing(x.id)
    setForm({
      departmentId: x.departmentId,
      jobFamilyId:  x.jobFamilyId || '',
      gradeId:      x.gradeId,
      code:         x.code,
      name:         x.name,
      status:       x.status,
    })
  }

  const deptName  = (id) => departments.find(d=>d.id===id)?.name  || '-'
  const jfName    = (id) => jobFamilies.find(j=>j.id===id)?.name  || '-'
  const gradeCode = (id) => grades.find(g=>g.id===id)?.code       || '-'

  const selectedGrade = grades.find(g=>g.id===+form.gradeId)

  // Group grades by category for <optgroup>
  const gradeGroups = useMemo(() => {
    const map = {}
    grades.forEach(g => {
      if (!map[g.category]) map[g.category] = []
      map[g.category].push(g)
    })
    return map
  }, [grades])

  const filtered = filterDept
    ? positions.filter(p=>p.departmentId===+filterDept)
    : positions

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Position</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Jabatan di bawah Department, dilengkapi Job Family dan Grade.','Position under Department, with Job Family and Grade.')}</p>

      {/* Breadcrumb */}
      <div className='flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-6'>
        <span className='px-2.5 py-1'>Enterprise</span><span>→</span>
        <span className='px-2.5 py-1'>Division</span><span>→</span>
        <span className='px-2.5 py-1'>Company</span><span>→</span>
        <span className='px-2.5 py-1'>Business Unit</span><span>→</span>
        <span className='bg-red-100 text-red-700 font-semibold px-2.5 py-1 rounded-full'>Department</span>
        <span>→</span>
        <span className='bg-red-600 text-white font-semibold px-2.5 py-1 rounded-full'>Position</span>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?'✏️ Edit':`➕ ${t('Tambah','Add')}`} Position</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>

            {/* Department */}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Department <span className='text-red-400'>*</span></label>
              <select value={form.departmentId} onChange={e=>setForm(f=>({...f,departmentId:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>-- Pilih Department --</option>
                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            {/* Kode & Nama */}
            {[[t('Kode','Code'),'code'],[t('Nama Position','Position Name'),'name']].map(([lbl,key])=>(
              <div key={key}>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>{lbl} <span className='text-red-400'>*</span></label>
                <input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
            ))}

            {/* Job Family */}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Job Family</label>
              <select value={form.jobFamilyId} onChange={e=>setForm(f=>({...f,jobFamilyId:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>-- Opsional --</option>
                {jobFamilies.filter(j=>j.status==='Active').map(j=><option key={j.id} value={j.id}>{j.name}</option>)}
              </select>
            </div>

            {/* Grade */}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Grade (Position Class) <span className='text-red-400'>*</span></label>
              <select value={form.gradeId} onChange={e=>setForm(f=>({...f,gradeId:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>-- Pilih PC --</option>
                {Object.entries(gradeGroups).map(([cat, items]) => (
                  <optgroup key={cat} label={`── ${cat} ──`}>
                    {items.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.code} · {g.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {/* Grade preview card */}
              {selectedGrade && (
                <div className='mt-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-xs'>
                  <div className='flex items-center justify-between mb-1'>
                    <span className='font-bold text-red-700'>{selectedGrade.code}</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${PC_CATEGORY_COLOR[selectedGrade.category]}`}>
                      {selectedGrade.category}
                    </span>
                  </div>
                  <div className='text-gray-700 font-medium'>{selectedGrade.name}</div>
                  {selectedGrade.isBoard
                    ? <div className='text-gray-400 mt-1'>Honorarium-based (non-payroll)</div>
                    : <div className='text-gray-500 mt-1'>
                        Salary range: {fmt(selectedGrade.minSalary)} – {fmt(selectedGrade.maxSalary)}
                      </div>
                  }
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>

            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90'
                style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
                {editing?t('Simpan','Save'):t('Tambah','Add')}
              </button>
              {editing && <button onClick={()=>{setEditing(null);setForm(BLANK)}}
                className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3 mb-4'>
            <h2 className='text-sm font-bold text-gray-700'>{t('📌 Daftar Position','📌 Position List')}</h2>
            {/* Filter by dept */}
            <select value={filterDept} onChange={e=>setFilterDept(e.target.value)}
              className='px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-400'>
              <option value=''>Semua Department</option>
              {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>
                {[t('Kode','Code'),t('Nama Position','Position Name'),'Department','Job Family','Grade',t('Salary Range','Salary Range'),'Status',t('Aksi','Action')].map((h,i)=>(
                  <th key={i} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap'>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.length ? filtered.map(x=>{
                  const g = grades.find(gr=>gr.id===x.gradeId)
                  return (
                    <tr key={x.id} className='border-t border-gray-100 hover:bg-gray-50'>
                      <td className='px-4 py-2.5 font-mono text-xs text-gray-500'>{x.code}</td>
                      <td className='px-4 py-2.5 font-medium text-gray-700'>{x.name}</td>
                      <td className='px-4 py-2.5 text-xs text-gray-500'>{deptName(x.departmentId)}</td>
                      <td className='px-4 py-2.5 text-xs text-gray-500'>{x.jobFamilyId ? jfName(x.jobFamilyId) : '-'}</td>
                      <td className='px-4 py-2.5'>
                        <span className='text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-700 rounded-full'>
                          {gradeCode(x.gradeId)}
                        </span>
                      </td>
                      <td className='px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap'>
                        {g ? `${fmt(g.minSalary)} – ${fmt(g.maxSalary)}` : '-'}
                      </td>
                      <td className='px-4 py-2.5'>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${x.status==='Active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{x.status}</span>
                      </td>
                      <td className='px-4 py-2.5'>
                        <div className='flex gap-2'>
                          <button onClick={()=>handleEdit(x)} className='px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                          <button onClick={()=>deletePosition(x.id)} className='px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr><td colSpan={8} className='px-4 py-8 text-center text-gray-400 text-sm'>Belum ada position.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grade Reference — grouped by category */}
      <div className='bg-white rounded-xl p-6 shadow-sm mt-6'>
        <h2 className='text-sm font-bold text-gray-700 mb-5'>{t('📊 Position Class Reference (PC 1–72)','📊 Position Class Reference (PC 1–72)')}</h2>
        {Object.entries(gradeGroups).map(([cat, items]) => (
          <div key={cat} className='mb-6 last:mb-0'>
            <div className='flex items-center gap-2 mb-3'>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${PC_CATEGORY_COLOR[cat]}`}>{cat}</span>
              <span className='text-xs text-gray-400'>PC {items[0].pc}{items.length > 1 ? `–${items[items.length-1].pc}` : ''}</span>
            </div>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2'>
              {items.map(g => (
                <div key={g.id} className='border border-gray-100 rounded-lg p-3 text-center hover:border-red-200 hover:shadow-sm transition'>
                  <div className='text-sm font-bold text-red-600'>{g.code}</div>
                  <div className='text-xs text-gray-600 mt-0.5 leading-tight'>{g.name}</div>
                  {!g.isBoard && (
                    <div className='text-xs text-gray-400 mt-1.5 leading-tight'>
                      {fmt(g.minSalary)}<br/>
                      <span className='text-gray-300'>—</span><br/>
                      {fmt(g.maxSalary)}
                    </div>
                  )}
                  {g.isBoard && (
                    <div className='text-xs text-yellow-600 mt-1.5'>Honorarium</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
