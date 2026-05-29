/**
 * useAuthAction Hook - Usage Examples
 *
 * The useAuthAction hook is a custom hook that provides easy authentication
 * checks for button actions. It automatically opens the LoginModal for
 * unauthenticated users instead of executing the action.
 *
 * This is perfect for:
 * - "Add Transaction" buttons
 * - "Add Category" buttons
 * - "Save" or "Submit" buttons on protected features
 * - Any action that requires authentication
 */

// ============================================================================
// EXAMPLE 1: Simple Button Click Handler
// ============================================================================
/*
import { useAuth } from '../context/AuthContext'
import { useAuthAction } from '../hooks/useAuthAction'
import { useNavigate } from 'react-router-dom'

export function TransactionButton() {
  const navigate = useNavigate()
  
  // Create the auth-protected handler
  const handleAddTransaction = useAuthAction(() => {
    navigate('/transactions')
  })

  return (
    <button onClick={handleAddTransaction}>
      + Add Transaction
    </button>
  )
}
*/

// ============================================================================
// EXAMPLE 2: Form Submission
// ============================================================================
/*
import { useAuthAction } from '../hooks/useAuthAction'

export function CategoryForm() {
  const handleSubmit = useAuthAction((e) => {
    // If logged in, process form
    console.log('Saving category...')
    // Your form logic here
  })

  return (
    <form onSubmit={handleSubmit}>
      <input type='text' placeholder='Category name' />
      <button type='submit'>Save Category</button>
    </form>
  )
}
*/

// ============================================================================
// EXAMPLE 3: Modal Trigger (without page navigation)
// ============================================================================
/*
import { useState } from 'react'
import { useAuthAction } from '../hooks/useAuthAction'

export function BudgetTracker() {
  const [showModal, setShowModal] = useState(false)
  
  const handleOpenBudgetModal = useAuthAction(() => {
    setShowModal(true)
  })

  return (
    <>
      <button onClick={handleOpenBudgetModal}>
        Set Budget
      </button>
      {showModal && <BudgetModal onClose={() => setShowModal(false)} />}
    </>
  )
}
*/

// ============================================================================
// EXAMPLE 4: Conditional Rendering (Alternative Approach)
// ============================================================================
/*
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const { isAuthenticated, openLoginModal } = useAuth()
  const navigate = useNavigate()
  
  // Manual approach (less clean)
  const handleClick = () => {
    if (isAuthenticated) {
      navigate('/transactions')
    } else {
      openLoginModal()
    }
  }

  return <button onClick={handleClick}>Add Transaction</button>
}

// Better approach with useAuthAction:
export function DashboardWithHook() {
  const { openLoginModal } = useAuth()
  const navigate = useNavigate()
  const handleClick = useAuthAction(() => navigate('/transactions'))

  return <button onClick={handleClick}>Add Transaction</button>
}
*/

// ============================================================================
// EXAMPLE 5: Multiple Auth-Protected Buttons
// ============================================================================
/*
import { useNavigate } from 'react-router-dom'
import { useAuthAction } from '../hooks/useAuthAction'

export function HomePage() {
  const navigate = useNavigate()
  
  // Create multiple auth-protected handlers
  const handleAddTransaction = useAuthAction(() => navigate('/transactions'))
  const handleAddCategory = useAuthAction(() => navigate('/categories'))
  const handleViewAnalytics = useAuthAction(() => navigate('/analytics'))

  return (
    <div>
      <button onClick={handleAddTransaction}>
        + Add Transaction
      </button>
      <button onClick={handleAddCategory}>
        + Add Category
      </button>
      <button onClick={handleViewAnalytics}>
        View Analytics
      </button>
    </div>
  )
}
*/

// ============================================================================
// HOW IT WORKS
// ============================================================================
/*
1. When button is clicked, useAuthAction checks isAuthenticated from AuthContext
2. If user IS logged in:
   - The callback function executes immediately
   - Your action runs (navigate, form submit, etc.)
3. If user IS NOT logged in:
   - LoginModal opens automatically
   - Callback is NOT executed
   - User stays on current page
4. Once user logs in:
   - LoginModal closes automatically
   - User can click button again to execute action
*/

// ============================================================================
// KEY BENEFITS
// ============================================================================
/*
✓ DRY Code: No need to duplicate isAuthenticated checks
✓ Consistent UX: All protected buttons behave the same way
✓ Less State: No need to manage modal open/close state
✓ Reusable: Works with any action (navigation, API calls, etc.)
✓ Clean Syntax: Simple one-liner hook integration
*/
