import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListTodo, ClipboardList } from "lucide-react";

export type Assignment = {
  id: string;
  title: string;
  description: string;
  maxMarks: number;
  deadline: string;
  createdAt: string;
};

let assignmentStore: Assignment[] = [];
export function getAssignments() { return assignmentStore; }
export function addAssignment(a: Omit<Assignment, "id" | "createdAt">) {
  const newA: Assignment = { ...a, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  assignmentStore = [newA, ...assignmentStore];
  return newA;
}
export function deleteAssignment(id: string) {
  assignmentStore = assignmentStore.filter((a) => a.id !== id);
}

export default function TeacherAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>(getAssignments());
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    addAssignment({ title, description, maxMarks: Number(maxMarks), deadline });
    setAssignments(getAssignments());
    setTitle(""); setDescription(""); setMaxMarks("100"); setDeadline("");
    setShowCreate(false);
    setIsSubmitting(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAssignment(id);
    setAssignments(getAssignments());
  };

  return (
    <div className="min-h-screen p-6">
      <div className="h-20 mb-6" />
      <div className="max-w-5xl mx-auto">

        {/* Header Card — mirrors the Welcome Card style */}
        <Card className="mb-6 border border-foreground/10 bg-card/80 rounded-2xl shadow-xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gradient mb-1">Assignments</h1>
              <p className="text-muted-foreground text-sm">Manage and grade student assignments.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-10 px-4 text-sm font-medium border border-foreground/20 bg-transparent hover:bg-muted/30"
                onClick={() => navigate("/dashboard")}
              >
                ← Back to Dashboard
              </Button>
              <Button
                className="h-10 px-4 text-sm font-semibold border-0 bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-500 hover:opacity-90 text-white"
                onClick={() => setShowCreate((v) => !v)}
              >
                {showCreate ? "Cancel" : "+ Create Assignment"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Create Form Card — mirrors Start Session Card style */}
        {showCreate && (
          <Card className="mb-6 border border-foreground/10 bg-card/80 rounded-2xl shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="w-4 h-4" />
                <span className="text-gradient">Create New Assignment</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Fill in the details to create a new assignment for your class.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    <span className="text-gradient">Title</span>
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chapter 3 Review"
                    className="h-9 text-sm bg-muted/50 border border-foreground/10 rounded-md"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    <span className="text-gradient">Description</span>
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the assignment..."
                    className="text-sm bg-muted/50 border border-foreground/10 rounded-md resize-none min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      <span className="text-gradient">Max Marks</span>
                    </Label>
                    <Input
                      type="number"
                      value={maxMarks}
                      onChange={(e) => setMaxMarks(e.target.value)}
                      className="h-9 text-sm bg-muted/50 border border-foreground/10 rounded-md"
                      min={1}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">
                      <span className="text-gradient">Deadline</span>
                    </Label>
                    <Input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="h-9 text-sm bg-muted/50 border border-foreground/10 rounded-md"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 text-sm font-semibold border-0"
                >
                  <span className="text-gradient">
                    {isSubmitting ? "Creating..." : "Create Assignment"}
                  </span>
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Assignments List or Empty State */}
        {assignments.length === 0 ? (
          <Card className="border border-foreground/10 bg-card/80 rounded-2xl shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-24 gap-3">
              <span className="text-6xl">📝</span>
              <h2 className="text-lg font-bold text-foreground">No assignments yet</h2>
              <p className="text-sm text-muted-foreground">Create your first assignment to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <Card
                key={a.id}
                className="border border-foreground/10 bg-card/80 rounded-2xl shadow-xl cursor-pointer hover:border-foreground/30 transition-all"
                onClick={() => navigate(`/assignments/${a.id}`)}
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-start gap-3">
                    <ListTodo className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm text-gradient">{a.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {a.description || "No description"}
                      </span>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          Max Marks: <span className="text-foreground font-medium">{a.maxMarks}</span>
                        </span>
                        {a.deadline && (
                          <span className="text-xs text-muted-foreground">
                            Due: <span className="text-foreground font-medium">
                              {new Date(a.deadline).toLocaleString()}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10 text-xs"
                    onClick={(e) => handleDelete(a.id, e)}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}