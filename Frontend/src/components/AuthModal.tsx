"use client";

import React, { useState } from "react";

import { Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";

import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import TwitterLogo from "./TwitterLogo";
import LoadingSpinner from "./Loading-spinner";
import { Separator } from "./ui/separator";

const AuthModal = ({ isOpen, onClose, initialmode = "login" }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">(initialmode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userName: "",
    displayName: "",
  });
  const [error, setError] = useState({});
  if (!isOpen) return null;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    setError({});
    setFormData({
      email: "",
      password: "",
      userName: "",
      displayName: "",
    });
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
    if (error[field]) {
      setError((prevError: any) => ({ ...prevError, [field]: "" }));
    }
  };
  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError({});
    setFormData({
      email: "",
      password: "",
      userName: "",
      displayName: "",
    });
  };
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-black border-gray-800 text-white">
        <CardHeader className="relative pb-6">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white hover:bg-gray-900"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <TwitterLogo size="xl" className="text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {mode === "login" ? "Sign in to X" : "Create your account"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error.general && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
              {error.general}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">
                    Display Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="displayName"
                      type="text"
                      value={formData.displayName}
                      placeholder="Display Name"
                      onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                      }
                      className="pl-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                  </div>
                  {error.displayName && (
                    <p className="text-red-400 text-sm">{error.displayName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userName" className="text-white">
                    Username
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      @
                    </span>
                    <Input
                      id="userName"
                      type="text"
                      placeholder="username"
                      value={formData.userName}
                      onChange={(e) =>
                        handleInputChange("userName", e.target.value)
                      }
                      className="pl-8 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                  {error.userName && (
                    <p className="text-red-400 text-sm">{error.userName}</p>
                  )}
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              {error.email && (
                <p className="text-red-400 text-sm">{error.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="pl-10 pr-10 bg-transparent border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {error.password && (
                <p className="text-red-400 text-sm">{error.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-full text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </span>
                </div>
              ) : mode === "login" ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </form>
          <div className="relative">
            <Separator className="bg-gray-700" />
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black px-2 text-gray-400 text-sm">
              OR
            </span>
          </div>
          <div>
            <p>
              {mode === "login"
                ? "Don't have an account"
                : "Already have an account?"}
              <Button
                variant="link"
                onClick={switchMode}
                disabled={isLoading}
                className="text-blue-400 hover:text-blue-300 font-semibold pl-1"
              >
                {mode === "login" ? "Sign up" : "Log in"}
              </Button>
            </p>
          </div>
          {mode === "signup" && (
            <div className="text-center text-xs text-gray-400">
              By signing up, you agree to our Terms of Service and Privacy
              Policy, including Cookie Use.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;
