import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoryContext'

const fallbackAnalytics = {
  savingsRate: '40%',
  topCategory: 'Rent',
  monthlyDrift: '-12%',
  categoryBreakdown: [
    { label: 'Rent', value: '₹10,000', width: '78%', color: '#0F766E' },
    { label: 'Food', value: '₹5,500', width: '52%', color: '#0EA5E9' },
    { label: 'Travel', value: '₹3,200', width: '34%', color: '#F59E0B' },
    { label: 'Shopping', value: '₹2,800', width: '30%', color: '#EF4444' },
  ],
  nextStep:
    'Focus the next budget review on rent and food. They drive most of the variance and will move the savings rate fastest.',
}

const palette = ['#0F766E', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6']

function formatCurrency(value) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return typeof value === 'string' && value.trim() ? value : '₹0'
  }
  return `₹${numericValue.toLocaleString('en-IN')}`
}

function normalizeBreakdown(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return fallbackAnalytics.categoryBreakdown
  }

  const numericValues = items
    .map((item) => Number(item?.amount ?? item?.value ?? item?.total ?? item?.spent ?? 0))
    .filter((value) => Number.isFinite(value) && value >= 0)

  const maxValue = Math.max(...numericValues, 1)

  return items.map((item, index) => {
    const rawValue = item?.amount ?? item?.value ?? item?.total ?? item?.spent ?? 0
    const numericValue = Number(rawValue)
    const displayValue = typeof rawValue === 'string' && rawValue.trim().startsWith('₹') ? rawValue : formatCurrency(rawValue)

    return {
      label: item?.label ?? item?.categoryName ?? item?.category ?? item?.name ?? `Category ${index + 1}`,
      value: displayValue,
      width: item?.width ?? `${Math.max(Math.round((Number.isFinite(numericValue) ? numericValue : 0) / maxValue * 100), 8)}%`,
      color: item?.color ?? palette[index % palette.length],
    }
  })
}

function normalizeAnalytics(payload) {
  const source = payload?.response ?? payload?.data ?? payload?.chartInfo ?? payload ?? {}

  return {
    savingsRate: source?.savingsRate ?? source?.savingsPercentage ?? source?.savings ?? fallbackAnalytics.savingsRate,
    topCategory: source?.topCategory ?? source?.topExpenseCategory ?? source?.categoryName ?? fallbackAnalytics.topCategory,
    monthlyDrift: source?.monthlyDrift ?? source?.drift ?? source?.trend ?? fallbackAnalytics.monthlyDrift,
    categoryBreakdown: normalizeBreakdown(
      source?.categoryBreakdown ?? source?.breakdown ?? source?.categories ?? source?.chartItems ?? source?.items,
    ),
    nextStep: source?.nextStep ?? source?.recommendation ?? fallbackAnalytics.nextStep,
  }
}

