'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { status } = useSession();

  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
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
                className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors shadow-lg"
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
      <section className="py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-green-800">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="text-green-600 text-4xl mb-4">🚲</div>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Easy Bike Rental</h3>
              <p className="text-gray-600">
                Simple online booking system with real-time availability tracking
              </p>
            </div>
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="text-green-600 text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Environmental Impact</h3>
              <p className="text-gray-600">
                Track your carbon footprint savings and contribute to sustainability
              </p>
            </div>
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="text-green-600 text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2 text-green-800">Smart Management</h3>
              <p className="text-gray-600">
                Real-time tracking, maintenance alerts, and automated rental system
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 