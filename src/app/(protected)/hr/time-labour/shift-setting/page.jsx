'use client'
import { useState }      from 'react'
import { useShiftStore } from '@/store/shiftStore'
import { useT }          from '@/store/languageStore'
import { workHoursDisplay } from '@/utils/attendanceUtils'
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td,
  FormField, Input, ActionButton, EmptyState,
} from '@/components/ui'

export default function ShiftSettingPage() {
  const t = useT()
  const { shifts, addShift, updateShift, deleteShift } = useShiftStore()
  const [form,    setForm   ] = useState({ name: '', startTime: '', endTime: '', breakMinutes: 60 })
  const [editing, setEditing] = useState(null)
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  const handleSave = () => {
    if (!form.name || !form.startTime || !form.endTime)
      return flash(t('Semua field wajib diisi.', 'All fields are required.'), 'error')
    if (editing) {
      updateShift(editing, form); setEditing(null)
      flash(t('Shift diperbarui.', 'Shift updated.'))
    } else {
      addShift(form)
      flash(t('Shift ditambahkan.', 'Shift added.'))
    }
    setForm({ name: '', startTime: '', endTime: '', breakMinutes: 60 })
  }

  const handleEdit = (s) => {
    setEditing(s.id)
    setForm({ name: s.name, startTime: s.startTime, endTime: s.endTime, breakMinutes: s.breakMinutes })
  }

  const fields = [
    [t('Nama Shift', 'Shift Name'), 'text',   'name'      ],
    [t('Jam Masuk',  'Start Time'), 'time',   'startTime' ],
    [t('Jam Keluar', 'End Time'),   'time',   'endTime'   ],
  ]

  const avgBreak = shifts.length
    ? Math.round(shifts.reduce((a, s) => a + (s.breakMinutes || 0), 0) / shifts.length)
    : 0

  return (
    <div>
      <PageHeader
        icon='🕒'
        title={t('Shift Setting', 'Shift Setting')}
        subtitle={t('Kelola definisi shift kerja.', 'Manage work shift definitions.')}
      />

      <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <StatCard tone='brand'  label={t('Total Shift', 'Total Shifts')}  value={shifts.length} icon='🕒' />
        <StatCard tone='blue'   label={t('Rata-rata Istirahat', 'Avg Break')} value={`${avgBreak} ${t('mnt', 'min')}`} icon='☕' />
        <StatCard tone='green'  label={t('Shift Aktif', 'Active Shifts')} value={shifts.length} icon='✅' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form */}
        <SectionCard
          icon={editing ? '✏️' : '➕'}
          title={editing ? t('Edit Shift', 'Edit Shift') : t('Tambah Shift', 'Add Shift')}
        >
          {msg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {msg.text}
            </div>
          )}
          <div className='flex flex-col gap-3'>
            {fields.map(([lbl, type, key]) => (
              <FormField key={key} label={lbl} required>
                <Input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </FormField>
            ))}
            <FormField label={t('Istirahat (menit)', 'Break (minutes)')}>
              <Input type='number' value={form.breakMinutes} onChange={e => setForm(f => ({ ...f, breakMinutes: +e.target.value }))} />
            </FormField>
            <div className='flex gap-2 pt-1'>
              <ActionButton onClick={handleSave} className='flex-1'>
                {editing ? t('Simpan', 'Save') : t('Tambah', 'Add')}
              </ActionButton>
              {editing && (
                <ActionButton variant='secondary' onClick={() => { setEditing(null); setForm({ name: '', startTime: '', endTime: '', breakMinutes: 60 }) }}>
                  {t('Batal', 'Cancel')}
                </ActionButton>
              )}
            </div>
          </div>
        </SectionCard>

        {/* List */}
        <div className='lg:col-span-2'>
          {shifts.length ? (
            <DataTable
              columns={[
                t('Nama','Name'),
                t('Jam Masuk','Start'),
                t('Jam Keluar','End'),
                { label: t('Istirahat','Break'), align: 'right' },
                { label: t('Jam Kerja','Work Hours'), align: 'right' },
                { label: t('Aksi','Action'), align: 'right' },
              ]}
            >
              {shifts.map(s => (
                <Tr key={s.id}>
                  <Td className='font-medium text-gray-800'>{s.name}</Td>
                  <Td>{s.startTime}</Td>
                  <Td>{s.endTime}</Td>
                  <Td align='right'>{s.breakMinutes} {t('menit', 'min')}</Td>
                  <Td align='right'>{workHoursDisplay(s.startTime, s.endTime, s.breakMinutes, t)}</Td>
                  <Td align='right'>
                    <div className='flex justify-end gap-2'>
                      <ActionButton size='sm' variant='secondary' onClick={() => handleEdit(s)}>
                        {t('Edit', 'Edit')}
                      </ActionButton>
                      <button onClick={() => deleteShift(s.id)}
                        className='px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100'>
                        {t('Hapus', 'Delete')}
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </DataTable>
          ) : (
            <EmptyState icon='🕒' title={t('Belum ada shift.', 'No shifts yet.')}
              description={t('Tambahkan shift kerja pertama Anda.', 'Add your first work shift.')} />
          )}
        </div>
      </div>
    </div>
  )
}
