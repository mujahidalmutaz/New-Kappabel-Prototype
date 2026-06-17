'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useEmployeeStore }  from '@/store/employeeStore'
import { useStructureStore } from '@/store/structureStore'

// ─── Static page index ────────────────────────────────────────────────────────
const PAGES = [
  // Dashboard
  { label: 'Dashboard',              href: '/dashboard',                          icon: '🏠', section: 'Dashboard' },
  // ESS
  { label: 'Apply Leave',            href: '/ess/apply-leave',                    icon: '📝', section: 'Employee Self-Service' },
  { label: 'Leave Balance',          href: '/ess/leave-balance',                  icon: '📊', section: 'Employee Self-Service' },
  { label: 'Attendance',             href: '/ess/attendance',                     icon: '🕐', section: 'Employee Self-Service' },
  { label: 'Payslip',                href: '/ess/payslip',                        icon: '💰', section: 'Employee Self-Service' },
  // MSS
  { label: 'Apply Leave (My Team)',   href: '/mss/apply-leave-team',               icon: '📝', section: 'Manager Self-Service' },
  { label: 'Approve Leave',          href: '/mss/approve-leave',                  icon: '✅', section: 'Manager Self-Service' },
  { label: 'Team Attendance',        href: '/mss/team-attendance',                icon: '📋', section: 'Manager Self-Service' },
  // HR - Employee
  { label: 'Employee Data',          href: '/hr/employee',                        icon: '📋', section: 'HR Administration' },
  { label: 'Apply Leave (HR)',       href: '/hr/apply-leave',                     icon: '📝', section: 'HR Administration' },
  { label: 'Org Chart',             href: '/hr/org-chart',                       icon: '🌳', section: 'HR Administration' },
  // HR - Structure
  { label: 'Enterprise',             href: '/hr/structure/enterprise',            icon: '🌐', section: 'HR · Structure' },
  { label: 'Division',               href: '/hr/structure/division',              icon: '🏛️', section: 'HR · Structure' },
  { label: 'Company',                href: '/hr/structure/company',               icon: '🏠', section: 'HR · Structure' },
  { label: 'Business Unit',          href: '/hr/structure/business-unit',         icon: '💼', section: 'HR · Structure' },
  { label: 'Department',             href: '/hr/structure/department',            icon: '🗂️', section: 'HR · Structure' },
  { label: 'Job Family',             href: '/hr/structure/job-family',            icon: '🧩', section: 'HR · Structure' },
  { label: 'Position',               href: '/hr/structure/position',              icon: '📌', section: 'HR · Structure' },
  // HR - Time & Labour
  { label: 'Shift Setting',          href: '/hr/time-labour/shift-setting',       icon: '🕐', section: 'HR · Time & Labour' },
  { label: 'Shift Pattern',          href: '/hr/time-labour/shift-pattern',       icon: '🔄', section: 'HR · Time & Labour' },
  { label: 'Work Schedule',          href: '/hr/time-labour/work-schedule',       icon: '📆', section: 'HR · Time & Labour' },
  { label: 'Schedule Assignment',    href: '/hr/time-labour/schedule-assignment', icon: '🔗', section: 'HR · Time & Labour' },
  // HR - Absence
  { label: 'Holiday Calendar',       href: '/hr/absence/holiday-calendar',        icon: '📅', section: 'HR · Absence' },
  // HR - Payroll
  { label: 'Payroll Run',            href: '/hr/payroll/run',                     icon: '💼', section: 'HR · Payroll' },
  // Sysadmin
  { label: 'User Management',        href: '/sysadmin/users',                     icon: '👥', section: 'System Administration' },
  { label: 'Leave Workflow',         href: '/sysadmin/leave-workflow',            icon: '🔀', section: 'System Administration' },
]

