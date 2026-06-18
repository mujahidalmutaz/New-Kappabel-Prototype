'use client'
import { useState }        from 'react'
import { useHolidayStore } from '@/store/holidayStore'
<<<<<<< HEAD
import { useT }            from '@/store/languageStore'

const COUNTRIES = ['ID', 'SG']
=======
import { useT } from '@/store/languageStore'
import { PageHeader, SectionCard, DataTable, Tr, Td, FilterBar, FilterPill, StatusBadge, ActionButton, EmptyState, FormField, Input, Select } from '@/components/ui'

const COUNTRIES = ['ID','SG']
>>>>>>> worktree-agent-aca6c81ffb81b6db2

export default function HolidayCalendarPage() {
  const t = useT()
  const { holidays, addHoliday, updateHoliday, deleteHoliday } = useHolidayStore()
  const [country, setCountry] = useState('ID')
  const [year,    setYear   ] = useState(new Date().getFullYear())
  const [form,    setForm   ] = useState({ name: '', date: '', type: 'National', recurring: false })
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const filtered = holidays
    .filter(h => h.country === country && new Date(h.date).getFullYear() === year)
    .sort((a, b) => a.date.localeCompare(b.date))

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  const handleSave = () => {
    if (!form.name || !form.date)
      return flash(t('Nama dan tanggal wajib diisi.', 'Name and date are required.'), 'error')
    if (editing) {
      updateHoliday(editing, { ...form, country })
      setEditing(null)
      flash(t('Hari libur diperbarui.', 'Holiday updated.'))
    } else {
      addHoliday({ ...form, country })
      flash(t('Hari libur ditambahkan.', 'Holiday added.'))
    }
    setForm({ name: '', date: '', type: 'National', recurring: false })
  }

  const handleEdit = (h) => {
    setEditing(h.id)
    setForm({ name: h.name, date: h.date, type: h.type, recurring: h.recurring })
  }

<<<<<<< HEAD
  const resetForm = () => { setEditing(null); setForm({ name: '', date: '', type: 'National', recurring: false }) }

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Holiday Calendar', 'Holiday Calendar')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Kelola hari libur nasional per negara dan tahun.', 'Manage national holidays by country and year.')}</p>

      {/* Filters */}
      <div className='flex flex-wrap gap-3 mb-6'>
        <div className='flex gap-1'>
          {COUNTRIES.map(c => (
            <button key={c} onClick={() => setCountry(c)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${country === c ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className='flex gap-1'>
          {[year - 1, year, year + 1].map(y => (
            <button key={y} onClick={() => setYear(y)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${year === y ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {y}
            </button>
          ))}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>
            {editing ? `✏️ ${t('Edit Hari Libur', 'Edit Holiday')}` : `➕ ${t('Tambah Hari Libur', 'Add Holiday')}`}
          </h2>
          {msg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {msg.text}
            </div>
          )}
          <div className='flex flex-col gap-3'>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Nama', 'Name')}</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t('Nama hari libur', 'Holiday name')}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Tanggal', 'Date')}</label>
              <input type='date' value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Tipe', 'Type')}</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value='National'>{t('Nasional', 'National')}</option>
                <option value='Company'>{t('Perusahaan', 'Company')}</option>
              </select>
            </div>
            <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer'>
              <input type='checkbox' checked={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))} />
              {t('Berulang setiap tahun', 'Repeat every year')}
            </label>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave}
                className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                {editing ? t('Simpan', 'Save') : t('Tambah', 'Add')}
              </button>
              {editing && (
                <button onClick={resetForm}
                  className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>
                  {t('Batal', 'Cancel')}
                </button>
=======
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
>>>>>>> worktree-agent-aca6c81ffb81b6db2
              )}
            </div>
          </div>
        </SectionCard>

        {/* List */}
<<<<<<< HEAD
        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>
            🗓️ {t('Daftar Hari Libur', 'Holiday List')} — {country} {year}
            <span className='ml-2 text-xs font-normal text-gray-400'>({filtered.length} {t('hari', 'days')})</span>
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-50'>
                  {[t('Tanggal','Date'), t('Nama','Name'), t('Tipe','Type'), t('Berulang','Recurring'), t('Aksi','Action')].map(h => (
                    <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length ? filtered.map(h => (
                  <tr key={h.id} className='border-t border-gray-100 hover:bg-gray-50'>
                    <td className='px-4 py-2.5 text-gray-600'>{h.date}</td>
                    <td className='px-4 py-2.5 font-medium text-gray-700'>{h.name}</td>
                    <td className='px-4 py-2.5'>
                      <span className='text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold'>
                        {h.type === 'National' ? t('Nasional', 'National') : t('Perusahaan', 'Company')}
                      </span>
                    </td>
                    <td className='px-4 py-2.5 text-gray-500'>{h.recurring ? '✅' : '—'}</td>
                    <td className='px-4 py-2.5'>
                      <div className='flex gap-2'>
                        <button onClick={() => handleEdit(h)}
                          className='px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100 transition'>
                          {t('Edit', 'Edit')}
                        </button>
                        <button onClick={() => deleteHoliday(h.id)}
                          className='px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition'>
                          {t('Hapus', 'Delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className='px-4 py-8 text-center text-gray-400 text-sm'>
                      {t(`Belum ada hari libur untuk ${country} ${year}.`, `No holidays for ${country} ${year}.`)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
=======
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
>>>>>>> worktree-agent-aca6c81ffb81b6db2
      </div>
    </div>
  )
}
