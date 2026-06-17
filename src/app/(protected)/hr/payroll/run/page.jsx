'use client'
import { useState }                    from 'react'
import { usePayrollStore, formatRp }   from '@/store/payrollStore'
import { useT } from '@/store/languageStore'

export default function PayrollRunPage() {
  const t = useT()
  const { payslips, publishPeriod } = usePayrollStore()

  const periodList = [...new Set(payslips.map(p=>p.period))].sort((a,b)=>b.localeCompare(a))
  const [period, setPeriod] = useState(() => periodList[0] || '')
  const [msg, setMsg] = useState(null)

  const flash = (text,type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  const rows    = payslips.filter(p=>p.period===period)
  const isDraft = rows.some(p=>p.status==='Draft')

  const handlePublish = () => {
    publishPeriod(period)
    flash(`${t('Payroll berhasil dipublish!','Payroll published successfully!')} — ${period}`)
  }

  const totalNet = rows.reduce((s,p)=>s+p.net, 0)

  const summaryCards = [
    { label: t('Total Karyawan','Total Employees'),    value: rows.length },
    { label: t('Total Gaji Pokok','Total Basic Salary'), value: formatRp(rows.reduce((s,p)=>s+p.basic,0)) },
    { label: t('Total Take-Home','Total Take-Home'),   value: formatRp(totalNet) },
  ]

  const tableHeaders = [
    t('Nama','Name'), t('Gaji Pokok','Basic Salary'), t('Tunjangan','Allowance'),
    t('Potongan','Deduction'), t('Take-Home','Take-Home'), t('Status','Status'),
  ]

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Payroll Run</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Review dan publish payroll bulanan.','Review and publish monthly payroll.')}</p>

      {/* Period selector */}
      <div className='bg-white rounded-xl p-6 shadow-sm mb-6 flex flex-wrap items-center gap-4'>
        <div>
          <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Periode','Period')}</label>
          <select value={period} onChange={e=>setPeriod(e.target.value)}
            aria-label={t('Pilih periode payroll','Select payroll period')}
            className='px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
            {periodList.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {msg && (
          <div className={`text-xs px-4 py-2 rounded-lg ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>
            {msg.text}
          </div>
        )}
        <div className='ml-auto'>
          {isDraft ? (
            <button onClick={handlePublish}
              aria-label={t('Publish payroll untuk periode ini','Publish payroll for this period')}
              className='px-6 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90'
              style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
              🚀 {t('Publish Payroll','Publish Payroll')}
            </button>
          ) : (
            <span className='text-xs font-semibold px-3 py-2 rounded-full bg-green-100 text-green-700'>✅ {t('Dipublish','Published')}</span>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6'>
        {summaryCards.map(c=>(
          <div key={c.label} className='bg-white rounded-xl p-5 shadow-sm'>
            <div className='text-lg font-bold text-gray-800'>{c.value}</div>
            <div className='text-xs text-gray-500 mt-1'>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className='bg-white rounded-xl p-6 shadow-sm'>
        <h2 className='text-sm font-bold text-gray-700 mb-4'>💼 {t('Detail Payroll','Payroll Detail')} — {period}</h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-gray-50'>
                {tableHeaders.map(h=>(
                  <th key={h} scope='col' className='text-left px-4 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map(p=>(
                <tr key={p.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-4 py-2.5 font-medium text-gray-700'>{p.name}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{formatRp(p.basic)}</td>
                  <td className='px-4 py-2.5 text-gray-600'>{formatRp(p.allowance)}</td>
                  <td className='px-4 py-2.5 text-red-500'>-{formatRp(p.deduction)}</td>
                  <td className='px-4 py-2.5 font-semibold text-gray-800'>{formatRp(p.net)}</td>
                  <td className='px-4 py-2.5'>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.status==='Published'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                      {p.status === 'Published' ? t('Dipublish','Published') : t('Draft','Draft')}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className='px-4 py-8 text-center text-gray-400 text-sm'>
                  {t('Tidak ada data untuk periode ini.','No data for this period.')}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
