export default function OnboardingModal({ isOpen, onCancel, onGoAhead }) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30'>
      <div className='relative w-full max-w-xs'>
        <div className='relative rounded-xl bg-[#fbfaf8] p-5 shadow-md'>
          {/* left accent bar */}
          <div className='absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl' style={{ background: 'linear-gradient(180deg,#7C3AED,#0EA5E9,#10B981)' }} />

          <div className='flex items-start justify-between gap-4'>
            <div>
              <h2 className='text-lg font-bold text-slate-900'>Onboarding</h2>
              <p className='mt-1 text-xs text-slate-600'>A quick setup for a tailored dashboard</p>
            </div>
            <button onClick={onCancel} aria-label='close' className='text-slate-400 hover:text-slate-600'>✕</button>
          </div>

          <div className='mt-4 flex items-center justify-between gap-3'>
            <button
              onClick={onCancel}
              className='flex-1 rounded-lg border border-slate-200 bg-white/60 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50'
            >
              Skip for now
            </button>
            <button
              onClick={onGoAhead}
              className='flex-none rounded-lg bg-linear-to-r from-emerald-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105'
            >
              Yes, go ahead
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
