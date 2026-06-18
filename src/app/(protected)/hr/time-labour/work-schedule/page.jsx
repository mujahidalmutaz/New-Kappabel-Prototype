'use client'
import { useState }      from 'react'
import { useShiftStore } from '@/store/shiftStore'
import { useT }          from '@/store/languageStore'
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td,
  FormField, Input, Select, ActionButton, EmptyState,
} from '@/components/ui'

export default function WorkSchedulePage() {
  const t = useT()
  const { schedules, patterns, addSchedule, deleteSchedule } = useShiftStore()
  const [form, setForm] = useState({ name: '', patternId: '', effectiveDate: '' })
  const [msg,  setMsg ] = useState(null)

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  const handleSave = () => {
    if (!form.name || !form.patternId || !form.effectiveDate)
      return flash(t('Semua field wajib diisi.', 'All fields are required.'), 'error')
    addSchedule({ ...form, patternId: +form.patternId })
    setForm({ name: '', patternId: '', effectiveDate: '' })
    flash(t('Work schedule ditambahkan.', 'Work schedule added.'))
  }

  const patternName = (id) => patterns.find(p => p.id === id)?.name || '—'

  return (
    <div>
      <PageHeader
        icon='📆'
        title={t('Work Schedule', 'Work Schedule')}
        subtitle={t('Buat jadwal kerja berdasarkan shift pattern.', 'Create work schedules based on shift patterns.')}
      />

      <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <StatCard tone='brand' label={t('Total Schedule', 'Total Schedules')} value={schedules.length} icon='📆' />
        <StatCard tone='blue'  label={t('Pattern Tersedia', 'Available Patterns')} value={patterns.length} icon='🔁' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <SectionCard icon='➕' title={t('Buat Schedule', 'Create Schedule')}>
          {msg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {msg.text}
            </div>
          )}
          <div className='flex flex-col gap-3'>
            <FormField label={t('Nama Schedule', 'Schedule Name')} required>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </FormField>
            <FormField label={t('Shift Pattern', 'Shift Pattern')} required>
              <Select value={form.patternId} onChange={e => setForm(f => ({ ...f, patternId: e.target.value }))}>
                <option value=''>— {t('Pilih Pattern', 'Select Pattern')} —</option>
                {patterns.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </FormField>
            <FormField label={t('Tanggal Efektif', 'Effective Date')} required>
              <Input type='date' value={form.effectiveDate} onChange={e => setForm(f => ({ ...f, effectiveDate: e.target.value }))} />
            </FormField>
            <ActionButton onClick={handleSave}>{t('Tambah', 'Add')}</ActionButton>
          </div>
        </SectionCard>

        <div className='lg:col-span-2'>
          {schedules.length ? (
            <DataTable
              columns={[
                t('Nama','Name'),
                t('Pattern','Pattern'),
                t('Efektif Mulai','Effective From'),
                { label: t('Aksi','Action'), align: 'right' },
              ]}
            >
              {schedules.map(s => (
                <Tr key={s.id}>
                  <Td className='font-medium text-gray-800'>{s.name}</Td>
                  <Td>{patternName(s.patternId)}</Td>
                  <Td>{s.effectiveDate}</Td>
                  <Td align='right'>
                    <button onClick={() => deleteSchedule(s.id)}
                      className='px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100'>
                      {t('Hapus', 'Delete')}
                    </button>
                  </Td>
                </Tr>
              ))}
            </DataTable>
          ) : (
            <EmptyState icon='📆' title={t('Belum ada schedule.', 'No schedules yet.')}
              description={t('Buat work schedule pertama Anda.', 'Create your first work schedule.')} />
          )}
        </div>
      </div>
    </div>
  )
}
