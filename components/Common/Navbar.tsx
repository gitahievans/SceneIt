"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bot, ChevronDownIcon, Compass, Heart, Home, LogOut, Menu, PlaySquare, Search, User, X } from "lucide-react";
import Logo from "../../public/assets/icon.png";
import SearchComponent from "../Search/SearchComponent";
import ThemeToggle from "../ThemeToggle";
import { useAuth } from "./Providers";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/ai-discover", label: "AI Discover", icon: Bot },
  { href: "/providers", label: "Providers", icon: PlaySquare },
  { href: "/favorites", label: "Favorites", icon: Heart },
];

const mobileNavLinks = [{ href: "/profile", label: "Profile", icon: User }, ...navLinks];

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const path = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { theme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setSearchOpen(true);
  };

  const handleSignOut = () => {
    setUserDropdownOpen(false);
    signOut();
  };

  return (
    <>
      <nav className="sticky top-0 z-50 mx-auto max-w-7xl border-b border-gray-400/20 bg-white/80 backdrop-blur-md dark:border-gray-600/20 dark:bg-gray-900/80">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-black transition-colors duration-200 hover:text-gray-600 dark:text-white dark:hover:text-gray-400"
          >
            <Image src={Logo} alt="SceneIt Logo" width={24} height={24} priority />
            <span className="bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900 bg-clip-text text-transparent dark:from-gray-50 dark:via-purple-400 dark:to-gray-50">
              SceneIt
            </span>
          </Link>

          {!loading && (
            <div className="hidden items-center space-x-2 md:flex">
              <button
                onClick={handleSearchButtonClick}
                className="rounded-lg p-2 text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {user &&
                navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = path === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 rounded-lg border-b-2 px-2 py-2 text-sm font-medium transition-all duration-200 ${
                        active
                          ? "border-orange-600 text-orange-600 hover:bg-gray-100 dark:text-orange-400 dark:hover:bg-gray-800"
                          : "border-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                      }`}
                    >
                      <Icon size={15} />
                      {link.label}
                    </Link>
                  );
                })}

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen((open) => !open)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300/50 bg-gray-200 px-3 py-2 backdrop-blur-sm transition-all duration-200 hover:bg-gray-300 dark:border-gray-700/50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-sm text-gray-800 dark:text-gray-200">
                      {user.email?.split("@")[0]}
                    </span>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-gray-600 transition-transform duration-200 dark:text-gray-400 ${
                        userDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-2xl backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800">
                      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                            <span className="text-sm font-bold text-white">
                              {user.email?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.email?.split("@")[0]}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>

                      <div className="border-t border-gray-200 py-1 dark:border-gray-700">
                        <div className="flex items-center justify-between px-4 py-2">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {theme === "dark" ? "Dark" : "Light"}
                          </span>
                          <ThemeToggle />
                        </div>
                      </div>

                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-3 border-t border-gray-200 px-4 py-2 text-sm text-red-600 transition-colors duration-200 hover:bg-red-50 dark:border-gray-700 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg border border-gray-300 bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Sign Up
                  </Link>
                  <ThemeToggle />
                </>
              )}
            </div>
          )}

          {!loading && (
            <button
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>

        {mobileMenuOpen && !loading && (
          <div className="border-t border-gray-200 bg-white/95 backdrop-blur-3xl dark:border-gray-700 dark:bg-gray-900/95 md:hidden">
            <div className="space-y-3 px-4 py-3">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <p className="text-sm capitalize text-gray-700 dark:text-gray-300">{theme}</p>
              </div>

              <button
                onClick={handleSearchButtonClick}
                className="flex w-full items-center gap-3 rounded-lg border border-gray-300 px-3 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <Search className="h-5 w-5" />
                Search
              </button>

              {user ? (
                <>
                  {mobileNavLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                          path === link.href
                            ? "bg-gray-200 text-orange-600 dark:bg-gray-700 dark:text-orange-400"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    );
                  })}

                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="block rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-800 transition-all duration-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
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

      {searchOpen && <SearchComponent isSpotlight={true} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
