import { useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [credential, setCredential] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"teacher" | "student" | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    }
  }, [navigate]);

  const handleGoogleSuccess = async (response: any) => {
    if (response.credential) {
      setCredential(response.credential);
      setLoading(true);
      setError("");

      try {
        const res = await axios.post("http://localhost:5000/api/auth/google", {
          credential: response.credential,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.user.role === "teacher") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } catch (err: any) {
        if (err.response?.status === 400 && err.response?.data?.message === "Role is required for new users") {
          setShowRoleSelect(true);
        } else {
          setError(err.response?.data?.message || "Authentication failed");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  const handleRoleSubmit = async () => {
    if (!selectedRole) {
      setError("Please select a role");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        credential,
        role: selectedRole,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.card}>
          {/* Header */}
          <div style={s.header}>
            <div style={s.logoIcon}>📚</div>
            <h1 style={s.brandTitle}>Vi-SlideS</h1>
            <p style={s.brandSubtitle}>Question-Driven Learning Platform</p>
          </div>

          {!showRoleSelect ? (
            <>
              <div style={s.welcomeSection}>
                <h2 style={s.welcomeTitle}>Welcome!</h2>
                <p style={s.welcomeText}>
                  Sign in with your Google account to get started
                </p>
              </div>

              <div style={s.googleSection}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>

              {loading && (
                <div style={s.loadingBox}>
                  <div style={s.spinner}></div>
                  <p style={s.loadingText}>Authenticating...</p>
                </div>
              )}

              <div style={s.infoSection}>
                <div style={s.infoCard}>
                  <div style={s.infoIcon}>🆕</div>
                  <div>
                    <p style={s.infoTitle}>New User?</p>
                    <p style={s.infoDesc}>You'll select your role after signing in</p>
                  </div>
                </div>
                <div style={s.infoCard}>
                  <div style={s.infoIcon}>🔄</div>
                  <div>
                    <p style={s.infoTitle}>Returning User?</p>
                    <p style={s.infoDesc}>You'll be redirected automatically</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={s.roleSection}>
              <h2 style={s.roleTitle}>Choose Your Role</h2>
              <p style={s.roleSubtitle}>Select how you'll be using Vi-SlideS</p>

              <div style={s.roleGrid}>
                <div
                  style={{
                    ...s.roleCard,
                    ...(selectedRole === "teacher" ? s.roleCardSelected : {}),
                  }}
                  onClick={() => setSelectedRole("teacher")}
                >
                  <div style={s.roleCardIcon}>👨‍🏫</div>
                  <h3 style={s.roleCardTitle}>Teacher</h3>
                  <p style={s.roleCardDesc}>
                    Create sessions, manage questions, and engage with students
                  </p>
                  {selectedRole === "teacher" && (
                    <div style={s.selectedCheck}>✓</div>
                  )}
                </div>

                <div
                  style={{
                    ...s.roleCard,
                    ...(selectedRole === "student" ? s.roleCardSelected : {}),
                  }}
                  onClick={() => setSelectedRole("student")}
                >
                  <div style={s.roleCardIcon}>🎓</div>
                  <h3 style={s.roleCardTitle}>Student</h3>
                  <p style={s.roleCardDesc}>
                    Join sessions, ask questions, and get instant answers
                  </p>
                  {selectedRole === "student" && (
                    <div style={s.selectedCheck}>✓</div>
                  )}
                </div>
              </div>

              <button
                style={{
                  ...s.continueBtn,
                  opacity: !selectedRole || loading ? 0.5 : 1,
                }}
                onClick={handleRoleSubmit}
                disabled={!selectedRole || loading}
              >
                {loading ? "Creating Account..." : "Continue →"}
              </button>

              <button
                style={s.backBtn}
                onClick={() => {
                  setShowRoleSelect(false);
                  setSelectedRole("");
                  setCredential("");
                  setError("");
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          )}

          {error && (
            <div style={s.errorBox}>
              <span style={s.errorIcon}>⚠️</span>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <p style={s.footerText}>
            Powered by Vi-SlideS · Interactive Q&A for Modern Classrooms
          </p>
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "480px",
  },
  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "48px 40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  header: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logoIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  brandTitle: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#1f2937",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  brandSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
    fontWeight: 500,
  },
  welcomeSection: {
    textAlign: "center",
    marginBottom: "32px",
  },
  welcomeTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 8px 0",
  },
  welcomeText: {
    fontSize: "15px",
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.5",
  },
  googleSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },
  loadingBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "16px",
    background: "#f9fafb",
    borderRadius: "12px",
    marginBottom: "24px",
  },
  loadingText: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
    fontWeight: 500,
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "3px solid #e5e7eb",
    borderTop: "3px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  infoCard: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    background: "#f9fafb",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  infoIcon: {
    fontSize: "24px",
  },
  infoTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 4px 0",
  },
  infoDesc: {
    fontSize: "13px",
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.4",
  },
  roleSection: {
    marginTop: "8px",
  },
  roleTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 8px 0",
    textAlign: "center",
  },
  roleSubtitle: {
    fontSize: "14px",
    color: "#6b7280",
    margin: "0 0 32px 0",
    textAlign: "center",
  },
  roleGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
  },
  roleCard: {
    padding: "24px 16px",
    border: "2px solid #e5e7eb",
    borderRadius: "16px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
    background: "#fff",
  },
  roleCardSelected: {
    border: "2px solid #667eea",
    background: "linear-gradient(135deg, #f3f4ff 0%, #e8eaff 100%)",
    transform: "scale(1.02)",
  },
  roleCardIcon: {
    fontSize: "40px",
    marginBottom: "12px",
  },
  roleCardTitle: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1f2937",
    margin: "0 0 8px 0",
  },
  roleCardDesc: {
    fontSize: "12px",
    color: "#6b7280",
    margin: 0,
    lineHeight: "1.4",
  },
  selectedCheck: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#667eea",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 700,
  },
  continueBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "12px",
    boxShadow: "0 4px 15px rgba(102,126,234,0.4)",
  },
  backBtn: {
    width: "100%",
    background: "transparent",
    color: "#6b7280",
    border: "2px solid #e5e7eb",
    borderRadius: "12px",
    padding: "14px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  errorBox: {
    background: "#fef2f2",
    border: "2px solid #fecaca",
    borderRadius: "12px",
    padding: "14px 16px",
    color: "#dc2626",
    fontSize: "14px",
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontWeight: 500,
  },
  errorIcon: {
    fontSize: "18px",
  },
  footer: {
    textAlign: "center",
    marginTop: "24px",
  },
  footerText: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.8)",
    margin: 0,
  },
};
