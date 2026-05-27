"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const intent = params.get("intent");
  const tier = params.get("tier");
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  // After signup, if the user came here to subscribe we kick off Stripe checkout.
  async function startCheckout() {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return true;
      }
    } catch {
      // fall through to dashboard
    }
    return false;
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setLoading(false);
      toast.error("Could not create account", { description: error.message });
      return;
    }

    // If email confirmation is required, Supabase returns a user but no session.
    if (data.session) {
      if (intent === "subscribe" && tier) {
        const ok = await startCheckout();
        if (ok) return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      setLoading(false);
      setConfirmEmail(true);
    }
  }

  if (confirmEmail) {
    return (
      <AuthShell
        title="Confirm your email"
        subtitle={`We sent a confirmation link to ${email}.`}
      >
        <p className="text-sm text-muted-foreground">
          Click the link to verify your account, then log in to finish
          {intent === "subscribe" ? " subscribing" : ""}.
        </p>
        <Button asChild className="mt-6 w-full">
          <Link href="/login">Go to login</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Join the ritual"
      subtitle={
        intent === "subscribe"
          ? "Create your account, then pick up right where you left off at checkout."
          : "Create your account to start your juice membership."
      }
      footer={
        <>
          Already a member?{" "}
          <Link href="/login" className="text-primary underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="flex flex-col gap-5">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthShell title="Join the ritual" />}>
      <SignupForm />
    </Suspense>
  );
}
