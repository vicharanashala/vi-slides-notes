import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/navbar";
import StudentDashboard from "@/components/student-dashboard";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === "Instructor" ? (
        <p>You are logged in as an Instructor</p>
      ) : (
        <p>You are logged in as a Student</p>
      )}
      <Navbar />
      <main className="pt-18">
        {user?.role === "Instructor" ? (
          <p>You are logged in as an Instructor</p>
        ) : (
          <StudentDashboard/>
        )}
      </main>
    </div>
  );
}