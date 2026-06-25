'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'
import { useCourseBatchStore } from '@/store/courseBatchStore'

const METHODS      = ['Instructor Led Training (ILT)','Self-Paced','Blended Learning','Virtual ILT (Webinar)']
const STATUS_OPTS  = ['Open','In Progress','Completed','Cancelled','Full']
const ASSIGN_TYPES = ['Required','Voluntary','Recommendation']
const LEARN_STATUS = ['Not Started','In Progress','Completed','Overdue','Withdrawn']

const INIT_LEARNERS = [
  { id:1, batchId:1, learner:'Ahmad Fauzi', nik:'EMP001', assignment:'Required', enrolled:'2025-02-15', due:'2025-03-31', progress:100, score:85, status:'Completed' },
  { id:2, batchId:1, learner:'Budi Rahayu', nik:'EMP003', assignment:'Required', enrolled:'2025-01-05', due:'2025-01-31', progress:100, score:92, status:'Completed' },
  { id:3, batchId:2, learner:'Dewi Sari', nik:'EMP002', assignment:'Recommendation', enrolled:'2025-04-01', due:'2025-05-31', progress:65, score:null, status:'In Progress' },
  { id:4, batchId:2, learner:'Maya Indah', nik:'EMP006', assignment:'Required', enrolled:'2025-03-20', due:'2025-04-30', progress:45, score:null, status:'Overdue' },
]

const INIT_COHORTS = [
  { id:1, name:'Cohort K3 Mandatory - All Employee', target_type:'All Employee', target_value:'Semua Karyawan', member_count:850, assignment:'Mandatory', linked_course:'K3 & Keselamatan Kerja Dasar', status:'Active' },
  { id:2, name:'Cohort New Hire Onboarding 2025', target_type:'New Hire', target_value:'Karyawan Baru Join 2025', member_count:42, assignment:'Mandatory', linked_course:'New Employee Orientation Program', status:'Active' },
  { id:3, name:'Cohort Leadership - Manager & Above', target_type:'Grade', target_value:'Grade 6, 7, 8, 9', member_count:120, assignment:'Mandatory', linked_course:'Leadership Fundamentals Level 1', status:'Active' },
]

const EMPTY = { batch_name:'', course:'', method:'Instructor Led Training (ILT)', start_date:'', end_date:'', instructor:'', location:'', capacity:'30', status:'Open', description:'' }
const EMPTY_LEARNER = { learner:'', nik:'', assignment:'Required', enrolled:'', due:'', status:'Not Started' }
const EMPTY_COHORT  = { name:'', target_type:'Division', target_value:'', member_count:'0', assignment:'Mandatory', linked_course:'', status:'Active' }

