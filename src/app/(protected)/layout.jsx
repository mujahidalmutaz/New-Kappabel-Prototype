'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Sidebar             from '@/components/layout/Sidebar'
import GlobalSearch        from '@/components/layout/GlobalSearch'
import NotificationBell    from '@/components/layout/NotificationBell'
import { useBrandingStore } from '@/store/brandingStore'
import { useLanguageStore } from '@/store/languageStore'

export default function ProtectedLayout({ children }) {
  const { currentUser, logout, _hydrated } = useAuthStore()
  const { topbarLogo }                     = useBrandingStore()
  const { lang, setLang }                  = useLanguageStore()
  const router = useRouter()

  useEffect(() => {
    // Tunggu rehydration selesai sebelum cek — mencegah redirect di new tab
    if (_hydrated && !currentUser) router.push('/login')
  }, [_hydrated, currentUser, router])

  // Belum rehydrate: tampilkan loading blank agar tidak flash redirect
  if (!_hydrated) return (
    <div className='min-h-screen flex items-center justify-center'
      style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
      <img src='/logos/new-kappabel-prototype.png' alt='' className='w-20 h-20 object-contain animate-pulse' />
    </div>
  )

  if (!currentUser) return null

  const handleLogout = () => {
    logout()
    document.cookie = 'hcm-auth=; path=/; max-age=0'
    router.push('/login')
  }

  const roleLabel = (r) =>
    ({ employee:'Employee', manager:'Manager', hr:'HR', superadmin:'Superadmin' }[r] || r)

  return (
    <div className='flex flex-col min-h-screen bg-gray-100'>

      {/* Topbar */}
      <header
        className='fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-6 shadow-md'
        style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}
      >
        {topbarLogo ? (
          <img src={topbarLogo} alt='Logo' className='object-contain flex-shrink-0' style={{ height: '42px', maxWidth: '160px' }} />
        ) : (
          <div className='flex items-center gap-2 flex-shrink-0'>
            {/* K icon */}
            <div className='flex items-center justify-center rounded-md bg-white' style={{ width: 36, height: 36 }}>
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none'>
                <path d='M5 3h4v7.5l6-7.5h5L12.5 12 20 21h-5l-6-7.5V21H5V3z' fill='#D7252B'/>
              </svg>
            </div>
            {/* Text */}
            <div className='leading-none'>
              <div className='flex items-baseline gap-1'>
                <span className='text-white font-bold text-lg tracking-tight'>appabel</span>
                <span className='text-white/50 text-[10px] font-semibold border border-white/30 rounded px-1 py-0.5 leading-none'>Prototype</span>
              </div>
              <div className='text-white/60 text-[10px] font-medium tracking-wide'>by Dexa Group</div>
            </div>
          </div>
        )}
        <div className='flex-1 flex justify-center px-4'>
          <GlobalSearch />
        </div>
        <div className='flex items-center gap-3 flex-shrink-0'>
          {/* User identity */}
          <div className='hidden md:flex items-center gap-2.5 pr-1'>
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white ring-1 ring-white/30'>
              {(currentUser?.name || '?').trim().charAt(0).toUpperCase()}
            </div>
            <div className='leading-tight'>
              <div className='text-sm font-semibold text-white'>{currentUser?.name}</div>
              <div className='text-[11px] text-white/70'>{roleLabel(currentUser?.role)}</div>
            </div>
          </div>
          {/* Notification bell */}
          <NotificationBell />
          {/* Language switcher */}
          <div className='flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5 ring-1 ring-white/15'>
            <button
              onClick={() => setLang('id')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition ${
                lang === 'id' ? 'bg-white text-red-800 shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLang('en')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition ${
                lang === 'en' ? 'bg-white text-red-800 shadow-sm' : 'text-white/70 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
          <button
            onClick={handleLogout}
            className='text-white text-sm font-medium px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/20 transition'
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className='flex mt-14'>
        <Sidebar />
        <main className='ml-60 flex-1 min-h-screen bg-gray-100'>
          <div className='mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-8'>
            {children}
          </div>
        </main>
      </div>

    </div>
  )
}