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
        <img
          src={topbarLogo || '/logos/new-kappabel-prototype.png'}
          alt='Manusistem'
          className='object-contain flex-shrink-0'
          style={{ height: '42px', maxWidth: '160px' }}
        />
        <div className='flex-1 flex justify-center px-4'>
          <GlobalSearch />
        </div>
        <div className='flex items-center gap-3 flex-shrink-0'>
          <span className='text-gray-300 text-sm hidden md:block'>{currentUser?.name}</span>
          <span className='bg-white/20 text-white text-xs px-3 py-1 rounded-full hidden md:block'>
            {roleLabel(currentUser?.role)}
          </span>
          {/* Notification bell */}
          <NotificationBell />
          {/* Language switcher */}
          <div className='flex items-center gap-0.5 bg-white/10 rounded-lg p-0.5'>
            <button
              onClick={() => setLang('id')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition ${
                lang === 'id' ? 'bg-white text-red-800' : 'text-white/70 hover:text-white'
              }`}
            >
              ID
            </button>
            <button
              onClick={() => setLang('en')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition ${
                lang === 'en' ? 'bg-white text-red-800' : 'text-white/70 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
          <button
            onClick={handleLogout}
            className='text-white text-sm px-3 py-1.5 rounded-md border border-white/30 hover:bg-white/20 transition'
          >
            Logout
          </button>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className='flex mt-14'>
        <Sidebar />
        <main className='ml-60 flex-1 p-7 min-h-screen'>
          {children}
        </main>
      </div>

    </div>
  )
}