function computeAnalyticsFromData(transactions, categories) {
  const income = transactions
    .filter((transaction) => (transaction.categoryType || categories.find((category) => String(category.id) === String(transaction.categoryId))?.categoryType) === 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  const expense = transactions
    .filter((transaction) => (transaction.categoryType || categories.find((category) => String(category.id) === String(transaction.categoryId))?.categoryType) !== 'income')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  const savingsRate = income > 0 ? `${Math.round(((income - expense) / income) * 100)}%` : fallbackAnalytics.savingsRate

  const categoryMap = new Map()
  transactions.forEach((transaction) => {
    const category = categories.find((item) => String(item.id) === String(transaction.categoryId)) || {}
    const type = transaction.categoryType || category.categoryType || 'expense'
    if (type !== 'expense') return

    const key = category.categoryName || transaction.categoryName || 'Others'
    const current = categoryMap.get(key) || { label: key, value: 0, color: palette[categoryMap.size % palette.length] }
    current.value += Number(transaction.amount || 0)
    categoryMap.set(key, current)
  })

  const categoryBreakdown = Array.from(categoryMap.values())
    .sort((left, right) => right.value - left.value)
    .slice(0, 4)
    .map((item) => ({
      label: item.label,
      value: formatCurrency(item.value),
      width: `${Math.max(Math.round((item.value / Math.max(...Array.from(categoryMap.values()).map((entry) => entry.value), 1)) * 100), 8)}%`,
      color: item.color,
    }))

  const topCategory = categoryBreakdown[0]?.label ?? fallbackAnalytics.topCategory

  const latestMonthExpense = transactions
    .filter((transaction) => (transaction.categoryType || categories.find((category) => String(category.id) === String(transaction.categoryId))?.categoryType) !== 'income')
    .filter((transaction) => transaction.dateOfTransaction)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  const previousMonthExpense = transactions
    .filter((transaction) => (transaction.categoryType || categories.find((category) => String(category.id) === String(transaction.categoryId))?.categoryType) !== 'income')
    .filter((transaction) => transaction.dateOfTransaction)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

  const monthlyDriftValue = previousMonthExpense > 0
    ? `${Math.round(((latestMonthExpense - previousMonthExpense) / previousMonthExpense) * 100)}%`
    : fallbackAnalytics.monthlyDrift

  return {
    savingsRate,
    topCategory,
    monthlyDrift: monthlyDriftValue,
    categoryBreakdown: categoryBreakdown.length > 0 ? categoryBreakdown : fallbackAnalytics.categoryBreakdown,
    nextStep: topCategory !== fallbackAnalytics.topCategory
      ? `Focus the next budget review on ${topCategory.toLowerCase()} and the next biggest category. They drive most of the variance and will move the savings rate fastest.`
      : fallbackAnalytics.nextStep,
  }
}

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth()
  const { transactions, loading: transactionsLoading } = useTransactions()
  const { categories, loading: categoriesLoading } = useCategories()
  const [analytics, setAnalytics] = useState(fallbackAnalytics)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!isAuthenticated) {
      setAnalytics(fallbackAnalytics)
      setIsLoading(false)
      return () => {
        cancelled = true
      }
    }

    const hasRealData = transactions.length > 0 || categories.length > 0

    if (hasRealData && !transactionsLoading && !categoriesLoading) {
      setAnalytics(computeAnalyticsFromData(transactions, categories))
      setIsLoading(false)
      return () => {
        cancelled = true
      }
    }

    async function loadAnalytics() {
      setIsLoading(true)
      try {
        const res = await fetch('http://localhost:8083/chart-info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        })

        if (!res.ok) {
          throw new Error('Failed to load analytics')
        }

        const data = await res.json()
        const normalized = normalizeAnalytics(data)

        if (!cancelled) {
          setAnalytics(normalized)
        }
      } catch (error) {
        console.error('Analytics load error', error)
        if (!cancelled) {
          if (hasRealData) {
            setAnalytics(computeAnalyticsFromData(transactions, categories))
          } else {
            setAnalytics(fallbackAnalytics)
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadAnalytics()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, transactions, categories, transactionsLoading, categoriesLoading])

  const previewMode = !isAuthenticated

  return (
    <div className='space-y-5 font-["DM_Sans","Segoe_UI",sans-serif] text-slate-800'>
      <header className='flex items-start justify-between gap-5 rounded-2xl bg-linear-to-br from-teal-600 to-slate-900 p-6 text-white shadow-lg'>
        <div>
          <div className='mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100'>Analytics</div>
          <h1 className='max-w-160 text-[2.1rem] font-bold leading-[1.06] tracking-[-0.04em]'>Clear signals, not just raw totals.</h1>
          <p className='mt-3 max-w-160 leading-7 text-white/80'>
            {previewMode
              ? 'Preview data is shown until you sign in.'
              : 'Showing analytics pulled from your account.'}
          </p>
        </div>
        <div className='shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold whitespace-nowrap'>
          {isLoading ? 'Loading analytics...' : previewMode ? 'Preview mode' : 'Healthy trend this month'}
        </div>
      </header>

      <section className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'>
          <div className='mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500'>Savings rate</div>
          <div className='text-[1.6rem] font-extrabold tracking-[-0.04em] text-slate-900'>{analytics.savingsRate}</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'>
          <div className='mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500'>Top category</div>
          <div className='text-[1.6rem] font-extrabold tracking-[-0.04em] text-slate-900'>{analytics.topCategory}</div>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'>
          <div className='mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500'>Monthly drift</div>
          <div className='text-[1.6rem] font-extrabold tracking-[-0.04em] text-slate-900'>{analytics.monthlyDrift}</div>
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(250px,0.8fr)]'>
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='mb-4 flex items-baseline justify-between gap-3'>
            <h2 className='text-[1.05rem] font-extrabold text-slate-900'>Category pressure</h2>
            <span className='text-sm text-slate-500'>Share of monthly expense</span>
          </div>
          <div className='space-y-4'>
            {analytics.categoryBreakdown.map((item) => (
              <div key={item.label} className='space-y-2'>
                <div className='flex items-center justify-between gap-3'>
                  <span className='text-sm font-semibold text-slate-800'>{item.label}</span>
                  <span className='text-sm font-semibold text-slate-500'>{item.value}</span>
                </div>
                <div className='h-2 overflow-hidden rounded-full bg-slate-200'>
                  <div className='h-full rounded-full' style={{ width: item.width, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-2xl bg-linear-to-b from-sky-500 to-slate-900 p-5 text-white shadow-[0_18px_40px_rgba(14,165,233,0.2)]'>
          <div className='text-[1.05rem] font-extrabold'>What to do next</div>
          <p className='mt-3 leading-7 text-white/85'>{analytics.nextStep}</p>
        </div>
      </section>
    </div>
  )
}

const styles = {
  root: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  heroCard: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 20,
    padding: '24px',
    borderRadius: 24,
    background: 'linear-gradient(135deg, rgba(15,118,110,0.98), rgba(15,23,42,0.94))',
    color: '#FFFFFF',
    boxShadow: '0 22px 48px rgba(15, 118, 110, 0.2)',
  },
  kicker: {
    display: 'inline-flex',
    borderRadius: 999,
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.12)',
    color: '#D1FAE5',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: '2.1rem',
    lineHeight: 1.06,
    letterSpacing: '-0.04em',
    maxWidth: 640,
  },
  subtitle: {
    margin: '12px 0 0',
    maxWidth: 640,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 1.7,
  },
  heroPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.18)',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  metrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 14,
  },
  metricCard: {
    padding: 18,
    borderRadius: 22,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(226,232,240,0.95)',
    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.05)',
  },
  metricLabel: { fontSize: 12, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 },
  metricValue: { fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#0F172A' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(250px, 0.8fr)',
    gap: 18,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(226,232,240,0.95)',
    boxShadow: '0 18px 38px rgba(15, 23, 42, 0.06)',
  },
  cardAccent: {
    borderRadius: 24,
    padding: 20,
    background: 'linear-gradient(180deg, rgba(14,165,233,0.96), rgba(15,23,42,0.94))',
    color: '#FFFFFF',
    boxShadow: '0 18px 38px rgba(14, 165, 233, 0.2)',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 },
  cardTitle: { margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'inherit' },
  cardHint: { fontSize: 12, color: '#64748B' },
  bars: { display: 'flex', flexDirection: 'column', gap: 14 },
  barRow: { display: 'flex', flexDirection: 'column', gap: 8 },
  barTop: { display: 'flex', justifyContent: 'space-between', gap: 12 },
  barLabel: { fontSize: 13, fontWeight: 700, color: '#0F172A' },
  barValue: { fontSize: 13, color: '#475569', fontWeight: 700 },
  barTrack: { height: 10, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  accentText: { margin: '12px 0 0', lineHeight: 1.7, color: 'rgba(255,255,255,0.88)' },
}