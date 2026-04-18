import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

interface Question {
  _id: string;
  text: string;
  status: string;
  createdAt: string;
  answer?: string;
  studentId?: { name: string };
}

interface Summary {
  totalQuestions: number;
  answeredQuestions: number;
  pendingQuestions: number;
  durationMinutes: number;
  questions: Question[];
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  // Check authentication on mount
  useEffect(() => {
    if (!token || !user.id) {
      navigate("/login");
    } else if (user.role !== "teacher") {
      navigate("/student/dashboard");
    }
  }, [token, user.id, user.role, navigate]);

  const [sessionCode, setSessionCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionStatus, setSessionStatus] = useState("waiting");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
  const [answeringId, setAnsweringId] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const logout = async () => {
    if (sessionId && sessionStatus !== "ended") {
      try {
        await axios.patch(
          `http://localhost:5000/api/session/${sessionId}/status`,
          { status: "ended" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Failed to end session on logout:", error);
      }
    }
    localStorage.clear();
    navigate("/login");
  };

  const createSession = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/session/create", {}, { headers: { Authorization: `Bearer ${token}` } });
      setSessionCode(res.data.session.code);
      setSessionId(res.data.session._id);
      setSessionStatus("waiting");
      socket.emit("join-room", res.data.session._id);
    } catch { alert("Unable to create session. Please try again."); }
    finally { setLoading(false); }
  };

  const updateStatus = async (status: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/session/${sessionId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
      setSessionStatus(status);
      if (status === "ended") {
        const res = await axios.get(`http://localhost:5000/api/session/${sessionId}/summary`, { headers: { Authorization: `Bearer ${token}` } });
        setSummary(res.data);
      }
    } catch { alert("Failed to update session status"); }
  };

