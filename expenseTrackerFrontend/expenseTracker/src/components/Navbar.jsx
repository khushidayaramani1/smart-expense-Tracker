import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function navClass({ isActive }) {
  return [
    'rounded-md px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-emerald-100 text-emerald-800' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
  ].join(' ')
}

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, openLoginModal } = useAuth()

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    navigate('/')
  }

  return (
    <nav className='sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur'>
      <div className='mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6'>
        <button
          type='button'
          onClick={() => navigate('/')}
          className='text-lg font-extrabold tracking-tight text-emerald-700 md:text-xl'
        >
          rupeerRadar
        </button>

        <div className='flex items-center gap-1 md:gap-2'>
          <NavLink to='/' className={navClass}>
            Home
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to='/dashboard' className={navClass}>
                Dashboard
              </NavLink>
              <NavLink to='/analytics' className={navClass}>
                Analytics
              </NavLink>
              <button
                type='button'
                onClick={handleLogout}
                className='rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100'
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => openLoginModal()} className={navClass({ isActive: false })}>
                Login
              </button>
              {location.pathname !== '/signup' && (
                <NavLink to='/signup' className={navClass}>
                  Sign Up
                </NavLink>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
