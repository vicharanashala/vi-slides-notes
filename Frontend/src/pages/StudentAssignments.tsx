import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getAssignments, type Assignment } from "@/lib/api";

export default function Assignment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await getAssignments();
        setAssignments(res.data.assignments);
      } catch (err) {
        const errorMsg = "Failed to load assignments.";
        setError(errorMsg);
        toast({
          title: "Load Failed",
          description: errorMsg,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [toast]);

  return (
    <div className="flex flex-col min-h-dvh px-4 py-12">
      <div className="mx-auto w-full max-w-3xl flex flex-col gap-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gradient">Assignments</h1>
            <p className="mt-1 text-base text-muted-foreground">
              View and submit your assignments.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-muted-foreground text-xl">Loading...</p>
          </div>

        ) : error ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-destructive text-xl font-medium">{error}</p>
          </div>

        ) : assignments.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="shadow-xl w-full">
              <CardHeader className="items-center text-center pb-4">
                <ClipboardList className="w-12 h-12 text-accent mb-2" />
                <CardTitle className="text-2xl font-bold text-gradient">
                  No assignments yet
                </CardTitle>
                <CardDescription>
                  Check back later for new assignments from your teacher.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

        ) : (
          <div className="flex flex-col gap-4">
            {assignments.map((a) => (
              <Card key={a._id} className="shadow-xl">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-bold text-gradient">
                      {a.title}
                    </CardTitle>
                    <span className="text-accent font-medium text-sm shrink-0 pt-0.5">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <CardDescription>{a.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center pt-0 pb-4 px-6">
                  <p className="text-sm text-muted-foreground">
                    By:{" "}
                    <span className="text-foreground font-medium">
                      {a.createdBy?.fullname}
                    </span>
                    {" · "}Marks:{" "}
                    <span className="text-foreground font-medium">
                      {a.maxMarks}
                    </span>
                  </p>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/assignment/${a._id}`)}
                  >
                    <span className="text-gradient">View & Submit</span>
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