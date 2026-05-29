import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAuthAction } from '../hooks/useAuthAction'
import { useTransactions } from '../context/TransactionContext'
import { useCategories } from '../context/CategoryContext'
import OnboardingModal from '../components/OnboardingModal'
import AIChatModal from '../components/AIChatModal'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const fallbackDashboard = {
  totalIncome: 48000,
  totalExpense: 24000,
  balance: 24000,
  savingsPct: 50,
  monthlyData: [
    { month: 'Feb', income: 40000, expense: 28000 },
    { month: 'Mar', income: 40000, expense: 31000 },
    { month: 'Apr', income: 45000, expense: 29000 },
    { month: 'May', income: 40000, expense: 35000 },
    { month: 'Jun', income: 48000, expense: 32000 },
    { month: 'Jul', income: 40000, expense: 24000 },
  ],
  categoryData: [
    { name: 'Rent', value: 10000, color: '#7C3AED', icon: '🏠' },
    { name: 'Food', value: 5500, color: '#0EA5E9', icon: '🍔' },
    { name: 'Travel', value: 3200, color: '#10B981', icon: '✈️' },
    { name: 'Shopping', value: 2800, color: '#F59E0B', icon: '🛍️' },
    { name: 'Others', value: 2500, color: '#EF4444', icon: '📦' },
  ],
  transactions: [
    { id: 1, title: 'Salary credited', category: 'Income', amount: 40000, type: 'income', date: 'Today, 9:00 AM', icon: '💼' },
    { id: 2, title: 'House rent', category: 'Rent', amount: 10000, type: 'expense', date: 'Today, 10:30 AM', icon: '🏠' },
    { id: 3, title: 'Grocery shopping', category: 'Food', amount: 1800, type: 'expense', date: 'Yesterday, 7:15 PM', icon: '🛒' },
    { id: 4, title: 'Freelance payment', category: 'Income', amount: 8000, type: 'income', date: 'Yesterday, 3:00 PM', icon: '💻' },
    { id: 5, title: 'Uber ride', category: 'Travel', amount: 320, type: 'expense', date: '25 Jul, 8:45 AM', icon: '🚗' },
    { id: 6, title: 'Netflix subscription', category: 'Shopping', amount: 199, type: 'expense', date: '24 Jul, 12:00 PM', icon: '🎬' },
  ],
  budgets: [
    { category: 'Rent', icon: '🏠', budget: 12000, spent: 10000, color: '#7C3AED' },
    { category: 'Food', icon: '🍔', budget: 7000, spent: 5500, color: '#0EA5E9' },
    { category: 'Travel', icon: '✈️', budget: 3000, spent: 3200, color: '#10B981' },
    { category: 'Shopping', icon: '🛍️', budget: 4000, spent: 2800, color: '#F59E0B' },
  ],
}

const categoryIconMap = {
  Rent: '🏠',
  Food: '🍔',
  Travel: '✈️',
  Shopping: '🛍️',
  Others: '📦',
  Income: '💼',
}

const colorPalette = ['#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6', '#F97316']

function formatCurrency(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return '₹0'
  return '₹' + num.toLocaleString('en-IN')
}

function pct(spent, budget) {
  return Math.min(Math.round((spent / budget) * 100), 100)
}

function toMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function buildMonthlyData(transactions) {
  const months = []
  const lookup = new Map()
  const current = new Date()

  for (let i = 5; i >= 0; i -= 1) {
    const monthDate = new Date(current.getFullYear(), current.getMonth() - i, 1)
    const bucket = {
      month: monthDate.toLocaleString('en-US', { month: 'short' }),
      income: 0,
      expense: 0,
    }
    months.push(bucket)
    lookup.set(toMonthKey(monthDate), bucket)
  }

  transactions.forEach((transaction) => {
    const date = new Date(transaction.dateOfTransaction)
    if (Number.isNaN(date.getTime())) return

    const bucket = lookup.get(toMonthKey(date))
    if (!bucket) return

    const amount = Number(transaction.amount || 0)
    if (transaction.type === 'income') {
      bucket.income += amount
    } else {
      bucket.expense += amount
    }
  })

  return months
}

function enrichTransaction(transaction, categories) {
  const category = categories.find((item) => String(item.id) === String(transaction.categoryId)) || {}
  const type = transaction.categoryType || category.categoryType || 'expense'

  return {
    id: transaction.id,
    title: category.categoryName || transaction.note || 'Transaction',
    category: category.categoryName || transaction.categoryName || '',
    amount: Number(transaction.amount || 0),
    type,
    date: transaction.dateOfTransaction
      ? new Date(transaction.dateOfTransaction).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Just now',
    icon: category.iconUrl || transaction.categoryIcon || (type === 'income' ? '💼' : '💸'),
  }
}

