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

const cardClass =
  "w-full h-full px-6 py-8 rounded-2xl bg-black/40 border border-[#24273b] backdrop-blur-md";

export function CertificatesCard() {
  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Award className="w-5 h-5" />
          <span className="text-gradient">Certificates</span>
        </CardTitle>
        <CardDescription>
          View and download your participation certificates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full text-md mt-4">
          <span className="text-gradient">View Certificates</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export function AssignmentsCard() {
  const navigate = useNavigate();
  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <ClipboardList className="w-5 h-5" />
          <span className="text-gradient">Assignments</span>
        </CardTitle>
        <CardDescription>
          View and submit your assignments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full text-md mt-4" onClick={() => navigate("/assignment")}>
          <span className="text-gradient">View Assignments</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export function JoinSessionCard() {
  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gradient">
          Join Session
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code provided by your teacher.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Session Code</Label>
            <Input
              id="code"
              placeholder="E.G. AB1234"
              maxLength={6}
              className="bg-[#171a28] text-base"
            />
          </div>
          <Button className="w-full text-md mt-2">
            <span className="text-gradient">Join</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


