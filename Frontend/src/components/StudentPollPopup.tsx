import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Poll = {
  id: number;
  question: string;
  options: string[];
  isActive: boolean;
};

type StudentPollPopupProps = {
  poll: Poll | null;
  onSubmit: (selectedOption: number) => void;
};

export function StudentPollPopup({
  poll,
  onSubmit,
}: StudentPollPopupProps) {
  const [selected, setSelected] = useState<number | null>(null);

  if (!poll || !poll.isActive) return null;

  return (
    <Dialog open={!!poll && poll.isActive} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{poll.question}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {poll.options.map((option, index) => (
            <Button
              key={index}
              variant={selected === index ? "default" : "outline"}
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => setSelected(index)}
            >
              {option}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              if (selected !== null) {
                onSubmit(selected);
                setSelected(null);
              }
            }}
            disabled={selected === null}
            className="w-full"
          >
            Submit Vote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}