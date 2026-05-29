import React, { createContext, useContext, useEffect, useState } from 'react'

const CategoryContext = createContext(undefined)

function mapRawToCategory(item) {
  const totalBudget = item?.totalBudget ?? item?.budget ?? ''
  const spent = item?.spent ?? item?.expenseSpent ?? ''
  const receivedAmount = item?.receivedAmount ?? item?.incomeAmount ?? item?.amount ?? ''

  return {
    id: String(item?.categoryId ?? item?.id ?? item?.category_id ?? Math.random()),
    categoryName: item?.categoryName ?? item?.name ?? 'Unnamed',
    categoryDescription: item?.categoryDescription ?? item?.description ?? '',
    categoryType: item?.categoryType ?? item?.type ?? '',
    iconUrl: item?.iconUrl ?? item?.icon ?? item?.emoji ?? '📦',
    receivedAmount,
    totalBudget,
    spent,
    remaining: (() => {
      const b = Number(totalBudget)
      const s = Number(spent)
      if (!Number.isFinite(b) || !Number.isFinite(s)) return ''
      return String(b - s)
    })(),
    _raw: item,
  }
}

export function CategoryProvider({ children }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const res = await fetch('http://localhost:8083/categories', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (!res.ok) throw new Error('Failed to fetch categories')

        const data = await res.json()

        // Accept multiple shapes
        const raw = Array.isArray(data)
          ? data
          : data?.categories ?? data?.response ?? data?.data ?? []

        const mapped = (Array.isArray(raw) ? raw : []).map(mapRawToCategory)

        if (!cancelled) setCategories(mapped)
      } catch (e) {
        // swallow; app can show empty state
        console.error('CategoryProvider load error', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <CategoryContext.Provider value={{ categories, setCategories, loading }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoryContext)
  if (ctx === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return ctx
}

export default CategoryContext
