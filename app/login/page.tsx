import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue</p>
        </div>
        <LoginForm />
        <p className="text-center text-xs text-muted-foreground">
          Store administrator?{" "}
          <Link href="/admin/login" className="underline underline-offset-2 hover:text-foreground">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
