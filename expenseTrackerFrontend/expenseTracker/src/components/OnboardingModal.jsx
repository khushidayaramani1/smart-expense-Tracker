import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const PRIMARY = '#7C3AED'
const PRIMARY_LIGHT = '#F5F3FF'
const INCOME_GREEN = '#10B981'
const BORDER = '#EDE9FE'
const TEXT_PRIMARY = '#111827'
const TEXT_SECONDARY = '#6B7280'

export default function OnboardingModal({ isOpen, onClose, onComplete }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    setupChoice: '',
    aiAnswers: {
      fixedExpenses: '',
      food: '',
      travel: '',
      currentSavings: '',
      savingsGoal: '',
      otherExpenses: '',
    },
  })

  const [aiResult, setAiResult] = useState(null)
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  
  function markCompleted() {
    try {
      localStorage.setItem('onboardingCompleted', 'true')
    } catch (e) {}
    console.log('Onboarding completed')
  }

  function markIgnored() {
    try {
      localStorage.setItem('onboardingCompleted', 'ignored')
    } catch (e) {}
    console.log('Onboarding ignored/skipped')
  }

  function handleClose() {
    markIgnored()
    onClose && onClose()
  }
  useEffect(() => {
    if (!isOpen) {
      // reset minimal state when closed
      setStep(1)
      setAiResult(null)
      setIsLoadingAi(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const predictedTotal = formData.setupChoice === 'ai' ? 4 : 2

  function updateAiAnswer(field, value) {
    setFormData((p) => ({ ...p, aiAnswers: { ...p.aiAnswers, [field]: value } }))
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1))
  }

  async function handleContinue() {
    // Step 1 validation
    if (step === 1) {
      const val = Number(formData.monthlyIncome)
      if (!val || val <= 0) {
        toast.error('Please enter a valid monthly income')
        return
      }
      setStep(2)
      return
    }

    // Step 2 validation and branching
    if (step === 2) {
      if (!formData.setupChoice) {
        toast.error('Please choose a setup option')
        return
      }

      if (formData.setupChoice === 'manual') {
        try {
          markCompleted()
          onComplete && onComplete({ type: 'manual', data: formData })
        } catch (e) {}
        onClose && onClose()
        return
      }

      // ai path
      setStep(3)
      return
    }

    // Step 3: validate and call AI
    if (step === 3) {
      const { fixedExpenses, savingsGoal } = formData.aiAnswers
      if (!fixedExpenses || !savingsGoal) {
        toast.error('Please fill required fields')
        return
      }

      // move to step 4 and call AI
      setStep(4)
      setIsLoadingAi(true)

      try {
        const payload = {
          monthlyIncome: formData.monthlyIncome,
          fixedExpenses: formData.aiAnswers.fixedExpenses,
          foodSpending: formData.aiAnswers.food,
          travelSpending: formData.aiAnswers.travel,
          currentSavings: formData.aiAnswers.currentSavings,
          savingsGoal: formData.aiAnswers.savingsGoal,
          otherExpenses: formData.aiAnswers.otherExpenses,
        }

        const res = await fetch('http://localhost:8083/api/onboarding/ai-suggest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(payload),
        })

        if (!res.ok) throw new Error('AI request failed')
        const data = await res.json()

        // expected shape (adapt if backend differs)
        setAiResult(data)
      } catch (err) {
        console.error(err)
        toast.error('Failed to get AI suggestion')
      } finally {
        setIsLoadingAi(false)
      }

      return
    }
  }

  function handleFinishWithAi() {
    if (!aiResult) return
    try {
      markCompleted()
      onComplete && onComplete(aiResult)
    } catch (e) {}
    onClose && onClose()
  }

  function handleAdjustManually() {
    markIgnored()
    onClose && onClose()
    navigate('/categories')
  }

  const progressPct = Math.round((step / predictedTotal) * 100)

  return (
    <div className='fixed inset-0 flex items-center justify-center px-4' style={{ zIndex: 9998 }}>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' style={{ zIndex: 9998 }} onClick={handleClose} />

      <div
        role='dialog'
        aria-modal='true'
        className='relative flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl'
        style={{ zIndex: 9999, maxHeight: '90vh', border: '1px solid #EDE9FE' }}
      >
        <div className='flex items-center justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-100' style={{ flexShrink: 0 }}>
          <div className='flex-1'>
            <div className='mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400'>Step {Math.min(step, predictedTotal)} of {predictedTotal}</div>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-100'>
              <div
                className='h-1.5 rounded-full transition-all duration-500 ease-out'
                style={{ width: `${progressPct}%`, backgroundColor: '#7C3AED' }}
              />
            </div>
          </div>

          <button
            onClick={handleClose}
            className='flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition'
            style={{ flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        <div
          key={step}
          className='flex-1 overflow-y-auto px-6 py-5 transition-all duration-300'
          style={{ animation: 'fadeSlideIn 0.25s ease forwards' }}
        >
          {step === 1 && (
            <div>
              <h3 className='text-xl font-bold text-slate-900'>What is your monthly income?</h3>
              <p className='mt-2 text-sm text-slate-500'>This helps us understand your financial baseline</p>

              <div className='mt-4 w-full'>
                <label className='relative block w-full'>
                  <span className='absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-700'>₹</span>
                  <input
                    inputMode='numeric'
                    value={formData.monthlyIncome}
                    onChange={(e) => setFormData((p) => ({ ...p, monthlyIncome: e.target.value }))}
                    placeholder='e.g. 40000'
                    className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className='text-xl font-bold text-slate-900'>How would you like to set up your budget?</h3>
              <p className='mt-2 text-sm text-slate-500'>Choose how you want to plan your monthly spending</p>

              <div className='mt-5 grid gap-4 sm:grid-cols-2'>
                <button
                  type='button'
                  onClick={() => setFormData((p) => ({ ...p, setupChoice: 'ai' }))}
                  className='flex cursor-pointer flex-col gap-2 rounded-xl border-2 px-5 py-5 text-left transition hover:shadow-md'
                  style={
                    formData.setupChoice === 'ai'
                      ? { borderColor: PRIMARY, backgroundColor: PRIMARY_LIGHT }
                      : { borderColor: BORDER }
                  }
                >
                  <div className='text-lg'>🤖 Help me with AI</div>
                  <div className='mt-1 text-sm text-slate-600'>Answer a few questions and AI will suggest your budget split</div>
                </button>

                <button
                  type='button'
                  onClick={() => setFormData((p) => ({ ...p, setupChoice: 'manual' }))}
                  className='flex cursor-pointer flex-col gap-2 rounded-xl border-2 px-5 py-5 text-left transition hover:shadow-md'
                  style={
                    formData.setupChoice === 'manual'
                      ? { borderColor: PRIMARY, backgroundColor: PRIMARY_LIGHT }
                      : { borderColor: BORDER }
                  }
                >
                  <div className='text-lg'>✋ I'll do it myself</div>
                  <div className='mt-1 text-sm text-slate-600'>Skip this and set up budgets manually from the Categories page</div>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className='text-xl font-bold text-slate-900'>Tell us about your spending</h3>
              <p className='mt-2 text-sm text-slate-500'>Answer these questions so AI can suggest the right budget for you</p>

              <div className='mt-4 grid gap-3'>
                <label className='block'>
                  <div className='text-sm font-semibold text-slate-700'>Fixed monthly expenses</div>
                  <input
                    value={formData.aiAnswers.fixedExpenses}
                    onChange={(e) => updateAiAnswer('fixedExpenses', e.target.value)}
                    placeholder='e.g. Rent ₹12,000, Netflix ₹199, EMI ₹5,000'
                    className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  />
                </label>

                <label className='block'>
                  <div className='text-sm font-semibold text-slate-700'>Food and dining</div>
                  <input
                    value={formData.aiAnswers.food}
                    onChange={(e) => updateAiAnswer('food', e.target.value)}
                    placeholder='e.g. Around ₹5,000 per month'
                    className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  />
                </label>

                <label className='block'>
                  <div className='text-sm font-semibold text-slate-700'>Travel and commute</div>
                  <input
                    value={formData.aiAnswers.travel}
                    onChange={(e) => updateAiAnswer('travel', e.target.value)}
                    placeholder='e.g. Uber ₹2,000, petrol ₹1,500'
                    className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  />
                </label>

                <label className='block'>
                  <div className='text-sm font-semibold text-slate-700'>Current monthly savings</div>
                  <input
                    value={formData.aiAnswers.currentSavings}
                    onChange={(e) => updateAiAnswer('currentSavings', e.target.value)}
                    placeholder='e.g. I save around ₹8,000'
                    className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  />
                </label>

                <label className='block'>
                  <div className='text-sm font-semibold text-slate-700'>Savings goal</div>
                  <input
                    value={formData.aiAnswers.savingsGoal}
                    onChange={(e) => updateAiAnswer('savingsGoal', e.target.value)}
                    placeholder='e.g. I want to save at least ₹12,000'
                    className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  />
                </label>

                <label className='block'>
                  <div className='text-sm font-semibold text-slate-700'>Other expenses</div>
                  <input
                    value={formData.aiAnswers.otherExpenses}
                    onChange={(e) => updateAiAnswer('otherExpenses', e.target.value)}
                    placeholder='e.g. Gym ₹1,500, shopping ₹3,000'
                    className='mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  />
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className='text-xl font-bold text-slate-900'>Here's your personalized budget plan</h3>
              <p className='mt-2 text-sm text-slate-500'>Based on your answers, AI suggests this monthly budget split</p>

              <div className='mt-4'>
                {isLoadingAi && (
                  <div className='flex items-center gap-3'>
                    <div className='h-6 w-6 animate-spin rounded-full border-4 border-t-transparent' style={{ borderColor: `${PRIMARY} ${PRIMARY} ${PRIMARY} transparent` }} />
                    <div className='text-sm text-slate-600'>AI is analyzing your spending patterns...</div>
                  </div>
                )}

                {!isLoadingAi && aiResult && (
                  <div className='mt-4 space-y-3'>
                    <div className='grid gap-2'>
                      {Array.isArray(aiResult.categories) && aiResult.categories.map((c, i) => (
                        <div key={i} className='flex items-center justify-between rounded-lg border p-3' style={{ borderColor: c.type === 'income' ? INCOME_GREEN : PRIMARY }}>
                          <div className='flex items-center gap-3'>
                            <div className='text-lg'>{c.icon}</div>
                            <div className='text-sm font-semibold'>{c.categoryName}</div>
                          </div>
                          <div className='text-sm font-bold' style={{ color: c.type === 'income' ? INCOME_GREEN : PRIMARY }}>
                            ₹{Number(c.budget).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className='mt-2 text-sm font-semibold' style={{ color: INCOME_GREEN }}>Monthly savings target: ₹{Number(aiResult.monthlySavingsTarget || 0).toLocaleString('en-IN')}</div>

                    <div className='mt-3 rounded-md bg-[#f5f3ff] p-3 text-sm text-slate-800' style={{ border: `1px solid ${BORDER}` }}>{aiResult.advice}</div>

                    <div className='mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center'>
                      <button onClick={handleFinishWithAi} className='w-full rounded-lg bg-[linear-gradient(90deg,#7C3AED,#10B981)] px-4 py-2 text-sm font-semibold text-white'>Looks good, save my plan</button>
                      <button onClick={handleAdjustManually} className='mt-2 text-sm underline text-slate-600 sm:mt-0 sm:ml-3'>Adjust manually</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3' style={{ flexShrink: 0 }}>
          <div className='w-20'>
            {step > 1 && (
              <button
                onClick={handleBack}
                className='w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition'
              >
                ← Back
              </button>
            )}
          </div>

          <div className='ml-auto'>
            <button
              onClick={handleContinue}
              className='rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90'
              style={{ backgroundColor: '#7C3AED' }}
            >
              {step === 1 && 'Next →'}
              {step === 2 && formData.setupChoice === 'manual' && 'Finish Setup'}
              {step === 2 && formData.setupChoice === 'ai' && 'Next →'}
              {step === 3 && 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
