"use client";

import Link from "next/link";
import { useAuth } from "./Providers";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  // console.log("user", user);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
      <Link href="/" className="text-xl font-bold">
        🎬 MovieApp
      </Link>

      {!loading ? (
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm">Hi, {user.email}</span>
              <button
                onClick={signOut}
                className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <span className="text-sm">Loading User...</span>
        </div>
      )}
    </nav>
  );
}
