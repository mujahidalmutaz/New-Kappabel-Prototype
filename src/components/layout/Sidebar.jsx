'use client'
import { useState, useEffect, useRef } from 'react'
import Link                             from 'next/link'
import { usePathname, useRouter }       from 'next/navigation'
import { useAuthStore }                 from '@/store/authStore'
import { useEmployeeStore }             from '@/store/employeeStore'

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IcHome    = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IcPerson  = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IcTeam    = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
const IcHR      = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
const IcSA      = () => <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M17.66 17.66l1.41 1.41"/></svg>
const IcPin     = ({ pinned }) => pinned
  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#8B1A1A" stroke="#8B1A1A" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>

// ─── Flyout nav item ──────────────────────────────────────────────────────────
function FlyItem({ label, href, onClick }) {
  const pathname = usePathname()
  const active   = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  return (
    <Link href={href} onClick={onClick}
      className={`flex items-center px-4 py-2 text-[13px] rounded-lg transition-colors ${
        active ? 'bg-red-50 text-red-800 font-semibold' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
      }`}>
      {label}
    </Link>
  )
}

// ─── Flyout group ─────────────────────────────────────────────────────────────
function FlyGroup({ title, items, onClose }) {
  const [open, setOpen] = useState(true)
  return (
    <div className='mb-2'>
      {title && (
        <button onClick={() => setOpen(o => !o)}
          className='w-full flex items-center justify-between px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition'>
          <span>{title}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      )}
      {open && items.map(it => <FlyItem key={it.href} label={it.label} href={it.href} onClick={onClose} />)}
    </div>
  )
}

// ─── Navigation data ──────────────────────────────────────────────────────────
const ESS_GROUPS = [
  { title: 'Personal', items: [
    { label: 'Apply Leave',          href: '/ess/apply-leave' },
    { label: 'Leave Balance',        href: '/ess/leave-balance' },
    { label: 'Attendance',           href: '/ess/attendance' },
    { label: 'Payslip',              href: '/ess/payslip' },
    { label: 'My Onboarding',        href: '/ess/onboarding' },
  ]},
  { title: 'Performance', items: [
    { label: 'Performance Check-In', href: '/ess/check-in' },
  ]},
  { title: 'Learning', items: [
    { label: 'My Learning Dashboard', href: '/ess/learning/dashboard' },
    { label: 'Course Catalog',         href: '/ess/learning/catalog' },
    { label: 'My Courses',             href: '/ess/learning/my-courses' },
    { label: 'Learning Path',          href: '/ess/learning/learning-path' },
    { label: 'Assessments & Eval',     href: '/ess/learning/assessments' },
    { label: 'My Certificates',        href: '/ess/learning/certificates' },
    { label: 'Learning Transcript',    href: '/ess/learning/transcript' },
    { label: 'Skill Gap',              href: '/ess/learning/skill-gap' },
    { label: 'Competency Profile',     href: '/ess/learning/competency-profile' },
    { label: 'My IDP',                 href: '/ess/learning/idp' },
    { label: 'Learning Calendar',      href: '/ess/learning/calendar' },
    { label: 'Achievements & Badge',   href: '/ess/learning/achievements' },
    { label: 'Leaderboard',            href: '/ess/learning/leaderboard' },
    { label: 'Community',              href: '/ess/learning/community' },
    { label: 'Sharing Session',        href: '/ess/learning/sharing-session' },
    { label: 'Req External Training',  href: '/ess/learning/request-external' },
    { label: 'Record External',        href: '/ess/learning/record-external' },
    { label: 'Notifications',          href: '/ess/learning/notifications' },
    { label: 'Learning Profile',       href: '/ess/learning/profile' },
  ]},
]

