'use client'
import { useState }        from 'react'
import { useAuthStore }    from '@/store/authStore'
import { usePayrollStore, formatRp } from '@/store/payrollStore'
import { useT } from '@/store/languageStore'

export default function PayslipPage() {
  const t = useT()
  const { currentUser }   = useAuthStore()
  const { payslips }      = usePayrollStore()
  const [selected, setSelected] = useState(null)

  const mine = payslips
    .filter(p => p.userId === currentUser?.id && p.status === 'Published')
    .sort((a, b) => b.period.localeCompare(a.period))

  const detail = mine.find(p => p.id === selected) || mine[0]

  const rows = detail ? [
    { label: 'Gaji Pokok',    value: detail.basic,      type: 'income'    },
    { label: 'Tunjangan',     value: detail.allowance,   type: 'income'    },
    { label: 'Potongan',      value: detail.deduction,   type: 'deduction' },
  ] : []

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Payslip</h1>
      <p className='text-gray-500 text-sm mb-6'>Slip gaji bulanan kamu.</p>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Period list */}
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>📅 Periode</h2>
          <div className='flex flex-col gap-2'>
            {mine.length ? mine.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                  (selected === p.id || (!selected && p.id === mine[0]?.id))
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {p.period}
              </button>
            )) : (
              <p className='text-sm text-gray-400'>Belum ada slip gaji.</p>
            )}
          </div>
        </div>

        {/* Slip detail */}
        {detail && (
          <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
            <div className='flex justify-between items-start mb-6'>
              <div>
                <h2 className='text-lg font-bold text-gray-800'>{detail.name}</h2>
                <p className='text-sm text-gray-500'>Periode: {detail.period}</p>
              </div>
              <span className='text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700'>
                Published
              </span>
            </div>

            <table className='w-full text-sm mb-6'>
              <thead>
                <tr className='bg-gray-50'>
                  <th className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>Komponen</th>
                  <th className='text-right px-4 py-2.5 text-xs font-semibold text-gray-500'>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className='border-t border-gray-100'>
                    <td className='px-4 py-2.5 text-gray-700'>{r.label}</td>
                    <td className={`px-4 py-2.5 text-right font-medium ${r.type === 'deduction' ? 'text-red-600' : 'text-gray-800'}`}>
                      {r.type === 'deduction' ? `- ${formatRp(r.value)}` : formatRp(r.value)}
                    </td>
                  </tr>
                ))}
                <tr className='border-t-2 border-gray-200'>
                  <td className='px-4 py-3 font-bold text-gray-800'>Total Take-Home</td>
                  <td className='px-4 py-3 text-right font-bold text-red-600 text-base'>
                    {formatRp(detail.net)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
