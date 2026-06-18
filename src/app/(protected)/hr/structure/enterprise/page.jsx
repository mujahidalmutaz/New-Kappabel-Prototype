'use client'
import { useState }           from 'react'
import { useStructureStore }  from '@/store/structureStore'
import { useT } from '@/store/languageStore'
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td, FormField, Input, Select,
  StatusBadge, ActionButton, EmptyState, BRAND_GRADIENT,
} from '@/components/ui'

const BLANK = { code:'', name:'', country:'Indonesia', industry:'', status:'Active' }

export default function EnterprisePage() {
  const t = useT()
  const { enterprises, addEnterprise, updateEnterprise, deleteEnterprise } = useStructureStore()
  const [form,    setForm   ] = useState(BLANK)
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleSave = () => {
    if (!form.code || !form.name) return flash(t('Kode dan nama wajib diisi.','Code and name are required.'),'error')
    if (editing) { updateEnterprise(editing, form); setEditing(null); flash(t('Enterprise diperbarui.','Enterprise updated.')) }
    else         { addEnterprise(form);              flash(t('Enterprise ditambahkan.','Enterprise added.')) }
    setForm(BLANK)
  }

  const handleEdit = (x) => { setEditing(x.id); setForm({ code:x.code, name:x.name, country:x.country, industry:x.industry, status:x.status }) }

  const activeCount = enterprises.filter(e=>e.status==='Active').length

  return (
    <div>
      <PageHeader
        icon='🌐'
        title='Enterprise'
        subtitle={t('Level tertinggi struktur organisasi perusahaan.','Highest level of the organizational structure.')}
      />

      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3'>
        <StatCard label={t('Total Enterprise','Total Enterprise')} value={enterprises.length} icon='🌐' tone='brand' />
        <StatCard label={t('Aktif','Active')} value={activeCount} icon='✅' tone='green' />
        <StatCard label={t('Tidak Aktif','Inactive')} value={enterprises.length-activeCount} icon='⏸️' tone='gray' />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Form */}
        <SectionCard
          title={`${editing?t('Edit','Edit'):t('Tambah','Add')} Enterprise`}
          icon={editing?'✏️':'➕'}
        >
          {msg && <div className={`mb-3 rounded-lg px-3 py-2 text-xs ${msg.type==='error'?'bg-red-50 text-red-600':'bg-emerald-50 text-emerald-700'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            {[[t('Kode','Code'),'text','code',true],[t('Nama Enterprise','Enterprise Name'),'text','name',true],[t('Negara','Country'),'text','country',false],[t('Industri','Industry'),'text','industry',false]].map(([lbl,type,key,req])=>(
              <FormField key={key} label={lbl} required={req}>
                <Input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} />
              </FormField>
            ))}
            <FormField label='Status'>
              <Select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option>Active</option><option>Inactive</option>
              </Select>
            </FormField>
            <div className='flex gap-2 pt-1'>
              <ActionButton onClick={handleSave} className='flex-1'>
                {editing ? t('Simpan','Save') : t('Tambah','Add')}
              </ActionButton>
              {editing && <ActionButton variant='secondary' onClick={()=>{setEditing(null);setForm(BLANK)}}>{t('Batal','Cancel')}</ActionButton>}
            </div>
          </div>
        </SectionCard>

        {/* Table */}
        <div className='lg:col-span-2'>
          <SectionCard title={t('Daftar Enterprise','Enterprise List')} icon='🌐' bodyClass='p-0'>
            {enterprises.length ? (
              <DataTable
                className='rounded-none shadow-none ring-0'
                columns={[t('Kode','Code'),t('Nama','Name'),t('Negara','Country'),t('Industri','Industry'),'Status',{label:t('Aksi','Action'),align:'right'}]}
              >
                {enterprises.map(x=>(
                  <Tr key={x.id}>
                    <Td className='font-mono text-xs text-gray-500'>{x.code}</Td>
                    <Td className='font-medium text-gray-800'>{x.name}</Td>
                    <Td>{x.country}</Td>
                    <Td>{x.industry||'-'}</Td>
                    <Td><StatusBadge status={x.status} /></Td>
                    <Td align='right'>
                      <div className='flex justify-end gap-2'>
                        <ActionButton size='sm' variant='secondary' onClick={()=>handleEdit(x)}>Edit</ActionButton>
                        <ActionButton size='sm' variant='danger' onClick={()=>deleteEnterprise(x.id)}>{t('Hapus','Delete')}</ActionButton>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </DataTable>
            ) : (
              <div className='p-5'>
                <EmptyState icon='🌐' title={t('Belum ada enterprise.','No enterprises yet.')} description={t('Tambahkan enterprise pertama Anda.','Add your first enterprise.')} />
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
