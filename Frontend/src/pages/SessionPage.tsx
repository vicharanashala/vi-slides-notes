import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/question-sidebar";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import type { GetClassResponse } from "@/lib/api";
import { getClassById } from "@/lib/api";

const SessionPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<GetClassResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) return;

    const fetchClass = async () => {
      try {
        setLoading(true);

        const res = await getClassById(classId);
        setClassData(res.data);

        // Optional: redirect if class is not live
        if (!res.data.isLive) {
          alert("Session has ended");
          navigate("/dashboard");
        }

      } catch (err: any) {
        console.error("Failed to fetch class:", err);
        setError(err?.response?.data?.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classId, navigate]);

  // Loading UI
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  // Error UI
  if (error || !classData) {
    return (
      <div className="flex items-center justify-center min-h-dvh text-muted-foreground">
        {error || "Session not found"}
      </div>
    );
  }

  return (
    <SidebarProvider>

      {/* SIDEBAR */}
      {/* 
        TODO: Replace with real-time questions (WebSocket/API)
        - live student questions
        - upvotes / priority
      */}
      <AppSidebar
        questions={[
          { id: "1", title: "What is probability?" },
          { id: "2", title: "Explain Bayes theorem" },
        ]}
        activeId="1"
        onSelect={(id) => console.log(id)}
      />

      {/* MAIN */}
      <SidebarInset className="bg-transparent">
        <div className="min-h-screen flex flex-col">

          {/* TOPBAR */}
          <Topbar
            sessionName={classData.title}
            code={classData.classCode}
            classId={classData._id}
          />

          {/* CONTENT */}
          <div className="flex-1 p-6">
            <Card className="h-full card-glass p-6">

              {/* 
                FEATURE: Role-based Question Interaction UI

                Instructor View:
                - Slideable question cards
                - Answer + AI assist
                - Mark resolved

                Student View:
                - Ask question
                - Edit/Delete own question
              */}

              <p className="text-muted-foreground">
                Question Content Here
              </p>

            </Card>
          </div>

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SessionPage;