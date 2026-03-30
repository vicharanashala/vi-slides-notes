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
import TodoButton from "@/components/todo-button";
import { useToast } from "@/hooks/use-toast";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionTitle, setSessionTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreating) return;

    if (!sessionTitle.trim()) {
      const msg = "Please enter a session title";
      toast({
        title: "Validation Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const createRes = await createClass(sessionTitle);
      const newClass = createRes.data?.data;

      if (!newClass?._id) {
        throw new Error("Invalid class response");
      }

      await startClass(newClass._id);

      toast({
        title: "Session Created",
        description: "Your live session has been started successfully.",
      });

      setSessionTitle("");
      navigate(`/session/${newClass._id}`);
    } catch (error: any) {
      console.error("Failed to create session:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to start session";

      toast({
        title: "Session Creation Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-dvh px-4 py-12">
      <div className="mx-auto w-full max-w-7xl flex flex-col gap-8">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gradient">
              Teacher Dashboard
            </h1>
            <p className="mt-2 text-base text-muted-foreground">
              Manage sessions and interact with students.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <TodoButton />
          </div>
        </div>

        {/* Welcome Card */}
        <Card className="card-glass">
          <CardContent className="p-10">
            <h2 className="heading-xl text-gradient mb-1">
              Welcome, {user?.fullname}
            </h2>
            <p className="text-soft">
              Ready to start a new session and engage your students?
            </p>
          </CardContent>
        </Card>

        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Start Session Card */}
          <Card className="card-glass flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-lg font-bold text-gradient">
                <BookOpen className="w-5 h-5 text-accent" />
                Start a Session
              </CardTitle>
              <CardDescription className="text-soft">
                Create a new live Q&A session for your class.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col flex-1 justify-between pt-0 pb-4 px-6">
              <form onSubmit={handleCreateSession} className="flex flex-col gap-4">

                {/* Input */}
                <div className="grid gap-2">
                  <Label htmlFor="session-title">
                    Session Title
                  </Label>
                  <Input
                    id="session-title"
                    type="text"
                    placeholder="e.g. Intro to Biology"
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    disabled={isCreating}
                    className="input-glass"
                  />
                </div>

                {/* Button */}
                <Button
                  type="submit"
                  className="btn-gradient w-full h-11 text-base mt-2"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Session"}
                </Button>

              </form>
            </CardContent>
          </Card>

          <AssignmentsCard />

        </div>
      </div>
    </div>
  );
}