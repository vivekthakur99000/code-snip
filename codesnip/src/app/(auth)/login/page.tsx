import { redirect } from "next/navigation";

import { auth, signIn } from "~/server/auth";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="panel w-full max-w-md rounded-2xl p-6">
        <h1 className="text-[28px] font-medium text-slate-100">Sign in</h1>
        <p className="mt-2 text-sm leading-relaxed muted">
          Continue with GitHub to manage your snippets.
        </p>

        <form
          className="mt-6"
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-green-700 to-emerald-600 px-4 py-2 text-sm text-white transition hover:brightness-110"
          >
            Continue with GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