function buildCategoryData(transactions, categories) {
  const totals = new Map()

  transactions.forEach((transaction) => {
    const category = categories.find((item) => String(item.id) === String(transaction.categoryId)) || {}
    const type = transaction.categoryType || category.categoryType || 'expense'
    if (type !== 'expense') return

    const key = String(transaction.categoryId || category.categoryName || transaction.categoryName || 'Others')
    const current = totals.get(key) || {
      name: category.categoryName || transaction.categoryName || 'Others',
      value: 0,
      color: colorPalette[totals.size % colorPalette.length],
      icon: category.iconUrl || transaction.categoryIcon || categoryIconMap[category.categoryName] || '📦',
    }

    current.value += Number(transaction.amount || 0)
    totals.set(key, current)
  })

  return Array.from(totals.values()).slice(0, 5)
}

function buildBudgets(categories, transactions) {
  return categories
    .filter((category) => category.categoryType === 'expense' && Number(category.totalBudget || 0) > 0)
    .map((category, index) => {
      const spent = transactions
        .filter((transaction) => String(transaction.categoryId) === String(category.id))
        .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)

      return {
        category: category.categoryName,
        icon: category.iconUrl,
        budget: Number(category.totalBudget),
        spent,
        color: colorPalette[index % colorPalette.length],
      }
    })
}

function toNumber(value) {
  const normalized = Number(String(value ?? '').replace(/[^0-9.-]/g, ''))
  return Number.isFinite(normalized) ? normalized : 0
}

function buildBudgetSplitFromResponse(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null
  }

  const totals = rows.reduce(
    (acc, row) => {
      const budget = toNumber(
        row?.totalBudget ??
          row?.total_budget ??
          row?.budget ??
          row?.total ??
          row?.budgetAmount ??
          row?.budget_amount ??
          row?.budgetValue ??
          row?.SALARY_RECEIVED ??
          row?.salary_received,
      )
      const spent = toNumber(
        row?.totalSpent ??
          row?.total_spent ??
          row?.spent ??
          row?.expense ??
          row?.spentAmount ??
          row?.spent_amount ??
          row?.expenseSpent ??
          row?.expense_spent ??
          row?.SPENT,
      )
      const remainingFromRow =
        row?.remaining ??
        row?.remainingBudget ??
        row?.remaining_budget ??
        row?.remainingAmount ??
        row?.remaining_amount ??
        row?.REMAINING

      acc.totalBudget += budget
      acc.totalSpent += spent
      acc.remaining += Number.isFinite(Number(remainingFromRow)) ? toNumber(remainingFromRow) : budget - spent
      return acc
    },
    { totalBudget: 0, totalSpent: 0, remaining: 0 },
  )

  return totals
}

