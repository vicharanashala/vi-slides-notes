import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { getAssignments, type Assignment, getTodos, type Todo } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Days between two dates
function dateDiffInDays(a: Date, b: Date): number {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

export default function NotificationBell() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  // Assignment states
  const [readAssignmentIds, setReadAssignmentIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("readAssignments");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [clearedAssignmentIds, setClearedAssignmentIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("clearedAssignments");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Todo states
  const [readTodoKeys, setReadTodoKeys] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("readTodos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [clearedTodoIds, setClearedTodoIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("clearedTodos");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (hasFetched.current) return;
    const load = async () => {
      const [aRes, tRes] = await Promise.all([getAssignments(), getTodos()]);
      setAssignments(aRes.data.assignments);
      setTodos(tRes.data.todos);
      hasFetched.current = true;
    };
    load();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const [aRes, tRes] = await Promise.all([getAssignments(), getTodos()]);
      setAssignments(aRes.data.assignments);
      setTodos(tRes.data.todos);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("readAssignments", JSON.stringify(readAssignmentIds));
  }, [readAssignmentIds]);
  useEffect(() => {
    localStorage.setItem("clearedAssignments", JSON.stringify(clearedAssignmentIds));
  }, [clearedAssignmentIds]);
  useEffect(() => {
    localStorage.setItem("readTodos", JSON.stringify(readTodoKeys));
  }, [readTodoKeys]);
  useEffect(() => {
    localStorage.setItem("clearedTodos", JSON.stringify(clearedTodoIds));
  }, [clearedTodoIds]);

  // Assignment logic
  const markAssignmentAsRead = (id: string) =>
    setReadAssignmentIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  const clearAllAssignments = () => {
    const allIds = assignments.map(a => a._id);
    setClearedAssignmentIds(prev => Array.from(new Set([...prev, ...allIds])));
  };
  const visibleAssignments = assignments.filter(a => !clearedAssignmentIds.includes(a._id));
  const unreadAssignments = visibleAssignments.filter(a => !readAssignmentIds.includes(a._id));

  // Todo logic
  const markTodoKeyAsRead = (key: string) =>
    setReadTodoKeys(prev => (prev.includes(key) ? prev : [...prev, key]));
  const clearAllTodos = () => {
    const allIds = todos.map(t => t._id);
    setClearedTodoIds(prev => Array.from(new Set([...prev, ...allIds])));
  };

  const now = new Date();

  // New todo created (in last 10s)
  const newTodos = todos
    .filter(t => !clearedTodoIds.includes(t._id))
    .filter(t => {
      const created = new Date(t.createdAt);
      return (now.getTime() - created.getTime()) < 10000;
    })
    .map(t => ({
      ...t,
      notificationType: "created" as const,
      key: `${t._id}:created`
    }));

  // Reminders: overdue/0/1/2 days for incomplete todos
  const reminders = todos
    .filter(t => !t.completed && !clearedTodoIds.includes(t._id))
    .map(t => {
      const due = new Date(t.dueDate);
      const daysLeft = dateDiffInDays(now, due);
      let notificationType: "reminder" | undefined, message = "";
      if (daysLeft < 0) {
        notificationType = "reminder";
        message = "Todo overdue!";
      } else if (daysLeft === 0) {
        notificationType = "reminder";
        message = "Due today";
      } else if (daysLeft <= 2) {
        notificationType = "reminder";
        message = `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go`;
      }
      if (notificationType) {
        return { ...t, notificationType, message, key: `${t._id}:reminder:${daysLeft}` };
      }
      return null;
    })
    .filter(Boolean) as (Todo & { notificationType: "reminder" | "created", message: string, key: string })[];

  // Show todos unless cleared
  const todoNotifications = [...newTodos, ...reminders]
    .filter(t => !clearedTodoIds.includes(t._id));

  const unreadTodoCount = todoNotifications.filter(t => !readTodoKeys.includes(t.key)).length;
  const unreadCount = unreadAssignments.length + unreadTodoCount;

  return (
    <DropdownMenu>
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
      <DropdownMenuContent className="w-96 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <p className="text-sm font-semibold">Notifications</p>
          {(visibleAssignments.length > 0 || todoNotifications.length > 0) && (
            <button
              onClick={() => { clearAllAssignments(); clearAllTodos(); }}
              className="text-xs text-accent hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {todoNotifications.length > 0 && (
            <div>
              {todoNotifications.map((t) => {
                const isRead = readTodoKeys.includes(t.key);
                if (!t.title) return null;
                return (
                  <div
                    key={t.key}
                    className={`p-3 border-b cursor-pointer transition ${isRead
                        ? "opacity-70"
                        : "bg-cyan-100 dark:bg-cyan-900 hover:bg-cyan-200 dark:hover:bg-cyan-800"
                      }`}
                    onClick={() => {
                      markTodoKeyAsRead(t.key);
                      navigate("/todos");
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">📝 {t.title}
                          <span className="ml-2 text-[10px] text-cyan-600 uppercase">
                            {t.notificationType === "reminder"
                              ? t.message
                              : "Todo created"}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      {!isRead && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            markTodoKeyAsRead(t.key);
                          }}
                          className="text-[10px] text-accent hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {(visibleAssignments.length === 0 && todoNotifications.length === 0) && (
            <p className="text-muted-foreground p-4 text-sm">No notifications</p>
          )}
          {visibleAssignments.map(a => {
            const isRead = readAssignmentIds.includes(a._id);
            const now = new Date();
            const created = new Date(a.createdAt);
            const isNew = now.getTime() - created.getTime() < 24 * 60 * 60 * 1000;
            return (
              <div
                key={a._id}
                className={`p-3 border-b cursor-pointer transition ${isRead
                    ? "opacity-70"
                    : "bg-muted/40 hover:bg-muted/70"
                  }`}
                onClick={() => {
                  markAssignmentAsRead(a._id);
                  navigate(`/assignment/${a._id}`);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">📚 {a.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isNew && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-green-500 text-white">
                        NEW
                      </span>
                    )}
                    {!isRead && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          markAssignmentAsRead(a._id);
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
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}