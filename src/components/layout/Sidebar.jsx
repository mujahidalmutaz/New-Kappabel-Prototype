'use client'
import { useState }         from 'react'
import Link                 from 'next/link'
import { usePathname }      from 'next/navigation'
import { useAuthStore }     from '@/store/authStore'
import { useEmployeeStore } from '@/store/employeeStore'
import SidebarSection       from './SidebarSection'
import SidebarSubModule     from './SidebarSubModule'

function NavItem({ icon, label, href }) {
  const pathname = usePathname()
  const active   = pathname === href

  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '9px',
        padding: '8px 14px 8px 28px',
        fontSize: '12.5px',
        fontWeight: 500,
        borderLeft: active ? '3px solid #F08C00' : '3px solid transparent',
        background: active ? 'rgba(240,140,0,.22)' : 'transparent',
        color: active ? '#fff' : '#9ca3af',
        textDecoration: 'none',
        transition: 'all .15s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background='rgba(255,255,255,.05)'; e.currentTarget.style.color='#fff' }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#9ca3af' }}}
    >
      <span style={{ width: '18px', textAlign: 'center', fontSize: '14px' }}>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

export default function Sidebar() {
  const { currentUser } = useAuthStore()
  const { employees }   = useEmployeeStore()
  const r      = currentUser?.role
  const canHR  = r === 'hr'      || r === 'superadmin'
  const canSA  = r === 'superadmin'
  const hasSubordinates = employees.some(e => e.managerId === currentUser?.id)
  const canMgr = r === 'manager' || r === 'superadmin' || hasSubordinates

  const [openSection,   setOpenSection  ] = useState(null)
  const [openSubModule, setOpenSubModule] = useState(null)

  const toggleSection = (key) => {
    setOpenSection(s => s === key ? null : key)
    setOpenSubModule(null)
  }
  const toggleSubModule = (key) => {
    setOpenSubModule(s => s === key ? null : key)
  }

  return (
    <aside
      className='fixed top-14 left-0 bottom-0 w-60 overflow-y-auto z-40'
      style={{ background: '#1C1400' }}
    >
      {/* Dashboard */}
      <div className='px-2 pt-3 pb-2'>
        <NavItem icon='🏠' label='Dashboard' href='/dashboard' />
      </div>

      {/* ESS */}
      <SidebarSection label='👤 Employee Self-Service'
        open={openSection === 'ess'} onToggle={() => toggleSection('ess')}>
        <NavItem icon='📝' label='Apply Leave'   href='/ess/apply-leave' />
        <NavItem icon='📊' label='Leave Balance' href='/ess/leave-balance' />
        <NavItem icon='🕐' label='Attendance'    href='/ess/attendance' />
        <NavItem icon='💰' label='Payslip'       href='/ess/payslip' />
        <NavItem icon='🎯' label='My Onboarding' href='/ess/onboarding' />

        {/* ESS Learning */}
        <SidebarSubModule label='📚 Learning'
          open={openSubModule === 'ess-learning'} onToggle={() => toggleSubModule('ess-learning')}>
          <NavItem icon='🏠' label='My Learning Dashboard'  href='/ess/learning/dashboard' />
          <NavItem icon='🔍' label='Course Catalog'          href='/ess/learning/catalog' />
          <NavItem icon='📖' label='My Courses'              href='/ess/learning/my-courses' />
          <NavItem icon='🛤️' label='Learning Path'           href='/ess/learning/learning-path' />
          <NavItem icon='📝' label='Assessments & Eval'      href='/ess/learning/assessments' />
          <NavItem icon='🏆' label='My Certificates'         href='/ess/learning/certificates' />
          <NavItem icon='📊' label='Learning Transcript'     href='/ess/learning/transcript' />
          <NavItem icon='🎯' label='Skill Gap'               href='/ess/learning/skill-gap' />
          <NavItem icon='🧩' label='Competency Profile'      href='/ess/learning/competency-profile' />
          <NavItem icon='📋' label='My IDP'                  href='/ess/learning/idp' />
          <NavItem icon='📅' label='Learning Calendar'       href='/ess/learning/calendar' />
          <NavItem icon='🏅' label='Achievements & Badge'    href='/ess/learning/achievements' />
          <NavItem icon='🏆' label='Leaderboard'             href='/ess/learning/leaderboard' />
          <NavItem icon='🌐' label='Community'               href='/ess/learning/community' />
          <NavItem icon='🎤' label='Sharing Session'         href='/ess/learning/sharing-session' />
          <NavItem icon='🌍' label='Req External Training'   href='/ess/learning/request-external' />
          <NavItem icon='📂' label='Record External'         href='/ess/learning/record-external' />
          <NavItem icon='🔔' label='Notifications'           href='/ess/learning/notifications' />
          <NavItem icon='👤' label='Learning Profile'        href='/ess/learning/profile' />
        </SidebarSubModule>
      </SidebarSection>

      {/* MSS */}
      {canMgr && (
        <SidebarSection label='👥 Manager Self-Service'
          open={openSection === 'mss'} onToggle={() => toggleSection('mss')}>
          <NavItem icon='📝' label='Apply Leave (My Team)' href='/mss/apply-leave-team' />
          <NavItem icon='✅' label='Approve Leave'         href='/mss/approve-leave' />
          <NavItem icon='🎯' label='Onboarding Tracker (My Team)' href='/mss/approve-onboarding' />
          <NavItem icon='💬' label='Form Feedback'              href='/mss/feedback' />
          <NavItem icon='🎉' label='Congratulation Message'    href='/mss/congratulation' />
          <NavItem icon='📋' label='Team Attendance'            href='/mss/team-attendance' />

          {/* MSS Personnel Action */}
          <SidebarSubModule label='🔄 Personnel Action'
            open={openSubModule === 'mss-pa'} onToggle={() => toggleSubModule('mss-pa')}>
            <NavItem icon='📊' label='Overview'               href='/mss/personnel-action' />
            <NavItem icon='⬆️' label='Promote'               href='/mss/personnel-action/promote' />
            <NavItem icon='↔️' label='Transfer'               href='/mss/personnel-action/transfer' />
            <NavItem icon='⬇️' label='Demote'                href='/mss/personnel-action/demote' />
            <NavItem icon='🏢' label='Transfer Across Co.'   href='/mss/personnel-action/transfer-across-company' />
            <NavItem icon='🚪' label='Terminate'              href='/mss/personnel-action/terminate' />
            <NavItem icon='🔄' label='Rehire'                 href='/mss/personnel-action/rehire' />
            <NavItem icon='📋' label='Change Emp. Type'      href='/mss/personnel-action/change-employment-type' />
            <NavItem icon='📅' label='Extend Contract'        href='/mss/personnel-action/extend-contract' />
          </SidebarSubModule>

          {/* MSS Learning */}
          <SidebarSubModule label='📚 Team Learning'
            open={openSubModule === 'mss-learning'} onToggle={() => toggleSubModule('mss-learning')}>
            <NavItem icon='📊' label='Team Learning Dashboard' href='/mss/learning/dashboard' />
            <NavItem icon='📌' label='Mandatory Monitoring'    href='/mss/learning/mandatory' />
            <NavItem icon='✅' label='Training Approval'       href='/mss/learning/approval' />
            <NavItem icon='📋' label='Team Assignment'         href='/mss/learning/assignment' />
            <NavItem icon='📈' label='Team Progress'           href='/mss/learning/progress' />
            <NavItem icon='🌐' label='Request External'        href='/mss/learning/request-external' />
            <NavItem icon='🧠' label='Behavior Evaluation'     href='/mss/learning/behavior-eval' />
            <NavItem icon='🧩' label='Team Competency'         href='/mss/learning/competency' />
            <NavItem icon='🔍' label='Gap Analysis'            href='/mss/learning/gap-analysis' />
            <NavItem icon='💡' label='Recommendation'          href='/mss/learning/recommendation' />
            <NavItem icon='🏆' label='Cert Approval'           href='/mss/learning/cert-approval' />
            <NavItem icon='📅' label='Team Calendar'           href='/mss/learning/calendar' />
            <NavItem icon='🏅' label='Team Leaderboard'        href='/mss/learning/leaderboard' />
            <NavItem icon='📊' label='Team Report'             href='/mss/learning/report' />
            <NavItem icon='🔔' label='Notifications'           href='/mss/learning/notifications' />
          </SidebarSubModule>
        </SidebarSection>
      )}

      {/* HR ADMIN */}
      {canHR && (
        <SidebarSection label='🗂️ HR Administration'
          open={openSection === 'hr'} onToggle={() => toggleSection('hr')}>
          <SidebarSubModule label='🎯 Onboarding'
            open={openSubModule === 'onboarding'} onToggle={() => toggleSubModule('onboarding')}>
            <NavItem icon='📋' label='Onboarding Tracker'          href='/hr/onboarding/tracker' />
            <NavItem icon='📄' label='Master Onboarding Tracker'   href='/hr/onboarding/master' />
            <NavItem icon='📊' label='Form Evaluation'             href='/hr/evaluation' />
            <NavItem icon='📋' label='Form Evaluation (Contract)'  href='/hr/evaluation-contract' />
          </SidebarSubModule>
          <SidebarSubModule label='🏢 Structure'
            open={openSubModule === 'structure'} onToggle={() => toggleSubModule('structure')}>
            <NavItem icon='🌐' label='Enterprise'    href='/hr/structure/enterprise' />
            <NavItem icon='🏛️' label='Division'      href='/hr/structure/division' />
            <NavItem icon='🏠' label='Company'       href='/hr/structure/company' />
            <NavItem icon='💼' label='Business Unit' href='/hr/structure/business-unit' />
            <NavItem icon='🗂️' label='Department'    href='/hr/structure/department' />
            <NavItem icon='🧩' label='Job Family'    href='/hr/structure/job-family' />
            <NavItem icon='📌' label='Position'         href='/hr/structure/position' />
            <NavItem icon='🎯' label='Position Profile' href='/hr/structure/position-profile' />
            <NavItem icon='🌳' label='Org Chart'        href='/hr/org-chart' />
            <NavItem icon='🌲' label='Org Tree'         href='/hr/org-tree' />
          </SidebarSubModule>
          <SidebarSubModule label='👤 Employee'
            open={openSubModule === 'employee'} onToggle={() => toggleSubModule('employee')}>
            <NavItem icon='📋' label='Employee Data'       href='/hr/employee' />
            <NavItem icon='📝' label='Apply Leave (HR)'    href='/hr/apply-leave' />
          </SidebarSubModule>
          <SidebarSubModule label='🔄 Personnel Action'
            open={openSubModule === 'personnel-action'} onToggle={() => toggleSubModule('personnel-action')}>
            <NavItem icon='📊' label='Overview'                  href='/hr/employee/personnel-action' />
            <NavItem icon='⬆️' label='Promote'                  href='/hr/employee/personnel-action/promote' />
            <NavItem icon='↔️' label='Transfer'                  href='/hr/employee/personnel-action/transfer' />
            <NavItem icon='⬇️' label='Demote'                   href='/hr/employee/personnel-action/demote' />
            <NavItem icon='🏢' label='Transfer Across Company'  href='/hr/employee/personnel-action/transfer-across-company' />
            <NavItem icon='🚪' label='Terminate'                 href='/hr/employee/personnel-action/terminate' />
            <NavItem icon='🔄' label='Rehire'                    href='/hr/employee/personnel-action/rehire' />
            <NavItem icon='📋' label='Change Employment Type'   href='/hr/employee/personnel-action/change-employment-type' />
            <NavItem icon='📅' label='Extend Contract'           href='/hr/employee/personnel-action/extend-contract' />
          </SidebarSubModule>
          <SidebarSubModule label='⏱️ Time & Labour'
            open={openSubModule === 'time-labour'} onToggle={() => toggleSubModule('time-labour')}>
            <NavItem icon='🕐' label='Shift Setting'        href='/hr/time-labour/shift-setting' />
            <NavItem icon='🔄' label='Shift Pattern'        href='/hr/time-labour/shift-pattern' />
            <NavItem icon='📆' label='Work Schedule'        href='/hr/time-labour/work-schedule' />
            <NavItem icon='🔗' label='Schedule Assignment'  href='/hr/time-labour/schedule-assignment' />
          </SidebarSubModule>
          <SidebarSubModule label='📅 Absence'
            open={openSubModule === 'absence'} onToggle={() => toggleSubModule('absence')}>
            <NavItem icon='📅' label='Holiday Calendar' href='/hr/absence/holiday-calendar' />
          </SidebarSubModule>
          <SidebarSubModule label='💰 Payroll'
            open={openSubModule === 'payroll'} onToggle={() => toggleSubModule('payroll')}>
            <NavItem icon='💼' label='Payroll Run' href='/hr/payroll/run' />
          </SidebarSubModule>

          {/* HR Learning — Resources */}
          <SidebarSubModule label='📦 Learning — Resources'
            open={openSubModule === 'hr-lrn-resources'} onToggle={() => toggleSubModule('hr-lrn-resources')}>
            <NavItem icon='🎬' label='Master Content'       href='/hr/learning/master-content' />
            <NavItem icon='👨‍🏫' label='Master Instructors'   href='/hr/learning/master-instructors' />
            <NavItem icon='🏛️' label='Master Classroom'      href='/hr/learning/master-classroom' />
            <NavItem icon='🤝' label='Training Suppliers'   href='/hr/learning/master-suppliers' />
          </SidebarSubModule>

          {/* HR Learning — Assessment */}
          <SidebarSubModule label='📝 Learning — Assessment'
            open={openSubModule === 'hr-lrn-assessment'} onToggle={() => toggleSubModule('hr-lrn-assessment')}>
            <NavItem icon='📋' label='Question Library'     href='/hr/learning/question-library' />
            <NavItem icon='📝' label='Master Assessment'    href='/hr/learning/master-assessment' />
            <NavItem icon='📊' label='Master Evaluation'    href='/hr/learning/evaluation' />
          </SidebarSubModule>

          {/* HR Learning — Certification */}
          <SidebarSubModule label='🏆 Learning — Certification'
            open={openSubModule === 'hr-lrn-cert'} onToggle={() => toggleSubModule('hr-lrn-cert')}>
            <NavItem icon='🏆' label='Master Certificate'   href='/hr/learning/certificate' />
            <NavItem icon='⭐' label='Master CPD / Points'  href='/hr/learning/cpd' />
          </SidebarSubModule>

          {/* HR Learning — Catalog */}
          <SidebarSubModule label='🎓 Learning — Catalog'
            open={openSubModule === 'hr-lrn-catalog'} onToggle={() => toggleSubModule('hr-lrn-catalog')}>
            <NavItem icon='🎓' label='Course'               href='/hr/learning/course' />
            <NavItem icon='📦' label='Course Batch'         href='/hr/learning/course-batch' />
            <NavItem icon='👥' label='Course Learners'      href='/hr/learning/course-learners' />
            <NavItem icon='🛤️' label='Specializations'      href='/hr/learning/specializations' />
            <NavItem icon='🌐' label='Communities'          href='/hr/learning/communities' />
          </SidebarSubModule>

          {/* HR Learning — Assignment */}
          <SidebarSubModule label='👥 Learning — Assignment'
            open={openSubModule === 'hr-lrn-assign'} onToggle={() => toggleSubModule('hr-lrn-assign')}>
            <NavItem icon='🎯' label='Master Cohort'        href='/hr/learning/cohort' />
            <NavItem icon='📈' label='Learners Tracker'     href='/hr/learning/learners-tracker' />
          </SidebarSubModule>

          {/* HR Learning — Competency */}
          <SidebarSubModule label='🧩 Learning — Competency'
            open={openSubModule === 'hr-lrn-comp'} onToggle={() => toggleSubModule('hr-lrn-comp')}>
            <NavItem icon='📊' label='Competency Matrix'     href='/hr/learning/competency-matrix' />
            <NavItem icon='🏅' label='Skill & Qualification' href='/hr/learning/skill-qualification' />
          </SidebarSubModule>

          {/* HR Learning — Config */}
          <SidebarSubModule label='⚙️ Learning — Config'
            open={openSubModule === 'hr-lrn-config'} onToggle={() => toggleSubModule('hr-lrn-config')}>
            <NavItem icon='📋' label='Learning Planning'    href='/hr/learning/planning' />
            <NavItem icon='📅' label='Learning Calendar'    href='/hr/learning/calendar' />
            <NavItem icon='📝' label='Questionnaires'       href='/hr/learning/questionnaires' />
            <NavItem icon='🔔' label='Notification Template' href='/hr/learning/notification-template' />
            <NavItem icon='🔀' label='Approval Workflow'    href='/hr/learning/approval-workflow' />
            <NavItem icon='🎮' label='Gamification Rules'   href='/hr/learning/gamification' />
          </SidebarSubModule>
        </SidebarSection>
      )}

      {/* SYSADMIN */}
      {canSA && (
        <SidebarSection label='⚙️ System Administration'
          open={openSection === 'sysadmin'} onToggle={() => toggleSection('sysadmin')}>
          <SidebarSubModule label='⚙️ Settings'
            open={openSubModule === 'settings'} onToggle={() => toggleSubModule('settings')}>
            <NavItem icon='👥' label='User Management' href='/sysadmin/users' />
            <NavItem icon='🔀' label='Leave Workflow'  href='/sysadmin/leave-workflow' />
          </SidebarSubModule>
          <SidebarSubModule label='🔀 Workflow'
            open={openSubModule === 'workflow'} onToggle={() => toggleSubModule('workflow')}>
            <NavItem icon='⚙️' label='Workflow Settings'    href='/sysadmin/workflow/settings' />
            <NavItem icon='👥' label='Userlists'             href='/sysadmin/workflow/userlists' />
            <NavItem icon='🗂️' label='Transaction Manager'  href='/sysadmin/workflow/transaction-manager' />
          </SidebarSubModule>
          <SidebarSubModule label='🎨 Branding'
            open={openSubModule === 'branding'} onToggle={() => toggleSubModule('branding')}>
            <NavItem icon='🖼️' label='Company Logo'  href='/sysadmin/branding/company-logo' />
            <NavItem icon='🎭' label='Login Theme'   href='/sysadmin/branding/login-theme' />
          </SidebarSubModule>
          <SidebarSubModule label='📚 Learning System'
            open={openSubModule === 'sysadmin-learning'} onToggle={() => toggleSubModule('sysadmin-learning')}>
            <NavItem icon='🔐' label='Role & Permission'    href='/sysadmin/learning/role-permission' />
          </SidebarSubModule>
        </SidebarSection>
      )}
    </aside>
  )
}
