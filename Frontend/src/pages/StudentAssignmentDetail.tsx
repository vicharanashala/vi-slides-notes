import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  getSingleAssignment,
  submitAssignment,
  type Assignment,
} from "@/lib/api";

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        if (!id) return;
        const res = await getSingleAssignment(id);
        setAssignment(res.data.assignment);
      } catch {
        setError("Failed to load assignment.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id]);

  const handleSubmit = async () => {
    if (!fileUrl.trim()) {
      const msg = "Please enter a file URL.";
      setSubmitError(msg);
      toast({
        title: "Validation Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      await submitAssignment(id!, fileUrl);
      const msg = "Assignment submitted successfully!";
      setSubmitSuccess(msg);
      toast({
        title: "Submission Successful",
        description: msg,
      });
      setFileUrl("");
      const res = await getSingleAssignment(id!);
      setAssignment(res.data.assignment);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const errorMsg = msg || "Submission failed.";
      setSubmitError(errorMsg);
      toast({
        title: "Submission Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh px-4 py-12">
      <div className="mx-auto w-full max-w-3xl flex flex-col gap-8">

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gradient">
              Assignment Details
            </h1>
            <p className="mt-1 text-base text-muted-foreground">
              View and submit your assignment.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/assignment")}>
            ← Back to Assignments
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground text-xl">Loading...</p>
          </div>

        ) : error ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-destructive text-xl font-medium">{error}</p>
          </div>

        ) : assignment ? (
          <div className="flex flex-col gap-6">

            <Card className="shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-lg font-bold text-gradient">
                  <ClipboardList className="w-6 h-6 text-accent" />
                  {assignment.title}
                </CardTitle>
                <CardDescription>
                  {assignment.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0 pb-4 px-6">
                <div className="flex justify-between text-sm">
                  <p className="text-muted-foreground">
                    By:{" "}
                    <span className="text-foreground font-medium">
                      {assignment.createdBy?.fullname}
                    </span>
                  </p>
                  <p className="text-accent font-medium">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-muted-foreground text-sm">
                  Max Marks:{" "}
                  <span className="text-foreground font-medium">
                    {assignment.maxMarks}
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-gradient">
                  Submit Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-0 pb-4 px-6">
                <div className="grid gap-2">
                  <Label htmlFor="fileUrl">File URL</Label>
                  <Input
                    id="fileUrl"
                    placeholder="Paste your Google Drive / GitHub link here"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                </div>

                {submitError && (
                  <p className="text-destructive text-sm">{submitError}</p>
                )}
                {submitSuccess && (
                  <p className="text-green-500 text-sm">{submitSuccess}</p>
                )}

                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  <span className="text-gradient">
                    {submitting ? "Submitting..." : "Submit"}
                  </span>
                </Button>
              </CardContent>
            </Card>

          </div>
        ) : null}

      </div>
    </div>
  );
}