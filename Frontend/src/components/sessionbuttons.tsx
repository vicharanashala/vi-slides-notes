import { Button } from "@/components/ui/button";
import {
  Monitor,
  MonitorOff,
  Presentation,
  FileDown,
  Vote,
  History,
} from "lucide-react";
import { Mic, MicOff } from "lucide-react";

type ButtonProps = {
  onClick?: () => void;
};

const GradientText = ({ children }: { children: React.ReactNode }) => (
  <span className="text-gradient">{children}</span>
);

const btnStyle = "h-10 px-4 text-sm font-semibold gap-2";

export const ShareScreen = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <Monitor size={16} />
    <GradientText>Share Screen</GradientText>
  </Button>
);

export const StopShare = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <MonitorOff size={16} />
    <GradientText>Stop Share</GradientText>
  </Button>
);

export const WhiteboardButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <Presentation size={16} />
    <GradientText>Whiteboard</GradientText>
  </Button>
);

export const ChooseFile = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <FileDown size={16} />
    <GradientText>Choose PDF</GradientText>
  </Button>
);

export const PollButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <Vote size={16} />
    <GradientText>Poll</GradientText>
  </Button>
);

export const PastPollsButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <History size={16} />
    <GradientText>Past Polls</GradientText>
  </Button>
);

export const MicButton = ({ onClick, isMicOn }: { onClick?: () => void; isMicOn: boolean }) => (
  <Button onClick={onClick} className={btnStyle}>
    {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
    <GradientText>{isMicOn ? "Mic On" : "Mic Off"}</GradientText>
  </Button>
);

export const LeaveButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <span className="text-destructive">Leave</span>
  </Button>
);

export const EndSessionButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <span className="text-destructive">End Session</span>
  </Button>
);