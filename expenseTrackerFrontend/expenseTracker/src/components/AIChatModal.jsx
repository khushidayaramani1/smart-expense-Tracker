import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'

const PREDICTION_POLL_MS = 5 * 60 * 1000

function buildAuthHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  }
}

function normalizeSessionId(value) {
  return value.trim().replace(/^"|"$/g, '')
}

function formatCurrency(amount) {
  const numericAmount = Number(amount || 0)

  if (Number.isNaN(numericAmount)) {
    return '₹0'
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericAmount)
}

function formatDate(value) {
  if (!value) return 'N/A'

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return parsedDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AIChatModal({ isOpen, onClose }) {
  const [sessionId, setSessionId] = useState('')
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionError, setSessionError] = useState('')
  const [prompt, setPrompt] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [chatLoading, setChatLoading] = useState(false)
  const [historyMessages, setHistoryMessages] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')
  const [showHistoryViewer, setShowHistoryViewer] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [predictions, setPredictions] = useState([])
  const [predictionsLoading, setPredictionsLoading] = useState(false)
  const [predictionsError, setPredictionsError] = useState('')
  const fileInputRef = useRef(null)

  async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...buildAuthHeaders(),
        ...(options.headers || {}),
      },
    })

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
  }

  async function loadSessionId() {
    setSessionLoading(true)
    setSessionError('')

    try {
      const response = await fetch('/api/chat/session', {
        headers: buildAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const nextSessionId = normalizeSessionId(await response.text())

      if (!nextSessionId) {
        throw new Error('Empty session id received')
      }

      setSessionId(nextSessionId)
      return nextSessionId
    } catch (error) {
      console.error('Session load failed:', error.message)
      setSessionError('Naya chat session load nahi ho paya')
      toast.error('Chat session start nahi ho paya')
      return ''
    } finally {
      setSessionLoading(false)
    }
  }

  async function loadPredictions() {
    setPredictionsLoading(true)
    setPredictionsError('')

    try {
      const data = await fetchJson('/api/predictions')
      setPredictions(Array.isArray(data) ? data.filter((prediction) => !prediction.processed) : [])
    } catch (error) {
      console.error('Prediction fetch failed:', error.message)
      setPredictionsError('Predictions load nahi ho paayi')
    } finally {
      setPredictionsLoading(false)
    }
  }

  async function loadHistory(currentSessionId = sessionId) {
    if (!currentSessionId) {
      toast.error('Pehle chat session load karo')
      return
    }

    setHistoryLoading(true)
    setHistoryError('')

    try {
      const data = await fetchJson(`/api/chat/history/${encodeURIComponent(currentSessionId)}`)
      setHistoryMessages(Array.isArray(data) ? data : [])
      setShowHistoryViewer(true)
    } catch (error) {
      console.error('History fetch failed:', error.message)
      setHistoryError('Chat history load nahi ho payi')
      toast.error('History load nahi ho payi')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadSessionId()
    loadPredictions()

    const intervalId = window.setInterval(() => {
      loadPredictions()
    }, PREDICTION_POLL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function handleFileSelect(event) {
    const file = event.target.files?.[0]

    if (!file) return

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.error('Sirf PNG, JPG ya JPEG files allow hain')
      event.target.value = ''
      return
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function removeSelectedFile() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(null)
    setPreviewUrl('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleNewChat() {
    setChatHistory([])
    setHistoryMessages([])
    setHistoryError('')
    setShowHistoryViewer(false)
    setPrompt('')
    removeSelectedFile()
    setSessionId('')

    const nextSessionId = await loadSessionId()

    if (nextSessionId) {
      toast.success('Naya chat session start ho gaya')
    }
  }

  async function sendMessageToAI(messageText, file = null) {
    if (!sessionId) {
      throw new Error('Session not ready')
    }

    setChatLoading(true)

    try {
      const formData = new FormData()
      formData.append('message', messageText)
      formData.append('sessionId', sessionId)

      if (file) {
        formData.append('file', file)
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      return response.text()
    } catch (error) {
      console.error('AI Error:', error.message)
      toast.error('AI se connect nahi ho paya')
      throw error
    } finally {
      setChatLoading(false)
    }
  }

  async function handleSendToAI() {
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt && !selectedFile) return

    if (!sessionId) {
      toast.error('Chat session ready nahi hai')
      return
    }

    const outgoingMessage = trimmedPrompt || `Attached image ko analyze karo: ${selectedFile?.name || 'receipt'}`
    setChatHistory((prev) => [...prev, { role: 'user', content: outgoingMessage }])

    try {
      const reply = await sendMessageToAI(outgoingMessage, selectedFile)
      setChatHistory((prev) => [...prev, { role: 'assistant', content: reply }])
      toast.success('AI request successful!')
      setPrompt('')
      removeSelectedFile()
    } catch {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: 'AI service ke saath error aa gaya. Dobara try karo.' }])
    }
  }

  async function handlePredictionAction(prediction, action) {
    if (!prediction) return

    try {
      const response = await fetch(`/api/predictions/${prediction.id}/${action}`, {
        method: 'POST',
        headers: buildAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      setPredictions((prev) => prev.filter((item) => item.id !== prediction.id))
      toast.success(action === 'approve' ? 'Prediction approve ho gayi' : 'Prediction reject ho gayi')
    } catch (error) {
      console.error('Prediction action failed:', error.message)
      toast.error('Prediction update nahi ho payi')
    }
  }

  const pendingPredictions = predictions.filter((prediction) => !prediction.processed)

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center px-4 py-6'>
      <button
        type='button'
        aria-label='Close AI chat overlay'
        onClick={onClose}
        className='absolute inset-0 bg-slate-950/65 backdrop-blur-sm'
      />

      <div className='relative z-10 w-full max-w-7xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl'>
        <div className='grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]'>
          <section className='border-b border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-50 p-5 lg:border-b-0 lg:border-r'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h3 className='text-lg font-bold text-slate-900'>AI Expense Assistant</h3>
                <p className='mt-1 text-sm text-slate-500'>Expenses, predictions aur history sab ek jagah.</p>
                <div className='mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500'>
                  <span className='rounded-full bg-slate-100 px-2.5 py-1'>Session: {sessionLoading ? 'loading...' : sessionId || 'pending'}</span>
                  {sessionError ? <span className='rounded-full bg-rose-50 px-2.5 py-1 text-rose-600'>{sessionError}</span> : null}
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={handleNewChat}
                  disabled={sessionLoading || chatLoading}
                  className='rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60'
                >
                  New Chat
                </button>
                <button
                  type='button'
                  onClick={onClose}
                  className='flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700'
                  aria-label='Close AI chat'
                >
                  ✕
                </button>
              </div>
            </div>

            <div className='mt-4 flex flex-wrap items-center gap-2'>
              <button
                type='button'
                onClick={() => loadHistory()}
                disabled={historyLoading || !sessionId}
                className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {historyLoading ? 'Loading history...' : 'View History'}
              </button>
              <button
                type='button'
                onClick={loadPredictions}
                disabled={predictionsLoading}
                className='rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {predictionsLoading ? 'Loading predictions...' : 'Refresh Predictions'}
              </button>
            </div>

            {historyError || predictionsError ? (
              <div className='mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'>
                {historyError || predictionsError}
              </div>
            ) : null}

            <div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3'>
              <div className='flex items-center justify-between gap-3'>
                <div>
                  <div className='text-sm font-semibold text-slate-800'>Chat</div>
                  <div className='text-xs text-slate-500'>Current session ke messages yahan dikhte hain.</div>
                </div>
              </div>

              <div className='mt-3 max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3'>
                {chatHistory.length === 0 ? (
                  <p className='text-sm text-slate-500'>Start chatting with your AI assistant.</p>
                ) : (
                  chatHistory.map((chat, index) => (
                    <div key={`${chat.role}-${index}`} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                          chat.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <p className='whitespace-pre-wrap'>{chat.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className='mt-3 space-y-3'>
                {previewUrl ? (
                  <div className='inline-flex max-w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm'>
                    <img src={previewUrl} alt='Selected upload preview' className='h-14 w-14 rounded-lg object-cover' />
                    <div className='min-w-0'>
                      <p className='max-w-52 truncate text-sm font-medium text-slate-800'>{selectedFile?.name}</p>
                      <p className='text-xs text-slate-500'>Attached image ready hai</p>
                    </div>
                    <button
                      type='button'
                      onClick={removeSelectedFile}
                      className='ml-1 flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-800'
                      aria-label='Remove selected file'
                    >
                      ×
                    </button>
                  </div>
                ) : null}

                <div className='flex items-end gap-2'>
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    disabled={chatLoading || sessionLoading}
                    className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
                    aria-label='Attach image'
                    title='Attach image'
                  >
                    📎
                  </button>

                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/png,image/jpeg'
                    onChange={handleFileSelect}
                    className='hidden'
                  />

                  <input
                    type='text'
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={selectedFile ? 'Image ke liye message add karo...' : 'Example: Maine petrol par ₹500 spend kiye...'}
                    disabled={chatLoading || sessionLoading}
                    className='min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'
                  />
                </div>

                <div className='flex items-center justify-between gap-3'>
                  <div className='text-xs text-slate-500'>
                    {sessionError ? 'Session issue hai, New Chat se retry karo.' : 'Bearer token ke saath request bheji ja rahi hai.'}
                  </div>
                  <button
                    type='button'
                    onClick={handleSendToAI}
                    disabled={chatLoading || sessionLoading || !sessionId}
                    className='rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70'
                  >
                    {chatLoading ? 'Processing...' : 'Send'}
                  </button>
                </div>
              </div>

              {showHistoryViewer ? (
                <div className='mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
                  <div className='mb-3 flex items-center justify-between gap-3'>
                    <div>
                      <div className='text-sm font-semibold text-slate-900'>Chat History</div>
                      <div className='text-xs text-slate-500'>Past messages current session ke.</div>
                    </div>
                    <button
                      type='button'
                      onClick={() => setShowHistoryViewer(false)}
                      className='rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50'
                    >
                      Hide
                    </button>
                  </div>

                  <div className='max-h-72 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3'>
                    {historyLoading ? (
                      <p className='text-sm text-slate-500'>History load ho rahi hai...</p>
                    ) : historyMessages.length === 0 ? (
                      <p className='text-sm text-slate-500'>Koi history messages nahi mile.</p>
                    ) : (
                      historyMessages.map((message, index) => (
                        <div key={message.id || `${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                              message.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-800'
                            }`}
                          >
                            <p className='mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] opacity-70'>{message.role}</p>
                            <p className='whitespace-pre-wrap'>{message.content}</p>
                            {message.createdAt ? <p className='mt-1 text-[11px] opacity-70'>{formatDate(message.createdAt)}</p> : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <aside className='bg-linear-to-b from-amber-50 via-white to-amber-50 p-5'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <h4 className='text-lg font-bold text-amber-950'>Pending Predictions</h4>
                <p className='mt-1 text-sm text-amber-800/80'>Recurring expense suggestions ko approve ya reject karein.</p>
              </div>
              <div className='rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900'>
                {pendingPredictions.length} pending
              </div>
            </div>

            <div className='mt-4 space-y-3'>
              {predictionsLoading && pendingPredictions.length === 0 ? (
                <div className='rounded-2xl border border-amber-200 bg-white p-4 text-sm text-amber-900'>Predictions load ho rahi hain...</div>
              ) : pendingPredictions.length === 0 ? (
                <div className='rounded-2xl border border-amber-200 bg-white p-4 text-sm text-amber-900'>Koi pending predictions nahi hain 🎉</div>
              ) : (
                pendingPredictions.map((prediction) => (
                  <article key={prediction.id} className='rounded-2xl border border-amber-200 bg-white p-4 shadow-sm ring-1 ring-amber-100'>
                    <div className='inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-amber-900'>
                      AI Prediction
                    </div>

                    <p className='mt-3 text-sm leading-6 text-slate-700'>
                      {prediction.message || 'Maine aapke spend pattern me recurring expense notice kiya hai.'}
                    </p>

                    <div className='mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2'>
                      <div className='rounded-xl bg-amber-50 px-3 py-2'>
                        <div className='text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-900/70'>Amount</div>
                        <div className='mt-1 font-bold text-amber-950'>{formatCurrency(prediction.amount)}</div>
                      </div>
                      <div className='rounded-xl bg-amber-50 px-3 py-2'>
                        <div className='text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-900/70'>Date</div>
                        <div className='mt-1 font-bold text-amber-950'>{formatDate(prediction.predictedDate)}</div>
                      </div>
                    </div>

                    {prediction.categoryName ? (
                      <div className='mt-3 text-sm text-slate-600'>
                        Category: <span className='font-semibold text-slate-900'>{prediction.categoryName}</span>
                      </div>
                    ) : null}

                    <div className='mt-4 flex gap-2'>
                      <button
                        type='button'
                        onClick={() => handlePredictionAction(prediction, 'approve')}
                        disabled={chatLoading}
                        className='flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70'
                      >
                        Approve
                      </button>
                      <button
                        type='button'
                        onClick={() => handlePredictionAction(prediction, 'reject')}
                        disabled={chatLoading}
                        className='flex-1 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70'
                      >
                        Reject
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}