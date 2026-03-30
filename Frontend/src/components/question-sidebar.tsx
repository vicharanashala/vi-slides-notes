import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { MessageSquare, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getAIAnswer } from "@/lib/api";

type Question = {
  id: string;
  question: string;
  answer?: string | null;
};

type AppSidebarProps = {
  questions: Question[];
  activeId?: string;
  onSelect: (id: string) => void;
  onAskQuestion: (text: string) => void;
  onAnswerQuestion: (id: string, answer: string) => void;
  role: "Student" | "Instructor";
};

function parseBold(text: string) {
  return text
    .split(/\*\*(.+?)\*\*/)
    .map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

function parseAnswer(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="text-sm font-semibold mt-2 mb-1">
          {line.slice(3)}
        </h2>
      );
    if (line.startsWith("### "))
      return (
        <h3
          key={i}
          className="text-xs font-semibold mt-2 mb-1 text-muted-foreground uppercase tracking-wide"
        >
          {line.slice(4)}
        </h3>
      );
    if (line.startsWith("- "))
      return (
        <li key={i} className="ml-3 text-xs mb-0.5 list-disc">
          {parseBold(line.slice(2))}
        </li>
      );
    if (line.trim() === "") return null;
    return (
      <p key={i} className="text-xs mb-1">
        {parseBold(line)}
      </p>
    );
  });
}

export function AppSidebar({
  questions,
  activeId,
  onSelect,
  onAskQuestion,
  onAnswerQuestion,
  role,
}: AppSidebarProps) {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const activeQuestion = questions.find((q) => q.id === activeId);

  const handleAIAnswer = async () => {
    if (!activeQuestion) return;
    try {
      setLoading(true);
      const res = await getAIAnswer(activeQuestion.question);
      const raw = res.data?.answer;
      if (raw) {
        setAnswer(raw.trim());
        toast({
          title: "AI Answer Generated",
          description: "Answer has been generated using AI.",
        });
      }
    } catch (err) {
      console.error("AI answer error:", err);
      toast({
        title: "AI Generation Failed",
        description: "Failed to generate AI answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="group">
      {/* HEADER */}
      <SidebarHeader
        className="
          flex items-center border-b border-border/50
          px-4 py-3
          group-data-[state=collapsed]:px-0
          group-data-[state=collapsed]:justify-center
          group-data-[state=collapsed]:border-none
        "
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={16} />
          <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 leading-none">
            {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2 ml-2 group-data-[state=collapsed]:hidden">
          <span className="text-sm font-medium tracking-wide">Questions</span>
        </div>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-2 group-data-[state=collapsed]:hidden">
            Live Q&A
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {questions.map((q) => {
                const isActive = activeId === q.id;
                const isExpanded = expandedId === q.id;

                return (
                  <SidebarMenuItem
                    key={q.id}
                    className={`
            card-glass p-0 overflow-hidden
            transition-all duration-300
            ${isActive ? "ring-2 ring-primary/40" : ""}
          `}
                  >
                    <SidebarMenuButton
                      onClick={() => {
                        onSelect(q.id);
                        setExpandedId((prev) => (prev === q.id ? null : q.id));
                      }}
                      className="flex items-start justify-between px-3 py-2 group-data-[state=collapsed]:justify-center"
                    >
                      {/* LEFT SIDE */}
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <MessageSquare size={14} className="shrink-0 mt-0.5" />
                        <span className="text-sm leading-snug group-data-[state=collapsed]:hidden truncate flex-1">
                          {q.question}
                        </span>
                      </div>

                      {/* RIGHT ICON */}
                      <ChevronDown
                        size={14}
                        className={`transition-transform shrink-0 ml-2 mt-0.5 ${
                          isExpanded ? "rotate-180" : ""
                        } group-data-[state=collapsed]:hidden`}
                      />
                    </SidebarMenuButton>

                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 text-sm space-y-2 group-data-[state=collapsed]:hidden">
                        <div className="text-foreground wrap-break-word leading-snug">
                          {q.question}
                        </div>

                        {q.answer ? (
                          <div className="rounded-lg border border-border bg-accent px-3 py-2 w-full overflow-hidden">
                            <div className="max-h-48 overflow-y-auto overflow-x-hidden pr-1 pl-4">
                              {parseAnswer(q.answer)}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-border px-3 py-2 text-muted-foreground italic text-xs">
                            No answer yet
                          </div>
                        )}
                      </div>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-3 border-t border-border/50 space-y-3 group-data-[state=collapsed]:hidden">
        {role === "Student" && (
          <div className="flex flex-col gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="input-glass text-sm w-full h-20 overflow-y-auto resize-none leading-relaxed wrap-break-word"
            />
            <Button
              onClick={() => {
                if (!input.trim()) return;
                onAskQuestion(input);
                setInput("");
              }}
              className="btn-glass text-sm"
            >
              Ask
            </Button>
          </div>
        )}

        {role === "Instructor" && activeQuestion && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Answering
              <div className="text-foreground font-medium truncate mt-0.5">
                {activeQuestion.question}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleAIAnswer}
                disabled={loading}
                className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground transition"
              >
                {loading ? "Thinking..." : "AI Answer"}
              </Button>
            </div>

            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type answer... or click AI Answer to auto-fill"
              className="input-glass text-sm w-full h-28 overflow-y-auto resize-none leading-relaxed wrap-break-word"
            />

            <Button
              onClick={() => {
                if (!answer.trim()) return;
                onAnswerQuestion(activeQuestion.id, answer);
                setAnswer("");
              }}
              className="w-full text-sm"
            >
              Send Answer
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