const MSS_GROUPS = [
  { title: 'Team', items: [
    { label: 'Team Attendance',          href: '/mss/team-attendance' },
    { label: 'Apply Leave (My Team)',    href: '/mss/apply-leave-team' },
    { label: 'Approve Leave',            href: '/mss/approve-leave' },
    { label: 'Team Performance Check-In',href: '/mss/check-in' },
    { label: 'Form Feedback',            href: '/mss/feedback' },
    { label: 'Congratulation Message',   href: '/mss/congratulation' },
    { label: 'Onboarding Tracker',       href: '/mss/approve-onboarding' },
  ]},
  { title: 'Personnel Action', items: [
    { label: 'Overview',                href: '/mss/personnel-action' },
    { label: 'Promote',                 href: '/mss/personnel-action/promote' },
    { label: 'Transfer',                href: '/mss/personnel-action/transfer' },
    { label: 'Demote',                  href: '/mss/personnel-action/demote' },
    { label: 'Transfer Across Company', href: '/mss/personnel-action/transfer-across-company' },
    { label: 'Terminate',               href: '/mss/personnel-action/terminate' },
    { label: 'Rehire',                  href: '/mss/personnel-action/rehire' },
    { label: 'Change Employment Type',  href: '/mss/personnel-action/change-employment-type' },
    { label: 'Extend Contract',         href: '/mss/personnel-action/extend-contract' },
  ]},
  { title: 'Team Learning', items: [
    { label: 'Team Learning Dashboard', href: '/mss/learning/dashboard' },
    { label: 'Mandatory Monitoring',    href: '/mss/learning/mandatory' },
    { label: 'Training Approval',       href: '/mss/learning/approval' },
    { label: 'Team Assignment',         href: '/mss/learning/assignment' },
    { label: 'Team Progress',           href: '/mss/learning/progress' },
    { label: 'Request External',        href: '/mss/learning/request-external' },
    { label: 'Behavior Evaluation',     href: '/mss/learning/behavior-eval' },
    { label: 'Team Competency',         href: '/mss/learning/competency' },
    { label: 'Gap Analysis',            href: '/mss/learning/gap-analysis' },
    { label: 'Recommendation',          href: '/mss/learning/recommendation' },
    { label: 'Cert Approval',           href: '/mss/learning/cert-approval' },
    { label: 'Team Calendar',           href: '/mss/learning/calendar' },
    { label: 'Team Leaderboard',        href: '/mss/learning/leaderboard' },
    { label: 'Team Report',             href: '/mss/learning/report' },
    { label: 'Notifications',           href: '/mss/learning/notifications' },
  ]},
]

