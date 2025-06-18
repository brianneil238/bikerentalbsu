'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BikeStatus } from '@/types/index';

interface Bike {
  id: string;
  bikeNumber: string;
  status: BikeStatus;
  currentLocation: {
    lat: number;
    lng: number;
  } | null;
  model: string;
}

export default function RentPage() {
  const { data: session, status } = useSession();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRenting, setIsRenting] = useState(false);

  // Debug session
  console.log('🔍 Rent Page - Session status:', status);
  console.log('🔍 Rent Page - Session data:', session);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    
    // Let NextAuth middleware handle authentication redirects
    // Only fetch bikes if we're authenticated
    if (status === 'unauthenticated') {
      console.log('User not authenticated');
      return;
    }
    
    // If we have a session, fetch bikes
    if (status === 'authenticated' && session) {
      console.log('User authenticated, fetching bikes');
      fetchBikes();
    }
  }, [status, session]);

  const fetchBikes = async () => {
    try {
      setError(null);
      const response = await fetch('/api/bikes');
      
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP ${response.status}: Failed to fetch bikes`);
      }
      
      const data = await response.json();
      setBikes(data);
    } catch (err) {
      console.error('Fetch bikes error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bikes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRentBike = async (bikeId: string) => {
    if (isRenting) return;
    
    setIsRenting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bikeId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to rent bike`);
      }

      const rental = await response.json();
      
      // Success - redirect to active rental page
      window.location.href = '/rent/active';
    } catch (err) {
      console.error('Rent bike error:', err);
      setError(err instanceof Error ? err.message : 'Failed to rent bike. Please try again.');
    } finally {
      setIsRenting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          Please log in to rent a bike.
          <br />
          <a href="/login" className="text-green-600 hover:text-green-800">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-green-800">Rent a Bike</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bike List Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Available Bikes</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-24 bg-gray-100 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : bikes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bikes available at the moment.
            </div>
          ) : (
            <div className="space-y-4">
              {bikes.map((bike) => (
                <div
                  key={bike.id}
                  className="p-4 rounded-lg border border-green-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-green-800">Bike #{bike.bikeNumber}</h3>
                      <p className="text-sm text-gray-600">{bike.model}</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          bike.status === 'AVAILABLE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {bike.status}
                      </span>
                    </div>
                    {bike.status === 'AVAILABLE' && (
                      <button
                        onClick={() => handleRentBike(bike.id)}
                        disabled={isRenting}
                        className={`px-4 py-2 rounded-lg text-white font-medium ${
                          isRenting 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isRenting ? 'Renting...' : 'Rent'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-green-800">How to Rent</h2>
          <div className="space-y-3 text-gray-600">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
              <p>Choose an available bike from the list</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
              <p>Click the "Rent" button to start your rental</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
              <p>You'll be redirected to your active rental page</p>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
              <p>End your rental when you're done</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Account Info</h3>
            <p className="text-sm text-blue-700">
              Logged in as: {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 