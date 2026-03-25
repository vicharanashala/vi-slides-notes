import { Award, ClipboardList } from "lucide-react";
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
import { useNavigate } from "react-router-dom";

export function CertificatesCard() {
  return (
    <Card className="shadow-xl h-full flex flex-col hover:scale-[1.02] transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-gradient">
          <Award className="w-5 h-5 text-accent" />
          Certificates
        </CardTitle>
        <CardDescription>
          View and download your participation certificates.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 justify-between pt-0 pb-4 px-6">
        <div />
        <Button className="w-full h-11 text-base font-medium">
          <span className="text-gradient">View Certificates</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export function AssignmentsCard() {
  const navigate = useNavigate();

  return (
    <Card className="shadow-xl h-full flex flex-col hover:scale-[1.02] transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-gradient">
          <ClipboardList className="w-5 h-5 text-accent" />
          Assignments
        </CardTitle>
        <CardDescription>
          View and submit your assignments.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 justify-between pt-0 pb-4 px-6">
        <div />
        <Button
          className="w-full h-11 text-base font-medium"
          onClick={() => navigate("/assignment")}
        >
          <span className="text-gradient">View Assignments</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export function JoinSessionCard() {
  return (
    <Card className="shadow-xl h-full flex flex-col hover:scale-[1.02] transition-all duration-300">
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-gradient">
          Join Session
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code provided by your teacher.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 justify-between pt-0 pb-4 px-6">
        
        {/* Top content */}
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Session Code</Label>
            <Input
              id="code"
              placeholder="E.G. AB1234"
              maxLength={6}
            />
          </div>
        </div>

        {/* Bottom button */}
        <Button className="w-full h-11 text-base font-medium mt-6">
          <span className="text-gradient">Join</span>
        </Button>

      </CardContent>
    </Card>
  );
}