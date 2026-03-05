"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Eye, EyeOff, User, Power } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { LoginRequest } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }: { value: LoginRequest }) => {
      setError(null);
      const result = await login(value);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Login failed");
      }
    },
  });

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur border border-white/20 rounded p-8">
          <div className="text-center mb-8">
            <h1 className="text-display text-3xl font-bold text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-white/70">
              Sign in to your LoadShed Predictor account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <form.Field name="username">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                    />
                    <input
                      type="text"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-white/20 bg-white/10 text-white placeholder:text-white/50 rounded focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-200">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 border-2 border-white/20 bg-white/10 text-white placeholder:text-white/50 rounded focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/70"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <p className="mt-1 text-sm text-red-200">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-white/20 text-white font-semibold rounded transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/70">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
