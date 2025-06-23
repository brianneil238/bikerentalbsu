'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Lock, HelpCircle, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email,
        password,
      });

      if (result?.error) {
        setError('Invalid Email or password.');
      } else {
        // Redirect based on role or to previous page
        const userResponse = await fetch('/api/auth/user-info');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.role === 'ADMIN') {
            router.push('/admin');
          } else {
            const from = searchParams?.get('from') || '/';
            router.push(from);
          }
        } else {
          const from = searchParams?.get('from') || '/';
          router.push(from);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const registered = searchParams?.get('registered');

  // Show nothing while checking session
  if (status === 'loading' || status === 'authenticated') {
    return null;
  }

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
        <p className="text-center text-white text-sm">Spartans&apos; Pedal Access & Rental Transport Assistant
        </p>
      </div>
      
      <main className="flex-grow flex items-center justify-center py-10">
        <div className="w-full max-w-sm">
          <div className="bg-white p-6 rounded-md shadow-md">
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Please Login</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {registered && (
                <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">Registration successful! You can now sign in.</p>
              )}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
              )}
              
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
                  autoComplete="current-password"
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

              <p className="text-xs text-gray-500">* Password is case sensitive</p>

              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex items-center">
                  <input type="checkbox" className="w-5 h-5 border-gray-400 rounded-sm" />
                  <span className="ml-2 text-sm text-gray-700">I&apos;m not a robot</span>
                </div>
                <div className="text-xs text-gray-400 text-right">
                  reCAPTCHA
                  <div>
                    <a href="#" className="underline">Privacy</a> - <a href="#" className="underline">Terms</a>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-black bg-yellow-400 hover:bg-yellow-500 rounded-md font-semibold text-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>

              <div className="text-center mt-6">
                <p className="text-sm">
                  <span className="text-gray-600">Don&apos;t have an account? </span>
                  <Link href="/register" className="font-semibold text-blue-700 hover:underline">
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
} 