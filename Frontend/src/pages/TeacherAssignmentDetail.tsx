import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAssignments } from "./TeacherAssignments";

export default function TeacherAssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const assignment = getAssignments().find((a) => a.id === id);

  if (!assignment) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="border border-foreground/10 bg-card/80 rounded-2xl shadow-xl p-8 text-center">
          <p className="text-muted-foreground mb-4">Assignment not found.</p>
          <Button
            className="border-0 bg-gradient-to-r from-purple-600 via-blue-500 to-indigo-500 text-white"
            onClick={() => navigate("/assignments")}
          >
            ← Back to Assignments
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="h-20 mb-6" />
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <h1 className="text-3xl font-extrabold text-foreground">Assignment Detail</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Viewing assignment details
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-10 px-4 text-sm font-medium border border-foreground/20 bg-transparent hover:bg-muted/30"
            onClick={() => navigate("/assignments")}
          >
            ← Back to Assignments
          </Button>
        </div>

        {/* Detail Card */}
        <Card className="border border-foreground/10 bg-card/80 rounded-2xl shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-extrabold text-foreground">
              {assignment.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </p>
              <p className="text-sm text-foreground">
                {assignment.description || "No description provided."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Max Marks
                </p>
                <p className="text-lg font-bold text-foreground">{assignment.maxMarks}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Deadline
                </p>
                <p className="text-sm font-medium text-foreground">
                  {assignment.deadline
                    ? new Date(assignment.deadline).toLocaleString()
                    : "No deadline set"}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Created At
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(assignment.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}