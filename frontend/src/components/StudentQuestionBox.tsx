import { useEffect, useState } from "react";
import api from "../services/api";
import { socket } from "../services/socket";

interface Props {
  sessionId: string;
  user?: { _id: string; name: string };
}

export default function StudentQuestionBox({ sessionId, user }: Props) {
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.emit("join_session", sessionId);
  }, [sessionId]);

  const handleSubmit = async () => {
    if (!text.trim()) return;


  console.log("Sending:", {
    content: text,
    sessionId: sessionId
  });

    setLoading(true);
    try {
      await api.post("/questions/submit", {
        content: text,
        sessionId: sessionId
      });

      setText("");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <textarea
        placeholder="Ask your question..."
        value={text}
        autoFocus
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        style={styles.textarea}
      />

      <div style={styles.footer}>
        <label>
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
          />
          Ask anonymously
        </label>

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Sending..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

console.log("StudentQuestionBox loaded");

const styles = {
  container: {
    maxWidth: "500px",
    margin: "auto",
    padding: "1rem",
  },
  textarea: {
    width: "100%",
    height: "100px",
    padding: "10px",
    fontSize: "16px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
};