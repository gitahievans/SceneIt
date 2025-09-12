"use client";

import Link from "next/link";
import { useAuth } from "./Providers";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 lg:px-8 py-2 backdrop-blur-md bg-gray-700/80 border-b border-white/10 shadow-lg">
      <Link 
        href="/" 
        className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white hover:text-gray-200 transition-colors duration-200"
      >
        <span className="text-2xl md:text-3xl">🎬</span>
        <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          SeenIt?
        </span>
      </Link>

      {!loading ? (
        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-600/20 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm md:text-base text-white font-medium">
                  Hi, <span className="text-blue-300">{user.email.split('@')[0]}</span>
                </span>
              </div>
              
              <div className="sm:hidden w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white/30">
                <span className="text-sm font-bold text-white">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>

              <button
                onClick={signOut}
                className="group relative flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-red-500/25 backdrop-blur-sm border border-red-400/30 text-gray-200 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:bg-red-500/30 hover:border-red-400/50 hover:text-red-200 hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="group relative flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-300 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:bg-blue-500/30 hover:border-blue-400/50 hover:text-blue-200 hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </Link>

              <Link
                href="/signup"
                className="group relative flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 text-green-300 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50 hover:text-green-200 hover:scale-105 active:scale-95"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Sign Up
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm md:text-base text-gray-300 font-medium">Loading...</span>
          </div>
        </div>
      )}
    </nav>
  );
}