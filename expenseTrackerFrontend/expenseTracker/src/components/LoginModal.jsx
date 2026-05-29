import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

/**
 * LoginModal Component
 *
 * A reusable modal-based login form that can be triggered from anywhere in the app.
 * 
 * Usage Example:
 * 
 * In any component, use the useAuth hook to access login modal controls:
 * 
 *   import { useAuth } from '../context/AuthContext'
 *   
 *   export function MyComponent() {
 *     const { openLoginModal } = useAuth()
 *     
 *     return (
 *       <button onClick={openLoginModal}>
 *         Login
 *       </button>
 *     )
 *   }
 * 
 * The modal is automatically rendered in App.jsx and works globally across the app.
 * Users can close it by clicking the X button or by successfully logging in.
 */

const EyeOpenIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='h-5 w-5' aria-hidden='true'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z' />
    <circle cx='12' cy='12' r='3' />
  </svg>
)

const EyeClosedIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='h-5 w-5' aria-hidden='true'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M3 3l18 18' />
    <path strokeLinecap='round' strokeLinejoin='round' d='M10.6 10.6A3 3 0 0013.4 13.4' />
    <path strokeLinecap='round' strokeLinejoin='round' d='M9.9 5.2A10.7 10.7 0 0112 5c6 0 9.5 7 9.5 7a16.8 16.8 0 01-3.2 4.1' />
    <path strokeLinecap='round' strokeLinejoin='round' d='M6.3 6.3C4.1 7.7 2.5 12 2.5 12s3.5 7 9.5 7a10.8 10.8 0 005.7-1.6' />
  </svg>
)

const CloseIcon = () => (
  <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='h-6 w-6'>
    <path strokeLinecap='round' strokeLinejoin='round' d='M6 6l12 12M18 6L6 18' />
  </svg>
)

export default function LoginModal() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { login, loginModalOpen, closeLoginModal } = useAuth()

  function handleLogin(event) {
    event.preventDefault()
    setIsLoading(true)

    const loginPayload = {
      username: identifier,
      password,
    }

    fetch('http://localhost:8083/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(loginPayload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Username not found, please signup')
        }
        return response.json()
      })
      .then((data) => {
        login(data.token)
        localStorage.setItem('userId', String(data.userId))
        localStorage.setItem('username', data.username)
        toast.success(data.message || 'Login successful')
        setIdentifier('')
        setPassword('')
        
        // Only navigate if onboarding is not completed
        if (data.onboardingCompleted === false) {
          navigate('/onboarding')
        }
        // Otherwise, stay on current page (modal will close automatically due to login state change)
      })
      .catch((error) => {
        console.error('Login error:', error)
        toast.error(error.message || 'Login failed')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  if (!loginModalOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6'>
      <div className='relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl'>
        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className='absolute right-5 top-5 rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800'
          aria-label='Close modal'
          title='Close'
        >
          <CloseIcon />
        </button>

        {/* Modal Header */}
        <div className='mb-8'>
          <p className='inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold tracking-wide text-slate-700'>
            rupeerRadar
          </p>
          <h2 className='mt-4 text-2xl font-extrabold tracking-[-0.04em] text-slate-900'>
            Welcome back
          </h2>
          <p className='mt-2 text-sm text-slate-500'>
            Login to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className='space-y-5'>
          <div className='space-y-2'>
            <label htmlFor='modal-username' className='text-sm font-semibold text-slate-700'>
              Username
            </label>
            <input
              id='modal-username'
              type='text'
              placeholder='you@example.com'
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
              required
              disabled={isLoading}
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='modal-password' className='text-sm font-semibold text-slate-700'>
              Password
            </label>
            <div className='relative'>
              <input
                id='modal-password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                required
                disabled={isLoading}
              />
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800 focus:outline-none'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading}
              >
                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </div>

          <div className='flex items-center justify-between text-sm'>
            <label className='flex items-center gap-2 text-slate-600'>
              <input type='checkbox' className='h-4 w-4 rounded border-slate-300 accent-indigo-600' disabled={isLoading} />
              Remember me
            </label>
            <button
              type='button'
              onClick={() => {
                closeLoginModal()
                navigate('/forgot-password')
              }}
              className='font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-4 transition hover:text-indigo-700 disabled:opacity-50'
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          <button
            type='submit'
            className='w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className='mt-6 text-center text-sm text-slate-500'>
          New here?{' '}
          <button
            type='button'
            onClick={() => {
              closeLoginModal()
              navigate('/signup')
            }}
            className='font-semibold text-indigo-600 underline decoration-indigo-300 underline-offset-4 transition hover:text-indigo-700 disabled:opacity-50'
            disabled={isLoading}
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  )
}
