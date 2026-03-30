import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListTodo, ClipboardList, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
  getAssignments,
  createAssignment,
  deleteAssignment as deleteAssignmentAPI,
} from "@/lib/api";

export default function TeacherAssignments() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  // FETCH
  const fetchAssignments = async () => {
    try {
      const res = await getAssignments();
      setAssignments(res.data.assignments);
    } catch (err) {
      console.error(err);
      toast({
        title: "Load Failed",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // ➕ CREATE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter an assignment title",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await createAssignment({
        title,
        description,
        maxMarks: Number(maxMarks),
        dueDate: deadline,
      });

      await fetchAssignments();

      setTitle("");
      setDescription("");
      setMaxMarks("100");
      setDeadline("");
      setShowCreate(false);

      toast({
        title: "Assignment Created",
        description: "Your assignment has been created successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Creation Failed",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setDeleteConfirm({
      open: true,
      title: "Delete Assignment",
      description: "Are you sure you want to delete this assignment? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteAssignmentAPI(id);
          await fetchAssignments();
          toast({
            title: "Assignment Deleted",
            description: "The assignment has been deleted successfully.",
          });
        } catch (err) {
          console.error(err);
          toast({
            title: "Deletion Failed",
            description: "Failed to delete assignment",
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <>
    <div className="min-h-screen p-6">
      <div className="h-20 mb-6" />
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <Card className="mb-6 border border-foreground/10 bg-card/80 rounded-2xl shadow-xl">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gradient mb-1">
                Assignments
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage and grade student assignments.
              </p>
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
                className="h-10 px-4 text-sm font-semibold border-0 bg-linear-to-r from-purple-600 via-blue-500 to-indigo-500 hover:opacity-90 text-white"
                onClick={() => setShowCreate((v) => !v)}
              >
                {showCreate ? "Cancel" : "+ Create Assignment"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CREATE FORM */}
        {showCreate && (
          <Card className="mb-6 border border-foreground/10 bg-card/80 rounded-2xl shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ClipboardList className="w-4 h-4" />
                <span className="text-gradient">
                  Create New Assignment
                </span>
              </CardTitle>

              <CardDescription className="text-xs text-muted-foreground">
                Fill in the details to create a new assignment.
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
                    className="text-sm bg-muted/50 border border-foreground/10 rounded-md resize-none min-h-20"
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
                      min={new Date().toISOString().slice(0, 16)}
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

        {/* LIST */}
        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : assignments.length === 0 ? (
          <Card className="border border-foreground/10 bg-card/80 rounded-2xl shadow-xl">
            <CardContent className="flex flex-col items-center justify-center py-24 gap-3">
              <span className="text-6xl">📝</span>
              <h2 className="text-lg font-bold">No assignments yet</h2>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <Card
                key={a._id}
                className="border border-foreground/10 bg-card/80 rounded-2xl shadow-xl cursor-pointer hover:border-foreground/30 transition-all"
                onClick={() => navigate(`/assignments/${a._id}`)}
              >
                <CardContent className="flex items-center justify-between p-5">

                  <div className="flex items-start gap-3">
                    <ListTodo className="w-4 h-4 mt-1 text-muted-foreground" />

                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-sm text-gradient">
                        {a.title}
                      </span>

                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {a.description || "No description"}
                      </span>

                      <div className="flex gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          Max Marks:
                          <span className="text-foreground font-medium ml-1">
                            {a.maxMarks}
                          </span>
                        </span>

                        {a.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due:
                            <span className="text-foreground font-medium ml-1">
                              {new Date(a.dueDate).toLocaleString()}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DELETE ICON BUTTON */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                    onClick={(e) => handleDelete(a._id, e)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>

    <ConfirmDialog
      open={deleteConfirm.open}
      onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
      title={deleteConfirm.title}
      description={deleteConfirm.description}
      onConfirm={deleteConfirm.onConfirm}
    />
    </>
  );
}