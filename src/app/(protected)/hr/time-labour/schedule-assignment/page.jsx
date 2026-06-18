'use client'
import { useState }        from 'react'
import { useShiftStore }   from '@/store/shiftStore'
import { useEmployeeStore } from '@/store/employeeStore'
import { useT }            from '@/store/languageStore'
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td,
  FormField, Input, Select, ActionButton, EmptyState,
} from '@/components/ui'

export default function ScheduleAssignmentPage() {
  const t = useT()
  const { schedules, assignments, addAssignment, deleteAssignment } = useShiftStore()
  const { employees } = useEmployeeStore()
  const [form, setForm] = useState({ userId: '', scheduleId: '', startDate: '' })
  const [msg,  setMsg ] = useState(null)

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  const handleSave = () => {
    if (!form.userId || !form.scheduleId || !form.startDate)
      return flash(t('Semua field wajib diisi.', 'All fields are required.'), 'error')
    const emp = employees.find(e => e.id === +form.userId)
    addAssignment({ userId: +form.userId, name: emp?.name || '', scheduleId: +form.scheduleId, startDate: form.startDate })
    setForm({ userId: '', scheduleId: '', startDate: '' })
    flash(t('Assignment ditambahkan.', 'Assignment added.'))
  }

  const scheduleName = (id) => schedules.find(s => s.id === id)?.name || '—'
  const empName      = (id) => employees.find(e => e.id === id)?.name || '—'
  const activeEmps   = employees.filter(e => e.status === 'Active')

  return (
    <div>
      <PageHeader
        icon='🧑‍💼'
        title={t('Schedule Assignment', 'Schedule Assignment')}
        subtitle={t('Assign jadwal kerja ke karyawan.', 'Assign work schedules to employees.')}
      />

      <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3'>
        <StatCard tone='brand' label={t('Total Assignment', 'Total Assignments')} value={assignments.length} icon='🧑‍💼' />
        <StatCard tone='blue'  label={t('Schedule Tersedia', 'Available Schedules')} value={schedules.length} icon='📆' />
        <StatCard tone='green' label={t('Karyawan Aktif', 'Active Employees')} value={activeEmps.length} icon='✅' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <SectionCard icon='➕' title={t('Assign Schedule', 'Assign Schedule')}>
          {msg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {msg.text}
            </div>
          )}
          <div className='flex flex-col gap-3'>
            <FormField label={t('Karyawan', 'Employee')} required>
              <Select value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}>
                <option value=''>— {t('Pilih Karyawan', 'Select Employee')} —</option>
                {activeEmps.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </FormField>
            <FormField label={t('Work Schedule', 'Work Schedule')} required>
              <Select value={form.scheduleId} onChange={e => setForm(f => ({ ...f, scheduleId: e.target.value }))}>
                <option value=''>— {t('Pilih Schedule', 'Select Schedule')} —</option>
                {schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </FormField>
            <FormField label={t('Tanggal Mulai', 'Start Date')} required>
              <Input type='date' value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </FormField>
            <ActionButton onClick={handleSave}>{t('Assign', 'Assign')}</ActionButton>
          </div>
        </SectionCard>

        <div className='lg:col-span-2'>
          {assignments.length ? (
            <DataTable
              columns={[
                t('Karyawan','Employee'),
                t('Schedule','Schedule'),
                t('Mulai','Start'),
                { label: t('Aksi','Action'), align: 'right' },
              ]}
            >
              {assignments.map(a => (
                <Tr key={a.id}>
                  <Td className='font-medium text-gray-800'>{a.name || empName(a.userId)}</Td>
                  <Td>{scheduleName(a.scheduleId)}</Td>
                  <Td>{a.startDate}</Td>
                  <Td align='right'>
                    <button onClick={() => deleteAssignment(a.id)}
                      className='px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100'>
                      {t('Hapus', 'Delete')}
                    </button>
                  </Td>
                </Tr>
              ))}
            </DataTable>
          ) : (
            <EmptyState icon='🧑‍💼' title={t('Belum ada assignment.', 'No assignments yet.')}
              description={t('Assign jadwal kerja pertama ke karyawan.', 'Assign your first work schedule to an employee.')} />
          )}
        </div>
      </div>
    </div>
  )
}
