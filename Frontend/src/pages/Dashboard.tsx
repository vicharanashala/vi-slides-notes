import { useAuth } from "@/context/AuthContext";
import TeacherDashboard from "@/components/teacher-dashboard";


export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "Instructor") {
    return <TeacherDashboard />;
  }

  
}