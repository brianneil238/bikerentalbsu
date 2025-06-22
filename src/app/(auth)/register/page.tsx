'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Briefcase, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as 'STUDENT' | 'TEACHING_STAFF' | 'NON_TEACHING_STAFF',
    };

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      router.push('/login?registered=true');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred during registration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-3">
            <Image src="/spartan_logo.png" alt="BSU Logo" width={50} height={50} />
            <div>
              <h1 className="text-lg font-bold text-red-700">SPARTA</h1>
              <p className="text-xs text-gray-600">BATANGAS STATE UNIVERSITY - TNEU</p>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white py-4 shadow-sm">
        <h2 className="text-center text-2xl font-bold text-gray-800 tracking-wide">University Bike Rental</h2>
      </div>

      <div className="bg-blue-600 py-2">
        <p className="text-center text-white text-sm">Spartan&apos;s Pedal Access & Rental Transport Assistant</p>
      </div>

      <main className="flex-grow flex items-center justify-center py-10">
        <div className="w-full max-w-sm">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Create your account</h3>
            <p className="text-sm text-gray-600 mb-6">
              Or{' '}
              <Link href="/login" className="font-semibold text-blue-700 hover:underline">
                sign in to your account
              </Link>
            </p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
              )}

              <div className="relative flex items-center">
                <span className="absolute left-0 top-0 flex items-center justify-center w-10 h-full bg-gray-200 rounded-l-md">
                  <User className="h-5 w-5 text-gray-500" />
                </span>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Full Name"
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-0 top-0 flex items-center justify-center w-10 h-full bg-gray-200 rounded-l-md">
                  <Mail className="h-5 w-5 text-gray-500" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Email"
                />
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-0 top-0 flex items-center justify-center w-10 h-full bg-gray-200 rounded-l-md">
                  <Lock className="h-5 w-5 text-gray-500" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="w-full pl-12 pr-10 py-2 border border-gray-300 rounded-md bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative flex items-center">
                <span className="absolute left-0 top-0 flex items-center justify-center w-10 h-full bg-gray-200 rounded-l-md">
                  <Briefcase className="h-5 w-5 text-gray-500" />
                </span>
                <select
                  id="role"
                  name="role"
                  required
                  defaultValue=""
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md bg-white text-black invalid:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" disabled>Select your role</option>
                  <option value="STUDENT" className="text-black">Student</option>
                  <option value="TEACHING_STAFF" className="text-black">Teaching Staff</option>
                  <option value="NON_TEACHING_STAFF" className="text-black">Non-Teaching Staff</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-black bg-yellow-400 hover:bg-yellow-500 rounded-md font-semibold text-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 