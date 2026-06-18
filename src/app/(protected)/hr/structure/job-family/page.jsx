'use client'
import { useState }          from 'react'
import { useStructureStore } from '@/store/structureStore'
import { useT } from '@/store/languageStore'
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td, FormField, Input, Select,
  StatusBadge, ActionButton, EmptyState,
} from '@/components/ui'

const BLANK = { code:'', name:'', description:'', status:'Active' }

export default function JobFamilyPage() {
  const t = useT()
  const { jobFamilies, addJobFamily, updateJobFamily, deleteJobFamily } = useStructureStore()
  const [form,    setForm   ] = useState(BLANK)
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const handleSave = () => {
    if (!form.code || !form.name) return flash(t('Kode dan nama wajib diisi.','Code and name are required.'),'error')
    if (editing) {
      updateJobFamily(editing, form); setEditing(null); flash(t('Job Family diperbarui.','Job Family updated.'))
    } else {
      addJobFamily(form); flash(t('Job Family ditambahkan.','Job Family added.'))
    }
    setForm(BLANK)
  }

  const handleEdit = (x) => {
    setEditing(x.id)
    setForm({ code:x.code, name:x.name, description:x.description||'', status:x.status })
  }

  const activeCount = jobFamilies.filter(j=>j.status==='Active').length

  return (
    <div>
      <PageHeader
        icon='🧩'
        title='Job Family'
        subtitle={t('Pengelompokan jabatan berdasarkan fungsi atau bidang keahlian.','Job grouping based on function or area of expertise.')}
      />

      <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3'>
        <StatCard label={t('Total Job Family','Total Job Family')} value={jobFamilies.length} icon='🧩' tone='brand' />
        <StatCard label={t('Aktif','Active')} value={activeCount} icon='✅' tone='green' />
        <StatCard label={t('Tidak Aktif','Inactive')} value={jobFamilies.length-activeCount} icon='⏸️' tone='gray' />
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Form */}
        <SectionCard title={`${editing?t('Edit','Edit'):t('Tambah','Add')} Job Family`} icon={editing?'✏️':'➕'}>
          {msg && <div className={`mb-3 rounded-lg px-3 py-2 text-xs ${msg.type==='error'?'bg-red-50 text-red-600':'bg-emerald-50 text-emerald-700'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <FormField label={t('Kode','Code')} required>
              <Input value={form.code} onChange={e=>setForm(f=>({...f,code:e.target.value}))} />
            </FormField>
            <FormField label={t('Nama Job Family','Job Family Name')} required>
              <Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            </FormField>
            <FormField label={t('Deskripsi','Description')}>
              <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                rows={3} placeholder={t('Opsional','Optional')}
                className='w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 shadow-sm transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100' />
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
          <SectionCard title={t('Daftar Job Family','Job Family List')} icon='🧩' bodyClass='p-0'>
            {jobFamilies.length ? (
              <DataTable
                className='rounded-none shadow-none ring-0'
                columns={[t('Kode','Code'),t('Nama','Name'),t('Deskripsi','Description'),'Status',{label:t('Aksi','Action'),align:'right'}]}
              >
                {jobFamilies.map(x=>(
                  <Tr key={x.id}>
                    <Td className='font-mono text-xs text-gray-500'>{x.code}</Td>
                    <Td className='font-medium text-gray-800'>{x.name}</Td>
                    <Td className='max-w-xs truncate text-xs text-gray-500'>{x.description||'-'}</Td>
                    <Td><StatusBadge status={x.status} /></Td>
                    <Td align='right'>
                      <div className='flex justify-end gap-2'>
                        <ActionButton size='sm' variant='secondary' onClick={()=>handleEdit(x)}>Edit</ActionButton>
                        <ActionButton size='sm' variant='danger' onClick={()=>deleteJobFamily(x.id)}>{t('Hapus','Delete')}</ActionButton>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </DataTable>
            ) : (
              <div className='p-5'>
                <EmptyState icon='🧩' title={t('Belum ada job family.','No job families yet.')} />
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
