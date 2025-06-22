'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => pathname === path;

  let navItems = [
    { href: '/', label: 'Home' },
    { href: '/rent', label: 'Rent a Bike' },
    { href: '/about', label: 'About' },
  ];

  if (status === 'authenticated') {
    navItems = [
      { href: '/', label: 'Home' },
      { href: '/rent', label: 'Rent a Bike' },
      { href: '/rent', label: 'Dashboard' },
      { href: '/about', label: 'About' },
    ];
  }

  // Add admin link if user is admin
  const allNavItems = session?.user?.role === 'ADMIN' 
    ? [...navItems, { href: '/admin', label: 'Admin' }]
    : navItems;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center text-xl font-bold text-red-700 hover:text-red-800 transition-colors">
            <Image src="/spartan_logo.png" alt="Sparta Logo" width={40} height={40} className="mr-2" />
            SPARTA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {allNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${
                  isActive(item.href)
                    ? 'text-blue-700 font-semibold'
                    : 'text-gray-600 hover:text-blue-700'
                } transition-colors duration-200`}
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
                  className="text-gray-600 hover:text-blue-700 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </>
            )}
            {status === 'authenticated' && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200"
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-blue-700 hover:text-blue-800 transition-colors"
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
          <div className="md:hidden py-4 border-t border-gray-200">
            {allNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 ${
                  isActive(item.href)
                    ? 'text-blue-700 font-semibold'
                    : 'text-gray-600 hover:text-blue-700'
                } transition-colors duration-200`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 space-y-2 border-t border-gray-200 mt-4">
              {status === 'unauthenticated' && (
                <>
                  <Link
                    href="/login"
                    className="block text-gray-600 hover:text-blue-700 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block btn-primary text-center"
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
                  className="block bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors duration-200 text-center w-full"
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