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
import { Input } from "@/components/ui/input";

import { MessageSquare, ChevronDown } from "lucide-react";
import { useState } from "react";

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

  const activeQuestion = questions.find((q) => q.id === activeId);

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="group">

      {/* HEADER */}
      <SidebarHeader className="px-4 py-3 flex items-center gap-2 border-b border-border/50">
        <MessageSquare size={16} />
        <span className="text-sm font-medium tracking-wide group-data-[collapsible=icon]:hidden">
          Questions
        </span>

        <span className="ml-auto text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          {questions.length}
        </span>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-2 group-data-[collapsible=icon]:hidden">
            Live Q&A
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">

              {questions.map((q) => {
                const isActive = activeId === q.id;
                const isExpanded = expandedId === q.id;

                return (
                  <SidebarMenuItem key={q.id}>
                    <div
                      className={`
                        card-glass p-0 overflow-hidden
                        transition-all duration-300
                        ${isActive ? "ring-2 ring-primary/40" : ""}
                      `}
                    >
                      {/* QUESTION */}
                      <SidebarMenuButton
                        onClick={() => {
                          onSelect(q.id);
                          setExpandedId((prev) =>
                            prev === q.id ? null : q.id
                          );
                        }}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare size={14} />
                          <span className="truncate text-sm">
                            {q.question}
                          </span>
                        </div>

                        <ChevronDown
                          size={14}
                          className={`transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </SidebarMenuButton>

                      {/* EXPANDED */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 text-sm animate-in fade-in">
                          {q.answer ? (
                            <div className="rounded-lg border border-border/50 bg-accent/20 px-3 py-2">
                              <span className="text-foreground">
                                {q.answer}
                              </span>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed border-border/50 px-3 py-2 text-muted-foreground italic">
                              No answers yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </SidebarMenuItem>
                );
              })}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-3 border-t border-border/50 space-y-3">

        {/* STUDENT */}
        {role === "Student" && (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="input-glass text-sm"
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

        {/* INSTRUCTOR */}
        {role === "Instructor" && activeQuestion && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Answering
              <div className="text-foreground font-medium truncate">
                {activeQuestion.question}
              </div>
            </div>

            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type answer..."
              className="input-glass text-sm"
            />

            <Button
              onClick={() => {
                if (!answer.trim()) return;
                onAnswerQuestion(activeQuestion.id, answer);
                setAnswer("");
              }}
              className="btn-gradient w-full text-sm"
            >
              Send Answer
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}