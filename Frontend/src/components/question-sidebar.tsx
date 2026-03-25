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
} from "@/components/ui/sidebar";

import { MessageSquare } from "lucide-react";

type Question = {
  id: string;
  title: string;
};

type AppSidebarProps = {
  questions: Question[];
  activeId?: string;
  onSelect: (id: string) => void;
};

export function AppSidebar({ questions, activeId, onSelect }: AppSidebarProps) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" className="group">

      {/* HEADER */}
      <SidebarHeader className="p-4 pb-2 text-sm font-semibold text-muted-foreground flex items-center gap-2 
        group-data-[collapsible=icon]:justify-center">
        
        <MessageSquare size={16} />

        <span className="truncate whitespace-nowrap 
          group-data-[collapsible=icon]:hidden">
          Questions ({questions.length})
        </span>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        <SidebarGroup>

          <SidebarGroupLabel className="px-2 text-muted-foreground 
            group-data-[collapsible=icon]:hidden">
            All Questions
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {questions.map((q) => (
                <SidebarMenuItem key={q.id}>
                  <SidebarMenuButton
                    onClick={() => onSelect(q.id)}
                    isActive={activeId === q.id}
                    className="
                      gap-2
                      group-data-[collapsible=icon]:justify-center
                    "
                  >
                    <MessageSquare size={16} />

                    <span className="truncate 
                      group-data-[collapsible=icon]:hidden">
                      {q.title}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>

        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}