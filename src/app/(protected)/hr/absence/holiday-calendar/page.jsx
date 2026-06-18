'use client'
import { useState }        from 'react'
import { useHolidayStore } from '@/store/holidayStore'
import { useT } from '@/store/languageStore'
import { PageHeader, SectionCard, DataTable, Tr, Td, FilterBar, FilterPill, StatusBadge, ActionButton, EmptyState, FormField, Input, Select } from '@/components/ui'

const COUNTRIES = ['ID','SG']

export default function HolidayCalendarPage() {
  const t = useT()
  const { holidays, addHoliday, updateHoliday, deleteHoliday } = useHolidayStore()
  const [country, setCountry] = useState('ID')
  const [year,    setYear   ] = useState(new Date().getFullYear())
  const [form,    setForm   ] = useState({ name:'', date:'', type:'National', recurring:false })
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const filtered = holidays
    .filter(h => h.country === country && new Date(h.date).getFullYear() === year)
    .sort((a,b) => a.date.localeCompare(b.date))

  const flash = (text, type='success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleSave = () => {
    if (!form.name || !form.date) return flash('Nama dan tanggal wajib diisi.', 'error')
    if (editing) {
      updateHoliday(editing, { ...form, country })
      setEditing(null)
      flash('Hari libur diperbarui.')
    } else {
      addHoliday({ ...form, country })
      flash('Hari libur ditambahkan.')
    }
    setForm({ name:'', date:'', type:'National', recurring:false })
  }

  const handleEdit = (h) => {
    setEditing(h.id)
    setForm({ name:h.name, date:h.date, type:h.type, recurring:h.recurring })
  }

  const resetForm = () => { setEditing(null); setForm({ name:'', date:'', type:'National', recurring:false }) }

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        icon='🗓️'
        title='Holiday Calendar'
        subtitle={t('Kelola hari libur nasional per negara dan tahun.', 'Manage national holidays by country and year.')}
      />

      {/* Filters */}
      <FilterBar>
        <span className='text-xs font-semibold text-gray-500 mr-1'>{t('Negara', 'Country')}:</span>
        {COUNTRIES.map(c => (
          <FilterPill key={c} active={country === c} onClick={() => setCountry(c)}>{c}</FilterPill>
        ))}
        <span className='text-xs font-semibold text-gray-500 mx-1'>{t('Tahun', 'Year')}:</span>
        {[year-1, year, year+1].map(y => (
          <FilterPill key={y} active={year === y} onClick={() => setYear(y)}>{y}</FilterPill>
        ))}
      </FilterBar>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form */}
        <SectionCard
          title={editing ? t('Edit Hari Libur', 'Edit Holiday') : t('Tambah Hari Libur', 'Add Holiday')}
          icon={editing ? '✏️' : '➕'}
        >
          {msg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {msg.text}
            </div>
          )}
          <div className='flex flex-col gap-4'>
            <FormField label={t('Nama', 'Name')} required>
              <Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
                placeholder={t('Nama hari libur', 'Holiday name')} />
            </FormField>
            <FormField label={t('Tanggal', 'Date')} required>
              <Input type='date' value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
            </FormField>
            <FormField label={t('Tipe', 'Type')}>
              <Select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option value='National'>{t('Nasional', 'National')}</option>
                <option value='Company'>{t('Perusahaan', 'Company')}</option>
              </Select>
            </FormField>
            <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer'>
              <input type='checkbox' checked={form.recurring} onChange={e=>setForm(f=>({...f,recurring:e.target.checked}))}
                className='h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-200' />
              {t('Berulang setiap tahun', 'Repeat every year')}
            </label>
            <div className='flex gap-2 pt-1'>
              <ActionButton variant='primary' className='flex-1' onClick={handleSave}>
                {editing ? t('Simpan', 'Save') : t('Tambah', 'Add')}
              </ActionButton>
              {editing && (
                <ActionButton variant='secondary' onClick={resetForm}>
                  {t('Batal', 'Cancel')}
                </ActionButton>
              )}
            </div>
          </div>
        </SectionCard>

        {/* List */}
        <SectionCard
          className='lg:col-span-2'
          title={`${t('Daftar Hari Libur', 'Holiday List')} — ${country} ${year}`}
          icon='🗓️'
          subtitle={`${filtered.length} ${t('hari', 'days')}`}
          bodyClass='p-0'
        >
          <DataTable
            columns={[
              { label: t('Tanggal', 'Date') },
              { label: t('Nama', 'Name') },
              { label: t('Tipe', 'Type') },
              { label: t('Berulang', 'Recurring'), align: 'center' },
              { label: t('Aksi', 'Action'), align: 'right' },
            ]}
            className='ring-0 shadow-none rounded-none'
          >
            {filtered.length ? filtered.map(h => (
              <Tr key={h.id}>
                <Td className='text-gray-600 tabular-nums'>{h.date}</Td>
                <Td className='font-medium text-gray-800'>{h.name}</Td>
                <Td>
                  <StatusBadge tone={h.type === 'National' ? 'info' : 'neutral'}>
                    {h.type === 'National' ? t('Nasional', 'National') : t('Perusahaan', 'Company')}
                  </StatusBadge>
                </Td>
                <Td align='center' className='text-gray-500'>{h.recurring ? '✅' : '—'}</Td>
                <Td align='right'>
                  <div className='flex justify-end gap-2'>
                    <ActionButton size='sm' variant='secondary' onClick={() => handleEdit(h)}>
                      {t('Edit', 'Edit')}
                    </ActionButton>
                    <ActionButton size='sm' variant='secondary'
                      className='!bg-red-50 !text-red-600 !border-red-100 hover:!bg-red-100'
                      onClick={() => deleteHoliday(h.id)}>
                      {t('Hapus', 'Delete')}
                    </ActionButton>
                  </div>
                </Td>
              </Tr>
            )) : (
              <tr>
                <td colSpan={5} className='px-4 py-10'>
                  <EmptyState icon='🗓️'
                    title={t(`Belum ada hari libur untuk ${country} ${year}.`, `No holidays for ${country} ${year}.`)} />
                </td>
              </tr>
            )}
          </DataTable>
        </SectionCard>
      </div>
    </div>
  )
}
