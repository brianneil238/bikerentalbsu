'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { status } = useSession();

  return (
    <main className="flex min-h-screen flex-col bg-gray-100">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              University Bike Rental
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Promoting eco-friendly transportation for educational institutions
            </p>
            <div className="space-x-4">
              <Link
                href="/rent"
                className="bg-yellow-400 text-black px-8 py-3 rounded-md font-semibold hover:bg-yellow-500 transition-colors shadow-lg"
              >
                Rent a Bike
              </Link>
              {status === 'unauthenticated' && (
                <Link
                  href="/register"
                  className="bg-gray-200 text-gray-800 px-8 py-3 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                >
                  Register Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="text-blue-600 text-5xl mb-4">🚲</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Easy Bike Rental</h3>
              <p className="text-gray-600">
                Simple online booking system with real-time availability tracking.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="text-blue-600 text-5xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Environmental Impact</h3>
              <p className="text-gray-600">
                Track your carbon footprint savings and contribute to sustainability.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card p-8 text-center hover:shadow-xl transition-shadow">
              <div className="text-blue-600 text-5xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Smart Management</h3>
              <p className="text-gray-600">
                Real-time tracking, maintenance alerts, and automated rental system.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 