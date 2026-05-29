import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const TransactionContext = createContext(undefined)

function mapRawToTransaction(item, categories = []) {
  const id = String(item?.transactionId ?? item?.id ?? item?._id ?? Math.random())
  const amount = item?.amount ?? item?.value ?? ''
  const note = item?.note ?? item?.notes ?? item?.description ?? ''
  const dateOfTransaction = item?.dateOfTransaction ?? item?.date ?? item?.createdAt ?? ''
  const categoryId = item?.categoryId ?? item?.category?._id ?? item?.category?.id ?? ''

  // Enrich from categories context
  const category = categories.find((c) => String(c.id) === String(categoryId)) || item?.category || {}

  return {
    id,
    amount,
    note,
    dateOfTransaction,
    categoryId,
    categoryName: category?.categoryName ?? category?.name ?? '',
    categoryIcon: category?.iconUrl ?? category?.icon ?? '📦',
    categoryType: category?.categoryType ?? category?.type ?? '',
    _raw: item,
  }
}

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    let cancelled = false

    async function loadTransactions() {
      setLoading(true)
      try {
        // Only fetch if user is authenticated
        if (!isAuthenticated) {
          if (!cancelled) setTransactions([])
          return
        }

        const res = await fetch('http://localhost:8083/get-all-transaction', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!res.ok) throw new Error('Failed to fetch transactions')

        const data = await res.json()
        const raw = Array.isArray(data) ? data : data?.data ?? data?.response ?? data?.transactions ?? []
        const mapped = (Array.isArray(raw) ? raw : []).map((item) => mapRawToTransaction(item, []))

        if (!cancelled) setTransactions(mapped)
      } catch (e) {
        // swallow; app can show empty state
        console.error('TransactionProvider load error', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadTransactions()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  return (
    <TransactionContext.Provider value={{ transactions, setTransactions, loading }}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const ctx = useContext(TransactionContext)
  if (ctx === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider')
  }
  return ctx
}

export default TransactionContext
