'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEmployeeStore, HISTORY_ACTIONS, HISTORY_REASONS, ACTION_COLOR } from '@/store/employeeStore'
import { useStructureStore, PC_CATEGORY_COLOR } from '@/store/structureStore'
import { useT } from '@/store/languageStore'
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td,
  SearchBar, FilterBar, FilterPill, StatusBadge, ActionButton,
  EmptyState, FormField, Input as DSInput, Select as DSSelect, BRAND_GRADIENT,
} from '@/components/ui'

// ─── constants ────────────────────────────────────────────────────────────────
const TABS       = ['Employment','Bio','Dependent','Profile']
const EMP_TYPES  = ['Permanent','Contract','Outsource','Internship']
const RELIGIONS  = ['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu','Lainnya']
const EDU_LEVELS = ['SD','SMP','SMA/SMK','D1','D2','D3','D4','S1','S2','S3']
const SKILL_LVLS = ['Beginner','Intermediate','Advanced','Expert']
const GENDERS      = ['Male','Female']
const MARITAL      = ['Single','Married','Divorced','Widowed']
const BLOOD_TYPES  = ['A','B','AB','O']
const TAX_STATUS   = ['TK','K0','M1','M2','M3']
const RELS       = ['Spouse','Child','Parent','Sibling','Other']

const PHL_COMPANY_ID = 3
const CURRENCY_LOV   = ['PHP','USD','SGD','HKD','JPY','EUR','GBP','AUD']

const COUNTRIES = [
  // Asia Tenggara
  'Indonesia','Malaysia','Singapore','Thailand','Philippines','Vietnam','Myanmar',
  'Cambodia','Laos','Brunei Darussalam','Timor-Leste',
  // Asia Selatan
  'India','Bangladesh','Pakistan','Sri Lanka','Nepal','Bhutan','Maldives','Afghanistan',
]

const CITIES = [
  // Jawa
  'Jakarta','Surabaya','Bandung','Semarang','Yogyakarta','Solo','Malang','Bekasi','Depok',
  'Tangerang','South Tangerang','Bogor','Cirebon','Sukabumi','Purwakarta','Karawang',
  'Tasikmalaya','Purwokerto','Tegal','Pekalongan','Madiun','Kediri','Blitar','Mojokerto',
  'Jember','Banyuwangi','Pasuruan','Probolinggo','Sidoarjo','Gresik',
  // Sumatera
  'Medan','Palembang','Pekanbaru','Padang','Bandar Lampung','Batam','Jambi','Banda Aceh',
  'Binjai','Sibolga','Bukittinggi','Bengkulu','Pangkal Pinang','Tanjung Pinang',
  // Kalimantan
  'Balikpapan','Samarinda','Banjarmasin','Pontianak','Palangkaraya',
  // Sulawesi
  'Makassar','Manado','Palu','Kendari','Gorontalo','Mamuju',
  // Bali & Nusa Tenggara
  'Denpasar','Mataram','Kupang',
  // Maluku & Papua
  'Ambon','Ternate','Jayapura','Sorong','Manokwari',
  // Internasional
  'Singapore','Kuala Lumpur','Bangkok','Ho Chi Minh City','Manila','Tokyo','Seoul',
  'Beijing','Shanghai','Sydney','Melbourne','London','Amsterdam','Dubai','Riyadh',
  'New York','Los Angeles','Other',
]

const EMPTY_EMP = {
  nik:'', name:'', gender:'Male', birthPlace:'', birthDate:'', nationality:'Indonesian',
  religion:'Islam', maritalStatus:'Single', bloodType:'', taxStatus:'', ktp:'', npwp:'', bpjs:'', phone:'', email:'',
  personalEmail:'', address:'', city:'', country:'Indonesia', photo:null, status:'Active', employmentType:'Permanent',
  joinDate:'', endDate:'', role:'employee',
  companyId:'', divisionId:'', businessUnitId:'', departmentId:'', positionId:'', gradeId:'', individualClassId:'',
  // Additional Assignment Info (Philippines, Inc. only)
  currency:'', basicSalary:'', salaryAdjustment:'', promotionAllowance:'',
  meals:'', communication:'', gasCard:'', tollAndParking:'', medical:'',
}

const avatar = (emp) => emp?.photo
  ? <img src={emp.photo} alt='' className='w-full h-full object-cover' />
  : <span className='text-2xl'>{emp?.gender === 'Female' ? '👩' : '👨'}</span>

