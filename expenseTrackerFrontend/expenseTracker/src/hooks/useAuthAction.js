import { useAuth } from '../context/AuthContext'

/**
 * useAuthAction Hook
 *
 * A custom hook that wraps an action with authentication check.
 * If the user is logged in, the action is executed.
 * If the user is NOT logged in, the LoginModal is opened instead.
 *
 * Usage Example:
 *
 *   import { useAuthAction } from '../hooks/useAuthAction'
 *   import { useNavigate } from 'react-router-dom'
 *
 *   export function MyComponent() {
 *     const navigate = useNavigate()
 *     
 *     // Create an auth-protected action
 *     const handleAddTransaction = useAuthAction(() => {
 *       navigate('/transactions')
 *     })
 *
 *     return (
 *       <button onClick={handleAddTransaction}>
 *         + Add Transaction
 *       </button>
 *     )
 *   }
 *
 * The hook automatically opens LoginModal if user is not authenticated,
 * so you don't need to handle that logic in your component.
 */

export function useAuthAction(action) {
  const { isAuthenticated, openLoginModal } = useAuth()

  /**
   * Wrapper function that checks auth status before executing action
   * @param {Event} event - Optional event object from onClick handler
   */
  const authProtectedAction = (event) => {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault()
    }

    if (isAuthenticated) {
      // User is logged in, execute the action
      action()
    } else {
      // User is not logged in, open login modal
      openLoginModal()
    }
  }

  return authProtectedAction
}
