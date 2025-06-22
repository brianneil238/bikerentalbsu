'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { formatDistanceToNow } from 'date-fns';
import { Bike } from '@/types/index';

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />
  ),
});

interface Rental {
  id: string;
  startTime: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  bike: Bike;
  distance: number | null;
  carbonSaved: number | null;
}

export default function ActiveRentalPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rental, setRental] = useState<Rental | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveRental = useCallback(async () => {
    try {
      const response = await fetch('/api/rentals');
      if (!response.ok) throw new Error('Failed to fetch rental');
      const rentals = await response.json();
      const activeRental = rentals.find((r: Rental) => r.status === 'ACTIVE');
      
      if (!activeRental) {
        router.push('/rent');
        return;
      }

      setRental(activeRental);
    } catch (err) {
      setError('Failed to load rental information');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchActiveRental();
    // Set up real-time updates
    const interval = setInterval(fetchActiveRental, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [fetchActiveRental]);

  const handleEndRental = async () => {
    if (!rental) return;

    try {
      const response = await fetch('/api/rentals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentalId: rental.id,
          action: 'end',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end rental');
      }

      router.push('/rent');
    } catch (err) {
      setError('Failed to end rental. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-[400px] bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!rental) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
          {/* Main Header with better contrast */}
          <div className="bg-green-700 text-white px-6 py-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Active Rental</h1>
              <button
                onClick={() => router.push('/rent')}
                className="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Rental Page</span>
              </button>
            </div>
          </div>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <strong>Error:</strong> {error}
          </div>
        )}

          <div className="bg-white rounded-b-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Rental Details Section */}
              <div className="p-6 border-r border-gray-200">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4">
                  <h2 className="text-xl font-bold">Rental Details</h2>
                </div>
                <dl className="space-y-4">
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Bike Number</dt>
                    <dd className="text-lg font-bold text-gray-900 mt-1">#{rental.bike.bikeNumber}</dd>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Model</dt>
                    <dd className="text-lg font-bold text-gray-900 mt-1">{rental.bike.model}</dd>
                </div>
                  <div className="border-b border-gray-100 pb-2">
                    <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Start Time</dt>
                    <dd className="text-lg font-bold text-gray-900 mt-1">
                    {formatDistanceToNow(new Date(rental.startTime), {
                      addSuffix: true,
                    })}
                  </dd>
                </div>
                {rental.distance && (
                    <div className="border-b border-gray-100 pb-2">
                      <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Distance</dt>
                      <dd className="text-lg font-bold text-green-600 mt-1">
                      {rental.distance.toFixed(2)} km
                    </dd>
                  </div>
                )}
                {rental.carbonSaved && (
                    <div className="border-b border-gray-100 pb-2">
                      <dt className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Carbon Saved</dt>
                      <dd className="text-lg font-bold text-green-600 mt-1">
                      {rental.carbonSaved.toFixed(2)} kg CO₂
                    </dd>
                  </div>
                )}
              </dl>
            </div>

              {/* Live Location Section */}
              <div className="p-6">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4">
                  <h2 className="text-xl font-bold">Live Location</h2>
                </div>
                <div className="h-[300px] rounded-lg overflow-hidden border-2 border-gray-200 shadow-inner">
                  {rental.bike.currentLocation ? (
                  <Map
                    bikes={[rental.bike]}
                    selectedBike={rental.bike}
                    onBikeSelect={() => {}}
                  />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="text-gray-500 text-lg font-semibold">Location Loading...</div>
                        <div className="text-gray-400 text-sm mt-2">Please wait while we track your bike</div>
                      </div>
                    </div>
                )}
                </div>
              </div>
            </div>

            {/* End Rental Button Section */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Status:</span> 
                  <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase">
                    Active
                  </span>
          </div>
            <button
              onClick={handleEndRental}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              End Rental
            </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 