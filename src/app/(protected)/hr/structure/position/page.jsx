'use client'
import { useState, useMemo }  from 'react'
import { useStructureStore, PC_CATEGORY_COLOR } from '@/store/structureStore'
import { useT } from '@/store/languageStore'
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td, FormField, Input, Select,
  StatusBadge, ActionButton, EmptyState,
} from '@/components/ui'

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

  const activeCount = positions.filter(p=>p.status==='Active').length

  return (
    <div>
      <PageHeader
        icon='📌'
        title='Position'
        subtitle={t('Jabatan di bawah Department, dilengkapi Job Family dan Grade.','Position under Department, with Job Family and Grade.')}
      />

      {/* Breadcrumb */}
      <div className='mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-400'>
        <span className='px-2.5 py-1'>Enterprise</span><span>→</span>
        <span className='px-2.5 py-1'>Division</span><span>→</span>
        <span className='px-2.5 py-1'>Company</span><span>→</span>
        <span className='px-2.5 py-1'>Business Unit</span><span>→</span>
        <span className='rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700'>Department</span>
        <span>→</span>
        <span className='rounded-full bg-red-600 px-2.5 py-1 font-semibold text-white'>Position</span>
      </div>

      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <StatCard label={t('Total Position','Total Position')} value={positions.length} icon='📌' tone='brand' />
        <StatCard label={t('Aktif','Active')} value={activeCount} icon='✅' tone='green' />
        <StatCard label={t('Tidak Aktif','Inactive')} value={positions.length-activeCount} icon='⏸️' tone='gray' />
        <StatCard label={t('Job Family','Job Family')} value={jobFamilies.length} icon='🧩' tone='blue' />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Form */}
        <SectionCard title={`${editing?t('Edit','Edit'):t('Tambah','Add')} Position`} icon={editing?'✏️':'➕'}>
          {msg && <div className={`mb-3 rounded-lg px-3 py-2 text-xs ${msg.type==='error'?'bg-red-50 text-red-600':'bg-emerald-50 text-emerald-700'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>

            <FormField label='Department' required>
              <Select value={form.departmentId} onChange={e=>setForm(f=>({...f,departmentId:e.target.value}))}>
                <option value=''>-- {t('Pilih Department','Select Department')} --</option>
                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </FormField>

            {[[t('Kode','Code'),'code'],[t('Nama Position','Position Name'),'name']].map(([lbl,key])=>(
              <FormField key={key} label={lbl} required>
                <Input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} />
              </FormField>
            ))}

            <FormField label='Job Family'>
              <Select value={form.jobFamilyId} onChange={e=>setForm(f=>({...f,jobFamilyId:e.target.value}))}>
                <option value=''>-- {t('Opsional','Optional')} --</option>
                {jobFamilies.filter(j=>j.status==='Active').map(j=><option key={j.id} value={j.id}>{j.name}</option>)}
              </Select>
            </FormField>

            <FormField label='Grade (Position Class)' required>
              <Select value={form.gradeId} onChange={e=>setForm(f=>({...f,gradeId:e.target.value}))}>
                <option value=''>-- {t('Pilih PC','Select PC')} --</option>
                {Object.entries(gradeGroups).map(([cat, items]) => (
                  <optgroup key={cat} label={`── ${cat} ──`}>
                    {items.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.code} · {g.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </Select>
              {/* Grade preview card */}
              {selectedGrade && (
                <div className='mt-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs ring-1 ring-red-100'>
                  <div className='mb-1 flex items-center justify-between'>
                    <span className='font-bold text-red-700'>{selectedGrade.code}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PC_CATEGORY_COLOR[selectedGrade.category]}`}>
                      {selectedGrade.category}
                    </span>
                  </div>
                  <div className='font-medium text-gray-700'>{selectedGrade.name}</div>
                  {selectedGrade.isBoard
                    ? <div className='mt-1 text-gray-400'>Honorarium-based (non-payroll)</div>
                    : <div className='mt-1 text-gray-500'>
                        Salary range: {fmt(selectedGrade.minSalary)} – {fmt(selectedGrade.maxSalary)}
                      </div>
                  }
                </div>
              )}
            </FormField>

            <FormField label='Status'>
              <Select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Active</option><option>Inactive</option>
              </Select>
            </FormField>

            <div className='flex gap-2 pt-1'>
              <ActionButton onClick={handleSave} className='flex-1'>{editing?t('Simpan','Save'):t('Tambah','Add')}</ActionButton>
              {editing && <ActionButton variant='secondary' onClick={()=>{setEditing(null);setForm(BLANK)}}>{t('Batal','Cancel')}</ActionButton>}
            </div>
          </div>
        </SectionCard>

        {/* Table */}
        <div className='lg:col-span-2'>
          <SectionCard
            title={t('Daftar Position','Position List')}
            icon='📌'
            bodyClass='p-0'
            actions={
              <Select value={filterDept} onChange={e=>setFilterDept(e.target.value)} className='py-1.5 text-xs'>
                <option value=''>{t('Semua Department','All Departments')}</option>
                {departments.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            }
          >
            {filtered.length ? (
              <DataTable
                className='rounded-none shadow-none ring-0'
                columns={[t('Kode','Code'),t('Nama Position','Position Name'),'Department','Job Family','Grade',t('Salary Range','Salary Range'),'Status',{label:t('Aksi','Action'),align:'right'}]}
              >
                {filtered.map(x=>{
                  const g = grades.find(gr=>gr.id===x.gradeId)
                  return (
                    <Tr key={x.id}>
                      <Td className='font-mono text-xs text-gray-500'>{x.code}</Td>
                      <Td className='font-medium text-gray-800'>{x.name}</Td>
                      <Td className='text-xs text-gray-500'>{deptName(x.departmentId)}</Td>
                      <Td className='text-xs text-gray-500'>{x.jobFamilyId ? jfName(x.jobFamilyId) : '-'}</Td>
                      <Td>
                        <span className='rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700'>
                          {gradeCode(x.gradeId)}
                        </span>
                      </Td>
                      <Td className='whitespace-nowrap text-xs text-gray-500'>
                        {g ? `${fmt(g.minSalary)} – ${fmt(g.maxSalary)}` : '-'}
                      </Td>
                      <Td><StatusBadge status={x.status} /></Td>
                      <Td align='right'>
                        <div className='flex justify-end gap-2'>
                          <ActionButton size='sm' variant='secondary' onClick={()=>handleEdit(x)}>Edit</ActionButton>
                          <ActionButton size='sm' variant='danger' onClick={()=>deletePosition(x.id)}>{t('Hapus','Delete')}</ActionButton>
                        </div>
                      </Td>
                    </Tr>
                  )
                })}
              </DataTable>
            ) : (
              <div className='p-5'>
                <EmptyState icon='📌' title={t('Belum ada position.','No positions yet.')} />
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Grade Reference — grouped by category */}
      <div className='mt-6'>
        <SectionCard title={t('Position Class Reference (PC 1–72)','Position Class Reference (PC 1–72)')} icon='📊'>
          {Object.entries(gradeGroups).map(([cat, items]) => (
            <div key={cat} className='mb-6 last:mb-0'>
              <div className='mb-3 flex items-center gap-2'>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${PC_CATEGORY_COLOR[cat]}`}>{cat}</span>
                <span className='text-xs text-gray-400'>PC {items[0].pc}{items.length > 1 ? `–${items[items.length-1].pc}` : ''}</span>
              </div>
              <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'>
                {items.map(g => (
                  <div key={g.id} className='rounded-xl p-3 text-center ring-1 ring-gray-100 transition hover:shadow-sm hover:ring-red-200'>
                    <div className='text-sm font-bold text-red-600'>{g.code}</div>
                    <div className='mt-0.5 text-xs leading-tight text-gray-600'>{g.name}</div>
                    {!g.isBoard && (
                      <div className='mt-1.5 text-xs leading-tight text-gray-400'>
                        {fmt(g.minSalary)}<br/>
                        <span className='text-gray-300'>—</span><br/>
                        {fmt(g.maxSalary)}
                      </div>
                    )}
                    {g.isBoard && (
                      <div className='mt-1.5 text-xs text-yellow-600'>Honorarium</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  )
}
