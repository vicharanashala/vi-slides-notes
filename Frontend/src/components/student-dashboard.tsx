import { CertificatesCard, AssignmentsCard, JoinSessionCard } from "./student-card";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboard() {
  const { user } = useAuth();

  const cardClass = "rounded-2xl bg-black/40 border border-[#24273b] backdrop-blur-md";

  return (
    <div className="py-12 px-8 max-w-7xl mx-auto">
      
      <div className={`${cardClass} mb-10 px-10 py-10 shadow-lg`}>
        <h1 className="text-4xl md:text-5xl font-bold mb-2 text-gradient">
          Welcome, {user?.fullname}
        </h1>
        <p className="text-lg text-gray-300">
          Join a session to start asking questions!
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <JoinSessionCard />
        <AssignmentsCard />
        <CertificatesCard />
      </div>
    </div>
  );
}

