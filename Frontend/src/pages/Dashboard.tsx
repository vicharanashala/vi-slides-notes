import { useAuth } from "@/context/AuthContext";
import TeacherDashboard from "@/components/teacher-dashboard";


export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "Instructor") {
    return <TeacherDashboard />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Spacer to reserve space for header (height matches header you would have had) */}
      <div className="h-24 md:h-28" />
      
    </div>
  );
}