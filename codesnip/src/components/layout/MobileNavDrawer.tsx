"use client";

import Link from "next/link";
import { useState } from "react";

type MobileNavDrawerProps = {
  isAuthenticated: boolean;
};

export function MobileNavDrawer({ isAuthenticated }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-200"
      >
        Menu
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <aside
            className="ml-auto flex h-full w-[82%] max-w-xs flex-col border-l border-slate-700 bg-[#0a1220] p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-200">Navigation</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300"
              >
                Close
              </button>
            </div>

            <nav className="flex flex-col gap-2 text-sm text-slate-300">
              <Link href="/" className="rounded-lg px-3 py-2 hover:bg-slate-800" onClick={() => setOpen(false)}>
                Explore
              </Link>
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/snippets/new"
                className="rounded-lg bg-green-900/35 px-3 py-2 text-green-200"
                onClick={() => setOpen(false)}
              >
                + New Snippet
              </Link>
            </nav>

            {isAuthenticated && (
              <Link
                href="/api/auth/signout"
                className="mt-6 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                onClick={() => setOpen(false)}
              >
                Sign out
              </Link>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
