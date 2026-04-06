import Link from "next/link";

import { MobileNavDrawer } from "~/components/layout/MobileNavDrawer";
import { ThemeSwitcher } from "~/components/layout/ThemeSwitcher";
import { auth, signOut } from "~/server/auth";

function initialsFromName(name: string | null | undefined, email: string | null | undefined) {
  const source = name?.trim() ?? email?.trim() ?? "U";
  return source.slice(0, 1).toUpperCase();
}

export async function Navbar() {
  const session = await auth();
  const initials = initialsFromName(session?.user?.name, session?.user?.email);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)]/90 bg-[#0a111f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 text-sm text-[var(--color-text)]">
          <span className="brand-glow h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-base font-medium tracking-wide">CodeSnip</span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm text-slate-300 md:flex">
          <Link href="/" className="rounded-full px-3 py-1.5 transition hover:bg-slate-800/70 hover:text-slate-100">
            Explore
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full px-3 py-1.5 transition hover:bg-slate-800/70 hover:text-slate-100"
          >
            Dashboard
          </Link>
          <Link
            href="/snippets/new"
            className="rounded-full bg-[var(--color-accent-soft)] px-3 py-1.5 text-green-300 transition hover:bg-green-900/40 hover:text-green-100"
          >
            + New
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs text-slate-200">
            {initials}
          </span>
          {session?.user && (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="rounded-full px-3 py-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
              >
                Sign out
              </button>
            </form>
          )}
          <MobileNavDrawer isAuthenticated={!!session?.user} />
        </div>
      </div>
    </header>
  );
}
