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
    if (!form.title || !form.organizer || !form.date) return flash('Isi semua field yang wajib.')
    setData(prev=>[...prev,{...form, id:Date.now(), cost:Number(form.cost)||0, cpd:Number(form.cpd)||0, cert:null, status:'Pending Review'}])
    flash('Record training eksternal berhasil disimpan.')
    setShowForm(false)
    setForm({ title:'', organizer:'', date:'', type:'Workshop', duration:'', cost:'', cpd:'' })
  }

  const statusColor = (s) => ({ Verified:'bg-green-50 text-green-700', 'Pending Review':'bg-yellow-50 text-yellow-700', Rejected:'bg-red-50 text-red-700' }[s])

  const totalCPD = data.filter(d=>d.status==='Verified').reduce((a,d)=>a+d.cpd,0)
  const totalCost = data.reduce((a,d)=>a+d.cost,0)

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>Record External Training</h1>
      <p className='text-gray-500 text-sm mb-6'>Catat dan laporkan pelatihan/sertifikasi eksternal yang sudah Anda ikuti.</p>

      {msg && <div className='text-xs px-4 py-3 rounded-lg mb-4 bg-green-50 text-green-600'>{msg}</div>}

      <div className='grid grid-cols-3 gap-4 mb-6'>
        {[['CPD Terverifikasi', totalCPD+' pts', '⭐', '#7c3aed'],['Total Biaya', 'Rp '+totalCost.toLocaleString('id-ID'), '💰', '#8B1A1A'],['Training Tercatat', data.length, '📋', '#059669']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{background:c+'22'}}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-lg font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='flex justify-between items-center mb-4'>
        <h2 className='font-bold text-gray-700'>📋 Riwayat Training Eksternal</h2>
        <button onClick={()=>setShowForm(!showForm)}
          className='px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          + Tambah Record
        </button>
      </div>

      {showForm && (
        <div className='bg-white rounded-xl p-6 shadow-sm border border-red-200 mb-6'>
          <h3 className='font-bold text-gray-700 mb-4'>Tambah Record Training Eksternal</h3>
          <div className='grid grid-cols-2 gap-4 mb-4'>
            {[['Judul Training / Sertifikasi','title','text','Nama training atau ujian sertifikasi'],['Penyelenggara','organizer','text','Nama lembaga/institusi'],['Tanggal Pelaksanaan','date','date',''],['Durasi','duration','text','Contoh: 3 hari / 16 jam'],['Biaya (Rp)','cost','number','0'],['CPD Points','cpd','number','0']].map(([l,k,t,ph])=>(
              <div key={k}>
                <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
                  placeholder={ph} className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
            ))}
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Tipe Training</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {['Workshop','Seminar','Sertifikasi','Conference','Bootcamp','Webinar'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Upload Sertifikat (PDF/JPG)</label>
              <div className='border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-red-300 transition cursor-pointer'>
                <div className='text-xl'>📎</div>
                <p className='text-xs text-gray-400 mt-1'>Klik untuk upload</p>
              </div>
            </div>
          </div>
          <div className='flex gap-3'>
            <button onClick={handleSave} className='px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>Simpan</button>
            <button onClick={()=>setShowForm(false)} className='px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>{t('Batal','Cancel')}</button>
          </div>
        </div>
      )}

      <div className='bg-white rounded-xl p-6 shadow-sm overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead><tr className='bg-gray-50'>{['Judul Training','Penyelenggara','Tipe','Tanggal','Durasi','Biaya','CPD','Sertifikat','Status'].map(h=>(
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