const HR_GROUPS = [
  { title: 'Onboarding', items: [
    { label: 'Onboarding Tracker',         href: '/hr/onboarding/tracker' },
    { label: 'Master Onboarding',          href: '/hr/onboarding/master' },
    { label: 'Form Evaluation',            href: '/hr/evaluation' },
    { label: 'Form Evaluation (Contract)', href: '/hr/evaluation-contract' },
  ]},
  { title: 'Structure', items: [
    { label: 'Enterprise',    href: '/hr/structure/enterprise' },
    { label: 'Division',      href: '/hr/structure/division' },
    { label: 'Company',       href: '/hr/structure/company' },
    { label: 'Business Unit', href: '/hr/structure/business-unit' },
    { label: 'Department',    href: '/hr/structure/department' },
    { label: 'Job Family',    href: '/hr/structure/job-family' },
    { label: 'Position',      href: '/hr/structure/position' },
    { label: 'Position Profile', href: '/hr/structure/position-profile' },
    { label: 'Org Chart',     href: '/hr/org-chart' },
    { label: 'Org Tree',      href: '/hr/org-tree' },
  ]},
  { title: 'Employee', items: [
    { label: 'Employee Data',    href: '/hr/employee' },
    { label: 'Apply Leave (HR)', href: '/hr/apply-leave' },
  ]},
  { title: 'Personnel Action', items: [
    { label: 'Overview',                href: '/hr/employee/personnel-action' },
    { label: 'Promote',                 href: '/hr/employee/personnel-action/promote' },
    { label: 'Transfer',                href: '/hr/employee/personnel-action/transfer' },
    { label: 'Demote',                  href: '/hr/employee/personnel-action/demote' },
    { label: 'Transfer Across Company', href: '/hr/employee/personnel-action/transfer-across-company' },
    { label: 'Terminate',               href: '/hr/employee/personnel-action/terminate' },
    { label: 'Rehire',                  href: '/hr/employee/personnel-action/rehire' },
    { label: 'Change Employment Type',  href: '/hr/employee/personnel-action/change-employment-type' },
    { label: 'Extend Contract',         href: '/hr/employee/personnel-action/extend-contract' },
  ]},
  { title: 'Time & Labour', items: [
    { label: 'Shift Setting',       href: '/hr/time-labour/shift-setting' },
    { label: 'Shift Pattern',       href: '/hr/time-labour/shift-pattern' },
    { label: 'Work Schedule',       href: '/hr/time-labour/work-schedule' },
    { label: 'Schedule Assignment', href: '/hr/time-labour/schedule-assignment' },
  ]},
  { title: 'Absence', items: [
    { label: 'Holiday Calendar', href: '/hr/absence/holiday-calendar' },
  ]},
  { title: 'Payroll', items: [
    { label: 'Payroll Run', href: '/hr/payroll/run' },
  ]},
  { title: 'Learning — Resources', items: [
    { label: 'Master Content',       href: '/hr/learning/master-content' },
    { label: 'Master Instructors',   href: '/hr/learning/master-instructors' },
    { label: 'Master Classroom',     href: '/hr/learning/master-classroom' },
    { label: 'Training Suppliers',   href: '/hr/learning/master-suppliers' },
  ]},
  { title: 'Learning — Assessment', items: [
    { label: 'Question Library',  href: '/hr/learning/question-library' },
    { label: 'Master Assessment', href: '/hr/learning/master-assessment' },
    { label: 'Master Evaluation', href: '/hr/learning/evaluation' },
  ]},
  { title: 'Learning — Certification', items: [
    { label: 'Master Certificate', href: '/hr/learning/certificate' },
  ]},
  { title: 'Learning — Catalog', items: [
    { label: 'Course',          href: '/hr/learning/course' },
    { label: 'Course Batch',    href: '/hr/learning/course-batch' },
    { label: 'Course Learners', href: '/hr/learning/course-learners' },
    { label: 'Specializations', href: '/hr/learning/specializations' },
    { label: 'Communities',     href: '/hr/learning/communities' },
  ]},
  { title: 'Learning — Assignment', items: [
    { label: 'Master Cohort',    href: '/hr/learning/cohort' },
    { label: 'Learners Tracker', href: '/hr/learning/learners-tracker' },
  ]},
  { title: 'Learning — Competency', items: [
    { label: 'Competency Matrix',    href: '/hr/learning/competency-matrix' },
    { label: 'Skill & Qualification',href: '/hr/learning/skill-qualification' },
  ]},
  { title: 'Learning — Config', items: [
    { label: 'Learning Planning',     href: '/hr/learning/planning' },
    { label: 'Learning Calendar',     href: '/hr/learning/calendar' },
    { label: 'Questionnaires',        href: '/hr/learning/questionnaires' },
    { label: 'Notification Template', href: '/hr/learning/notification-template' },
    { label: 'Approval Workflow',     href: '/hr/learning/approval-workflow' },
    { label: 'Gamification Rules',    href: '/hr/learning/gamification' },
  ]},
]

const SA_GROUPS = [
  { title: 'Settings', items: [
    { label: 'User Management', href: '/sysadmin/users' },
    { label: 'Leave Workflow',  href: '/sysadmin/leave-workflow' },
  ]},
  { title: 'Workflow', items: [
    { label: 'Workflow Settings',   href: '/sysadmin/workflow/settings' },
    { label: 'Userlists',           href: '/sysadmin/workflow/userlists' },
    { label: 'Transaction Manager', href: '/sysadmin/workflow/transaction-manager' },
  ]},
  { title: 'Branding', items: [
    { label: 'Company Logo', href: '/sysadmin/branding/company-logo' },
    { label: 'Login Theme',  href: '/sysadmin/branding/login-theme' },
  ]},
]

