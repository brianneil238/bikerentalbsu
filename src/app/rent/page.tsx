'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { BikeStatus } from '@@/index';

// Dynamically import the map component to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />
  ),
});

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
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for application form
  const [fullName, setFullName] = useState('');
  const [srCode, setSrCode] = useState('');
  const [address, setAddress] = useState('');
  const [sex, setSex] = useState('');
  const [program, setProgram] = useState('');
  const [gwa, setGwa] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  useEffect(() => {
    fetchBikes();
    // Set up real-time updates
    const interval = setInterval(fetchBikes, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBikes = async () => {
    try {
      const response = await fetch('/api/bikes');
      if (!response.ok) throw new Error('Failed to fetch bikes');
      const data = await response.json();
      setBikes(data);
    } catch (err) {
      setError('Failed to load bikes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRentBike = async (bikeId: string) => {
    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bikeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Refresh bike list
      fetchBikes();
      // Redirect to active rental page
      window.location.href = '/rent/active';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rent bike');
    }
  };

  const handleGeneratePdf = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGeneratingPdf(true);
    setPdfUrl(null);
    setPdfError(null);

    console.log("Frontend Session Status:", status);
    console.log("Frontend Session Data:", session);

    try {
      const response = await fetch('/api/generate-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          srCode,
          address,
          sex,
          program,
          gwa,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      const data = await response.json();
      setPdfUrl(data.pdfUrl);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Rent a Bike</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Available Bikes</h2>
            <div className="h-[600px] rounded-lg overflow-hidden">
              <Map
                bikes={bikes}
                selectedBike={selectedBike}
                onBikeSelect={setSelectedBike}
              />
            </div>
          </div>
        </div>

        {/* Bike List Section */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Bike List</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-24 bg-gray-100 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {bikes.map((bike) => (
                <div
                  key={bike.id}
                  className={`p-4 rounded-lg border ${
                    selectedBike?.id === bike.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Bike #{bike.bikeNumber}</h3>
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
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Rent
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Form Section */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Bike Rental Application Form</h2>
        <p className="text-gray-600 mb-6">Please fill out the form below to generate your official application document.</p>

        {pdfError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            Error generating PDF: {pdfError}
          </div>
        )}

        {pdfUrl && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold mb-2">PDF generated successfully!</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline"
            >
              Download your application PDF
            </a>
          </div>
        )}

        <form onSubmit={handleGeneratePdf} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="fullName"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="srCode" className="block text-sm font-medium text-gray-700">SR Code</label>
            <input
              type="text"
              id="srCode"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={srCode}
              onChange={(e) => setSrCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              id="address"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
            <select
              id="sex"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              required
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="program" className="block text-sm font-medium text-gray-700">Program</label>
            <input
              type="text"
              id="program"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="gwa" className="block text-sm font-medium text-gray-700">GWA (General Weighted Average)</label>
            <input
              type="number"
              id="gwa"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              value={gwa}
              onChange={(e) => setGwa(e.target.value)}
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isGeneratingPdf}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isGeneratingPdf ? 'Generating PDF...' : 'Generate Application PDF'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 