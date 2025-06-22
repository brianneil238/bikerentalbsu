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
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
          {/* Main Header */}
          <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Active Rental</h1>
              <button
                onClick={() => router.push('/rent')}
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Rentals</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md m-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Rental Details Section */}
            <div className="p-6 border-r border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Rental Details</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Bike Number</dt>
                  <dd className="text-lg font-semibold text-gray-900">#{rental.bike.bikeNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Model</dt>
                  <dd className="text-lg font-semibold text-gray-900">{rental.bike.model}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Rental Duration</dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {formatDistanceToNow(new Date(rental.startTime), { addSuffix: true })}
                  </dd>
                </div>
                {rental.distance && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Distance</dt>
                    <dd className="text-lg font-semibold text-blue-600">
                      {rental.distance.toFixed(2)} km
                    </dd>
                  </div>
                )}
                {rental.carbonSaved && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Carbon Saved</dt>
                    <dd className="text-lg font-semibold text-blue-600">
                      {rental.carbonSaved.toFixed(2)} kg CO₂
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Live Location Section */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Live Location</h2>
              <div className="h-[300px] rounded-lg overflow-hidden border-2 border-gray-200 shadow-inner">
                {rental.bike.currentLocation ? (
                  <Map
                    bikes={[rental.bike]}
                    selectedBike={rental.bike}
                    onBikeSelect={() => {}}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center text-gray-500">
                      Location data is currently unavailable.
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
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase">
                  Active
                </span>
              </div>
              <button
                onClick={handleEndRental}
                className="bg-red-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-red-700 transition-colors"
              >
                End Rental
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 