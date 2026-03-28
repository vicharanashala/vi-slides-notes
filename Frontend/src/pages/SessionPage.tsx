import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/question-sidebar";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import type { GetClassResponse } from "@/lib/api";
import { getClassById } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";
import Whiteboard from "@/components/Whiteboard";

const SessionPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<GetClassResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sharedFile, setSharedFile] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>();

  const { user } = useAuth();
  const isTeacher = classData?.instructor === user?._id;
  const [showWhiteboard, setShowWhiteboard] = useState(false); 

  // ================== REFS ==================
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const localStream = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const iceQueue = useRef<RTCIceCandidate[]>([]);

  // ================== FETCH CLASS ==================
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

  // ================== STREAM HELPERS ==================
  const handleStreamStarted = async (stream: MediaStream) => {
    localStream.current = stream;
    const socket = getSocket();
    for (const [studentId, pc] of Object.entries(peerConnections.current)) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", { to: studentId, offer });
    }
  };

  const handleStreamStopped = () => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => track.stop());
    }
    localStream.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    Object.values(peerConnections.current).forEach(pc => {
      pc.getSenders().forEach(sender => pc.removeTrack(sender));
    });
  };

  // ================== SOCKET + WEBRTC ==================
  useEffect(() => {
    if (!classId) return;

    const socket = getSocket();
    const rtcConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

    const handleClassEnded = (data: { classId: string }) => {
      // Logic fix: Sometimes data comes as an object, sometimes just a string depending on backend
      const incomingId = typeof data === 'string' ? data : data.classId;
      if (incomingId !== classId) return;
      if (isTeacher) handleStreamStopped();

      alert("Session ended by instructor");
      socket.emit("leave_class_room", { classId }); // Clean up room on server
      navigate("/dashboard");
    };

    const handleStudentJoined = async ({ studentId }: any) => {
      if (!isTeacher) return;
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnections.current[studentId] = pc;
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => pc.addTrack(track, localStream.current!));
      }
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc_ice_candidate", { to: studentId, candidate: event.candidate });
        }
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", { to: studentId, offer });
    };

    const handleOffer = async ({ offer, from }: any ) => {
      if (isTeacher) return;
      const pc = new RTCPeerConnection(rtcConfig);
      pcRef.current = pc;
      pc.ontrack = (event) => {
        if (videoRef.current) videoRef.current.srcObject = event.streams[0];
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc_ice_candidate", { to: from, candidate: event.candidate });
        }
      };
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      iceQueue.current.forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)));
      iceQueue.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc_answer", { to: from, answer });
    };

    const handleAnswer = async ({ from, answer }: any) => {
      const pc = peerConnections.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIce = async ({ from, candidate }: any) => {
      const targetPc = isTeacher ? peerConnections.current[from] : pcRef.current;
      if (targetPc?.remoteDescription) {
        targetPc.addIceCandidate(new RTCIceCandidate(candidate));
      } else if (!isTeacher) {
        iceQueue.current.push(candidate);
      }
    };

    const handleClassStopped = () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    const handleNewFile = (file: any) => setSharedFile(file);
    const handleAllQuestions = (data: any[]) => setQuestions(data);
    
    const handleNewQuestion = (q: any) => {
      setQuestions((prev) => {
        const qId = q.id || q._id;
        if (prev.some((existing) => (existing.id || existing._id) === qId)) return prev;
        return [...prev, q];
      });
    };

    const handleQuestionAnswered = ({ questionId, answer }: any) => {
      setQuestions((prev) => 
        prev.map((q) => {
          const qId = q.id || q._id;
          return qId === questionId ? { ...q, answer } : q;
        })
      );
    };

    // Attach Listeners
    socket.on("class_ended", handleClassEnded);
    socket.on("student_joined", handleStudentJoined);
    socket.on("webrtc_offer", handleOffer);
    socket.on("webrtc_answer", handleAnswer);
    socket.on("webrtc_ice_candidate", handleIce);
    socket.on("class_stopped", handleClassStopped);
    socket.on("new_file_shared", handleNewFile);
    socket.on("all_questions", handleAllQuestions);
    socket.on("new_question", handleNewQuestion);
    socket.on("question_answered", handleQuestionAnswered);

    // CRITICAL: Ensure room is joined on mount AND on every reconnection
    const onConnect = () => {
      socket.emit("join_class_room", { classId });
    };

    if (socket.connected) onConnect();
    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("class_ended", handleClassEnded);
      socket.off("student_joined", handleStudentJoined);
      socket.off("webrtc_offer", handleOffer);
      socket.off("webrtc_answer", handleAnswer);
      socket.off("webrtc_ice_candidate", handleIce);
      socket.off("class_stopped", handleClassStopped);
      socket.off("new_file_shared", handleNewFile);
      socket.off("all_questions", handleAllQuestions);
      socket.off("new_question", handleNewQuestion);
      socket.off("question_answered", handleQuestionAnswered);
    };
  }, [classId, isTeacher, navigate]);

  if (loading) return <div className="flex items-center justify-center min-h-dvh"><div className="animate-spin h-8 w-8 border-4 border-t-primary rounded-full" /></div>;

  return (
    <SidebarProvider>
      <AppSidebar
        questions={questions}
        activeId={activeId}
        onSelect={setActiveId}
        role={isTeacher ? "Instructor" : "Student"}
        onAskQuestion={(text) => getSocket().emit("ask_question", { classId, question: text })}
        onAnswerQuestion={(id, answer) => {
            getSocket().emit("answer_question", { classId, questionId: id, answer });
            setActiveId(undefined); 
        }}
      />
      <SidebarInset className="bg-transparent">
        <div className="min-h-screen flex flex-col">
          <Topbar
            sessionName={classData?.title || ""}
            code={classData?.classCode || ""}
            classId={classId!}
            onShareFile={(file) => {
                setSharedFile(file);
                getSocket().emit("share_file", { classId, file });
            }}
            onStreamStarted={handleStreamStarted}
            onStreamStopped={handleStreamStopped}
            onOpenWhiteboard={() => setShowWhiteboard(true)}
          />
           {showWhiteboard && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    onClick={() => setShowWhiteboard(false)}   
  >
    <div
      className="w-[90%] h-[90%] bg-white rounded-lg overflow-hidden"
      onClick={(e) => e.stopPropagation()}     
    >
      <Whiteboard onClose={() => setShowWhiteboard(false)} />
    </div>
  </div>
)}

          <div className="flex-1 p-6">
            <Card className="h-full flex flex-col p-4 gap-4 bg-card">
              <div className="flex-1 w-full h-full bg-black rounded overflow-hidden relative">
                {!isTeacher && (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-contain" 
                  />
                )}
                
                {isTeacher && sharedFile && (
                  <div className="absolute inset-0 bg-white">
                    <iframe src={sharedFile.url} className="w-full h-full" title="slides" />
                  </div>
                )}

                {isTeacher && !sharedFile && (
                   <div className="w-full h-full flex items-center justify-center text-white text-center p-4">
                      <p>Sharing your screen...<br/>Upload a PDF to view slides here.</p>
                   </div>
                )}

                {!isTeacher && !sharedFile && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">
                    No content shared yet
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SessionPage;