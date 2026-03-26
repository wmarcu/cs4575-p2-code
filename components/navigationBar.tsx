import Link from "next/link";
import Image from "next/image";

export default function NavigationBar() {
  return (
    <div className="fixed w-full top-0 z-50 bg-white dark:bg-secondary shadow">
      <div className="py-2 px-8 mx-auto w-full flex items-center justify-between relative max-w-7xl">
        <div className="font-bold text-4xl whitespace-nowrap w-full py-2 rounded-sm text-start">
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
        <nav className="flex items-center flex-1 justify-center">
          <ul className="flex items-center text-surface-400 select-none flex-row space-x-8 py-4 font-medium whitespace-nowrap">
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
      </div>
    </div>
  );
}
