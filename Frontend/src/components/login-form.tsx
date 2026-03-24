import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

export default function SigninForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError("All fields are required.");
      return;
    }

    setIsLoading(true);
    try {
      await login({ email:formData.email, password:formData.password });
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 401 || status === 404) {
          setError("Invalid email or password.");
        } else {
          setError("Login failed. Please try again.");
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-dvh px-4">
      <div className="flex flex-1 flex-col justify-center py-12">

        {/* Header */}
        <div className="mx-auto w-full max-w-xl text-center">
          <Logo className="mx-auto text-4xl w-auto logo" aria-hidden={true} />
          <h3 className="mt-4 text-2xl font-bold text-gradient">
            Login to access the platform
          </h3>
        </div>

        {/* Card */}
        <Card className="mt-6 mx-auto w-full max-w-xl shadow-xl">
          <CardContent className="p-10">

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Global error */}
              {error && (
                <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-base font-medium text-muted-foreground">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="johndoe@gmail.com"
                  className="mt-2 h-12 text-base"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="text-base font-medium text-muted-foreground">
                  Password
                </Label>
                <div className="relative flex items-center mt-2">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    className="h-12 pr-12 text-base"
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
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                <span className="text-gradient">
                  {isLoading ? "Logging in..." : "Log in"}
                </span>
              </Button>

            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-base text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-sidebar-primary hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}