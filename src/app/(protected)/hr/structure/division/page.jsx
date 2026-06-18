'use client'
import { useState }          from 'react'
import { useStructureStore } from '@/store/structureStore'
import { useT } from '@/store/languageStore'
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td, FormField, Input, Select,
  StatusBadge, ActionButton, EmptyState,
} from '@/components/ui'

const BLANK = { enterpriseId:'', code:'', name:'', headName:'', status:'Active' }

export default function DivisionPage() {
  const t = useT()
  const { enterprises, divisions, addDivision, updateDivision, deleteDivision } = useStructureStore()
  const [form,    setForm   ] = useState(BLANK)
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleSave = () => {
    if (!form.enterpriseId || !form.code || !form.name) return flash(t('Enterprise, kode, dan nama wajib diisi.','Enterprise, code, and name are required.'),'error')
    if (editing) {
      updateDivision(editing, {...form, enterpriseId:+form.enterpriseId})
      setEditing(null); flash(t('Division diperbarui.','Division updated.'))
    } else {
      addDivision({...form, enterpriseId:+form.enterpriseId})
      flash(t('Division ditambahkan.','Division added.'))
    }
    setForm(BLANK)
  }

  const handleEdit = (x) => {
    setEditing(x.id)
    setForm({ enterpriseId:x.enterpriseId, code:x.code, name:x.name, headName:x.headName||'', status:x.status })
  }

  const entName = (id) => enterprises.find(e=>e.id===id)?.name || '-'
  const activeCount = divisions.filter(d=>d.status==='Active').length

  return (
    <div>
      <PageHeader
        icon='🏛️'
        title='Division'
        subtitle={t('Sub-group di bawah Enterprise. Berfungsi sebagai pengelompokan Company.','Sub-group under Enterprise. Groups companies within the enterprise.')}
      />

      {/* Breadcrumb */}
      <div className='mb-6 flex items-center gap-2 text-xs text-gray-400'>
        <span className='rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700'>Enterprise</span>
        <span>→</span>
        <span className='rounded-full bg-red-600 px-2.5 py-1 font-semibold text-white'>Division</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Company</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Business Unit</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Department</span>
      </div>

      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3'>
        <StatCard label={t('Total Division','Total Division')} value={divisions.length} icon='🏛️' tone='brand' />
        <StatCard label={t('Aktif','Active')} value={activeCount} icon='✅' tone='green' />
        <StatCard label={t('Tidak Aktif','Inactive')} value={divisions.length-activeCount} icon='⏸️' tone='gray' />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Form */}
        <SectionCard title={`${editing?t('Edit','Edit'):t('Tambah','Add')} Division`} icon={editing?'✏️':'➕'}>
          {msg && <div className={`mb-3 rounded-lg px-3 py-2 text-xs ${msg.type==='error'?'bg-red-50 text-red-600':'bg-emerald-50 text-emerald-700'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <FormField label='Enterprise' required>
              <Select value={form.enterpriseId} onChange={e=>setForm(f=>({...f,enterpriseId:e.target.value}))}>
                <option value=''>-- {t('Pilih Enterprise','Select Enterprise')} --</option>
                {enterprises.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </FormField>
            {[[t('Kode','Code'),'code',true],[t('Nama Division','Division Name'),'name',true],['Division Head','headName',false]].map(([lbl,key,req])=>(
              <FormField key={key} label={lbl} required={req}>
                <Input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  placeholder={key==='headName'?t('Opsional','Optional'):''} />
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
          <SectionCard title={t('Daftar Division','Division List')} icon='🏛️' bodyClass='p-0'>
            {divisions.length ? (
              <DataTable
                className='rounded-none shadow-none ring-0'
                columns={[t('Kode','Code'),t('Nama Division','Division Name'),'Enterprise','Division Head','Status',{label:t('Aksi','Action'),align:'right'}]}
              >
                {divisions.map(x=>(
                  <Tr key={x.id}>
                    <Td className='font-mono text-xs text-gray-500'>{x.code}</Td>
                    <Td className='font-medium text-gray-800'>{x.name}</Td>
                    <Td className='text-xs text-gray-500'>{entName(x.enterpriseId)}</Td>
                    <Td>{x.headName||'-'}</Td>
                    <Td><StatusBadge status={x.status} /></Td>
                    <Td align='right'>
                      <div className='flex justify-end gap-2'>
                        <ActionButton size='sm' variant='secondary' onClick={()=>handleEdit(x)}>Edit</ActionButton>
                        <ActionButton size='sm' variant='danger' onClick={()=>deleteDivision(x.id)}>{t('Hapus','Delete')}</ActionButton>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </DataTable>
            ) : (
              <div className='p-5'>
                <EmptyState icon='🏛️' title={t('Belum ada division.','No divisions yet.')} />
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
