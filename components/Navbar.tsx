"use client";

import Link from "next/link";
import { useAuth } from "./Providers";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import SearchComponent from "./SearchComponent";
import { ArrowDownIcon, ChevronDownIcon, LogOut, Search, User } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "next-themes";

const navLinks = [
  {href:  "/profile", label: "Profile", icon: "👤"},
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/discover", label: "Discover", icon: "🔍" },
  { href: "/favorites", label: "Favorites", icon: "❤️" },
];

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const path = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { theme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // console.log("theme", theme);
  // console.log("nav user", user);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSearchOpen(true);
  };

  const handleUserDropdownToggle = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const handleSignOut = () => {
    setUserDropdownOpen(false);
    signOut();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md max-w-7xl mx-auto border-b border-gray-400/20 dark:border-gray-600/20">
        <div className="max-w-full w-full mx-auto">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-black hover:text-gray-600 transition-colors duration-200 dark:text-white dark:hover:text-gray-400"
            >
              <span className="text-2xl">🎬</span>
              <span className="bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900 bg-clip-text text-transparent dark:bg-gradient-to-r dark:from-gray-50 dark:via-purple-400 dark:to-gray-50">
                SceneIt
              </span>
            </Link>

            {!loading && user && (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={handleSearchButtonClick}
                  className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
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
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-400 ${path === link.href
                      ? "border-b-2 border-orange-600 text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      : "border-b-2 border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={handleUserDropdownToggle}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-800 backdrop-blur-sm rounded-lg border border-gray-300/50 dark:border-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {user?.email?.split('@')[0]}
                    </span>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''
                        }`}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {user?.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user?.email?.split('@')[0]}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {user?.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>

                        {/* <Link
                          href="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link> */}
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                        <div className="flex items-center justify-between px-4 py-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{theme === "dark" ? "Dark" : "Light"}</span>
                          <ThemeToggle />
                        </div>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!loading && !user && (
              <div className="hidden md:flex items-center space-x-3">
                <button
                  onClick={handleSearchButtonClick}
                  className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 dark:border-gray-600 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:border-gray-600 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  Sign Up
                </Link>
                <ThemeToggle />
              </div>
            )}

            {!loading && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
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
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen && !loading && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl">
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <p className="text-sm text-gray-700 dark:text-gray-300 capitalize"> {theme}</p>
              </div>
              <button
                onClick={handleSearchButtonClick}
                className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 border border-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
              {user ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${path === link.href
                        ? "bg-gray-200 dark:bg-gray-700 text-orange-600 dark:text-orange-400"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-lg">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}

                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                        {user?.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Online</div>
                    </div>
                  </div>

                  <button
                    onClick={signOut}
                    className="flex items-center gap-3 w-full px-3 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 rounded-lg text-sm font-medium transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-3 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-all duration-200"
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