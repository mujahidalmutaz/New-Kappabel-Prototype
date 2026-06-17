'use client'
import { useState }        from 'react'
import { useShiftStore }   from '@/store/shiftStore'
import { useEmployeeStore } from '@/store/employeeStore'
import { useT }            from '@/store/languageStore'

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
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Schedule Assignment', 'Schedule Assignment')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Assign jadwal kerja ke karyawan.', 'Assign work schedules to employees.')}</p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>➕ {t('Assign Schedule', 'Assign Schedule')}</h2>
          {msg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {msg.text}
            </div>
          )}
          <div className='flex flex-col gap-3'>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Karyawan', 'Employee')}</label>
              <select value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>— {t('Pilih Karyawan', 'Select Employee')} —</option>
                {activeEmps.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Work Schedule', 'Work Schedule')}</label>
              <select value={form.scheduleId} onChange={e => setForm(f => ({ ...f, scheduleId: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>— {t('Pilih Schedule', 'Select Schedule')} —</option>
                {schedules.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Tanggal Mulai', 'Start Date')}</label>
              <input type='date' value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <button onClick={handleSave} className='py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90'
              style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
              {t('Assign', 'Assign')}
            </button>
          </div>
        </div>

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>📋 {t('Daftar Assignment', 'Assignment List')}</h2>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-50'>
                  {[t('Karyawan','Employee'), t('Schedule','Schedule'), t('Mulai','Start'), t('Aksi','Action')].map(h => (
                    <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.length ? assignments.map(a => (
                  <tr key={a.id} className='border-t border-gray-100 hover:bg-gray-50'>
                    <td className='px-4 py-2.5 font-medium text-gray-700'>{a.name || empName(a.userId)}</td>
                    <td className='px-4 py-2.5 text-gray-600'>{scheduleName(a.scheduleId)}</td>
                    <td className='px-4 py-2.5 text-gray-600'>{a.startDate}</td>
                    <td className='px-4 py-2.5'>
                      <button onClick={() => deleteAssignment(a.id)}
                        className='px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>
                        {t('Hapus', 'Delete')}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className='px-4 py-8 text-center text-gray-400 text-sm'>{t('Belum ada assignment.', 'No assignments yet.')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
