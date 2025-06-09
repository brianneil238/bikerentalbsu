'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { formatDistanceToNow } from 'date-fns';
import { Rental, Bike } from '@/types';

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
  bike: {
    id: string;
    bikeNumber: string;
    model: string;
    currentLocation: {
      lat: number;
      lng: number;
    } | null;
  };
  distance: number | null;
  carbonSaved: number | null;
}

export default function ActiveRentalPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rental, setRental] = useState<Rental | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActiveRental();
    // Set up real-time updates
    const interval = setInterval(fetchActiveRental, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActiveRental = async () => {
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
  };

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

      router.push('/dashboard');
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Active Rental</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Rental Details</h2>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm text-gray-600">Bike Number</dt>
                  <dd className="font-medium">#{rental.bike.bikeNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Model</dt>
                  <dd className="font-medium">{rental.bike.model}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Start Time</dt>
                  <dd className="font-medium">
                    {formatDistanceToNow(new Date(rental.startTime), {
                      addSuffix: true,
                    })}
                  </dd>
                </div>
                {rental.distance && (
                  <div>
                    <dt className="text-sm text-gray-600">Distance</dt>
                    <dd className="font-medium">
                      {rental.distance.toFixed(2)} km
                    </dd>
                  </div>
                )}
                {rental.carbonSaved && (
                  <div>
                    <dt className="text-sm text-gray-600">Carbon Saved</dt>
                    <dd className="font-medium">
                      {rental.carbonSaved.toFixed(2)} kg CO₂
                    </dd>
                  </div>
                )}
              </dl>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Live Location</h2>
              <div className="h-[300px] rounded-lg overflow-hidden">
                {rental.bike.currentLocation && (
                  <Map
                    bikes={[{
                      ...rental.bike,
                      status: 'ACTIVE'
                    }]}
                    selectedBike={rental.bike}
                    onBikeSelect={() => {}}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleEndRental}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              End Rental
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 