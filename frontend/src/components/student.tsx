import { useState,  } from "react";

type Question = {
  _id?: string;
  text: string;
  anonymous: boolean;
  userId?: string;
  createdAt?: string;
  sessionId?: string;
};

export default function Student() {
  const [sessionCode, setSessionCode] = useState("");
  const [joined, setJoined] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Join session
  const joinSession = async () => {
    try {
      const res = await fetch(`http://localhost:5000/sessions/${sessionCode}/questions`);
      if (!res.ok) throw new Error("Session not found");
      const data: Question[] = await res.json();
      setQuestions(data);
      setJoined(true);
    } catch (err) {
      alert("Invalid session code!");
    }
  };

  // Send question to backend (backend emits to teacher)
  const sendQuestion = () => {
    if (!questionText.trim()) return;

    const question: Question = {
      text: questionText,
      anonymous: isAnonymous,
      sessionId: sessionCode,
      createdAt: new Date().toISOString(),
    };

    fetch("http://localhost:5000/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(question),
    })
      .then((res) => res.json())
      .then(() => setQuestionText("")) // clear input
      .catch(console.error);
  };

  if (!joined) {
    return (
      <div style={{ maxWidth: "400px", margin: "auto" }}>
        <h2>Join Session</h2>
        <input
          type="text"
          placeholder="Enter 3-digit session code"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
          maxLength={3}
          style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
        />
        <button onClick={joinSession} style={{ padding: "8px 16px" }}>
          Join
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>Session {sessionCode}</h2>

      <div style={{ marginBottom: "20px" }}>
        <textarea
          placeholder="Type your question..."
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={3}
          style={{ width: "100%", padding: "8px" }}
        />
        <div style={{ margin: "10px 0" }}>
          <label>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />{" "}
            Ask anonymously
          </label>
        </div>
        <button onClick={sendQuestion} style={{ padding: "8px 16px" }}>
          Send Question
        </button>
      </div>

      {questions.length === 0 && <p>No questions yet...</p>}

      {questions.map((q, index) => (
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
      ))}
    </div>
  );
}