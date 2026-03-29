import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // ✅ NEW
type Stat = {
  option: string;
  count: number;
  percentage: string;
};

type PollStatisticsProps = {
  open: boolean;
  question: string;
  statistics: Stat[];
  onClose: () => void;
};

export function PollStatistics({
  open,
  question,
  statistics,
  onClose,
}: PollStatisticsProps) {
  const maxCount = Math.max(...statistics.map((s) => s.count), 1);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          {/* ✅ Slight UI improvement */}
          <DialogTitle>📊 Poll Results: {question}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Total Responses: {statistics.reduce((sum, s) => sum + s.count, 0)}
        </p>
        <div className="space-y-6">
          {statistics.map((stat, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="font-medium text-sm">{stat.option}</span>
                <span className="text-sm text-muted-foreground">
                  {stat.count} votes ({stat.percentage}%)
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(stat.count / maxCount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ✅ NEW: Close button */}
        <Button onClick={onClose} className="w-full mt-4">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}