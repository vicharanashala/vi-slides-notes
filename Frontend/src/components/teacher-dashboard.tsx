import { useState } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { BookOpen } from "lucide-react";
import { AssignmentsCard } from "./assignments-card";
import { useNavigate } from "react-router-dom";
import { createClass, startClass } from "@/lib/api";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessionTitle, setSessionTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

const handleCreateSession = async (e: React.FormEvent) => {
  e.preventDefault();

  if (isCreating) return;

  if (!sessionTitle.trim()) {
    alert("Please enter a session title");
    return;
  }

  setIsCreating(true);

  try {
    // 1. Create class
    const createRes = await createClass(sessionTitle);
    const newClass = createRes.data?.data;

    if (!newClass?._id) {
      throw new Error("Invalid class response");
    }

    // 2. Start class
    await startClass(newClass._id);

    // 3. Reset + Navigate
    setSessionTitle("");
    navigate(`/session/${newClass._id}`);

  } catch (error: any) {
    console.error("Failed to create session:", error);

    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to start session";

    alert(message);
  } finally {
    setIsCreating(false);
  }
};
  return (
    // Only control padding and height, let global body handle background!
    <div className="min-h-screen p-6">
      {/* Space for header (logo/profile) */}
      <div className="h-20 mb-6" />
      {/* Welcome Card */}
      <Card className="mb-6 border border-foreground/10 bg-card/80 max-w-5xl mx-auto rounded-2xl shadow-xl">
        <CardContent className="p-6">
          <h1 className="text-3xl font-extrabold text-gradient mb-1">
            Welcome, {user?.fullname}
          </h1>
          <p className="text-muted-foreground text-sm">
            Ready to interact with your students?
          </p>
        </CardContent>
      </Card>
      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Start Session Card */}
        <Card className="border border-foreground/10 bg-card/80 rounded-2xl shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-4 h-4" />
              <span className="text-gradient">Start a Session</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Create a new live Q&A session for your class.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={handleCreateSession} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="session-title" className="text-xs font-medium">
                  <span className="text-gradient">Session Title</span>
                </Label>
                <Input
                  id="session-title"
                  type="text"
                  placeholder="e.g. Intro to Biology"
                  className="h-9 text-sm bg-muted/50 border border-foreground/10 rounded-md"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  disabled={isCreating}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-10 text-sm font-semibold border-0"
                disabled={isCreating}
              >
                <span className="text-gradient">
                  {isCreating ? "Creating..." : "Create Now"}
                </span>
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Assignments Card */}
        <AssignmentsCard />
      </div>
    </div>
  );
}
