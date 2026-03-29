import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useState } from "react";
import { PollStatistics } from "@/components/PollStatistics";

type PastPoll = {
  question: string;
  options: string[];
  responses: Record<number, { userId: string; timestamp: number }[]>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  polls: PastPoll[];
};

export function PastPollsModal({ open, onClose, polls }: Props) {
  const [selectedPoll, setSelectedPoll] = useState<any>(null);
  const generateStats = (poll: any) => {
  const total = Object.values(poll.responses || {}).flat().length || 1;

  return poll.options.map((option: string, index: number) => ({
    option,
    count: poll.responses[index]?.length || 0,
    percentage: (
      ((poll.responses[index]?.length || 0) / total) * 100
    ).toFixed(1),
  }));
  };
  return (
  <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>📜 Past Polls</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {polls.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No past polls available
            </p>
          ) : (
            polls.map((poll, i) => (
              <div
                key={i}
                onClick={() => {
                    setSelectedPoll(poll);
                    onClose(); // closes past polls modal
                }}
                className="border rounded-md p-3 space-y-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition"
              >
                <p className="font-medium">{poll.question}</p>

                <p className="text-sm text-muted-foreground">
                  {Object.values(poll.responses || {}).flat().length} responses
                </p>

                <p className="text-xs text-muted-foreground">
                  Click to view results
                </p>

                <div className="text-sm text-muted-foreground">
                  {poll.options.join(", ")}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>

    {selectedPoll && (
      <PollStatistics
        open={true}
        question={selectedPoll.question}
        statistics={generateStats(selectedPoll)}
        onClose={() => setSelectedPoll(null)}
      />
    )}
  </>
);
}