// ─── helpers ──────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className='block text-xs font-semibold text-gray-500 mb-1'>{label}</label>
      {children}
    </div>
  )
}
function Input({ value, onChange, type='text', placeholder='' }) {
  return (
    <input type={type} value={value||''} onChange={onChange} placeholder={placeholder}
      className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
  )
}
function Select({ value, onChange, options }) {
  const t = useT()
  return (
    <select value={value||''} onChange={onChange}
      className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
      <option value=''>{t('-- Pilih --', '-- Select --')}</option>
      {options.map(o => typeof o === 'string'
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function EmployeeDataPage() {
  const store     = useEmployeeStore()
  const structure = useStructureStore()
  const { employees, updateEmployee, addEmployee, deleteEmployee,
          setPhoto, addDependent, updateDependent, deleteDependent,
          addEducation, deleteEducation,
          addCertification, deleteCertification,
          addSkill, deleteSkill,
          addHistory, updateHistory, deleteHistory } = store

  const router       = useRouter()
  const searchParams = useSearchParams()

  const [selectedId, setSelectedId] = useState(null)
  const [tab,        setTab        ] = useState('Employment')
  const [isNew,      setIsNew      ] = useState(false)
  const [form,       setForm       ] = useState(EMPTY_EMP)
  const [saving,     setSaving     ] = useState(false)
  const [msg,        setMsg        ] = useState(null)

  // ── Search gate ─────────────────────────────────────────────────────────────
  const [searchMode,   setSearchMode  ] = useState(true)
  const [draftFilters, setDraftFilters] = useState({ q: '', status: 'Active', dept: '', empType: '' })
  const [activeFilters,setActiveFilters] = useState({ q: '', status: 'Active', dept: '', empType: '' })

  const t = useT()
  const flash = (text, type='success') => { setMsg({text,type}); setTimeout(()=>setMsg(null),3000) }

  // Sync selected employee when global search navigates with ?id=
  useEffect(() => {
    const idParam = searchParams.get('id')
    if (!idParam) return
    const found = employees.find(e => e.id === +idParam)
    if (found) {
      setActiveFilters(f => ({ ...f, status: '' }))   // clear status filter to show all
      setSearchMode(false)
      setSelectedId(found.id)
      setIsNew(false)
      setTab('Employment')
    }
  }, [searchParams])
  const fileRef = useRef()

  const emp = isNew ? null : employees.find(e => e.id === selectedId)

  // filtered list — driven by activeFilters + inline name/nik search within list view
  const [inlineQ, setInlineQ] = useState('')

  const list = employees.filter(e => {
    const q    = (activeFilters.q || '').toLowerCase()
    const inQ  = inlineQ.toLowerCase()
    const matchQ    = !q    || e.name.toLowerCase().includes(q) || e.nik.toLowerCase().includes(q)
    const matchInQ  = !inQ  || e.name.toLowerCase().includes(inQ) || e.nik.toLowerCase().includes(inQ)
    const matchStat = !activeFilters.status || e.status === activeFilters.status
    const matchDept = !activeFilters.dept   || String(e.departmentId) === String(activeFilters.dept)
    const matchType = !activeFilters.empType|| e.employmentType === activeFilters.empType
    return matchQ && matchInQ && matchStat && matchDept && matchType
  })

  const handleSearch = () => {
    setActiveFilters({ ...draftFilters })
    setSelectedId(null)
    setSearchMode(false)
    setIsNew(false)
    setInlineQ('')
  }

  const STATUS_OPTS = [
    { value: 'Active',     label: 'Active' },
    { value: 'Inactive',   label: 'Inactive' },
    { value: 'Terminated', label: 'Terminated' },
    { value: 'Resigned',   label: 'Resigned' },
    { value: '',           label: t('Semua Status', 'All Status') },
  ]

  const activeStatusLabel = STATUS_OPTS.find(o => o.value === activeFilters.status)?.label ?? 'All Status'

  // ── Search gate screen ────────────────────────────────────────────────────
  if (searchMode) {
    return (
      <div className='min-h-[calc(100vh-8rem)] flex items-start justify-center pt-16'>
        <div className='w-full max-w-lg'>
          <div className='text-center mb-8'>
            <h1 className='text-2xl font-bold text-gray-800'>{t('Employee Data', 'Employee Data')}</h1>
            <p className='text-gray-500 text-sm mt-1'>{t('Tentukan parameter pencarian untuk melihat data karyawan.', 'Set search parameters to view employee data.')}</p>
          </div>

          <div className='bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6'>
            <h2 className='text-xs font-bold text-gray-500 uppercase tracking-wide mb-4'>
              🔍 {t('Parameter Pencarian', 'Search Parameters')}
            </h2>

            <div className='flex flex-col gap-4'>
              {/* Name / NIK */}
              <FormField label={t('Nama / NIK', 'Name / NIK')}>
                <SearchBar
                  value={draftFilters.q}
                  onChange={v => setDraftFilters(f => ({ ...f, q: v }))}
                  onSubmit={handleSearch}
                  placeholder={t('Kosongkan untuk tampilkan semua', 'Leave blank to show all')}
                />
              </FormField>

              {/* Status */}
              <FormField label={t('Status Karyawan', 'Employee Status')}>
                <FilterBar>
                  {STATUS_OPTS.map(o => (
                    <FilterPill key={o.value}
                      active={draftFilters.status === o.value}
                      onClick={() => setDraftFilters(f => ({ ...f, status: o.value }))}>
                      {o.value === 'Active' && '🟢 '}
                      {o.value === 'Inactive' && '🔴 '}
                      {o.value === 'Terminated' && '⛔ '}
                      {o.value === 'Resigned' && '🚪 '}
                      {o.value === '' && '📋 '}
                      {o.label}
                    </FilterPill>
                  ))}
                </FilterBar>
              </FormField>

              {/* Department */}
              <FormField label='Department'>
                <DSSelect
                  value={draftFilters.dept}
                  onChange={e => setDraftFilters(f => ({ ...f, dept: e.target.value }))}>
                  <option value=''>{t('— Semua Department —', '— All Departments —')}</option>
                  {structure.departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </DSSelect>
              </FormField>

              {/* Employment Type */}
              <FormField label={t('Tipe Kepegawaian', 'Employment Type')}>
                <DSSelect
                  value={draftFilters.empType}
                  onChange={e => setDraftFilters(f => ({ ...f, empType: e.target.value }))}>
                  <option value=''>{t('— Semua Tipe —', '— All Types —')}</option>
                  {EMP_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                </DSSelect>
              </FormField>
            </div>

            <div className='mt-6 flex gap-3'>
              <ActionButton variant='primary' className='flex-1' icon='🔍' onClick={handleSearch}>
                {t('Cari Karyawan', 'Search Employees')}
              </ActionButton>
              <ActionButton variant='secondary'
                onClick={() => { setDraftFilters({ q:'', status:'Active', dept:'', empType:'' }) }}>
                {t('Reset', 'Reset')}
              </ActionButton>
            </div>
            <div className='mt-3'>
              <button
                onClick={() => { setSearchMode(false); handleNew() }}
                className='w-full py-2.5 text-sm font-bold rounded-xl border-2 border-red-200 text-red-700 hover:bg-red-50 transition'>
                + {t('Tambah Karyawan Baru', 'Add New Employee')}
              </button>
            </div>
          </div>

          {/* quick stat */}
          <p className='text-center text-xs text-gray-400 mt-4'>
            {t('Total karyawan tersimpan:', 'Total employees in system:')} <strong>{employees.length}</strong>
            {' · '}
            {t('Active:', 'Active:')} <strong>{employees.filter(e=>e.status==='Active').length}</strong>
            {' · '}
            {t('Inactive:', 'Inactive:')} <strong>{employees.filter(e=>e.status!=='Active').length}</strong>
          </p>
        </div>
      </div>
    )
  }

  // structure lookups
  const S = structure
  const coName  = id => S.companies.find(x=>x.id===+id)?.name         || '-'
  const coCode  = id => S.companies.find(x=>x.id===+id)?.companyCode  || ''
  const divName = id => S.divisions.find(x=>x.id===+id)?.name     || '-'
  const buName  = id => S.businessUnits.find(x=>x.id===+id)?.name || '-'
  const deptName= id => S.departments.find(x=>x.id===+id)?.name   || '-'
  const posName = id => S.positions.find(x=>x.id===+id)?.name     || '-'
  const grade   = id => S.grades.find(x=>x.id===+id)

  // open new form
  const handleNew = () => {
    setForm(EMPTY_EMP); setIsNew(true); setTab('Employment')
  }

  // select employee
  const handleSelect = (id) => {
    setSelectedId(id); setIsNew(false); setTab('Employment')
  }

  // save employment / bio fields (inline edit on blur)
  const handleFieldSave = (field, value) => {
    if (!emp) return
    updateEmployee(emp.id, { [field]: value })
  }

  // save new employee
  const handleSaveNew = () => {
    if (!form.nik || !form.name) return flash(t('NIK dan nama wajib diisi.', 'NIK and name are required.'),'error')
    addEmployee(form)
    const newEmp = useEmployeeStore.getState().employees.slice(-1)[0]
    setIsNew(false)
    setSelectedId(newEmp?.id ?? null)
    flash(t('Karyawan ditambahkan.', 'Employee added.'))
  }

  // photo upload
  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      if (emp) setPhoto(emp.id, ev.target.result)
      else     setForm(f => ({ ...f, photo: ev.target.result }))
    }
    reader.readAsDataURL(file)
  }

  // ── render ─────────────────────────────────────────────────────
  const showList = !selectedId && !isNew

  return (
    <div className='flex flex-col gap-3 h-[calc(100vh-5rem)]'>

      {/* ── Filter summary bar ── */}
      <div className='flex items-center gap-3 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 px-4 py-2.5 flex-shrink-0'>
        <div className='flex items-center gap-2 flex-wrap flex-1 min-w-0'>
          <span className='text-xs font-semibold text-gray-500'>{t('Filter aktif:', 'Active filters:')}</span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full
            ${activeFilters.status === 'Active'     ? 'bg-green-100 text-green-700'  :
              activeFilters.status === 'Inactive'   ? 'bg-red-100 text-red-700'      :
              activeFilters.status === 'Terminated' ? 'bg-gray-200 text-gray-600'    :
              activeFilters.status === 'Resigned'   ? 'bg-orange-100 text-orange-700':
              'bg-gray-100 text-gray-600'}`}>
            {activeStatusLabel}
          </span>
          {activeFilters.dept && (
            <span className='text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium'>
              {structure.departments.find(d => String(d.id) === String(activeFilters.dept))?.name}
            </span>
          )}
          {activeFilters.empType && (
            <span className='text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium'>
              {activeFilters.empType}
            </span>
          )}
          {activeFilters.q && (
            <span className='text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-medium'>
              "{activeFilters.q}"
            </span>
          )}
          <span className='text-xs text-gray-400 ml-1'>
            — {list.length} {t('karyawan', 'employees')}
          </span>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
          {!showList && (
            <ActionButton size='sm' variant='secondary'
              onClick={() => { setSelectedId(null); setIsNew(false) }}>
              ← {t('Daftar', 'List')}
            </ActionButton>
          )}
          <ActionButton size='sm' variant='secondary'
            className='!bg-red-50 !text-red-700 !border-red-100 hover:!bg-red-100'
            onClick={() => { setDraftFilters({ ...activeFilters }); setSearchMode(true) }}>
            🔍 {t('Ubah Filter', 'Change Filter')}
          </ActionButton>
          <ActionButton size='sm' variant='primary' onClick={handleNew}>
            + {t('Karyawan Baru', 'New Employee')}
          </ActionButton>
        </div>
      </div>

      <div className='flex gap-4 flex-1 min-h-0'>

      {/* ── LEFT: employee list ────────────────────────────────── */}
      {showList && <div className='w-64 flex-shrink-0 flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden'>
        <div className='p-3 border-b border-gray-100'>
          <SearchBar value={inlineQ} onChange={setInlineQ}
            placeholder={t('Cari nama / NIK…', 'Search name / NIK…')} />
        </div>
        <div className='flex-1 overflow-y-auto'>
          {list.length === 0 ? (
            <div className='p-4'>
              <EmptyState icon='🔍' title={t('Tidak ada karyawan', 'No employees found')} />
            </div>
          ) : list.map(e => (
            <button key={e.id} onClick={()=>handleSelect(e.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-l-2 ${
                selectedId===e.id && !isNew
                  ? 'border-red-500 bg-red-50'
                  : 'border-transparent hover:bg-gray-50'
              }`}>
              <div className='w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0'>
                {avatar(e)}
              </div>
              <div className='min-w-0'>
                <div className='text-xs font-semibold text-gray-800 truncate'>{e.name}</div>
                <div className='text-xs text-gray-400 mb-1'>{e.nik}</div>
                <StatusBadge status={e.status} />
              </div>
            </button>
          ))}
        </div>
        <div className='p-3 border-t border-gray-100'>
          <ActionButton size='sm' variant='primary' className='w-full' onClick={handleNew}>
            + {t('Karyawan Baru', 'New Employee')}
          </ActionButton>
        </div>
      </div>}

      {/* ── RIGHT: detail panel ────────────────────────────────── */}
      <div className='flex-1 flex flex-col bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden min-w-0 min-h-0'>
        {(!emp && !isNew) ? (
          <div className='flex-1 flex items-center justify-center p-6'>
            <EmptyState icon='👤'
              title={t('Pilih karyawan', 'Select an employee')}
              description={t('Pilih karyawan dari daftar di sebelah kiri untuk melihat detail.', 'Select an employee from the list on the left to view details.')} />
          </div>
        ) : (
          <>
            {/* ── Header ── */}
            <div className='flex items-start gap-5 p-6 border-b border-gray-100'>
              {/* Photo */}
              <div className='relative flex-shrink-0'>
                <div className='w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200'>
                  {isNew
                    ? (form.photo
                        ? <img src={form.photo} className='w-full h-full object-cover' />
                        : <span className='text-3xl'>{form.gender==='Female'?'👩':'👨'}</span>)
                    : avatar(emp)
                  }
                </div>
                <button onClick={()=>fileRef.current.click()}
                  className='absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full text-white flex items-center justify-center text-xs hover:bg-red-700 shadow'>
                  📷
                </button>
                <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={handlePhoto} />
              </div>

              {/* Name + meta */}
              <div className='flex-1 min-w-0'>
                <div className='text-lg font-bold text-gray-800'>{isNew ? 'New Employee' : emp.name}</div>
                {!isNew && (
                  <>
                    <div className='text-sm text-gray-500 mt-0.5'>
                      {posName(emp.positionId)} &nbsp;·&nbsp; {deptName(emp.departmentId)}
                    </div>
                    {emp.managerId && (() => {
                      const mgr = employees.find(e=>e.id===emp.managerId)
                      return mgr ? (
                        <div className='text-xs text-gray-400 mt-0.5'>
                          Reports to:{' '}
                          <button onClick={() => handleSelect(mgr.id)}
                            className='font-semibold text-gray-600 hover:text-red-600 hover:underline transition'>
                            {mgr.name}
                          </button>
                        </div>
                      ) : null
                    })()}
                    <div className='flex items-center gap-2 mt-2 flex-wrap'>
                      <span className='font-mono text-xs bg-gray-100 px-2 py-0.5 rounded'>{emp.nik}</span>
                      {coCode(emp.companyId) && (
                        <span className='font-mono font-bold text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded tracking-widest'>
                          {coCode(emp.companyId)}
                        </span>
                      )}
                      <StatusBadge status={emp.status} />
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className='flex gap-2 flex-shrink-0'>
                {isNew ? (
                  <>
                    <ActionButton size='sm' variant='secondary' onClick={()=>setIsNew(false)}>
                      {t('Batal', 'Cancel')}
                    </ActionButton>
                    <ActionButton size='sm' variant='primary' onClick={handleSaveNew}>
                      {t('Simpan', 'Save')}
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <ActionButton size='sm' variant='secondary'
                      className='!bg-emerald-50 !text-emerald-700 !border-emerald-100 hover:!bg-emerald-100'
                      onClick={()=>router.push(`/hr/org-chart?focus=${emp.id}`)}>
                      🌳 Org Chart
                    </ActionButton>
                    <ActionButton size='sm' variant='secondary'
                      className='!bg-red-50 !text-red-600 !border-red-100 hover:!bg-red-100'
                      onClick={()=>{ if(confirm(t(`Hapus ${emp.name}?`, `Delete ${emp.name}?`))) { deleteEmployee(emp.id); setSelectedId(null) } }}>
                      🗑️ {t('Hapus', 'Delete')}
                    </ActionButton>
                  </>
                )}
              </div>
            </div>

            {/* ── Tabs ── */}
            {!isNew && (
              <div className='border-b border-gray-100 px-6 py-3'>
                <div className='inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1'>
                  {TABS.map(tb => (
                    <button key={tb} onClick={()=>setTab(tb)}
                      className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition ${
                        tab===tb ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                      }`}>
                      {tb}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* flash msg */}
            {msg && (
              <div className={`mx-6 mt-3 px-4 py-2 rounded-lg text-xs ${msg.type==='error'?'bg-red-50 text-red-600':'bg-green-50 text-green-600'}`}>
                {msg.text}
              </div>
            )}

            {/* ── Tab content ── */}
            <div className='flex-1 overflow-y-auto bg-gray-50/60 p-6'>
              {isNew
                ? <NewEmployeeForm form={form} setForm={setForm} S={S} />
                : tab==='Employment'  ? <TabEmployment  emp={emp} S={S} update={updateEmployee} grade={grade} flash={flash}
                                          addHistory={addHistory} updateHistory={updateHistory} deleteHistory={deleteHistory}
                                          allEmployees={employees} onSelectEmployee={handleSelect} />
                : tab==='Bio'        ? <TabBio         emp={emp} update={updateEmployee} flash={flash} />
                : tab==='Dependent'  ? <TabDependent   emp={emp} add={addDependent} upd={updateDependent} del={deleteDependent} flash={flash} />
                :                      <TabProfile      emp={emp} addEdu={addEducation} delEdu={deleteEducation}
                                                        addCert={addCertification} delCert={deleteCertification}
                                                        addSkill={addSkill} delSkill={deleteSkill} flash={flash} />
              }
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Employment
// ═══════════════════════════════════════════════════════════════════════════════
function TabEmployment({ emp, S, update, grade, flash, addHistory, updateHistory, deleteHistory, allEmployees, onSelectEmployee }) {
  const [form,           setForm          ] = useState({ ...emp })
  const [showAdditional, setShowAdditional] = useState(true)
  const t = useT()

  useEffect(() => { setForm({ ...emp }) }, [emp.id])

  const save = (field, val) => {
    update(emp.id, { [field]: val })
    flash(t('Tersimpan.', 'Saved.'))
  }

  const saveAll = () => {
    update(emp.id, {
      nik:                 form.nik,
      companyId:           form.companyId,
      divisionId:          form.divisionId,
      businessUnitId:      form.businessUnitId,
      departmentId:        form.departmentId,
      positionId:          form.positionId,
      gradeId:             form.gradeId,
      individualClassId:   form.individualClassId,
      managerId:           form.managerId,
      employmentType:      form.employmentType,
      status:              form.status,
      joinDate:            form.joinDate,
      endDate:             form.endDate,
      role:                form.role,
      // Additional Assignment Info (Philippines, Inc.)
      currency:            form.currency           || '',
      basicSalary:         form.basicSalary        || '',
      salaryAdjustment:    form.salaryAdjustment   || '',
      promotionAllowance:  form.promotionAllowance || '',
      meals:               form.meals              || '',
      communication:       form.communication      || '',
      gasCard:             form.gasCard            || '',
      tollAndParking:      form.tollAndParking      || '',
      medical:             form.medical            || '',
    })
    flash(t('Employment data disimpan.', 'Employment data saved.'))
  }

  const isPHL = Number(form.companyId) === PHL_COMPANY_ID

  const g = grade(form.gradeId)

  return (
    <div className='space-y-6'>
      <Section title='📋 Organization'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Field label='Company'>
            <Select value={form.companyId} onChange={e=>setForm(f=>({...f,companyId:+e.target.value}))}
              options={S.companies.map(x=>({value:x.id,label:x.name}))} />
            {form.companyId && (() => {
              const code = S.companies.find(x=>x.id===+form.companyId)?.companyCode
              return code ? (
                <span className='inline-block mt-1.5 font-mono font-bold text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded tracking-widest'>
                  {code}
                </span>
              ) : null
            })()}
          </Field>
          <Field label='Division'>
            <Select value={form.divisionId} onChange={e=>setForm(f=>({...f,divisionId:+e.target.value}))}
              options={S.divisions.map(x=>({value:x.id,label:x.name}))} />
          </Field>
          <Field label='Business Unit'>
            <Select value={form.businessUnitId} onChange={e=>setForm(f=>({...f,businessUnitId:+e.target.value}))}
              options={S.businessUnits.map(x=>({value:x.id,label:x.name}))} />
          </Field>
          <Field label='Department'>
            <Select value={form.departmentId} onChange={e=>setForm(f=>({...f,departmentId:+e.target.value}))}
              options={S.departments.map(x=>({value:x.id,label:x.name}))} />
          </Field>
          <Field label='Position'>
            <Select value={form.positionId} onChange={e=>setForm(f=>({...f,positionId:+e.target.value}))}
              options={S.positions.map(x=>({value:x.id,label:x.name}))} />
          </Field>
          <Field label={t('Manager (Atasan Langsung)', 'Manager (Direct Supervisor)')}>
            <select value={form.managerId||''}
              onChange={e=>setForm(f=>({...f,managerId:e.target.value?+e.target.value:null}))}
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
              <option value=''>— {t('Tidak ada', 'None')} —</option>
              {(allEmployees||[])
                .filter(e => e.id !== emp.id && e.status === 'Active')
                .map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} · {e.nik}
                  </option>
                ))}
            </select>
            {form.managerId && (() => {
              const mgr = (allEmployees||[]).find(e=>e.id===+form.managerId)
              const pos = mgr?.positionId ? S.positions.find(p=>p.id===mgr.positionId)?.name : null
              return mgr ? (
                <button onClick={() => onSelectEmployee?.(mgr.id)}
                  className='mt-2 w-full flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 hover:bg-blue-100 hover:border-blue-300 transition text-left group'>
                  <div className='w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm flex-shrink-0 overflow-hidden'>
                    {mgr.photo
                      ? <img src={mgr.photo} className='w-full h-full object-cover' />
                      : (mgr.gender==='Female' ? '👩' : '👨')}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-xs font-semibold text-blue-800 group-hover:underline'>{mgr.name}</div>
                    {pos && <div className='text-xs text-blue-500'>{pos}</div>}
                  </div>
                  <span className='text-blue-300 text-xs group-hover:text-blue-500'>→</span>
                </button>
              ) : null
            })()}
          </Field>
        </div>
      </Section>

      {/* Direct Subordinates */}
      {(() => {
        const subs = (allEmployees || []).filter(e => e.managerId === emp.id && e.id !== emp.id)
        if (subs.length === 0) return null
        return (
          <Section title={`👥 Direct Subordinates (${subs.length})`}>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
              {subs.map(s => (
                <button key={s.id}
                  onClick={() => onSelectEmployee?.(s.id)}
                  className='flex items-center gap-3 px-3 py-2.5 border border-gray-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition text-left group'>
                  <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0'>
                    {s.photo
                      ? <img src={s.photo} className='w-full h-full object-cover' />
                      : <span className='text-sm'>{s.gender === 'Female' ? '👩' : '👨'}</span>}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-xs font-semibold text-gray-800 truncate group-hover:text-red-700'>{s.name}</div>
                    <div className='text-xs text-gray-400 truncate'>
                      {S.positions.find(p => p.id === s.positionId)?.name || '—'}
                      {S.departments.find(d => d.id === s.departmentId) && (
                        <> · {S.departments.find(d => d.id === s.departmentId).name}</>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.status}
                  </span>
                </button>
              ))}
            </div>
          </Section>
        )
      })()}

      <Section title='🎖️ Grade (Position Class & Individual Class)'>
        {(() => {
          const ic = grade(form.individualClassId)
          // PC vs IC comparison
          let cmpBadge = null
          if (g && ic) {
            if (g.id === ic.id) cmpBadge = <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600'>PC = IC</span>
            else if (ic.id > g.id) cmpBadge = <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700'>IC &gt; PC</span>
            else cmpBadge = <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700'>IC &lt; PC</span>
          }
          const gradeSelect = (fieldKey, placeholder) => (
            <select value={form[fieldKey]||''} onChange={e=>setForm(f=>({...f,[fieldKey]:+e.target.value}))}
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
              <option value=''>{placeholder}</option>
              {Object.entries(
                S.grades.reduce((m,gr)=>{ (m[gr.category]??=[]).push(gr); return m },{})
              ).map(([cat,items])=>(
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {items.map(gr=><option key={gr.id} value={gr.id}>{gr.code.replace('PC','')} · {gr.name}</option>)}
                </optgroup>
              ))}
            </select>
          )
          const gradeCard = (grObj, label) => grObj ? (
            <div className={`flex flex-col justify-center px-4 py-3 rounded-xl border ${PC_CATEGORY_COLOR[grObj.category]?.replace('bg-','border-').split(' ')[0]} bg-opacity-30`}>
              <div className='flex items-center gap-2 mb-1'>
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${PC_CATEGORY_COLOR[grObj.category]}`}>{grObj.code} · {grObj.category}</div>
                <span className='text-xs text-gray-400 font-medium'>{label}</span>
              </div>
              <div className='text-sm font-semibold text-gray-800'>{grObj.name}</div>
              {!grObj.isBoard && <div className='text-xs text-gray-500 mt-0.5'>
                Rp {new Intl.NumberFormat('id-ID').format(grObj.minSalary)} – Rp {new Intl.NumberFormat('id-ID').format(grObj.maxSalary)}
              </div>}
              {grObj.isBoard && <div className='text-xs text-yellow-600 mt-0.5'>Honorarium-based</div>}
            </div>
          ) : null
          return (
            <div className='space-y-4'>
              {/* PC row */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Field label='Grade / PC (Position Class)'>
                  {gradeSelect('gradeId', '-- Pilih PC --')}
                </Field>
                {gradeCard(g, 'PC')}
              </div>
              {/* IC row */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Field label='IC (Individual Class)'>
                  {gradeSelect('individualClassId', '-- Pilih IC --')}
                  <p className='text-xs text-gray-400 mt-1'>{t('Grade yang melekat pada karyawan secara pribadi. Umumnya sama dengan PC, bisa sedikit di atas atau di bawah.', 'Grade personally attached to the employee (Individual Class). Usually the same as PC, but can be slightly above or below.')}</p>
                </Field>
                {gradeCard(ic, 'IC')}
              </div>
              {/* Comparison */}
              {cmpBadge && (
                <div className='flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5'>
                  <span className='text-xs text-gray-500 font-medium'>{t('Perbandingan PC ↔ IC:', 'PC ↔ IC Comparison:')}</span>
                  {cmpBadge}
                  {g && ic && g.id !== ic.id && (
                    <span className='text-xs text-gray-400'>
                      PC: <strong>{g.code}</strong> · IC: <strong>{ic.code}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })()}
      </Section>

      <Section title='📅 Employment Info'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Field label='NIK'>
            <Input value={form.nik} onChange={e=>setForm(f=>({...f,nik:e.target.value}))} />
          </Field>
          <Field label='Employment Type'>
            <Select value={form.employmentType} onChange={e=>setForm(f=>({...f,employmentType:e.target.value}))}
              options={EMP_TYPES} />
          </Field>
          <Field label='Status'>
            <Select value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}
              options={['Active','Inactive','Terminated','Resigned']} />
          </Field>
          <Field label='Join Date'>
            <Input type='date' value={form.joinDate} onChange={e=>setForm(f=>({...f,joinDate:e.target.value}))} />
          </Field>
          <Field label='End Date'>
            <Input type='date' value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} />
          </Field>
          <Field label='Role (System)'>
            <Select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}
              options={['employee','manager','hr','superadmin']} />
          </Field>
        </div>
      </Section>

      <button onClick={saveAll}
        className='px-6 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90'
        style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
        💾 {t('Simpan Employment', 'Save Employment')}
      </button>

      {/* ── Additional Assignment Info (Philippines, Inc. only) ── */}
      {isPHL && (
        <div className='border border-gray-200 rounded-xl overflow-hidden'>
          <button
            type='button'
            onClick={() => setShowAdditional(v => !v)}
            className='w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 transition text-left'>
            <span className='text-xs font-bold text-gray-700 uppercase tracking-wide'>
              💼 Additional Assignment Info
            </span>
            <span className={`text-gray-500 text-xs transition-transform duration-200 ${showAdditional ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showAdditional && (
            <div className='px-5 py-4 space-y-3'>
              {/* Currency */}
              <div className='grid grid-cols-[160px_1fr] items-center gap-3'>
                <span className='text-xs font-semibold text-gray-600'>
                  Currency <span className='text-red-500'>*</span>
                </span>
                <select
                  value={form.currency || ''}
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 bg-white'>
                  <option value=''>-- Select --</option>
                  {CURRENCY_LOV.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Numeric fields */}
              {[
                ['basicSalary',        'Basic Salary',        true,  false],
                ['salaryAdjustment',   'Salary Adjustment',   false, false],
                ['promotionAllowance', 'Promotion Allowance', false, false],
                ['meals',              'Meals',               false, false],
                ['communication',      'Communication',       false, true ],
                ['gasCard',            'Gas Card',            false, false],
                ['tollAndParking',     'Toll and Parking',    false, false],
                ['medical',            'Medical',             false, true ],
              ].map(([key, label, required, highlighted]) => (
                <div key={key} className='grid grid-cols-[160px_1fr] items-center gap-3'>
                  <span className={`text-xs font-semibold ${highlighted ? 'text-blue-600' : 'text-gray-600'}`}>
                    {label}{required && <span className='text-red-500 ml-0.5'>*</span>}
                  </span>
                  <input
                    type='number' min='0'
                    value={form[key] || ''}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'
                  />
                </div>
              ))}

              <div className='pt-1'>
                <button onClick={saveAll}
                  className='px-5 py-2 text-white text-xs font-semibold rounded-lg hover:opacity-90'
                  style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
                  💾 {t('Simpan Additional Info', 'Save Additional Info')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Employment History ── */}
      <HistorySection emp={emp} S={S} grade={grade} flash={flash}
        addHistory={addHistory} updateHistory={updateHistory} deleteHistory={deleteHistory} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Bio
// ═══════════════════════════════════════════════════════════════════════════════
function TabBio({ emp, update, flash }) {
  const [form, setForm] = useState({ ...emp })
  const t = useT()

  useEffect(() => { setForm({ ...emp }) }, [emp.id])

  const save = () => {
    update(emp.id, {
      name:          form.name,
      gender:        form.gender,
      birthPlace:    form.birthPlace,
      birthDate:     form.birthDate,
      nationality:   form.nationality,
      religion:      form.religion,
      maritalStatus: form.maritalStatus,
      bloodType:     form.bloodType,
      taxStatus:     form.taxStatus,
      ktp:           form.ktp,
      npwp:          form.npwp,
      bpjs:          form.bpjs,
      phone:         form.phone,
      email:         form.email,
      personalEmail: form.personalEmail,
      address:       form.address,
      city:          form.city,
      country:       form.country,
    })
    flash(t('Bio data disimpan.', 'Bio data saved.'))
  }

  return (
    <div className='space-y-6'>
      <Section title='👤 Personal Info'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Field label={t('Nama Lengkap', 'Full Name')}><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></Field>
          <Field label='Gender'><Select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} options={GENDERS} /></Field>
          <Field label={t('Tempat Lahir', 'Place of Birth')}><Input value={form.birthPlace} onChange={e=>setForm(f=>({...f,birthPlace:e.target.value}))} /></Field>
          <Field label={t('Tanggal Lahir', 'Date of Birth')}><Input type='date' value={form.birthDate} onChange={e=>setForm(f=>({...f,birthDate:e.target.value}))} /></Field>
          <Field label={t('Kewarganegaraan', 'Nationality')}><Input value={form.nationality} onChange={e=>setForm(f=>({...f,nationality:e.target.value}))} /></Field>
          <Field label={t('Agama', 'Religion')}><Select value={form.religion} onChange={e=>setForm(f=>({...f,religion:e.target.value}))} options={RELIGIONS} /></Field>
          <Field label={t('Status Perkawinan', 'Marital Status')}><Select value={form.maritalStatus} onChange={e=>setForm(f=>({...f,maritalStatus:e.target.value}))} options={MARITAL} /></Field>
          <Field label={t('Golongan Darah', 'Blood Type')}><Select value={form.bloodType} onChange={e=>setForm(f=>({...f,bloodType:e.target.value}))} options={BLOOD_TYPES} /></Field>
        </div>
      </Section>

      <Section title={t('🪪 Identitas', '🪪 Identity')}>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Field label={t('No. KTP', 'ID Card No.')}><Input value={form.ktp} onChange={e=>setForm(f=>({...f,ktp:e.target.value}))} placeholder='16 digit' /></Field>
          <Field label={t('No. NPWP', 'Tax ID No. (NPWP)')}><Input value={form.npwp} onChange={e=>setForm(f=>({...f,npwp:e.target.value}))} placeholder='XX.XXX.XXX.X-XXX.XXX' /></Field>
          <Field label='No. BPJS'>
            <input
              type='number'
              value={form.bpjs ?? ''}
              onChange={e => setForm(f => ({ ...f, bpjs: e.target.value }))}
              placeholder='13 digit'
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
            />
          </Field>
          <Field label={t('Status Pajak', 'Tax Status')}>
            <Select value={form.taxStatus} onChange={e=>setForm(f=>({...f,taxStatus:e.target.value}))} options={TAX_STATUS} />
          </Field>
        </div>
      </Section>

      <Section title={t('📞 Kontak', '📞 Contact')}>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Field label={t('No. HP', 'Phone No.')}><Input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></Field>
          <Field label={t('Email Perusahaan', 'Work Email')}><Input type='email' value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></Field>
          <Field label={t('Email Pribadi', 'Personal Email')}><Input type='email' value={form.personalEmail} onChange={e=>setForm(f=>({...f,personalEmail:e.target.value}))} /></Field>
          <Field label='City'>
            <Select value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} options={CITIES} />
          </Field>
          <Field label='Country'>
            <Select value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))} options={COUNTRIES} />
          </Field>
          <div className='col-span-full'>
            <Field label={t('Alamat', 'Address')}>
              <textarea value={form.address||''} onChange={e=>setForm(f=>({...f,address:e.target.value}))}
                rows={2} className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 resize-none' />
            </Field>
          </div>
        </div>
      </Section>

      <button onClick={save}
        className='px-6 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90'
        style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
        💾 {t('Simpan Bio', 'Save Bio')}
      </button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Dependent
// ═══════════════════════════════════════════════════════════════════════════════
function TabDependent({ emp, add, upd, del, flash }) {
  const BLANK = { name:'', relationship:'Spouse', birthDate:'', gender:'Female' }
  const [form,    setForm   ] = useState(BLANK)
  const [editing, setEditing] = useState(null)
  const t = useT()

  const handleSave = () => {
    if (!form.name) return flash(t('Nama wajib diisi.', 'Name is required.'),'error')
    if (editing) { upd(emp.id, editing, form); setEditing(null) }
    else         { add(emp.id, form) }
    setForm(BLANK)
    flash(t('Tanggungan disimpan.', 'Dependent saved.'))
  }

  return (
    <div className='space-y-6'>
      <Section title={editing ? t('✏️ Edit Tanggungan', '✏️ Edit Dependent') : t('➕ Tambah Tanggungan', '➕ Add Dependent')}>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div className='col-span-2'>
            <Field label={t('Nama', 'Name')}><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></Field>
          </div>
          <Field label={t('Hubungan', 'Relationship')}><Select value={form.relationship} onChange={e=>setForm(f=>({...f,relationship:e.target.value}))} options={RELS} /></Field>
          <Field label='Gender'><Select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} options={GENDERS} /></Field>
          <Field label={t('Tanggal Lahir', 'Date of Birth')}><Input type='date' value={form.birthDate} onChange={e=>setForm(f=>({...f,birthDate:e.target.value}))} /></Field>
        </div>
        <div className='flex gap-2 mt-3'>
          <button onClick={handleSave}
            className='px-5 py-2 text-white text-xs font-semibold rounded-lg hover:opacity-90'
            style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
            {editing ? t('Simpan', 'Save') : t('Tambah', 'Add')}
          </button>
          {editing && <button onClick={()=>{setEditing(null);setForm(BLANK)}}
            className='px-4 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg'>{t('Batal', 'Cancel')}</button>}
        </div>
      </Section>

      <Section title={t('👨‍👩‍👧‍👦 Daftar Tanggungan', '👨‍👩‍👧‍👦 Dependent List')}>
        {emp.dependents.length === 0
          ? <p className='text-sm text-gray-400'>{t('Belum ada tanggungan.', 'No dependents yet.')}</p>
          : (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {emp.dependents.map(d => (
                <div key={d.id} className='border border-gray-100 rounded-xl p-4 flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-lg flex-shrink-0'>
                    {d.gender==='Female'?'👩':'👦'}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-semibold text-gray-800'>{d.name}</div>
                    <div className='text-xs text-gray-500'>{d.relationship} · {d.birthDate||'-'}</div>
                  </div>
                  <div className='flex gap-1'>
                    <button onClick={()=>{setEditing(d.id);setForm({name:d.name,relationship:d.relationship,birthDate:d.birthDate,gender:d.gender})}}
                      className='px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100'>Edit</button>
                    <button onClick={()=>{ del(emp.id, d.id); flash(t('Tanggungan dihapus.', 'Dependent deleted.')) }}
                      className='px-2 py-1 bg-red-50 text-red-500 text-xs rounded-lg hover:bg-red-100'>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </Section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB: Profile
// ═══════════════════════════════════════════════════════════════════════════════
function TabProfile({ emp, addEdu, delEdu, addCert, delCert, addSkill, delSkill, flash }) {
  const [eduForm,  setEduForm ] = useState({ level:'S1', institution:'', major:'', graduationYear:'' })
  const [certForm, setCertForm] = useState({ name:'', issuer:'', issueYear:'', expiryYear:'' })
  const [skillForm,setSkillForm]= useState({ name:'', level:'Intermediate' })
  const t = useT()

  return (
    <div className='space-y-6'>
      {/* Education */}
      <Section title={t('🎓 Pendidikan', '🎓 Education')}>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-3'>
          <Field label={t('Jenjang', 'Level')}><Select value={eduForm.level} onChange={e=>setEduForm(f=>({...f,level:e.target.value}))} options={EDU_LEVELS} /></Field>
          <div className='col-span-2'>
            <Field label={t('Institusi', 'Institution')}><Input value={eduForm.institution} onChange={e=>setEduForm(f=>({...f,institution:e.target.value}))} /></Field>
          </div>
          <Field label={t('Jurusan', 'Major')}><Input value={eduForm.major} onChange={e=>setEduForm(f=>({...f,major:e.target.value}))} /></Field>
          <Field label={t('Tahun Lulus', 'Graduation Year')}><Input value={eduForm.graduationYear} onChange={e=>setEduForm(f=>({...f,graduationYear:e.target.value}))} placeholder='2020' /></Field>
        </div>
        <button onClick={()=>{ if(!eduForm.institution) return flash(t('Institusi wajib diisi.','Institution is required.'),'error'); addEdu(emp.id,eduForm); setEduForm({level:'S1',institution:'',major:'',graduationYear:''}); flash(t('Pendidikan ditambahkan.','Education added.')) }}
          className='px-4 py-1.5 text-white text-xs font-semibold rounded-lg hover:opacity-90 mb-4'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>+ {t('Tambah','Add')}</button>
        <div className='space-y-2'>
          {emp.education.map(e => (
            <div key={e.id} className='flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3'>
              <span className='text-xl'>🎓</span>
              <div className='flex-1'>
                <div className='text-sm font-semibold text-gray-800'>{e.institution}</div>
                <div className='text-xs text-gray-500'>{e.level} · {e.major} · {e.graduationYear}</div>
              </div>
              <button onClick={()=>{ delEdu(emp.id,e.id); flash(t('Pendidikan dihapus.','Education deleted.')) }}
                className='px-2 py-1 bg-red-50 text-red-500 text-xs rounded-lg hover:bg-red-100'>✕</button>
            </div>
          ))}
          {!emp.education.length && <p className='text-xs text-gray-400'>{t('Belum ada data pendidikan.','No education data yet.')}</p>}
        </div>
      </Section>

      {/* Certifications */}
      <Section title={t('📜 Sertifikasi', '📜 Certifications')}>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-3'>
          <div className='col-span-2'>
            <Field label={t('Nama Sertifikat', 'Certificate Name')}><Input value={certForm.name} onChange={e=>setCertForm(f=>({...f,name:e.target.value}))} /></Field>
          </div>
          <Field label='Issuer'><Input value={certForm.issuer} onChange={e=>setCertForm(f=>({...f,issuer:e.target.value}))} /></Field>
          <Field label={t('Tahun Terbit', 'Issue Year')}><Input value={certForm.issueYear} onChange={e=>setCertForm(f=>({...f,issueYear:e.target.value}))} placeholder='2022' /></Field>
          <Field label={t('Tahun Kedaluwarsa', 'Expiry Year')}><Input value={certForm.expiryYear} onChange={e=>setCertForm(f=>({...f,expiryYear:e.target.value}))} placeholder='2025 / —' /></Field>
        </div>
        <button onClick={()=>{ if(!certForm.name) return flash(t('Nama sertifikat wajib.','Certificate name is required.'),'error'); addCert(emp.id,certForm); setCertForm({name:'',issuer:'',issueYear:'',expiryYear:''}); flash(t('Sertifikasi ditambahkan.','Certification added.')) }}
          className='px-4 py-1.5 text-white text-xs font-semibold rounded-lg hover:opacity-90 mb-4'
          style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>+ {t('Tambah','Add')}</button>
        <div className='space-y-2'>
          {emp.certifications.map(c => (
            <div key={c.id} className='flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3'>
              <span className='text-xl'>📜</span>
              <div className='flex-1'>
                <div className='text-sm font-semibold text-gray-800'>{c.name}</div>
                <div className='text-xs text-gray-500'>{c.issuer} · {c.issueYear}{c.expiryYear ? ` → ${c.expiryYear}` : ''}</div>
              </div>
              <button onClick={()=>{ delCert(emp.id,c.id); flash(t('Sertifikasi dihapus.','Certification deleted.')) }}
                className='px-2 py-1 bg-red-50 text-red-500 text-xs rounded-lg hover:bg-red-100'>✕</button>
            </div>
          ))}
          {!emp.certifications.length && <p className='text-xs text-gray-400'>{t('Belum ada sertifikasi.','No certifications yet.')}</p>}
        </div>
      </Section>

      {/* Skills */}
      <Section title='⚡ Skills'>
        <div className='flex gap-3 mb-3'>
          <div className='flex-1'><Input value={skillForm.name} onChange={e=>setSkillForm(f=>({...f,name:e.target.value}))} placeholder={t('Nama skill','Skill name')} /></div>
          <div className='w-40'><Select value={skillForm.level} onChange={e=>setSkillForm(f=>({...f,level:e.target.value}))} options={SKILL_LVLS} /></div>
          <button onClick={()=>{ if(!skillForm.name) return flash(t('Nama skill wajib.','Skill name is required.'),'error'); addSkill(emp.id,skillForm); setSkillForm({name:'',level:'Intermediate'}); flash(t('Skill ditambahkan.','Skill added.')) }}
            className='px-4 py-2 text-white text-xs font-semibold rounded-lg hover:opacity-90 flex-shrink-0'
            style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>+ {t('Tambah','Add')}</button>
        </div>
        <div className='flex flex-wrap gap-2'>
          {emp.skills.map(sk => {
            const color = {Beginner:'bg-gray-100 text-gray-600',Intermediate:'bg-blue-100 text-blue-700',Advanced:'bg-red-100 text-red-700',Expert:'bg-orange-100 text-orange-700'}[sk.level]||''
            return (
              <div key={sk.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}>
                {sk.name}
                <span className='opacity-60 text-xs'>· {sk.level}</span>
                <button onClick={()=>{ delSkill(emp.id,sk.id); flash(t('Skill dihapus.','Skill deleted.')) }} className='ml-1 opacity-50 hover:opacity-100'>✕</button>
              </div>
            )
          })}
          {!emp.skills.length && <p className='text-xs text-gray-400'>{t('Belum ada skill.','No skills yet.')}</p>}
        </div>
      </Section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// New Employee Form (Employment only — rest can be filled after save)
// ═══════════════════════════════════════════════════════════════════════════════
function NewEmployeeForm({ form, setForm, S }) {
  const f = (key) => <Input value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} />
  const s = (key, opts) => <Select value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} options={opts} />
  const t = useT()

  return (
    <div className='space-y-6'>
      <Section title={t('📋 Informasi Dasar', '📋 Basic Information')}>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Field label='NIK *'>{f('nik')}</Field>
          <div className='col-span-2'><Field label={t('Nama Lengkap *', 'Full Name *')}>{f('name')}</Field></div>
          <Field label='Gender'>{s('gender', GENDERS)}</Field>
          <Field label='Email'>{f('email')}</Field>
          <Field label={t('No. HP', 'Phone No.')}>{f('phone')}</Field>
        </div>
      </Section>
      <Section title={t('🏢 Penempatan', '🏢 Placement')}>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Field label='Company'>{s('companyId', S.companies.map(x=>({value:x.id,label:x.name})))}</Field>
          <Field label='Division'>{s('divisionId', S.divisions.map(x=>({value:x.id,label:x.name})))}</Field>
          <Field label='Business Unit'>{s('businessUnitId', S.businessUnits.map(x=>({value:x.id,label:x.name})))}</Field>
          <Field label='Department'>{s('departmentId', S.departments.map(x=>({value:x.id,label:x.name})))}</Field>
          <Field label='Position'>{s('positionId', S.positions.map(x=>({value:x.id,label:x.name})))}</Field>
          <Field label='Grade / PC'>
            <select value={form.gradeId||''} onChange={e=>setForm(p=>({...p,gradeId:+e.target.value}))}
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
              <option value=''>{t('-- Pilih PC --', '-- Select --')}</option>
              {Object.entries(S.grades.reduce((m,g)=>{ (m[g.category]??=[]).push(g); return m },{})).map(([cat,items])=>(
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {items.map(g=><option key={g.id} value={g.id}>{g.code.replace('PC','')} · {g.name}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>
          <Field label='IC (Individual Class)'>
            <select value={form.individualClassId||''} onChange={e=>setForm(p=>({...p,individualClassId:+e.target.value}))}
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
              <option value=''>{t('-- Pilih IC --', '-- Select --')}</option>
              {Object.entries(S.grades.reduce((m,g)=>{ (m[g.category]??=[]).push(g); return m },{})).map(([cat,items])=>(
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {items.map(g=><option key={g.id} value={g.id}>{g.code.replace('PC','')} · {g.name}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>
        </div>
      </Section>
      <Section title='📅 Employment'>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
          <Field label='Employment Type'>{s('employmentType', EMP_TYPES)}</Field>
          <Field label='Join Date'><Input type='date' value={form.joinDate} onChange={e=>setForm(p=>({...p,joinDate:e.target.value}))} /></Field>
          <Field label='Status'>{s('status', ['Active','Inactive'])}</Field>
        </div>
      </Section>
    </div>
  )
}

// ── shared UI ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Employment History Section
// ═══════════════════════════════════════════════════════════════════════════════
const HIST_BLANK = { effectiveDate:'', effectiveSeq:1, action:'', reason:'', companyId:'', departmentId:'', positionId:'', gradeId:'', note:'' }

function HistorySection({ emp, S, grade, flash, addHistory, updateHistory, deleteHistory }) {
  const [form,    setForm   ] = useState(HIST_BLANK)
  const [editing, setEditing] = useState(null)
  const [showForm,setShowForm] = useState(false)
  const t = useT()

  const history = [...(emp.history || [])].sort((a,b) =>
    b.effectiveDate.localeCompare(a.effectiveDate) || b.effectiveSeq - a.effectiveSeq
  )

  const reasons  = HISTORY_REASONS[form.action] || []
  const isTermination = form.action === 'Termination'

  const handleSave = () => {
    if (!form.effectiveDate || !form.action || !form.reason)
      return flash(t('Effective Date, Action, dan Reason wajib diisi.', 'Effective Date, Action, and Reason are required.'), 'error')
    if (editing) {
      updateHistory(emp.id, editing, form)
      setEditing(null)
      flash(t('History diperbarui.', 'History updated.'))
    } else {
      addHistory(emp.id, form)
      flash(t('History ditambahkan.', 'History added.'))
    }
    setForm(HIST_BLANK)
    setShowForm(false)
  }

  const handleEdit = (h) => {
    setEditing(h.id)
    setForm({ effectiveDate:h.effectiveDate, effectiveSeq:h.effectiveSeq,
              action:h.action, reason:h.reason,
              companyId:h.companyId||'', departmentId:h.departmentId||'',
              positionId:h.positionId||'', gradeId:h.gradeId||'', note:h.note||'' })
    setShowForm(true)
  }

  const handleCancel = () => { setEditing(null); setForm(HIST_BLANK); setShowForm(false) }

  const posName  = id => S.positions.find(p=>p.id===+id)?.name || '-'
  const deptName = id => S.departments.find(d=>d.id===+id)?.name || '-'

  return (
    <div className='border-t border-gray-100 pt-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wide'>📜 Employment History</h3>
        {!showForm && (
          <button onClick={()=>setShowForm(true)}
            className='px-3 py-1.5 text-white text-xs font-semibold rounded-lg hover:opacity-90'
            style={{background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
            + Add Action
          </button>
        )}
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className='bg-gray-50 border border-gray-200 rounded-xl p-5 mb-5'>
          <h4 className='text-xs font-bold text-gray-600 mb-4'>{editing ? '✏️ Edit History' : t('➕ Tambah Action', '➕ Add Action')}</h4>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-4'>
            <Field label='Effective Date *'>
              <Input type='date' value={form.effectiveDate} onChange={e=>setForm(f=>({...f,effectiveDate:e.target.value}))} />
            </Field>
            <Field label='Effective Sequence'>
              <input type='number' min={1} max={99} value={form.effectiveSeq}
                onChange={e=>setForm(f=>({...f,effectiveSeq:+e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
            </Field>
            <Field label='Action *'>
              <select value={form.action}
                onChange={e=>setForm(f=>({...f,action:e.target.value,reason:''}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>{t('-- Pilih Action --', '-- Select Action --')}</option>
                {HISTORY_ACTIONS.map(a=>(
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label='Reason *'>
              <select value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}
                disabled={!form.action}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400 disabled:opacity-50'>
                <option value=''>{t('-- Pilih Reason --', '-- Select Reason --')}</option>
                {reasons.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label='Department'>
              <Select value={form.departmentId} onChange={e=>setForm(f=>({...f,departmentId:e.target.value}))}
                options={S.departments.map(x=>({value:x.id,label:x.name}))} />
            </Field>
            <Field label='Position'>
              <Select value={form.positionId} onChange={e=>setForm(f=>({...f,positionId:e.target.value}))}
                options={S.positions.map(x=>({value:x.id,label:x.name}))} />
            </Field>
            <Field label='Grade / PC'>
              <select value={form.gradeId||''} onChange={e=>setForm(f=>({...f,gradeId:+e.target.value}))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                <option value=''>{t('-- Pilih PC --', '-- Select --')}</option>
                {Object.entries(S.grades.reduce((m,g)=>{(m[g.category]??=[]).push(g);return m},{})).map(([cat,items])=>(
                  <optgroup key={cat} label={`── ${cat} ──`}>
                    {items.map(g=><option key={g.id} value={g.id}>{g.code.replace('PC','')} · {g.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </Field>
            <div className='col-span-full'>
              <Field label='Note'>
                <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))}
                  placeholder={t('Catatan tambahan (opsional)', 'Additional notes (optional)')}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </Field>
            </div>
          </div>

          {/* Termination warning */}
          {isTermination && (
            <div className='flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4'>
              <span className='text-red-500 text-sm flex-shrink-0'>⚠️</span>
              <p className='text-xs text-red-600'>
                {t(
                  'Action Termination akan menjadi baris terakhir history karyawan ini. Pastikan reason sudah benar sebelum menyimpan.',
                  'The Termination action will be the last history entry for this employee. Make sure the reason is correct before saving.'
                )}
              </p>
            </div>
          )}

          <div className='flex gap-2'>
            <button onClick={handleSave}
              className={`px-5 py-2 text-white text-xs font-semibold rounded-lg hover:opacity-90 ${isTermination ? 'bg-red-600' : ''}`}
              style={isTermination ? {} : {background:'linear-gradient(135deg,#8B1A1A,#D7252B)'}}>
              {editing ? t('Simpan', 'Save') : isTermination ? t('⚠️ Simpan Termination', '⚠️ Save Termination') : t('Tambah', 'Add')}
            </button>
            <button onClick={handleCancel}
              className='px-4 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200'>
              {t('Batal', 'Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* ── Timeline ── */}
      {history.length === 0 ? (
        <p className='text-xs text-gray-400 py-4'>{t('Belum ada history.', 'No history yet.')}</p>
      ) : (
        <div className='relative'>
          {/* vertical line */}
          <div className='absolute left-[18px] top-2 bottom-2 w-0.5 bg-gray-200' />
          <div className='space-y-3'>
            {history.map((h, idx) => {
              const g = grade(h.gradeId)
              const isFirst = idx === history.length - 1
              const isLast  = idx === 0
              return (
                <div key={h.id} className='flex gap-4'>
                  {/* dot */}
                  <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm
                    ${h.action==='Hire' ? 'bg-green-500 text-white' :
                      h.action==='Termination' ? 'bg-red-500 text-white' :
                      'bg-white border-2 border-red-300 text-red-600'}`}>
                    {h.action==='Hire' ? '🚀' : h.action==='Termination' ? '🔴' : h.effectiveSeq}
                  </div>
                  {/* card */}
                  <div className={`flex-1 border rounded-xl px-4 py-3 ${isLast && h.action!=='Termination' ? 'border-red-200 bg-red-50/40' : 'border-gray-100 bg-white'}`}>
                    <div className='flex items-start justify-between gap-2 flex-wrap'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ACTION_COLOR[h.action] || 'bg-gray-100 text-gray-600'}`}>
                          {h.action}
                        </span>
                        <span className='text-xs text-gray-500'>{h.reason}</span>
                        {isLast && h.action !== 'Termination' && (
                          <span className='text-xs font-semibold bg-red-600 text-white px-2 py-0.5 rounded-full'>Current</span>
                        )}
                      </div>
                      <div className='flex items-center gap-3 flex-shrink-0'>
                        <span className='text-xs text-gray-400 font-mono'>{h.effectiveDate} · Seq {h.effectiveSeq}</span>
                        <button onClick={()=>handleEdit(h)} className='text-xs text-blue-500 hover:text-blue-700 font-semibold'>Edit</button>
                        {h.action !== 'Hire' && (
                          <button onClick={()=>{ if(confirm(t('Hapus history ini?','Delete this history entry?'))) { deleteHistory(emp.id,h.id); flash(t('History dihapus.','History deleted.')) }}}
                            className='text-xs text-red-400 hover:text-red-600 font-semibold'>{t('Hapus','Delete')}</button>
                        )}
                      </div>
                    </div>
                    <div className='flex flex-wrap gap-3 mt-2 text-xs text-gray-500'>
                      {h.departmentId && <span>🗂️ {deptName(h.departmentId)}</span>}
                      {h.positionId   && <span>📌 {posName(h.positionId)}</span>}
                      {g              && <span>🎖️ {g.code} · {g.name}</span>}
                      {h.note         && <span className='text-gray-400 italic'>"{h.note}"</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100'>
      <h3 className='mb-4 text-xs font-bold uppercase tracking-wide text-gray-500'>{title}</h3>
      {children}
    </section>
  )
}
