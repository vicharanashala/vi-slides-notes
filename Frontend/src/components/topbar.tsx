import {
  PauseButton,
  EngagementButton,
  PulseButton,
  WhiteboardButton,
  ChooseFile,
  PollButton,
  LeaveButton,
  EndSessionButton,
} from "../components/sessionbuttons";

import { useRef } from "react";
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
};

export const Topbar = ({ sessionName, code, classId, onShareFile }: TopbarProps) => {
  const { user } = useAuth();
  const isInstructor = user?.role === "Instructor";
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleEndSession = async () => {
    try {
      const socket = getSocket();
      await endClass(classId);

      socket.emit("end_class", { classId });

      setTimeout(() => navigate("/dashboard"), 300);
    } catch (err: any) {
      console.error("Failed to end session:", err);
      alert(err?.response?.data?.message || "Failed to end session");
    }
  };

  const handleLeaveSession = async () => {
  try {
    const socket = getSocket();
    socket.disconnect();
    navigate("/dashboard");
  } catch (err: any) {
    console.error("Failed to leave session:", err);
  }
};
  return (
    <div
      className="w-full flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 
      border-b border-white/20 
      bg-white/10 backdrop-blur-xl 
      shadow-[0_4px_24px_rgba(0,0,0,0.06)]
      dark:bg-white/5 dark:border-white/10"
    >
      {/* LEFT */}
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger />
        <div className="truncate">
          <p className="text-xs text-muted-foreground hidden sm:block">
            LIVE SESSION
          </p>
          <h2 className="font-semibold text-sm sm:text-lg text-gradient truncate">
            {sessionName}
          </h2>
        </div>
      </div>

      {/* CODE */}
      <div className="inline-flex bg-primary items-center px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium">
        <span className="text-gradient">{code}</span>
      </div>

      {/* ACTIONS */}
      {isInstructor && (
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end w-full sm:w-auto">
          {/* HIDDEN FILE INPUT */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (file.type !== "application/pdf") {
                alert("Only PDF files are allowed");
                e.target.value = "";
                return;
              }

              const fileUrl = URL.createObjectURL(file);

              onShareFile({
                name: file.name,
                url: fileUrl,
                type: file.type,
              });

              e.target.value = "";
            }}
          />

          {/* BUTTON */}
          <ChooseFile onClick={() => fileInputRef.current?.click()} />
          <PauseButton />
          <EngagementButton />
          <PulseButton />
          <PollButton />
          <WhiteboardButton />
        </div>
      )}

      {/* END */}
      {isInstructor ? (
        <EndSessionButton onClick={handleEndSession} />
      ) : (
        <LeaveButton onClick={handleLeaveSession}/>
      )}
    </div>
  );
};
