import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Question = {
  _id?: string;
  text: string;
  userId?: string;
  anonymous: boolean;
  sessionId?: string;
  createdAt?: string;
};

export default function Teacher() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Generate 3-digit session code
  const generateSessionCode = () =>
    Math.floor(100 + Math.random() * 900).toString();

  // CONNECT TO SESSION (Socket + fetch questions)
  const connectToSession = async (code: string) => {
    try {
      setLoading(true);
      setSessionError(null);

      // Fetch existing questions
      const questionsRes = await fetch(
        `http://localhost:5000/sessions/${code}/questions`
      );
      if (!questionsRes.ok) throw new Error("Failed to fetch questions");
      const data = await questionsRes.json();
      setQuestions(Array.isArray(data) ? data : []);

      // Connect Socket.IO
      const newSocket = io("http://localhost:5000");
      setSocket(newSocket);
      newSocket.emit("join_session", code);

      newSocket.on("new_question", (q: Question) => {
        setQuestions((prev) => [q, ...prev]);
      });

      setSessionCode(code);
    } catch (err) {
      console.error(err);
      setSessionError("Unable to join session.");
    } finally {
      setLoading(false);
    }
  };

  // CREATE NEW SESSION
  const createNewSession = async () => {
    try {
      setLoading(true);
      const code = generateSessionCode();
      const res = await fetch("http://localhost:5000/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create session");
      }

      await connectToSession(code); // Automatically connect after creating
    } catch (err: any) {
      console.error(err);
      setSessionError(err.message || "Unable to create session");
    } finally {
      setLoading(false);
    }
  };

  // JOIN EXISTING SESSION
  const joinExistingSession = async (code: string) => {
    if (!code) return;
    try {
      setLoading(true);
      setSessionError(null);

      const res = await fetch(`http://localhost:5000/sessions/${code}`);
      if (!res.ok) {
        setSessionError("Session code does not exist.");
        return;
      }

      await connectToSession(code); // Automatically connect
    } catch (err) {
      console.error(err);
      setSessionError("Unable to join session. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // CLEANUP SOCKET ON UNMOUNT
  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  // BEFORE SESSION SELECTED
  if (!sessionCode) {
    return (
      <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
        <h2>Teacher Dashboard</h2>

        <input
          type="text"
          placeholder="Enter existing 3-digit session code"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          maxLength={3}
          style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
        />

        {sessionError && (
          <p style={{ color: "red", marginBottom: "10px" }}>{sessionError}</p>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button
            style={{ padding: "8px 16px" }}
            onClick={() => joinExistingSession(inputCode.trim())}
          >
            Join Existing
          </button>
          <button style={{ padding: "8px 16px" }} onClick={createNewSession}>
            Create New Session
          </button>
        </div>
      </div>
    );
  }

  // AFTER SESSION SELECTED
  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Teacher Dashboard</h2>
      <p>
        Session Code: <strong>{sessionCode}</strong>
      </p>

      <button
        style={{ padding: "6px 12px", marginBottom: "10px" }}
        onClick={() => {
          socket?.disconnect();
          setSocket(null);
          setQuestions([]);
          setSessionCode(null);
          setInputCode("");
        }}
      >
        ← Back to Session Selection
      </button>

      {loading ? (
        <p>Loading questions...</p>
      ) : questions.length === 0 ? (
        <p>No questions yet...</p>
      ) : (
        questions.map((q, index) => (
          <div
            key={q._id || index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: 0 }}>{q.text}</p>
            <small>{q.anonymous ? "Anonymous" : q.userId || "Unknown"}</small>
          </div>
        ))
      )}
    </div>
  );
}