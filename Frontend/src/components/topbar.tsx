import {
  ShareScreen,
  StopShare,
  WhiteboardButton,
  ChooseFile,
  PollButton,
  LeaveButton,
  EndSessionButton,
} from "../components/sessionbuttons";
import { useRef, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { endClass } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { getSocket } from "@/lib/socket";

type TopbarProps = {
  sessionName: string;
  code: string;
  classId: string;
  onShareFile: (file: any) => void;
  onStreamStarted: (stream: MediaStream) => void;
  onStreamStopped: () => void;
  onOpenWhiteboard: () => void;
};

export const Topbar = ({ sessionName, code, classId, onShareFile, onStreamStarted, onStreamStopped , onOpenWhiteboard}: TopbarProps) => {
  const { user } = useAuth();
  const isInstructor = user?.role === "Instructor";
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const handleStartShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      streamRef.current = stream;
      
      // Notify Backend + Local State
      getSocket().emit("class_started", { classId });
      onStreamStarted(stream);
      setIsSharing(true);

      stream.getVideoTracks()[0].onended = () => handleStopShare();
    } catch (err) {
      console.error("Share failed", err);
    }
  };

  const handleStopShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    getSocket().emit("class_stopped", { classId });
    onStreamStopped();
    setIsSharing(false);
  };

  return (
    <div className="w-full flex items-center justify-between px-6 py-3 border-b bg-white/10 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h2 className="font-semibold">{sessionName}</h2>
      </div>

      <div className="bg-primary px-4 py-2 rounded-md text-sm font-medium">{code}</div>

      {isInstructor && (
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onShareFile({ name: file.name, url: URL.createObjectURL(file), type: file.type });
            }} 
          />
          <ChooseFile onClick={() => fileInputRef.current?.click()} />
          {!isSharing ? <ShareScreen onClick={handleStartShare} /> : <StopShare onClick={handleStopShare} />}
          <PollButton />
          <WhiteboardButton onClick={onOpenWhiteboard}/>
          <EndSessionButton onClick={async () => {
             await endClass(classId);
             getSocket().emit("end_class", { classId });
             navigate("/dashboard");
          }} />
        </div>
      )}
      {!isInstructor && <LeaveButton onClick={() => navigate("/dashboard")} />}
    </div>
  );
};