export default function CourseBatchPage() {
  const t = useT()
  const { batches, addBatch, updateBatch, deleteBatch } = useCourseBatchStore()

  const TABS = [t('Batch & Jadwal','Batch & Schedule'), t('Peserta','Participants'), t('Cohort','Cohort')]
  const [tab, setTab] = useState(TABS[0])

  const [form,     setForm    ] = useState(EMPTY)
  const [editing,  setEditing ] = useState(null)
  const [search,   setSearch  ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [msg,      setMsg     ] = useState(null)

  const [learners,  setLearners ] = useState(INIT_LEARNERS)
  const [lForm,     setLForm    ] = useState(EMPTY_LEARNER)
  const [lEditing,  setLEditing ] = useState(null)
  const [showLForm, setShowLForm] = useState(false)
  const [lSearch,   setLSearch  ] = useState('')
  const [filterBatch,   setFilterBatch  ] = useState('All')
  const [filterLStatus, setFilterLStatus] = useState('All')

  const [cohorts,   setCohorts  ] = useState(INIT_COHORTS)
  const [cForm,     setCForm    ] = useState(EMPTY_COHORT)
  const [cEditing,  setCEditing ] = useState(null)
  const [showCForm, setShowCForm] = useState(false)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }

  const filtered = batches.filter(d => d.batch_name.toLowerCase().includes(search.toLowerCase()) || d.course.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.batch_name || !form.course) return flash(t('Nama batch dan course wajib diisi.','Batch name and course are required.'), 'error')
    if (editing) {
      updateBatch(editing, { ...form, capacity: Number(form.capacity) })
      flash(t('Batch diperbarui.','Batch updated.')); setEditing(null)
    } else {
      addBatch({ ...form, capacity: Number(form.capacity) })
      flash(t('Batch ditambahkan.','Batch added.'))
    }
    setForm(EMPTY); setShowForm(false)
  }

  const handleEdit = (item) => {
    setEditing(item.id)
    setForm({ batch_name:item.batch_name, course:item.course, method:item.method, start_date:item.start_date, end_date:item.end_date, instructor:item.instructor, location:item.location, capacity:String(item.capacity), status:item.status, description:item.description||'' })
    setShowForm(true)
  }

  const handleDelete = (id) => { deleteBatch(id); flash(t('Batch dihapus.','Batch deleted.')) }

  const filteredLearners = learners.filter(l =>
    (filterBatch==='All' || String(l.batchId)===filterBatch) &&
    (filterLStatus==='All' || l.status===filterLStatus) &&
    (l.learner.toLowerCase().includes(lSearch.toLowerCase()) || l.nik.includes(lSearch))
  )

  const handleSaveLearner = () => {
    if (!lForm.learner) return flash(t('Nama learner wajib diisi.','Learner name is required.'), 'error')
    if (lEditing) {
      setLearners(prev=>prev.map(l=>l.id===lEditing?{...l,...lForm}:l))
      flash(t('Data learner diperbarui.','Learner updated.')); setLEditing(null)
    } else {
      setLearners(prev=>[...prev,{id:Date.now(),...lForm,batchId:1,progress:0,score:null}])
      flash(t('Learner ditambahkan.','Learner added.'))
    }
    setLForm(EMPTY_LEARNER); setShowLForm(false)
  }

  const handleEditLearner = (item) => {
    setLEditing(item.id)
    setLForm({ learner:item.learner, nik:item.nik, assignment:item.assignment, enrolled:item.enrolled, due:item.due, status:item.status })
    setShowLForm(true)
  }

  const handleSaveCohort = () => {
    if (!cForm.name) return flash(t('Nama cohort wajib diisi.','Cohort name is required.'), 'error')
    if (cEditing) {
      setCohorts(prev=>prev.map(c=>c.id===cEditing?{...c,...cForm,member_count:Number(cForm.member_count)}:c))
      flash(t('Cohort diperbarui.','Cohort updated.')); setCEditing(null)
    } else {
      setCohorts(prev=>[...prev,{id:Date.now(),...cForm,member_count:Number(cForm.member_count)}])
      flash(t('Cohort ditambahkan.','Cohort added.'))
    }
    setCForm(EMPTY_COHORT); setShowCForm(false)
  }

  const handleEditCohort = (item) => {
    setCEditing(item.id)
    setCForm({ name:item.name, target_type:item.target_type, target_value:item.target_value||'', member_count:String(item.member_count), assignment:item.assignment, linked_course:item.linked_course, status:item.status })
    setShowCForm(true)
  }

  const statusColor = (s) => ({ Open:'bg-green-50 text-green-700', 'In Progress':'bg-blue-50 text-blue-700', Completed:'bg-gray-100 text-gray-600', Cancelled:'bg-red-50 text-red-700', Full:'bg-yellow-50 text-yellow-700' }[s])
  const learnStatusColor = (s) => ({ 'Not Started':'bg-gray-100 text-gray-500', 'In Progress':'bg-blue-50 text-blue-700', Completed:'bg-green-50 text-green-700', Overdue:'bg-red-50 text-red-700', Withdrawn:'bg-orange-50 text-orange-700' }[s])
  const assignColor = (a) => ({ Required:'bg-red-50 text-red-700', Voluntary:'bg-blue-50 text-blue-700', Recommendation:'bg-yellow-50 text-yellow-700', Mandatory:'bg-red-50 text-red-700', Optional:'bg-blue-50 text-blue-700' }[a]||'bg-gray-100 text-gray-600')

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Course — Batch & Peserta','Course — Batch & Participants')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Pengelolaan batch/sesi pelaksanaan course — jadwal, instruktur, peserta, dan cohort.','Manage course batches — schedule, instructor, participants, and cohorts.')}</p>

      {msg && <div className={`text-xs px-4 py-3 rounded-lg mb-4 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}

      <div className='flex gap-2 mb-6'>
        {TABS.map(t_=>(
          <button key={t_} onClick={()=>setTab(t_)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab===t_?'text-white':'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            style={tab===t_?{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}:{}}>
            {t_}
          </button>
        ))}
      </div>

      {tab === TABS[0] && (
        <>
          <div className='flex justify-between items-center mb-4 gap-3'>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              className='px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 w-64'
              placeholder={t('Cari batch atau course...','Search batch or course...')} />
            <button onClick={()=>{setShowForm(true);setEditing(null);setForm(EMPTY)}}
              className='px-5 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
              style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
              {t('+ Tambah Batch','+ Add Batch')}
            </button>
          </div>

          {showForm && (
            <div className='bg-white rounded-xl p-6 shadow-sm border border-red-200 mb-6'>
              <h3 className='font-bold text-gray-700 mb-4'>{editing?t('Edit Batch','Edit Batch'):t('Tambah Batch Baru','Add New Batch')}</h3>
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div className='col-span-2'>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Nama Batch','Batch Name')} <span className='text-red-500'>*</span></label>
                  <input value={form.batch_name} onChange={e=>setForm(f=>({...f,batch_name:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Nama Course','Course Name')} <span className='text-red-500'>*</span></label>
                  <input value={form.course} onChange={e=>setForm(f=>({...f,course:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Metode','Method')}</label>
                  <select value={form.method} onChange={e=>setForm(f=>({...f,method:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                    {METHODS.map(m=><option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tanggal Mulai','Start Date')}</label>
                  <input type='date' value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tanggal Selesai','End Date')}</label>
                  <input type='date' value={form.end_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Instruktur','Instructor')}</label>
                  <input value={form.instructor} onChange={e=>setForm(f=>({...f,instructor:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Lokasi/Link','Location/Link')}</label>
                  <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Kapasitas','Capacity')}</label>
                  <input type='number' value={form.capacity} onChange={e=>setForm(f=>({...f,capacity:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Status</label>
                  <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                    {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className='col-span-2'>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Deskripsi/Catatan','Description/Notes')}</label>
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' />
                </div>
              </div>
              <div className='flex gap-3'>
                <button onClick={handleSave} className='px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>{editing?t('Simpan Perubahan','Save Changes'):t('Tambahkan','Add')}</button>
                <button onClick={()=>{setShowForm(false);setEditing(null);setForm(EMPTY)}} className='px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>{t('Batal','Cancel')}</button>
              </div>
            </div>
          )}

          <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-100'>
                  {[t('Nama Batch','Batch Name'),'Course',t('Metode','Method'),t('Tanggal','Date'),t('Instruktur','Instructor'),t('Lokasi','Location'),t('Kapasitas','Cap.'),'Status',''].map(h=>(
                    <th key={h} className='text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(d=>(
                  <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                    <td className='px-4 py-3 font-medium text-gray-800'>{d.batch_name}</td>
                    <td className='px-4 py-3 text-xs text-gray-600 max-w-36'><div className='line-clamp-2'>{d.course}</div></td>
                    <td className='px-4 py-3 text-xs text-gray-500'>{d.method}</td>
                    <td className='px-4 py-3 text-xs text-gray-500 whitespace-nowrap'>{d.start_date||'—'}<br/><span className='text-gray-400'>{d.end_date||''}</span></td>
                    <td className='px-4 py-3 text-xs text-gray-500'>{d.instructor||'—'}</td>
                    <td className='px-4 py-3 text-xs text-gray-500'>{d.location||'—'}</td>
                    <td className='px-4 py-3 text-xs text-center font-semibold text-gray-700'>{d.capacity}</td>
                    <td className='px-4 py-3'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor(d.status)}`}>{d.status}</span></td>
                    <td className='px-4 py-3'>
                      <div className='flex gap-2'>
                        <button onClick={()=>handleEdit(d)} className='text-xs text-blue-600 hover:underline'>{t('Edit','Edit')}</button>
                        <button onClick={()=>handleDelete(d.id)} className='text-xs text-red-400 hover:underline'>{t('Hapus','Delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length===0 && <div className='py-10 text-center text-gray-400 text-sm'>{t('Belum ada batch.','No batches found.')}</div>}
          </div>
        </>
      )}

      {tab === TABS[1] && (
        <>
          <div className='flex justify-between items-center mb-4 gap-3 flex-wrap'>
            <div className='flex gap-2 flex-wrap'>
              <input value={lSearch} onChange={e=>setLSearch(e.target.value)}
                className='px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 w-44'
                placeholder={t('Cari nama/NIK...','Search name/NIK...')} />
              <select value={filterBatch} onChange={e=>setFilterBatch(e.target.value)}
                className='px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 bg-white'>
                <option value='All'>{t('Semua Batch','All Batches')}</option>
                {batches.map(b=><option key={b.id} value={String(b.id)}>{b.batch_name}</option>)}
              </select>
              <select value={filterLStatus} onChange={e=>setFilterLStatus(e.target.value)}
                className='px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 bg-white'>
                <option value='All'>{t('Semua Status','All Status')}</option>
                {LEARN_STATUS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={()=>{setShowLForm(true);setLEditing(null);setLForm(EMPTY_LEARNER)}}
              className='px-5 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
              style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
              {t('+ Tambah Peserta','+ Add Participant')}
            </button>
          </div>

          {showLForm && (
            <div className='bg-white rounded-xl p-6 shadow-sm border border-red-200 mb-6'>
              <h3 className='font-bold text-gray-700 mb-4'>{lEditing?t('Edit Peserta','Edit Participant'):t('Tambah Peserta','Add Participant')}</h3>
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Nama Peserta','Participant Name')} <span className='text-red-500'>*</span></label>
                  <input value={lForm.learner} onChange={e=>setLForm(f=>({...f,learner:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>NIK</label>
                  <input value={lForm.nik} onChange={e=>setLForm(f=>({...f,nik:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tipe Assignment','Assignment Type')}</label>
                  <select value={lForm.assignment} onChange={e=>setLForm(f=>({...f,assignment:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                    {ASSIGN_TYPES.map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Status</label>
                  <select value={lForm.status} onChange={e=>setLForm(f=>({...f,status:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                    {LEARN_STATUS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tanggal Enroll','Enrolled Date')}</label>
                  <input type='date' value={lForm.enrolled} onChange={e=>setLForm(f=>({...f,enrolled:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Deadline</label>
                  <input type='date' value={lForm.due} onChange={e=>setLForm(f=>({...f,due:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
              </div>
              <div className='flex gap-3'>
                <button onClick={handleSaveLearner} className='px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>{lEditing?t('Simpan','Save'):t('Tambahkan','Add')}</button>
                <button onClick={()=>{setShowLForm(false);setLEditing(null)}} className='px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>{t('Batal','Cancel')}</button>
              </div>
            </div>
          )}

          <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-100'>
                  {[t('Nama','Name'),'NIK','Batch',t('Assignment','Assignment'),t('Enroll','Enrolled'),'Deadline',t('Progress','Progress'),'Score','Status',''].map(h=>(
                    <th key={h} className='text-left px-4 py-3 text-xs font-semibold text-gray-500 whitespace-nowrap'>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLearners.map(l=>{
                  const batchInfo = batches.find(b=>b.id===l.batchId)
                  return (
                    <tr key={l.id} className='border-t border-gray-100 hover:bg-gray-50'>
                      <td className='px-4 py-3 font-medium text-gray-800'>{l.learner}</td>
                      <td className='px-4 py-3 text-xs text-gray-500'>{l.nik}</td>
                      <td className='px-4 py-3 text-xs text-gray-500'>{batchInfo?.batch_name||'—'}</td>
                      <td className='px-4 py-3'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${assignColor(l.assignment)}`}>{l.assignment}</span></td>
                      <td className='px-4 py-3 text-xs text-gray-500 whitespace-nowrap'>{l.enrolled||'—'}</td>
                      <td className='px-4 py-3 text-xs text-gray-500 whitespace-nowrap'>{l.due||'—'}</td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <div className='w-14 bg-gray-200 rounded-full h-2'><div className='h-2 rounded-full bg-red-500' style={{width:`${l.progress}%`}}></div></div>
                          <span className='text-xs text-gray-600'>{l.progress}%</span>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-xs font-semibold text-gray-700'>{l.score!=null?l.score:'—'}</td>
                      <td className='px-4 py-3'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${learnStatusColor(l.status)}`}>{l.status}</span></td>
                      <td className='px-4 py-3'><button onClick={()=>handleEditLearner(l)} className='text-xs text-blue-600 hover:underline'>{t('Edit','Edit')}</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredLearners.length===0 && <div className='py-10 text-center text-gray-400 text-sm'>{t('Tidak ada peserta.','No participants found.')}</div>}
          </div>
        </>
      )}

      {tab === TABS[2] && (
        <>
          <div className='flex justify-between items-center mb-4'>
            <p className='text-sm text-gray-500'>{t('Kelompokkan learner untuk assignment training massal.','Group learners for mass training assignment.')}</p>
            <button onClick={()=>{setShowCForm(true);setCEditing(null);setCForm(EMPTY_COHORT)}}
              className='px-5 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
              style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
              {t('+ Tambah Cohort','+ Add Cohort')}
            </button>
          </div>

          {showCForm && (
            <div className='bg-white rounded-xl p-6 shadow-sm border border-red-200 mb-6'>
              <h3 className='font-bold text-gray-700 mb-4'>{cEditing?t('Edit Cohort','Edit Cohort'):t('Tambah Cohort Baru','Add New Cohort')}</h3>
              <div className='grid grid-cols-2 gap-4 mb-4'>
                <div className='col-span-2'>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Nama Cohort','Cohort Name')} <span className='text-red-500'>*</span></label>
                  <input value={cForm.name} onChange={e=>setCForm(f=>({...f,name:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tipe Target','Target Type')}</label>
                  <select value={cForm.target_type} onChange={e=>setCForm(f=>({...f,target_type:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                    {['Division','Position','Grade','Region/Location','Custom Group','All Employee','New Hire'].map(tp=><option key={tp}>{tp}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Nilai Target','Target Value')}</label>
                  <input value={cForm.target_value} onChange={e=>setCForm(f=>({...f,target_value:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Jumlah Member','Member Count')}</label>
                  <input type='number' value={cForm.member_count} onChange={e=>setCForm(f=>({...f,member_count:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Tipe Assignment','Assignment Type')}</label>
                  <select value={cForm.assignment} onChange={e=>setCForm(f=>({...f,assignment:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                    {['Mandatory','Optional','Recommendation'].map(a=><option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>{t('Linked Course','Linked Course')}</label>
                  <input value={cForm.linked_course} onChange={e=>setCForm(f=>({...f,linked_course:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 mb-1.5'>Status</label>
                  <select value={cForm.status} onChange={e=>setCForm(f=>({...f,status:e.target.value}))}
                    className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                    {['Active','Inactive','Archived'].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className='flex gap-3'>
                <button onClick={handleSaveCohort} className='px-6 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90' style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>{cEditing?t('Simpan','Save'):t('Tambahkan','Add')}</button>
                <button onClick={()=>{setShowCForm(false);setCEditing(null)}} className='px-6 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200'>{t('Batal','Cancel')}</button>
              </div>
            </div>
          )}

          <div className='space-y-3'>
            {cohorts.map(c=>(
              <div key={c.id} className='bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='font-bold text-gray-800'>{c.name}</div>
                  <div className='flex items-center gap-3 mt-1'>
                    <span className='text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold'>{c.target_type}</span>
                    {c.target_value && <span className='text-xs text-gray-400'>{c.target_value}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${assignColor(c.assignment)}`}>{c.assignment}</span>
                    <span className='text-xs text-gray-400'>👥 {c.member_count} {t('member','members')}</span>
                  </div>
                  <div className='text-xs text-gray-400 mt-1'>📚 {c.linked_course||'—'}</div>
                </div>
                <div className='flex items-center gap-3'>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.status==='Active'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{c.status}</span>
                  <button onClick={()=>handleEditCohort(c)} className='text-xs text-blue-600 hover:underline'>{t('Edit','Edit')}</button>
                  <button onClick={()=>setCohorts(prev=>prev.filter(x=>x.id!==c.id))} className='text-xs text-red-400 hover:underline'>{t('Hapus','Delete')}</button>
                </div>
              </div>
            ))}
            {cohorts.length===0 && <div className='bg-white rounded-xl p-10 text-center text-gray-400 text-sm shadow-sm'>{t('Belum ada cohort.','No cohorts yet.')}</div>}
          </div>
        </>
      )}
    </div>
  )
}
