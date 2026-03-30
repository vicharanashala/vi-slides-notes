import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListTodo } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AssignmentsCard() {
  const navigate = useNavigate();

  return (
    <Card className="card-glass h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-gradient">
          <ListTodo className="w-5 h-5 text-accent" />
          Assignments
        </CardTitle>

        <CardDescription className="text-soft">
          Create and manage student assignments.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 justify-between pt-0 pb-4 px-6">
        <div />

        <Button
          className="btn-glass w-full h-11 text-base"
          onClick={() => navigate("/assignments")}
        >
          Manage Assignments
        </Button>
      </CardContent>
    </Card>
  );
}