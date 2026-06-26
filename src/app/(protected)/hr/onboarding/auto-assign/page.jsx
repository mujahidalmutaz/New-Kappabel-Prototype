'use client'
import { useState, useMemo }           from 'react'
import { useMasterOnboardingStore }     from '@/store/masterOnboardingStore'
import { useOnboardingStore }           from '@/store/onboardingStore'
import { useEmployeeStore }             from '@/store/employeeStore'
import { useStructureStore }            from '@/store/structureStore'
import { useOnboardingRulesStore }      from '@/store/onboardingRulesStore'
import { useT }                         from '@/store/languageStore'
import { PageHeader, SectionCard, BRAND_GRADIENT } from '@/components/ui'
import { EMP_TYPES }                    from '@/utils/constants'

const BLANK_BUDDY = {
  buddyEmpId:'', buddyName:'', buddyPosition:'',
  programDuration:'', programDurationUnit:'Bulan',
  programStartDate:'', programEndDate:'', hrbpNotes:'',
}

function todayStr() { return new Date().toISOString().slice(0,10) }
function tomorrowStr() { const d=new Date();d.setDate(d.getDate()+1);return d.toISOString().slice(0,10) }

function Toggle({ active, onChange }) {
  return (
    <button type='button' onClick={() => onChange(!active)}
      className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors ${active?'bg-red-500':'bg-gray-200'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${active?'left-5':'left-1'}`} />
    </button>
  )
}

function Pill({ label, active, onClick }) {
  return (
    <button type='button' onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition
        ${active?'bg-red-500 border-red-500 text-white':'bg-white border-gray-200 text-gray-500 hover:border-red-300'}`}>
      {label}
    </button>
  )
}

