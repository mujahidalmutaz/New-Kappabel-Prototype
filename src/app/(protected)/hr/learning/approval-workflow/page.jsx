'use client'
import { useState } from 'react'
import { useT } from '@/store/languageStore'

const PROCESS_TYPES = ['Training Request (Internal)','External Training Request','Course Enrollment','Certificate Issuance','Budget Approval','Learning Plan Approval','IDP Approval']
const APPROVER_ROLES = ['Direct Manager','Senior Manager','HR Learning Admin','L&D Manager','Head of Division','Finance Manager','Director']
const STATUS_OPTS   = ['Active','Inactive']

const INIT = [
  { id:1, workflow_name:'External Training Request Approval', process:'External Training Request', levels:2, approvers:['Direct Manager','L&D Manager'], sla_days:3, auto_escalate:true, status:'Active' },
  { id:2, workflow_name:'Internal Training Enrollment Approval', process:'Course Enrollment', levels:1, approvers:['HR Learning Admin'], sla_days:2, auto_escalate:false, status:'Active' },
  { id:3, workflow_name:'Certificate Issuance Approval', process:'Certificate Issuance', levels:2, approvers:['L&D Manager','Head of Division'], sla_days:5, auto_escalate:true, status:'Active' },
  { id:4, workflow_name:'IDP Approval Flow', process:'IDP Approval', levels:2, approvers:['Direct Manager','HR Learning Admin'], sla_days:7, auto_escalate:true, status:'Active' },
  { id:5, workflow_name:'Training Budget Approval', process:'Budget Approval', levels:3, approvers:['Direct Manager','L&D Manager','Finance Manager'], sla_days:5, auto_escalate:true, status:'Active' },
]

const EMPTY = { workflow_name:'', process:'Training Request (Internal)', levels:'1', approver_1:'Direct Manager', approver_2:'', approver_3:'', sla_days:'3', auto_escalate:true, status:'Active' }

