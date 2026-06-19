'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const EVENTS = [
  { id:1, date:'2025-08-05', title:'K3 Dasar — Batch 3 (ILT)', type:'ILT', status:'Published', instructor:'Bpk. Santoso', location:'Ruang Training Lt.3', capacity:30, enrolled:24, time:'09:00-17:00' },
  { id:2, date:'2025-08-07', title:'Leadership Fundamentals — Batch 5', type:'ILT', status:'Published', instructor:'Dr. Rahayu', location:'Ruang Serbaguna', capacity:25, enrolled:25, time:'08:00-17:00' },
  { id:3, date:'2025-08-10', title:'Sharing Session: Power BI Dashboard', type:'Sharing Session', status:'Published', instructor:'Dewi Sari', location:'MS Teams', capacity:50, enrolled:38, time:'10:00-11:00' },
  { id:4, date:'2025-08-15', title:'AWS Certification Exam Day', type:'Certification', status:'Published', instructor:'—', location:'AWS Test Center', capacity:5, enrolled:3, time:'08:00-12:00' },
  { id:5, date:'2025-08-20', title:'GCG Compliance Workshop', type:'ILT', status:'Published', instructor:'Tim Legal', location:'Aula Utama', capacity:200, enrolled:178, time:'08:00-12:00' },
  { id:6, date:'2025-08-22', title:'Excel Macro VBA — Sharing Session', type:'Sharing Session', status:'Draft', instructor:'Ahmad Fauzi', location:'TBD', capacity:40, enrolled:0, time:'14:00-15:30' },
  { id:7, date:'2025-08-28', title:'Digital Marketing Advanced — Batch 1', type:'Blended', status:'Published', instructor:'Maya Indira', location:'Zoom + LMS', capacity:20, enrolled:12, time:'09:00-12:00' },
  { id:8, date:'2025-09-03', title:'K3 Dasar — Batch 4', type:'ILT', status:'Draft', instructor:'Bpk. Santoso', location:'TBD', capacity:30, enrolled:0, time:'09:00-17:00' },
  { id:9, date:'2025-09-10', title:'Python for Data Science — Batch 1', type:'Blended', status:'Draft', instructor:'Rizky Pratama', location:'TBD', capacity:15, enrolled:0, time:'09:00-17:00' },
]