  const answerQuestion = async (questionId: string) => {
    const answer = answerInputs[questionId];
    if (!answer?.trim()) return;
    
    setAnsweringId(questionId);
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/question/${questionId}/answer`,
        { answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(prev => prev.map(q => q._id === questionId ? res.data.question : q));
      setAnswerInputs(prev => ({ ...prev, [questionId]: "" }));
    } catch { alert("Failed to submit answer"); }
    finally { setAnsweringId(""); }
  };

  useEffect(() => {
    socket.on("new-question", (q: Question) => {
      setQuestions(prev => [...prev, q]); // Add to bottom of stack (end of array)
    });
    return () => {
      socket.off("new-question");
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionId && sessionStatus === "active") {
        e.preventDefault();
        e.returnValue = "Active session detected. Closing will prevent students from participating.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionId, sessionStatus]);

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    waiting: { color: "#8b5cf6", bg: "#f3e8ff", label: "Waiting" },
    active: { color: "#10b981", bg: "#d1fae5", label: "Live" },
    paused: { color: "#f59e0b", bg: "#fef3c7", label: "Paused" },
    ended: { color: "#ef4444", bg: "#fee2e2", label: "Ended" },
  };
  const sc = statusConfig[sessionStatus] || statusConfig.waiting;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.brandIcon}>📚</div>
          <div>
            <h1 style={s.brandName}>Vi-SlideS</h1>
            <p style={s.brandTagline}>Teacher Portal</p>
          </div>
        </div>
        <div style={s.headerRight}>
          {sessionCode && (
            <div style={{ ...s.statusBadge, color: sc.color, background: sc.bg }}>
              <span style={s.statusDot}>●</span> {sc.label}
            </div>
          )}
          <div style={s.profileMenu}>
            <div style={s.avatar}>{user.name?.[0]?.toUpperCase()}</div>
            <button style={s.logoutLink} onClick={logout}>Exit</button>
          </div>
        </div>
      </div>

      <div style={s.container}>
        {!sessionCode ? (
          <div style={s.emptyState}>
            <div style={s.emptyCard}>
              <div style={s.emptyIcon}>🎯</div>
              <h2 style={s.emptyTitle}>Welcome back, {user.name}!</h2>
              <p style={s.emptyText}>Launch a new classroom session to start receiving questions from your students in real-time.</p>
              <button style={s.createBtn} onClick={createSession} disabled={loading}>
                {loading ? "Launching..." : "🚀 Launch New Session"}
              </button>
            </div>
            <div style={s.featureGrid}>
              {[
                { icon: "⚡", title: "Instant Delivery", desc: "Questions appear in real-time as students submit them" },
                { icon: "🎴", title: "Card Stack View", desc: "Navigate through questions like a deck of cards" },
                { icon: "📊", title: "Session Analytics", desc: "Review participation and engagement metrics" },
              ].map(item => (
                <div key={item.title} style={s.featureBox}>
                  <div style={s.featureIcon}>{item.icon}</div>
                  <h3 style={s.featureTitle}>{item.title}</h3>
                  <p style={s.featureDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={s.sessionView}>
            {/* Control Panel */}
            <div style={s.controlPanel}>
              <div style={s.controlInfo}>
                <h3 style={s.controlTitle}>Session Controls</h3>
                <div style={s.roomCodeDisplay}>
                  Room Code: <strong style={s.roomCodeValue}>{sessionCode}</strong>
                </div>
                {sessionStatus === "active" && (
                  <p style={s.controlHint}>⚠️ End session before exiting to close properly</p>
                )}
              </div>
              <div style={s.controlButtons}>
                <button 
                  style={{ ...s.controlBtn, ...s.startBtn, opacity: sessionStatus === "active" || sessionStatus === "ended" ? 0.4 : 1 }}
                  onClick={() => updateStatus("active")} 
                  disabled={sessionStatus === "active" || sessionStatus === "ended"}>
                  ▶ Begin
                </button>
                <button 
                  style={{ ...s.controlBtn, ...s.pauseBtn, opacity: sessionStatus !== "active" ? 0.4 : 1 }}
                  onClick={() => updateStatus("paused")} 
                  disabled={sessionStatus !== "active"}>
                  ⏸ Hold
                </button>
                <button 
                  style={{ ...s.controlBtn, ...s.endBtn, opacity: sessionStatus === "ended" ? 0.4 : 1 }}
                  onClick={() => updateStatus("ended")} 
                  disabled={sessionStatus === "ended"}>
                  ⏹ Close
                </button>
              </div>
            </div>

            {/* Summary View */}
            {sessionStatus === "ended" && summary ? (
              <div style={s.summaryView}>
                <h2 style={s.summaryTitle}>Session Report</h2>
                <div style={s.statsGrid}>
                  {[
                    { label: "Room Code", value: sessionCode, icon: "🔑" },
                    { label: "Total Queries", value: summary.totalQuestions, icon: "💬" },
                    { label: "Resolved", value: summary.answeredQuestions, icon: "✅" },
                    { label: "Pending", value: summary.pendingQuestions, icon: "⏳" },
                    { label: "Duration", value: `${summary.durationMinutes}m`, icon: "⏱️" },
                  ].map(stat => (
                    <div key={stat.label} style={s.statBox}>
                      <div style={s.statIcon}>{stat.icon}</div>
                      <div style={s.statValue}>{stat.value}</div>
                      <div style={s.statLabel}>{stat.label}</div>
                    </div>
                  ))}
                </div>
                {summary.questions.length > 0 && (
                  <div style={s.summaryList}>
                    <h3 style={s.summaryListTitle}>All Questions ({summary.questions.length})</h3>
                    {summary.questions.map((q, i) => (
                      <div key={q._id} style={s.summaryItem}>
                        <div style={s.summaryItemHeader}>
                          <span style={s.summaryItemNum}>#{i + 1}</span>
                          <span style={q.status === "answered" ? s.badgeAnswered : s.badgePending}>
                            {q.status === "answered" ? "✓ Resolved" : "○ Pending"}
                          </span>
                          <span style={s.summaryItemAuthor}>
                            👤 {q.studentId?.name || "Student"}
                          </span>
                        </div>
                        <p style={s.summaryItemText}>{q.text}</p>
                        {q.answer && (
                          <div style={s.summaryAnswer}>
                            <span style={s.summaryAnswerLabel}>Your Response:</span>
                            <p style={s.summaryAnswerText}>{q.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <button style={s.createBtn} onClick={() => {
                  setSessionCode(""); setSessionId(""); setSessionStatus("waiting");
                  setQuestions([]); setSummary(null);
                }}>
                  🚀 Launch Another Session
                </button>
              </div>
            ) : questions.length === 0 ? (
              <div style={s.waitingView}>
                <div style={s.waitingBox}>
                  <div style={s.waitingIcon}>⏳</div>
                  <h2 style={s.waitingTitle}>Awaiting Questions</h2>
                  <p style={s.waitingText}>Share room code <strong style={{ color: "#8b5cf6" }}>{sessionCode}</strong> with your students</p>
                  {sessionStatus === "waiting" && (
                    <p style={s.waitingWarning}>⚠️ Click "Begin" to allow student submissions</p>
                  )}
                </div>
              </div>
            ) : (
              <div style={s.cardsView}>
                {/* Top - Unanswered Question Numbers */}
                {(() => {
                  // Get only pending questions
                  const pendingQuestions = questions.filter(q => q.status === "pending");
                  
                  if (pendingQuestions.length === 0) return null;
                  
                  return (
                    <div style={s.pendingNumbersBar}>
                      <span style={s.pendingLabel}>Pending:</span>
                      <div style={s.pendingNumbers}>
                        {questions.map((q, idx) => {
                          // Create object with question and its number
                          const questionNumber = idx + 1;
                          const isPending = q.status === "pending";
                          
                          if (!isPending) return null;
                          
                          // Find this question's position in pending array
                          const pendingIndex = pendingQuestions.indexOf(q);
                          const isActive = pendingIndex === currentQuestionIndex;
                          
                          return (
                            <span 
                              key={questionNumber} 
                              style={{
                                ...s.pendingNumber,
                                ...(isActive ? s.pendingNumberActive : {}),
                                cursor: "pointer",
                              }}
                              onClick={() => setCurrentQuestionIndex(pendingIndex)}
                            >
                              Q{questionNumber}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Center - Question Stack or All Answered Message */}
                {(() => {
                  const pendingQuestions = questions.filter(q => q.status === "pending");
                  
                  if (pendingQuestions.length === 0) {
                    return (
                      <div style={s.allAnsweredBox}>
                        <div style={s.allAnsweredIcon}>🎉</div>
                        <h2 style={s.allAnsweredTitle}>All Questions Answered!</h2>
                        <p style={s.allAnsweredText}>Great work! Waiting for new questions from students...</p>
                      </div>
                    );
                  }
                  
                  return (
                    <>
                      <div style={s.cardsHeader}>
                        <h2 style={s.cardsTitle}>Question Stack</h2>
                        <div style={s.cardsCount}>
                          {pendingQuestions.length} remaining
                      </div>
                    </div>
                    
                    <div style={s.stackContainer}>
                      {(() => {
                        // Get all pending questions
                        const pendingQuestions = questions.filter(q => q.status === "pending");
                        
                        // Get the current question to display
                        const currentQuestion = pendingQuestions[currentQuestionIndex];
                        
                        // If no question, don't render anything
                        if (!currentQuestion) return null;
                        
                        // Find the original question number (position in all questions)
                        const questionNumber = questions.indexOf(currentQuestion) + 1;
                        
                        return (
                          <div
                            key={currentQuestion._id}
                            style={{
                              ...s.card,
                              top: "0px",
                              transform: "translateX(-50%)",
                              zIndex: 1000,
                            }}
                          >
                            <div style={s.cardHeader}>
                              <div style={s.cardMeta}>
                                <span style={s.cardNumber}>Q{questionNumber}</span>
                                <span style={s.cardAuthor}>
                                  👤 {currentQuestion.studentId?.name || "Student"}
                                </span>
                              </div>
                              <span style={s.badgePending}>○ Pending</span>
                            </div>

                            <div style={s.cardBody}>
                              <p style={s.questionText}>{currentQuestion.text}</p>
                            </div>

                            <div style={s.answerSection}>
                              <label style={s.answerLabel}>TYPE YOUR RESPONSE</label>
                              <textarea
                                style={s.answerInput}
                                placeholder="Enter your answer here..."
                                value={answerInputs[currentQuestion._id] || ""}
                                onChange={(e) => setAnswerInputs(prev => ({ ...prev, [currentQuestion._id]: e.target.value }))}
                                rows={3}
                              />
                              <button
                                style={{
                                  ...s.answerBtn,
                                  opacity: !answerInputs[currentQuestion._id]?.trim() || answeringId === currentQuestion._id ? 0.5 : 1,
                                }}
                                onClick={() => {
                                  answerQuestion(currentQuestion._id);
                                  // Move to next question after answering
                                  // If this was the last question, go back to first
                                  if (currentQuestionIndex >= pendingQuestions.length - 1) {
                                    setCurrentQuestionIndex(0);
                                  }
                                }}
                                disabled={!answerInputs[currentQuestion._id]?.trim() || answeringId === currentQuestion._id}
                              >
                                {answeringId === currentQuestion._id ? "Submitting..." : "Submit Response →"}
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {(() => {
                      const pendingCount = questions.filter(q => q.status === "pending").length;
                      
                      // Only show navigation hint if there are multiple pending questions
                      if (pendingCount <= 1) return null;
                      
                      return (
                        <div style={s.stackInfo}>
                          <p style={s.stackInfoText}>
                            💡 Click question numbers above to navigate · {currentQuestionIndex + 1} of {pendingCount}
                          </p>
                        </div>
                      );
                    })()}
                  </>
                  );
                })()}

                {/* Bottom - Answered Questions List */}
                {(() => {
                  // Get all answered questions
                  const answeredQuestions = questions.filter(q => q.status === "answered");
                  
                  // Don't show section if no answered questions
                  if (answeredQuestions.length === 0) return null;
                  
                  return (
                    <div style={s.answeredSection}>
                      <h3 style={s.answeredSectionTitle}>
                        ✓ Answered Questions ({answeredQuestions.length})
                      </h3>
                      <div style={s.answeredList}>
                        {questions.map((q, idx) => {
                          // Skip if not answered
                          if (q.status !== "answered") return null;
                          
                          // Calculate question number (position in all questions)
                          const questionNumber = idx + 1;
                          
                          return (
                            <div key={q._id} style={s.answeredItem}>
                              <div style={s.answeredItemHeader}>
                                <div style={s.answeredItemLeft}>
                                  <span style={s.answeredItemNumber}>Q{questionNumber}</span>
                                  <span style={s.answeredItemAuthor}>
                                    👤 {q.studentId?.name || "Student"}
                                  </span>
                                </div>
                                <span style={s.answeredItemBadge}>✓ Resolved</span>
                              </div>
                              <p style={s.answeredItemQuestion}>{q.text}</p>
                              <div style={s.answeredItemAnswer}>
                                <span style={s.answeredItemAnswerLabel}>YOUR RESPONSE:</span>
                                <p style={s.answeredItemAnswerText}>{q.answer}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", fontFamily: "'Inter', sans-serif" },
  header: { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(0,0,0,0.1)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 1001, boxShadow: "0 2px 20px rgba(0,0,0,0.1)" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  brandIcon: { fontSize: "32px" },
  brandName: { fontSize: "22px", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" },
  brandTagline: { fontSize: "11px", color: "#6b7280", margin: 0, fontWeight: 500 },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  codeBox: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderRadius: "10px", padding: "8px 16px", display: "flex", flexDirection: "column", alignItems: "center" },
  codeLabel: { fontSize: "10px", color: "rgba(255,255,255,0.8)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" },
  codeValue: { fontSize: "18px", color: "#fff", fontWeight: 800, letterSpacing: "3px" },
  statusBadge: { borderRadius: "20px", padding: "6px 14px", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" },
  statusDot: { fontSize: "10px" },
  profileMenu: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px" },
  logoutLink: { background: "transparent", border: "2px solid #e5e7eb", color: "#374151", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.2s" },
  container: { padding: "40px 32px", maxWidth: "1400px", margin: "0 auto" },
  emptyState: { display: "flex", flexDirection: "column", gap: "32px" },
  emptyCard: { background: "#fff", borderRadius: "20px", padding: "60px 40px", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" },
  emptyIcon: { fontSize: "64px", marginBottom: "20px" },
  emptyTitle: { fontSize: "32px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" },
  emptyText: { fontSize: "16px", color: "#6b7280", marginBottom: "32px", lineHeight: "1.6" },
  createBtn: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: "12px", padding: "16px 32px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px rgba(102,126,234,0.4)", transition: "all 0.3s" },
  featureGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  featureBox: { background: "rgba(255,255,255,0.95)", borderRadius: "16px", padding: "32px 24px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
  featureIcon: { fontSize: "40px", marginBottom: "16px" },
  featureTitle: { fontSize: "16px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" },
  featureDesc: { fontSize: "13px", color: "#6b7280", lineHeight: "1.5" },
  sessionView: { display: "flex", flexDirection: "column", gap: "24px" },
  mainLayout: { display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px", alignItems: "start" },
  controlPanel: { background: "rgba(255,255,255,0.95)", borderRadius: "16px", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
  controlInfo: { display: "flex", flexDirection: "column", gap: "4px" },
  controlTitle: { fontSize: "16px", fontWeight: 700, color: "#1f2937", margin: 0 },
  roomCodeDisplay: { fontSize: "14px", color: "#6b7280", marginTop: "4px" },
  roomCodeValue: { color: "#667eea", fontSize: "18px", letterSpacing: "2px", fontWeight: 800 },
  controlHint: { fontSize: "12px", color: "#f59e0b", marginTop: "4px", margin: 0 },
  controlButtons: { display: "flex", gap: "12px" },
  controlBtn: { border: "none", borderRadius: "10px", padding: "10px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer", color: "#fff", transition: "all 0.2s" },
  startBtn: { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
  pauseBtn: { background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
  endBtn: { background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" },
  summaryView: { background: "rgba(255,255,255,0.95)", borderRadius: "20px", padding: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" },
  summaryTitle: { fontSize: "28px", fontWeight: 800, color: "#1f2937", marginBottom: "24px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", marginBottom: "32px" },
  statBox: { background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", borderRadius: "12px", padding: "20px", textAlign: "center" },
  statIcon: { fontSize: "28px", marginBottom: "8px" },
  statValue: { fontSize: "24px", fontWeight: 800, color: "#1f2937", marginBottom: "4px" },
  statLabel: { fontSize: "11px", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.5px" },
  summaryList: { marginBottom: "32px" },
  summaryListTitle: { fontSize: "18px", fontWeight: 700, color: "#1f2937", marginBottom: "16px" },
  summaryItem: { background: "#f9fafb", borderRadius: "12px", padding: "20px", marginBottom: "12px", border: "1px solid #e5e7eb" },
  summaryItemHeader: { display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" },
  summaryItemNum: { background: "#1f2937", color: "#fff", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 },
  summaryItemAuthor: { fontSize: "12px", color: "#6b7280", fontWeight: 500 },
  summaryItemText: { fontSize: "15px", color: "#1f2937", lineHeight: "1.6", marginBottom: "12px" },
  summaryAnswer: { background: "#dbeafe", borderRadius: "8px", padding: "12px", marginTop: "12px" },
  summaryAnswerLabel: { fontSize: "11px", color: "#1d4ed8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  summaryAnswerText: { fontSize: "14px", color: "#1f2937", marginTop: "6px", lineHeight: "1.5" },
  badgeAnswered: { background: "#d1fae5", color: "#059669", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 700 },
  badgePending: { background: "#fef3c7", color: "#d97706", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 700 },
  waitingView: { display: "flex", justifyContent: "center", paddingTop: "80px" },
  waitingBox: { background: "rgba(255,255,255,0.95)", borderRadius: "20px", padding: "60px 50px", textAlign: "center", maxWidth: "500px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" },
  waitingIcon: { fontSize: "64px", marginBottom: "20px" },
  waitingTitle: { fontSize: "26px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" },
  waitingText: { fontSize: "15px", color: "#6b7280", marginBottom: "16px" },
  waitingWarning: { fontSize: "13px", color: "#ef4444", fontWeight: 600 },
  cardsHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
  cardsTitle: { fontSize: "24px", fontWeight: 800, color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.2)" },
  cardsCount: { background: "rgba(255,255,255,0.2)", color: "#fff", borderRadius: "20px", padding: "8px 16px", fontSize: "14px", fontWeight: 700 },
  stackContainer: { position: "relative", minHeight: "550px", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "40px", marginBottom: "40px" },
  card: { position: "absolute", left: "50%", width: "90%", maxWidth: "750px", background: "#fff", borderRadius: "20px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)", transformOrigin: "top center" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "2px solid #f3f4f6" },
  cardMeta: { display: "flex", gap: "12px", alignItems: "center" },
  cardNumber: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", borderRadius: "8px", padding: "6px 12px", fontSize: "14px", fontWeight: 800 },
  cardAuthor: { fontSize: "13px", color: "#6b7280", fontWeight: 600 },
  cardBody: { marginBottom: "24px" },
  questionText: { fontSize: "20px", color: "#1f2937", lineHeight: "1.6", fontWeight: 600 },
  answerSection: { display: "flex", flexDirection: "column", gap: "12px" },
  answerLabel: { fontSize: "13px", color: "#374151", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  answerInput: { width: "100%", background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "14px", fontSize: "15px", color: "#1f2937", outline: "none", resize: "vertical", lineHeight: "1.6", fontFamily: "inherit" },
  answerBtn: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px 24px", fontSize: "15px", fontWeight: 700, cursor: "pointer", alignSelf: "flex-start", boxShadow: "0 4px 15px rgba(102,126,234,0.4)" },
  answerDisplay: { background: "#f0fdf4", borderRadius: "12px", padding: "16px" },
  answerText: { fontSize: "15px", color: "#1f2937", lineHeight: "1.6", marginTop: "8px" },
  stackInfo: { marginTop: "24px", textAlign: "center" },
  stackInfoText: { fontSize: "14px", color: "rgba(255,255,255,0.9)", fontWeight: 600 },
  answeredCardStyle: { background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "3px solid #86efac" },
  cardsView: {},
  pendingNumbersBar: { background: "rgba(255,255,255,0.95)", borderRadius: "16px", padding: "16px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
  pendingLabel: { fontSize: "14px", fontWeight: 700, color: "#1f2937" },
  pendingNumbers: { display: "flex", gap: "8px", flexWrap: "wrap" },
  pendingNumber: { background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", color: "#92400e", borderRadius: "8px", padding: "6px 12px", fontSize: "13px", fontWeight: 700, border: "2px solid #fbbf24", transition: "all 0.2s" },
  pendingNumberActive: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", border: "2px solid #667eea", transform: "scale(1.1)" },
  allAnsweredBox: { background: "rgba(255,255,255,0.95)", borderRadius: "20px", padding: "60px 40px", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", marginBottom: "32px" },
  allAnsweredIcon: { fontSize: "64px", marginBottom: "16px" },
  allAnsweredTitle: { fontSize: "28px", fontWeight: 800, color: "#1f2937", marginBottom: "8px" },
  allAnsweredText: { fontSize: "15px", color: "#6b7280" },
  answeredSection: { background: "rgba(255,255,255,0.95)", borderRadius: "20px", padding: "32px", marginTop: "40px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" },
  answeredSectionTitle: { fontSize: "20px", fontWeight: 800, color: "#1f2937", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" },
  answeredList: { display: "flex", flexDirection: "column", gap: "16px" },
  answeredItem: { background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "2px solid #86efac", borderRadius: "16px", padding: "20px", transition: "all 0.2s" },
  answeredItemHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  answeredItemLeft: { display: "flex", gap: "12px", alignItems: "center" },
  answeredItemNumber: { background: "#10b981", color: "#fff", borderRadius: "8px", padding: "6px 12px", fontSize: "14px", fontWeight: 800 },
  answeredItemAuthor: { fontSize: "13px", color: "#6b7280", fontWeight: 600 },
  answeredItemBadge: { background: "#d1fae5", color: "#059669", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 700 },
  answeredItemQuestion: { fontSize: "16px", color: "#1f2937", lineHeight: "1.6", marginBottom: "12px", fontWeight: 600 },
  answeredItemAnswer: { background: "#fff", borderRadius: "12px", padding: "16px", border: "1px solid #d1fae5" },
  answeredItemAnswerLabel: { fontSize: "11px", color: "#059669", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "8px" },
  answeredItemAnswerText: { fontSize: "14px", color: "#374151", lineHeight: "1.6", margin: 0 },
};