export default function ApprovalWorkflowPage() {
  const t = useT()
  const [data,    setData   ] = useState(INIT)
  const [form,    setForm   ] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch ] = useState('')
  const [msg,     setMsg    ] = useState(null)

  const flash = (text, type='success') => { setMsg({ text, type }); setTimeout(()=>setMsg(null), 3000) }
  const filtered = data.filter(d => d.workflow_name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = () => {
    if (!form.workflow_name) return flash(t('Nama workflow wajib diisi.','Workflow name is required.'), 'error')
    const levels = Number(form.levels)
    const approvers = [form.approver_1, form.approver_2, form.approver_3].filter(Boolean).slice(0, levels)
    if (editing) {
      setData(prev=>prev.map(d=>d.id===editing?{...d,...form,levels,sla_days:Number(form.sla_days),approvers}:d))
      flash(t('Workflow diperbarui.','Workflow updated.')); setEditing(null)
    } else {
      setData(prev=>[...prev,{id:Date.now(),...form,levels,sla_days:Number(form.sla_days),approvers}])
      flash(t('Workflow ditambahkan.','Workflow added.'))
    }
    setForm(EMPTY)
  }

  const handleEdit = (item) => { setEditing(item.id); setForm({ workflow_name:item.workflow_name, process:item.process, levels:String(item.levels), approver_1:item.approvers[0]||'', approver_2:item.approvers[1]||'', approver_3:item.approvers[2]||'', sla_days:String(item.sla_days), auto_escalate:item.auto_escalate, status:item.status }) }
  const handleDelete = (id) => { setData(prev=>prev.filter(d=>d.id!==id)); flash(t('Workflow dihapus.','Workflow deleted.')) }

  const levels = Number(form.levels) || 1

  return (
    <div>
      <h1 className='text-2xl font-bold text-gray-800 mb-1'>{t('Master Approval Workflow','Master Approval Workflow')}</h1>
      <p className='text-gray-500 text-sm mb-6'>{t('Pengaturan alur approval dalam LMS untuk training request, enrollment, sertifikasi, dan reimbursement.','Approval workflow settings in the LMS for training requests, enrollment, certification, and reimbursement.')}</p>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        {[['Total Workflow', data.length, '🔀', '#8B1A1A'],['Active', data.filter(d=>d.status==='Active').length, '✅', '#059669'],['Multi-Level', data.filter(d=>d.levels>1).length, '📊', '#7c3aed'],['Auto Escalate', data.filter(d=>d.auto_escalate).length, '⚡', '#d97706']].map(([l,v,i,c])=>(
          <div key={l} className='bg-white rounded-xl p-4 shadow-sm flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center text-xl' style={{ background:c+'22' }}>{i}</div>
            <div><p className='text-xs text-gray-500'>{l}</p><p className='text-xl font-bold text-gray-800'>{v}</p></div>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm'>
          <h2 className='text-sm font-bold text-gray-700 mb-4'>{editing?t('✏️ Edit Workflow','✏️ Edit Workflow'):`➕ ${t('Tambah Workflow','Add Workflow')}`}</h2>
          {msg && <div className={`text-xs px-3 py-2 rounded-lg mb-3 ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>{msg.text}</div>}
          <div className='flex flex-col gap-3'>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Nama Workflow</label>
              <input value={form.workflow_name} onChange={e=>setForm(f=>({...f,workflow_name:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Tipe Proses</label>
              <select value={form.process} onChange={e=>setForm(f=>({...f,process:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {PROCESS_TYPES.map(p=><option key={p}>{p}</option>)}</select></div>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Jumlah Level Approval (1-3)</label>
              <input type='number' min='1' max='3' value={form.levels} onChange={e=>setForm(f=>({...f,levels:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            {levels >= 1 && (
              <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Approver Level 1</label>
                <select value={form.approver_1} onChange={e=>setForm(f=>({...f,approver_1:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  {APPROVER_ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
            )}
            {levels >= 2 && (
              <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Approver Level 2</label>
                <select value={form.approver_2} onChange={e=>setForm(f=>({...f,approver_2:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  <option value=''>-- Pilih --</option>
                  {APPROVER_ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
            )}
            {levels >= 3 && (
              <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Approver Level 3</label>
                <select value={form.approver_3} onChange={e=>setForm(f=>({...f,approver_3:e.target.value}))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  <option value=''>-- Pilih --</option>
                  {APPROVER_ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
            )}
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>SLA (hari kerja)</label>
              <input type='number' min='1' value={form.sla_days} onChange={e=>setForm(f=>({...f,sla_days:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' /></div>
            <label className='flex items-center gap-2 text-sm text-gray-600 cursor-pointer'>
              <input type='checkbox' checked={form.auto_escalate} onChange={e=>setForm(f=>({...f,auto_escalate:e.target.checked}))} />
              Auto-escalate jika melewati SLA
            </label>
            <div><label className='block text-xs font-semibold text-gray-600 mb-1'>Status</label>
              <select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                {STATUS_OPTS.map(s=><option key={s}>{s}</option>)}</select></div>
            <div className='flex gap-2 pt-1'>
              <button onClick={handleSave} className='flex-1 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition'
                style={{ background:'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>{editing?t('Simpan','Save'):t('Tambah','Add')}</button>
              {editing && <button onClick={()=>{setEditing(null);setForm(EMPTY)}} className='px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition'>{t('Batal','Cancel')}</button>}
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 bg-white rounded-xl p-6 shadow-sm'>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('Cari workflow...','Search workflow...')}
            className='w-full max-w-sm px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 mb-4' />
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead><tr className='bg-gray-50'>{['Nama Workflow','Proses','Level','Approvers','SLA','Auto Eskalasi','Status','Aksi'].map(h=>(
                <th key={h} className='text-left px-3 py-2.5 text-xs font-semibold text-gray-500'>{h}</th>
              ))}</tr></thead>
              <tbody>{filtered.map(d=>(
                <tr key={d.id} className='border-t border-gray-100 hover:bg-gray-50'>
                  <td className='px-3 py-2.5 font-medium text-gray-700'>{d.workflow_name}</td>
                  <td className='px-3 py-2.5'><span className='text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold'>{d.process}</span></td>
                  <td className='px-3 py-2.5 text-gray-500 text-center'>{d.levels}</td>
                  <td className='px-3 py-2.5 text-xs text-gray-500'>{d.approvers.join(' → ')}</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.sla_days} hr</td>
                  <td className='px-3 py-2.5 text-gray-500'>{d.auto_escalate?'✅':'—'}</td>
                  <td className='px-3 py-2.5'><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${d.status==='Active'?'bg-green-50 text-green-700':'bg-gray-100 text-gray-500'}`}>{d.status}</span></td>
                  <td className='px-3 py-2.5'><div className='flex gap-1'>
                    <button onClick={()=>handleEdit(d)} className='px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-100'>Edit</button>
                    <button onClick={()=>handleDelete(d.id)} className='px-2.5 py-1 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100'>{t('Hapus','Delete')}</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
