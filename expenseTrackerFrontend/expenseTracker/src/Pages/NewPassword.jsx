import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NewPassword = () => {

  const navigate = useNavigate()
  const { openLoginModal } = useAuth()
  const { token } = useParams()

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [loading, setLoading] = useState(true)

  // ✅ Reusable token validation function
  async function validateToken(showAlert = true) {
    try {
      const response = await fetch(
        "http://localhost:8083/token-validation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token })
        }
      )

      if (!response.ok) {
        setIsTokenValid(false)
        if (showAlert) alert("Token invalid or expired ❌")
        return false
      }

      setIsTokenValid(true)
      return true

    } catch (error) {
      console.log(error)
      setIsTokenValid(false)
      return false
    }
  }

  // ✅ STEP 1: Validate token on page load
  useEffect(() => {
    async function onLoad() {
      const valid = await validateToken()
      setLoading(false)

      if (!valid) {
        openLoginModal && openLoginModal()
        navigate('/')
      }
    }

    onLoad()
  }, [token, navigate])

  // ✅ STEP 2: Reset password (validate again)
  async function handleReset() {

    // 🔁 Validate token again before reset
    const valid = await validateToken()

    if (!valid) {
      openLoginModal && openLoginModal()
      navigate('/')
      return
    }

    if (!newPassword || !confirmPassword) {
      alert("Please fill all fields ⚠️")
      return
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match ❌")
      return
    }

    try {
      const updateResponse = await fetch(
        "http://localhost:8083/new-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            newPassword,
            token
          })
        }
      )

      if (updateResponse.ok) {
        alert("Password updated successfully ✅")
        openLoginModal && openLoginModal()
        navigate('/')
      } else {
        alert("Failed to update password ❌")
      }

    } catch (error) {
      console.log(error)
      alert("Something went wrong 😓")
    }
  }

  // ✅ Loading UI
  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center bg-slate-50 text-lg text-slate-600'>
        Checking token...
      </div>
    )
  }

  return (
    <div className='flex h-screen items-center justify-center bg-slate-50 px-4'>
      <div className='flex w-full max-w-md flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_-24px_rgba(15,23,42,0.22)]'>

        <h2 className='text-center text-2xl font-bold tracking-[-0.04em] text-slate-900'>
          Set New Password
        </h2>

        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className='rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className='rounded-xl border border-slate-300 px-3 py-2.5 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
        />

        <button
          onClick={handleReset}
          disabled={!isTokenValid}
          className={`rounded-xl px-4 py-2.5 font-semibold text-white transition ${!isTokenValid ? 'cursor-not-allowed bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          Reset Password
        </button>

      </div>
    </div>
  )
}

export default NewPassword



// local storage
// session strotae ->jab tak chalu browser tak seemit

// cookies