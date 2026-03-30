import { CertificatesCard, AssignmentsCard, JoinSessionCard } from "./student-card";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "@/components/NotificationBell";
import { Card, CardContent } from "@/components/ui/card";
import TodoButton from "@/components/todo-button";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-dvh px-4 py-12">
      <div className="mx-auto w-full max-w-7xl flex flex-col gap-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gradient">
              Student Dashboard
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Here's a quick overview of your activity.
            </p>
          </div>
            <div className="flex items-center gap-0">
              <TodoButton />
              <NotificationBell />
            </div>
        </div>

        {/* Welcome card */}
        <Card className="card-glass group hover:scale-[1.02] transition-all duration-300">
          <CardContent className="p-10">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-1">
              Welcome, {user?.fullname}
            </h2>
            <p className="text-base text-muted-foreground">
              Join a session to start asking questions!
            </p>
          </CardContent>
        </Card>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <JoinSessionCard />
          <AssignmentsCard />
          <CertificatesCard />
        </div>

      </div>
    </div>
  );
}
