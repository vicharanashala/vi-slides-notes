import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { getAssignments, type Assignment } from "@/lib/api";
import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";

export default function NotificationBell() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("readAssignments");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [clearedIds, setClearedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("clearedAssignments");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (hasFetched.current) return;

    const load = async () => {
      const res = await getAssignments();
      setAssignments(res.data.assignments);
      hasFetched.current = true;
    };

    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await getAssignments();
      setAssignments(res.data.assignments);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("readAssignments", JSON.stringify(readIds));
  }, [readIds]);

  useEffect(() => {
    localStorage.setItem("clearedAssignments", JSON.stringify(clearedIds));
  }, [clearedIds]);

  const markAsRead = (id: string) => {
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const clearAll = () => {
    const allIds = assignments.map((a) => a._id);
    setClearedIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  const visibleAssignments = assignments.filter(
    (a) => !clearedIds.includes(a._id)
  );

  const unreadCount = visibleAssignments.filter(
    (a) => !readIds.includes(a._id)
  ).length;

  const isNew = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    return now.getTime() - created.getTime() < 24 * 60 * 60 * 1000;
  };

  return (
    <DropdownMenu>
      {/* Trigger */}
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full bg-destructive text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown */}
      <DropdownMenuContent className="w-80 p-0">
        
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <p className="text-sm font-semibold">Notifications</p>

          {visibleAssignments.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-accent hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {visibleAssignments.length === 0 ? (
            <p className="text-muted-foreground p-4 text-sm">
              No notifications
            </p>
          ) : (
            visibleAssignments.map((a) => {
              const isRead = readIds.includes(a._id);

              return (
                <div
                  key={a._id}
                  className={`p-3 border-b cursor-pointer transition ${
                    isRead
                      ? "opacity-70"
                      : "bg-muted/40 hover:bg-muted/70"
                  }`}
                  onClick={() => {
                    markAsRead(a._id);
                    navigate(`/assignment/${a._id}`);
                  }}
                >
                  <div className="flex justify-between items-start">
                    
                    {/* Left */}
                    <div>
                      <p className="text-sm font-medium">
                        📚 {a.title}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        Due:{" "}
                        {new Date(a.dueDate).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-end gap-1">
                      
                      {isNew(a.createdAt) && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green-500 text-white">
                          NEW
                        </span>
                      )}

                      {!isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(a._id);
                          }}
                          className="text-[10px] text-accent hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}