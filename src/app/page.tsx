'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { status } = useSession();

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sustainable Bike Rental Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8">
              Promoting eco-friendly transportation for educational institutions
            </p>
            <div className="space-x-4">
              <Link
                href="/rent"
                className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors"
              >
                Rent a Bike
              </Link>
              {status === 'unauthenticated' && (
                <Link
                  href="/register"
                  className="bg-transparent border-2 border-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
                >
                  Register Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-500 text-4xl mb-4">🚲</div>
              <h3 className="text-xl font-semibold mb-2">Easy Bike Rental</h3>
              <p className="text-gray-600">
                Simple online booking system with real-time availability tracking
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-500 text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2">Environmental Impact</h3>
              <p className="text-gray-600">
                Track your carbon footprint savings and contribute to sustainability
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-500 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Smart Management</h3>
              <p className="text-gray-600">
                Real-time tracking, maintenance alerts, and automated rental system
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="font-semibold mb-2">Register</h3>
              <p className="text-gray-600">Create your account</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="font-semibold mb-2">Book</h3>
              <p className="text-gray-600">Select and book a bike</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="font-semibold mb-2">Ride</h3>
              <p className="text-gray-600">Pick up and enjoy your ride</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">4</span>
              </div>
              <h3 className="font-semibold mb-2">Return</h3>
              <p className="text-gray-600">Return the bike and track your impact</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 