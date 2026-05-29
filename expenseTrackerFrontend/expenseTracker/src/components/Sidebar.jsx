import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, ChevronRight, FolderKanban, Home, LogIn, LogOut, ReceiptText, Sparkles, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/transactions', label: 'Transactions', icon: ReceiptText },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/categories', label: 'Categories', icon: FolderKanban },
]

const authItems = [
  { to: '/login', label: 'Login', icon: LogIn },
  { to: '/signup', label: 'Sign up', icon: UserPlus },
]

const navClass = ({ isActive }) =>
  [
    'group flex items-center justify-between gap-3 rounded-2xl px-3.5 py-3 text-sm font-semibold transition duration-200',
    isActive
      ? 'bg-white text-slate-950 shadow-[0_14px_30px_rgba(15,118,110,0.14)] ring-1 ring-emerald-100'
      : 'text-slate-600 hover:bg-white/70 hover:text-slate-950 hover:shadow-sm',
  ].join(' ')

export default function Sidebar() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, openLoginModal } = useAuth()
  const username = localStorage.getItem('username') || 'Guest'

  function handleLogout() {
    logout()
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
    <aside className='relative flex w-[286px] shrink-0 flex-col gap-4 overflow-hidden border-r border-slate-200 bg-gradient-to-b from-emerald-50 via-white to-indigo-50 p-4 shadow-[inset_-1px_0_0_rgba(255,255,255,0.8)]'>
      <div className='pointer-events-none absolute left-[-48px] top-6 h-[140px] w-[140px] rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.18)_0%,_rgba(16,185,129,0.02)_72%,_transparent_100%)] blur-[4px]' />
      <div className='pointer-events-none absolute bottom-[150px] right-[-60px] h-[180px] w-[180px] rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.14)_0%,_rgba(14,165,233,0.02)_72%,_transparent_100%)] blur-[6px]' />

      <button
        type='button'
        onClick={() => navigate('/dashboard')}
        className='relative z-10 flex items-center gap-3 rounded-[20px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3 text-left shadow-sm transition hover:shadow-md'
      >
        <div className='grid h-10 w-10 place-items-center rounded-[14px] bg-gradient-to-br from-emerald-500 to-teal-700 text-lg font-extrabold text-white'>₹</div>
        <div className='min-w-0 flex-1'>
          <div className='text-[17px] font-extrabold tracking-[-0.02em] text-slate-900'>rupeerRadar</div>
          <div className='text-xs text-slate-500'>Personal finance workspace</div>
        </div>
        <ChevronRight size={16} strokeWidth={2.25} className='shrink-0 text-slate-400' />
      </button>

      <div className='relative z-10 flex items-center gap-3 rounded-[18px] border border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-white p-3 shadow-sm'>
        <div className='grid h-[38px] w-[38px] place-items-center rounded-full bg-gradient-to-br from-teal-700 to-emerald-500 text-sm font-extrabold text-white'>
          {username.slice(0, 2).toUpperCase()}
        </div>
        <div className='min-w-0'>
          <div className='truncate text-sm font-bold text-slate-900'>{username}</div>
          <div className='text-xs text-slate-500'>{isAuthenticated ? 'Signed in and synced' : 'Preview mode'}</div>
        </div>
      </div>

      <nav className='relative z-10 flex flex-1 flex-col gap-2'>
        <div className='mb-1 inline-flex self-start items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700'>
          Explore
        </div>

        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
            {({ isActive }) => (
              <>
                <span className={`grid h-9 w-9 place-items-center rounded-[12px] transition ${isActive ? 'bg-gradient-to-br from-teal-700 to-emerald-500 text-white shadow-[0_10px_24px_rgba(15,118,110,0.22)]' : 'bg-emerald-50 text-teal-700'}`}>
                  <item.icon size={16} strokeWidth={2.2} />
                </span>
                <span className='flex-1 text-left'>{item.label}</span>
                <ChevronRight size={15} strokeWidth={2.1} className='text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400' />
              </>
            )}
          </NavLink>
        ))}

        {!isAuthenticated && (
          <>
            <div className='mt-1 inline-flex self-start items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700'>
              Account
            </div>
            <button
              type='button'
              onClick={openLoginModal}
              className={navClass({ isActive: false })}
              style={{ textAlign: 'left' }}
            >
              <span className='grid h-9 w-9 place-items-center rounded-[12px] bg-emerald-50 text-teal-700 transition'>
                <LogIn size={16} strokeWidth={2.2} />
              </span>
              <span className='flex-1 text-left'>Login</span>
              <ChevronRight size={15} strokeWidth={2.1} className='text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400' />
            </button>
            <NavLink to='/signup' className={navClass}>
              {({ isActive }) => (
                <>
                  <span className={`grid h-9 w-9 place-items-center rounded-[12px] transition ${isActive ? 'bg-gradient-to-br from-teal-700 to-emerald-500 text-white shadow-[0_10px_24px_rgba(15,118,110,0.22)]' : 'bg-emerald-50 text-teal-700'}`}>
                    <UserPlus size={16} strokeWidth={2.2} />
                  </span>
                  <span className='flex-1 text-left'>Sign up</span>
                  <ChevronRight size={15} strokeWidth={2.1} className='text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400' />
                </>
              )}
            </NavLink>
          </>
        )}

        {isAuthenticated && (
          <>
            <div className='mt-1 inline-flex self-start items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700'>
              Account
            </div>
            <button type='button' onClick={handleLogout} className={navClass({ isActive: false })} style={{ textAlign: 'left' }}>
              <span className='grid h-9 w-9 place-items-center rounded-[12px] bg-emerald-50 text-teal-700 transition'>
                <LogOut size={16} strokeWidth={2.2} />
              </span>
              <span className='flex-1 text-left'>Logout</span>
              <ChevronRight size={15} strokeWidth={2.1} className='text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400' />
            </button>
          </>
        )}
      </nav>

      <div className='relative z-10 rounded-[22px] bg-gradient-to-br from-teal-700 to-sky-500 p-4 text-white shadow-lg'>
        <div className='mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/80'>
          <Sparkles size={12} strokeWidth={2.4} /> AI insight
        </div>
        <div className='text-xs leading-6 text-white/95'>Track spending daily so the dashboard stays useful and categories stay clean.</div>
      </div>
    </aside>
  )
}
