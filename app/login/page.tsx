import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role === "ADMIN") {
      redirect("/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold">Shankari&apos;s Canvas</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to the studio dashboard.</p>
        <p className="mt-2 text-xs text-slate-400">
          Dev default: <span className="font-medium text-slate-600">admin</span> /{" "}
          <span className="font-medium text-slate-600">admin123</span>
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
