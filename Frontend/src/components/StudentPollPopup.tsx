import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // Keep safety check (VERY IMPORTANT)
  if (!poll || !poll.isActive) return null;

  const handleSubmit = () => {
    if (selected === null) {
      toast({
        title: "Selection Required",
        description: "Please select an option before submitting your vote.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(selected);
    setSelected(null);
  };

  return (
    <Dialog open={!!poll && poll.isActive} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">{poll.question}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {poll.options.map((option, index) => (
            <Button
              key={index}
              variant={selected === index ? "default" : "outline"}
              onClick={() => setSelected(index)}
              className="w-full justify-start text-left h-auto py-3"
            >
              <span className="mr-2">
                {selected === index ? "✓" : "○"}
              </span>
              {option}
            </Button>
          ))}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
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