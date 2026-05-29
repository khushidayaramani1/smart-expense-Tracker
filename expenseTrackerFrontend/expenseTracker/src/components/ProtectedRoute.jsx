import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, openLoginModal } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error('Please login to continue')
      try {
        openLoginModal && openLoginModal()
      } catch (e) {}
    }
  }, [isLoading, isAuthenticated, openLoginModal])

  if (isLoading) {
    return <div className='flex items-center justify-center min-h-screen'>Loading...</div>
  }

  if (!isAuthenticated) return <Navigate to='/' replace />

  return children
}
