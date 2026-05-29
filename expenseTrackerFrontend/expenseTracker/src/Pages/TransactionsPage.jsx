import React, { useState } from 'react'
import { useCategories } from '../context/CategoryContext'
import { useAuth } from '../context/AuthContext'
import { useAuthAction } from '../hooks/useAuthAction'
import { useTransactions } from '../context/TransactionContext'
import { colors } from '../theme/colors.js'
import toast from 'react-hot-toast'

const fallbackTransactions = [
  {
    id: 'preview-1',
    transactionId: 'preview-1',
    amount: '40000',
    note: 'Salary credited',
    dateOfTransaction: new Date().toISOString(),
    categoryId: 'preview-income',
    categoryName: 'Salary',
    categoryIcon: '💼',
    categoryType: 'income',
  },
  {
    id: 'preview-2',
    transactionId: 'preview-2',
    amount: '12000',
    note: 'House rent',
    dateOfTransaction: new Date().toISOString(),
    categoryId: 'preview-rent',
    categoryName: 'Rent',
    categoryIcon: '🏠',
    categoryType: 'expense',
  },
  {
    id: 'preview-3',
    transactionId: 'preview-3',
    amount: '1800',
    note: 'Grocery shopping',
    dateOfTransaction: new Date().toISOString(),
    categoryId: 'preview-food',
    categoryName: 'Food',
    categoryIcon: '🍔',
    categoryType: 'expense',
  },
]

const fallbackCategories = [
  { id: 'preview-income', categoryName: 'Salary', categoryType: 'income', iconUrl: '💼' },
  { id: 'preview-rent', categoryName: 'Rent', categoryType: 'expense', iconUrl: '🏠' },
  { id: 'preview-food', categoryName: 'Food', categoryType: 'expense', iconUrl: '🍔' },
]

