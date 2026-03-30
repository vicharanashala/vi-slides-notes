import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: user?.fullname || "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    // ❗ Validation (based on backend)
    if (
      !formData.fullname &&
      !formData.oldPassword &&
      !formData.newPassword
    ) {
      const msg = "Nothing to update";
      setError(msg);
      toast({
        title: "Validation Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    // If one password field is filled, require both
    if (
      (formData.oldPassword && !formData.newPassword) ||
      (!formData.oldPassword && formData.newPassword)
    ) {
      const msg = "Both old and new password are required";
      setError(msg);
      toast({
        title: "Validation Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }
    // Confirm password check
    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      const msg = "Passwords do not match";
      setError(msg);
      toast({
        title: "Validation Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      await updateUser(formData);

      const msg = "Profile updated successfully";
      setSuccess(msg);
      toast({
        title: "Profile Updated",
        description: msg,
      });

      setFormData((prev) => ({
        ...prev,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Something went wrong";
      setError(errorMsg);
      toast({
        title: "Update Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-dvh px-4">
      <div className="absolute top-6 left-6">
        <Button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 px-4 h-10"
            >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="text-gradient">Back</span>
        </Button>
      </div>  
      <div className="w-full max-w-lg">
        <Card className="border-none shadow-lg pb-0">

          {/* Header */}
          <div className="text-center pt-6 pb-2">
            <h2 className="text-xl font-semibold text-gradient">
              Edit Profile
            </h2>
            <p className="text-sm text-muted-foreground">
              Update your account details
            </p>
          </div>

          {/* Content */}
          <CardContent className="space-y-5 px-8 pb-6">

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            {/* Success */}
            {success && (
              <p className="text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-md">
                {success}
              </p>
            )}

            {/* Fullname */}
            <div className="space-y-2">
              <Label className="text-sm">Full Name</Label>
              <Input
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                className="h-11 text-sm"
              />
            </div>

            {/* Old Password */}
            <div className="space-y-2">
                <Label className="text-sm">Old Password</Label>

                <div className="relative flex items-center mt-2">
                    <Input
                        name="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        className="h-11 pr-11 text-sm"
                        value={formData.oldPassword}
                        onChange={handleChange}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 h-9 w-9 text-muted-foreground hover:bg-transparent"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                    {showOldPassword ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                    </Button>
                </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
                <Label className="text-sm">New Password</Label>

                <div className="relative flex items-center mt-2">
                    <Input
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        className="h-11 pr-11 text-sm"
                        value={formData.newPassword}
                        onChange={handleChange}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 h-9 w-9 text-muted-foreground hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                        {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-sm">Confirm Password</Label>

              <div className="relative flex items-center mt-2">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="h-11 pr-11 text-sm"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 h-9 w-9 text-muted-foreground hover:bg-transparent"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {/* Submit */}
            <Button
              className="w-full h-11 text-sm font-medium"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <span className="text-gradient">
                {isLoading ? "Updating..." : "Update Profile"}
              </span>
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}