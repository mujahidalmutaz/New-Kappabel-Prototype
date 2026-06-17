'use client'
import { useState }      from 'react'
import { useShiftStore } from '@/store/shiftStore'
import { useT }          from '@/store/languageStore'
import { workHoursDisplay } from '@/utils/attendanceUtils'

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

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Shift Setting', 'Shift Setting')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Kelola definisi shift kerja.', 'Manage work shift definitions.')}</p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>
            {editing ? `✏️ ${t('Edit Shift', 'Edit Shift')}` : `➕ ${t('Tambah Shift', 'Add Shift')}`}
          </h2>
          {msg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {msg.text}
            </div>
          )}
          <div className='flex flex-col gap-3'>
            {fields.map(([lbl, type, key]) => (
              <div key={key}>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>{lbl}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
            ))}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>
                {t('Istirahat (menit)', 'Break (minutes)')}
              </label>
              <input type='number' value={form.breakMinutes} onChange={e => setForm(f => ({ ...f, breakMinutes: +e.target.value }))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </div>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90'
                style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                {editing ? t('Simpan', 'Save') : t('Tambah', 'Add')}
              </button>
              {editing && (
                <button onClick={() => { setEditing(null); setForm({ name: '', startTime: '', endTime: '', breakMinutes: 60 }) }}
                  className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200'>
                  {t('Batal', 'Cancel')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>📋 {t('Daftar Shift', 'Shift List')}</h2>
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-50'>
                  {[t('Nama','Name'), t('Jam Masuk','Start'), t('Jam Keluar','End'), t('Istirahat','Break'), t('Jam Kerja','Work Hours'), t('Aksi','Action')].map(h => (
                    <th key={h} className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shifts.length ? shifts.map(s => (
                  <tr key={s.id} className='border-t border-gray-100 hover:bg-gray-50'>
                    <td className='px-4 py-2.5 font-medium text-gray-700'>{s.name}</td>
                    <td className='px-4 py-2.5 text-gray-600'>{s.startTime}</td>
                    <td className='px-4 py-2.5 text-gray-600'>{s.endTime}</td>
                    <td className='px-4 py-2.5 text-gray-600'>{s.breakMinutes} {t('menit', 'min')}</td>
                    <td className='px-4 py-2.5 text-gray-600'>{workHoursDisplay(s.startTime, s.endTime, s.breakMinutes, t)}</td>
                    <td className='px-4 py-2.5'>
                      <div className='flex gap-2'>
                        <button onClick={() => handleEdit(s)}
                          className='px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>
                          {t('Edit', 'Edit')}
                        </button>
                        <button onClick={() => deleteShift(s.id)}
                          className='px-3 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>
                          {t('Hapus', 'Delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className='px-4 py-8 text-center text-gray-400 text-sm'>{t('Belum ada shift.', 'No shifts yet.')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
