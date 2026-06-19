'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const HISTORY = [
  { id:1, title:'Brevet Pajak A & B', organizer:'IAI Indonesia', date:'2025-04-10', type:'Sertifikasi', duration:'5 hari', cost:7500000, cpd:30, cert:'Brevet-2025.pdf', status:'Verified' },
  { id:2, title:'Project Management Professional (PMP)', organizer:'PMI Indonesia', date:'2025-02-20', type:'Sertifikasi', duration:'3 hari', cost:15000000, cpd:25, cert:'PMP-cert.pdf', status:'Pending Review' },
  { id:3, title:'Workshop Design Thinking', organizer:'Prasetya Mulya', date:'2024-11-15', type:'Workshop', duration:'2 hari', cost:4000000, cpd:16, cert:null, status:'Verified' },
]

export default function RecordExternalPage() {
  const t = useT()
  const [data, setData] = useState(HISTORY)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', organizer:'', date:'', type:'Workshop', duration:'', cost:'', cpd:'' })
  const [msg, setMsg] = useState(null)

  const flash = (text) => { setMsg(text); setTimeout(()=>setMsg(null), 3000) }

  const handleSave = () => {
    if (!form.title || !form.organizer || !form.date) return flash(t('Isi semua field yang wajib.','Fill in all required fields.'))
    setData(prev=>[...prev,{...form, id:Date.now(), cost:Number(form.cost)||0, cpd:Number(form.cpd)||0, cert:null, status:'Pending Review'}])
    flash(t('Record training eksternal berhasil disimpan.','External training record saved successfully.'))
    setShowForm(false)
    setForm({ title:'', organizer:'', date:'', type:'Workshop', duration:'', cost:'', cpd:'' })
  }

  const statusColor = (s) => ({ Verified:'bg-green-50 text-green-700', 'Pending Review':'bg-yellow-50 text-yellow-700', Rejected:'bg-red-50 text-red-700' }[s])

  const totalCPD = data.filter(d=>d.status==='Verified').reduce((a,d)=>a+d.cpd,0)
  const totalCost = data.reduce((a,d)=>a+d.cost,0)

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Record External Training</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Catat dan laporkan pelatihan/sertifikasi eksternal yang sudah Anda ikuti.','Record and report external training/certifications you have attended.')}</p>

      {msg && <div className='text-xs px-4 py-3 rounded-lg mb-4 bg-green-50 text-green-600'>{msg}</div>}


      <div className='flex justify-between items-center mb-4'>
        <h2 className='font-bold text-gray-700'>📋 {t('Riwayat Training Eksternal','External Training History')}</h2>
        <button onClick={()=>setShowForm(!showForm)}
          className='px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          {t('+ Tambah Record','+ Add Record')}
        </button>
      </div>

      {showForm && (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-red-200 mb-6'>
          <h3 className='font-bold text-gray-700 mb-4'>{t('Tambah Record Training Eksternal','Add External Training Record')}</h3>
          <div className='flex gap-3'>
            <button onClick={handleSave} className='px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>{t('Simpan','Save')}</button>
            <button onClick={()=>setShowForm(false)} className='px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>{t('Batal','Cancel')}</button>
          </div>
        </div>
      )}

      <div className='bg-white rounded-xl p-6 shadow-sm overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead><tr className='bg-gray-50'>{[t('Judul Training','Training Title'),t('Penyelenggara','Organizer'),t('Tipe','Type'),t('Tanggal','Date'),t('Durasi','Duration'),t('Biaya','Cost'),'CPD',t('Sertifikat','Certificate'),'Status'].map(h=>(
            <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap'>{h}</th>
          ))}</tr></thead>
          <tbody>{data.map(d=>(
            <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
              <td className='px-3 py-2.5 font-medium text-gray-700 max-w-44'><div className='line-clamp-2'>{d.title}</div></td>
              <td className='px-3 py-2.5 text-gray-600 text-xs'>{d.organizer}</td>
              <td className='px-3 py-2.5 text-gray-500 text-xs'>{d.type}</td>
              <td className='px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap'>{d.date}</td>
              <td className='px-3 py-2.5 text-gray-500 text-xs'>{d.duration}</td>
              <td className='px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap'>Rp {d.cost.toLocaleString('id-ID')}</td>
              <td className='px-3 py-2.5 text-xs font-semibold text-red-700'>{d.cpd} pts</td>
              <td className='px-3 py-2.5'>
                {d.cert ? <button className='text-xs text-blue-600 hover:underline'>📄 {d.cert}</button> : <span className='text-xs text-gray-300'>—</span>}
              </td>
              <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(d.status)}`}>{d.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