const fmt = (n) => formatCurrency(n)

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { transactions: rawTransactions, loading: transactionsLoading } = useTransactions()
  const { categories, loading: categoriesLoading } = useCategories()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [dashboard, setDashboard] = useState(fallbackDashboard)
  const [budgetSplit, setBudgetSplit] = useState({ totalBudget: 0, totalSpent: 0, remaining: 0 })

  // Create auth-protected action for adding transaction
  const handleAddTransaction = useAuthAction(() => {
    navigate('/transactions')
  })

  useEffect(() => {
    if (isAuthenticated) {
      setShowOnboarding(true)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) {
      setDashboard(fallbackDashboard)
      return
    }

    if (transactionsLoading || categoriesLoading) {
      setDashboard({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        savingsPct: 0,
        monthlyData: [],
        categoryData: [],
        transactions: [],
        budgets: [],
      })
      setBudgetSplit({ totalBudget: 0, totalSpent: 0, remaining: 0 })
      return
    }

    const enrichedTransactions = rawTransactions.map((transaction) => enrichTransaction(transaction, categories))
    const totalIncome = rawTransactions
      .filter((transaction) => (transaction.categoryType || categories.find((item) => String(item.id) === String(transaction.categoryId))?.categoryType) === 'income')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
    const totalExpense = rawTransactions
      .filter((transaction) => (transaction.categoryType || categories.find((item) => String(item.id) === String(transaction.categoryId))?.categoryType) !== 'income')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
    const balance = totalIncome - totalExpense
    const savingsPct = totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0
    const monthlyData = buildMonthlyData(enrichedTransactions)
    const categoryData = buildCategoryData(rawTransactions, categories)
    const budgets = buildBudgets(categories, rawTransactions)

    setDashboard({
      totalIncome,
      totalExpense,
      balance,
      savingsPct,
      monthlyData,
      categoryData,
      transactions: enrichedTransactions,
      budgets,
    })
  }, [isAuthenticated, rawTransactions, categories, transactionsLoading, categoriesLoading])

  useEffect(() => {
    if (!isAuthenticated) return

    let cancelled = false

    async function loadBudgetSplit() {
      try {
        const res = await fetch(`http://localhost:8083/budget-split`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        })

        if (!res.ok) {
          throw new Error('Failed to load budget split')
        }

        const data = await res.json()
        console.debug('budget-split payload', data)
        const source = data?.response ?? data?.data ?? data ?? []
        const apiTotals = buildBudgetSplitFromResponse(source)

        if (!apiTotals) {
          return
        }

        if (!cancelled) {
          setBudgetSplit(apiTotals)
        }
      } catch (error) {
        console.error('Budget-split load error', error)
      }
    }

    loadBudgetSplit()

    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const handleOnboardingCancel = () => {
    setShowOnboarding(false)
  }

  const handleOnboardingGoAhead = () => {
    // legacy handler (keeps backwards compatibility) — closes modal
    setShowOnboarding(false)
  }

  const handleOnboardingComplete = (result) => {
    // result may be { type: 'manual', data } or AI result object
    console.debug('Onboarding complete', result)
    setShowOnboarding(false)
  }

  const { totalIncome, totalExpense, balance, savingsPct, monthlyData, categoryData, budgets, transactions: dashboardTransactions } = dashboard
  const { totalBudget, totalSpent, remaining } = budgetSplit
  const isLoading = isAuthenticated && (transactionsLoading || categoriesLoading)
  const summaryBalance = isAuthenticated ? remaining : balance
  const summaryIncome = isAuthenticated ? totalBudget : totalIncome
  const selectedExpenseCategories = categories.filter((category) => category.categoryType === 'expense')
  const budgetRows = budgets.length > 0
    ? budgets
    : selectedExpenseCategories.map((category, index) => {
        const spent = Number(category.spent || 0)
        const budget = Number(category.totalBudget || 0)

        return {
          category: category.categoryName,
          icon: category.iconUrl,
          budget,
          spent,
          color: colorPalette[index % colorPalette.length],
        }
      })

  return (
    <div className='space-y-5 font-["DM_Sans","Segoe_UI",sans-serif] text-slate-800'>
      <OnboardingModal isOpen={showOnboarding} onClose={handleOnboardingCancel} onComplete={handleOnboardingComplete} />
      <AIChatModal isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
      <div className='flex items-start justify-between gap-4'>
        <div>
          <div className='text-[22px] font-bold tracking-[-0.04em] text-slate-900'>Dashboard</div>
          <div className='mt-1 text-sm text-slate-500'>{!isAuthenticated ? 'Preview mode' : isLoading ? 'Loading your data...' : 'Your financial overview'}</div>
        </div>
        <div className='flex flex-col items-end gap-2'>
          <button onClick={handleAddTransaction} className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700'>+ Add transaction</button>
          <button onClick={() => setShowAIChat(true)} className='rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-50'>Open AI chat</button>
          <div className='grid h-10 w-10 place-items-center rounded-lg bg-white text-lg shadow-sm ring-1 ring-slate-200'>🔔</div>
        </div>
      </div>

      {/* Summary cards */}
      <div className='grid gap-4 lg:grid-cols-4'>
        {[
          { label: 'Total balance', value: summaryBalance, sub: 'Income − Expenses', color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Total income', value: summaryIncome, sub: 'Money in', color: '#10B981', bg: '#F0FDF4' },
        ].map((c) => (
          <div key={c.label} className='rounded-xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]' style={{ background: c.bg }}>
            <div className='mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500' style={{ color: c.color }}>{c.label}</div>
            <div className='text-[1.6rem] font-bold tracking-[-0.04em]' style={{ color: c.color }}>{typeof c.value === 'number' ? fmt(c.value) : c.value}</div>
            <div className='mt-1 text-xs text-slate-500'>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Mid row: chart + donut */}
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]'>
        {/* Area chart */}
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'>
          <div className='mb-4 flex items-baseline justify-between gap-3'>
            <div className='text-[1.05rem] font-extrabold text-slate-900'>Income vs Expenses</div>
            <div className='text-sm text-slate-500'>Last 6 months</div>
          </div>
          <ResponsiveContainer width='100%' height={200}>
            <AreaChart data={monthlyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id='gIncome' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='10%' stopColor='#7C3AED' stopOpacity={0.25} />
                  <stop offset='95%' stopColor='#7C3AED' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='gExpense' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='10%' stopColor='#EF4444' stopOpacity={0.2} />
                  <stop offset='95%' stopColor='#EF4444' stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey='month' tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => '₹' + v / 1000 + 'k'} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB' }} />
              <Area type='monotone' dataKey='income' stroke='#7C3AED' strokeWidth={2} fill='url(#gIncome)' dot={false} />
              <Area type='monotone' dataKey='expense' stroke='#EF4444' strokeWidth={2} fill='url(#gExpense)' dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <div className='mt-3 flex items-center gap-3 text-sm text-slate-600'>
            <span className='inline-block h-2.5 w-2.5 rounded-full bg-indigo-600' /> Income
            <span className='ml-3 inline-block h-2.5 w-2.5 rounded-full bg-red-500' /> Expense
          </div>
        </div>

        {/* Donut */}
        <div className='min-w-55 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'>
          <div className='mb-4 flex items-baseline justify-between gap-3'>
            <div className='text-[1.05rem] font-extrabold text-slate-900'>Spending split</div>
            <div className='text-sm text-slate-500'>This month</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PieChart width={160} height={160}>
              <Pie data={categoryData} cx={75} cy={75} innerRadius={48} outerRadius={72} paddingAngle={3} dataKey='value' startAngle={90} endAngle={-270}>
                {categoryData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} stroke='none' />
                ))}
              </Pie>
            </PieChart>
          </div>
          <div className='mt-3 space-y-3'>
            {categoryData.map((c) => (
              <div key={c.name} className='flex items-center justify-between gap-3 text-sm'>
                <span className='flex items-center gap-2 text-slate-700'>
                  <span className='h-2.5 w-2.5 rounded-full' style={{ background: c.color }} />
                  {c.icon} {c.name}
                </span>
                <span className='font-semibold text-slate-600'>{fmt(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: transactions + budgets */}
      <div className='grid gap-4 lg:grid-cols-2'>
        {/* All transactions */}
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'>
          <div className='mb-4 flex items-baseline justify-between gap-3'>
            <div className='text-[1.05rem] font-extrabold text-slate-900'>All transactions</div>
            <button onClick={() => navigate('/transactions')} className='text-sm font-semibold text-indigo-600 transition hover:text-indigo-700'>View all →</button>
          </div>
          <div className='max-h-115 overflow-y-auto pr-1'>
            {dashboardTransactions.map((t) => (
              <div key={t.id} className='flex items-center gap-3 border-b border-slate-200 py-4 last:border-b-0'>
                <div className='grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-lg'>{t.icon}</div>
                <div className='min-w-0 flex-1'>
                  <div className='truncate text-sm font-bold text-slate-900'>{t.title}</div>
                  <div className='mt-1 text-xs text-slate-500'>{t.date}</div>
                </div>
                <div className='whitespace-nowrap text-sm font-extrabold' style={{ color: t.type === 'income' ? '#10B981' : '#EF4444' }}>
                  {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget tracker */}
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'>
          <div className='mb-4 flex items-baseline justify-between gap-3'>
            <div className='text-[1.05rem] font-extrabold text-slate-900'>Budget tracker</div>
            <button className='text-sm font-semibold text-indigo-600 transition hover:text-indigo-700'>Manage →</button>
          </div>
          <div className='grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-slate-50'>
            <div className='p-4 text-center'>
              <div className='text-xs font-semibold uppercase tracking-[0.08em] text-slate-500'>Total budget</div>
                <div className='mt-1 text-lg font-bold text-emerald-600'>{fmt(totalBudget)}</div>
            </div>
            <div className='p-4 text-center'>
            <div className='text-xs font-semibold uppercase tracking-[0.08em] text-slate-500'>Spent till now</div>
              <div className='mt-1 text-lg font-bold text-red-500'>{fmt(totalSpent)}</div>
            </div>
            <div className='p-4 text-center'>
            <div className='text-xs font-semibold uppercase tracking-[0.08em] text-slate-500'>Remaining</div>
              <div className='mt-1 text-lg font-bold text-indigo-600'>{fmt(remaining)}</div>
            </div>
          </div>
          <div className='mt-4 space-y-4'>
            {budgetRows.map((b) => {
              const p = pct(b.spent, b.budget)
              const over = b.spent > b.budget
              return (
                <div key={b.category} className='space-y-2'>
                  <div className='flex items-center justify-between gap-3'>
                    <span className='text-sm font-semibold text-slate-800'>
                      {b.icon} {b.category}
                    </span>
                    <span className='text-sm font-semibold' style={{ color: over ? '#EF4444' : '#6B7280' }}>
                      {fmt(b.spent)} / {fmt(b.budget)}
                    </span>
                  </div>
                  <div className='h-2 overflow-hidden rounded-full bg-slate-200'>
                    <div className='h-full rounded-full' style={{ width: p + '%', background: over ? '#EF4444' : p > 75 ? '#F59E0B' : b.color }} />
                  </div>
                  <div className='text-xs font-medium' style={{ color: over ? '#EF4444' : '#9CA3AF' }}>
                    {over ? `⚠ Over by ${fmt(b.spent - b.budget)}` : `${fmt(b.budget - b.spent)} remaining`}
                  </div>
                </div>
              )
            })}
            {budgetRows.length === 0 && (
              <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500'>
                No categories selected yet.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}