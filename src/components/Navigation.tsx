'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => pathname === path;

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/rent', label: 'Rent a Bike' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-green-600">
            BikeShare
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  isActive(item.href)
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                } transition-colors`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'unauthenticated' && (
              <>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
            {status === 'authenticated' && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 ${
                  isActive(item.href)
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                } transition-colors`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              {status === 'unauthenticated' && (
                <>
                  <Link
                    href="/login"
                    className="block text-gray-600 hover:text-green-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
              {status === 'authenticated' && (
                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setIsMenuOpen(false);
                  }}
                  className="block bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors text-center"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 