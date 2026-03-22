import { useAuth } from "@/context/AuthContext";
import StudentDashboard from "@/components/student-dashboard";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <h1>Please log in to view your dashboard</h1>;
  }

   return (
    <div className="p-6">
      <StudentDashboard />
    </div>
  );
}