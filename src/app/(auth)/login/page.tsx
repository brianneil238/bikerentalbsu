'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { User, Lock, HelpCircle, Mail } from 'lucide-react';
import Image from 'next/image';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const srCode = formData.get('srCode') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: srCode,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
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
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registered = searchParams?.get('registered');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-4">
            <Image src="/spartan_logo.png" alt="BSU Logo" width={60} height={60} />
            <div>
              <h1 className="text-xl font-bold text-red-700">BATANGAS STATE UNIVERSITY</h1>
              <p className="text-sm text-gray-600">The National Engineering University</p>
            </div>
          </div>
        </div>
        <div className="bg-white py-6">
          <h2 className="text-center text-4xl font-extrabold text-gray-800 tracking-wider">STUDENT PORTAL</h2>
        </div>
        <div className="bg-blue-600">
          <p className="text-center text-white py-2 text-sm">Leading Innovations, Transforming Lives, Building the Nation</p>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-sm p-8 space-y-6">
          <div className="border bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Please Login</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {registered && (
                <p className="text-sm text-green-600">Registration successful! Please sign in.</p>
              )}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="sr-code"
                  name="srCode"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="22-34005"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="••••••••••••"
                />
              </div>

              <p className="text-xs text-gray-500">* Password is case sensitive</p>

              <div className="flex items-center justify-center p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="w-6 h-6 border border-gray-400 rounded-sm"></div>
                <span className="ml-3 text-sm text-gray-700">I&apos;m not a robot</span>
                <div className="ml-auto text-xs text-gray-400">
                  reCAPTCHA
                  <br/>
                  <a href="#" className="underline">Privacy</a> - <a href="#" className="underline">Terms</a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-4 text-black bg-yellow-400 hover:bg-yellow-500 rounded-md font-semibold text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>

              <div className="text-xs text-center pt-2 border-t mt-4">
                <Link href="#" className="text-green-600 hover:underline inline-flex items-center">
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Forgot password? Click here
                </Link>
                <span className="mx-2 text-gray-300">|</span>
                <Link href="#" className="text-green-600 hover:underline inline-flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  Contact Us
                </Link>
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
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
} 