// ─── Main Sidebar ──────────────────────────────────────────────────────────────
export default function Sidebar() {
  const { currentUser }  = useAuthStore()
  const { employees }    = useEmployeeStore()
  const pathname         = usePathname()
  const router           = useRouter()
  const flyoutRef        = useRef()

  const r   = currentUser?.role
  const canHR  = r === 'hr' || r === 'superadmin'
  const canSA  = r === 'superadmin'
  const canMgr = r === 'manager' || r === 'superadmin' || employees.some(e => e.managerId === currentUser?.id)

  const [openId, setOpenId] = useState(null)
  const [pinned, setPinned] = useState(false)

  // Auto-open correct flyout from URL
  useEffect(() => {
    if (pathname.startsWith('/ess'))      { setOpenId('ess');      return }
    if (pathname.startsWith('/mss'))      { setOpenId('mss');      return }
    if (pathname.startsWith('/hr'))       { setOpenId('hr');       return }
    if (pathname.startsWith('/sysadmin')) { setOpenId('sysadmin'); return }
  }, [pathname])

  // Click outside to close (when not pinned)
  useEffect(() => {
    if (!openId || pinned) return
    const handler = (e) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) setOpenId(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openId, pinned])

  const sections = [
    { id: 'dashboard', icon: IcHome,   label: 'Dashboard',     href: '/dashboard', groups: null },
    { id: 'ess',       icon: IcPerson, label: 'Employee (ESS)', href: null, groups: ESS_GROUPS },
    canMgr && { id: 'mss', icon: IcTeam,   label: 'Manager (MSS)',  href: null, groups: MSS_GROUPS },
    canHR  && { id: 'hr',  icon: IcHR,     label: 'HR Administration', href: null, groups: HR_GROUPS },
    canSA  && { id: 'sysadmin', icon: IcSA, label: 'System Admin',  href: null, groups: SA_GROUPS },
  ].filter(Boolean)

  const activeSec = sections.find(s => s.id === openId)

  const handleIconClick = (sec) => {
    if (sec.href) {
      router.push(sec.href)
      setOpenId(null)
    } else {
      setOpenId(p => p === sec.id ? (pinned ? p : null) : sec.id)
    }
  }

  const isIconActive = (sec) => {
    if (sec.id === 'dashboard') return pathname === '/dashboard'
    return pathname.startsWith('/' + sec.id)
  }

  const closeFlyout = () => { if (!pinned) setOpenId(null) }

  return (
    <>
      {/* ── Icon strip ──────────────────────────────────────────────────────── */}
      <aside className='fixed top-[60px] left-0 bottom-0 w-14 z-40 flex flex-col items-center pt-2 gap-1'
        style={{ background: '#fff', borderRight: '1px solid #e5e7eb' }}>
        {sections.map(sec => {
          const active = isIconActive(sec)
          const flyOpen = openId === sec.id
          return (
            <button key={sec.id} title={sec.label}
              onClick={() => handleIconClick(sec)}
              className='relative w-10 h-10 rounded-xl flex items-center justify-center transition-all'
              style={{
                background: active || flyOpen ? '#8B1A1A' : 'transparent',
                color:      active || flyOpen ? '#fff'    : '#6b7280',
              }}
              onMouseEnter={e => { if (!active && !flyOpen) { e.currentTarget.style.background='#f3f4f6'; e.currentTarget.style.color='#1f2937' }}}
              onMouseLeave={e => { if (!active && !flyOpen) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6b7280' }}}>
              <sec.icon />
              {/* dot indicator if flyout open but not active path */}
              {flyOpen && !active && (
                <span className='absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500' />
              )}
            </button>
          )
        })}
      </aside>

      {/* ── Flyout panel ────────────────────────────────────────────────────── */}
      {openId && openId !== 'dashboard' && activeSec && (
        <div ref={flyoutRef}
          className='fixed top-[60px] left-14 bottom-0 z-30 overflow-y-auto'
          style={{ width: 260, background: '#fff', borderRight: '1px solid #e5e7eb', boxShadow: '4px 0 16px rgba(0,0,0,0.08)' }}>

          {/* Panel header */}
          <div className='sticky top-0 bg-white z-10 flex items-center justify-between px-4 py-3'
            style={{ borderBottom: '1px solid #f3f4f6' }}>
            <span className='font-bold text-gray-800 text-sm'>{activeSec.label}</span>
            <button onClick={() => setPinned(p => !p)} title={pinned ? 'Unpin' : 'Pin panel'} className='hover:opacity-70 transition'>
              <IcPin pinned={pinned} />
            </button>
          </div>

          {/* Nav items */}
          <div className='py-3 px-1'>
            {activeSec.groups?.map((g, i) => (
              <FlyGroup key={i} title={g.title} items={g.items} onClose={closeFlyout} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}
