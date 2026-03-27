import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/question-sidebar";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import type { GetClassResponse } from "@/lib/api";
import { getClassById } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";

const SessionPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<GetClassResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sharedFile, setSharedFile] = useState<any | null>(null);

  const [questions, setQuestions] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>();

  const activeQuestion = questions.find((q) => q.id === activeId);
  
  const { user } = useAuth();

  useEffect(() => {
    if (!classId) return;

    const fetchClass = async () => {
      try {
        setLoading(true);

        const res = await getClassById(classId);
        setClassData(res.data);

        if (!res.data.isLive) {
          alert("Session has ended");
          navigate("/dashboard");
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [classId, navigate]);

useEffect(() => {
  if (!classId) return;

  const socket = getSocket();

  const handleUserJoined = (data: { userId: string }) => console.log("User joined:", data.userId);
  const handleUserLeft = (data: { userId: string }) => console.log("User left:", data.userId);
  const handleClassStarted = () => console.log("Class started");
  const handleClassEnded = (data: { classId: string }) => {
    if (data.classId !== classId) return; 

    alert("Session ended by instructor");
    const socket = getSocket();
    socket.disconnect(); 
    navigate("/dashboard");
  };

  const handleNewFile = (file: any) => {
  setSharedFile(file); // replace previous file
};

socket.on("new_file_shared", handleNewFile);

  const handleAllQuestions = (data: any[]) => {
    setQuestions(data);
  };

  const handleNewQuestion = (q: any) => {
    setQuestions((prev) => [...prev, q]);
  };

  const handleQuestionAnswered = ({ questionId, answer }: any) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      )
    );
  };

  socket.on("all_questions", handleAllQuestions);
  socket.on("new_question", handleNewQuestion);
  socket.on("question_answered", handleQuestionAnswered);

  const joinRoom = () => {
    socket.emit("join_class_room", { classId });
  };

  socket.on("user_joined", handleUserJoined);
  socket.on("user_left", handleUserLeft);
  socket.on("class_started", handleClassStarted);
  socket.on("class_ended", handleClassEnded);

  if (socket.connected) {
    joinRoom();
  } else {
    socket.once("connect", joinRoom);
    
  }

  return () => {
    socket.off("user_joined", handleUserJoined);
    socket.off("user_left", handleUserLeft);
    socket.off("class_started", handleClassStarted);
    socket.off("class_ended", handleClassEnded);
    socket.off("connect", joinRoom);
    socket.off("all_questions", handleAllQuestions);
    socket.off("new_question", handleNewQuestion);
    socket.off("question_answered", handleQuestionAnswered);
    socket.off("new_file_shared", handleNewFile);
  };
}, [classId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="flex items-center justify-center min-h-dvh text-muted-foreground">
        {error || "Session not found"}
      </div>
    );
  }

  

  return (
    <SidebarProvider>
      <AppSidebar
        questions={questions}
        activeId={activeId}
        onSelect={setActiveId}
        role={classData.instructor === user?._id ? "Instructor" : "Student"}
        onAskQuestion={(text) => {
          const socket = getSocket();
          socket.emit("ask_question", {
            classId,
            question: text,
          });
        }}
        onAnswerQuestion={(id, answer) => {
          const socket = getSocket();
          socket.emit("answer_question", {
            classId,
            questionId: id,
            answer,
          });
        }}
      />

      <SidebarInset className="bg-transparent">
        <div className="min-h-screen flex flex-col">
          <Topbar
  sessionName={classData.title}
  code={classData.classCode}
  classId={classData._id}
  onShareFile={(file) => {
    const socket = getSocket();
    socket.emit("share_file", {
      classId,
      file,
    });
  }}
/>

          <div className="flex-1 p-6">
            <Card className="h-full flex flex-col p-4 gap-4">

  {sharedFile ? (
    <>
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-sm font-semibold truncate">
          {sharedFile.name}
        </h2>
        <span className="text-xs text-muted-foreground">
          Live Preview
        </span>
      </div>

      {/* FILE VIEW */}
      <div className="flex-1 w-full h-full bg-muted rounded overflow-hidden">
        <iframe
          src={sharedFile.url}
          className="w-full h-full"
        />
      </div>
    </>
  ) : (
    <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
      No content shared yet
    </div>
  )}

</Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SessionPage;