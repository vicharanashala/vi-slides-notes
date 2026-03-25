import { Button } from "@/components/ui/button";
import {
  Pause,
  BarChart,
  Flame,
  Presentation,
  FileDown,
  Vote,
  LogOut,
} from "lucide-react";

type ButtonProps = {
  onClick?: () => void;
};

const GradientText = ({ children }: { children: React.ReactNode }) => (
  <span className="text-gradient">{children}</span>
);

const btnStyle = "h-10 px-4 text-sm font-semibold gap-2";

export const PauseButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <Pause size={16} />
    <GradientText>Pause</GradientText>
  </Button>
);

export const EngagementButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <BarChart size={16} />
    <GradientText>Engagement</GradientText>
  </Button>
);

export const PulseButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <Flame size={16} />
    <GradientText>Pulse Check</GradientText>
  </Button>
);

export const WhiteboardButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <Presentation size={16} />
    <GradientText>Whiteboard</GradientText>
  </Button>
);

export const ExportButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <FileDown size={16} />
    <GradientText>Export</GradientText>
  </Button>
);

export const PollButton = ({ onClick }: ButtonProps) => (
  <Button onClick={onClick} className={btnStyle}>
    <Vote size={16} />
    <GradientText>Poll</GradientText>
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