import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type PollModalProps = {
  open: boolean;
  onClose: () => void;
  onCreatePoll: (
    question: string,
    options: string[],
    duration: number
  ) => void;
};

export function PollModal({ open, onClose, onCreatePoll }: PollModalProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [duration, setDuration] = useState(30);
  const { toast } = useToast();

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    if (!question.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a question for the poll.",
        variant: "destructive",
      });
      return;
    }

    const filledOptions = options.filter((opt) => opt.trim());
    if (filledOptions.length < 2) {
      toast({
        title: "Validation Error",
        description: "Please provide at least 2 options for the poll.",
        variant: "destructive",
      });
      return;
    }

    onCreatePoll(question, filledOptions, duration);

    // Reset
    setQuestion("");
    setOptions(["", "", ""]);
    setDuration(30);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Poll</DialogTitle>
          <DialogDescription>
            Create a poll for students in the class
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question */}
          <div>
            <Label htmlFor="question">Poll Question</Label>
            <Input
              id="question"
              placeholder="What's your question?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Options */}
          <div>
            <Label>Poll Options</Label>
            <div className="space-y-2 mt-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(index, e.target.value)
                    }
                  />
                  {options.length > 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveOption(index)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="mt-2 w-full"
            >
              + Add Option
            </Button>
          </div>

          {/* NEW: Duration */}
          <div>
            <Label>Poll Duration (seconds)</Label>
            <div className="flex gap-2 mt-2">
              {[10, 15, 20, 30, 45, 60].map((sec) => (
                <Button
                  key={sec}
                  variant={duration === sec ? "default" : "outline"}
                  onClick={() => setDuration(sec)}
                  className="flex-1"
                >
                  {sec}s
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Launch Poll</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}