const TYPE_COLORS = { ILT:'bg-blue-100 text-blue-700', 'Sharing Session':'bg-red-100 text-red-700', Certification:'bg-green-100 text-green-700', Blended:'bg-orange-100 text-orange-700', 'Self-Paced':'bg-gray-100 text-gray-600' }
const TYPE_DOT = { ILT:'bg-blue-500', 'Sharing Session':'bg-red-500', Certification:'bg-green-500', Blended:'bg-orange-400', 'Self-Paced':'bg-gray-400' }

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']
const FULL_MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export default function HrLearningCalendarPage() {
  const t = useT()
  const [month, setMonth] = useState(7)
  const [year, setYear] = useState(2025)
  const [view, setView] = useState('Kalender')
  const [selectedDate, setSelectedDate] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState(null)

  const flash = (text) => { setMsg(text); setTimeout(()=>setMsg(null), 3000) }

  const daysInMonth = new Date(year, month+1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()

  const getEventsForDate = (day) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return EVENTS.filter(e=>e.date===dateStr)
  }

  const allMonthEvents = EVENTS.filter(e=>{
    const d = new Date(e.date)
    return d.getMonth()===month && d.getFullYear()===year
  })

  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : []

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Learning Calendar','Master Learning Calendar')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Jadwal seluruh kegiatan pembelajaran — otomatis dari data course batch dan sesi yang dijadwalkan.','Schedule of all learning activities — automatically generated from course batch and session data.')}</p>

      {msg && <div className='text-xs px-4 py-3 rounded-lg mb-4 bg-green-50 text-green-600'>{msg}</div>}


      <div className='flex items-center gap-3 mb-4 flex-wrap'>
        <button onClick={()=>{if(month===0){setMonth(11);setYear(y=>y-1)}else setMonth(m=>m-1)}} className='w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center'>‹</button>
        <span className='font-bold text-gray-800 text-lg w-44 text-center'>{FULL_MONTHS[month]} {year}</span>
        <button onClick={()=>{if(month===11){setMonth(0);setYear(y=>y+1)}else setMonth(m=>m+1)}} className='w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center'>›</button>
        <div className='flex gap-2 ml-2'>
          {['Kalender','List'].map(v=>(
            <button key={v} onClick={()=>setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${view===v?'text-white':'bg-white text-gray-600 border border-gray-200'}`}
              style={view===v?{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}:{}}>
              {v}
            </button>
          ))}
        </div>
        <div className='flex gap-3 ml-2 flex-wrap'>
          {Object.entries(TYPE_DOT).slice(0,4).map(([t,c])=>(
            <div key={t} className='flex items-center gap-1 text-xs text-gray-500'>
              <span className={`w-2.5 h-2.5 rounded-full ${c}`}></span>{t}
            </div>
          ))}
        </div>
        <button onClick={()=>setShowForm(true)}
          className='ml-auto px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
          {t('+ Tambah Event','+ Add Event')}
        </button>
      </div>

      {view === 'Kalender' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 bg-white rounded-xl p-5 shadow-sm'>
            <div className='grid grid-cols-7 mb-2'>
              {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d=>(
                <div key={d} className='text-center text-xs font-semibold text-gray-400 py-2'>{d}</div>
              ))}
            </div>
            <div className='grid grid-cols-7 gap-1'>
              {Array.from({length:firstDay}).map((_,i)=><div key={`e-${i}`} className='h-16'></div>)}
              {Array.from({length:daysInMonth}).map((_,i)=>{
                const day=i+1
                const dayEvents = getEventsForDate(day)
                const isSelected = selectedDate===day
                return (
                  <button key={day} onClick={()=>setSelectedDate(isSelected?null:day)}
                    className={`h-16 rounded-lg p-1.5 text-left transition border ${isSelected?'border-red-400 bg-red-50':dayEvents.length>0?'border-gray-200 hover:border-red-200 bg-white':'border-transparent bg-gray-50 hover:bg-gray-100'}`}>
                    <div className={`text-xs font-bold mb-1 ${isSelected?'text-red-700':'text-gray-600'}`}>{day}</div>
                    <div className='space-y-0.5'>
                      {dayEvents.slice(0,2).map((ev,j)=>(
                        <div key={j} className={`text-xs px-1 rounded truncate ${TYPE_COLORS[ev.type]}`}>{ev.title.split('—')[0].trim()}</div>
                      ))}
                      {dayEvents.length>2 && <div className='text-xs text-gray-400'>+{dayEvents.length-2}</div>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            {selectedEvents.length > 0 ? (
              <div className='space-y-3'>
                <h3 className='font-bold text-gray-700'>{selectedDate} {FULL_MONTHS[month]}</h3>
                {selectedEvents.map(ev=>(
                  <div key={ev.id} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${TYPE_COLORS[ev.type]}`}>
                    <div className='font-semibold text-gray-800 text-sm mb-2'>{ev.title}</div>
                    <div className='space-y-1 text-xs text-gray-500'>
                      <div>🕐 {ev.time}</div>
                      <div>👨‍🏫 {ev.instructor}</div>
                      <div>📍 {ev.location}</div>
                      <div>👥 {ev.enrolled}/{ev.capacity}</div>
                    </div>
                    <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full font-semibold ${ev.status==='Published'?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>{ev.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='bg-white rounded-xl p-5 shadow-sm'>
                <h3 className='font-bold text-gray-700 mb-3'>📋 Semua Event ({allMonthEvents.length})</h3>
                <div className='space-y-2 max-h-96 overflow-y-auto'>
                  {allMonthEvents.sort((a,b)=>a.date.localeCompare(b.date)).map(ev=>(
                    <div key={ev.id} className='flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer'
                      onClick={()=>{ const d=new Date(ev.date); setSelectedDate(d.getDate()) }}>
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[ev.type]}`}></span>
                      <div>
                        <div className='text-xs font-semibold text-gray-700 line-clamp-1'>{ev.title}</div>
                        <div className='text-xs text-gray-400'>{ev.date.slice(8)} {MONTHS[month]} · {ev.enrolled} {t('peserta','participants')}</div>
                      </div>
                      <span className={`ml-auto text-xs px-1.5 py-0.5 rounded font-semibold ${ev.status==='Published'?'text-green-700':'text-yellow-700'}`}>{ev.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'List' && (
        <div className='bg-white rounded-xl p-6 shadow-sm overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead><tr className='bg-gray-50'>{['Tanggal','Waktu','Nama Kegiatan','Tipe','Instruktur','Lokasi','Kapasitas','Status'].map(h=>(
              <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500 whitespace-nowrap'>{h}</th>
            ))}</tr></thead>
            <tbody>{allMonthEvents.sort((a,b)=>a.date.localeCompare(b.date)).map(ev=>(
              <tr key={ev.id} className='border-t border-gray-100 hover:bg-gray-50'>
                <td className='px-3 py-2.5 font-medium text-gray-700 whitespace-nowrap'>{ev.date}</td>
                <td className='px-3 py-2.5 text-gray-500 text-xs'>{ev.time}</td>
                <td className='px-3 py-2.5 text-gray-600 max-w-48'><div className='line-clamp-1'>{ev.title}</div></td>
                <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${TYPE_COLORS[ev.type]}`}>{ev.type}</span></td>
                <td className='px-3 py-2.5 text-gray-500 text-xs'>{ev.instructor}</td>
                <td className='px-3 py-2.5 text-gray-500 text-xs'>{ev.location}</td>
                <td className='px-3 py-2.5 text-gray-500 text-xs'>{ev.enrolled}/{ev.capacity}</td>
                <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ev.status==='Published'?'bg-green-50 text-green-700':'bg-yellow-50 text-yellow-700'}`}>{ev.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}
