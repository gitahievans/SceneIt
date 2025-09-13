"use client";

import Link from "next/link";
import { useAuth } from "./Providers";
import { usePathname } from "next/navigation";
import { useState } from "react";
import SearchComponent from "./SearchComponent";

const navLinks = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/discover", label: "Discover", icon: "🔍" },
  { href: "/favorites", label: "Favorites", icon: "❤️" },
];

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const path = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log("nav user", user);

  const handleSearchButtonClick = (event: React.MouseEvent) => {
    // console.log("search button clicked");
    event.stopPropagation();
    setSearchOpen(true);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-orange-50/20 max-w-7xl mx-auto border-b border-white/10 shadow-lg">
        <div className="max-w-full mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-black hover:text-gray-600 transition-colors duration-200"
            >
              <span className="text-2xl">🎬</span>
              <span className="bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900 bg-clip-text text-transparent ">
                SceneIt
              </span>
            </Link>

            {!loading && user && (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={handleSearchButtonClick}
                  className="p-2 text-black hover:text-black hover:bg-white/10 rounded-lg transition-all duration-200"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${path === link.href
                      ? "bg-white/20 text-black"
                      : "text-black hover:text-black hover:bg-white/10"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/10">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-black">
                    {user?.email?.split('@')[0]}
                  </span>
                </div>

                <button
                  onClick={signOut}
                  className="p-2 text-black hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  aria-label="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}

            {!loading && !user && (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={handleSearchButtonClick}
                  className="p-2 text-black hover:text-black hover:bg-white/10 rounded-lg transition-all duration-200"
                  aria-label="Search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                <Link
                  href="/login"
                  className="px-4 py-2 text-black hover:text-black hover:bg-white/10 border border-gray-400 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-white/20 text-black hover:bg-white/30 border border-gray-600/20 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {!loading && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-black hover:text-black hover:bg-white/10 rounded-lg transition-all duration-200"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}

            {loading && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-black">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen && !loading && (
          <div className="md:hidden border-t border-white/10 bg-orange-50/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-3">
              <button
                onClick={handleSearchButtonClick}
                className="flex items-center gap-3 w-full px-3 py-2 text-black border border-gray-600/20 hover:text-black hover:bg-white/10 rounded-lg transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
              {user ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${path === link.href
                        ? "bg-white/20 text-black"
                        : "text-black hover:text-black hover:bg-white/10"
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}

                  <div className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg border border-white/10">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-black">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-black font-medium">
                        {user?.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-600">Online</div>
                    </div>
                  </div>

                  <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-black hover:text-black hover:bg-white/10 rounded-lg text-sm font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-3 py-2 bg-white/20 text-black hover:bg-white/30 rounded-lg text-sm font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {searchOpen && (
        <SearchComponent
          isSpotlight={true}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </>
  );
}