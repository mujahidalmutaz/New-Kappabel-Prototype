'use client'
import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { useAuthStore }        from '@/store/authStore'
import { useBrandingStore }    from '@/store/brandingStore'

export default function LoginPage() {
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [error, setError]         = useState('')
  const [fieldErr, setFieldErr]   = useState({ username: '', password: '' })
  const [loading, setLoading]     = useState(false)
  const [mounted, setMounted]     = useState(false)
  const [showDemo, setShowDemo]   = useState(false)
  const { login }                 = useAuthStore()
  const { loginLogo }             = useBrandingStore()
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const handleLogin = async () => {
    const errs = { username: username ? '' : 'Please enter your email', password: password ? '' : 'Please enter your password' }
    setFieldErr(errs)
    if (errs.username || errs.password) return
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

  return (
    <div className='min-h-screen flex' style={{ background: 'linear-gradient(120deg, #f4a97a 0%, #f8d5c0 30%, #fff 60%, #f9f0ee 100%)' }}>

      {/* Left: login card column */}
      <div className='flex flex-col justify-center items-center w-full md:w-[520px] lg:w-[560px] px-8 py-12 relative z-10'>

        <div className='w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden'>

          {/* Card body */}
          <div className='px-10 pt-10 pb-6'>

            {/* Logo */}
            <div className='mb-5'>
              {mounted && loginLogo ? (
                <img src={loginLogo} alt='Logo' className='h-10 object-contain' />
              ) : (
                <div className='flex items-center gap-2'>
                  <svg width='32' height='32' viewBox='0 0 32 32' fill='none'>
                    <rect width='32' height='32' rx='7' fill='#D7252B'/>
                    <path d='M8 6h5v9.2L21.2 6H27L18 16l9 10h-5.8L13 17.2V26H8V6z' fill='white'/>
                  </svg>
                  <div className='leading-none'>
                    <div className='flex items-baseline gap-1'>
                      <span className='font-bold text-xl tracking-tight text-gray-900'>Kappabel</span>
                      <span className='text-[9px] font-semibold border border-gray-300 rounded px-1 py-0.5 text-gray-400 leading-none'>Prototype</span>
                    </div>
                    <div className='text-[10px] text-gray-400 font-medium tracking-wide'>by Dexa Group</div>
                  </div>
                </div>
              )}
            </div>

            {/* Greeting */}
            <h1 className='text-3xl font-bold text-gray-900 mb-0.5'>Hi, Dexan</h1>
            <div className='flex items-center justify-between mb-6'>
              <p className='text-sm text-gray-400'>Welcome!</p>
              <button onClick={() => setShowDemo(v => !v)}
                className='flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-gray-400 transition'>
                Demo Accounts
              </button>
            </div>

            {/* Email */}
            <div className='mb-4'>
              <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Email</label>
              <input value={username} onChange={e => { setUsername(e.target.value); setFieldErr(p => ({ ...p, username: '' })) }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition border ${fieldErr.username ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-red-400 focus:bg-white'}`}
                placeholder='Enter your email' disabled={loading} />
              {fieldErr.username && <p className='text-xs text-red-500 mt-1'>{fieldErr.username}</p>}
            </div>

            {/* Password */}
            <div className='mb-5'>
              <label className='block text-sm font-semibold text-gray-700 mb-1.5'>Password</label>
              <div className='relative'>
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => { setPassword(e.target.value); setFieldErr(p => ({ ...p, password: '' })) }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  className={`w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition border ${fieldErr.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:border-red-400 focus:bg-white'}`}
                  placeholder='Enter password' disabled={loading} />
                <button type='button' onClick={() => setShowPass(v => !v)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition'>
                  {showPass ? (
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24'/><line x1='1' y1='1' x2='23' y2='23'/></svg>
                  ) : (
                    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'><path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'/><circle cx='12' cy='12' r='3'/></svg>
                  )}
                </button>
              </div>
              {fieldErr.password && <p className='text-xs text-red-500 mt-1'>{fieldErr.password}</p>}
            </div>

            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4'>{error}</div>
            )}

            <button onClick={handleLogin} disabled={loading}
              className='w-full py-3.5 rounded-xl text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-60'
              style={{ background: '#8B1A1A' }}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>

          {/* Demo accounts */}
          {showDemo && (
            <div className='border-t border-gray-100 px-10 py-4 bg-gray-50'>
              <p className='text-xs font-semibold text-gray-500 mb-2'>Demo Accounts</p>
              <div className='grid grid-cols-3 gap-x-3 gap-y-1 text-xs'>
                <span className='text-gray-400 font-semibold'>Username</span>
                <span className='text-gray-400 font-semibold'>Password</span>
                <span className='text-gray-400 font-semibold'>Role</span>
                {[
                  ['employee','pass123','Employee'],
                  ['manager','pass123','Manager'],
                  ['hr','pass123','HR'],
                  ['admin','pass123','Superadmin'],
                  ['rizky','pass123','CTO (Mgr)'],
                  ['kartika','pass123','CHRO (HR)'],
                ].map(([u,p,r]) => (
                  <><span key={u} className='text-gray-700 font-mono cursor-pointer hover:text-red-600' onClick={() => setUsername(u)}>{u}</span>
                  <span className='text-gray-500 font-mono'>{p}</span>
                  <span className='text-gray-400'>{r}</span></>
                ))}
              </div>
            </div>
          )}

          {/* Bottom stripe */}
          <div className='h-1.5' style={{ background: 'linear-gradient(90deg,#8B1A1A,#D7252B,#f4a97a,#f9d276,#8B1A1A)' }} />

          {/* Footer */}
          <div className='text-center py-2.5'>
            <span className='text-[10px] text-gray-300'>© 2025 Kappabel</span>
          </div>
        </div>
      </div>

      {/* Right: decorative panel */}
      <div className='hidden md:flex flex-1 items-center justify-center px-12'>
        <img src='/logos/kappabel-login-DFPmmq5m.png' alt='Dexa Group 56' className='max-w-full max-h-[420px] object-contain' />
      </div>
    </div>
  )
}
