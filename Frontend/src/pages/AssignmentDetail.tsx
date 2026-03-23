import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getSingleAssignment,
  submitAssignment,
  type Assignment,
} from "@/lib/api";

export default function AssignmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!id) return;
    getSingleAssignment(id)
      .then((res) => {
        setAssignment(res.data.assignment);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load assignment.");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async () => {
  if (!fileUrl.trim()) {
    setSubmitError("Please enter a file URL.");
    return;
  }
  setSubmitting(true);
  setSubmitError("");
  setSubmitSuccess("");
  try {
    await submitAssignment(id!, fileUrl);
    setSubmitSuccess("Assignment submitted successfully! ✅");
    setFileUrl("");
    const res = await getSingleAssignment(id!);
    setAssignment(res.data.assignment);
  } catch (err: unknown) {
    const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
    setSubmitError(errorMessage || "Submission failed. Try again.");
  } finally {
    setSubmitting(false);
  }
};
  
  return (
    <div className="min-h-screen flex flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="ml-12">
          <h1 className="text-3xl font-bold mb-1">Assignment Details</h1>
          <p className="text-gray-400">View and submit your assignment.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/assignment")}>
          ← Back to Assignments
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {loading ? (
          <p className="text-gray-400 text-xl">Loading...</p>
        ) : error ? (
          <p className="text-red-400 text-xl">{error}</p>
        ) : assignment ? (
          <div className="w-full max-w-2xl flex flex-col gap-6">

            {/* Info Card */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <ClipboardList className="w-7 h-7 text-orange-500" />
                  {assignment.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col gap-3">
                <p className="text-gray-300">{assignment.description}</p>
                <div className="flex justify-between text-sm mt-2">
                  <p className="text-gray-400">
                    By:{" "}
                    <span className="text-white">
                      {assignment.createdBy?.fullname}
                    </span>
                  </p>
                  <p className="text-orange-400">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-gray-400 text-sm">
                  Max Marks:{" "}
                  <span className="text-white">{assignment.maxMarks}</span>
                </p>
              </CardContent>
            </Card>

            {/* Submit Card */}
            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-xl">Submit Assignment</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col gap-4">
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
                  <p className="text-red-400 text-sm">{submitError}</p>
                )}
                {submitSuccess && (
                  <p className="text-green-400 text-sm">{submitSuccess}</p>
                )}

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </CardContent>
            </Card>

          </div>
        ) : null}
      </div>
    </div>
  );
}