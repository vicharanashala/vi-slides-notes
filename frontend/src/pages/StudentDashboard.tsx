import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

interface SubmittedQuestion {
  id: string;
  text: string;
  status: "pending" | "answered";
  answer?: string | null;
  time: string;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !user.id) {
      navigate("/login");
    } else if (user.role !== "student") {
      navigate("/teacher/dashboard");
    }
  }, [token, user.id, user.role, navigate]);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [qError, setQError] = useState("");
  const [submittedQuestions, setSubmittedQuestions] = useState<SubmittedQuestion[]>([]);

  const logout = () => {
    if (sessionId) {
      socket.emit("leave-room", sessionId);
    }
    localStorage.clear();
    navigate("/login");
  };

  const leaveSession = () => {
    if (sessionId) {
      socket.emit("leave-room", sessionId);
    }
    setJoined(false);
    setSessionId("");
    setCode("");
    setQuestion("");
    setSubmittedQuestions([]);
    setQError("");
    setError("");
  };

  useEffect(() => {
    if (!sessionId) return;
    socket.emit("join-room", sessionId);

    socket.on("session-status", (status: string) => {
      if (status === "paused") setQError("Session is paused by teacher");
      if (status === "ended") {
        setQError("Session has ended by teacher");
        // Return to join page after 2 seconds
        setTimeout(() => {
          leaveSession();
        }, 2000);
      }
      if (status === "active") setQError("");
    });

    socket.on("question-answered", (answeredQ: any) => {
      if (answeredQ.status === "answered") {
        setSubmittedQuestions((prev) =>
          prev.map((q) =>
            q.id === answeredQ._id
              ? {
                  ...q,
                  status: "answered",
                  answer: answeredQ.answer,
                }
              : q
          )
        );
      }
    });

    return () => {
      socket.off("session-status");
      socket.off("question-answered");
    };
  }, [sessionId]);

  const joinSession = async () => {
    if (!code.trim()) return setError("Please enter a session code");
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/session/join",
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessionId(res.data.session._id);
      setJoined(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to join session");
    } finally {
      setLoading(false);
    }
  };

  const submitQuestion = async () => {
    if (!question.trim()) return setQError("Please enter a question");
    setSubmitting(true);
    setQError("");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/question/submit",
        { sessionId, text: question },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const q = res.data.question;
      const newQ: SubmittedQuestion = {
        id: q._id,
        text: q.text,
        status: q.status,
        answer: null,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setSubmittedQuestions((prev) => [newQ, ...prev]);
      setQuestion("");
    } catch (err: any) {
      setQError(err.response?.data?.message || "Failed to submit question");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: string) => {
    if (status === "answered")
      return {
        label: "✓ Answered",
        bg: "#d1fae5",
        color: "#059669",
      };
    return {
      label: "○ Pending",
      bg: "#fef3c7",
      color: "#d97706",
    };
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.logoIcon}>📚</div>
          <div>
            <h1 style={s.brandName}>Vi-SlideS</h1>
            <p style={s.brandTagline}>Student Portal</p>
          </div>
        </div>
        <div style={s.headerRight}>
          {joined && (
            <>
              <div style={s.codeBox}>
                <span style={s.codeLabel}>Session</span>
                <span style={s.codeValue}>{code}</span>
              </div>
              <button style={s.leaveBtn} onClick={leaveSession}>
                Leave Session
              </button>
            </>
          )}
          <div style={s.profileMenu}>
            <div style={s.avatar}>{user.name?.[0]?.toUpperCase()}</div>
            <button style={s.logoutLink} onClick={logout}>Exit</button>
          </div>
        </div>
      </div>

      <div style={s.container}>
        {!joined ? (
          <div style={s.joinView}>
            <div style={s.joinCard}>
              <div style={s.joinIcon}>🎓</div>
              <h2 style={s.joinTitle}>Join a Session</h2>
              <p style={s.joinText}>Enter the session code provided by your teacher to get started</p>
              
              <div style={s.inputGroup}>
                <label style={s.inputLabel}>Session Code</label>
                <input
                  style={s.codeInput}
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  onKeyPress={(e) => e.key === "Enter" && joinSession()}
                />
              </div>

              {error && (
                <div style={s.errorBox}>
                  <span style={s.errorIcon}>⚠️</span>
                  {error}
                </div>
              )}

              <button
                style={{
                  ...s.joinBtn,
                  opacity: loading ? 0.6 : 1,
                }}
                onClick={joinSession}
                disabled={loading}
              >
                {loading ? "Joining..." : "Join Session →"}
              </button>
            </div>

            <div style={s.infoGrid}>
              {[
                { icon: "💬", title: "Ask Questions", desc: "Submit your questions anytime during the session" },
                { icon: "⚡", title: "Instant Answers", desc: "Get responses from your teacher in real-time" },
                { icon: "📊", title: "Track Progress", desc: "View all your questions and answers in one place" },
              ].map(item => (
                <div key={item.title} style={s.infoCard}>
                  <div style={s.infoIcon}>{item.icon}</div>
                  <h3 style={s.infoTitle}>{item.title}</h3>
                  <p style={s.infoDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={s.sessionView}>
            {/* Left - Submit Question */}
            <div style={s.leftPanel}>
              <div style={s.submitCard}>
                <h3 style={s.submitTitle}>Submit Your Question</h3>
                <p style={s.submitDesc}>Ask anything related to the topic being discussed</p>

                <div style={s.inputGroup}>
                  <label style={s.inputLabel}>Your Question</label>
                  <textarea
                    style={s.questionInput}
                    placeholder="What would you like to know?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={4}
                  />
                </div>

                {qError && (
                  <div style={s.errorBox}>
                    <span style={s.errorIcon}>⚠️</span>
                    {qError}
                  </div>
                )}

                <button
                  style={{
                    ...s.submitBtn,
                    opacity: submitting || !question.trim() ? 0.5 : 1,
                  }}
                  onClick={submitQuestion}
                  disabled={submitting || !question.trim()}
                >
                  {submitting ? "Submitting..." : "Submit Question →"}
                </button>
              </div>

              {/* Student Info */}
              <div style={s.studentCard}>
                <div style={s.studentInfo}>
                  <div style={s.studentAvatar}>{user.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <p style={s.studentName}>{user.name}</p>
                    <p style={s.studentRole}>Student</p>
                  </div>
                </div>
                <div style={s.statusNote}>
                   Submitting as {user.name}
                </div>
              </div>
            </div>

            {/* Right - Question History */}
            <div style={s.rightPanel}>
              <div style={s.historyCard}>
                <div style={s.historyHeader}>
                  <h3 style={s.historyTitle}>My Questions</h3>
                  <div style={s.historyCount}>
                    {submittedQuestions.length} {submittedQuestions.length === 1 ? "question" : "questions"}
                  </div>
                </div>

                {submittedQuestions.length === 0 ? (
                  <div style={s.emptyState}>
                    <div style={s.emptyIcon}>💭</div>
                    <p style={s.emptyTitle}>No questions yet</p>
                    <p style={s.emptyDesc}>Your submitted questions will appear here</p>
                  </div>
                ) : (
                  <div style={s.questionsList}>
                    {submittedQuestions.map((q, i) => {
                      const sc = getStatusConfig(q.status);
                      return (
                        <div key={q.id} style={s.questionItem}>
                          <div style={s.questionItemHeader}>
                            <div style={s.questionItemLeft}>
                              <span style={s.questionItemNum}>Q{submittedQuestions.length - i}</span>
                            </div>
                            <div style={s.questionItemRight}>
                              <span style={{ ...s.statusBadge, background: sc.bg, color: sc.color }}>
                                {sc.label}
                              </span>
                              <span style={s.timeTag}>{q.time}</span>
                            </div>
                          </div>

                          <p style={s.questionItemText}>{q.text}</p>

                          {q.status === "answered" && q.answer && (
                            <div style={s.answerBox}>
                              <p style={s.answerLabel}>✓ TEACHER'S RESPONSE</p>
                              <p style={s.answerText}>{q.answer}</p>
                            </div>
                          )}

                          {q.status === "pending" && (
                            <div style={s.pendingBox}>
                              <p style={s.pendingText}>⏳ Waiting for teacher's response...</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #427AB5 0%, #406AAF 100%)", fontFamily: "'Inter', sans-serif" },
  header: { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(0,0,0,0.1)", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,0.1)" },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logoIcon: { fontSize: "32px" },
  brandName: { fontSize: "22px", fontWeight: 800, color: "#1f2937", margin: 0, letterSpacing: "-0.5px" },
  brandTagline: { fontSize: "11px", color: "#6b7280", margin: 0, fontWeight: 500 },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  codeBox: { background: "linear-gradient(135deg, #427AB5 0%, #406AAF 100%)", borderRadius: "10px", padding: "8px 16px", display: "flex", flexDirection: "column", alignItems: "center" },
  codeLabel: { fontSize: "10px", color: "rgba(255,255,255,0.8)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" },
  codeValue: { fontSize: "16px", color: "#fff", fontWeight: 800, letterSpacing: "2px" },
  profileMenu: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #427AB5 0%, #406AAF 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "16px" },
  leaveBtn: { background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600, transition: "all 0.2s" },
  logoutLink: { background: "transparent", border: "2px solid #e5e7eb", color: "#374151", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  container: { padding: "40px 32px", maxWidth: "1400px", margin: "0 auto" },
  joinView: { display: "flex", flexDirection: "column", gap: "32px" },
  joinCard: { background: "#fff", borderRadius: "20px", padding: "60px 50px", textAlign: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", maxWidth: "500px", margin: "0 auto", width: "100%" },
  joinIcon: { fontSize: "64px", marginBottom: "20px" },
  joinTitle: { fontSize: "28px", fontWeight: 800, color: "#1f2937", marginBottom: "12px" },
  joinText: { fontSize: "15px", color: "#6b7280", marginBottom: "32px", lineHeight: "1.6" },
  inputGroup: { marginBottom: "20px", textAlign: "left" },
  inputLabel: { fontSize: "13px", fontWeight: 700, color: "#1f2937", marginBottom: "8px", display: "block", textTransform: "uppercase", letterSpacing: "0.5px" },
  codeInput: { width: "100%", background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "16px", fontSize: "24px", fontWeight: 800, textAlign: "center", letterSpacing: "4px", color: "#1f2937", outline: "none", textTransform: "uppercase" },
  joinBtn: { width: "100%", background: "linear-gradient(135deg, #427AB5 0%, #406AAF 100%)", color: "#fff", border: "none", borderRadius: "12px", padding: "16px", fontSize: "16px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px rgba(66,122,181,0.4)" },
  errorBox: { background: "#fef2f2", border: "2px solid #fecaca", borderRadius: "12px", padding: "14px 16px", color: "#dc2626", fontSize: "14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 500 },
  errorIcon: { fontSize: "18px" },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" },
  infoCard: { background: "rgba(255,255,255,0.95)", borderRadius: "16px", padding: "32px 24px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
  infoIcon: { fontSize: "40px", marginBottom: "16px" },
  infoTitle: { fontSize: "16px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" },
  infoDesc: { fontSize: "13px", color: "#6b7280", lineHeight: "1.5" },
  sessionView: { display: "grid", gridTemplateColumns: "400px 1fr", gap: "24px" },
  leftPanel: { display: "flex", flexDirection: "column", gap: "16px" },
  submitCard: { background: "rgba(255,255,255,0.95)", borderRadius: "20px", padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)" },
  submitTitle: { fontSize: "20px", fontWeight: 800, color: "#1f2937", marginBottom: "8px" },
  submitDesc: { fontSize: "13px", color: "#6b7280", marginBottom: "24px" },
  questionInput: { width: "100%", background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: "12px", padding: "14px", fontSize: "15px", color: "#1f2937", outline: "none", resize: "vertical", lineHeight: "1.6", fontFamily: "inherit" },
  submitBtn: { width: "100%", background: "linear-gradient(135deg, #427AB5 0%, #406AAF 100%)", color: "#fff", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px rgba(66,122,181,0.4)" },
  studentCard: { background: "rgba(255,255,255,0.95)", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
  studentInfo: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" },
  studentAvatar: { width: "48px", height: "48px", borderRadius: "50%", background: "linear-gradient(135deg, #427AB5 0%, #406AAF 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "20px" },
  studentName: { fontSize: "16px", fontWeight: 700, color: "#1f2937", margin: 0 },
  studentRole: { fontSize: "13px", color: "#6b7280", margin: 0 },
  statusNote: { background: "#f9fafb", borderRadius: "8px", padding: "12px", fontSize: "13px", color: "#6b7280", textAlign: "center" },
  rightPanel: { flex: 1 },
  historyCard: { background: "rgba(255,255,255,0.95)", borderRadius: "20px", padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", minHeight: "600px" },
  historyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" },
  historyTitle: { fontSize: "20px", fontWeight: 800, color: "#1f2937", margin: 0 },
  historyCount: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 14px", fontSize: "13px", color: "#6b7280", fontWeight: 600 },
  emptyState: { textAlign: "center", padding: "80px 20px" },
  emptyIcon: { fontSize: "64px", marginBottom: "16px" },
  emptyTitle: { fontSize: "18px", fontWeight: 700, color: "#1f2937", marginBottom: "8px" },
  emptyDesc: { fontSize: "14px", color: "#6b7280" },
  questionsList: { display: "flex", flexDirection: "column", gap: "16px" },
  questionItem: { background: "#f9fafb", border: "2px solid #e5e7eb", borderRadius: "16px", padding: "20px", transition: "all 0.2s" },
  questionItemHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" },
  questionItemLeft: { display: "flex", gap: "8px", alignItems: "center" },
  questionItemNum: { background: "#427AB5", color: "#fff", borderRadius: "8px", padding: "4px 10px", fontSize: "12px", fontWeight: 800 },
  questionItemRight: { display: "flex", gap: "8px", alignItems: "center" },
  statusBadge: { borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: 700 },
  timeTag: { fontSize: "11px", color: "#9ca3af", fontWeight: 500 },
  questionItemText: { fontSize: "15px", color: "#1f2937", lineHeight: "1.6", marginBottom: "12px", fontWeight: 500 },
  answerBox: { background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "2px solid #86efac", borderRadius: "12px", padding: "16px" },
  answerLabel: { fontSize: "11px", color: "#059669", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" },
  answerText: { fontSize: "14px", color: "#1f2937", lineHeight: "1.6", margin: 0 },
  pendingBox: { background: "#fef3c7", border: "2px solid #fde68a", borderRadius: "12px", padding: "14px" },
  pendingText: { fontSize: "13px", color: "#92400e", fontWeight: 600, margin: 0 },
};
