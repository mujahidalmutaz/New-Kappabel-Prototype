'use client'
import { useState, useEffect }  from 'react'
import { useRouter }            from 'next/navigation'
import { useAuthStore }         from '@/store/authStore'
import { useBrandingStore }     from '@/store/brandingStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [mounted, setMounted]   = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const { login }               = useAuthStore()
  const { loginLogo, getActiveTheme } = useBrandingStore()
  const router    = useRouter()

  useEffect(() => { setMounted(true) }, [])

  // Defer store-dependent values until after first client render to avoid
  // server/client HTML mismatch (Zustand rehydrates from localStorage on client)
  const activeTheme = mounted ? getActiveTheme() : null
  const logoSrc     = mounted ? (loginLogo || '/logos/new-kappabel-prototype.png') : '/logos/new-kappabel-prototype.png'

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Username dan password wajib diisi.')
      return
    }
    setLoading(true)
    setError('')
    const ok = login(username, password)
    if (ok) {
      document.cookie = 'hcm-auth=1; path=/; max-age=86400'
      router.push('/dashboard')
    } else {
      setError('Username atau password salah.')
      setLoading(false)
    }
  }

  const bgStyle = activeTheme?.image
    ? { backgroundImage: `url(${activeTheme.image})`, backgroundSize:'cover', backgroundPosition:'center' }
    : { background: 'linear-gradient(135deg,#1a1a2e,#16213e,#8B1A1A)' }

  return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-4 py-8 relative' style={bgStyle}>
      {activeTheme?.image && <div className='absolute inset-0 bg-black/40' />}

      {/* Login card */}
      <div className='relative bg-white rounded-2xl px-10 py-8 w-96 shadow-2xl z-10'>

        {/* Logo */}
        <div className='text-center mb-6'>
          <img src={logoSrc} alt='Manusistem' className='object-contain mx-auto'
            style={{ height: '80px', maxWidth: '240px' }} />
        </div>

        {/* Form */}
        <div className='mb-3'>
          <label className='block text-sm font-semibold text-gray-600 mb-1.5'>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className='w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition'
            placeholder='Masukkan username' disabled={loading} />
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-semibold text-gray-600 mb-1.5'>Password</label>
          <input type='password' value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className='w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 transition'
            placeholder='Masukkan password' disabled={loading} />
          <p className='text-xs text-gray-400 mt-1.5'>Mohon jangan menyebarluaskan password</p>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg mb-4'>
            {error}
          </div>
        )}

        <button onClick={handleLogin} disabled={loading}
          className='w-full py-3 rounded-lg text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-60'
          style={{ background: 'linear-gradient(135deg,#8B1A1A,#D7252B)' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>

      {/* Demo Accounts — collapsible card */}
      <div className='relative z-10 w-96'>
        <button onClick={() => setShowDemo(v => !v)}
          className='w-full flex items-center justify-center gap-2 py-2 text-xs text-white/50 hover:text-white/80 transition'>
          <span>{showDemo ? '▲' : '▼'}</span>
          <span>Demo Accounts</span>
          <span>{showDemo ? '▲' : '▼'}</span>
        </button>

        {showDemo && (
          <div className='bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 shadow-lg mt-1'>
            <div className='grid grid-cols-3 gap-x-4 gap-y-1.5 text-xs'>
              <div className='text-white/40 font-semibold'>Username</div>
              <div className='text-white/40 font-semibold'>Password</div>
              <div className='text-white/40 font-semibold'>Role</div>
              <div className='text-white/80'>👤 employee</div><div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>Employee</div>
              <div className='text-white/80'>👥 manager</div> <div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>Manager</div>
              <div className='text-white/80'>🗂️ hr</div>       <div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>HR</div>
              <div className='text-white/80'>⚙️ admin</div>    <div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>Superadmin</div>
              <div className='col-span-3 border-t border-white/15 mt-1 pt-2 text-white/40 font-semibold'>Indirect Supervisor</div>
              <div className='text-white/80'>👥 rizky</div>    <div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>CTO (Mgr)</div>
              <div className='text-white/80'>🗂️ kartika</div>  <div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>CHRO (HR)</div>
              <div className='col-span-3 border-t border-white/15 mt-1 pt-2 text-white/40 font-semibold'>HR Team</div>
              <div className='text-white/80'>🗂️ bagas</div>   <div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>HR Mgr NTK</div>
              <div className='text-white/80'>🗂️ desi</div>    <div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>HR Off NTK</div>
              <div className='text-white/80'>🗂️ faisal</div>  <div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>HR Off NTK</div>
              <div className='text-white/80'>🗂️ yuliani</div> <div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>HR Mgr NFC</div>
              <div className='text-white/80'>🗂️ hendri</div>  <div className='text-white/60 font-mono'>pass123</div><div className='text-white/50'>HR Off NFC</div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}