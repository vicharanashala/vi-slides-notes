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
import { useState } from "react";
import { joinClass } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


// ===================== CERTIFICATES =====================
export function CertificatesCard() {
  const certificates: any[] = [];

  return (
    <Card className="card-glass h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-gradient">
          <Award className="w-5 h-5 text-accent" />
          Certificates
        </CardTitle>
        <CardDescription className="text-soft">
          View and download your participation certificates.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 justify-between pt-0 pb-4 px-6">
        <div />

        <Dialog>
          <DialogTrigger asChild>
            <Button className="btn-glass w-full h-11 text-base">
              View Certificates
            </Button>
          </DialogTrigger>

          <DialogContent className="card-glass max-w-xl p-0 overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <DialogHeader>
                <DialogTitle className="heading-lg heading-gradient">
                  Your Certificates
                </DialogTitle>
                <p className="text-soft text-sm mt-1">
                  Track your achievements and downloads
                </p>
              </DialogHeader>
            </div>

            {/* Body */}
            <div className="p-6">
              {certificates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  
                  <div className="p-6 rounded-full bg-white/10 backdrop-blur-md mb-6">
                    <Award className="w-10 h-10 text-accent animate-pulse" />
                  </div>

                  <h3 className="text-xl font-semibold text-gradient">
                    No Certificates Yet
                  </h3>
                  <p className="text-soft mt-2 max-w-sm">
                    Attend sessions and complete activities to unlock your
                    certificates.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {certificates.map((cert, index) => (
                    <div
                      key={index}
                      className="card-glass flex items-center justify-between p-4"
                    >
                      <div>
                        <p className="font-medium">{cert.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Issued recently
                        </p>
                      </div>

                      <Button className="btn-glass">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}


// ===================== ASSIGNMENTS =====================
export function AssignmentsCard() {
  const navigate = useNavigate();

  return (
    <Card className="card-glass h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-lg font-bold text-gradient">
          <ClipboardList className="w-5 h-5 text-accent" />
          Assignments
        </CardTitle>
        <CardDescription className="text-soft">
          View and submit your assignments.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 justify-between pt-0 pb-4 px-6">
        <div />

        <Button
          className="btn-glass w-full h-11 text-base"
          onClick={() => navigate("/assignment")}
        >
          View Assignments
        </Button>
      </CardContent>
    </Card>
  );
}


// ===================== JOIN SESSION =====================
export function JoinSessionCard() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoin = async () => {
    if (!code.trim()) {
      const msg = "Enter session code";
      toast({
        title: "Validation Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await joinClass(code.trim());

      const classId = res.data?.classId;

      if (!classId) {
        throw new Error("Invalid session");
      }

      toast({
        title: "Session Joined",
        description: "You have successfully joined the session.",
      });

      navigate(`/session/${classId}`);
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || "Invalid session code";
      toast({
        title: "Join Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="card-glass h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-gradient">
          Join Session
        </CardTitle>
        <CardDescription className="text-soft">
          Enter the 6-digit code provided by your teacher.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 justify-between pt-0 pb-4 px-6">
        
        {/* Input */}
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Session Code</Label>
            <Input
              id="code"
              placeholder="E.G. AB1234"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              disabled={loading}
              className="input-glass"
            />
          </div>
        </div>

        {/* Button */}
        <Button
          className="btn-gradient w-full h-11 text-base mt-6"
          onClick={handleJoin}
          disabled={loading}
        >
          {loading ? "Joining..." : "Join Session"}
        </Button>
      </CardContent>
    </Card>
  );
}