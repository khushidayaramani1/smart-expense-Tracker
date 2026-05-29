import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
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

const SignUp = () => {
  const navigate = useNavigate()
  const { openLoginModal } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }

    fetch('http://localhost:8083/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
      }),
    })
      .then((response) =>
        response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.response || 'Registration failed')
          }
          return data
        }),
      )
      .then((data) => {
        console.log('Backend Map data:', data)

        if (data.token) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('userId', String(data.userId || ''))
          localStorage.setItem('username', data.username || '')

          toast.success(data.message || 'Registration successful!')
          navigate('/dashboard')
        } else {
          toast.success('Account created! Please login.')
          openLoginModal && openLoginModal()
          navigate('/')
        }
      })
      .catch((error) => {
        console.error('Error details:', error.message)
        toast.error(error.message || 'An error occurred during registration.')
      })
  }

  return (
    <div className='min-h-screen bg-slate-50 px-4 py-10 text-slate-800'>
      <div className='mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center'>
        <div className='relative grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_-24px_rgba(15,23,42,0.22)] md:grid-cols-2'>
          <div className='absolute -left-14 -top-14 h-36 w-36 rounded-full bg-indigo-100/80 blur-2xl' />
          <div className='absolute -bottom-12 right-10 h-32 w-32 rounded-full bg-slate-200/70 blur-2xl' />

          <div className='relative hidden flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-800 to-slate-700 p-10 text-white md:flex'>
            <div>
              <p className='inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/80'>
                rupeerRadar
              </p>
              <h1 className='mt-6 text-4xl font-black leading-tight tracking-[-0.04em]'>
                Create your account.
                <br />
                Start tracking smartly.
              </h1>
            </div>
            <div className='space-y-3 text-sm text-white/75'>
              <p>Plan budgets faster with organized categories.</p>
              <p>Track your spending pattern in one dashboard.</p>
              <p>Stay consistent with daily money habits.</p>
            </div>
          </div>

          <div className='relative p-6 sm:p-10'>
            <h2 className='mb-6 text-3xl font-extrabold tracking-[-0.04em] text-slate-900'>Sign up</h2>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2 sm:col-span-2'>
                  <label className='text-sm font-semibold text-slate-700'>Name</label>
                  <input
                    name='name'
                    type='text'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Alex Johnson'
                    className='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                    required
                  />
                </div>

                <div className='space-y-2 sm:col-span-2'>
                  <label className='text-sm font-semibold text-slate-700'>Email</label>
                  <input
                    name='email'
                    type='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='alex@example.com'
                    className='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-slate-700'>Username</label>
                  <input
                    name='username'
                    type='text'
                    value={formData.username}
                    onChange={handleChange}
                    placeholder='alex_21'
                    className='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-slate-700'>Phone</label>
                  <input
                    name='phone'
                    type='tel'
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder='+1 234 567 890'
                    className='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-slate-700'>Password</label>
                  <div className='relative'>
                    <input
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder='********'
                      className='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword((prev) => !prev)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800 focus:outline-none'
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                  </div>
                </div>

                <div className='space-y-2'>
                  <label className='text-sm font-semibold text-slate-700'>Confirm</label>
                  <div className='relative'>
                    <input
                      name='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder='********'
                      className='w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                      required
                    />
                    <button
                      type='button'
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-800 focus:outline-none'
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type='submit'
                className='mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold tracking-wide text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700'
              >
                Create Account
              </button>
            </form>

            <p className='mt-6 text-center text-sm text-slate-500'>
              Already have an account?{' '}
              <button onClick={() => { openLoginModal && openLoginModal(); navigate('/') }} className='font-semibold text-indigo-600 underline underline-offset-4'>
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp