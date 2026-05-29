import { useEffect, useRef, useState } from 'react'
import { useCategories } from '../context/CategoryContext'
import { useAuth } from '../context/AuthContext'
import { useAuthAction } from '../hooks/useAuthAction'
import toast from 'react-hot-toast'
import EmojiPicker from 'emoji-picker-react'
import { colors } from '../theme/colors.js'

const initialForm = {
  categoryName: '',
  categoryDescription: '',
  categoryType: '',
  receivedAmount: '',
  totalBudget: '',
  spent: '',
}

const fallbackCategories = [
  {
    id: 'preview-1',
    categoryName: 'Rent',
    categoryDescription: 'Monthly home rent',
    categoryType: 'expense',
    iconUrl: '🏠',
    totalBudget: '12000',
    spent: '10000',
    remaining: '2000',
  },
  {
    id: 'preview-2',
    categoryName: 'Salary',
    categoryDescription: 'Main monthly income',
    categoryType: 'income',
    iconUrl: '💼',
    receivedAmount: '45000',
  },
  {
    id: 'preview-3',
    categoryName: 'Food',
    categoryDescription: 'Groceries and dining',
    categoryType: 'expense',
    iconUrl: '🍔',
    totalBudget: '7000',
    spent: '5200',
    remaining: '1800',
  },
]

function getCategoryAmountFields(category) {
  const totalBudget = category?.totalBudget ?? category?.budget ?? ''
  const spent = category?.spent ?? category?.expenseSpent ?? ''
  const remaining = computeRemaining(totalBudget, spent)

  return {
    receivedAmount: category?.receivedAmount ?? category?.incomeAmount ?? category?.amount ?? '',
    totalBudget,
    spent,
    remaining,
  }
}

function computeRemaining(totalBudget, spent) {
  const budgetValue = Number(totalBudget)
  const spentValue = Number(spent)

  if (!Number.isFinite(budgetValue) || !Number.isFinite(spentValue)) {
    return ''
  }

  return String(budgetValue - spentValue)
}

function typeBadgeStyle(type) {
  if (type === 'income') {
    return {
      border: `1px solid ${colors.income}`,
      backgroundColor: `${colors.income}1A`,
      color: colors.income,
    }
  }

  return {
    border: `1px solid ${colors.expense}`,
    backgroundColor: `${colors.expense}1A`,
    color: colors.expense,
  }
}

export default function CategoriesPage() {
  const [formData, setFormData] = useState(initialForm)
  const { categories, setCategories, loading } = useCategories()
  const { isAuthenticated } = useAuth()
  const [icon, setIcon] = useState('')
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editForm, setEditForm] = useState({
    categoryName: '',
    categoryDescription: '',
    categoryType: '',
    iconUrl: '',
    receivedAmount: '',
    totalBudget: '',
    spent: '',
  })
  const pickerWrapperRef = useRef(null)
  const displayCategories = isAuthenticated ? categories : fallbackCategories

  // Create auth-protected submit functions
  const submitCategory = useAuthAction(() => {
    const categoryName = formData.categoryName.trim()
    const categoryDescription = formData.categoryDescription.trim()

    // Validation inside the protected function
    if (!categoryName) {
      toast.error('Category name is required.')
      return
    }

    if (!formData.categoryType) {
      toast.error('Please select a category type.')
      return
    }

    if (!icon) {
      toast.error('Please select a category icon.')
      return
    }

    const amountPayload = buildAmountPayload(formData)

    if (formData.categoryType === 'income' && !amountPayload.receivedAmount) {
      toast.error('Received amount is required for income categories.')
      return
    }

    if (formData.categoryType === 'expense') {
      if (!amountPayload.totalBudget) {
        toast.error('Total budget is required for expense categories.')
        return
      }

      if (!amountPayload.spent) {
        toast.error('Spent amount is required for expense categories.')
        return
      }
    }

    const nextCategory = {
      iconUrl: icon,
      categoryName,
      categoryDescription,
      categoryType: formData.categoryType,
      ...amountPayload,
    }

    fetch('http://localhost:8083/add-category', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(nextCategory),
    })
      .then((resposne) => {
        if (!resposne.ok) {
          throw new Error('failed to add category')
        }
        return resposne.json()
      })
      .then((data) => {
        console.log('Category added successfully:', data)
        toast.success('Category added successfully')
        // Normalize saved category and update global state
        const raw = Array.isArray(data) ? data : data?.categories ?? data?.response ?? data?.data ?? data
        const saved = Array.isArray(raw) ? raw[0] : raw
        const savedCategory = {
          id: String(saved?.categoryId ?? saved?.id ?? saved?.category_id ?? Math.random()),
          categoryName: saved?.categoryName ?? saved?.name ?? nextCategory.categoryName,
          categoryDescription: saved?.categoryDescription ?? saved?.description ?? nextCategory.categoryDescription,
          categoryType: saved?.categoryType ?? saved?.type ?? nextCategory.categoryType,
          iconUrl: saved?.iconUrl ?? saved?.icon ?? saved?.emoji ?? nextCategory.iconUrl,
          receivedAmount: saved?.receivedAmount ?? saved?.incomeAmount ?? nextCategory.receivedAmount ?? '',
          totalBudget: saved?.totalBudget ?? saved?.budget ?? nextCategory.totalBudget ?? '',
          spent: saved?.spent ?? saved?.expenseSpent ?? nextCategory.spent ?? '',
          remaining: (() => {
            const b = Number(saved?.totalBudget ?? nextCategory.totalBudget ?? 0)
            const s = Number(saved?.spent ?? nextCategory.spent ?? 0)
            if (!Number.isFinite(b) || !Number.isFinite(s)) return ''
            return String(b - s)
          })(),
          _raw: saved,
        }

        setCategories((current) => [savedCategory, ...current])
        setFormData(initialForm)
        setIcon('')
        setIsPickerOpen(false)
      })
      .catch((error) => {
        console.error('Error adding category:', error)
        toast.error('Failed to add category')
      })
  })

  // Create a factory function for update operations (since it needs categoryId)
  const createUpdateCategoryHandler = (categoryId, updatedForm) => {
    return useAuthAction(() => {
      const nextName = updatedForm.categoryName.trim()
      if (!nextName) {
        toast.error('Category name is required.')
        return
      }
      if (!updatedForm.categoryType) {
        toast.error('Please select a category type.')
        return
      }

      const amountPayload = buildAmountPayload(updatedForm)

      if (updatedForm.categoryType === 'income' && !amountPayload.receivedAmount) {
        toast.error('Received amount is required for income categories.')
        return
      }

      if (updatedForm.categoryType === 'expense') {
        if (!amountPayload.totalBudget) {
          toast.error('Total budget is required for expense categories.')
          return
        }

        if (!amountPayload.spent) {
          toast.error('Spent amount is required for expense categories.')
          return
        }
      }

      const updatedCategory = {
        categoryName: nextName,
        categoryDescription: updatedForm.categoryDescription.trim(),
        categoryType: updatedForm.categoryType,
        iconUrl: updatedForm.iconUrl.trim() || '',
        ...amountPayload,
      }

      fetch('http://localhost:8083/update-category', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ categoryId, ...updatedCategory }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('failed to update category')
          }
          return response.json()
        })
        .then((data) => {
          toast.success('Category updated')
          // Update the categories state
          setCategories((current) =>
            current.map((cat) =>
              String(cat.id) === String(categoryId)
                ? {
                    ...cat,
                    categoryName: updatedCategory.categoryName,
                    categoryDescription: updatedCategory.categoryDescription,
                    categoryType: updatedCategory.categoryType,
                    iconUrl: updatedCategory.iconUrl,
                    receivedAmount: updatedCategory.receivedAmount,
                    totalBudget: updatedCategory.totalBudget,
                    spent: updatedCategory.spent,
                    remaining: computeRemaining(updatedCategory.totalBudget, updatedCategory.spent),
                  }
                : cat,
            ),
          )
          setEditingCategoryId(null)
          setEditForm({
            categoryName: '',
            categoryDescription: '',
            categoryType: '',
            iconUrl: '',
            receivedAmount: '',
            totalBudget: '',
            spent: '',
          })
          toast.success('Category updated successfully')
        })
        .catch((error) => {
          console.error('Error updating category:', error)
          toast.error('Failed to update category')
        })
    })
  }

  useEffect(() => {
    function handleOutsideClick(event) {
      if (pickerWrapperRef.current && !pickerWrapperRef.current.contains(event.target)) {
        setIsPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
     
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleCategoryTypeChange(type) {
    setFormData((current) => ({
      ...current,
      categoryType: type,
      receivedAmount: type === 'income' ? current.receivedAmount : '',
      totalBudget: type === 'expense' ? current.totalBudget : '',
      spent: type === 'expense' ? current.spent : '',
    }))
  }

  function handleEditClick(category) {
    setEditingCategoryId(category.id)
    setEditForm({
      categoryName: category.categoryName ?? '',
      categoryDescription: category.categoryDescription ?? '',
      categoryType: category.categoryType ?? '',
      iconUrl: category.iconUrl ?? '',
      ...getCategoryAmountFields(category),
    })
  }

  function handleEditChange(event) {
    const { name, value } = event.target
    setEditForm((current) => ({ ...current, [name]: value }))
  }

  function handleCancelEdit() {
    setEditingCategoryId(null)
    setEditForm({
      categoryName: '',
      categoryDescription: '',
      categoryType: '',
      iconUrl: '',
      receivedAmount: '',
      totalBudget: '',
      spent: '',
    })
  }

  function buildAmountPayload(source) {
    if (source.categoryType === 'income') {
      return {
        receivedAmount: source.receivedAmount.trim(),
        totalBudget: '',
        spent: '',
        remaining: '',
      }
    }

    const totalBudget = source.totalBudget.trim()
    const spent = source.spent.trim()
    const remaining = computeRemaining(totalBudget, spent)

    return {
      receivedAmount: '',
      totalBudget,
      spent,
      remaining,
    }
  }

  function handleSaveChanges(categoryId) {
    const protectedUpdate = createUpdateCategoryHandler(categoryId, editForm)
    protectedUpdate()
  }



  function handleSubmit(event) {
    event.preventDefault()
    submitCategory()
  }

  return (
    <main className='font-["DM_Sans","Segoe_UI",sans-serif] text-slate-800'>
      <div className='mx-auto max-w-4xl space-y-6'>
        <header>
          <p className='inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700'>
            Spendwise
          </p>
          <h1 className='mt-3 text-3xl font-bold text-slate-900'>
            Categories
          </h1>
          <p className='mt-2 text-sm text-slate-500'>
            Create a category with name, description, and type.
          </p>
        </header>

          {/* ── Category Cards Row ── */}
          <section className='w-full'>
            <div className='flex gap-4 overflow-x-auto pb-2'>
              {displayCategories.map((category) => (
                <div
                  key={category.id}
                  className={`flex min-w-55 shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                    editingCategoryId === category.id ? 'scale-[1.02] ring-2 ring-sky-200' : ''
                  }`}
                >
                  {/* Top — name + type badge */}
                  <div className='flex items-start justify-between gap-2'>
                    <p className='truncate text-sm font-bold text-slate-900'>
                      {category.iconUrl} {category.categoryName}
                    </p>
                    <div className='flex shrink-0 items-center gap-2'>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          category.categoryType === 'income'
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-600'
                            : 'border border-red-200 bg-red-50 text-red-500'
                        }`}
                      >
                        {category.categoryType}
                      </span>
                      <button
                        type='button'
                        onClick={() => handleEditClick(category)}
                        className='rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50'
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <hr className='border-slate-200' />

                  {editingCategoryId === category.id ? (
                    <div className='flex flex-col gap-3'>
                      <label className='block space-y-1.5'>
                        <span className='text-xs font-medium text-slate-500'>Category Name</span>
                        <input
                          type='text'
                          name='categoryName'
                          value={editForm.categoryName}
                          onChange={handleEditChange}
                          className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                        />
                      </label>

                      <label className='block space-y-1.5'>
                        <span className='text-xs font-medium text-slate-500'>Category Description</span>
                        <textarea
                          name='categoryDescription'
                          rows='3'
                          value={editForm.categoryDescription}
                          onChange={handleEditChange}
                          className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                        />
                      </label>

                      <label className='block space-y-1.5'>
                        <span className='text-xs font-medium text-slate-500'>Category Type</span>
                        <select
                          name='categoryType'
                          value={editForm.categoryType}
                          onChange={handleEditChange}
                          className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                        >
                          <option value='expense'>expense</option>
                          <option value='income'>income</option>
                        </select>
                      </label>

                      <label className='block space-y-1.5'>
                        <span className='text-xs font-medium text-slate-500'>Category Icon</span>
                        <input
                          type='text'
                          name='iconUrl'
                          value={editForm.iconUrl}
                          onChange={handleEditChange}
                          placeholder='🙂'
                          className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                        />
                      </label>

                      {editForm.categoryType === 'income' && (
                        <label className='block space-y-1.5'>
                          <span className='text-xs font-medium text-slate-500'>Received Amount</span>
                          <input
                            type='number'
                            name='receivedAmount'
                            value={editForm.receivedAmount}
                            onChange={handleEditChange}
                            className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                          />
                        </label>
                      )}

                      {editForm.categoryType === 'expense' && (
                        <div className='space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3'>
                          <label className='block space-y-1.5'>
                            <span className='text-xs font-medium text-slate-500'>Total Budget</span>
                            <input
                              type='number'
                              name='totalBudget'
                              value={editForm.totalBudget}
                              onChange={handleEditChange}
                              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                            />
                          </label>

                          <label className='block space-y-1.5'>
                            <span className='text-xs font-medium text-slate-500'>Spent</span>
                            <input
                              type='number'
                              name='spent'
                              value={editForm.spent}
                              onChange={handleEditChange}
                              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                            />
                          </label>

                          <label className='block space-y-1.5'>
                            <span className='text-xs font-medium text-slate-500'>Remaining</span>
                            <input
                              type='text'
                              value={computeRemaining(editForm.totalBudget, editForm.spent)}
                              readOnly
                              className='w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-800 outline-none'
                            />
                          </label>
                        </div>
                      )}

                      <div className='flex gap-2'>
                        <button
                          type='button'
                          onClick={() => handleSaveChanges(category.id)}
                          className='flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700'
                        >
                          Save Changes
                        </button>
                        <button
                          type='button'
                          onClick={handleCancelEdit}
                          className='flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50'
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Budget rows */}
                  {editingCategoryId === category.id ? null : (
                    <div className='flex flex-col gap-1.5'>
                      {category.categoryType === 'income' ? (
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-slate-500'>Received Amount</span>
                          <span className='text-xs font-bold text-emerald-500'>₹{category.receivedAmount || 0}</span>
                        </div>
                      ) : (
                        <>
                          <div className='flex items-center justify-between'>
                            <span className='text-xs text-slate-500'>Total Budget</span>
                            <span className='text-xs font-bold text-gray-900'>₹{category.totalBudget || 0}</span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-xs text-slate-500'>Spent</span>
                            <span className='text-xs font-bold text-red-500'>₹{category.spent || 0}</span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <span className='text-xs text-slate-500'>Remaining</span>
                            <span className='text-xs font-bold text-emerald-500'>₹{category.remaining || 0}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>
              ))}
            </div>
          </section>

        <section
          className='rounded-2xl p-5 shadow-sm sm:p-6'
          style={{
            border: `1px solid ${colors.primaryBorder}`,
            backgroundColor: colors.cardBg,
          }}
        >
          <h2 className='text-lg font-semibold' style={{ color: colors.textPrimary }}>
            Add Category
          </h2>

          <form className='mt-4 space-y-4' onSubmit={handleSubmit}>
            <label className='block space-y-2'>
              <span className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                Category Name
              </span>
              <input
                type='text'
                name='categoryName'
                value={formData.categoryName}
                onChange={handleChange}
                placeholder='e.g. Groceries'
                className='w-full rounded-xl px-3 py-2.5 text-sm outline-none transition focus:ring-2'
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                }}
              />
            </label>

            <label className='block space-y-2'>
              <span className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                Category Description
              </span>
              <textarea
                name='categoryDescription'
                rows='3'
                value={formData.categoryDescription}
                onChange={handleChange}
                placeholder='Describe what this category will track'
                className='w-full rounded-xl px-3 py-2.5 text-sm outline-none transition focus:ring-2'
                style={{
                  border: `1px solid ${colors.border}`,
                  color: colors.textPrimary,
                }}
              />
            </label>

            <div className='block space-y-2'>
              <span className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                Category Type
              </span>
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => handleCategoryTypeChange('income')}
                  className='flex-1 rounded-xl py-2.5 text-sm font-semibold transition'
                  style={{
                    border:
                      formData.categoryType === 'income'
                        ? `2px solid ${colors.income}`
                        : `1px solid ${colors.border}`,
                    backgroundColor:
                      formData.categoryType === 'income' ? `${colors.income}1A` : colors.cardBg,
                    color: formData.categoryType === 'income' ? colors.income : colors.textSecondary,
                  }}
                >
                  + Income
                </button>

                <button
                  type='button'
                  onClick={() => handleCategoryTypeChange('expense')}
                  className='flex-1 rounded-xl py-2.5 text-sm font-semibold transition'
                  style={{
                    border:
                      formData.categoryType === 'expense'
                        ? `2px solid ${colors.expense}`
                        : `1px solid ${colors.border}`,
                    backgroundColor:
                      formData.categoryType === 'expense' ? `${colors.expense}1A` : colors.cardBg,
                    color: formData.categoryType === 'expense' ? colors.expense : colors.textSecondary,
                  }}
                >
                  − Expense
                </button>
              </div>
            </div>

            {formData.categoryType === 'income' && (
              <label className='block space-y-2'>
                <span className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                  Received Amount
                </span>
                <input
                  type='number'
                  name='receivedAmount'
                  value={formData.receivedAmount}
                  onChange={handleChange}
                  placeholder='e.g. 40000'
                  className='w-full rounded-xl px-3 py-2.5 text-sm outline-none transition focus:ring-2'
                  style={{
                    border: `1px solid ${colors.border}`,
                    color: colors.textPrimary,
                  }}
                />
              </label>
            )}

            {formData.categoryType === 'expense' && (
              <div
                className='space-y-4 rounded-2xl border p-4'
                style={{ borderColor: colors.primaryBorder, backgroundColor: colors.primaryLight }}
              >
                <label className='block space-y-2'>
                  <span className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                    Total Budget
                  </span>
                  <input
                    type='number'
                    name='totalBudget'
                    value={formData.totalBudget}
                    onChange={handleChange}
                    placeholder='e.g. 12000'
                    className='w-full rounded-xl px-3 py-2.5 text-sm outline-none transition focus:ring-2'
                    style={{
                      border: `1px solid ${colors.border}`,
                      color: colors.textPrimary,
                    }}
                  />
                </label>

                <label className='block space-y-2'>
                  <span className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                    Spent
                  </span>
                  <input
                    type='number'
                    name='spent'
                    value={formData.spent}
                    onChange={handleChange}
                    placeholder='e.g. 8000'
                    className='w-full rounded-xl px-3 py-2.5 text-sm outline-none transition focus:ring-2'
                    style={{
                      border: `1px solid ${colors.border}`,
                      color: colors.textPrimary,
                    }}
                  />
                </label>

                <label className='block space-y-2'>
                  <span className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                    Remaining
                  </span>
                  <input
                    type='text'
                    value={computeRemaining(formData.totalBudget, formData.spent)}
                    readOnly
                    placeholder='Calculated automatically'
                    className='w-full cursor-not-allowed rounded-xl px-3 py-2.5 text-sm outline-none transition focus:ring-2'
                    style={{
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.primaryLight,
                      color: colors.textPrimary,
                    }}
                  />
                </label>
              </div>
            )}

            <div className='block space-y-2'>
              <span className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                Category Icon
              </span>
              <div className='relative inline-block' ref={pickerWrapperRef}>
                <button
                  type='button'
                  onClick={() => setIsPickerOpen((current) => !current)}
                  className='flex min-h-11 min-w-24 items-center justify-center rounded-xl px-4 py-2.5 text-xl font-semibold transition'
                  style={{
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.primaryLight,
                    color: colors.primaryDarkText,
                  }}
                >
                  {icon ? icon : <span style={{ fontSize: 14, color: colors.textMuted }}>Pick icon</span>}
                </button>

                {isPickerOpen && (
                  <div
                    className='absolute left-0 top-full z-20 mt-2 rounded-2xl shadow-lg'
                    style={{
                      border: `1px solid ${colors.primaryBorder}`,
                      backgroundColor: colors.cardBg,
                    }}
                  >
                    <EmojiPicker
                      onEmojiClick={(emojiData) => {
                        setIcon(emojiData.emoji)
                        setIsPickerOpen(false)
                      }}
                      searchDisabled={false}
                      height={360}
                      width={320}
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type='submit'
              className='w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition'
              style={{ backgroundColor: colors.primary }}
            >
              Add Category
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}