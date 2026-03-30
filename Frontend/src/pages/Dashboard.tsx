import { useAuth } from "@/context/AuthContext";
import TeacherDashboard from "@/components/teacher-dashboard";

import Navbar from "@/components/navbar";
import StudentDashboard from "@/components/student-dashboard";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      <main className="pt-18">
        {user?.role === "Instructor" ? (
          <TeacherDashboard />
        ) : (
          <StudentDashboard/>
        )}
      </main>
    </div>
  );
}