export default function TransactionsPage() {
  const { categories = [] } = useCategories()
  const { isAuthenticated } = useAuth()
  const { transactions, setTransactions, loading: loadingTransactions } = useTransactions()
  const displayTransactions = isAuthenticated ? transactions : fallbackTransactions
  const displayCategories = isAuthenticated ? categories : fallbackCategories

  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    dateOfTransaction: new Date().toISOString().split('T')[0],
    note: '',
  })

  function normalizeTransaction(item) {
    const id = String(item?.transactionId ?? item?.id ?? item?._id ?? Math.random())
    const amount = item?.amount ?? item?.value ?? ''
    const note = item?.note ?? item?.notes ?? item?.description ?? ''
    const dateOfTransaction = item?.dateOfTransaction ?? item?.date ?? item?.createdAt ?? ''
    const categoryId = item?.categoryId ?? item?.categoryId ?? item?.category?._id ?? item?.category?.id ?? ''

    // try to enrich from categories context
    const category = displayCategories.find((c) => String(c.id) === String(categoryId)) || item?.category || {}

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



  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  // Actual API call function (protected with useAuthAction)
  const submitTransaction = useAuthAction(() => {
    fetch('http://localhost:8083/add-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to add transaction')
        }
        return response.json()
      })
      .then((data) => {
        console.log('Transaction added successfully:', data)
        toast.success('Transaction added successfully')
        // normalize saved item and update context
        const raw = Array.isArray(data) ? data : data?.data ?? data?.transaction ?? data ?? {}
        const saved = Array.isArray(raw) ? raw[0] : raw

        const id = String(saved?.transactionId ?? saved?.id ?? saved?._id ?? Math.random())
        const amount = saved?.amount ?? saved?.value ?? ''
        const note = saved?.note ?? saved?.notes ?? saved?.description ?? ''
        const dateOfTransaction = saved?.dateOfTransaction ?? saved?.date ?? saved?.createdAt ?? ''
        const categoryId = saved?.categoryId ?? saved?.category?._id ?? saved?.category?.id ?? ''

        const category = displayCategories.find((c) => String(c.id) === String(categoryId)) || saved?.category || {}

        const normalized = {
          id,
          amount,
          note,
          dateOfTransaction,
          categoryId,
          categoryName: category?.categoryName ?? category?.name ?? '',
          categoryIcon: category?.iconUrl ?? category?.icon ?? '📦',
          categoryType: category?.categoryType ?? category?.type ?? '',
          _raw: saved,
        }

        setTransactions((current) => [normalized, ...current])

        setFormData({
          categoryId: '',
          amount: '',
          dateOfTransaction: new Date().toISOString().split('T')[0],
          note: '',
        })
      })
      .catch((error) => {
        console.error('Error adding transaction:', error)
        toast.error('Failed to add transaction')
      })
  })

  // Form submission handler (validation only)
  function handleSubmit(event) {
    event.preventDefault()

    if (!formData.categoryId) {
      toast.error('Please select a category')
      return
    }

    if (!formData.amount || Number(formData.amount) === 0) {
      toast.error('Amount must be greater than 0')
      return
    }

    // Call the auth-protected submit function
    submitTransaction()
  }

  return (
    <main style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <div className='mx-auto max-w-3xl space-y-6'>
        <header className='mb-6 text-center'>
          <h1 className='text-3xl font-bold' style={{ color: colors.textPrimary }}>Transactions</h1>
          <p className='mt-2 text-sm' style={{ color: colors.textSecondary }}>Add and manage your transactions</p>
        </header>

        <div className='mx-auto max-w-150 rounded-xl border border-slate-200 bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Transactions table */}
            <div className='mb-4'>
              <h2 className='mb-2 text-lg font-semibold text-slate-800'>All transactions</h2>
              {loadingTransactions && isAuthenticated ? (
                <div className='text-slate-500'>Loading transactions...</div>
              ) : displayTransactions.length === 0 ? (
                <div className='text-slate-500'>No transactions yet.</div>
              ) : (
                <div className='overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm'>
                  <table className='w-full text-sm'>
                    <thead className='sticky top-0 bg-slate-50 text-slate-600'>
                      <tr className='text-left'>
                        <th className='px-3 py-3 font-semibold'>Date</th>
                        <th className='px-3 py-3 font-semibold'>Category</th>
                        <th className='px-3 py-3 font-semibold'>Type</th>
                        <th className='px-3 py-3 text-right font-semibold'>Amount</th>
                        <th className='px-3 py-3 font-semibold'>Note</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-200'>
                      {displayTransactions.map((t) => (
                        <tr key={t.id} className='transition hover:bg-slate-50/80'>
                          <td className='px-3 py-3 text-slate-500'>{t.dateOfTransaction ? new Date(t.dateOfTransaction).toLocaleDateString() : '-'}</td>
                          <td className='px-3 py-3 text-slate-800'>{`${t.categoryIcon} ${t.categoryName}`}</td>
                          <td className='px-3 py-3 text-slate-600'>{t.categoryType}</td>
                          <td className='px-3 py-3 text-right font-semibold' style={{ color: t.categoryType === 'income' ? colors.income : colors.expense }}>₹{t.amount}</td>
                          <td className='px-3 py-3 text-slate-500'>{t.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <label className='block space-y-1.5'>
              <div className='text-sm font-medium text-slate-600'>Category</div>
              <select
                name='categoryId'
                value={formData.categoryId}
                onChange={handleChange}
                className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
              >
                <option value='' disabled>Select a category</option>
                {displayCategories.map((c) => (
                  <option key={c.id} value={c.id}>{`${c.iconUrl} ${c.categoryName} - ${c.categoryType}`}</option>
                ))}
              </select>
            </label>

            <label className='block space-y-1.5'>
              <div className='text-sm font-medium text-slate-600'>Amount</div>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500'>₹</span>
                <input
                  type='number'
                  name='amount'
                  placeholder='0.00'
                  value={formData.amount}
                  onChange={handleChange}
                  className='w-full rounded-lg border border-slate-300 px-3 py-2.5 pl-10 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                  step='0.01'
                />
              </div>
            </label>

            <label className='block space-y-1.5'>
              <div className='text-sm font-medium text-slate-600'>Date of Transaction</div>
              <input
                type='date'
                name='dateOfTransaction'
                value={formData.dateOfTransaction}
                onChange={handleChange}
                className='w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
              />
            </label>

            <label className='block space-y-1.5'>
              <div className='text-sm font-medium text-slate-600'>Additional Notes</div>
              <textarea
                name='note'
                rows='3'
                placeholder='Add any extra details (optional)'
                value={formData.note}
                onChange={handleChange}
                className='w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
              />
            </label>

            <button
              type='submit'
              className='w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700'
            >
              Add Transaction
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}