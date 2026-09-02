"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resolvePostLoginPath, safeNext } from "@/lib/auth/redirect";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });

    if (signInErr) {
      // Deactivated accounts are banned in Auth, which surfaces as a generic failure.
      setError(
        /banned|disabled/i.test(signInErr.message)
          ? "This account has been deactivated. Contact an admin."
          : signInErr.message
      );
      setIsSubmitting(false);
      return;
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("approval_status, onboarding_completed")
      .eq("id", data.user.id)
      .single();

    // On a failed lookup, send them to the dashboard rather than guessing.
    // resolvePostLoginPath treats a missing profile as "not onboarded" and
    // would strand an onboarded user on /onboarding; the dashboard layout
    // re-checks approval_status server-side, so nothing is bypassed.
    const target = profileErr
      ? safeNext(next) ?? "/dashboard"
      : resolvePostLoginPath(profile, next);

    // A full document load, not router.push. signInWithPassword has only just
    // written the auth cookie, and a soft navigation asks middleware for the
    // destination before that cookie is reliably attached -- middleware sees no
    // session, redirects back to /login, and because we are already here
    // nothing visibly happens and the button spins forever.
    window.location.assign(target);
  }

  return (
    <AuthShell
      title="Sign in"
      description="Access your Superteam Malaysia member dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Register
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShell title="Sign in">{null}</AuthShell>}>
      <LoginForm />
    </Suspense>
  );
}
