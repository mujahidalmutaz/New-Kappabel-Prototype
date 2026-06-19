'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore }     from '@/store/authStore'
import Sidebar              from '@/components/layout/Sidebar'
import GlobalSearch         from '@/components/layout/GlobalSearch'
import NotificationBell     from '@/components/layout/NotificationBell'
import LoginAsModal         from '@/components/layout/LoginAsModal'
import { useBrandingStore } from '@/store/brandingStore'
import { useLanguageStore } from '@/store/languageStore'

export default function ProtectedLayout({ children }) {
  const { currentUser, realUser, logout, endProxy, _hydrated } = useAuthStore()
  const { topbarLogo }   = useBrandingStore()
  const { lang, setLang } = useLanguageStore()
  const router = useRouter()

  const [loginAsOpen, setLoginAsOpen] = useState(false)

  const isProxy    = !!realUser
  const canProxy   = !isProxy && (realUser?.role === 'hr' || realUser?.role === 'superadmin' ||
                     currentUser?.role === 'hr' || currentUser?.role === 'superadmin')

  useEffect(() => {
    if (_hydrated && !currentUser) router.push('/login')
  }, [_hydrated, currentUser, router])

  if (!_hydrated) return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='w-10 h-10 rounded-xl animate-pulse' style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }} />
    </div>
  )

  if (!currentUser) return null

  const handleLogout = () => {
    logout()
    document.cookie = 'hcm-auth=; path=/; max-age=0'
    router.push('/login')
  }

  const handleEndProxy = () => {
    endProxy()
    window.location.href = '/dashboard'
  }

  const roleLabel = (r) =>
    ({ employee: 'Employee', manager: 'Manager', hr: 'HR', superadmin: 'Superadmin' }[r] || r)

  const initials = (currentUser?.name || '?').trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const realInitials = (realUser?.name || '?').trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  const proxyBarHeight = isProxy ? 36 : 0
  const topbarHeight   = 60

  return (
    <div className='flex flex-col min-h-screen bg-gray-100'>

      {/* ── Proxy banner ──────────────────────────────────────────────────────── */}
      {isProxy && (
        <div className='fixed top-0 left-0 right-0 z-[60] flex items-center justify-between px-4'
          style={{ height: proxyBarHeight, background: 'linear-gradient(90deg,#92400e,#d97706)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <div className='flex items-center gap-2 text-white'>
            <span className='text-sm'>🔁</span>
            <span className='text-xs font-semibold'>Login as:</span>
            <div className='flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-0.5'>
              <div className='w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[9px] font-bold text-white'>{initials}</div>
              <span className='text-xs font-bold text-white'>{currentUser.name}</span>
              <span className='text-[10px] text-amber-200'>({roleLabel(currentUser.role)})</span>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <span className='text-[11px] text-amber-200 hidden sm:block'>
              Sesi asli: <span className='font-semibold text-white'>{realUser?.name}</span>
            </span>
            <button onClick={handleEndProxy}
              className='flex items-center gap-1.5 bg-white text-amber-800 text-xs font-bold px-3 py-1 rounded-full hover:bg-amber-50 transition'>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Kembali ke {realUser?.name}
            </button>
          </div>
        </div>
      )}

      {/* ── Topbar ────────────────────────────────────────────────────────────── */}
      <header className='fixed left-0 right-0 z-50 bg-white'
        style={{ top: proxyBarHeight, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        {/* Gradient accent strip */}
        <div className='h-[3px]' style={{ background: 'linear-gradient(90deg,#8B1A1A 0%,#D7252B 40%,#f4a97a 80%,#f9d276 100%)' }} />

        {/* Main bar */}
        <div className='h-[57px] flex items-center justify-between pl-1 pr-5 gap-3'>

          {/* Left: logo */}
          <div className='flex items-center justify-center flex-shrink-0' style={{ width: 56 }}>
            {topbarLogo ? (
              <img src={topbarLogo} alt='Logo' className='h-8 w-8 object-contain' />
            ) : (
              <div className='w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0'
                style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                  <path d="M4 2.5h3v5.8l4.6-5.8h3.8L10 10l5.4 7.5h-3.8L7 11.7V17.5H4V2.5z" fill="white"/>
                </svg>
              </div>
            )}
          </div>

          {/* App name */}
          <div className='hidden lg:flex items-baseline gap-1.5 flex-shrink-0'>
            <span className='font-bold text-gray-800 text-[15px] tracking-tight'>Kappabel</span>
            <span className='text-[9px] font-semibold border border-gray-300 rounded px-1 py-0.5 text-gray-400 leading-none'>Prototype</span>
          </div>

          {/* Search */}
          <div className='flex-1 flex justify-center px-4'>
            <GlobalSearch />
          </div>

          {/* Right controls */}
          <div className='flex items-center gap-3 flex-shrink-0'>
            {/* Language */}
            <div className='flex items-center gap-0.5 rounded-lg p-0.5'>
              <button onClick={() => setLang('id')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition ${lang === 'id' ? 'bg-red-50 text-red-800' : 'text-gray-500 hover:text-gray-700'}`}>
                ID
              </button>
              <button onClick={() => setLang('en')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md transition ${lang === 'en' ? 'bg-red-50 text-red-800' : 'text-gray-500 hover:text-gray-700'}`}>
                EN
              </button>
            </div>

            {/* Notification bell */}
            <NotificationBell />

            {/* Login As button — visible to HR / Superadmin when NOT in proxy */}
            {canProxy && (
              <button onClick={() => setLoginAsOpen(true)}
                title='Login As'
                className='flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition'>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
                <span className='hidden md:inline'>Login as</span>
              </button>
            )}

            {/* User avatar + name */}
            <div className='flex items-center gap-2.5'>
              <div className='relative'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white flex-shrink-0'
                  style={{ background: isProxy ? 'linear-gradient(135deg,#92400e,#d97706)' : 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                  {initials}
                </div>
                {/* Real user mini avatar when proxying */}
                {isProxy && (
                  <div className='absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white'
                    style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
                    {realInitials[0]}
                  </div>
                )}
              </div>
              <div className='hidden md:block leading-tight'>
                <div className='text-sm font-semibold text-gray-800'>{currentUser?.name}</div>
                <div className='text-[11px] text-gray-400'>
                  {isProxy
                    ? <span className='text-amber-600 font-semibold'>Proxy · {roleLabel(currentUser?.role)}</span>
                    : roleLabel(currentUser?.role)
                  }
                </div>
              </div>
            </div>

            {/* Logout */}
            <button onClick={handleLogout}
              className='text-gray-400 hover:text-red-600 transition p-1.5 rounded-lg hover:bg-red-50'
              title='Logout'>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className='flex' style={{ marginTop: topbarHeight + proxyBarHeight }}>
        <Sidebar />
        <main className='flex-1 min-h-screen bg-gray-100' style={{ marginLeft: 56 }}>
          <div className='mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-8'>
            {children}
          </div>
        </main>
      </div>

      {/* Login As Modal */}
      {loginAsOpen && <LoginAsModal onClose={() => setLoginAsOpen(false)} />}
    </div>
  )
}
