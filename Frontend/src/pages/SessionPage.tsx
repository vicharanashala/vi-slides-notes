import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/question-sidebar";
import { Topbar } from "@/components/topbar";

import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useClassData } from "./SessionPage/hooks/useClassData";
import { useMicrophoneManager } from "./SessionPage/hooks/useMicrophoneManager";
import { useStreamManager } from "./SessionPage/hooks/useStreamManager";
import { useSessionSocket } from "./SessionPage/hooks/useSessionSocket";
import { VideoDisplay } from "./SessionPage/components/VideoDisplay";
import { WhiteboardModal } from "./SessionPage/components/WhiteboardModal";
import { PollContainer } from "./SessionPage/components/PollContainer";

import { endClass } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";


const SessionPage = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { classData, loading, error, sessionEnded } = useClassData(classId);

  const [sharedFile, setSharedFile] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentPoll, setCurrentPoll] = useState<any>(null);
  const [pollStats, setPollStats] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showPollStats, setShowPollStats] = useState(false);
  const [pastPolls, setPastPolls] = useState<any[]>([]);
  const [showPastPolls, setShowPastPolls] = useState(false);
  const [activeId, setActiveId] = useState<string>();
  const [endSessionConfirm, setEndSessionConfirm] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // ================== REFS ==================
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const iceQueue = useRef<RTCIceCandidate[]>([]);
  const { localStream, handleStreamStarted, handleStreamStopped } =
  useStreamManager(peerConnections);

  const { user } = useAuth();
  const isTeacher = classData?.instructor === user?._id;
  const { isMicOn, setIsMicOn, micStream } = useMicrophoneManager(
    classId,
    classData,
    isTeacher,
    peerConnections
  );
  const [showWhiteboard, setShowWhiteboard] = useState(false);

  // Show toast when session ends
  useEffect(() => {
    if (sessionEnded) {
      toast({
        title: "Session Ended",
        description: "The session has ended. You have been redirected to the dashboard.",
        variant: "destructive",
      });
    }
  }, [sessionEnded, toast]);


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
  const handleEndSession = () => {
    setEndSessionConfirm({
      open: true,
      title: "End Session",
      description: "Are you sure you want to end this live session? This will disconnect all students and cannot be undone.",
      onConfirm: async () => {
        try {
          if (micStream.current) {
            micStream.current.getTracks().forEach((track) => track.stop());
            micStream.current = null;
          }
          handleStreamStopped();
          await endClass(classId!);
          toast({
            title: "Session Ended",
            description: "The live session has been ended successfully.",
          });
          getSocket().emit("end_class", { classId });
          navigate("/dashboard");
        } catch (err) {
          console.error("End session failed", err);
          toast({
            title: "Session End Failed",
            description: "Failed to end the session. Please try again.",
            variant: "destructive",
          });
        }
      },
    });
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
const handleViewPastPolls = () => {
  getSocket().emit("get_past_polls", { classId });
  setShowPastPolls(true);
};
  // ================== SOCKET + WEBRTC ==================
  useSessionSocket({
    classId,
    isTeacher,
    navigate,
    videoRef,
    peerConnections,
    pcRef,
    iceQueue,
    micStream,
    localStream,
    setSharedFile,
    setQuestions,
    setCurrentPoll,
    setPollStats,
    setHasVoted,
    setShowPollStats,
    setPastPolls,
    handleStreamStopped,
    currentPoll,
    onSessionEnded: () => {
      toast({
        title: "Session Ended",
        description: "The session has been ended by the instructor.",
        variant: "destructive",
      });
    },
  });

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
    <>
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
            currentPollId={currentPoll?.id}
            onClosePoll={() => setCurrentPoll(null)}
            onViewPastPolls={handleViewPastPolls}
          />

          <WhiteboardModal
            show={showWhiteboard}
            onClose={() => setShowWhiteboard(false)}
          />
          <VideoDisplay
            isTeacher={isTeacher}
            videoRef={videoRef}
            sharedFile={sharedFile}
          />
        </div>
      </SidebarInset>
      <PollContainer
        isTeacher={isTeacher}
        currentPoll={currentPoll}
        hasVoted={hasVoted}
        showPollStats={showPollStats}
        pollStats={pollStats}
        showPastPolls={showPastPolls}
        pastPolls={pastPolls}
        onSubmitPoll={handlePollSubmit}
        onCloseStats={() => setShowPollStats(false)}
        onClosePastPolls={() => setShowPastPolls(false)}
      />
    </SidebarProvider>

    <ConfirmDialog
      open={endSessionConfirm.open}
      onOpenChange={(open) => setEndSessionConfirm({ ...endSessionConfirm, open })}
      title={endSessionConfirm.title}
      description={endSessionConfirm.description}
      onConfirm={endSessionConfirm.onConfirm}
    />
    </>
  );
};

export default SessionPage;