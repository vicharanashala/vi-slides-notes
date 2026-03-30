import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import {
  getSingleAssignment,
  deleteAssignment as deleteAssignmentAPI,
  getAllSubmissions,
} from "@/lib/api";

import type { AllSubmission } from "@/lib/api";

export default function TeacherAssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Submissions state
  const [submissions, setSubmissions] = useState<AllSubmission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsVisible, setSubmissionsVisible] = useState(false);
  const [submissionsError, setSubmissionsError] = useState("");
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

  // Fetch assignment
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await getSingleAssignment(id!);
        setAssignment(res.data.assignment);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  // Delete handler
  const handleDelete = () => {
    setDeleteConfirm({
      open: true,
      title: "Delete Assignment",
      description: "Are you sure you want to delete this assignment? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteAssignmentAPI(id!);
          toast({
            title: "Assignment Deleted",
            description: "The assignment has been deleted successfully.",
          });
          navigate("/assignments");
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

  // Toggle submissions
  const handleToggleSubmissions = async () => {
    if (submissionsVisible) {
      setSubmissionsVisible(false);
      return;
    }

    setSubmissionsLoading(true);
    setSubmissionsError("");

    try {
      const res = await getAllSubmissions();
      const filtered = res.data.submissions.filter(
        (s) => s.assignmentTitle === assignment?.title
      );
      setSubmissions(filtered);
      setSubmissionsVisible(true);
      toast({
        title: "Submissions Loaded",
        description: `Found ${filtered.length} submission(s) for this assignment.`,
      });
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to load submissions";
      setSubmissionsError(errorMsg);
      toast({
        title: "Load Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSubmissionsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Loading assignment...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="border border-foreground/10 bg-card/80 rounded-2xl shadow-xl p-8 text-center">
          <p className="text-muted-foreground mb-4">Assignment not found.</p>
          <Button
            className="border-0 bg-linear-to-r from-purple-600 via-blue-500 to-indigo-500 text-white"
            onClick={() => navigate("/assignments")}
          >
            ← Back to Assignments
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen p-6">
      <div className="h-20 mb-6" />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">
                Assignment Detail
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Viewing assignment details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="h-10 px-3 border border-foreground/20"
              onClick={() => navigate(`/assignments/edit/${id}`)}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            <Button
              variant="destructive"
              className="h-10 px-3"
              onClick={handleDelete}
            >
              <Trash className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              className="h-10 px-4"
              onClick={() => navigate("/assignments")}
            >
              ← Back
            </Button>
          </div>
        </div>

        {/* Detail Card */}
        <Card className="border border-foreground/10 bg-card/80 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold">
              {assignment.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Description
              </p>
              <p>{assignment.description || "No description provided."}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Max Marks
                </p>
                <p className="text-lg font-bold">
                  {assignment.maxMarks}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Deadline
                </p>
                <p>
                  {assignment.dueDate
                    ? new Date(assignment.dueDate).toLocaleString()
                    : "No deadline set"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Created At
              </p>
              <p>
                {new Date(assignment.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Button */}
        <div className="mt-4">
          <Button
            className="w-full"
            onClick={handleToggleSubmissions}
            disabled={submissionsLoading}
          >
            {submissionsLoading
              ? "Loading..."
              : submissionsVisible
              ? "Hide Submissions"
              : "View Submissions"}
          </Button>
        </div>

        {/* Submissions */}
        {submissionsVisible && (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>
                Student Submissions ({submissions.length})
              </CardTitle>
            </CardHeader>

            <CardContent>
              {submissionsError ? (
                <p className="text-red-500">{submissionsError}</p>
              ) : submissions.length === 0 ? (
                <p>No submissions yet.</p>
              ) : (
                <ul className="space-y-2">
                  {submissions.map((s, i) => (
                    <li
                      key={i}
                      className="flex justify-between bg-muted p-3 rounded"
                    >
                      <div>
                        <p>{s.student.fullname}</p>
                        <p className="text-sm text-muted-foreground">
                          {s.student.email}
                        </p>
                      </div>

                    
                      <a
                        href={s.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        View file
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
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