// ── Kelola Rules Tab ─────────────────────────────────────────────────────────
function RulesTab({ t, templates, companies, departments, positions, employees, onboardings, addOnboarding }) {
  const { rules, addRule, updateRule, deleteRule } = useOnboardingRulesStore()
  const [modalRule, setModalRule] = useState(null)
  const [delId, setDelId]         = useState(null)
  const [runResult, setRunResult] = useState({})
  const [msg, setMsg]             = useState(null)

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),4000) }

  const activeTemplates = templates.filter(t => t.active)
  const assignedEmpIds  = useMemo(() => new Set(onboardings.map(o=>Number(o.employeeId))), [onboardings])

  const getMatched = (rule) => employees.filter(emp => {
    if (emp.status !== 'Active') return false
    if (rule.skipExisting && assignedEmpIds.has(emp.id)) return false
    const c = rule.criteria ?? {}
    if (c.employmentTypes?.length && !c.employmentTypes.includes(emp.employmentType)) return false
    if (c.companyIds?.length      && !c.companyIds.includes(emp.companyId))           return false
    if (c.departmentIds?.length   && !c.departmentIds.includes(emp.departmentId))     return false
    if (c.positionIds?.length     && !c.positionIds.includes(emp.positionId))         return false
    return true
  })

  const handleRun = (rule) => {
    const addRuntime = item => ({...item, id:Math.random(), date:'', completed:false})
    const findTpl = id => activeTemplates.find(tpl => String(tpl.id)===id)
    const tplG = findTpl(rule.tplGeneral)
    const tplT = findTpl(rule.tplTeknis)
    const tplR = findTpl(rule.tplReview)

    const buildSection = (tpl, type, fbItems, fbSecs) => {
      if (!tpl) return null
      const ms = (tpl.mainSections??[]).find(s=>s.type===type)
      if (ms) return {...ms, id:`ms_${Date.now()}_${Math.floor(Math.random()*9999)}`, sections:(ms.sections??[]).map(s=>({...s})), items:(ms.items??[]).map(addRuntime)}
      const items=(tpl[fbItems]??[]).map(addRuntime); const secs=(tpl[fbSecs]??[]).map(s=>({...s}))
      if (!items.length && !secs.length) return null
      return {id:`ms_${type}_${Date.now()}`, type, sections:secs, items}
    }

    const matched = getMatched(rule)
    if (!matched.length) return flash(t('Tidak ada karyawan yang cocok.','No employees match this rule.'), 'error')

    let count=0
    matched.forEach(emp => {
      const supervisor = employees.find(e=>e.id===emp.managerId)
      const dept       = departments.find(d=>d.id===emp.departmentId)
      const mainSections = [
        buildSection(tplG,'Onboarding General','generalItems','generalSections'),
        buildSection(tplT,'Onboarding Teknis','technicalItems','technicalSections'),
      ].filter(Boolean)
      const rawReview = tplR?(tplR.reviewItems??[]).map(addRuntime):[]
      const reviewItems = rawReview.length>0
        ? rawReview.map(item=>item.isDirectManager?{...item,reviewerEmpId:String(supervisor?.id??''),reviewerName:supervisor?.name??'Direct Manager',reviewerPosition:''}:item)
        : null
      addOnboarding({
        employeeId:emp.id, employeeName:emp.name,
        department:dept?.name??'', supervisorName:supervisor?.name??'',
        employmentStatus:'New Hire', probationPeriod:'3',
        mainSections, reviewItems,
        hasilInductionChecked:false,
        buddyAssignment:{...BLANK_BUDDY},
        createdVia:`rule:${rule.id}`,
        ...(rule.autoSubmit?{workflowStatus:'Pending',submittedAt:new Date().toISOString()}:{}),
      })
      count++
    })
    setRunResult(p=>({...p,[rule.id]:{count,at:new Date().toLocaleString('id-ID')}}))
    flash(t(`${count} onboarding dibuat dari rule "${rule.name}".`,`${count} records created from rule "${rule.name}".`))
  }

  const tplLabel = (id) => activeTemplates.find(t=>String(t.id)===id)?.name ?? '—'

  return (
    <div className='space-y-5'>
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold ${msg.type==='error'?'bg-red-600 text-white':'bg-green-600 text-white'}`}>
          <span>{msg.type==='error'?'⚠️':'✅'}</span><span>{msg.text}</span>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-bold text-gray-800'>{t('Auto Assign Rules','Auto Assign Rules')}</p>
          <p className='text-xs text-gray-400 mt-0.5'>{t('Rule berisi template + kriteria. Jalankan untuk assign onboarding massal.','Rules with templates + criteria. Run to bulk-assign onboarding.')}</p>
        </div>
        <button onClick={() => setModalRule(false)}
          className='flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 transition'
          style={{background:BRAND_GRADIENT}}>
          + {t('Rule Baru','New Rule')}
        </button>
      </div>

      {rules.length === 0 ? (
        <div className='py-16 text-center bg-gray-50 rounded-2xl'>
          <p className='text-3xl mb-3'>⚡</p>
          <p className='text-sm font-semibold text-gray-500 mb-1'>{t('Belum ada rule','No rules yet')}</p>
          <p className='text-xs text-gray-400 mb-4'>{t('Buat rule untuk assign onboarding otomatis berdasarkan kriteria.','Create a rule to auto-assign onboarding by criteria.')}</p>
          <button onClick={() => setModalRule(false)}
            className='px-5 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90' style={{background:BRAND_GRADIENT}}>
            + {t('Rule Baru','New Rule')}
          </button>
        </div>
      ) : (
        <div className='space-y-3'>
          {rules.map(rule => {
            const matched = getMatched(rule)
            const result  = runResult[rule.id]
            const tplParts = [
              rule.tplGeneral && `General: ${tplLabel(rule.tplGeneral)}`,
              rule.tplTeknis  && `Teknis: ${tplLabel(rule.tplTeknis)}`,
              rule.tplReview  && `Review: ${tplLabel(rule.tplReview)}`,
            ].filter(Boolean)
            const c = rule.criteria ?? {}
            const critParts = [
              c.employmentTypes?.length && c.employmentTypes.join(', '),
              c.companyIds?.length && `${c.companyIds.length} company`,
              c.departmentIds?.length && `${c.departmentIds.length} dept`,
              c.positionIds?.length && `${c.positionIds.length} posisi`,
            ].filter(Boolean)
            return (
              <div key={rule.id} className={`bg-white rounded-2xl border-2 p-4 ${rule.active?'border-gray-100':'border-gray-100 opacity-60'}`}>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 flex-wrap mb-2'>
                      <span className='font-bold text-gray-800 text-sm'>{rule.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${rule.active?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                        {rule.active ? '● Aktif' : '○ Nonaktif'}
                      </span>
                      {rule.autoSubmit && <span className='text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700'>⚡ Auto-submit</span>}
                    </div>
                    <div className='flex flex-wrap gap-1.5 mb-2'>
                      {tplParts.map((l,i) => <span key={i} className='text-xs px-2 py-0.5 bg-red-50 text-red-700 font-semibold rounded-full'>{l}</span>)}
                    </div>
                    <p className='text-xs text-gray-500 mb-2'>
                      👥 {critParts.length>0 ? critParts.join(' · ') : t('Semua karyawan aktif','All active employees')}
                    </p>
                    <div className='flex items-center gap-4'>
                      <span className={`text-xs font-bold ${matched.length>0?'text-green-700':'text-gray-400'}`}>
                        {matched.length} {t('karyawan cocok','employees match')}
                      </span>
                      {result && <span className='text-xs text-gray-400'>✓ {t('Terakhir','Last')}: {result.count} record — {result.at}</span>}
                    </div>
                  </div>
                  <div className='flex flex-col gap-2 flex-shrink-0'>
                    <button onClick={() => handleRun(rule)} disabled={!rule.active || matched.length===0}
                      className='flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white rounded-xl hover:opacity-90 disabled:opacity-30'
                      style={{background:BRAND_GRADIENT}}>
                      ▶ {t('Jalankan','Run')}
                    </button>
                    <div className='flex gap-1.5'>
                      <button onClick={() => setModalRule(rule)} className='flex-1 px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200'>✏️</button>
                      <button onClick={() => updateRule(rule.id,{active:!rule.active})} className='flex-1 px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200'>{rule.active?'⏸':'▶'}</button>
                      <button onClick={() => setDelId(rule.id)} className='flex-1 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-500 rounded-lg hover:bg-red-100'>🗑</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalRule !== null && (
        <RuleModal rule={modalRule||null} templates={templates} companies={companies}
          departments={departments} positions={positions} t={t}
          onSave={(data) => { if (modalRule?.id) { updateRule(modalRule.id,data); flash(t('Rule diperbarui.','Rule updated.')) } else { addRule(data); flash(t('Rule dibuat.','Rule created.')) } setModalRule(null) }}
          onClose={() => setModalRule(null)} />
      )}
      {delId && (
        <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-80'>
            <h3 className='text-base font-bold text-gray-800 mb-2'>{t('Hapus Rule?','Delete Rule?')}</h3>
            <p className='text-sm text-gray-500 mb-5'>{t('Rule ini akan dihapus permanen.','This rule will be permanently deleted.')}</p>
            <div className='flex gap-3'>
              <button onClick={()=>{deleteRule(delId);setDelId(null);flash(t('Rule dihapus.','Rule deleted.'))}}
                className='flex-1 py-2 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600'>{t('Hapus','Delete')}</button>
              <button onClick={()=>setDelId(null)} className='flex-1 py-2 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200'>{t('Batal','Cancel')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Rule Modal ───────────────────────────────────────────────────────────────
const BLANK_RULE = { name:'', active:true, tplGeneral:'', tplTeknis:'', tplReview:'', autoSubmit:false, skipExisting:true, criteria:{employmentTypes:[],companyIds:[],departmentIds:[],positionIds:[]} }

function RuleModal({ rule, templates, companies, departments, positions, t, onSave, onClose }) {
  const [form, setForm] = useState(() => rule ? JSON.parse(JSON.stringify(rule)) : JSON.parse(JSON.stringify(BLANK_RULE)))
  const setF = (k,v) => setForm(f=>({...f,[k]:v}))
  const setC = (k,v) => setForm(f=>({...f,criteria:{...f.criteria,[k]:v}}))
  const toggleC = (key,val) => { const cur=form.criteria?.[key]??[]; setC(key,cur.includes(val)?cur.filter(x=>x!==val):[...cur,val]) }
  const selectAll = (key,items,allSel) => setC(key, allSel ? [] : items.map(i=>i.id))

  const active = templates.filter(t=>t.active)
  const tplsG  = active.filter(t=>(t.mainSections??[]).some(ms=>ms.type==='Onboarding General')||(t.generalItems??[]).length>0)
  const tplsT  = active.filter(t=>(t.mainSections??[]).some(ms=>ms.type==='Onboarding Teknis')||(t.technicalItems??[]).length>0)
  const tplsR  = active.filter(t=>(t.reviewItems??[]).length>0)
  const hasT   = form.tplGeneral||form.tplTeknis||form.tplReview

  const criteriaGroups = [
    { key:'employmentTypes', label:t('Tipe Kepegawaian','Employment Type'), items:EMP_TYPES.map(e=>({id:e,name:e})) },
    { key:'companyIds',      label:'Company',    items:companies.map(c=>({id:c.id,name:c.name||c.companyCode})) },
    { key:'departmentIds',   label:'Department', items:departments },
    { key:'positionIds',     label:t('Posisi','Position'), items:positions },
  ]

  return (
    <div className='fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-10 px-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
          <h2 className='text-base font-bold text-gray-800'>{rule?t('Edit Rule','Edit Rule'):t('Rule Baru','New Rule')}</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 text-xl'>✕</button>
        </div>
        <div className='p-6 space-y-6'>
          {/* Nama + Status */}
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <label className='text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5'>{t('Nama Rule','Rule Name')} *</label>
              <input value={form.name} onChange={e=>setF('name',e.target.value)}
                placeholder={t('Contoh: New Hire - Engineering','E.g. New Hire - Engineering')}
                className='w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl outline-none focus:border-red-400' />
            </div>
            <div>
              <label className='text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5'>Status</label>
              <button type='button' onClick={()=>setF('active',!form.active)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border-2 transition ${form.active?'border-green-400 bg-green-50 text-green-700':'border-gray-200 bg-white text-gray-500'}`}>
                {form.active?'✓ Aktif':'✗ Nonaktif'}
              </button>
            </div>
          </div>

          {/* Template per Seksi */}
          <div>
            <p className='text-xs font-bold text-gray-500 uppercase tracking-wide mb-3'>📋 {t('Template per Seksi','Template per Section')}</p>
            <div className='space-y-3 p-4 bg-gray-50 rounded-xl'>
              {[
                {label:'Onboarding General', key:'tplGeneral', opts:tplsG},
                {label:'Onboarding Teknis',  key:'tplTeknis',  opts:tplsT},
                {label:'Periodic Review',    key:'tplReview',  opts:tplsR},
              ].map(({label,key,opts}) => (
                <div key={key} className='flex items-center gap-3'>
                  <span className='text-xs font-semibold text-gray-600 w-40 flex-shrink-0'>{label}</span>
                  <select value={form[key]} onChange={e=>setF(key,e.target.value)}
                    className='flex-1 text-xs px-3 py-2 border-2 border-gray-200 rounded-xl outline-none focus:border-red-400 bg-white'>
                    <option value=''>— {t('Tidak digunakan','Not used')} —</option>
                    {opts.map(tpl=><option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
                  </select>
                  {form[key] && <span className='text-green-500 font-bold'>✓</span>}
                </div>
              ))}
            </div>
            {!hasT && <p className='text-xs text-orange-600 mt-2'>⚠️ {t('Pilih minimal satu template.','Select at least one template.')}</p>}
          </div>

          {/* Kriteria */}
          <div>
            <p className='text-xs font-bold text-gray-500 uppercase tracking-wide mb-3'>👥 {t('Kriteria Karyawan','Employee Criteria')}</p>
            <div className='space-y-4 p-4 bg-gray-50 rounded-xl'>
              <div className='flex items-center gap-3'>
                <Toggle active={form.skipExisting} onChange={v=>setF('skipExisting',v)} />
                <p className='text-xs font-semibold text-gray-700'>{t('Lewati karyawan yang sudah punya onboarding','Skip employees who already have onboarding')}</p>
              </div>
              {criteriaGroups.map(({key,label,items}) => {
                const sel = form.criteria?.[key]??[]
                const allSel = items.length>0&&items.every(i=>sel.includes(i.id))
                return (
                  <div key={key}>
                    <div className='flex items-center justify-between mb-2'>
                      <p className='text-xs font-bold text-gray-500 uppercase tracking-wide'>{label} {sel.length>0&&<span className='text-red-500'>({sel.length})</span>}</p>
                      <button type='button' onClick={()=>selectAll(key,items,allSel)} className='text-[10px] text-red-500 font-bold hover:underline'>
                        {allSel?t('Hapus Semua','Clear All'):t('Pilih Semua','Select All')}
                      </button>
                    </div>
                    <div className='flex flex-wrap gap-2 max-h-28 overflow-y-auto'>
                      {items.map(item=><Pill key={item.id} label={item.name} active={sel.includes(item.id)} onClick={()=>toggleC(key,item.id)} />)}
                    </div>
                    {sel.length===0&&<p className='text-[10px] text-gray-400 mt-1'>{t('Kosong = semua','Empty = all')}</p>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Auto-submit */}
          <div className='flex items-center gap-3 p-3 bg-blue-50 rounded-xl'>
            <Toggle active={form.autoSubmit} onChange={v=>setF('autoSubmit',v)} />
            <div>
              <p className='text-xs font-bold text-gray-700'>⚡ {t('Auto-submit','Auto-submit')}</p>
              <p className='text-xs text-gray-400'>{form.autoSubmit?t('Status Pending langsung','Directly Pending'):t('Status Draft, HR perlu review','Draft status, HR reviews first')}</p>
            </div>
          </div>
        </div>
        <div className='flex gap-3 px-6 py-4 border-t border-gray-100'>
          <button onClick={()=>{if(!form.name.trim()||!hasT)return;onSave(form)}}
            disabled={!form.name.trim()||!hasT}
            className='flex-1 py-2.5 text-sm font-bold text-white rounded-xl hover:opacity-90 disabled:opacity-40'
            style={{background:BRAND_GRADIENT}}>
            {rule?t('Simpan Perubahan','Save Changes'):t('Buat Rule','Create Rule')}
          </button>
          <button onClick={onClose} className='px-6 py-2.5 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200'>{t('Batal','Cancel')}</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AutoAssignOnboardingPage() {
  const t                                    = useT()
  const { templates }                        = useMasterOnboardingStore()
  const { onboardings, addOnboarding }       = useOnboardingStore()
  const { employees }                        = useEmployeeStore()
  const { positions, departments, companies} = useStructureStore()
  const { rules }                            = useOnboardingRulesStore()

  const [mainTab, setMainTab] = useState('assign')   // 'assign' | 'rules'

  // ── Assign tab state ─────────────────────────────────────────────────────
  const [msg,            setMsg          ] = useState(null)
  const [confirmed,      setConfirmed    ] = useState(false)
  const [runHistory,     setRunHistory   ] = useState([])

  // Template selection (per section)
  const [tplGeneral,    setTplGeneral   ] = useState('')
  const [tplTeknis,     setTplTeknis    ] = useState('')
  const [tplReview,     setTplReview    ] = useState('')
  const [autoSubmit,    setAutoSubmit   ] = useState(false)
  const [skipExisting,  setSkipExisting ] = useState(true)

  // Join date filter
  const [joinMode,  setJoinMode ] = useState('all')
  const [joinFrom,  setJoinFrom ] = useState('')
  const [joinTo,    setJoinTo   ] = useState('')

  // Employee criteria
  const [filterEmpTypes,   setFilterEmpTypes  ] = useState([])
  const [filterDeptIds,    setFilterDeptIds   ] = useState([])
  const [filterCompanyIds, setFilterCompanyIds] = useState([])
  const [filterPosIds,     setFilterPosIds    ] = useState([])

  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),4000) }

  const activeTemplates = templates.filter(tpl => tpl.active)
  const tplsGeneral = activeTemplates.filter(tpl => (tpl.mainSections??[]).some(ms=>ms.type==='Onboarding General')||(tpl.generalItems??[]).length>0)
  const tplsTeknis  = activeTemplates.filter(tpl => (tpl.mainSections??[]).some(ms=>ms.type==='Onboarding Teknis')||(tpl.technicalItems??[]).length>0)
  const tplsReview  = activeTemplates.filter(tpl => (tpl.reviewItems??[]).length>0)

  const hasTemplate = tplGeneral || tplTeknis || tplReview

  const assignedEmpIds = useMemo(() => new Set(onboardings.map(o=>Number(o.employeeId))), [onboardings])

  const toggle = (arr, setArr, val) => setArr(arr.includes(val)?arr.filter(x=>x!==val):[...arr,val])
  const toggleAll = (items, arr, setArr) => { const ids=items.map(i=>i.id); setArr(ids.every(id=>arr.includes(id))?[]:ids); setConfirmed(false) }

  const preview = useMemo(() => {
    if (!hasTemplate) return []
    const today=todayStr(), tmrw=tomorrowStr()
    return employees.filter(emp => {
      if (emp.status !== 'Active') return false
      if (skipExisting && assignedEmpIds.has(emp.id)) return false
      if (filterEmpTypes.length   && !filterEmpTypes.includes(emp.employmentType)) return false
      if (filterDeptIds.length    && !filterDeptIds.includes(emp.departmentId))    return false
      if (filterCompanyIds.length && !filterCompanyIds.includes(emp.companyId))    return false
      if (filterPosIds.length     && !filterPosIds.includes(emp.positionId))       return false
      if (joinMode==='today')    return emp.joinDate?.slice(0,10)===today
      if (joinMode==='tomorrow') return emp.joinDate?.slice(0,10)===tmrw
      if (joinMode==='range') {
        const jd=emp.joinDate?.slice(0,10)??''
        if (joinFrom&&jd<joinFrom) return false
        if (joinTo  &&jd>joinTo)   return false
      }
      return true
    }).map(emp => ({
      emp,
      dept: departments.find(d=>d.id===emp.departmentId),
      pos:  positions.find(p=>p.id===emp.positionId),
      hasExisting: assignedEmpIds.has(emp.id),
    }))
  }, [hasTemplate, employees, skipExisting, assignedEmpIds, filterEmpTypes, filterDeptIds,
      filterCompanyIds, filterPosIds, joinMode, joinFrom, joinTo, departments, positions])

  const handleAssign = () => {
    if (!hasTemplate) return flash(t('Pilih minimal satu template.','Select at least one template.'), 'error')
    if (!preview.length) return flash(t('Tidak ada karyawan yang sesuai kriteria.','No employees match the criteria.'), 'error')
    if (!confirmed) { setConfirmed(true); return }

    const addRuntime = item => ({...item, id:Math.random(), date:'', completed:false})
    const findTpl = id => activeTemplates.find(tpl=>String(tpl.id)===id)
    const tplG = findTpl(tplGeneral), tplT = findTpl(tplTeknis), tplR = findTpl(tplReview)

    const buildSection = (tpl, type, fbItems, fbSecs) => {
      if (!tpl) return null
      const ms=(tpl.mainSections??[]).find(s=>s.type===type)
      if (ms) return {...ms, id:`ms_${Date.now()}_${Math.floor(Math.random()*9999)}`, sections:(ms.sections??[]).map(s=>({...s})), items:(ms.items??[]).map(addRuntime)}
      const items=(tpl[fbItems]??[]).map(addRuntime); const secs=(tpl[fbSecs]??[]).map(s=>({...s}))
      if (!items.length&&!secs.length) return null
      return {id:`ms_${type}_${Date.now()}`, type, sections:secs, items}
    }

    let count=0
    preview.forEach(({emp}) => {
      const supervisor = employees.find(e=>e.id===emp.managerId)
      const dept       = departments.find(d=>d.id===emp.departmentId)
      const mainSections = [
        buildSection(tplG,'Onboarding General','generalItems','generalSections'),
        buildSection(tplT,'Onboarding Teknis','technicalItems','technicalSections'),
      ].filter(Boolean)
      const rawReview = tplR?(tplR.reviewItems??[]).map(addRuntime):[]
      const reviewItems = rawReview.length>0
        ? rawReview.map(item=>item.isDirectManager?{...item,reviewerEmpId:String(supervisor?.id??''),reviewerName:supervisor?.name??'Direct Manager',reviewerPosition:''}:item)
        : null
      addOnboarding({
        employeeId:emp.id, employeeName:emp.name,
        department:dept?.name??'', supervisorName:supervisor?.name??'',
        supervisorPosition:positions.find(p=>p.id===supervisor?.positionId)?.name??'',
        employmentStatus:'New Hire', probationPeriod:'3',
        mainSections, reviewItems,
        hasilInductionChecked:false,
        buddyAssignment:{...BLANK_BUDDY},
        createdVia:'auto-assign',
        ...(autoSubmit?{workflowStatus:'Pending',submittedAt:new Date().toISOString()}:{}),
      })
      count++
    })

    setRunHistory(h => [{
      at:new Date().toLocaleString('id-ID'), count,
      tpls:[tplG?.name,tplT?.name,tplR?.name].filter(Boolean).join(', '),
    }, ...h].slice(0,10))
    flash(t(`${count} onboarding berhasil dibuat.`,`${count} onboarding records created.`))
    setConfirmed(false)
    setTplGeneral(''); setTplTeknis(''); setTplReview('')
    setFilterEmpTypes([]); setFilterDeptIds([]); setFilterCompanyIds([]); setFilterPosIds([])
    setJoinMode('all')
  }

  const criteriaGroups = [
    { label:t('Tipe Kepegawaian','Employment Type'), items:EMP_TYPES.map(e=>({id:e,name:e})), arr:filterEmpTypes, setArr:setFilterEmpTypes },
    { label:'Company',    items:companies.map(c=>({id:c.id,name:c.name||c.companyCode})), arr:filterCompanyIds, setArr:setFilterCompanyIds },
    { label:'Department', items:departments, arr:filterDeptIds,  setArr:setFilterDeptIds  },
    { label:'Posisi',     items:positions,   arr:filterPosIds,   setArr:setFilterPosIds   },
  ]

  return (
    <div>
      {msg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-semibold ${msg.type==='error'?'bg-red-600 text-white':'bg-green-600 text-white'}`}>
          <span>{msg.type==='error'?'⚠️':'✅'}</span><span>{msg.text}</span>
        </div>
      )}

      <PageHeader icon='⚡'
        title={t('Auto Assign Onboarding','Auto Assign Onboarding')}
        subtitle={t('Assign template onboarding ke banyak karyawan sekaligus berdasarkan kriteria.','Assign onboarding templates to multiple employees based on criteria.')} />

      {/* Tab */}
      <div className='flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit'>
        {[
          { id:'assign', icon:'⚡', labelID:'Auto Assign',   labelEN:'Auto Assign' },
          { id:'rules',  icon:'📋', labelID:'Kelola Rules',  labelEN:'Manage Rules' },
        ].map(tab => (
          <button key={tab.id} type='button' onClick={() => setMainTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${mainTab===tab.id?'bg-white text-red-700 shadow-sm':'text-gray-500 hover:text-gray-700'}`}>
            <span>{tab.icon}</span>{t(tab.labelID, tab.labelEN)}
            {tab.id==='rules' && rules.filter(r=>r.active).length>0 && (
              <span className='ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700'>{rules.filter(r=>r.active).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── RULES TAB ── */}
      {mainTab === 'rules' && (
        <RulesTab t={t} templates={templates} companies={companies} departments={departments}
          positions={positions} employees={employees} onboardings={onboardings} addOnboarding={addOnboarding} />
      )}

      {/* ── AUTO ASSIGN TAB ── */}
      {mainTab === 'assign' && (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>

          {/* Left panel: config */}
          <div className='lg:col-span-1 space-y-4'>

            {/* Template */}
            <SectionCard title={t('Template','Template')} icon='📋'>
              <div className='space-y-3'>
                <p className='text-xs text-gray-400'>{t('Pilih template untuk setiap seksi onboarding yang akan dibuat.','Select a template for each onboarding section.')}</p>
                {[
                  {label:'Onboarding General', key:'tplGeneral', value:tplGeneral, set:setTplGeneral, opts:tplsGeneral},
                  {label:'Onboarding Teknis',  key:'tplTeknis',  value:tplTeknis,  set:setTplTeknis,  opts:tplsTeknis},
                  {label:'Periodic Review',    key:'tplReview',  value:tplReview,  set:setTplReview,  opts:tplsReview},
                ].map(({label, value, set, opts}) => (
                  <div key={label}>
                    <label className='text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1'>{label}</label>
                    <select value={value} onChange={e=>{set(e.target.value);setConfirmed(false)}}
                      className='w-full text-xs px-3 py-2 border-2 border-gray-200 rounded-xl outline-none focus:border-red-400 bg-white'>
                      <option value=''>— {t('Tidak digunakan','Not used')} —</option>
                      {opts.map(tpl=><option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
                    </select>
                  </div>
                ))}
                {!hasTemplate && <p className='text-xs text-orange-500'>⚠️ {t('Pilih minimal satu template','Select at least one template')}</p>}
              </div>
            </SectionCard>

            {/* Settings */}
            <SectionCard title={t('Pengaturan','Settings')} icon='⚙️'>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <Toggle active={skipExisting} onChange={v=>{setSkipExisting(v);setConfirmed(false)}} />
                  <p className='text-xs text-gray-700 font-semibold'>{t('Lewati yang sudah punya onboarding','Skip existing onboarding')}</p>
                </div>
                <div className='flex items-center gap-3'>
                  <Toggle active={autoSubmit} onChange={setAutoSubmit} />
                  <div>
                    <p className='text-xs font-bold text-gray-700'>⚡ Auto-submit</p>
                    <p className='text-[10px] text-gray-400'>{autoSubmit?t('Status Pending','Status Pending'):t('Status Draft','Status Draft')}</p>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Join Date */}
            <SectionCard title={t('Filter Join Date','Join Date Filter')} icon='📅'>
              <div className='space-y-2'>
                {[
                  {mode:'all',      label:t('Semua','All')},
                  {mode:'today',    label:`${t('Hari ini','Today')} (${todayStr()})`},
                  {mode:'tomorrow', label:`${t('Besok','Tomorrow')} (${tomorrowStr()})`},
                  {mode:'range',    label:t('Rentang','Range')},
                ].map(({mode,label}) => (
                  <label key={mode} className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer border-2 transition text-xs font-semibold
                    ${joinMode===mode?'border-red-400 bg-red-50 text-red-700':'border-transparent hover:border-gray-200 text-gray-600'}`}>
                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${joinMode===mode?'border-red-500 bg-red-500':'border-gray-300'}`}>
                      {joinMode===mode&&<span className='w-1.5 h-1.5 rounded-full bg-white'/>}
                    </span>
                    {label}
                    <input type='radio' className='sr-only' checked={joinMode===mode} onChange={()=>{setJoinMode(mode);setConfirmed(false)}} />
                  </label>
                ))}
                {joinMode==='range' && (
                  <div className='flex gap-2 pt-1'>
                    <input type='date' value={joinFrom} onChange={e=>{setJoinFrom(e.target.value);setConfirmed(false)}}
                      className='flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                    <input type='date' value={joinTo} onChange={e=>{setJoinTo(e.target.value);setConfirmed(false)}}
                      className='flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-red-400' />
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Criteria */}
            <SectionCard title={t('Kriteria Karyawan','Employee Criteria')} icon='👥'>
              <div className='space-y-4'>
                {criteriaGroups.map(({label, items, arr, setArr}) => (
                  <div key={label}>
                    <div className='flex items-center justify-between mb-1.5'>
                      <p className='text-[10px] font-bold text-gray-500 uppercase tracking-wide'>{label}{arr.length>0&&<span className='text-red-500 ml-1'>({arr.length})</span>}</p>
                      <button type='button' onClick={()=>toggleAll(items,arr,setArr)} className='text-[10px] text-red-500 font-bold hover:underline'>
                        {items.every(i=>arr.includes(i.id))?t('Clear','Clear'):t('Semua','All')}
                      </button>
                    </div>
                    <div className='flex flex-wrap gap-1.5 max-h-28 overflow-y-auto'>
                      {items.map(item=><Pill key={item.id} label={item.name} active={arr.includes(item.id)} onClick={()=>{toggle(arr,setArr,item.id);setConfirmed(false)}} />)}
                    </div>
                    {arr.length===0&&<p className='text-[10px] text-gray-400 mt-1'>{t('Kosong = semua','Empty = all')}</p>}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Right panel: preview + action */}
          <div className='lg:col-span-2 space-y-4'>

            {/* Summary bar */}
            <div className='grid grid-cols-3 gap-3'>
              {[
                {label:t('Template Dipilih','Selected Templates'), value:[tplGeneral&&'General',tplTeknis&&'Teknis',tplReview&&'Review'].filter(Boolean).join(' + ')||'—', icon:'📋', color:'bg-red-50 text-red-700'},
                {label:t('Filter Aktif','Active Filters'), value:filterEmpTypes.length+filterDeptIds.length+filterCompanyIds.length+filterPosIds.length||t('Semua','All'), icon:'🎯', color:'bg-blue-50 text-blue-700'},
                {label:t('Akan Dibuat','Will Create'), value:preview.length, icon:'👥', color:'bg-green-50 text-green-700'},
              ].map(({label,value,icon,color}) => (
                <div key={label} className={`p-3 rounded-xl flex items-center gap-3 ${color}`}>
                  <span className='text-xl'>{icon}</span>
                  <div>
                    <p className='text-[10px] font-semibold opacity-60 uppercase tracking-wide'>{label}</p>
                    <p className='text-sm font-bold truncate'>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview table */}
            <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
              <div className='px-4 py-3 border-b border-gray-100 flex items-center justify-between'>
                <span className='text-sm font-bold text-gray-700'>
                  {t('Preview Karyawan','Employee Preview')}
                  {preview.length>0 && <span className='ml-2 text-xs font-normal text-gray-400'>({preview.length} {t('karyawan','employees')})</span>}
                </span>
              </div>
              {!hasTemplate ? (
                <div className='py-14 text-center text-gray-400'>
                  <p className='text-3xl mb-2'>📋</p>
                  <p className='text-sm'>{t('Pilih template di panel kiri untuk melihat preview.','Select a template on the left to see a preview.')}</p>
                </div>
              ) : preview.length===0 ? (
                <div className='py-14 text-center text-gray-400'>
                  <p className='text-3xl mb-2'>🔍</p>
                  <p className='text-sm'>{t('Tidak ada karyawan yang sesuai kriteria.','No employees match the selected criteria.')}</p>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr style={{background:BRAND_GRADIENT}}>
                        {['No',t('Nama','Name'),'NIK','Dept',t('Posisi','Position'),t('Tipe','Type'),'Join Date',t('Status','Status')].map((h,i)=>(
                          <th key={i} className='text-left px-3 py-2.5 text-white font-semibold whitespace-nowrap'>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map(({emp,dept,pos,hasExisting},idx)=>(
                        <tr key={emp.id} className={idx%2===0?'bg-white':'bg-gray-50/50'}>
                          <td className='px-3 py-2.5 text-gray-400'>{idx+1}</td>
                          <td className='px-3 py-2.5 font-semibold text-gray-800'>{emp.name}</td>
                          <td className='px-3 py-2.5 text-gray-500 font-mono'>{emp.nik}</td>
                          <td className='px-3 py-2.5 text-gray-600'>{dept?.name||'—'}</td>
                          <td className='px-3 py-2.5 text-gray-600'>{pos?.name||'—'}</td>
                          <td className='px-3 py-2.5'><span className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full'>{emp.employmentType||'—'}</span></td>
                          <td className='px-3 py-2.5 text-gray-500'>{emp.joinDate?.slice(0,10)||'—'}</td>
                          <td className='px-3 py-2.5'>
                            {hasExisting
                              ? <span className='px-2 py-0.5 bg-yellow-100 text-yellow-700 font-semibold rounded-full'>{t('Sudah ada','Exists')}</span>
                              : <span className='px-2 py-0.5 bg-green-100 text-green-700 font-semibold rounded-full'>{t('Baru','New')}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Confirm warning */}
            {confirmed && preview.length>0 && (
              <div className='p-4 bg-orange-50 border-2 border-orange-300 rounded-xl flex items-start gap-3'>
                <span className='text-xl'>⚠️</span>
                <div>
                  <p className='text-sm font-bold text-orange-800'>{t(`Konfirmasi: ${preview.length} onboarding akan dibuat`,`Confirm: ${preview.length} onboarding records will be created`)}</p>
                  <p className='text-xs text-orange-600 mt-0.5'>
                    {autoSubmit?t('Status langsung Pending.','Status directly Pending.'):t('Status Draft, HR perlu review.','Status Draft, HR review required.')}
                  </p>
                </div>
              </div>
            )}

            {/* Action */}
            {hasTemplate && preview.length>0 && (
              <div className='flex items-center gap-3'>
                <button onClick={handleAssign}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl hover:opacity-90 transition ${confirmed?'ring-4 ring-orange-300':''}`}
                  style={{background:BRAND_GRADIENT}}>
                  {confirmed
                    ? `✅ ${t(`Konfirmasi Buat ${preview.length} Onboarding`,`Confirm — Create ${preview.length} Records`)}`
                    : `⚡ ${t(`Assign ke ${preview.length} Karyawan`,`Assign to ${preview.length} Employees`)}`}
                </button>
                {confirmed && (
                  <button onClick={()=>setConfirmed(false)}
                    className='px-5 py-3 text-sm font-semibold bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200'>
                    {t('Batal','Cancel')}
                  </button>
                )}
              </div>
            )}

            {/* Run history */}
            {runHistory.length>0 && (
              <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4'>
                <p className='text-xs font-bold text-gray-500 uppercase tracking-wide mb-3'>🕐 {t('Riwayat Assign','Assign History')}</p>
                <div className='space-y-2'>
                  {runHistory.map((run,idx)=>(
                    <div key={idx} className='flex items-center gap-3 text-xs p-2 bg-gray-50 rounded-lg'>
                      <span className='text-green-500 font-bold'>✓</span>
                      <div className='flex-1'><p className='font-semibold text-gray-700'>{run.tpls}</p><p className='text-gray-400'>{run.at}</p></div>
                      <span className='font-bold text-gray-700'>{run.count} {t('record','records')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
