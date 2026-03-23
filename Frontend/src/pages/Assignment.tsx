import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { getAssignments, type Assignment } from "@/lib/api";

export default function Assignment() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAssignments()
      .then((res) => {
        setAssignments(res.data.assignments);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load assignments.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="ml-12">
          <h1 className="text-3xl font-bold mb-1">Assignments</h1>
          <p className="text-gray-400">View and submit your assignments.</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {loading ? (
          <p className="text-gray-400 text-xl">Loading...</p>
        ) : error ? (
          <p className="text-red-400 text-xl">{error}</p>
        ) : assignments.length === 0 ? (
          <Card className="w-full max-w-2xl text-center px-16 py-20">
            <CardHeader>
              <CardTitle className="flex flex-col items-center gap-8">
                <ClipboardList className="w-20 h-20 text-orange-500" />
                <span className="text-3xl font-semibold">No assignments yet</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-xl">
                Check back later for new assignments.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full max-w-2xl flex flex-col gap-4">
            {assignments.map((a) => (
              <Card key={a._id} className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{a.title}</h2>
                    <p className="text-gray-400 mt-1 text-sm">{a.description}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      By: {a.createdBy?.fullname}
                    </p>
                  </div>
                  <div className="text-right text-sm shrink-0 ml-4">
                    <p className="text-orange-400">
                      Due: {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400">Marks: {a.maxMarks}</p>
                  </div>
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={() => navigate(`/assignment/${a._id}`)}
                >
                  View & Submit
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}