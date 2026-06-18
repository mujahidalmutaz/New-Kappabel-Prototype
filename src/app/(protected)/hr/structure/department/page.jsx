'use client'
import { useState }          from 'react'
import { useStructureStore } from '@/store/structureStore'
import { useT } from '@/store/languageStore'
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td, FormField, Input, Select,
  StatusBadge, ActionButton, EmptyState,
} from '@/components/ui'

const BLANK = { businessUnitId:'', code:'', name:'', status:'Active' }

export default function DepartmentPage() {
  const t = useT()
  const { businessUnits, departments, addDepartment, updateDepartment, deleteDepartment } = useStructureStore()
  const [form,    setForm   ] = useState(BLANK)
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleSave = () => {
    if (!form.businessUnitId || !form.code || !form.name) return flash(t('Business Unit, kode, dan nama wajib diisi.','Business Unit, code, and name are required.'),'error')
    if (editing) {
      updateDepartment(editing, {...form, businessUnitId:+form.businessUnitId})
      setEditing(null); flash(t('Department diperbarui.','Department updated.'))
    } else {
      addDepartment({...form, businessUnitId:+form.businessUnitId})
      flash(t('Department ditambahkan.','Department added.'))
    }
    setForm(BLANK)
  }

  const handleEdit = (x) => {
    setEditing(x.id)
    setForm({ businessUnitId:x.businessUnitId, code:x.code, name:x.name, status:x.status })
  }

  const buName = (id) => businessUnits.find(b=>b.id===id)?.name || '-'
  const activeCount = departments.filter(d=>d.status==='Active').length

  return (
    <div>
      <PageHeader
        icon='🗂️'
        title='Department'
        subtitle={t('Unit terkecil struktur organisasi, di bawah Business Unit.','Smallest unit of the organizational structure, under Business Unit.')}
      />

      {/* Breadcrumb */}
      <div className='mb-6 flex items-center gap-2 text-xs text-gray-400'>
        <span className='px-2.5 py-1'>Enterprise</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Division</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Company</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Business Unit</span>
        <span>→</span>
        <span className='rounded-full bg-red-600 px-2.5 py-1 font-semibold text-white'>Department</span>
      </div>

      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3'>
        <StatCard label={t('Total Department','Total Department')} value={departments.length} icon='🗂️' tone='brand' />
        <StatCard label={t('Aktif','Active')} value={activeCount} icon='✅' tone='green' />
        <StatCard label={t('Tidak Aktif','Inactive')} value={departments.length-activeCount} icon='⏸️' tone='gray' />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Form */}
        <SectionCard title={`${editing?t('Edit','Edit'):t('Tambah','Add')} Department`} icon={editing?'✏️':'➕'}>
          {msg && <div className={`mb-3 rounded-lg px-3 py-2 text-xs ${msg.type==='error'?'bg-red-50 text-red-600':'bg-emerald-50 text-emerald-700'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <FormField label='Business Unit' required>
              <Select value={form.businessUnitId} onChange={e=>setForm(f=>({...f,businessUnitId:e.target.value}))}>
                <option value=''>-- {t('Pilih Business Unit','Select Business Unit')} --</option>
                {businessUnits.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </FormField>
            {[[t('Kode','Code'),'code'],[t('Nama Department','Department Name'),'name']].map(([lbl,key])=>(
              <FormField key={key} label={lbl} required>
                <Input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} />
              </FormField>
            ))}
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
          <SectionCard title={t('Daftar Department','Department List')} icon='🗂️' bodyClass='p-0'>
            {departments.length ? (
              <DataTable
                className='rounded-none shadow-none ring-0'
                columns={[t('Kode','Code'),t('Nama Department','Department Name'),'Business Unit','Status',{label:t('Aksi','Action'),align:'right'}]}
              >
                {departments.map(x=>(
                  <Tr key={x.id}>
                    <Td className='font-mono text-xs text-gray-500'>{x.code}</Td>
                    <Td className='font-medium text-gray-800'>{x.name}</Td>
                    <Td className='text-xs text-gray-500'>{buName(x.businessUnitId)}</Td>
                    <Td><StatusBadge status={x.status} /></Td>
                    <Td align='right'>
                      <div className='flex justify-end gap-2'>
                        <ActionButton size='sm' variant='secondary' onClick={()=>handleEdit(x)}>Edit</ActionButton>
                        <ActionButton size='sm' variant='danger' onClick={()=>deleteDepartment(x.id)}>{t('Hapus','Delete')}</ActionButton>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </DataTable>
            ) : (
              <div className='p-5'>
                <EmptyState icon='🗂️' title={t('Belum ada department.','No departments yet.')} />
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
