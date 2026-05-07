import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS, fillPathParam } from '../../config/api'

interface StudentQuestionData {
  _id: string
  question: string
  isAnonymous: boolean
  isMine?: boolean
  authorLabel?: string
  answer?: string
  answerType?: 'manual' | 'ai' | string
  isPinned?: boolean
  createdAt?: string
}

const STUDENT_JOINED_SESSION_STORAGE_KEY = 'studentJoinedSessionCode'

const clearAuthKeys = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('email')
  localStorage.removeItem('role')
}

const sortForStudentFeed = (questions: StudentQuestionData[]): StudentQuestionData[] => {
  const byNewest = (a: StudentQuestionData, b: StudentQuestionData) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  }

  const pinned = questions.filter((q) => Boolean(q.isPinned)).sort(byNewest)
  const own = questions.filter((q) => !q.isPinned && Boolean(q.isMine)).sort(byNewest)
  const others = questions.filter((q) => !q.isPinned && !q.isMine).sort(byNewest)

  return [...pinned, ...own, ...others]
}

export default function StudentPage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const email = localStorage.getItem('email') || 'Student'

  const [sessionCode, setSessionCode] = useState(() => localStorage.getItem(STUDENT_JOINED_SESSION_STORAGE_KEY) || '')
  const [joinedSessionCode, setJoinedSessionCode] = useState(() => localStorage.getItem(STUDENT_JOINED_SESSION_STORAGE_KEY) || '')
  const [question, setQuestion] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionQuestions, setSessionQuestions] = useState<StudentQuestionData[]>([])
  const [loadingSessionQuestions, setLoadingSessionQuestions] = useState(false)
  const [mySlideIndex, setMySlideIndex] = useState(0)
  const [othersSlideIndex, setOthersSlideIndex] = useState(0)

  const normalizedSessionCode = sessionCode.toUpperCase().trim()
  const myQuestions = useMemo(() => sessionQuestions.filter((q) => Boolean(q.isMine)), [sessionQuestions])
  const othersQuestions = useMemo(() => sessionQuestions.filter((q) => !q.isMine), [sessionQuestions])

  const activeMyQuestion = myQuestions[mySlideIndex]
  const activeOtherQuestion = othersQuestions[othersSlideIndex]

  // Guard: redirect if not logged in
  useEffect(() => {
    if (!token || role !== 'student') {
      navigate('/')
    }
  }, [navigate, role, token])

  const fetchSessionQuestions = useCallback(async (code: string, silent = false) => {
    if (!code) {
      setSessionQuestions([])
      return
    }

    if (!silent) setLoadingSessionQuestions(true)

    try {
      const endpoint = fillPathParam(API_ENDPOINTS.questionsBySession, 'code', code)
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (res.status === 401 || res.status === 403) {
        clearAuthKeys()
        navigate('/')
        return
      }

      if (!res.ok || !data.success) {
        if (!silent) setMessage('❌ ' + (data.message || 'Failed to load questions for this session'))
        return
      }

      const incoming = (data.questions || []) as StudentQuestionData[]
      setSessionQuestions(sortForStudentFeed(incoming))
    } catch {
      if (!silent) setMessage('❌ Cannot load questions for this session.')
    } finally {
      if (!silent) setLoadingSessionQuestions(false)
    }
  }, [navigate, token])

  useEffect(() => {
    if (!joinedSessionCode) {
      setSessionQuestions([])
      return
    }

    fetchSessionQuestions(joinedSessionCode)

    const intervalId = setInterval(() => {
      fetchSessionQuestions(joinedSessionCode, true)
    }, 4000)

    return () => clearInterval(intervalId)
  }, [joinedSessionCode, fetchSessionQuestions])

  useEffect(() => {
    setMySlideIndex(0)
    setOthersSlideIndex(0)
  }, [joinedSessionCode])

  useEffect(() => {
    setMySlideIndex((prev) => Math.min(prev, Math.max(myQuestions.length - 1, 0)))
  }, [myQuestions.length])

  useEffect(() => {
    setOthersSlideIndex((prev) => Math.min(prev, Math.max(othersQuestions.length - 1, 0)))
  }, [othersQuestions.length])

  useEffect(() => {
    if (joinedSessionCode) {
      localStorage.setItem(STUDENT_JOINED_SESSION_STORAGE_KEY, joinedSessionCode)
      return
    }

    localStorage.removeItem(STUDENT_JOINED_SESSION_STORAGE_KEY)
  }, [joinedSessionCode])

  const submitQuestion = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch(API_ENDPOINTS.submitQuestion, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionCode: joinedSessionCode,
          text: question,
          isAnonymous,
        }),
      })

      const data = await res.json()

      if (res.status === 401 || res.status === 403) {
        clearAuthKeys()
        navigate('/')
        return
      }

      if (!res.ok || !data.success) {
        setMessage('❌ ' + (data.message || 'Failed to submit question'))
        return
      }

      const code = joinedSessionCode

      setMessage('✅ Question submitted!')
      setQuestion('')

      if (code) {
        await fetchSessionQuestions(code, true)
      }
    } catch {
      setMessage('❌ Cannot reach server. Is backend running?')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(STUDENT_JOINED_SESSION_STORAGE_KEY)
    clearAuthKeys()
    navigate('/')
  }

  const joinSession = () => {
    if (!normalizedSessionCode) {
      setMessage('❌ Please enter a session code first.')
      return
    }

    setMessage('')
    setJoinedSessionCode(normalizedSessionCode)
    setSessionCode(normalizedSessionCode)
    void fetchSessionQuestions(normalizedSessionCode)
  }

  const leaveSession = () => {
    setJoinedSessionCode('')
    setSessionQuestions([])
    setQuestion('')
    setIsAnonymous(false)
    setMySlideIndex(0)
    setOthersSlideIndex(0)
    setMessage('✅ Left session.')
  }

  return (
    <div className="page-center">
      <div className="card wide">
        {/* Header */}
        <div className="card-header">
          <div>
            <h1>Student Page</h1>
            <p className="subtitle">Logged in as <strong>{email}</strong></p>
          </div>
          <button id="student-logout" className="btn-outline" onClick={logout}>Logout</button>
        </div>

        <div className="section">
          <h2>Join Session</h2>

          <label>Session Code</label>
          <input
            id="student-session-code"
            type="text"
            placeholder="e.g. AB12CD"
            value={sessionCode}
            onChange={e => setSessionCode(e.target.value)}
            maxLength={10}
            required
            style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}
          />

          <button
            id="join-session-btn"
            type="button"
            className="btn-primary"
            onClick={joinSession}
          >
            Join Session
          </button>

          {joinedSessionCode && (
            <button
              id="leave-session-btn"
              type="button"
              className="btn-outline"
              style={{ width: '100%', marginTop: 10 }}
              onClick={leaveSession}
            >
              Leave Session
            </button>
          )}
        </div>

        {joinedSessionCode && (
          <form onSubmit={submitQuestion} className="section">
            <h2>Submit a Question</h2>

            <p className="subtitle" style={{ marginTop: 4, marginBottom: 8 }}>
              Joined session: <strong>{joinedSessionCode}</strong>
            </p>

          <label>Your Question</label>
          <textarea
            id="student-question"
            placeholder="Type your question here…"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            rows={4}
            required
          />

          <div className="checkbox-row">
            <input
              id="student-anonymous"
              type="checkbox"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
            />
            <label htmlFor="student-anonymous">Submit anonymously</label>
          </div>

          <button id="submit-question-btn" type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Submitting…' : '📨 Submit Question'}
          </button>
          </form>
        )}

        {joinedSessionCode && (
        <div className="section">
          <div className="question-title-row">
            <h2>Session Questions & Teacher Replies</h2>
            <button
              type="button"
              className="btn-outline"
              disabled={!joinedSessionCode || loadingSessionQuestions}
              onClick={() => {
                if (joinedSessionCode) {
                  void fetchSessionQuestions(joinedSessionCode)
                }
              }}
            >
              {loadingSessionQuestions ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {sessionQuestions.length === 0 ? (
            <p className="subtitle" style={{ marginTop: 8 }}>
              No questions found for this session yet.
            </p>
          ) : (
            <div className="slide-panels">
              <div className="slide-panel">
                <div className="question-title-row">
                  <h2>My Questions & Answers</h2>
                  {myQuestions.length > 0 && <span className="label">{mySlideIndex + 1} / {myQuestions.length}</span>}
                </div>

                {myQuestions.length === 0 ? (
                  <p className="subtitle" style={{ marginTop: 8 }}>You have not asked any questions in this session yet.</p>
                ) : (
                  <>
                    <div className="slide-controls">
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setMySlideIndex((prev) => Math.max(0, prev - 1))}
                        disabled={mySlideIndex === 0}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setMySlideIndex((prev) => Math.min(myQuestions.length - 1, prev + 1))}
                        disabled={mySlideIndex >= myQuestions.length - 1}
                      >
                        →
                      </button>
                    </div>

                    <div className={activeMyQuestion?.isPinned ? 'question-item pinned' : 'question-item'}>
                      <div className="question-top-row">
                        <span className="label">You</span>
                        {activeMyQuestion?.answer ? (
                          <span className="badge active">
                            {activeMyQuestion.answerType === 'ai' ? 'Answered by AI' : 'Answered by Teacher'}
                          </span>
                        ) : (
                          <span className="badge inactive">Waiting for answer</span>
                        )}
                      </div>

                      <p className="question-text">{activeMyQuestion?.question}</p>

                      {activeMyQuestion?.answer && (
                        <div className="answer-box">
                          <p className="label">Teacher Reply</p>
                          <p>{activeMyQuestion.answer}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="slide-panel">
                <div className="question-title-row">
                  <h2>Others' Q&A</h2>
                  {othersQuestions.length > 0 && <span className="label">{othersSlideIndex + 1} / {othersQuestions.length}</span>}
                </div>

                {othersQuestions.length === 0 ? (
                  <p className="subtitle" style={{ marginTop: 8 }}>No other student questions found in this session yet.</p>
                ) : (
                  <>
                    <div className="slide-controls">
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setOthersSlideIndex((prev) => Math.max(0, prev - 1))}
                        disabled={othersSlideIndex === 0}
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setOthersSlideIndex((prev) => Math.min(othersQuestions.length - 1, prev + 1))}
                        disabled={othersSlideIndex >= othersQuestions.length - 1}
                      >
                        →
                      </button>
                    </div>

                    <div className={activeOtherQuestion?.isPinned ? 'question-item pinned' : 'question-item'}>
                      <div className="question-top-row">
                        <span className="label">
                          {activeOtherQuestion?.authorLabel || (activeOtherQuestion?.isAnonymous ? 'Anonymous' : 'Student')}
                        </span>
                        {activeOtherQuestion?.answer ? (
                          <span className="badge active">
                            {activeOtherQuestion.answerType === 'ai' ? 'Answered by AI' : 'Answered by Teacher'}
                          </span>
                        ) : (
                          <span className="badge inactive">Waiting for answer</span>
                        )}
                      </div>

                      <p className="question-text">{activeOtherQuestion?.question}</p>

                      {activeOtherQuestion?.answer && (
                        <div className="answer-box">
                          <p className="label">Teacher Reply</p>
                          <p>{activeOtherQuestion.answer}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        )}

        {message && <p className="status-msg">{message}</p>}
      </div>
    </div>
  )
}
