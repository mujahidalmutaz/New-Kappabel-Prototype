'use client'
import { useState }      from 'react'
import { useShiftStore } from '@/store/shiftStore'
import { useT }          from '@/store/languageStore'
import {
  PageHeader, StatCard, SectionCard, FormField, Input, Select,
  ActionButton, EmptyState,
} from '@/components/ui'

const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function ShiftPatternPage() {
  const t = useT()
  const { shifts, patterns, addPattern, deletePattern } = useShiftStore()
  const [name,    setName   ] = useState('')
  const [entries, setEntries] = useState({})
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  const dayLabel = (d) => t(
    { Monday:'Senin', Tuesday:'Selasa', Wednesday:'Rabu', Thursday:'Kamis', Friday:'Jumat', Saturday:'Sabtu', Sunday:'Minggu' }[d],
    d
  )

  const handleSave = () => {
    if (!name.trim()) return flash(t('Nama pattern wajib diisi.', 'Pattern name is required.'), 'error')
    const entryArr = DAYS_EN.filter(d => entries[d]).map(d => ({ day: d, shiftId: +entries[d] }))
    if (!entryArr.length) return flash(t('Pilih minimal 1 shift.', 'Select at least 1 shift.'), 'error')
    addPattern({ name, entries: entryArr })
    setName(''); setEntries({})
    flash(t('Pattern ditambahkan.', 'Pattern added.'))
  }

  const shiftName = (id) => shifts.find(s => s.id === id)?.name || '—'

  return (
    <div>
      <PageHeader
        icon='🔁'
        title={t('Shift Pattern', 'Shift Pattern')}
        subtitle={t('Buat pola shift mingguan untuk karyawan.', 'Create weekly shift patterns for employees.')}
      />

      <div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <StatCard tone='brand' label={t('Total Pattern', 'Total Patterns')} value={patterns.length} icon='🔁' />
        <StatCard tone='blue'  label={t('Shift Tersedia', 'Available Shifts')} value={shifts.length} icon='🕒' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Form */}
        <SectionCard icon='➕' title={t('Buat Pattern', 'Create Pattern')}>
          {msg && (
            <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {msg.text}
            </div>
          )}
          <div className='flex flex-col gap-3'>
            <FormField label={t('Nama Pattern', 'Pattern Name')} required>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </FormField>
            {DAYS_EN.map(d => (
              <div key={d} className='flex items-center gap-3'>
                <span className='text-xs font-semibold text-gray-600 w-24'>{dayLabel(d)}</span>
                <Select value={entries[d] || ''} onChange={e => setEntries(en => ({ ...en, [d]: e.target.value }))} className='flex-1'>
                  <option value=''>— {t('Libur', 'Off')} —</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </div>
            ))}
            <ActionButton onClick={handleSave} className='mt-2'>{t('Simpan Pattern', 'Save Pattern')}</ActionButton>
          </div>
        </SectionCard>

        {/* List */}
        <div className='lg:col-span-2'>
          {patterns.length ? (
            <div className='flex flex-col gap-4'>
              {patterns.map(p => (
                <SectionCard
                  key={p.id}
                  title={p.name}
                  actions={
                    <button onClick={() => deletePattern(p.id)}
                      className='px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-50 text-red-600 hover:bg-red-100'>
                      {t('Hapus', 'Delete')}
                    </button>
                  }
                >
                  <div className='grid grid-cols-3 md:grid-cols-4 gap-2'>
                    {p.entries.map((e, i) => (
                      <div key={i} className='bg-red-50 rounded-xl px-3 py-2 text-center'>
                        <div className='text-xs text-gray-500'>{dayLabel(e.day)}</div>
                        <div className='text-xs font-semibold text-red-700'>{shiftName(e.shiftId)}</div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              ))}
            </div>
          ) : (
            <EmptyState icon='🔁' title={t('Belum ada pattern.', 'No patterns yet.')}
              description={t('Buat pola shift mingguan pertama Anda.', 'Create your first weekly shift pattern.')} />
          )}
        </div>
      </div>
    </div>
  )
}
