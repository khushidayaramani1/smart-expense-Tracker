import './App.css'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import ResetPassword from './Pages/ResetPassword.jsx'
import NewPassword from './Pages/NewPassword.jsx'
import SignUp from './Pages/SignUp.jsx'
import TransactionsPage from './Pages/TransactionsPage.jsx'
import AnalyticsPage from './Pages/AnalyticsPage.jsx'
import CategoriesPage from './Pages/CategoriesPage.jsx'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar.jsx'
import LoginModal from './components/LoginModal.jsx'
import HomePage from './Pages/HomePage.jsx'
import { CategoryProvider } from './context/CategoryContext'
import { AuthProvider } from './context/AuthContext'
import { TransactionProvider } from './context/TransactionContext'
import ProtectedRoute from './components/ProtectedRoute'

function AppLayout() {
  return (
    <div className='flex min-h-screen bg-slate-50 text-slate-800'>
      <Sidebar />
      <main className='min-w-0 flex-1'>
        <div className='mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <>
      <Toaster
        position='top-right'
        toastOptions={{
          duration: 3000,
        }}
      />
      <AuthProvider>
        <LoginModal />
        <TransactionProvider>
          <CategoryProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path='/' element={<HomePage />}></Route>
                <Route path='/dashboard' element={<HomePage />}></Route>
                <Route path='/transactions' element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>}></Route>
                <Route path='/analytics' element={<AnalyticsPage />}></Route>
                <Route path='/categories' element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>}></Route>
                <Route path='/home' element={<Navigate to='/' replace />}></Route>
              </Route>
              {/* Login is handled via modal (AuthProvider -> LoginModal) */}
              <Route path='/forgot-password' element={<ResetPassword />}></Route>
              <Route path='/update-password' element={<ResetPassword />}></Route>
              <Route path='/reset/:token' element={<NewPassword />}></Route>
              <Route path='/signup' element={<SignUp />}></Route>
              <Route path='*' element={<Navigate to='/' replace />}></Route>
            </Routes>
          </CategoryProvider>
        </TransactionProvider>
      </AuthProvider>
    </>
  )
}

export default App
