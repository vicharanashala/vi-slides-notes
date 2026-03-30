"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, User, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "./Logo";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SignupForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Student",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async () => {

    // Basic client-side validation
    if (!formData.fullname || !formData.email || !formData.password) {
      const msg = "All fields are required.";
      toast({
        title: "Validation Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      const msg = "Passwords do not match.";
      toast({
        title: "Validation Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }
    if (formData.password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      toast({
        title: "Validation Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      toast({
        title: "Account Created Successfully",
        description: "Welcome! Your account has been created.",
      });
      navigate("/dashboard"); // redirect on success
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (!err.response) {
          const msg = "Network issue. Please check your connection.";
          toast({
            title: "Network Error",
            description: msg,
            variant: "destructive",
          });
          return;
        }

        const status = err.response.status;
        let errorMessage = "Registration failed. Please try again.";

        switch (status) {
          case 400:
            errorMessage = "Unable to register with provided details.";
            break;

          case 500:
            errorMessage = "Something went wrong. Please try again later.";
            break;
        }
        
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        const msg = "Unexpected error occurred.";
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-dvh px-4">
      <div className="w-full max-w-lg">
        <Card className="border-none shadow-lg pb-0">
          {/* Header */}
          <CardHeader className="flex flex-col items-center space-y-2 pb-5 pt-6">
            <Logo className="mx-auto text-4xl w-auto" />
            <div className="text-center space-y-1">
              <h2 className="text-xl font-semibold text-gradient">
                Create an account
              </h2>
              <p className="text-sm text-muted-foreground">
                Welcome! Create an account to get started.
              </p>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-5 px-8 pb-6">

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm">
                Role
              </Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger
                  id="role"
                  className="h-11 text-sm [&>span]:flex [&>span]:items-center [&>span]:gap-2"
                >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instructor">
                    <User size={16} />
                    Instructor
                  </SelectItem>
                  <SelectItem value="Student">
                    <GraduationCap size={16} />
                    Student
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="fullname" className="text-sm">
                Name
              </Label>
              <Input
                id="fullname"
                name="fullname"
                placeholder="John Doe"
                className="h-11 text-sm"
                value={formData.fullname}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="johndoe@gmail.com"
                className="h-11 text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <div className="relative flex items-center mt-2">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="h-11 pr-11 text-sm"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 h-9 w-9 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm">
                Confirm Password
              </Label>
              <div className="relative flex items-center mt-2">
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="h-11 pr-11 text-sm"
                  placeholder="Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 h-9 w-9 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                {isLoading ? "Creating account..." : "Create account"}
              </span>
            </Button>
          </CardContent>

          {/* Footer */}
          <CardFooter className="flex justify-center border-t py-4">
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-sidebar-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
