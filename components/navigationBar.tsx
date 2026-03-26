"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/AuthContext";

export default function NavigationBar() {
  const { user, logout } = useAuth();

  return (
    <div className="fixed w-full top-0 z-50 bg-white dark:bg-secondary shadow">
      <div className="py-2 px-8 mx-auto w-full flex items-center justify-between relative max-w-7xl">
        <div className="font-bold text-4xl whitespace-nowrap py-2 rounded-sm text-start shrink-0">
          <h1 className="flex items-center gap-2">
            JouleDuel
            <Image
              src="/JD_logo.png"
              alt="JouleDuel logo"
              width={48}
              height={48}
              className="h-12 w-12 bg-transparent"
            />
          </h1>
        </div>
        <div className="flex items-center gap-8 whitespace-nowrap">
          <nav>
            <ul className="flex items-center text-surface-400 select-none flex-row space-x-8 py-4 font-medium">
              <li>
                <Link href="/" className="flex items-center">
                  <span className="dark:hover:text-gray-400 font-semibold">
                    Problems
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="flex items-center">
                  <span className="dark:hover:text-gray-400 font-semibold">
                    Leaderboard
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/code-help" className="flex items-center">
                  <span className="dark:hover:text-gray-400 font-semibold">
                    Code help
                  </span>
                </Link>
              </li>
            </ul>
          </nav>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-(--text-muted) font-medium">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-1.5 text-sm font-semibold rounded-lg border border-panel-border text-(--text-muted) hover:bg-(--panel-muted) transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-(--accent) text-white hover:bg-(--accent-hover) transition-colors"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
