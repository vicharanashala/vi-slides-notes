import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { getAssignments, type Assignment } from "@/lib/api";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const navigate = useNavigate();

  const hasFetched = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [readIds, setReadIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("readAssignments");
    return stored ? JSON.parse(stored) : [];
    });

  useEffect(() => {
    if (hasFetched.current) return;

    const loadAssignments = async () => {
      try {
        const res = await getAssignments();
        setAssignments(res.data.assignments);
        hasFetched.current = true;
      } catch (err) {
        console.error(err);
      }
    };

    loadAssignments();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await getAssignments();
        setAssignments(res.data.assignments);
      } catch (err) {
        console.error(err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (id: string) => {
    const updated = [...readIds, id];
    setReadIds(updated);
    localStorage.setItem("readAssignments", JSON.stringify(updated));
  };

  const markAllAsRead = () => {
    const allIds = assignments.map((a) => a._id);
    setReadIds(allIds);
    localStorage.setItem("readAssignments", JSON.stringify(allIds));
  };

  const unreadCount = assignments.filter(
    (a) => !readIds.includes(a._id)
  ).length;

  const isNew = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    return now.getTime() - created.getTime() < 24 * 60 * 60 * 1000;
  };

  return (
    <div ref={dropdownRef} className="relative">
      
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-[#1a1d2e] transition"
      >
        <Bell className="text-white" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs px-2 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-[#0f111a] border border-[#24273b] rounded-xl shadow-xl z-50">
          
          {/* Header */}
          <div className="p-4 border-b border-[#24273b] flex justify-between items-center">
            <h3 className="text-white font-semibold">Notifications</h3>

            {assignments.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {assignments.length === 0 ? (
              <p className="text-gray-400 p-4">No notifications</p>
            ) : (
              assignments.map((assignment) => {
                const isRead = readIds.includes(assignment._id);

                return (
                  <div
                    key={assignment._id}
                    className={`p-4 border-b border-[#24273b] cursor-pointer transition ${
                      isRead
                        ? "bg-transparent"
                        : "bg-[#1a1d2e] hover:bg-[#22263a]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      
                      {/* Click to open */}
                      <div
                        onClick={() => {
                          markAsRead(assignment._id);
                          navigate(`/assignment/${assignment._id}`);
                          setOpen(false);
                        }}
                        className="flex-1"
                      >
                        <p className="text-white text-sm font-medium">
                          📚 {assignment.title}
                        </p>

                        <p className="text-gray-400 text-xs mt-1">
                          Due:{" "}
                          {new Date(
                            assignment.dueDate
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Right side badges */}
                      <div className="flex flex-col items-end gap-1 ml-2">
                        
                        {/* NEW */}
                        {isNew(assignment.createdAt) && (
                          <span className="text-xs bg-green-500 px-2 py-1 rounded">
                            NEW
                          </span>
                        )}

                        {/* Mark as read button */}
                        {!isRead && (
                          <button
                            onClick={() =>
                              markAsRead(assignment._id)
                            }
                            className="text-[10px] text-blue-400 hover:underline"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}