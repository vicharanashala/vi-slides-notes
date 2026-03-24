import StudentQuestionBox from "../components/StudentQuestionBox";

export default function StudentPage() {
  return (
    <div>
      <h1>Student Session</h1>

      <StudentQuestionBox
        sessionId="123"
        user={{ _id: "1", name: "Student" }}
      />
    </div>
  );
}