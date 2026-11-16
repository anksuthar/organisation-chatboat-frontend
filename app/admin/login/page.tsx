import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-slate-50 shadow-sm">
        <div className="space-y-1 text-center">
          <ShieldCheck className="mx-auto size-8 text-slate-300" />
          <h1 className="text-2xl font-semibold">Admin Portal</h1>
          <p className="text-sm text-slate-400">Sign in with your administrator account</p>
        </div>
        <LoginForm requireRole="admin" />
        <p className="text-center text-xs text-slate-400">
          Not an administrator?{" "}
          <Link href="/login" className="underline underline-offset-2 hover:text-slate-200">
            Go to the regular sign-in
          </Link>
        </p>
      </div>
    </div>
  );
}
