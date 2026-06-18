'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEmployeeStore } from '@/store/employeeStore'
import { useStructureStore } from '@/store/structureStore'
import { useT } from '@/store/languageStore'
<<<<<<< HEAD
import { tenure, daysUntil } from '@/utils/dateUtils'
import { EMPTY_EMP, EMP_TYPES } from '@/utils/constants'
import TabEmployment  from '@/components/employee/TabEmployment'
import TabBio         from '@/components/employee/TabBio'
import TabDependent   from '@/components/employee/TabDependent'
import TabProfile     from '@/components/employee/TabProfile'
import NewEmployeeForm from '@/components/employee/NewEmployeeForm'
=======
import {
  PageHeader, StatCard, SectionCard, DataTable, Tr, Td,
  SearchBar, FilterBar, FilterPill, StatusBadge, ActionButton,
  EmptyState, FormField, Input as DSInput, Select as DSSelect, BRAND_GRADIENT,
} from '@/components/ui'
>>>>>>> worktree-agent-aca6c81ffb81b6db2

const TABS = ['Employment', 'Bio', 'Dependent', 'Profile']

function Avatar({ emp, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-20 h-20 rounded-xl' : 'w-9 h-9 rounded-full'
  const txt = size === 'lg' ? 'text-3xl' : 'text-base'
  return (
    <div className={`${dim} bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {emp?.photo
        ? <img src={emp.photo} alt='' className='w-full h-full object-cover' />
        : <span className={txt}>{emp?.gender === 'Female' ? '👩' : '👨'}</span>}
    </div>
  )
}

export default function EmployeeDataPage() {
  const store     = useEmployeeStore()
  const structure = useStructureStore()
  const {
    employees, updateEmployee, addEmployee, deleteEmployee,
    setPhoto, addDependent, updateDependent, deleteDependent,
    addEducation, updateEducation, deleteEducation,
    addCertification, updateCertification, deleteCertification,
    addSkill, updateSkill, deleteSkill,
    addHistory, updateHistory, deleteHistory,
  } = store

  const router       = useRouter()
  const searchParams = useSearchParams()
  const t            = useT()
  const fileRef      = useRef()

  const [selectedId,   setSelectedId  ] = useState(null)
  const [tab,          setTab         ] = useState('Employment')
  const [isNew,        setIsNew       ] = useState(false)
  const [form,         setForm        ] = useState(EMPTY_EMP)
  const [msg,          setMsg         ] = useState(null)
  const [confirmDelete,setConfirmDelete] = useState(false)

  // Search gate
  const [searchMode,    setSearchMode   ] = useState(true)
  const [draftFilters,  setDraftFilters ] = useState({ q: '', status: 'Active', dept: '', empType: '' })
  const [activeFilters, setActiveFilters] = useState({ q: '', status: 'Active', dept: '', empType: '' })
  const [inlineQ,       setInlineQ      ] = useState('')

  const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000) }

  // Handle ?id= deep link from global search
  useEffect(() => {
    const idParam = searchParams.get('id')
    if (!idParam) return
    const found = employees.find(e => e.id === +idParam)
    if (found) {
      setActiveFilters(f => ({ ...f, status: '' }))
      setSearchMode(false)
      setSelectedId(found.id)
      setIsNew(false)
      setTab('Employment')
    }
  }, [searchParams])

  const emp = isNew ? null : employees.find(e => e.id === selectedId)

  const STATUS_OPTS = [
    { value: 'Active',     label: 'Active'     },
    { value: 'Inactive',   label: 'Inactive'   },
    { value: 'Terminated', label: 'Terminated' },
    { value: 'Resigned',   label: 'Resigned'   },
    { value: '',           label: t('Semua Status', 'All Status') },
  ]

  const list = employees.filter(e => {
    const q       = (activeFilters.q || '').toLowerCase()
    const inQ     = inlineQ.toLowerCase()
    const matchQ    = !q    || e.name.toLowerCase().includes(q) || e.nik.toLowerCase().includes(q)
    const matchInQ  = !inQ  || e.name.toLowerCase().includes(inQ) || e.nik.toLowerCase().includes(inQ)
    const matchStat = !activeFilters.status || e.status === activeFilters.status
    const matchDept = !activeFilters.dept   || String(e.departmentId) === String(activeFilters.dept)
    const matchType = !activeFilters.empType || e.employmentType === activeFilters.empType
    return matchQ && matchInQ && matchStat && matchDept && matchType
  })

  const handleSearch = () => {
    setActiveFilters({ ...draftFilters })
    setSelectedId(null); setIsNew(false); setInlineQ(''); setSearchMode(false)
  }
  const handleNew    = () => { setForm(EMPTY_EMP); setIsNew(true); setSelectedId(null); setTab('Employment'); setConfirmDelete(false) }
  const handleSelect = (id) => { setSelectedId(id); setIsNew(false); setTab('Employment'); setConfirmDelete(false) }

<<<<<<< HEAD
=======
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
>>>>>>> worktree-agent-aca6c81ffb81b6db2
  const handleSaveNew = () => {
    if (!form.nik)      return flash(t('NIK wajib diisi.', 'NIK is required.'), 'error')
    if (!form.name)     return flash(t('Nama wajib diisi.', 'Name is required.'), 'error')
    if (!form.companyId) return flash(t('Company wajib dipilih.', 'Company is required.'), 'error')
    if (!form.joinDate) return flash(t('Join Date wajib diisi.', 'Join Date is required.'), 'error')
    addEmployee(form)
    const newId = useEmployeeStore.getState().lastAddedEmpId
    setIsNew(false)
    setSelectedId(newId ?? null)
    flash(t('Karyawan ditambahkan.', 'Employee added.'))
  }

  const handleConfirmDelete = () => {
    if (!emp) return
    deleteEmployee(emp.id)
    setSelectedId(null)
    setConfirmDelete(false)
    flash(t('Karyawan dihapus.', 'Employee deleted.'))
  }

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

  // Contract expiry warning
  const contractDaysLeft = emp && emp.employmentType === 'Contract' && emp.endDate
    ? daysUntil(emp.endDate)
    : null
  const showContractWarning = contractDaysLeft !== null && contractDaysLeft <= 60

  // ── Search gate screen ─────────────────────────────────────────────
  if (searchMode) {
    return (
      <div className='min-h-[calc(100vh-8rem)] flex items-start justify-center pt-16'>
        <div className='w-full max-w-lg'>
          <div className='text-center mb-8'>
            <h1 className='text-2xl font-bold text-gray-800'>{t('Employee Data', 'Employee Data')}</h1>
            <p className='text-gray-500 text-sm mt-1'>{t('Tentukan parameter pencarian untuk melihat data karyawan.', 'Set search parameters to view employee data.')}</p>
          </div>

          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
            <h2 className='text-xs font-bold text-gray-500 uppercase tracking-wide mb-4'>🔍 {t('Parameter Pencarian', 'Search Parameters')}</h2>
            <div className='flex flex-col gap-4'>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Nama / NIK', 'Name / NIK')}</label>
                <input value={draftFilters.q} onChange={e => setDraftFilters(f => ({ ...f, q: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder={t('Kosongkan untuk tampilkan semua', 'Leave blank to show all')}
                  autoFocus
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400' />
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Status Karyawan', 'Employee Status')}</label>
                <div className='flex flex-wrap gap-2'>
                  {STATUS_OPTS.map(o => (
                    <button key={o.value} onClick={() => setDraftFilters(f => ({ ...f, status: o.value }))}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition
                        ${draftFilters.status === o.value ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}>
                      {o.value === 'Active' && '🟢 '}{o.value === 'Inactive' && '🔴 '}{o.value === 'Terminated' && '⛔ '}{o.value === 'Resigned' && '🚪 '}{o.value === '' && '📋 '}
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>Department</label>
                <select value={draftFilters.dept} onChange={e => setDraftFilters(f => ({ ...f, dept: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  <option value=''>{t('— Semua Department —', '— All Departments —')}</option>
                  {structure.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>{t('Tipe Kepegawaian', 'Employment Type')}</label>
                <select value={draftFilters.empType} onChange={e => setDraftFilters(f => ({ ...f, empType: e.target.value }))}
                  className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-400'>
                  <option value=''>{t('— Semua Tipe —', '— All Types —')}</option>
                  {EMP_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                </select>
              </div>
            </div>
            <div className='mt-6 flex gap-3'>
              <button onClick={handleSearch}
                className='flex-1 py-2.5 text-white text-sm font-bold rounded-xl hover:opacity-90 transition'
                style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                🔍 {t('Cari Karyawan', 'Search Employees')}
              </button>
              <button onClick={() => setDraftFilters({ q: '', status: 'Active', dept: '', empType: '' })}
                className='px-4 py-2.5 bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-200 transition'>
                {t('Reset', 'Reset')}
              </button>
            </div>
            <div className='mt-3'>
              <button onClick={() => { setSearchMode(false); handleNew() }}
                className='w-full py-2.5 text-sm font-bold rounded-xl border-2 border-red-300 text-red-700 hover:bg-red-50 transition'>
                + {t('Tambah Karyawan Baru', 'Add New Employee')}
              </button>
            </div>
          </div>

          <p className='text-center text-xs text-gray-400 mt-4'>
            {t('Total:', 'Total:')} <strong>{employees.length}</strong>
            {' · '}{t('Active:', 'Active:')} <strong>{employees.filter(e => e.status === 'Active').length}</strong>
            {' · '}{t('Inactive:', 'Inactive:')} <strong>{employees.filter(e => e.status !== 'Active').length}</strong>
          </p>
        </div>
      </div>
    )
  }

  const activeStatusLabel = STATUS_OPTS.find(o => o.value === activeFilters.status)?.label ?? 'All Status'

  // ── Main layout (master-detail) ────────────────────────────────
  return (
    <div className='flex flex-col gap-3 h-[calc(100vh-5rem)]'>

<<<<<<< HEAD
      {/* Filter bar */}
      <div className='flex items-center gap-3 bg-white rounded-xl shadow-sm px-4 py-2.5 flex-shrink-0'>
=======
      {/* ── Filter summary bar ── */}
      <div className='flex items-center gap-3 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 px-4 py-2.5 flex-shrink-0'>
>>>>>>> worktree-agent-aca6c81ffb81b6db2
        <div className='flex items-center gap-2 flex-wrap flex-1 min-w-0'>
          <span className='text-xs font-semibold text-gray-500'>{t('Filter:', 'Filter:')}</span>
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
          {activeFilters.empType && <span className='text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium'>{activeFilters.empType}</span>}
          {activeFilters.q && <span className='text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full font-medium'>"{activeFilters.q}"</span>}
          <span className='text-xs text-gray-400 ml-1'>— {list.length} {t('karyawan', 'employees')}</span>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
<<<<<<< HEAD
          <button onClick={() => { setDraftFilters({ ...activeFilters }); setSearchMode(true) }}
            className='px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition'>
            🔍 {t('Ubah Filter', 'Change Filter')}
          </button>
          <button onClick={handleNew}
            className='px-3 py-1.5 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition'
            style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
=======
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
>>>>>>> worktree-agent-aca6c81ffb81b6db2
            + {t('Karyawan Baru', 'New Employee')}
          </ActionButton>
        </div>
      </div>

      {/* Master-detail layout */}
      <div className='flex gap-4 flex-1 min-h-0'>

<<<<<<< HEAD
        {/* LEFT: employee list — always visible */}
        <div className='w-64 flex-shrink-0 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden'>
          <div className='p-3 border-b border-gray-100'>
            <input value={inlineQ} onChange={e => setInlineQ(e.target.value)}
              placeholder={t('Cari nama / NIK…', 'Search name / NIK…')}
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-red-400' />
=======
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
>>>>>>> worktree-agent-aca6c81ffb81b6db2
          </div>
          <div className='flex-1 overflow-y-auto'>
            {list.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-32 text-gray-400 text-xs gap-1'>
                <span className='text-2xl'>🔍</span>
                <span>{t('Tidak ada karyawan', 'No employees found')}</span>
              </div>
<<<<<<< HEAD
            ) : list.map(e => (
              <button key={e.id} onClick={() => handleSelect(e.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition border-l-2 ${
                  selectedId === e.id && !isNew ? 'border-red-500 bg-red-50' : 'border-transparent hover:bg-gray-50'
                }`}>
                <Avatar emp={e} />
                <div className='min-w-0'>
                  <div className='text-xs font-semibold text-gray-800 truncate'>{e.name}</div>
                  <div className='text-xs text-gray-400'>{e.nik}</div>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${e.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {e.status}
=======

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
>>>>>>> worktree-agent-aca6c81ffb81b6db2
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className='p-3 border-t border-gray-100'>
            <button onClick={handleNew}
              className='w-full py-2 text-white text-xs font-semibold rounded-lg hover:opacity-90'
              style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
              + {t('Karyawan Baru', 'New Employee')}
            </button>
          </div>
        </div>

        {/* RIGHT: detail panel */}
        <div className='flex-1 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden min-w-0 min-h-0'>
          {(!emp && !isNew) ? (
            <div className='flex-1 flex flex-col items-center justify-center text-gray-400 gap-2'>
              <span className='text-5xl'>👤</span>
              <span className='text-sm'>{t('Pilih karyawan dari daftar', 'Select an employee from the list')}</span>
            </div>
          ) : (
            <>
              {/* Contract expiry warning */}
              {showContractWarning && (
                <div className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold ${contractDaysLeft < 0 ? 'bg-red-600 text-white' : contractDaysLeft <= 14 ? 'bg-red-100 text-red-700' : 'bg-yellow-50 text-yellow-800'}`}>
                  ⚠️ {contractDaysLeft < 0
                    ? t(`Kontrak telah berakhir ${Math.abs(contractDaysLeft)} hari lalu.`, `Contract expired ${Math.abs(contractDaysLeft)} days ago.`)
                    : t(`Kontrak berakhir dalam ${contractDaysLeft} hari (${emp?.endDate}).`, `Contract expires in ${contractDaysLeft} days (${emp?.endDate}).`)}
                </div>
              )}

              {/* Inline delete confirmation */}
              {confirmDelete && emp && (
                <div className='flex items-center gap-3 px-5 py-2.5 bg-red-50 border-b border-red-200'>
                  <span className='text-xs text-red-700 font-semibold flex-1'>
                    {t(`Hapus ${emp.name}? Tindakan ini tidak dapat dibatalkan.`, `Delete ${emp.name}? This action cannot be undone.`)}
                  </span>
                  <button onClick={handleConfirmDelete}
                    className='px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition'>
                    {t('Ya, Hapus', 'Yes, Delete')}
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    className='px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition'>
                    {t('Batal', 'Cancel')}
                  </button>
                </div>
              )}

              {/* Profile header */}
              <div className='flex items-start gap-5 p-6 border-b border-gray-100'>
                <div className='relative flex-shrink-0'>
                  <div className='w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200'>
                    {isNew
                      ? (form.photo
                          ? <img src={form.photo} className='w-full h-full object-cover' alt='' />
                          : <span className='text-3xl'>{form.gender === 'Female' ? '👩' : '👨'}</span>)
                      : (emp?.photo
                          ? <img src={emp.photo} className='w-full h-full object-cover' alt='' />
                          : <span className='text-3xl'>{emp?.gender === 'Female' ? '👩' : '👨'}</span>)
                    }
                  </div>
                  <button onClick={() => fileRef.current.click()}
                    className='absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full text-white flex items-center justify-center text-xs hover:bg-red-700 shadow'>
                    📷
                  </button>
                  <input ref={fileRef} type='file' accept='image/*' className='hidden' onChange={handlePhoto} />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='text-lg font-bold text-gray-800'>{isNew ? t('Karyawan Baru', 'New Employee') : emp.name}</div>
                  {!isNew && (
                    <>
                      <div className='text-sm text-gray-500 mt-0.5'>
                        {structure.positions.find(p => p.id === emp.positionId)?.name || '—'}
                        {' · '}
                        {structure.departments.find(d => d.id === emp.departmentId)?.name || '—'}
                      </div>
                      {emp.managerId && (() => {
                        const mgr = employees.find(e => e.id === emp.managerId)
                        return mgr ? (
                          <div className='text-xs text-gray-400 mt-0.5'>
                            {t('Reports to:', 'Reports to:')}{' '}
                            <button onClick={() => handleSelect(mgr.id)}
                              className='font-semibold text-gray-600 hover:text-red-600 hover:underline transition'>
                              {mgr.name}
                            </button>
                          </div>
                        ) : null
                      })()}
                      <div className='flex items-center gap-2 mt-2 flex-wrap'>
                        <span className='font-mono text-xs bg-gray-100 px-2 py-0.5 rounded'>{emp.nik}</span>
                        {structure.companies.find(c => c.id === emp.companyId)?.companyCode && (
                          <span className='font-mono font-bold text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded tracking-widest'>
                            {structure.companies.find(c => c.id === emp.companyId).companyCode}
                          </span>
                        )}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {emp.status}
                        </span>
                        {emp.joinDate && (
                          <span className='text-xs text-gray-400' title={emp.joinDate}>
                            🗓 {tenure(emp.joinDate)} {t('masa kerja', 'tenure')}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

<<<<<<< HEAD
                <div className='flex gap-2 flex-shrink-0'>
                  {isNew ? (
                    <>
                      <button onClick={() => { setIsNew(false); setSelectedId(null) }}
                        className='px-4 py-2 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-200'>
                        {t('Batal', 'Cancel')}
                      </button>
                      <button onClick={handleSaveNew}
                        className='px-4 py-2 text-white text-xs font-semibold rounded-lg hover:opacity-90'
                        style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                        {t('Simpan', 'Save')}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => router.push(`/hr/org-chart?focus=${emp.id}`)}
                        className='px-4 py-2 bg-green-50 text-green-700 text-xs font-semibold rounded-lg hover:bg-green-100 transition flex items-center gap-1.5'>
                        🌳 <span>Org Chart</span>
                      </button>
                      <button onClick={() => setConfirmDelete(true)}
                        className='px-4 py-2 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition'>
                        🗑️ {t('Hapus', 'Delete')}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Tabs */}
              {!isNew && (
                <div className='flex border-b border-gray-100 px-6'>
                  {TABS.map(tabName => (
                    <button key={tabName} onClick={() => setTab(tabName)}
                      className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
                        tab === tabName ? 'border-red-500 text-red-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}>
                      {tabName}
                    </button>
                  ))}
                </div>
              )}

              {/* Flash message */}
              {msg && (
                <div className={`mx-6 mt-3 px-4 py-2 rounded-lg text-xs ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                  {msg.text}
                </div>
              )}

              {/* Tab content */}
              <div className='flex-1 overflow-y-auto p-6'>
                {isNew ? (
                  <NewEmployeeForm form={form} setForm={setForm} S={structure} />
                ) : tab === 'Employment' ? (
                  <TabEmployment
                    emp={emp} S={structure} update={updateEmployee}
                    grade={id => structure.grades.find(g => g.id === +id)}
                    flash={flash}
                    addHistory={addHistory} updateHistory={updateHistory} deleteHistory={deleteHistory}
                    allEmployees={employees} onSelectEmployee={handleSelect}
                  />
                ) : tab === 'Bio' ? (
                  <TabBio emp={emp} update={updateEmployee} flash={flash} />
                ) : tab === 'Dependent' ? (
                  <TabDependent emp={emp} add={addDependent} upd={updateDependent} del={deleteDependent} flash={flash} />
                ) : (
                  <TabProfile
                    emp={emp}
                    addEdu={addEducation}      updateEdu={updateEducation}      delEdu={deleteEducation}
                    addCert={addCertification} updateCert={updateCertification} delCert={deleteCertification}
                    addSkill={addSkill}        updateSkill={updateSkill}        delSkill={deleteSkill}
                    flash={flash}
                  />
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
=======
function Section({ title, children }) {
  return (
    <section className='rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100'>
      <h3 className='mb-4 text-xs font-bold uppercase tracking-wide text-gray-500'>{title}</h3>
      {children}
    </section>
>>>>>>> worktree-agent-aca6c81ffb81b6db2
  )
}