export default function GlobalSearch() {
  const router    = useRouter()
  const { employees } = useEmployeeStore()
  const { positions, departments, companies } = useStructureStore()

  const posName     = (id) => positions.find(p  => p.id  === +id)?.name       || ''
  const deptName    = (id) => departments.find(d => d.id  === +id)?.name       || ''
  const companyCode = (id) => companies.find(c  => c.id  === +id)?.companyCode || ''

  const [query,   setQuery  ] = useState('')
  const [open,    setOpen   ] = useState(false)
  const [cursor,  setCursor ] = useState(-1)
  const inputRef  = useRef()
  const boxRef    = useRef()

  // ── compute results ────────────────────────────────────────────
  const q = query.trim().toLowerCase()

  const matchedPages = q.length < 1 ? [] : PAGES.filter(p =>
    p.label.toLowerCase().includes(q) ||
    p.section.toLowerCase().includes(q)
  ).slice(0, 6)

  const matchedEmps = q.length < 1 ? [] : employees.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.nik.toLowerCase().includes(q)
  ).slice(0, 5)

  const totalResults = matchedPages.length + matchedEmps.length

  // flat list for keyboard nav
  const flatResults = [
    ...matchedEmps.map(e => ({ type: 'employee', ...e })),
    ...matchedPages.map(p => ({ type: 'page',     ...p })),
  ]

  // ── keyboard shortcut: Ctrl+K / Cmd+K ─────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (e.key === 'Escape') { setOpen(false); setQuery('') }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // ── close on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── keyboard nav ───────────────────────────────────────────────
  const handleKey = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, flatResults.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
    if (e.key === 'Enter' && cursor >= 0) {
      e.preventDefault(); navigate(flatResults[cursor])
    }
  }

  const navigate = (item) => {
    setOpen(false); setQuery(''); setCursor(-1)
    if (item.type === 'employee') router.push(`/hr/employee?id=${item.id}`)
    else                          router.push(item.href)
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    setOpen(true)
    setCursor(-1)
  }

  // ── render ─────────────────────────────────────────────────────
  return (
    <div ref={boxRef} className='relative w-72'>
      {/* Input */}
      <div className='flex items-center gap-2 bg-white/15 border border-white/25 rounded-lg px-3 py-1.5 hover:bg-white/20 transition'>
        <span className='text-white/70 text-sm'>🔍</span>
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => { if (query) setOpen(true) }}
          onKeyDown={handleKey}
          placeholder='Cari karyawan, halaman… (Ctrl+K)'
          className='flex-1 bg-transparent text-white text-xs placeholder-white/50 outline-none'
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); setCursor(-1) }}
            className='text-white/50 hover:text-white text-xs'>✕</button>
        )}
        {!query && (
          <kbd className='text-white/30 text-xs bg-white/10 px-1.5 py-0.5 rounded font-mono'>⌘K</kbd>
        )}
      </div>

      {/* Dropdown */}
      {open && q.length > 0 && (
        <div className='absolute top-full mt-2 left-0 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[999]'>

          {totalResults === 0 && (
            <div className='px-5 py-6 text-center text-gray-400 text-sm'>
              Tidak ada hasil untuk <span className='font-semibold text-gray-600'>"{query}"</span>
            </div>
          )}

          {/* ── Employees ── */}
          {matchedEmps.length > 0 && (
            <div>
              <div className='px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide'>
                👤 Karyawan
              </div>
              {matchedEmps.map((e, i) => {
                const idx = i
                return (
                  <button key={e.id} onClick={() => navigate({ type:'employee', ...e })}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${cursor===idx ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 text-sm'>
                      {e.photo
                        ? <img src={e.photo} className='w-full h-full object-cover' />
                        : (e.gender === 'Female' ? '👩' : '👨')
                      }
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold text-gray-800'>
                          <Highlight text={e.name} q={q} />
                        </span>
                        {companyCode(e.companyId) && (
                          <span className='font-mono font-bold text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded tracking-widest flex-shrink-0'>
                            {companyCode(e.companyId)}
                          </span>
                        )}
                      </div>
                      <div className='text-xs text-gray-400'>
                        <Highlight text={e.nik} q={q} />
                        {posName(e.positionId)    && <> · <span className='text-gray-600'>{posName(e.positionId)}</span></>}
                        {deptName(e.departmentId) && <> · {deptName(e.departmentId)}</>}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${e.status==='Active'?'bg-green-100 text-green-600':'bg-red-100 text-red-500'}`}>
                      {e.employmentType || 'Permanent'}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* ── Pages ── */}
          {matchedPages.length > 0 && (
            <div className={matchedEmps.length > 0 ? 'border-t border-gray-100' : ''}>
              <div className='px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide'>
                📄 Halaman
              </div>
              {matchedPages.map((p, i) => {
                const idx = matchedEmps.length + i
                return (
                  <button key={p.href} onClick={() => navigate({ type:'page', ...p })}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${cursor===idx ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                    <span className='text-base flex-shrink-0 w-6 text-center'>{p.icon}</span>
                    <div className='flex-1 min-w-0'>
                      <div className='text-sm font-semibold text-gray-800'>
                        <Highlight text={p.label} q={q} />
                      </div>
                      <div className='text-xs text-gray-400'>{p.section}</div>
                    </div>
                    <span className='text-gray-300 text-xs flex-shrink-0'>→</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* footer */}
          {totalResults > 0 && (
            <div className='px-4 py-2 border-t border-gray-100 flex gap-3 text-xs text-gray-400'>
              <span>↑↓ navigasi</span>
              <span>↵ buka</span>
              <span>Esc tutup</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Highlight matching text
function Highlight({ text, q }) {
  if (!q || !text) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className='bg-yellow-100 text-yellow-800 rounded px-0.5'>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  )
}
