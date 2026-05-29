import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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

const ResetPassword = () => {
  const navigate = useNavigate()
  const { openLoginModal } = useAuth()
  const [searchParams] = useSearchParams()

  const userId = searchParams.get('userId') || ''
  // const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!userId ) {
      toast.error('Invalid or missing reset link.')
      return
    }

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill both password fields.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(`http://localhost:8083/update-password/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      })

      if (!response.ok) {
        throw new Error('Unable to change password.')
      }
      toast.success('Password changed successfully. Opening login...')
      setTimeout(() => {
        openLoginModal && openLoginModal()
        navigate('/')
      }, 1200)
    } catch (error) {
      toast.error(error.message || 'Something went wrong.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-slate-50 px-4 py-10 text-slate-800'>
      <div className='mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center'>
        <div className='w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_24px_70px_-24px_rgba(15,23,42,0.22)] sm:p-8'>
          <h1 className='text-center text-2xl font-bold tracking-[-0.04em] text-slate-900'>Set New Password</h1>
          <p className='mt-2 text-center text-sm text-slate-500'>Create a strong password for your account.</p>

          <form onSubmit={handleSubmit} className='mt-6 space-y-5'>
            <div>
              <label htmlFor='newPassword' className='mb-2 block text-sm font-semibold text-slate-700'>
                New Password
              </label>
              <div className='relative'>
                <input
                  id='newPassword'
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder='Enter new password'
                  className='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                />
                <button
                  type='button'
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800 focus:outline-none'
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor='confirmPassword' className='mb-2 block text-sm font-semibold text-slate-700'>
                Confirm Password
              </label>
              <div className='relative'>
                <input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder='Re-enter new password'
                  className='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800 focus:outline-none'
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400'
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
