'use client'
import { useState }          from 'react'
import { useStructureStore } from '@/store/structureStore'
import { useT } from '@/store/languageStore'
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td, FormField, Input, Select,
  StatusBadge, ActionButton, EmptyState,
} from '@/components/ui'

const BLANK = { companyId:'', code:'', name:'', costCenter:'', status:'Active' }

export default function BusinessUnitPage() {
  const t = useT()
  const { companies, businessUnits, addBusinessUnit, updateBusinessUnit, deleteBusinessUnit } = useStructureStore()
  const [form,    setForm   ] = useState(BLANK)
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleSave = () => {
    if (!form.companyId || !form.code || !form.name) return flash(t('Company, kode, dan nama wajib diisi.','Company, code, and name are required.'),'error')
    if (editing) {
      updateBusinessUnit(editing, {...form, companyId:+form.companyId})
      setEditing(null); flash(t('Business Unit diperbarui.','Business Unit updated.'))
    } else {
      addBusinessUnit({...form, companyId:+form.companyId})
      flash(t('Business Unit ditambahkan.','Business Unit added.'))
    }
    setForm(BLANK)
  }

  const handleEdit = (x) => {
    setEditing(x.id)
    setForm({ companyId:x.companyId, code:x.code, name:x.name, costCenter:x.costCenter||'', status:x.status })
  }

  const coName = (id) => companies.find(c=>c.id===id)?.name || '-'
  const activeCount = businessUnits.filter(b=>b.status==='Active').length

  return (
    <div>
      <PageHeader
        icon='💼'
        title='Business Unit'
        subtitle={t('Unit bisnis operasional di bawah Company.','Operational business unit under Company.')}
      />

      {/* Breadcrumb */}
      <div className='mb-6 flex items-center gap-2 text-xs text-gray-400'>
        <span className='px-2.5 py-1'>Enterprise</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Division</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Company</span>
        <span>→</span>
        <span className='rounded-full bg-red-600 px-2.5 py-1 font-semibold text-white'>Business Unit</span>
        <span>→</span>
        <span className='px-2.5 py-1'>Department</span>
      </div>

      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3'>
        <StatCard label={t('Total Business Unit','Total Business Unit')} value={businessUnits.length} icon='💼' tone='brand' />
        <StatCard label={t('Aktif','Active')} value={activeCount} icon='✅' tone='green' />
        <StatCard label={t('Tidak Aktif','Inactive')} value={businessUnits.length-activeCount} icon='⏸️' tone='gray' />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Form */}
        <SectionCard title={`${editing?t('Edit','Edit'):t('Tambah','Add')} Business Unit`} icon={editing?'✏️':'➕'}>
          {msg && <div className={`mb-3 rounded-lg px-3 py-2 text-xs ${msg.type==='error'?'bg-red-50 text-red-600':'bg-emerald-50 text-emerald-700'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <FormField label='Company' required>
              <Select value={form.companyId} onChange={e=>setForm(f=>({...f,companyId:e.target.value}))}>
                <option value=''>-- {t('Pilih Company','Select Company')} --</option>
                {companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </FormField>
            {[[t('Kode','Code'),'code',true],[t('Nama Business Unit','Business Unit Name'),'name',true],['Cost Center','costCenter',false]].map(([lbl,key,req])=>(
              <FormField key={key} label={lbl} required={req}>
                <Input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  placeholder={key==='costCenter'?t('Opsional','Optional'):''} />
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
          <SectionCard title={t('Daftar Business Unit','Business Unit List')} icon='💼' bodyClass='p-0'>
            {businessUnits.length ? (
              <DataTable
                className='rounded-none shadow-none ring-0'
                columns={[t('Kode','Code'),t('Nama Business Unit','Business Unit Name'),'Company','Cost Center','Status',{label:t('Aksi','Action'),align:'right'}]}
              >
                {businessUnits.map(x=>(
                  <Tr key={x.id}>
                    <Td className='font-mono text-xs text-gray-500'>{x.code}</Td>
                    <Td className='font-medium text-gray-800'>{x.name}</Td>
                    <Td className='text-xs text-gray-500'>{coName(x.companyId)}</Td>
                    <Td>{x.costCenter||'-'}</Td>
                    <Td><StatusBadge status={x.status} /></Td>
                    <Td align='right'>
                      <div className='flex justify-end gap-2'>
                        <ActionButton size='sm' variant='secondary' onClick={()=>handleEdit(x)}>Edit</ActionButton>
                        <ActionButton size='sm' variant='danger' onClick={()=>deleteBusinessUnit(x.id)}>{t('Hapus','Delete')}</ActionButton>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </DataTable>
            ) : (
              <div className='p-5'>
                <EmptyState icon='💼' title={t('Belum ada business unit.','No business units yet.')} />
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
