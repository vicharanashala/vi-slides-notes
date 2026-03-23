import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/navbar";
import TeacherDashboard from "@/components/teacher-dashboard";
import StudentDashboard from "@/components/student-dashboard";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.fullname}</h1>
      {user?.role === "Instructor" ? (
        <p>You are logged in as an Instructor</p>
      ) : (
        <p>You are logged in as a Student</p>
      )}

      <Navbar />
      <main className="pt-18">
        {/* Render role-based dashboard */}
        {user?.role === "Instructor" ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard />
        )}
      </main>
    </div>
  );
}