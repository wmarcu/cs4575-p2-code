"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";

function LoginPageContent() {
  const { login, signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect") || "/";

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    let result;
    if (isSignup) {
      if (!name.trim()) {
        setError("Name is required");
        setSubmitting(false);
        return;
      }
      result = await signup(name.trim(), email.trim(), password);
    } else {
      result = await login(email.trim(), password);
    }

    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || "Something went wrong");
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--background) px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 text-3xl font-bold text-(--foreground) hover:opacity-80 transition-opacity"
          >
            <Image
              src="/JD_logo.png"
              alt="JouleDuel logo"
              width={40}
              height={40}
              priority
            />
            <span>JouleDuel</span>
          </Link>
          <p className="mt-2 text-(--text-muted)">
            {isSignup
              ? "Create an account to start competing"
              : "Sign in to submit your solutions"}
          </p>
        </div>

        {/* Form card */}
        <div className="bg-panel border border-panel-border rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-(--foreground)">
            {isSignup ? "Sign Up" : "Log In"}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/50 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-(--text-muted) mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-(--background) border border-panel-border text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)/40 focus:border-(--accent) transition-colors"
                  autoComplete="name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-(--text-muted) mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-(--background) border border-panel-border text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)/40 focus:border-(--accent) transition-colors"
                autoComplete="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-(--text-muted) mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-(--background) border border-panel-border text-(--foreground) focus:outline-none focus:ring-2 focus:ring-(--accent)/40 focus:border-(--accent) transition-colors"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-(--accent) text-white font-semibold hover:bg-(--accent-hover) disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {submitting
                ? isSignup
                  ? "Creating account..."
                  : "Signing in..."
                : isSignup
                  ? "Create Account"
                  : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-(--text-muted)">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setIsSignup(false);
                    setError("");
                  }}
                  className="text-(--accent) hover:underline font-medium cursor-pointer"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => {
                    setIsSignup(true);
                    setError("");
                  }}
                  className="text-(--accent) hover:underline font-medium cursor-pointer"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-(--background)">
          <p className="text-(--text-muted)">Loading...</p>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
