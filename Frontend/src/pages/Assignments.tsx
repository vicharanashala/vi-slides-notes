import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Assignment() {
  const navigate = useNavigate();

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
      </div>
    </div>
  );
}