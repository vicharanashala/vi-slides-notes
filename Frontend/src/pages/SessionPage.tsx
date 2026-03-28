import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/question-sidebar";
import { Topbar } from "@/components/topbar";
import { Card } from "@/components/ui/card";

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import type { GetClassResponse } from "@/lib/api";
import { getClassById, endClass } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";
import Whiteboard from "@/components/Whiteboard";

import { StudentPollPopup } from "@/components/StudentPollPopup";
import { PollStatistics } from "@/components/PollStatistics";

const SessionPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();

  const [classData, setClassData] = useState<GetClassResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sharedFile, setSharedFile] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentPoll, setCurrentPoll] = useState<any>(null);
  const [pollStats, setPollStats] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showPollStats, setShowPollStats] = useState(false);
  const [activeId, setActiveId] = useState<string>();

  const { user } = useAuth();
  const isTeacher = classData?.instructor === user?._id;
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);

  // ================== REFS ==================
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const localStream = useRef<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const iceQueue = useRef<RTCIceCandidate[]>([]);
  const micStream = useRef<MediaStream | null>(null);

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
      } catch (err: unknown) {
        const errorMessage = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message;
        setError(errorMessage || "Failed to load session");
      } finally {
        setLoading(false);
      }
    };
    fetchClass();
  }, [classId, navigate]);

  // ================== MIC INIT ==================
 
  useEffect(() => {
    if (!classId) return;
    if (classData === null) return; 
  if (!isTeacher) return;        


    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.current = stream;
        console.log("✅ Mic initialized");

        // Add mic tracks to any existing peer connections
        for (const pc of Object.values(peerConnections.current)) {
          stream.getAudioTracks().forEach((track) => {
            const alreadyAdded = pc.getSenders().some((s) => s.track === track);
            if (!alreadyAdded) pc.addTrack(track, stream);
          });
        }
      } catch (err) {
        console.error("❌ Mic permission denied", err);
      }
    };

    initMic();
  }, [classId,classData, isTeacher]); 

  // ================== STREAM HELPERS ==================
 const handleStreamStarted = async (stream: MediaStream) => {
  localStream.current = stream;

  for (const [studentId, pc] of Object.entries(peerConnections.current)) {
    const newVideoTrack = stream.getVideoTracks()[0];
    if (!newVideoTrack) return;
    const videoSender = pc.getSenders().find(
      (sender) => sender.track && sender.track.kind === "video"
    );
    if (videoSender) {
      await videoSender.replaceTrack(newVideoTrack);
      console.log("🎥 Replaced video track for:", studentId);
    } else {
      pc.addTrack(newVideoTrack, stream);
      console.log("🎥 Added video track for:", studentId);
    }
    console.log("🎤 Audio remains unchanged for:", studentId);
  }
};

  const handleStreamStopped = () => {
  if (localStream.current) {
    localStream.current.getTracks().forEach((track) => track.stop());
  }
  localStream.current = null;

  Object.values(peerConnections.current).forEach((pc) => {
    const videoSender = pc.getSenders().find(
      (s) => s.track && s.track.kind === "video"
    );

    if (videoSender) {
      videoSender.replaceTrack(null);
      console.log("🛑 Video removed safely (audio still running)");
    }
  });
};

  // ================== MIC CONTROL ==================
  const handleToggleMic = () => {
    if (!micStream.current) return;
    const enabled = !isMicOn;
    micStream.current.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
    setIsMicOn(enabled);
    getSocket().emit("mic_toggle", { classId, isMicOn: enabled });
  };

  // ================== END SESSION ==================
  const handleEndSession = async () => {
    try {
      if (micStream.current) {
        micStream.current.getTracks().forEach((track) => track.stop());
        micStream.current = null;
      }
      handleStreamStopped();
      await endClass(classId!);
      getSocket().emit("end_class", { classId });
      navigate("/dashboard");
    } catch (err) {
      console.error("End session failed", err);
    }
  };

  // ================== POLL SUBMIT SESSION ==================
  const handlePollSubmit = (selectedOption: number) => {
  if (!currentPoll) return;

  getSocket().emit("submit_poll_response", {
    classId,
    pollId: currentPoll.id,
    selectedOption,
  });

  setHasVoted(true);

  setCurrentPoll(null);
};
  // ================== SOCKET + WEBRTC ==================
  useEffect(() => {
    if (!classId) return;

    const socket = getSocket();
    const rtcConfig = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const handleMicToggle = ({ isMicOn }: { isMicOn: boolean }) => {
      console.log("Mic state changed:", isMicOn);
    };

    const handleClassEnded = (data: { classId: string }) => {
      const incomingId = typeof data === "string" ? data : data.classId;
      if (incomingId !== classId) return;
      if (isTeacher) handleStreamStopped();
      if (micStream.current) {
        micStream.current.getTracks().forEach((track) => track.stop());
        micStream.current = null;
      }
      alert("Session ended by instructor");
      socket.emit("leave_class_room", { classId });
      navigate("/dashboard");
    };

    const handleStudentJoined = async ({ studentId }: { studentId: string }) => {
      if (!isTeacher) return;

      const pc = new RTCPeerConnection(rtcConfig);
      peerConnections.current[studentId] = pc;

      if (micStream.current) {
        micStream.current.getAudioTracks().forEach((track) => {
          pc.addTrack(track, micStream.current!);
        });
        console.log("✅ Mic tracks added for student:", studentId);
      } else {
        console.warn("⚠️ Mic not ready, waiting...");
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (micStream.current) {
              micStream.current.getAudioTracks().forEach((track) => {
                const alreadyAdded = pc.getSenders().some((s) => s.track === track);
                if (!alreadyAdded) pc.addTrack(track, micStream.current!);
              });
              clearInterval(interval);
              console.log("✅ Mic tracks added after wait");
              resolve();
            }
          }, 200);
        });
      }

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          const alreadyAdded = pc.getSenders().some((s) => s.track === track);
          if (!alreadyAdded) pc.addTrack(track, localStream.current!);
        });
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc_ice_candidate", {
            to: studentId,
            candidate: event.candidate,
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc_offer", { to: studentId, offer });
      console.log("✅ Offer sent to student:", studentId);
    };

   const handleOffer = async ({
  offer,
  from,
}: {
  offer: RTCSessionDescriptionInit;
  from: string;
}) => {
  if (isTeacher) return;

  let pc = pcRef.current;

  // ================= CREATE PEER CONNECTION =================
  if (!pc || pc.signalingState === "closed") {
    pc = new RTCPeerConnection(rtcConfig);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      console.log("✅ Track received:", event.track.kind);

      // ================= AUDIO =================
      if (event.track.kind === "audio") {
        let audioEl = document.getElementById("teacher-audio") as HTMLAudioElement;

        if (!audioEl) {
          audioEl = document.createElement("audio");
          audioEl.id = "teacher-audio";
          document.body.appendChild(audioEl);
        }

        audioEl.srcObject = event.streams[0];
        audioEl.volume = 1.0;
        audioEl.muted = true;

        audioEl.play()
          .then(() => {
            console.log("🔊 Autoplay allowed (muted)");

            setTimeout(() => {
              audioEl.muted = false;
              console.log("🔊 Audio unmuted");
            }, 500);
          })
          .catch(() => {
            console.log("⏳ Still blocked - waiting for user click");

            const unlock = () => {
              audioEl.play();
              audioEl.muted = false;
              document.removeEventListener("click", unlock);
              console.log("🔓 Audio unlocked by user");
            };

            document.addEventListener("click", unlock);
          });

        console.log("✅ Audio setup complete");
      }
      if (event.track.kind === "video" && videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
        console.log("✅ Video stream set");
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice_candidate", {
          to: from,
          candidate: event.candidate,
        });
      }
    };
  }

  try {
    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // Add queued ICE candidates
    iceQueue.current.forEach((c) =>
      pc!.addIceCandidate(new RTCIceCandidate(c))
    );
    iceQueue.current = [];

    if (pc.signalingState === "have-remote-offer") {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc_answer", { to: from, answer });
      console.log("✅ Answer sent to teacher");
    } else {
      console.warn("⚠️ Skipping answer, wrong state:", pc.signalingState);
    }

  } catch (err) {
    console.error("❌ Handle offer error:", err);
  }
};
    const handleAnswer = async ({
      from,
      answer,
    }: {
      from: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      const pc = peerConnections.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIce = async ({
      from,
      candidate,
    }: {
      from: string;
      candidate: RTCIceCandidateInit;
    }) => {
      const targetPc = isTeacher ? peerConnections.current[from] : pcRef.current;
      if (targetPc?.remoteDescription) {
        targetPc.addIceCandidate(new RTCIceCandidate(candidate));
      } else if (!isTeacher) {
        iceQueue.current.push(candidate as unknown as RTCIceCandidate);
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

    const handleQuestionAnswered = ({
      questionId,
      answer,
    }: {
      questionId: string;
      answer: string;
    }) => {
      setQuestions((prev) =>
        prev.map((q) => {
          const qId = q.id || q._id;
          return qId === questionId ? { ...q, answer } : q;
        })
      );
    };

    // Attach listeners
    socket.on("class_ended", handleClassEnded);
    // ================== POLL ==================
    socket.on("poll_launched", (poll) => {
      console.log("📊 Poll launched:", poll);
      setCurrentPoll(poll);
      setHasVoted(false);
      setPollStats(null);
      setShowPollStats(false);
    });

    socket.on("poll_closed", ({ statistics, question }) => {
      console.log("📊 Poll closed:", statistics);

      setPollStats({
        question,
        statistics,
      });

      setShowPollStats(true);
      setCurrentPoll(null);
    });
    socket.on("student_joined", handleStudentJoined);
    socket.on("webrtc_offer", handleOffer);
    socket.on("webrtc_answer", handleAnswer);
    socket.on("webrtc_ice_candidate", handleIce);
    socket.on("class_stopped", handleClassStopped);
    socket.on("new_file_shared", handleNewFile);
    socket.on("all_questions", handleAllQuestions);
    socket.on("new_question", handleNewQuestion);
    socket.on("question_answered", handleQuestionAnswered);
    socket.on("mic_toggle", handleMicToggle);
    socket.on("request_renegotiation", ({ teacherId }: { teacherId: string }) => {
    console.log("Renegotiation requested");
    socket.emit("renegotiate_ready", { to: teacherId });
    });
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
      socket.off("mic_toggle", handleMicToggle);
      socket.off("request_renegotiation");
      socket.off("poll_launched");
      socket.off("poll_closed");

    };
  }, [classId, isTeacher, navigate]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="animate-spin h-8 w-8 border-4 border-t-primary rounded-full" />
      </div>
    );

  if (error || !classData)
    return (
      <div className="flex items-center justify-center min-h-dvh text-muted-foreground">
        {error || "Session not found"}
      </div>
    );

  return (
    <SidebarProvider>
      <AppSidebar
        questions={questions}
        activeId={activeId}
        onSelect={setActiveId}
        role={isTeacher ? "Instructor" : "Student"}
        onAskQuestion={(text) =>
          getSocket().emit("ask_question", { classId, question: text })
        }
        onAnswerQuestion={(id, answer) => {
          getSocket().emit("answer_question", {
            classId,
            questionId: id,
            answer,
          });
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
            onToggleMic={handleToggleMic}
            isMicOn={isMicOn}
            onEndSession={handleEndSession}
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
                    className="w-full h-full object-contain"
                  />
                )}

                {isTeacher && sharedFile && (
                  <div className="absolute inset-0 bg-white">
                    <iframe
                      src={sharedFile.url}
                      className="w-full h-full"
                      title="slides"
                    />
                  </div>
                )}

                {isTeacher && !sharedFile && (
                  <div className="w-full h-full flex items-center justify-center text-white text-center p-4">
                    <p>
                      Sharing your screen...
                      <br />
                      Upload a PDF to view slides here.
                    </p>
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
      {/* Student Poll Popup */}
      {!isTeacher && currentPoll && !hasVoted && (
        <StudentPollPopup
          poll={currentPoll}
          onSubmit={handlePollSubmit}
        />
      )}

      {/* Poll Statistics */}
      {showPollStats && pollStats && (
        <div className="fixed bottom-6 right-6 z-40">
          <PollStatistics
            open={showPollStats}
            question={pollStats.question || "Poll Results"}
            statistics={pollStats.statistics || []}
            onClose={() => setShowPollStats(false)}
          />
        </div>
      )}
    </SidebarProvider>
  );
};

export default SessionPage;