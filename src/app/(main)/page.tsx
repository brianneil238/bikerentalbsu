import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Leaf, Wallet, MapPin } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ backgroundColor: '#f7f7f7' }}>
      {/* Hero Section */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen py-10 w-full"
        style={{
          backgroundImage: "url('/bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Logo and University Name */}
          <div className="flex flex-col items-center mb-6">
            <Image src="/logo.png" alt="Sparta Logo" width={60} height={60} priority unoptimized />
            <h1 className="text-2xl font-bold text-red-700 mt-2 drop-shadow">SPARTA</h1>
            <span className="text-base text-gray-100 tracking-wide drop-shadow">BATANGAS STATE UNIVERSITY - TNEU</span>
          </div>
          {/* App Name and Subtitle */}
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">University Bike Rental</h2>
            <p className="text-lg md:text-xl text-gray-200 mb-6 drop-shadow">Sustainable, affordable, and fun bike rentals for Batangas State University - TNEU.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link href="/rent">
                <span className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow transition">Get Started</span>
              </Link>
            </div>
          </div>
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-5xl">
            <div className="bg-white bg-opacity-90 rounded-lg shadow p-6 flex flex-col items-center">
              <Leaf className="w-14 h-14 text-green-600 mb-3" />
              <h3 className="text-xl font-bold text-green-700 mb-2">Eco-Friendly</h3>
              <p className="text-gray-600 text-center">Reduce your carbon footprint and help keep our campus green by choosing bikes over cars.</p>
            </div>
            <div className="bg-white bg-opacity-90 rounded-lg shadow p-6 flex flex-col items-center">
              <Wallet className="w-14 h-14 text-blue-600 mb-3" />
              <h3 className="text-xl font-bold text-blue-700 mb-2">Affordable</h3>
              <p className="text-gray-600 text-center">Enjoy low-cost rentals designed for students and staff. No hidden fees, just easy rides.</p>
            </div>
            <div className="bg-white bg-opacity-90 rounded-lg shadow p-6 flex flex-col items-center">
              <MapPin className="w-14 h-14 text-yellow-500 mb-3" />
              <h3 className="text-xl font-bold text-yellow-600 mb-2">Convenient</h3>
              <p className="text-gray-600 text-center">Pick up and return bikes at multiple campus locations. Fast, simple, and always available.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mb-10">
        <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">How It Works</h2>
        <ol className="list-decimal list-inside space-y-3 text-lg text-gray-700">
          <li>Sign up or log in with your university account.</li>
          <li>Submit a rental application and wait for approval.</li>
          <li>Once approved, choose an available bike and start riding!</li>
          <li>Return the bike to any campus station when you&apos;re done.</li>
        </ol>
      </section>

      {/* Contact/Support */}
      <div className="text-center text-gray-500 text-sm pb-8">
        Need help? Email <a href="mailto:support@sparta-bikes.com" className="text-blue-600 underline">support@sparta-bikes.com</a>
      </div>
    </div>
  );
} 