import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListTodo } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AssignmentsCard() {
  const navigate = useNavigate();

  return (
    <Card className="border border-foreground/10 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ListTodo className="w-4 h-4" />
          <span className="text-gradient">Assignments</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Create and grade student assignments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full h-10 text-sm font-semibold border-0"
          onClick={() => navigate("/assignments")}
        >
          <span className="text-gradient">Manage Assignments</span>
        </Button>
      </CardContent>
    </Card>
  );
}