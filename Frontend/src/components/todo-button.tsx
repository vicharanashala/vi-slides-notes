import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TodoButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate("/todos")}
    >
      <CheckSquare className="w-5 h-5" />
    </Button>
  );
}