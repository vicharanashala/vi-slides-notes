import { useEffect, useState } from "react";
import { socket } from "../services/socket";

interface Question {
  _id: string;
  content: string;
  refinedContent?: string;
  isDirectToTeacher: boolean;
  user?: string;
  guestName?: string;
}

export default function TeacherDashboard({ sessionId }: { sessionId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    socket.emit("join_session", sessionId);

    socket.on("new_question", (question: Question) => {
      setQuestions((prev) => [question, ...prev]);
    });

    return () => {
      socket.off("new_question");
    };
  }, [sessionId]);

  return (
    <div>
      <h2>Live Questions</h2>

      {questions.map((q) => (
        <div key={q._id} style={styles.card}>
          <p>{q.refinedContent || q.content}</p>

          <small>
            {q.isDirectToTeacher
              ? "Private"
              : q.guestName || q.user || "Student"}
          </small>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    padding: "10px",
    border: "1px solid #ddd",
    marginBottom: "10px",
  },
};