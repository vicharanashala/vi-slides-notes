import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, fillPathParam } from '../../config/api'

interface SessionData {
  code: string
  title: string
  status: 'active' | 'inactive' | string
}

interface QuestionData {
  _id: string
  question: string
  isAnonymous: boolean
  authorLabel?: string
  answer?: string
  answerType?: 'manual' | 'ai' | string
  isPinned: boolean
}

const TEACHER_SELECTED_SESSION_STORAGE_KEY = 'teacherSelectedSessionCode'

const clearAuthKeys = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('email')
  localStorage.removeItem('role')
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const email = localStorage.getItem('email') || 'Teacher'
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  const [title, setTitle] = useState('')
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [selectedCode, setSelectedCode] = useState(() => localStorage.getItem(TEACHER_SELECTED_SESSION_STORAGE_KEY) || '')
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [questionSlideIndex, setQuestionSlideIndex] = useState(0)
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({})

  const [message, setMessage] = useState('')
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [creating, setCreating] = useState(false)
  const [busyKey, setBusyKey] = useState('')

  const selectedSession = useMemo(
    () => sessions.find((session) => session.code === selectedCode) || null,
    [sessions, selectedCode],
  )
  const activeQuestion = questions[questionSlideIndex] || null

  const logout = useCallback(() => {
    localStorage.removeItem(TEACHER_SELECTED_SESSION_STORAGE_KEY)
    clearAuthKeys()
    navigate('/')
  }, [navigate])

  useEffect(() => {
    if (!token || role !== 'teacher') {
      navigate('/')
    }
  }, [navigate, role, token])

  const isAuthError = (status: number) => status === 401 || status === 403

  const fetchSessions = useCallback(async (silent = false) => {
    if (!token) return
    if (!silent) setLoadingSessions(true)

    try {
      const res = await fetch(API_ENDPOINTS.sessionsMine, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await res.json()

      if (isAuthError(res.status)) {
        logout()
        return
      }

      if (!res.ok || !data.success) {
        if (!silent) setMessage('❌ ' + (data.message || 'Failed to load sessions'))
        return
      }

      const incoming = (data.sessions || []) as SessionData[]
      setSessions(incoming)
      setSelectedCode((prev) => {
        if (!incoming.length) return ''
        if (prev && incoming.some((item) => item.code === prev)) return prev
        return incoming[0].code
      })
    } catch {
      if (!silent) setMessage('❌ Cannot load sessions.')
    } finally {
      if (!silent) setLoadingSessions(false)
    }
  }, [logout, token])

  const fetchQuestions = useCallback(async (sessionCode: string, silent = false) => {
    if (!token || !sessionCode) {
      setQuestions([])
      return
    }

    if (!silent) setLoadingQuestions(true)

    try {
      const res = await fetch(fillPathParam(API_ENDPOINTS.questionsBySession, 'code', sessionCode), {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      const data = await res.json()

      if (isAuthError(res.status)) {
        logout()
        return
      }

      if (!res.ok || !data.success) {
        if (!silent) setMessage('❌ ' + (data.message || 'Failed to load questions'))
        return
      }

      const incoming = (data.questions || []) as QuestionData[]
      setQuestions(incoming)
      setAnswerDrafts((prev) => {
        const next = { ...prev }
        incoming.forEach((question) => {
          if (next[question._id] === undefined) {
            next[question._id] = ''
          }
        })
        return next
      })
    } catch {
      if (!silent) setMessage('❌ Cannot load questions.')
    } finally {
      if (!silent) setLoadingQuestions(false)
    }
  }, [logout, token])

  useEffect(() => {
    void fetchSessions()
  }, [fetchSessions])

  useEffect(() => {
    if (!selectedCode) {
      setQuestions([])
      return
    }

    setQuestionSlideIndex(0)

    void fetchQuestions(selectedCode)

    const intervalId = setInterval(() => {
      void fetchQuestions(selectedCode, true)
    }, 3000)

    return () => clearInterval(intervalId)
  }, [selectedCode, fetchQuestions])

  useEffect(() => {
    setQuestionSlideIndex((prev) => Math.min(prev, Math.max(questions.length - 1, 0)))
  }, [questions.length])

  useEffect(() => {
    if (selectedCode) {
      localStorage.setItem(TEACHER_SELECTED_SESSION_STORAGE_KEY, selectedCode)
      return
    }

    localStorage.removeItem(TEACHER_SELECTED_SESSION_STORAGE_KEY)
  }, [selectedCode])

  const createSession = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return

    setCreating(true)
    setMessage('')

    try {
      const res = await fetch(API_ENDPOINTS.sessions, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      })

      const data = await res.json()

      if (isAuthError(res.status)) {
        logout()
        return
      }

      if (!res.ok || !data.success) {
        setMessage('❌ ' + (data.message || 'Failed to create session'))
        return
      }

      const created = data.session as SessionData
      setTitle('')
      setSelectedCode(created.code)
      setMessage('✅ Session created.')
      await fetchSessions(true)
    } catch {
      setMessage('❌ Cannot reach server.')
    } finally {
      setCreating(false)
    }
  }

  const updateSessionStatus = async (sessionCode: string, status: 'active' | 'inactive') => {
    if (!token) return

    setBusyKey(`status-${sessionCode}`)
    setMessage('')

    try {
      const res = await fetch(fillPathParam(API_ENDPOINTS.sessionStatus, 'code', sessionCode), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await res.json()

      if (isAuthError(res.status)) {
        logout()
        return
      }

      if (!res.ok || !data.success) {
        setMessage('❌ ' + (data.message || 'Failed to update session status'))
        return
      }

      setSelectedCode(data.session.code)
      setMessage(status === 'active' ? '✅ Session joined.' : '⛔ Session ended.')
      await fetchSessions(true)
    } catch {
      setMessage('❌ Cannot reach server.')
    } finally {
      setBusyKey('')
    }
  }

  const deleteSession = async (target: SessionData) => {
    if (!token) return

    const shouldDelete = window.confirm(
      `Delete session "${target.title}" (${target.code})? This will remove its questions.`,
    )

    if (!shouldDelete) return

    setBusyKey(`delete-${target.code}`)
    setMessage('')

    try {
      const res = await fetch(fillPathParam(API_ENDPOINTS.sessionDelete, 'code', target.code), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (isAuthError(res.status)) {
        logout()
        return
      }

      if (!res.ok || !data.success) {
        setMessage('❌ ' + (data.message || 'Failed to delete session'))
        return
      }

      setMessage('✅ Session deleted.')
      await fetchSessions(true)
    } catch {
      setMessage('❌ Cannot reach server.')
    } finally {
      setBusyKey('')
    }
  }

  const submitAnswer = async (questionId: string) => {
    if (!token || selectedSession?.status !== 'active') {
      setMessage('❌ Join an active session to answer questions.')
      return
    }

    const answer = (answerDrafts[questionId] || '').trim()
    if (!answer) {
      setMessage('❌ Please type an answer first.')
      return
    }

    setBusyKey(`answer-${questionId}`)

    try {
      const res = await fetch(fillPathParam(API_ENDPOINTS.questionAnswer, 'id', questionId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ answer, answerType: 'manual' }),
      })

      const data = await res.json()

      if (isAuthError(res.status)) {
        logout()
        return
      }

      if (!res.ok || !data.success) {
        setMessage('❌ ' + (data.message || 'Failed to submit answer'))
        return
      }

      setAnswerDrafts((prev) => ({ ...prev, [questionId]: '' }))
      setMessage('✅ Answer saved.')
      if (selectedCode) await fetchQuestions(selectedCode, true)
    } catch {
      setMessage('❌ Cannot reach server.')
    } finally {
      setBusyKey('')
    }
  }

  const togglePin = async (question: QuestionData) => {
    if (!token || selectedSession?.status !== 'active') {
      setMessage('❌ Join an active session to pin questions.')
      return
    }

    setBusyKey(`pin-${question._id}`)

    try {
      const res = await fetch(fillPathParam(API_ENDPOINTS.questionPin, 'id', question._id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pinned: !question.isPinned }),
      })

      const data = await res.json()

      if (isAuthError(res.status)) {
        logout()
        return
      }

      if (!res.ok || !data.success) {
        setMessage('❌ ' + (data.message || 'Failed to update pin status'))
        return
      }

      setMessage(question.isPinned ? '✅ Question unpinned.' : '✅ Question pinned.')
      if (selectedCode) await fetchQuestions(selectedCode, true)
    } catch {
      setMessage('❌ Cannot reach server.')
    } finally {
      setBusyKey('')
    }
  }

  return (
    <div className="page-center">
      <div className="card wide">
        <div className="card-header">
          <div>
            <h1>Teacher Dashboard</h1>
            <p className="subtitle">Logged in as <strong>{email}</strong></p>
          </div>
          <button id="teacher-logout" className="btn-outline" onClick={logout}>Logout</button>
        </div>

        <form onSubmit={createSession} className="section">
          <h2>Create New Session</h2>
          <label>Session Title</label>
          <input
            id="session-title"
            type="text"
            placeholder="e.g. Chapter 5 - Thermodynamics"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <button id="create-session-btn" type="submit" className="btn-primary" disabled={creating}>
            {creating ? 'Creating…' : 'Create Session'}
          </button>
        </form>

        <div className="section">
          <div className="question-title-row">
            <h2>My Sessions</h2>
            <button
              type="button"
              className="btn-outline"
              onClick={() => { void fetchSessions() }}
              disabled={loadingSessions}
            >
              {loadingSessions ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {sessions.length === 0 ? (
            <p className="subtitle" style={{ marginTop: 8 }}>No sessions yet.</p>
          ) : (
            <div className="question-list">
              {sessions.map((item) => {
                const isSelected = selectedCode === item.code
                const isBusy = busyKey === `status-${item.code}` || busyKey === `delete-${item.code}`

                return (
                  <div key={item.code} className={isSelected ? 'question-item pinned' : 'question-item'}>
                    <div className="question-top-row">
                      <span className="label">{item.title}</span>
                      <span className={item.status === 'active' ? 'badge active' : 'badge inactive'}>
                        {item.status}
                      </span>
                    </div>

                    <p className="subtitle" style={{ marginTop: 2 }}>Code: <strong>{item.code}</strong></p>

                    <div className="question-actions">
                      <button className="btn-outline" onClick={() => setSelectedCode(item.code)} disabled={isBusy}>
                        Open
                      </button>

                      {item.status !== 'active' && (
                        <button
                          className="btn-outline"
                          onClick={() => { void updateSessionStatus(item.code, 'active') }}
                          disabled={isBusy}
                        >
                          {busyKey === `status-${item.code}` ? 'Joining…' : 'Join'}
                        </button>
                      )}

                      <button
                        className="btn-outline"
                        style={{ color: '#9b2c2c', borderColor: '#fed7d7' }}
                        onClick={() => { void deleteSession(item) }}
                        disabled={isBusy}
                      >
                        {busyKey === `delete-${item.code}` ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {selectedSession && (
          <div className="section session-box">
            <h2>Selected Session</h2>
            <p><span className="label">Title:</span> {selectedSession.title}</p>
            <p>
              <span className="label">Status:</span>{' '}
              <span className={selectedSession.status === 'active' ? 'badge active' : 'badge inactive'}>
                {selectedSession.status}
              </span>
            </p>

            <div className="code-display">
              <p className="label">Session Code</p>
              <div id="session-code" className="code-box">{selectedSession.code}</div>
            </div>

            {selectedSession.status === 'active' ? (
              <button
                id="end-session-btn"
                className="btn-danger"
                onClick={() => { void updateSessionStatus(selectedSession.code, 'inactive') }}
                disabled={busyKey === `status-${selectedSession.code}`}
              >
                {busyKey === `status-${selectedSession.code}` ? 'Ending…' : 'End Session'}
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={() => { void updateSessionStatus(selectedSession.code, 'active') }}
                disabled={busyKey === `status-${selectedSession.code}`}
              >
                {busyKey === `status-${selectedSession.code}` ? 'Joining…' : 'Join Session'}
              </button>
            )}
          </div>
        )}

        {selectedSession && (
          <div className="section">
            <div className="question-title-row">
              <h2>Student Questions</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {questions.length > 0 && <span className="label">{questionSlideIndex + 1} / {questions.length}</span>}
                {loadingQuestions && <span className="label">Refreshing…</span>}
              </div>
            </div>

            {selectedSession.status !== 'active' && (
              <p className="subtitle" style={{ marginTop: 8 }}>
                This session is inactive. Join it to answer and pin questions.
              </p>
            )}

            {questions.length === 0 ? (
              <p className="subtitle" style={{ marginTop: 8 }}>No questions yet.</p>
            ) : (
              <>
                <div className="slide-controls">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setQuestionSlideIndex((prev) => Math.max(0, prev - 1))}
                    disabled={questionSlideIndex === 0}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setQuestionSlideIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={questionSlideIndex >= questions.length - 1}
                  >
                    →
                  </button>
                </div>

                {activeQuestion && (
                  <div className={activeQuestion.isPinned ? 'question-item pinned' : 'question-item'}>
                    <div className="question-top-row">
                      <span className="label">{activeQuestion.authorLabel || (activeQuestion.isAnonymous ? 'Anonymous' : 'Student')}</span>
                      {activeQuestion.isPinned && <span className="badge active">Pinned</span>}
                    </div>

                    <p className="question-text">{activeQuestion.question}</p>

                    {activeQuestion.answer && (
                      <div className="answer-box">
                        <p className="label">Answer ({activeQuestion.answerType === 'ai' ? 'AI' : 'Manual'})</p>
                        <p>{activeQuestion.answer}</p>
                      </div>
                    )}

                    <label htmlFor={`answer-${activeQuestion._id}`}>Your Answer</label>
                    <textarea
                      id={`answer-${activeQuestion._id}`}
                      rows={2}
                      placeholder="Type answer and click Answer"
                      value={answerDrafts[activeQuestion._id] || ''}
                      disabled={selectedSession.status !== 'active'}
                      onChange={(e) => setAnswerDrafts((prev) => ({ ...prev, [activeQuestion._id]: e.target.value }))}
                    />

                    <div className="question-actions">
                      <button
                        className="btn-outline"
                        onClick={() => { void submitAnswer(activeQuestion._id) }}
                        disabled={busyKey === `answer-${activeQuestion._id}` || selectedSession.status !== 'active'}
                      >
                        {busyKey === `answer-${activeQuestion._id}` ? 'Saving…' : 'Answer'}
                      </button>

                      <button
                        className="btn-outline"
                        onClick={() => { void togglePin(activeQuestion) }}
                        disabled={busyKey === `pin-${activeQuestion._id}` || selectedSession.status !== 'active'}
                      >
                        {busyKey === `pin-${activeQuestion._id}` ? 'Saving…' : activeQuestion.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {message && <p className="status-msg">{message}</p>}
      </div>
    </div>
  )
}
