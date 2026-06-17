'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const INIT_REQUESTS = [
  { id:1, training_name:'AWS Solutions Architect Certification', vendor:'Amazon Web Services', date:'2025-08-15', duration:'3 hari', cost:8500000, status:'Approved', submitted:'2025-07-01' },
  { id:2, training_name:'Project Management Professional (PMP)', vendor:'PMI Indonesia', date:'2025-09-10', duration:'5 hari', cost:15000000, status:'Pending Approval', submitted:'2025-07-10' },
]

const EMPTY = { training_name:'', vendor:'', date:'', duration:'', cost:'', objective:'', approval_note:'' }

export default function RequestExternalTrainingPage() {
  const t = useT()
  const [requests, setRequests] = useState(INIT_REQUESTS)
  const [form,    setForm    ] = useState(EMPTY)
  const [step,    setStep    ] = useState('list')
  const [msg,     setMsg     ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }

  const handleSubmit = () => {
    if (!form.training_name || !form.vendor || !form.date) return flash('Nama training, vendor, dan tanggal wajib diisi.', 'error')
    setRequests(prev=>[...prev, { id:Date.now(), ...form, cost:Number(form.cost)||0, status:'Draft', submitted:new Date().toISOString().slice(0,10) }])
    flash('Pengajuan training eksternal berhasil disimpan sebagai Draft.')
    setForm(EMPTY)
    setStep('list')
  }

  const statusColor = (s) => ({ Draft:'bg-gray-100 text-gray-500', 'Pending Approval':'bg-yellow-50 text-yellow-700', Approved:'bg-green-50 text-green-700', Rejected:'bg-red-50 text-red-700', 'Completed':'bg-blue-50 text-blue-700' }[s])

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Request External Training</h1>
      <p className='text-gray-500 text-sm mb-6'>Ajukan permintaan mengikuti training/sertifikasi eksternal di luar program internal perusahaan.</p>

      {msg && <div className={`text-xs px-4 py-3 rounded-lg mb-4 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}

      {step==='list' && (
        <>
          <div className='flex justify-between items-center mb-4'>
            <div className='flex gap-3'>
              {[['Total', requests.length],['Pending', requests.filter(r=>r.status==='Pending Approval').length],['Approved', requests.filter(r=>r.status==='Approved').length]].map(([l,v])=>(
                <div key={l} className='bg-white rounded-xl px-4 py-3 shadow-sm text-center'>
                  <div className='text-xs text-gray-500'>{l}</div><div className='font-bold text-gray-800'>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setStep('form')} className='px-5 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
              style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>+ Buat Pengajuan Baru</button>
          </div>

          <div className='space-y-4'>
            {requests.map(r=>(
              <div key={r.id} className='bg-white rounded-xl p-5 shadow-sm border border-gray-100'>
                <div className='flex items-start justify-between mb-3'>
                  <div>
                    <div className='font-bold text-gray-800'>{r.training_name}</div>
                    <div className='text-sm text-gray-500 mt-0.5'>{r.vendor} • {r.date} • {r.duration}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(r.status)}`}>{r.status}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-semibold text-gray-700'>Rp {r.cost.toLocaleString('id-ID')}</span>
                  <div className='flex gap-2 text-xs text-gray-400'>
                    <span>Diajukan: {r.submitted}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step==='form' && (
        <div className='bg-white rounded-xl p-6 shadow-sm max-w-2xl'>
          <div className='flex items-center gap-3 mb-6'>
            <button onClick={()=>setStep('list')} className='text-gray-400 hover:text-gray-600'>← Kembali</button>
            <h2 className='font-bold text-gray-700'>Form Pengajuan External Training</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {[['Nama Training/Sertifikasi','training_name','text','md:col-span-2'],['Vendor/Penyelenggara','vendor','text',''],['Tanggal Pelaksanaan','date','date',''],['Durasi (mis: 3 hari)','duration','text',''],['Estimasi Biaya (Rp)','cost','number','']].map(([l,k,t,cl])=>(
              <div key={k} className={cl}>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
            ))}
            <div className='md:col-span-2'>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Tujuan & Justifikasi</label>
              <textarea rows={4} value={form.objective} onChange={e=>setForm(f=>({...f,objective:e.target.value}))} placeholder='Jelaskan tujuan mengikuti training ini dan manfaatnya bagi pekerjaan...'
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' />
            </div>
          </div>
          <div className='flex gap-3 mt-6'>
            <button onClick={handleSubmit} className='flex-1 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
              style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>Submit Pengajuan</button>
            <button onClick={()=>{const d={...form};setRequests(prev=>[...prev,{id:Date.now(),...d,cost:Number(d.cost)||0,status:'Draft',submitted:new Date().toISOString().slice(0,10)}]);setForm(EMPTY);setStep('list');flash('Disimpan sebagai Draft.')}}
              className='px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>Simpan Draft</button>
            <button onClick={()=>setStep('list')} className='px-5 py-2.5 bg-gray-50 text-gray-500 text-sm font-semibold rounded-lg hover:bg-gray-100 transition'>{t('Batal','Cancel')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
